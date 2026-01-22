const mysql = require('mysql2');
require('dotenv').config();

// สร้างการเชื่อมต่อกับฐานข้อมูลแบบ Pool
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

console.log('สร้าง Connection Pool สำเร็จ');

// ส่งออกการเชื่อมต่อเพื่อใช้ในไฟล์อื่น
module.exports = connection;
