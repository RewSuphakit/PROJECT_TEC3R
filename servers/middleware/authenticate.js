const { promisePool } = require('../config/db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // ตรวจสอบ payload มี user_id และ student_email
    if (!payload?.user?.user_id || !payload.user.student_email) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    // ดึงข้อมูลผู้ใช้จาก DB (เฉพาะ column ที่จำเป็น ไม่ดึง password)
    const [rows] = await promisePool.query(
      'SELECT user_id, student_id, student_name, year_of_study, student_email, phone, role FROM users WHERE student_email = ? LIMIT 1',
      [payload.user.student_email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Unauthorized: User not found' });
    }

    // เพิ่ม user_id ลง req.user
    req.user = {
      ...rows[0],
      user_id: rows[0].user_id, // ใช้ชื่อ field ที่ถูกต้อง
    };

    next();
  } catch (err) {
    console.error('Error in authentication middleware:', err.message || err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
