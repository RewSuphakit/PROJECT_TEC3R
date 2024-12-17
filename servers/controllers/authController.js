const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../config/db'); // การเชื่อมต่อฐานข้อมูล

// การสมัครสมาชิก
exports.register = async (req, res) => {
  const { student_id, student_name, year_of_study, student_email, password,phone } = req.body;

  // ตรวจสอบว่าอีเมลมีโดเมน @rmuti.ac.th หรือไม่
  const emailRegex = /^[a-zA-Z0-9._%+-]+@rmuti\.ac\.th$/;
  if (!emailRegex.test(student_email)) {
    return res.status(400).json({ message: 'Email must be in the format of @rmuti.ac.th' });
  }

  try {
    // ตรวจสอบการมีอยู่ของอีเมลในฐานข้อมูล
    connection.query(
      'SELECT * FROM users WHERE student_email = ?',
      [student_email],
      async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }
        if (results.length > 0) {
          return res.status(400).json({ message: 'User with this email already exists' });
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // แทรกผู้ใช้งานใหม่
        connection.query(
          'INSERT INTO users (student_id, student_name, year_of_study, student_email, password,phone) VALUES (?, ?, ?, ?, ?,?)',
          [student_id, student_name, year_of_study, student_email, hashedPassword,phone],
          (err, results) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Server error' });
            }
            return res.status(201).json({ message: 'User registered successfully' });
          }
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
    const { student_email, password } = req.body;
  
    // ตรวจสอบว่าอีเมลมีโดเมน @rmuti.ac.th หรือไม่
    const emailRegex = /^[a-zA-Z0-9._%+-]+@rmuti\.ac\.th$/;
    if (!emailRegex.test(student_email)) {
      return res.status(400).json({ msg: 'Email must be in the format of @rmuti.ac.th' });
    }
  
    try {
      // ตรวจสอบว่าอีเมลถูกต้องหรือไม่
      connection.query(
        'SELECT * FROM users WHERE student_email = ?',
        [student_email],
        async (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
          }
  
          if (results.length === 0) {
            return res.status(400).json({ msg: 'Invalid credentials' });
          }
  
          const user = results[0];
  
          // ตรวจสอบรหัสผ่าน
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
          }
  
          // สร้าง JWT token
          const payload = {
            user: {
              user_id : user.user_id ,
              student_id: user.student_id,
              student_name: user.student_name,
              year_of_study: user.year_of_study,
              student_email: user.student_email,
              phone: user.phone,
              role: user.role
            }
          };
  
          // สร้าง JWT token
          jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
            if (err) throw err;
            res.json({ token ,payload});
           // ส่ง token กลับไป
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };
  




  exports.getUserProfile = async (req, res) => {
    try {
      const { user_id, student_id, student_name, year_of_study, student_email, password, phone, role } = req.user;
  
      // ตรวจสอบว่า role มีอยู่ในข้อมูลหรือไม่
      if (!role) {
        return res.status(400).json({ error: 'Role is missing in the user profile' });
      }
  
      if (role !== 'admin' && role !== 'user') {
        return res.status(403).json({ error: 'Unauthorized: Invalid user role' });
      }
  
      const userProfile = {
        user_id,
        student_id,
        student_name,
        year_of_study,
        student_email,
        password,
        phone,
        role
      };
  
      res.status(200).json(userProfile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  





