const connection = require('../config/db');
const lineNotify = require('../utils/lineNotify');

// =========================
// 1. เพิ่มบันทึกการยืม (Add Borrow Record)
// =========================
exports.addBorrowRecord = async (req, res) => {
  const { user_id, items } = req.body; // items: array ของอุปกรณ์ที่ยืม
  if (!user_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Missing or invalid required fields" });
  }

  try {
    // เริ่ม Transaction
    await connection.promise().beginTransaction();

    // 1. สร้าง transaction เดียวใน table borrow_transactions
    const insertTransactionQuery = `INSERT INTO borrow_transactions (user_id) VALUES (?)`;
    const [transactionResult] = await connection.promise().query(insertTransactionQuery, [user_id]);
    const transaction_id = transactionResult.insertId;

    // 2. บันทึกข้อมูลใน borrow_records ด้วย batch insert
    const insertRecordQuery = `
      INSERT INTO borrow_records (transaction_id, user_id, equipment_id, quantity_borrow)
      VALUES ?
    `;
    const borrowData = items.map(({ equipment_id, quantity_borrow }) => [
      transaction_id,
      user_id,
      equipment_id,
      quantity_borrow,
    ]);
    await connection.promise().query(insertRecordQuery, [borrowData]);

    // 3. อัปเดตจำนวนอุปกรณ์ในตาราง equipment
    const updateEquipmentQuery = `
      UPDATE equipment
      SET quantity = quantity - ?
      WHERE equipment_id = ? AND quantity >= ?
    `;
    for (const { equipment_id, quantity_borrow } of items) {
      const [updateResult] = await connection.promise().query(updateEquipmentQuery, [
        quantity_borrow,
        equipment_id,
        quantity_borrow,
      ]);
      if (updateResult.affectedRows === 0) {
        throw new Error("Insufficient quantity or equipment not found");
      }
    }

    // 4. ดึงข้อมูลนักศึกษาและข้อมูลการยืมที่เกี่ยวข้อง
    const selectUserQuery = `
      SELECT u.student_name, u.student_id, u.phone, bt.borrow_date
      FROM users u
      JOIN borrow_transactions bt ON u.user_id = bt.user_id
      WHERE bt.transaction_id = ?
    `;
    const [userResult] = await connection.promise().query(selectUserQuery, [transaction_id]);
    if (userResult.length === 0) throw new Error("User not found");

    const selectRecordsQuery = `
      SELECT br.record_id, br.quantity_borrow, e.equipment_name
      FROM borrow_records br
      JOIN equipment e ON br.equipment_id = e.equipment_id
      WHERE br.transaction_id = ?
    `;
    const [recordsResult] = await connection.promise().query(selectRecordsQuery, [transaction_id]);
    if (recordsResult.length === 0) throw new Error("Borrow records not found");

    // 5. จัดรูปแบบข้อมูลสำหรับ response
    const responseData = {
      transaction_id,
      borrow_date: userResult[0].borrow_date,
      return_date: null,
      user_id,
      student_name: userResult[0].student_name,
      borrow_records: recordsResult.map(record => ({
        record_id: record.record_id,
        quantity_borrow: record.quantity_borrow,
        equipment_name: record.equipment_name,
        status: "Borrowed",
        image_return: "",
      })),
    };

    // 6. แปลงวันที่ให้เป็นรูปแบบไทย
    const { student_name, student_id, phone, borrow_date } = userResult[0];
    const thaiTimeCustom = new Date(borrow_date).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // 7. สร้างข้อความแจ้งเตือนผ่าน LINE
    let message = `📌 มีการยืมอุปกรณ์ใหม่:\n`;
    message += `- 👤 ชื่อผู้ยืม: ${student_name}\n`;
    message += `- 🎓 รหัสนักศึกษา: ${student_id}\n`;
    message += `- 📞 เบอร์โทร: ${phone}\n`;
    message += `- 📅 วันที่ยืม: ${thaiTimeCustom}\n`;
    recordsResult.forEach(record => {
      message += `- 🧰 อุปกรณ์: ${record.equipment_name} (${record.quantity_borrow} ชิ้น)\n`;
    });

    // ส่งแจ้งเตือนผ่าน LINE
    await lineNotify.sendMessage(message);

    // ยืนยัน Transaction
    await connection.promise().commit();
    res.status(201).json(responseData);
  } catch (error) {
    await connection.promise().rollback();
    console.error("Error adding borrow record:", error);
    res.status(500).json({ message: "Error adding borrow record", error: error.message });
  }
};

