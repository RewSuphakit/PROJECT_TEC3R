const mysql = require('mysql2');
require('dotenv').config();

// ใช้ Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,  // คอยการเชื่อมต่อ
  connectionLimit: 10,      // จำนวนการเชื่อมต่อสูงสุด
  queueLimit: 0             // จำนวนการรอคอยการเชื่อมต่อสูงสุด
});

// ใช้ promise-based API สำหรับการ query
const promisePool = pool.promise();

module.exports = promisePool;
