const connection = require('../config/db');
const lineNotify = require('../utils/lineNotify');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
// เพิ่มบันทึกการยืม
exports.addBorrowRecord = async (req, res) => {
  const { user_id, equipment_id, borrow_date, status } = req.body;
  const image = req.file?.filename;

  if (!user_id || !equipment_id || !borrow_date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connection.promise().beginTransaction();

    const query = `
      INSERT INTO borrow_records (user_id, equipment_id, borrow_date, status, image)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [user_id, equipment_id, borrow_date, status, image];
    await connection.promise().query(query, values);

    const updateQuery = `
      UPDATE equipment
      SET quantity = GREATEST(quantity - 1, 0)
      WHERE equipment_id = ? AND quantity > 0
    `;
    const [updateResult] = await connection.promise().query(updateQuery, [equipment_id]);

    if (updateResult.affectedRows === 0) {
      throw new Error('Insufficient quantity or equipment not found');
    }

<<<<<<< HEAD
    const [userResult] = await connection.promise().query(`
      SELECT u.student_name, u.student_id, u.phone, e.equipment_name
      FROM users u
      JOIN equipment e ON u.user_id = ? AND e.equipment_id = ?
    `, [user_id, equipment_id]);

    if (!userResult.length) {
      throw new Error('User or equipment not found');
    }

    const { student_name, student_id, phone, equipment_name } = userResult[0];
    const message = `มีการยืมอุปกรณ์ใหม่:
- ชื่อผู้ใช้: ${student_name}
- รหัสนักศึกษา: ${student_id}
- ชื่ออุปกรณ์: ${equipment_name}
- เบอร์โทร: ${phone}
- วันเวลาที่ยืม: ${borrow_date}`;

    const imageUrl = image ? `https://9b12-171-97-72-128.ngrok-free.app/image_borrow/${image}` : null;
    await lineNotify.sendMessage(message, imageUrl);

    await connection.promise().commit();
=======
   // Get the username for the notification
const [userResult] = await connection.promise().query(`
  SELECT 
    u.student_name ,u.student_id,u.year_of_study,u.phone,e.equipment_name,e.image
  FROM 
    borrow_records br
  JOIN 
    users u 
  ON 
    br.user_id = u.user_id
  JOIN 
    equipment e 
  ON 
    br.equipment_id = e.equipment_id
  WHERE 
    u.user_id = ? and e.equipment_id = ?
`, [user_id, equipment_id]);

if (!userResult || userResult.length === 0) {
  throw new Error('User not found or no matching record in users table');
}

const user = userResult[0]; // Ensure proper indexing
const studentName = user.student_name;

if (!studentName) {
  throw new Error('Student name is undefined');
}
// Proceed with the notification
const message = `มีการยืมอุปกรณ์ใหม่จากผู้ใช้: 
- ชื่อผู้ใช้: ${user.student_name}
- รหัสนักศึกษา: ${user.student_id}
- ชื่ออุปกรณ์: ${user.equipment_name}
- เบอร์โทร: ${user.phone}
- วันที่ยืม: ${borrow_date}
- รูปภาพ: https://www.paws.org/wp-content/uploads/2020/02/HappyCat-HP.jpg`;


try {
  await lineNotify.sendMessage(message);
} catch (lineError) {
  console.error('Error sending LINE notification:', lineError);
}
>>>>>>> e474c11e67f1b36ffac22c57a421b1bd64b766a9
    res.status(201).json({ message: 'Borrow record added successfully' });
  } catch (error) {
    console.error('Error adding borrow record:', error);
    await connection.promise().rollback();
    res.status(500).json({ message: 'Error adding borrow record', error: error.message });
  }
};

// อัปเดตสถานะการคืน
exports.updateReturnStatus = async (req, res) => {
  const { record_id } = req.params;
  const { return_date, status } = req.body;

  if (!record_id || !return_date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Begin transaction
    await connection.promise().beginTransaction();

    // Update the return status
    const query = `
      UPDATE borrow_records
      SET return_date = ?, status = ?
      WHERE record_id = ?
    `;
    const values = [return_date, status || 'returned', record_id];
    await connection.promise().query(query, values);

    // Get equipment_id from the borrow record
    const [record] = await connection.promise().query(`SELECT equipment_id FROM borrow_records WHERE record_id = ?`, [record_id]);

    if (!record) {
      throw new Error('Borrow record not found');
    }

    // Update the equipment quantity when the item is returned
    const updateQuery = `
      UPDATE equipment
      SET quantity = quantity + 1
      WHERE equipment_id = ?
    `;
    await connection.promise().query(updateQuery, [record.equipment_id]);

    // Commit transaction
    await connection.promise().commit();

    // ส่งข้อความแจ้งเตือน
    const message = `มีการคืนอุปกรณ์: 
- รหัสบันทึก: ${record_id}
- วันที่คืน: ${return_date}
- สถานะ: ${status || 'returned'}`;
    try {
      await lineNotify.sendMessage(message);
    } catch (lineError) {
      console.error('Error sending LINE notification:', lineError);
    }

    res.status(200).json({ message: 'Return status updated successfully' });
  } catch (error) {
    console.error('Error updating return status:', error);
    await connection.promise().rollback();
    res.status(500).json({ message: 'Error updating return status', error });
  }
};

// ดึงข้อมูลบันทึกการยืมทั้งหมด
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const [results] = await connection.promise().query('SELECT * FROM borrow_records');
    res.status(200).json({ borrow_records: results });
  } catch (error) {
    console.error('Error fetching borrow records:', error);
    res.status(500).json({ message: 'Error fetching borrow records', error });
  }
};

// ลบบันทึกการยืม
exports.deleteBorrowRecord = async (req, res) => {
  const { record_id } = req.params;

  if (!record_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Begin transaction
    await connection.promise().beginTransaction();

    // Get equipment_id before deleting the record
    const [record] = await connection.promise().query(`SELECT equipment_id FROM borrow_records WHERE record_id = ?`, [record_id]);

    if (!record) {
      throw new Error('Borrow record not found');
    }

    // Delete the borrow record
    const query = `DELETE FROM borrow_records WHERE record_id = ?`;
    await connection.promise().query(query, [record_id]);

    // Update the equipment quantity
    const updateQuery = `
      UPDATE equipment
      SET quantity = quantity + 1
      WHERE equipment_id = ?
    `;
    await connection.promise().query(updateQuery, [record.equipment_id]);

    // Commit transaction
    await connection.promise().commit();

    res.status(200).json({ message: 'Borrow record deleted successfully' });
  } catch (error) {
    console.error('Error deleting borrow record:', error);
    await connection.promise().rollback();
    res.status(500).json({ message: 'Error deleting borrow record', error });
  }
};
