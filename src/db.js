import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise(); 

pool
  .getConnection()
  .then(conn => {
    console.log('🟢 Conectado a MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar a MySQL:', err.message);
  });

export default pool;