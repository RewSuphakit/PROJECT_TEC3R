// ในไฟล์ authenticate.js
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // ใช้ pool จาก db.js

module.exports = async (req, res, next) => {
  try {
    // ตรวจสอบ Header Authorization
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    // ดึง Token และถอดรหัส JWT
    const token = authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || !payload.user || !payload.user.student_email || !payload.user.role) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    // ตรวจสอบข้อมูลผู้ใช้งานในฐานข้อมูล
    const [rows] = await db.query(
      'SELECT * FROM users WHERE student_email = ?',
      [payload.user.student_email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    const user = rows[0];

    // ตรวจสอบ Role ของผู้ใช้ (Case-Insensitive)
    const validRoles = ['admin', 'user'];
    if (!validRoles.includes(user.role.toLowerCase())) {
      return res.status(403).json({ error: 'Unauthorized: Invalid user role' });
    }

    // ลบข้อมูลสำคัญ เช่น password ก่อนส่งต่อ
    delete user.password;
    req.user = user;

    next();
  } catch (err) {
    console.error('Error in authentication middleware:', err.message || err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
