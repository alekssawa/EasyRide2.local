import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Проверка наличия переменных окружения
if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  throw new Error("Не все переменные окружения заданы");
}

const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

// Пример теста подключения
pool.connect()
  .then(() => console.log("Подключение к базе данных установлено"))
  .catch((error) => console.error("Ошибка подключения к базе данных", error));

export default pool;
