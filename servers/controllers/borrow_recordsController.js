const connection = require('../config/db');
const lineNotify = require('../utils/lineNotify');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
// เพิ่มบันทึกการยืม
exports.addBorrowRecord = async (req, res) => {
  const { user_id, equipment_id, status } = req.body;
  const image = req.file?.filename;

  if (!user_id || !equipment_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connection.promise().beginTransaction();

    // Insert a new borrow record
    const insertQuery = `
      INSERT INTO borrow_records (user_id, equipment_id, status, image)
      VALUES (?, ?, ?, ?)
    `;
    const values = [user_id, equipment_id, status, image];
    const [insertResult] = await connection.promise().query(insertQuery, values);

    // Check if equipment quantity can be updated
    const updateQuery = `
      UPDATE equipment
      SET quantity = GREATEST(quantity - 1, 0)
      WHERE equipment_id = ? AND quantity > 0
    `;
    const [updateResult] = await connection.promise().query(updateQuery, [equipment_id]);

    if (updateResult.affectedRows === 0) {
      throw new Error('Insufficient quantity or equipment not found');
    }

    // Fetch the borrow record based on the record_id just inserted
    const recordId = insertResult.insertId;
    const [userResult] = await connection.promise().query(`
      SELECT 
        u.student_name,
        u.student_id,
        u.year_of_study,
        u.phone,
        e.equipment_name,
        br.borrow_date
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
        br.record_id = ?
    `, [recordId]);

    if (!userResult.length) {
      throw new Error('Borrow record not found after insertion');
    }

    // Extract user and borrow information
    const { student_name, student_id, phone, equipment_name, borrow_date } = userResult[0];
    const date = new Date(borrow_date); 
    const thaiTimeCustom = date.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    
    // Prepare and send notification
    const message = `มีการยืมอุปกรณ์ใหม่:
- ชื่อผู้ยืม: ${student_name}
- รหัสนักศึกษา: ${student_id}
- ชื่ออุปกรณ์: ${equipment_name}
- เบอร์โทร: ${phone}
- วันที่ยืมอุปกรณ์:
 ${thaiTimeCustom}`;

    const imageUrl = image ? `https://e53d-171-97-72-128.ngrok-free.app/image_borrow/${image}` : null;
    await lineNotify.sendMessage(message, imageUrl);

    // Commit transaction
    await connection.promise().commit();
    res.status(201).json({ message: 'Borrow record added successfully' });
  } catch (error) {
    console.error('Error adding borrow record:', error);
    await connection.promise().rollback();
    res.status(500).json({ message: 'Error adding borrow record', error: error.message });
  }
};

exports.updateReturnStatus = async (req, res) => {
  const { record_id } = req.params;
  const { status } = req.body;
  const image_return  = req.file?.filename;  // ใช้ filename ที่ได้รับจาก multer

  if (!record_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Begin transaction
    await connection.promise().beginTransaction();

    // Update the return status and return_date in borrow_records
    const query = `
      UPDATE borrow_records
      SET return_date = ?, status = ?, image_return = ?
      WHERE record_id = ?
    `;
    const values = [new Date(), status || 'returned', image_return || '', record_id];
    const [updateResult] = await connection.promise().query(query, values);

    if (updateResult.affectedRows === 0) {
      throw new Error('Borrow record not found or failed to update');
    }

    // Get equipment_id from the borrow record
    const [record] = await connection.promise().query(`SELECT equipment_id FROM borrow_records WHERE record_id = ?`, [record_id]);

    if (!record.length) {
      throw new Error('Borrow record not found');
    }

    // Update the equipment quantity when the item is returned
    const updateQuery = `
      UPDATE equipment
      SET quantity = quantity + 1
      WHERE equipment_id = ?
    `;
    await connection.promise().query(updateQuery, [record[0].equipment_id]);

    // Commit transaction
    await connection.promise().commit();

    // Get updated return date
    const [userResult] = await connection.promise().query(`
      SELECT 
        u.student_name,
        u.phone,
        e.equipment_name,
        br.return_date,
        br.status
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
        br.record_id = ?
    `, [record_id]);

    if (!userResult.length) {
      throw new Error('Return date not found');
    }

    const { student_name, equipment_name, phone, return_date, status: borrow_status } = userResult[0];
    const date = new Date(return_date);
    const thai_return_date = date.toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // Prepare message
    const message = `มีการคืนอุปกรณ์:
- ชื่อผู้คืน: ${student_name}
- ชื่ออุปกรณ์: ${equipment_name}
- เบอร์โทร: ${phone}
- วันที่คืนอุปกรณ์: 
${thai_return_date}
- สถานะ: ${borrow_status || 'returned'}`;

    // Image URL
    const imageUrl = image_return ? `https://e53d-171-97-72-128.ngrok-free.app/image_return/${image_return}` : null;  // Replace with your domain or cloud URL

    // Send notification
    try {
      // If imageUrl is available, send it with the message
      await lineNotify.sendMessage(message, imageUrl);
    } catch (lineError) {
      console.error('Error sending LINE notification:', lineError);
    }

    res.status(200).json({ message: 'Return status updated successfully' });
  } catch (error) {
    console.error('Error updating return status:', error);
    await connection.promise().rollback();
    res.status(500).json({ message: 'Error updating return status', error: error.message });
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
