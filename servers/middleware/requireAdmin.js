// Middleware ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
module.exports = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'ไม่ได้รับอนุญาต: เฉพาะผู้ดูแลระบบเท่านั้น' });
    }
    next();
};
