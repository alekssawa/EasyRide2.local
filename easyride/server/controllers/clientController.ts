import { Request, Response } from 'express';
import pool from '../lib/db.js';

import bcrypt from 'bcrypt';

export const getClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM clients');
    res.status(200).json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const checkClient = async (req: Request, res: Response): Promise<void> => {
  const { provider, email, password, googleId } = req.body;

  try {
    if (provider === "local") {
      const result = await pool.query(
        `SELECT * FROM clients WHERE client_email = $1 AND client_provider = 'local'`,
        [email]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ message: "Клієнта не знайдено" });
        return;
      }

      const client = result.rows[0];
      const isMatch = await bcrypt.compare(password, client.client_pwd);

      if (!isMatch) {
        res.status(401).json({ message: "Невірний пароль" });
        return;
      }

      // Устанавливаем сессию (автоматическая сериализация)
      req.login(client, (err) => {
        if (err) {
          res.status(500).json({ error: "Помилка сесії" });
        } else {
          res.status(200).json({
            authenticated: true,
            client_id: client.client_id,
            email: client.client_email,
            name: client.client_p_i_b,
            provider: client.client_provider,
          });
        }
      });

    } else if (provider === "google") {
      const result = await pool.query(
        `SELECT * FROM clients WHERE client_google_id = $1 AND client_provider = 'google'`,
        [googleId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ message: "Клієнта не знайдено" });
      } else {
        res.status(200).json(result.rows[0]);
      }
    } else {
      res.status(400).json({ error: "Невідомий тип провайдера" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
    const { name, phone, email, password, provider, googleId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
  try {
    console.log("User post for back:", { googleId, email, name, password, provider});
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
      [name, phone, email, hashedPassword || null, provider, googleId || null]
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
      // Хешируем пароль, если он был передан
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
          hashedPassword || null, // если пароль не передан, не обновляем его
          provider,
          googleId || null,
          id
        ]
      );
  
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Client not found' });
      } else {
        res.status(200).json(result.rows[0]);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
