const connection = require('../config/db');
const lineNotify = require('../utils/lineNotify');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
// เพิ่มบันทึกการยืม
exports.addBorrowRecord = async (req, res) => {
  const { user_id, equipment_id, quantity_borrow } = req.body;

  if (!user_id || !equipment_id || !quantity_borrow || quantity_borrow <= 0) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  try {
    await connection.promise().beginTransaction();

    const insertQuery = `
      INSERT INTO borrow_records (user_id, equipment_id, quantity_borrow)
      VALUES (?, ?, ?)
    `;
    const values = [user_id, equipment_id, quantity_borrow];
    const [insertResult] = await connection.promise().query(insertQuery, values);

    const updateQuery = `
      UPDATE equipment
      SET quantity = quantity - ?
      WHERE equipment_id = ? AND quantity >= ? AND ? > 0
    `;
    const [updateResult] = await connection.promise().query(updateQuery, [quantity_borrow, equipment_id, quantity_borrow, quantity_borrow]);

    if (updateResult.affectedRows === 0) {
      throw new Error('Insufficient quantity or equipment not found');
    }

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
      JOIN users u ON br.user_id = u.user_id
      JOIN equipment e ON br.equipment_id = e.equipment_id
      WHERE br.record_id = ?
    `, [recordId]);

    if (!userResult.length) {
      throw new Error('Borrow record not found after insertion');
    }

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

const message = `📌 มีการยืมอุปกรณ์ใหม่:
- 👤 ชื่อผู้ยืม: ${student_name}
- 🎓 รหัสนักศึกษา: ${student_id}
- 🧰️ ชื่ออุปกรณ์: ${equipment_name}
- 🔢 จํานวนที่ยืม: ${quantity_borrow}
- 📞 เบอร์โทร: ${phone}
- 📅 วันที่ยืมอุปกรณ์: 
      ${thaiTimeCustom}`;
    

    lineNotify.sendMessage(message);
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
  const image_return = req.file?.filename; // ใช้ filename จาก multer

  if (!record_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 🔹 เริ่ม Transaction
    await connection.promise().beginTransaction();

    // 🔹 ดึงข้อมูลอุปกรณ์ที่ถูกยืม
    const [record] = await connection.promise().query(
      `SELECT equipment_id, quantity_borrow FROM borrow_records WHERE record_id = ?`,
      [record_id]
    );

    if (!record.length) {
      throw new Error('Borrow record not found');
    }

    const { equipment_id, quantity_borrow } = record[0];

    // 🔹 อัปเดตสถานะคืนอุปกรณ์ใน borrow_records
    const updateBorrowQuery = `
      UPDATE borrow_records
      SET return_date = ?, status = ?, image_return = ?
      WHERE record_id = ?
    `;
    const values = [new Date(), status || 'returned', image_return || '', record_id];
    const [updateResult] = await connection.promise().query(updateBorrowQuery, values);

    if (updateResult.affectedRows === 0) {
      throw new Error('Failed to update borrow record');
    }

    // 🔹 อัปเดตจำนวนอุปกรณ์ให้เพิ่มกลับตาม quantity_borrow
    const restoreQuery = `
      UPDATE equipment
      SET quantity = quantity + ?
      WHERE equipment_id = ?
    `;
    await connection.promise().query(restoreQuery, [quantity_borrow, equipment_id]);

    // 🔹 ยืนยันการทำธุรกรรม
    await connection.promise().commit();

    // 🔹 ดึงข้อมูลสำหรับแจ้งเตือน LINE Notify
    const [userResult] = await connection.promise().query(
      `SELECT 
        u.student_name,
        u.phone,
        e.equipment_name,
        br.return_date,
        br.status
      FROM 
        borrow_records br
      JOIN 
        users u ON br.user_id = u.user_id
      JOIN 
        equipment e ON br.equipment_id = e.equipment_id
      WHERE 
        br.record_id = ?`,
      [record_id]
    );

    if (!userResult.length) {
      throw new Error('Return record not found after update');
    }

    const { student_name, equipment_name, phone, return_date, status: borrow_status } = userResult[0];

    // 🔹 แปลงวันที่ให้เป็นรูปแบบภาษาไทย
    const thai_return_date = new Date(return_date).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

      // 🔹 ข้อความแจ้งเตือน
const message = `📌 มีการคืนอุปกรณ์:
- 👤 ชื่อผู้คืน: ${student_name}
- 🎒 อุปกรณ์: ${equipment_name}
- 📞 เบอร์โทร: ${phone}
- 📅 วันที่คืน: 
${thai_return_date}
- 🔄 จำนวนที่คืน: ${quantity_borrow} ชิ้น
- ✅ สถานะ: ${borrow_status || 'returned'}`;

    // 🔹 URL ของรูปภาพ (ถ้ามี)
    const imageUrl = image_return ? `https://yourdomain.com/image_return/${image_return}` : null;

    // 🔹 ส่งแจ้งเตือนผ่าน LINE Notify
    try {
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
    const [results] = await connection.promise().query(`
      SELECT 
        br.borrow_date,
        br.return_date,
        br.status,
        u.student_name
      FROM 
        borrow_records br
      JOIN 
        users u 
      ON 
        br.user_id = u.user_id
    `);
    res.status(200).json({ borrow_records: results });
  } catch (error) {
    console.error('Error fetching borrow records:', error);
    res.status(500).json({ message: 'Error fetching borrow records', error });
  }
};
exports.getAllBorrowRecordsByUserId = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Query เพื่อดึงจำนวนสถานะ Borrowed
    const [countResults] = await connection
      .promise()
      .query(
        `SELECT 
          COUNT(CASE WHEN status = 'Borrowed' THEN 1 END) AS borrowed_count
         FROM borrow_records
         WHERE user_id = ? AND status = 'Borrowed'`, // เพิ่มเงื่อนไขที่นี่
        [user_id]
      );

    // Query เพื่อดึงตารางข้อมูลทั้งหมดที่มีสถานะ Borrowed
    const [borrowResults] = await connection.promise().query(`
      SELECT 
        e.equipment_id,
        e.image,
        e.equipment_name,
        e.description,
        br.borrow_date,
        br.status,
        br.quantity_borrow,
        record_id
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
        br.user_id = ?   ORDER BY 
    br.borrow_date DESC
    `, [user_id]);

    if (borrowResults.length === 0) {
      return res.status(404).json({ message: 'No borrow records found for this user' });
    }

    // แปลงฟอร์แมตวันที่ใน borrowResults
    const formattedBorrowResults = borrowResults.map(record => {
      const borrowDate = new Date(record.borrow_date);

      // Format วันที่เป็น DD/MM/YYYY HH:mm
      const formattedDate = borrowDate.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        ...record,
        borrow_date: formattedDate, // ใช้วันที่ที่แปลงแล้ว
      };
    });

    res.status(200).json({
      message: 'Borrow records fetched successfully',
      data: {
        borrowed_count: countResults[0]?.borrowed_count || 0,
        borrow_records: formattedBorrowResults, // ตารางข้อมูลที่แปลงเวลาแล้ว
      },
    });
  } catch (error) {
    console.error('Error fetching borrow records:', error);
    res.status(500).json({ message: 'An error occurred while fetching borrow records' });
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
