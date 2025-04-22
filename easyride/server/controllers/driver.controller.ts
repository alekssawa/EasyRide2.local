import { Request, Response } from "express";
import pool from "../lib/db.js";
import bcrypt from "bcrypt";

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
         t.tariff_name
       FROM drivers d
       LEFT JOIN cars c ON c.car_id = d.driver_car_id
       LEFT JOIN tariffs t ON c.car_tariff_id = t.tariff_id
       WHERE d.driver_id = $1`,
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
         order_id,
         order_payment_id,
         order_driver_id,
         order_tariff_id,
         order_order_time,
         order_client_start_location,
         order_client_destination,
         order_payment_type,
         order_order_status,
         order_distance
       FROM orders
       WHERE order_driver_id = $1`,
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
