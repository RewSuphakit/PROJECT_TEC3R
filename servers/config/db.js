const mysql = require('mysql2');
require('dotenv').config();

// สร้างการเชื่อมต่อกับฐานข้อมูล
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// เชื่อมต่อกับฐานข้อมูล
connection.connect((err) => {
  if (err) {
    console.error('การเชื่อมต่อล้มเหลว:', err);
    return;
  }
  console.log('เชื่อมต่อกับฐานข้อมูลสำเร็จ');
});

// ส่งออกการเชื่อมต่อเพื่อใช้ในไฟล์อื่น
module.exports = connection;
