const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     process.env.DB_PORT || 3306,
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Movistar04',
  database: process.env.DB_NAME || 'checkin_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Devolver filas como objetos JS normales
  namedPlaceholders: true,
});

module.exports = pool;