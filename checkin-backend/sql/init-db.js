/**
 * Inicializa la base de datos ejecutando schema.sql
 * Uso: npm run db:init
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
  const connection = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('📦 Connected to MySQL');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await connection.query(schema);

  console.log('✅ Database checkin_db created and seeded successfully');

  // Generar hashes reales de bcrypt para la password "1234"
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash('1234', 10);
  
  await connection.query(`USE checkin_db`);
  await connection.query(`UPDATE users SET password = ?`, [hash]);
  
  console.log('🔑 Passwords updated with proper bcrypt hash');

  await connection.end();
  process.exit(0);
}

initDB().catch((err) => {
  console.error('❌ Error initializing database:', err.message);
  process.exit(1);
});