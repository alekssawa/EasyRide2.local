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

// export const createClient = async (req: Request, res: Response): Promise<void> => {
//   const { name, phone, email, password, provider, googleId } = req.body;
//   const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

//   try {
//     const result = await pool.query(
//       `INSERT INTO clients (
//         client_p_i_b,
//         client_phone_number,
//         client_email,
//         client_pwd,
//         client_provider,
//         client_google_id
//       ) VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING client_id, client_email`,
//       [name, phone, email, hashedPassword, provider, googleId || null]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// };

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
