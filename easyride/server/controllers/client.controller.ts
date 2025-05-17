import { Request, Response } from "express";
import pool from "../lib/db.js";
import bcrypt from "bcrypt";

import { generatePresignedUrl, deleteFileFromS3, extractKeyFromUrl }  from "../lib/s3Config.ts";

export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query("SELECT * FROM clients");
    res.status(200).json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         client_id,
         client_p_i_b,
         client_phone_number,
         client_email,
         client_provider,
         client_google_id,
         client_avatar_url
       FROM clients 
       WHERE client_id = $1`, 
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Клієнта не знайдено" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, email, password, provider, googleId, avatarUrl } = req.body;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  try {
    const result = await pool.query(
      `INSERT INTO clients (
        client_p_i_b,
        client_phone_number,
        client_email,
        client_pwd,
        client_provider,
        client_google_id,
        client_avatar_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING client_id, client_email, client_avatar_url`,
      [name, phone, email, hashedPassword, provider, googleId || null, avatarUrl || null]
    );

    res.status(201).json(result.rows[0]);
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


export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, phone, email, password, provider, googleId, avatarUrl, oldAvatarKey } = req.body;

  try {
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Удаляем старую аватарку из S3, если есть
    if (oldAvatarKey) {
      try {
        await deleteFileFromS3(oldAvatarKey);
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError);
      }
    }

    // Обновляем данные клиента
    const result = await pool.query(
      `UPDATE clients 
       SET client_p_i_b = $1, client_phone_number = $2, client_email = $3, 
           client_pwd = $4, client_provider = $5, client_google_id = $6,
           client_avatar_url = $7
       WHERE client_id = $8 
       RETURNING client_id, client_email, client_avatar_url`,
      [
        name,
        phone,
        email,
        hashedPassword || null,
        provider,
        googleId || null,
        avatarUrl || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Client not found" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err: any) {
    console.error("Error updating client:", err);
    res.status(500).json({ error: err.message });
  }
};

export const patchClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    name,
    phone,
    email,
    password,
    provider,
    googleId,
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

    // Добавляем обновляемые поля динамически
    if (name !== undefined) {
      fields.push(`client_p_i_b = $${index++}`);
      values.push(name);
    }

    if (phone !== undefined) {
      fields.push(`client_phone_number = $${index++}`);
      values.push(phone);
    }

    if (email !== undefined) {
      fields.push(`client_email = $${index++}`);
      values.push(email);
    }

    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 12);
      fields.push(`client_pwd = $${index++}`);
      values.push(hashedPassword);
    }

    if (provider !== undefined) {
      fields.push(`client_provider = $${index++}`);
      values.push(provider);
    }

    if (googleId !== undefined) {
      fields.push(`client_google_id = $${index++}`);
      values.push(googleId);
    }

    if (avatarUrl !== undefined) {
      fields.push(`client_avatar_url = $${index++}`);
      values.push(avatarUrl);
    }

    if (fields.length === 0) {
      res.status(400).json({ error: "Немає даних для оновлення" });
      return;
    }

    values.push(id); // Последний аргумент — client_id

    const result = await pool.query(
      `UPDATE clients 
       SET ${fields.join(', ')} 
       WHERE client_id = $${index}
       RETURNING client_id, client_email, client_avatar_url`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Клієнт не знайдений" });
    } else {
      res.status(200).json(result.rows[0]);
    }

  } catch (err: any) {
    console.error("Error in patchClient:", err);
    res.status(500).json({ error: err.message });
  }
};


export const deleteClientAvatar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // 1. Получаем URL аватарки из базы данных
    const getResult = await pool.query(
      `SELECT client_avatar_url FROM clients WHERE client_id = $1`,
      [id]
    );

    if (getResult.rows.length === 0 || !getResult.rows[0].client_avatar_url) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    const avatarUrl = getResult.rows[0].client_avatar_url;
    const key = extractKeyFromUrl(avatarUrl);

    if (key) {
      // 2. Удаляем файл из S3
      try {
        await deleteFileFromS3(key);
      } catch (s3Error) {
        console.error("Error deleting file from S3:", s3Error);
      }
    }

    // 3. Обновляем запись в базе данных
    await pool.query(
      `UPDATE clients SET client_avatar_url = NULL WHERE client_id = $1`,
      [id]
    );

    res.status(200).json({ 
      message: "Avatar deleted successfully",
      deletedAvatarUrl: avatarUrl
    });
  } catch (err: any) {
    console.error("Error in deleteClientAvatar:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersByClientId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { clientId } = req.params;

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
       WHERE o.order_client_id = $1`,
      [clientId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: "Поїздок для клієнта не знайдено" });
    } else {
      res.status(200).json(result.rows);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};