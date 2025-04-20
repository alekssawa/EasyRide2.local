// sessionConfig.ts
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pool from "./db.js"; // используем твое подключение

const PgSession = connectPgSimple(session);

const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true, 
    pruneSessionInterval: 15 * 60 * 1000,
  }),
  secret: (process.env.SESSION_SECRET ?? "default_session_secret") as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 12,
  },
});

export default sessionMiddleware;
