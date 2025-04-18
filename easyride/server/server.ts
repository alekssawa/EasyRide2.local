import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";

// import registerRouter from "./routes/client.ts";

import testRouter from './routes/test-router.ts';

import clientsRoutes from './routes/clientsRoutes.ts';


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

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// app.use("/api/register", registerRouter);

// app.use("/api/regs", testRouter);

app.use('/api', clientsRoutes); 


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
