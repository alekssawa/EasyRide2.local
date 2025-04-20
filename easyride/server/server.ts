import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import sessionMiddleware from "./lib/sessionConfig.ts"; // импортируем сессию
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";


import clientsRoutes from './routes/clients.routes.ts';
import orderRoutes from './routes/order.routes.ts';



import pool from "./lib/db.js"; // ← если ESM

dotenv.config();

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(sessionMiddleware);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());


app.use('/api', clientsRoutes); 
app.use('/api/order', orderRoutes);


passport.serializeUser(
  (user: Express.User, done: (err: any, id?: unknown) => void) => {
    done(null, user);
  }
);

passport.deserializeUser(
  (
    user: Express.User,
    done: (err: any, user?: Express.User | false | null) => void
  ) => {
    done(null, user);
  }
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:5000/auth",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0].value;
      const name = profile.displayName;
      const picture = profile.photos?.[0].value;

      let needsRegistration = false;

      try {
        const dbRes = await pool.query(
          "SELECT * FROM clients WHERE client_email = $1",
          [email]
        );

        if (dbRes.rows.length === 0) {
          needsRegistration = true;
        }
      } catch (err) {
        console.error("Ошибка при проверке пользователя в БД:", err);
      }

      const user = {
        googleId: profile.id,
        email,
        name,
        picture,
        needsRegistration,
      };

      return done(null, user);
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// 2. Обрабатывает callback от Google
app.get(
  "/auth",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    const user = req.user as {
      googleId: string;
      email: string;
      name: string;
      picture: string;
      needsRegistration: boolean;
    };

    req.session.user = user;

    res.redirect(
      `http://localhost:5173/auth-success?${new URLSearchParams({
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        needsRegistration: user.needsRegistration ? "true" : "false",
      })}`
    );
  }
);

// Выход из сессии
app.post("/api/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Ошибка выхода");
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Ошибка уничтожения сессии");
      }

      res.clearCookie("connect.sid"); // или другой, если ты менял имя куки
      res.sendStatus(200);
    });
  });
});

// Проверка авторизации

app.get("/api/user", (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      console.warn("Пользователь не найден в сессии");
      res.status(401).json({
        authenticated: false,
        message: "Пользователь не найден в сессии",
      });
      return; // Завершаем выполнение функции после отправки ответа
    }

    const user = req.session.user;

    // Отправка ответа, если пользователь найден
    res.json({
      authenticated: true,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
    return; // Завершаем выполнение функции после отправки ответа

  } catch (error) {
    console.error("Ошибка при проверке авторизации:", error);
    res.status(500).json({ authenticated: false, message: "Ошибка сервера" });
    return; // Завершаем выполнение функции после отправки ответа
  }
});


app.get("/api/db-users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM clients");
    res.json(result.rows);
  } catch (error) {
    console.error("Ошибка получения пользователей из БД", error);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log("Server started on", { PORT });
});
