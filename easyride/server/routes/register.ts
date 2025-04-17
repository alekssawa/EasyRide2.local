import { Router, Request, Response } from 'express';  // Импортируем правильные типы
import bcrypt from "bcrypt";
import db from "../lib/db.ts";

const registerRouter = Router();

registerRouter.post("/", async (req: Request, res: Response): Promise<Response> => {
  try {
    // Логируем входные данные
    console.log('Request body:', req.body);

    const { name, phone, email, password, provider = "local", googleId } = req.body;

    // Проверка на обязательные поля
    if (!name || !phone || !email || !password) {
      console.error('Missing required fields:', { name, phone, email, password });
      return res.status(400).json({ message: "Всі поля обов’язкові." });
    }

    // Хэширование пароля
    let hashedPassword: string;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');
    } catch (error: any) {
      console.error('Error hashing password:', error);
      return res.status(500).json({ message: "Не вдалося зашифрувати пароль." });
    }

    // Логируем параметры перед запросом к базе данных
    console.log('Inserting into database with params:', [name, phone, email, hashedPassword, provider, googleId || null]);

    // Запрос в базу данных
    let result;
    try {
      result = await db.query(
        `INSERT INTO clients (client_p_i_b, client_phone_number, client_email, client_pwd, client_provider, client_google_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING client_id, client_email`,
        [name, phone, email, hashedPassword, provider, googleId || null]
      );
      console.log('Database insert successful:', result.rows[0]);
    } catch (error: any) {
      console.error('Database query error:', error.message);
      if (error.code === "23505") {  // Код ошибки для уникальности
        return res.status(409).json({ message: "Користувач з такою поштою вже існує" });
      } else {
        return res.status(500).json({ message: "Внутрішня помилка сервера" });
      }
    }

    // Возвращение успешного ответа
    return res.status(201).json({ message: "Реєстрація успішна", user: result.rows[0] });

  } catch (error: any) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({ message: "Внутрішня помилка сервера" });
  }
});

export default registerRouter;