// =========================
// 2. อัปเดตสถานะการคืนอุปกรณ์ (Update Return Status)
// =========================
exports.updateReturnStatus = async (req, res) => {
  const { record_id } = req.params;
  const { status } = req.body;
  const image_return = req.file?.filename || "";

  if (!record_id) {
    return res.status(400).json({ message: "Missing required record_id" });
  }

  try {
    await connection.promise().beginTransaction();

    // ดึงข้อมูลการยืมที่ต้องการอัปเดต
    const [records] = await connection.promise().query(
      `SELECT equipment_id, quantity_borrow FROM borrow_records WHERE record_id = ?`,
      [record_id]
    );
    if (!records.length) throw new Error("Borrow record not found");
    const { equipment_id, quantity_borrow } = records[0];

    // อัปเดตสถานะการคืน (ถ้าไม่ส่งค่า status จะถือว่าเป็น 'Returned')
    const updateBorrowQuery = `
      UPDATE borrow_records
      SET return_date = ?, status = ?, image_return = ?
      WHERE record_id = ?
    `;
    const updatedStatus = status ? status : "Returned";
    const [updateResult] = await connection.promise().query(updateBorrowQuery, [
      new Date(),
      updatedStatus,
      image_return,
      record_id,
    ]);
    if (updateResult.affectedRows === 0) throw new Error("Failed to update borrow record");

    // คืนจำนวนอุปกรณ์กลับไปในตาราง equipment
    const restoreQuery = `
      UPDATE equipment
      SET quantity = quantity + ?
      WHERE equipment_id = ?
    `;
    await connection.promise().query(restoreQuery, [quantity_borrow, equipment_id]);

    await connection.promise().commit();

    // ดึงข้อมูลสำหรับแจ้งเตือน LINE
    const selectReturnQuery = `
      SELECT u.student_name, u.phone, e.equipment_name, br.return_date, br.status, br.quantity_borrow
      FROM borrow_records br
      JOIN users u ON br.user_id = u.user_id
      JOIN equipment e ON br.equipment_id = e.equipment_id
      WHERE br.record_id = ?
    `;
    const [userResult] = await connection.promise().query(selectReturnQuery, [record_id]);
    if (!userResult.length) throw new Error("Return record not found after update");
    const { student_name, phone, equipment_name, return_date, status: borrow_status } = userResult[0];
    const thai_return_date = new Date(return_date).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const message = `📌 มีการคืนอุปกรณ์:
- 👤 ชื่อผู้คืน: ${student_name}
- 🎒 อุปกรณ์: ${equipment_name}
- 📞 เบอร์โทร: ${phone}
- 📅 วันที่คืน: ${thai_return_date}
- 🔄 จำนวนที่คืน: ${quantity_borrow} ชิ้น
- ✅ สถานะ: ${borrow_status}`;

    // หากมีรูปภาพในการคืน ให้แนบ URL (ปรับ URL ให้ตรงกับโดเมนของคุณ)
    const imageUrl = image_return ? `https://yourdomain.com/image_return/${image_return}` : null;
    try {
      await lineNotify.sendMessage(message, imageUrl);
    } catch (lineError) {
      console.error("Error sending LINE notification:", lineError);
    }

    res.status(200).json({ message: "Return status updated successfully" });
  } catch (error) {
    await connection.promise().rollback();
    console.error("Error updating return status:", error);
    res.status(500).json({ message: "Error updating return status", error: error.message });
  }
};

exports.getAllBorrowRecords = async (req, res) => {
  try {
    const query = `
      SELECT 
        bt.transaction_id, 
        bt.borrow_date, 
        bt.user_id, 
        u.student_name,
        br.record_id, 
        br.return_date, 
        br.quantity_borrow, 
        e.equipment_name, 
        br.status, 
        br.image_return
      FROM borrow_transactions bt
      JOIN users u ON bt.user_id = u.user_id
      JOIN borrow_records br ON bt.transaction_id = br.transaction_id
      JOIN equipment e ON br.equipment_id = e.equipment_id
      ORDER BY bt.transaction_id DESC
    `;
    const [rows] = await connection.promise().query(query);

    // รวมข้อมูลให้เป็นรูปแบบ transaction เดียวโดยมี borrow_records เป็น Array
    const transactionsMap = {};
    rows.forEach(row => {
      if (!transactionsMap[row.transaction_id]) {
        transactionsMap[row.transaction_id] = {
          transaction_id: row.transaction_id,
          borrow_date: row.borrow_date,
          return_date: row.return_date,
          user_id: row.user_id,
          student_name: row.student_name,
          borrow_records: [],
        };
      }
      transactionsMap[row.transaction_id].borrow_records.push({
        record_id: row.record_id,
        quantity_borrow: row.quantity_borrow,
        equipment_name: row.equipment_name,
        status: row.status,
        image_return: row.image_return,
      });
    });

    const borrowTransactions = Object.values(transactionsMap);
    res.json({ borrow_transactions: borrowTransactions });
  } catch (error) {
    console.error("Error fetching borrow records:", error);
    res.status(500).json({ message: "Error fetching borrow records", error: error.message });
  }
};

