import { Request, Response } from "express";
import pool from "../lib/db.js";
import bcrypt from "bcrypt";

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
    const result = await pool.query(`SELECT * FROM clients WHERE client_id = $1`, [id]);

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
  const { name, phone, email, password, provider, googleId } = req.body;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  try {
    const result = await pool.query(
      `INSERT INTO clients (
        client_p_i_b,
        client_phone_number,
        client_email,
        client_pwd,
        client_provider,
        client_google_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING client_id, client_email`,
      [name, phone, email, hashedPassword, provider, googleId || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, phone, email, password, provider, googleId } = req.body;

  try {
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const result = await pool.query(
      `UPDATE clients 
       SET client_p_i_b = $1, client_phone_number = $2, client_email = $3, 
           client_pwd = $4, client_provider = $5, client_google_id = $6 
       WHERE client_id = $7 
       RETURNING client_id, client_email`,
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
      res.status(404).json({ error: "Client not found" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (err: any) {
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
       WHERE order_client_id = $1`,
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
