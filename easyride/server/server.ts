import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { Request, Response } from "express";

import pool from "./lib/db.js"; // ← если ESM

dotenv.config();

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

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
    (accessToken, refreshToken, profile, done) => {
      // Явно укажем, что хотим сохранить
      const user = {
        googleId: profile.id,
        email: profile.emails?.[0].value,
        name: profile.displayName,
        picture: profile.photos?.[0].value,
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
  "/auth", // ← тоже меняем на /auth
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    const email = (req.user as Profile).emails?.[0].value;
    res.redirect(`http://localhost:5173/auth-success?email=${email}`);
  }
);

// Выход из сессии
app.post("/api/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) return res.status(500).send("Ошибка выхода");
    res.sendStatus(200);
  });
});

// Проверка авторизации
app.get("/api/user", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const user = req.user as {
      googleId: string;
      email: string;
      name: string;
      picture: string;
    };

    res.json({
      authenticated: true,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
    });
  } else {
    res.json({ authenticated: false });
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
  console.log("Server start", { PORT });
});
