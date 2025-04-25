// controllers/auth.controller.ts
import { Request, Response } from "express";
import pool from "../lib/db.js";
import bcrypt from "bcrypt";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { provider, email, password, googleId, name, picture } = req.body;

  try {
    if (provider === "local") {
      // Сначала ищем в таблице clients
      let result = await pool.query(`SELECT * FROM clients WHERE client_email = $1`, [email]);
      let role: "client" | "driver" = "client";

      // Если не нашли в clients, ищем в таблице drivers
      if (result.rows.length === 0) {
        result = await pool.query(`SELECT * FROM drivers WHERE driver_email = $1`, [email]);
        role = "driver";

        if (result.rows.length === 0) {
          res.status(404).json({ message: "Користувача не знайдено" });
          return;
        }
      }

      const user = result.rows[0];
      const passwordHash = role === "client" ? user.client_pwd : user.driver_pwd;
      const userName = role === "client" ? user.client_p_i_b : user.driver_p_i_b;

      const isMatch = await bcrypt.compare(password, passwordHash);
      if (!isMatch) {
        res.status(401).json({ message: "Невірний пароль" });
        return;
      }

      req.login(user, (err) => {
        if (err) {
          res.status(500).json({ error: "Помилка сесії" });
        } else {
          req.session.user = {
            googleId: role === "client" ? user.client_google_id : user.driver_google_id,
            email: role === "client" ? user.client_email : user.driver_email,
            name: userName,
            picture: picture || "",
            needsRegistration: false,
            role: role, // Добавляем роль пользователя
          };

          req.session.save((err) => {
            if (err) {
              console.error("Помилка збереження сесії:", err);
              res.status(500).json({ error: "Помилка збереження сесії" });
            } else {
              res.status(200).json({
                authenticated: true,
                id: role === "client" ? user.client_id : user.driver_id,
                email: role === "client" ? user.client_email : user.driver_email,
                name: userName,
                provider: role === "client" ? user.client_provider : user.driver_provider,
                role: role, // Возвращаем роль в ответе
              });
            }
          });
        }
      });
    } else if (provider === "google") {
      // Сначала ищем в таблице clients по googleId
      let result = await pool.query(
        `SELECT * FROM clients WHERE client_google_id = $1 AND client_provider = 'google'`,
        [googleId]
      );
      let role: "client" | "driver" = "client";

      // Если не нашли в clients, ищем в таблице drivers
      if (result.rows.length === 0) {
        result = await pool.query(
          `SELECT * FROM drivers WHERE driver_google_id = $1 AND driver_provider = 'google'`,
          [googleId]
        );
        role = "driver";

        if (result.rows.length === 0) {
          // Сохраняем в сессию, что пользователь должен пройти регистрацию
          req.session.user = {
            googleId,
            email,
            name,
            picture: picture || "",
            needsRegistration: true,
            role: role, // Устанавливаем роль как driver для Google
          };

          req.session.save((err) => {
            if (err) {
              res.status(500).json({ error: "Помилка сесії" });
            } else {
              res.status(200).json({ needsRegistration: true });
            }
          });
          return;
        }
      }

      const user = result.rows[0];

      req.session.user = {
        googleId: role === "client" ? user.client_google_id : user.driver_google_id,
        email: role === "client" ? user.client_email : user.driver_email,
        name: role === "client" ? user.client_p_i_b : user.driver_p_i_b,
        picture: picture || "",
        needsRegistration: false,
        role: role, // Устанавливаем роль в сессии
      };

      res.status(200).json({
        authenticated: true,
        id: role === "client" ? user.client_id : user.driver_id,
        email: role === "client" ? user.client_email : user.driver_email,
        name: role === "client" ? user.client_p_i_b : user.driver_p_i_b,
        provider: role === "client" ? user.client_provider : user.driver_provider,
        role: role, // Возвращаем роль в ответе
      });
    } else {
      res.status(400).json({ error: "Невідомий тип провайдера" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export const logout = (req: Request, res: Response): void => {
  req.logout((err) => {
    if (err) {
      res.status(500).send("Ошибка выхода");
      return;
    }

    req.session.destroy((err) => {
      if (err) {
        res.status(500).send("Ошибка уничтожения сессии");
        return;
      }

      res.clearCookie("connect.sid");
      res.sendStatus(200);
    });
  });
};


export const checkAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.session.user) {
      console.warn("Пользователь не найден в сессии");
      res.status(401).json({
        authenticated: false,
        message: "Пользователь не найден в сессии",
      });
      return;
    }

    const user = req.session.user;

    // Сначала проверяем в clients
    let result = await pool.query(
      "SELECT client_id AS id, client_email AS email, 'client' AS role FROM clients WHERE client_email = $1",
      [user.email]
    );

    // Если не найдено — проверяем в drivers
    if (result.rowCount === 0) {
      result = await pool.query(
        "SELECT driver_id AS id, driver_email AS email, 'driver' AS role FROM drivers WHERE driver_email = $1",
        [user.email]
      );

      if (result.rowCount === 0) {
        console.warn("Пользователь не найден в базе данных ни как клиент, ни как водитель");
        res.status(404).json({
          authenticated: false,
          message: "Пользователь не найден в базе данных",
        });
        return;
      }
    }

    const { id, role } = result.rows[0];
    console.log(id,role);

    res.json({
      authenticated: true,
      userId: id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role, // client или driver
    });
  } catch (error) {
    console.error("Ошибка при проверке авторизации:", error);
    res.status(500).json({
      authenticated: false,
      message: "Ошибка сервера",
    });
  }
};

