import { Request, Response } from "express";
import pool from "../lib/db.js";
import bcrypt from "bcrypt";

import { generatePresignedUrl, deleteFileFromS3, extractKeyFromUrl }  from "../lib/s3Config.ts";

export const getDrivers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query("SELECT * FROM drivers");
    res.status(200).json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getDriverById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         d.*, 
         c.car_model, 
         c.car_registration_plate, 
         c.car_model_year, 
         t.tariff_name,
         COALESCE(ROUND(AVG(r.review_rating)::numeric, 1), 0) AS average_rating
       FROM drivers d
       LEFT JOIN cars c ON c.car_id = d.driver_car_id
       LEFT JOIN tariffs t ON c.car_tariff_id = t.tariff_id
       LEFT JOIN reviews_drivers r ON r.review_driver_id = d.driver_id
       WHERE d.driver_id = $1
       GROUP BY d.driver_id, c.car_model, c.car_registration_plate, c.car_model_year, t.tariff_name`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Водія не знайдено" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDriver = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, phone, email, password, provider, googleId } = req.body;

  try {
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const result = await pool.query(
      `UPDATE drivers 
       SET driver_p_i_b = $1, driver_phone_number = $2, driver_email = $3, 
           driver_pwd = $4, driver_provider = $5, driver_google_id = $6 
       WHERE driver_id = $7 
       RETURNING driver_id, driver_email`,
      [
        name,
        phone,
        email,
        hashedPassword || null,
        provider,
        googleId || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Driver not found" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAvatarUploadUrl = async (req: Request, res: Response) => {
  const { filename, contentType } = req.query;
  
  if (!filename || !contentType) {
    res.status(400).json({ error: 'Filename and content type are required' });
    return 
  }

  try {
    const { url, key, publicUrl } = await generatePresignedUrl({
      name: filename as string,
      type: contentType as string
    });

    res.json({ presignedUrl: url, key, publicUrl });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};

export const patchDriver = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    name,
    passportPhoto,
    technicalPassport,
    license,
    insurance,
    homeAddress,
    phone,
    email,
    password,
    carId,
    avatarUrl,
    oldAvatarKey,
  } = req.body;

  try {
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    // Удалить старый аватар из S3, если передан oldAvatarKey
    if (oldAvatarKey) {
      try {
        await deleteFileFromS3(oldAvatarKey);
      } catch (deleteError) {
        console.error("Error deleting old avatar:", deleteError);
      }
    }

    // Динамически формируем поля для обновления

    if (name !== undefined) {
      fields.push(`driver_p_i_b = $${index++}`);
      values.push(name);
    }

    if (passportPhoto !== undefined) {
      fields.push(`driver_passport_photo = $${index++}`);
      values.push(passportPhoto);
    }

    if (technicalPassport !== undefined) {
      fields.push(`driver_technical_passport = $${index++}`);
      values.push(technicalPassport);
    }

    if (license !== undefined) {
      fields.push(`driver_license = $${index++}`);
      values.push(license);
    }

    if (insurance !== undefined) {
      fields.push(`driver_insurance = $${index++}`);
      values.push(insurance);
    }

    if (homeAddress !== undefined) {
      fields.push(`driver_home_address = $${index++}`);
      values.push(homeAddress);
    }

    if (phone !== undefined) {
      fields.push(`driver_phone_number = $${index++}`);
      values.push(phone);
    }

    if (email !== undefined) {
      fields.push(`driver_email = $${index++}`);
      values.push(email);
    }

    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 12);
      fields.push(`driver_pwd = $${index++}`);
      values.push(hashedPassword);
    }

    if (carId !== undefined) {
      fields.push(`driver_car_id = $${index++}`);
      values.push(carId);
    }

    if (avatarUrl !== undefined) {
      fields.push(`driver_avatar_url = $${index++}`);
      values.push(avatarUrl);
    }

    if (fields.length === 0) {
      res.status(400).json({ error: "Немає даних для оновлення" });
      return;
    }

    values.push(id); // Последний параметр — driver_id

    const result = await pool.query(
      `UPDATE drivers
       SET ${fields.join(', ')}
       WHERE driver_id = $${index}
       RETURNING driver_id, driver_email, driver_avatar_url`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Водій не знайдений" });
    } else {
      res.status(200).json(result.rows[0]);
    }

  } catch (err: any) {
    console.error("Error in patchDriver:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteDriverAvatar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // 1. Получаем URL аватарки из базы данных
    const getResult = await pool.query(
      `SELECT driver_avatar_url FROM drivers WHERE driver_id = $1`,
      [id]
    );

    if (getResult.rows.length === 0 || !getResult.rows[0].driver_avatar_url) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    const avatarUrl = getResult.rows[0].driver_avatar_url;
    const key = extractKeyFromUrl(avatarUrl);

    if (key) {
      // 2. Удаляем файл из S3
      try {
        await deleteFileFromS3(key);
      } catch (s3Error) {
        console.error("Error deleting file from S3:", s3Error);
      }
    }

    // 3. Обновляем запись в базе данных — убираем ссылку на аватар
    await pool.query(
      `UPDATE drivers SET driver_avatar_url = NULL WHERE driver_id = $1`,
      [id]
    );

    res.status(200).json({ 
      message: "Avatar deleted successfully",
      deletedAvatarUrl: avatarUrl
    });
  } catch (err: any) {
    console.error("Error in deleteDriverAvatar:", err);
    res.status(500).json({ error: err.message });
  }
};


export const getOrdersByDriverId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { driverId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         o.order_id,
         o.order_payment_id,
         o.order_driver_id,
         o.order_tariff_id,
         o.order_order_time,
         o.order_client_start_location,
         o.order_client_destination,
         p.payment_type,
         o.order_order_status,
         o.order_distance
       FROM orders o
       JOIN payments p ON o.order_payment_id = p.payment_id
       WHERE o.order_driver_id = $1`,
      [driverId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Поїздок для водiя не знайдено" });
    } else {
      res.status(200).json(result.rows);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
