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
          console.error('Database query error:', err);
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
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
          if (err) {
            console.error('JWT sign error:', err);
            return res.status(500).json({ message: 'Token generation error' });
          }

          // ส่ง token และ payload กลับไป
          res.status(200).json({
            message: 'Login successful',
            token,
            payload: payload.user, // ส่งข้อมูลผู้ใช้งานโดยไม่รวม password
          });
        });
      }
    );
  } catch (err) {
    console.error('Unexpected server error:', err.message);
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
  

  exports.getAllUsers = async (req, res) => {
    try {
      connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json({ users: results });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
// Backend: Controller
exports.deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params; 
    
    connection.query(
      'DELETE FROM users WHERE user_id = ?', 
      [user_id], 
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { student_id, student_name, year_of_study, student_email, password, phone,role } = req.body;
  

    let updateQuery = `
      UPDATE users
      SET student_id = ?,
          student_name = ?,
          year_of_study = ?,
          student_email = ?,
          phone = ?,
          role = ?
    `;
    const values = [student_id, student_name, year_of_study, student_email, phone,role];

    // หากมีการส่ง password เข้ามา ให้แฮชและรวมลงใน query
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password = ? `;
      values.push(hashedPassword);
    }

    updateQuery += `WHERE user_id = ?`;
    values.push(user_id);

    connection.query(updateQuery, values, (err, results) => {
      if (err) {
        console.error('Update query error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'User updated successfully' });
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


