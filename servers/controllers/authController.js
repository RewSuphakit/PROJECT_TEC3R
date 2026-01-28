const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/db'); // ใช้ promisePool

// การสมัครสมาชิก
exports.register = async (req, res) => {
  const { student_id, student_name, year_of_study, student_email, password, phone, role } = req.body;

  // ตรวจสอบว่าอีเมลมีโดเมน @rmuti.ac.th หรือไม่
  const emailRegex = /^[a-zA-Z0-9._%+-]+@rmuti\.ac\.th$/;
  if (!emailRegex.test(student_email)) {
    return res.status(400).json({ message: 'อีเมลต้องอยู่ในรูปแบบ @rmuti.ac.th' });
  }

  try {
    // ตรวจสอบการมีอยู่ของอีเมลในฐานข้อมูล
    const [existingUsers] = await promisePool.query('SELECT * FROM users WHERE student_email = ?', [student_email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'มีผู้ใช้งานที่ใช้อีเมลนี้แล้ว' });
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // แทรกผู้ใช้งานใหม่
    await promisePool.query(
      'INSERT INTO users (student_id, student_name, year_of_study, student_email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [student_id, student_name, year_of_study, student_email, hashedPassword, phone, role]
    );

    return res.status(201).json({ message: 'ลงทะเบียนผู้ใช้สำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
};

exports.login = async (req, res) => {
  const { student_email, password } = req.body;

  // ตรวจสอบว่าอีเมลมีโดเมน @rmuti.ac.th หรือไม่
  const emailRegex = /^[a-zA-Z0-9._%+-]+@rmuti\.ac\.th$/;
  if (!emailRegex.test(student_email)) {
    return res.status(400).json({ msg: 'อีเมลต้องอยู่ในรูปแบบ @rmuti.ac.th' });
  }

  try {
    // ตรวจสอบว่าอีเมลถูกต้องหรือไม่
    const [results] = await promisePool.query('SELECT * FROM users WHERE student_email = ?', [student_email]);

    if (results.length === 0) {
      return res.status(400).json({ msg: 'ชื่อหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = results[0];

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'ชื่อหรือรหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง JWT payload
    const payload = {
      user: {
        user_id: user.user_id,
        student_id: user.student_id,
        student_name: user.student_name,
        year_of_study: user.year_of_study,
        student_email: user.student_email,
        phone: user.phone,
        role: user.role,
      },
    };

    // สร้าง JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      payload: payload.user,
    });
  } catch (err) {
    console.error('Unexpected server error:', err.message);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { user_id, student_id, student_name, year_of_study, student_email, phone, role } = req.user;

    if (!role) {
      return res.status(400).json({ error: 'ไม่พบข้อมูลระดับผู้ใช้งาน' });
    }

    if (role !== 'admin' && role !== 'user' && role !== 'teacher') {
      return res.status(403).json({ error: 'ไม่ได้รับอนุญาต: ระดับผู้ใช้ไม่ถูกต้อง' });
    }

    const userProfile = {
      user_id,
      student_id,
      student_name,
      year_of_study,
      student_email,
      phone,
      role
    };

    res.status(200).json(userProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

// ดึงข้อมูลผู้ใช้ทั้งหมด - รองรับ pagination
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // สร้าง WHERE clause สำหรับ search
    let whereClause = '';
    let queryParams = [];

    if (search) {
      whereClause = 'WHERE student_name LIKE ? OR student_email LIKE ? OR student_id LIKE ?';
      const searchPattern = `%${search}%`;
      queryParams = [searchPattern, searchPattern, searchPattern];
    }

    // นับจำนวนทั้งหมด
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countResult] = await promisePool.query(countQuery, queryParams);
    const totalCount = countResult[0].total;
    const totalPages = Math.ceil(totalCount / limit);

    // ดึงข้อมูลตาม pagination
    const dataQuery = `
      SELECT user_id, student_id, student_name, year_of_study, student_email, phone, role, created_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [results] = await promisePool.query(dataQuery, [...queryParams, limit, offset]);

    res.status(200).json({
      users: results,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const [results] = await promisePool.query('DELETE FROM users WHERE user_id = ?', [user_id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }

    res.status(200).json({ message: 'ลบผู้ใช้งานสำเร็จ' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { student_id, student_name, year_of_study, phone } = req.body;

    const updateQuery = `
      UPDATE users
      SET student_id = ?,
          student_name = ?,
          year_of_study = ?,
          phone = ?
      WHERE user_id = ?
    `;

    const [results] = await promisePool.query(updateQuery, [student_id, student_name, year_of_study, phone, user_id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }

    res.status(200).json({ message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};

exports.updateEmailPassword = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { student_email, password } = req.body;

    let updateQuery = `UPDATE users SET `;
    const values = [];

    if (student_email && student_email.trim() !== "") {
      updateQuery += `student_email = ? `;
      values.push(student_email);
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      if (values.length > 0) updateQuery += `, `;
      updateQuery += `password = ? `;
      values.push(hashedPassword);
    }

    updateQuery += `WHERE user_id = ?`;
    values.push(user_id);

    const [results] = await promisePool.query(updateQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้นี้" });
    }

    res.status(200).json({
      message: "อัปเดตอีเมล/รหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
    });
  } catch (error) {
    console.error("Error in updateEmailOrPassword:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

exports.adminUpdateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { student_id, student_name, year_of_study, student_email, password, phone, role } = req.body;

    const [existingUsers] = await promisePool.query(
      'SELECT user_id FROM users WHERE student_email = ? AND user_id != ?',
      [student_email, user_id]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'อีเมลนี้มีผู้ใช้งานแล้ว กรุณาใช้อีเมลอื่น' });
    }

    let updateQuery = `
      UPDATE users
      SET student_id = ?,
          student_name = ?,
          year_of_study = ?,
          student_email = ?,
          phone = ?,
          role = ?
    `;
    const values = [student_id, student_name, year_of_study, student_email, phone, role];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = ? `;
      values.push(hashedPassword);
    }

    updateQuery += `WHERE user_id = ?`;
    values.push(user_id);

    const [results] = await promisePool.query(updateQuery, values);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }

    res.status(200).json({ message: 'อัปเดตข้อมูลผู้ใช้โดยแอดมินสำเร็จ' });
  } catch (error) {
    console.error('Error in adminUpdateUser:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  }
};