// =========================
// 4. ดึงข้อมูลบันทึกการยืมของผู้ใช้ตาม user_id (Get Borrow Records By User ID)
// =========================
exports.getAllBorrowRecordsByUserId = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // นับจำนวนสถานะ 'Borrowed'
    const countQuery = `
      SELECT COUNT(CASE WHEN status = 'Borrowed' THEN 1 END) AS borrowed_count
      FROM borrow_records
      WHERE user_id = ? AND status = 'Borrowed'
    `;
    const [countResults] = await connection.promise().query(countQuery, [user_id]);

    // ดึงข้อมูลบันทึกการยืม
    const borrowQuery = `
      SELECT 
        e.equipment_id,
        e.image,
        e.equipment_name,
        e.description,
        br.borrow_date,
        br.status,
        br.quantity_borrow,
        br.record_id
      FROM borrow_records br
      JOIN users u ON br.user_id = u.user_id
      JOIN equipment e ON br.equipment_id = e.equipment_id
      WHERE br.user_id = ?
      ORDER BY br.borrow_date DESC
    `;
    const [borrowResults] = await connection.promise().query(borrowQuery, [user_id]);

    // แปลงรูปแบบวันที่ให้เป็นแบบไทย
    const formattedBorrowResults = borrowResults.map(record => {
      const formattedDate = new Date(record.borrow_date).toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      return { ...record, borrow_date: formattedDate };
    });

    res.status(200).json({
      message: formattedBorrowResults.length > 0 ? "Borrow records fetched successfully" : "No borrow records found for this user",
      data: {
        borrowed_count: countResults[0]?.borrowed_count || 0,
        borrow_records: formattedBorrowResults,
      },
    });
  } catch (error) {
    console.error("Error fetching borrow records by user:", error);
    res.status(500).json({ message: "An error occurred while fetching borrow records", error: error.message });
  }
};

// =========================
// 5. ลบบันทึกการยืม (Delete Borrow Record)
// =========================
exports.deleteBorrowRecord = async (req, res) => {
  const { record_id } = req.params;
  if (!record_id) {
    return res.status(400).json({ message: "Missing required record_id" });
  }

  try {
    await connection.promise().beginTransaction();

    // ดึงข้อมูล borrow record ที่ต้องการลบ
    const [records] = await connection.promise().query(
      `SELECT equipment_id, quantity_borrow FROM borrow_records WHERE record_id = ?`,
      [record_id]
    );
    if (!records.length) throw new Error("Borrow record not found");
    const { equipment_id, quantity_borrow } = records[0];

    // ลบบันทึกการยืม
    const deleteQuery = `DELETE FROM borrow_records WHERE record_id = ?`;
    const [deleteResult] = await connection.promise().query(deleteQuery, [record_id]);
    if (deleteResult.affectedRows === 0) throw new Error("Failed to delete borrow record");

    // คืนจำนวนอุปกรณ์กลับไปในตาราง equipment
    const updateQuery = `
      UPDATE equipment
      SET quantity = quantity + ?
      WHERE equipment_id = ?
    `;
    await connection.promise().query(updateQuery, [quantity_borrow, equipment_id]);

    await connection.promise().commit();
    res.status(200).json({ message: "Borrow record deleted successfully" });
  } catch (error) {
    console.error("Error deleting borrow record:", error);
    await connection.promise().rollback();
    res.status(500).json({ message: "Error deleting borrow record", error: error.message });
  }
};

// =========================
// 6. ดึงข้อมูลบันทึกการยืมตาม record_id (Get Borrow Record by ID)
// =========================
exports.getAllBorrowRecordsID = async (req, res) => {
  const { record_id } = req.params;
  if (!record_id) return res.status(400).json({ message: "ID is required" });

  try {
    const query = `
      SELECT br.record_id, u.student_id, u.student_name, u.student_email, 
             e.equipment_name, e.description, br.borrow_date, br.return_date, 
             br.status, br.quantity_borrow, br.image_return
      FROM borrow_records br
      JOIN users u ON br.user_id = u.user_id
      JOIN equipment e ON br.equipment_id = e.equipment_id
      WHERE br.record_id = ?
    `;
    const [borrowResults] = await connection.promise().query(query, [record_id]);
    if (!borrowResults.length) {
      return res.status(404).json({ message: "No borrow records found" });
    }

    const borrowed_count = borrowResults.reduce(
      (total, record) => total + (record.quantity_borrow || 0),
      0
    );

    const formattedResults = borrowResults.map(record => ({
      ...record,
      borrow_date: new Date(record.borrow_date).toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    res.status(200).json({
      borrowed_count,
      borrow_records: formattedResults,
    });
  } catch (error) {
    console.error("Error fetching borrow record by ID:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
