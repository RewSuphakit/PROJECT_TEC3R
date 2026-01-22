const mysql = require('mysql2');
require('dotenv').config();

// สร้าง Connection Pool แทนการเชื่อมต่อเดี่ยว
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // จำนวน connection สูงสุดใน pool
  maxIdle: 10, // จำนวน idle connections สูงสุด
  idleTimeout: 60000, // timeout สำหรับ idle connections (60 วินาที)
  queueLimit: 0, // ไม่จำกัด queue
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// สร้าง Promise Pool สำหรับใช้กับ async/await
const promisePool = pool.promise();

// ทดสอบการเชื่อมต่อ
pool.getConnection((err, connection) => {
  if (err) {
    console.error('การเชื่อมต่อล้มเหลว:', err);
    return;
  }
  console.log('เชื่อมต่อกับฐานข้อมูลสำเร็จ');
  connection.release(); // คืน connection กลับไปที่ pool
});

// ส่งออก pool ทั้งสองแบบ
module.exports = { pool, promisePool };