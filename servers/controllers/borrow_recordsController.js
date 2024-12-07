const connection = require('../config/db');
const lineNotify = require('../utils/lineNotify');

// เพิ่มบันทึกการยืม
exports.addBorrowRecord = async (req, res) => {
  const { user_id, equipment_id, borrow_date, return_date, status } = req.body;

  if (!user_id || !equipment_id || !borrow_date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Begin transaction
    await connection.promise().beginTransaction();

    // Insert the borrow record
    const query = `
      INSERT INTO borrow_records (user_id, equipment_id, borrow_date, return_date, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [user_id, equipment_id, borrow_date, return_date, status || 'borrowed'];
    await connection.promise().query(query, values);

    // Update the quantity of the equipment
    const updateQuery = `
      UPDATE equipment
      SET quantity = quantity - 1
      WHERE equipment_id = ? AND quantity > 0
    `;
    const [updateResult] = await connection.promise().query(updateQuery, [equipment_id]);

    if (updateResult.affectedRows === 0) {
      throw new Error('Insufficient quantity or equipment not found');
    }

    // Get the username for the notification
    const [user] = await connection.promise().query(`
      SELECT * FROM users WHERE user_id = ?
    `, [user_id]);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Commit transaction
    await connection.promise().commit();

    // Send notification message
    const message = `มีการยืมอุปกรณ์ใหม่จากผู้ใช้: 
- ชื่อผู้ใช้: ${user.student_name}
- รหัสผู้ใช้: ${user_id}
  - รหัสอุปกรณ์: ${equipment_id}
  - วันที่ยืม: ${borrow_date}`;
    try {
      await lineNotify.sendMessage(message);
    } catch (lineError) {
      console.error('Error sending LINE notification:', lineError);
    }

    res.status(201).json({ message: 'Borrow record added successfully' });
  } catch (error) {
    console.error('Error adding borrow record:', error);
    await connection.promise().rollback();
    res.status(500).json({ message: 'Error adding borrow record', error });
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
