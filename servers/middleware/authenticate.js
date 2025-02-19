const connection = require('../config/db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    const token = authorization.split(' ')[1];

    // ✅ ตรวจสอบ JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // ✅ ตรวจสอบ payload ว่ามี student_email หรือไม่
    if (!payload || !payload.user || !payload.user.student_email) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    // ✅ ดึงข้อมูลผู้ใช้จากฐานข้อมูล
    const [rows] = await connection.promise().query(
      'SELECT * FROM users WHERE student_email = ? LIMIT 1',
      [payload.user.student_email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Unauthorized: User not found' });
    }

    // ✅ เพิ่มข้อมูลผู้ใช้ใน req.user
    req.user = rows[0];
    next();
  } catch (err) {
    console.error('Error in authentication middleware:', err.message || err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
