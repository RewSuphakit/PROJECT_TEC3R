const jwt = require('jsonwebtoken');

// Middleware สำหรับการตรวจสอบสิทธิ์
const authenticate = (req, res, next) => {
  // รับ token จาก header Authorization
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // ยืนยัน token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // แนบข้อมูลผู้ใช้ไปกับ request object
    req.user = decoded;
    next(); // ถ้าตรวจสอบผ่านไปยังตัวถัดไป (controller)
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authenticate;
