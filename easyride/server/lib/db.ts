import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Конфигурация пула соединений
const pool = new Pool({
  host: DB_HOST,
  port: parseInt(DB_PORT || '5432'),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  max: 20, // максимальное количество клиентов в пуле
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Тестовое подключение при старте
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Подключение к PostgreSQL установлено'))
  .catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err));

export default pool;