require('dotenv').config();
const { promisePool } = require('../config/db');
const lineNotify = require('../utils/lineNotify');

// =========================
// 1. ดึงประวัติการยืม-คืนทั้งหมดของผู้ใช้ (History) - รองรับ pagination
// =========================
exports.getHistoryByUserId = async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ message: "user_id is required" });

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const filter = req.query.filter || 'all'; // all, borrowed, returned

        // สร้าง WHERE clause ตาม filter
        let statusCondition = '';
        if (filter === 'borrowed') {
            statusCondition = "AND bi.status != 'Returned'";
        } else if (filter === 'returned') {
            statusCondition = "AND bi.status = 'Returned'";
        }

        // นับจำนวนทั้งหมด
        const countQuery = `
            SELECT COUNT(*) as total
            FROM borrow_items bi
            JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
            WHERE bt.user_id = ? ${statusCondition}
        `;
        const [countResult] = await promisePool.query(countQuery, [user_id]);
        const totalCount = countResult[0].total;
        const totalPages = Math.ceil(totalCount / limit);

        // ดึงข้อมูลตาม pagination
        const query = `
            SELECT bi.item_id, e.equipment_name, bi.quantity, bt.borrow_date, bi.returned_at, bi.status
            FROM borrow_items bi
            JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
            JOIN equipment e ON bi.equipment_id = e.equipment_id
            WHERE bt.user_id = ? ${statusCondition}
            ORDER BY bt.borrow_date DESC
            LIMIT ? OFFSET ?
        `;
        const [results] = await promisePool.query(query, [user_id, limit, offset]);

        // Format date to Thai locale
        const formattedResults = results.map(record => ({
            ...record,
            borrow_date: record.borrow_date ? new Date(record.borrow_date).toLocaleString("th-TH", {
                timeZone: "Asia/Bangkok",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }) : null,
            returned_at: record.returned_at ? new Date(record.returned_at).toLocaleString("th-TH", {
                timeZone: "Asia/Bangkok",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }) : null,
        }));

        res.status(200).json({
            history: formattedResults,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit
            }
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// =========================
// 2. เพิ่มบันทึกการยืม (Add Borrow)
// =========================
exports.addBorrow = async (req, res) => {
    const { user_id, items } = req.body; // items: array ของอุปกรณ์ที่ยืม
    if (!user_id || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Missing or invalid required fields" });
    }

    let connection;
    try {
        connection = await promisePool.getConnection();
        await connection.beginTransaction();

        // 1. สร้าง transaction เดียวใน table borrow_transactions
        const insertTransactionQuery = `INSERT INTO borrow_transactions (user_id) VALUES (?)`;
        const [transactionResult] = await connection.query(insertTransactionQuery, [user_id]);
        const transaction_id = transactionResult.insertId;

        // 2. บันทึกข้อมูลใน borrow_items ด้วย batch insert
        const insertItemQuery = `
      INSERT INTO borrow_items (transaction_id, equipment_id, quantity)
      VALUES ?
    `;
        const borrowData = items.map(({ equipment_id, quantity }) => [
            transaction_id,
            equipment_id,
            quantity,
        ]);
        await connection.query(insertItemQuery, [borrowData]);

        // 3. ตรวจสอบและอัปเดตจำนวนอุปกรณ์ในตาราง equipment
        const checkEquipmentQuery = `SELECT available_quantity FROM equipment WHERE equipment_id = ?`;
        const updateEquipmentQuery = `
      UPDATE equipment
      SET available_quantity = available_quantity - ?
      WHERE equipment_id = ? AND available_quantity >= ?
    `;
        for (const { equipment_id, quantity } of items) {
            // ตรวจสอบว่ามีอุปกรณ์นี้อยู่หรือไม่
            const [equipmentResult] = await connection.query(checkEquipmentQuery, [equipment_id]);
            if (equipmentResult.length === 0) {
                throw new Error(`Equipment with id ${equipment_id} not found`);
            }
            // ตรวจสอบจำนวนอุปกรณ์เพียงพอหรือไม่
            if (equipmentResult[0].available_quantity < quantity) {
                throw new Error(`Insufficient quantity for equipment id ${equipment_id}`);
            }
            // อัปเดตจำนวนอุปกรณ์
            const [updateResult] = await connection.query(updateEquipmentQuery, [
                quantity,
                equipment_id,
                quantity,
            ]);
            if (updateResult.affectedRows === 0) {
                throw new Error(`Failed to update equipment id ${equipment_id}`);
            }
        }

        // 4. ดึงข้อมูลนักศึกษาและข้อมูลการยืมที่เกี่ยวข้อง
        const selectUserQuery = `
      SELECT u.student_name, u.student_id, u.phone, bt.borrow_date
      FROM users u
      JOIN borrow_transactions bt ON u.user_id = bt.user_id
      WHERE bt.transaction_id = ?
    `;
        const [userResult] = await connection.query(selectUserQuery, [transaction_id]);
        if (userResult.length === 0) throw new Error("User not found");

        const selectItemsQuery = `
      SELECT bi.item_id, bi.quantity, e.equipment_name, e.equipment_id
      FROM borrow_items bi
      JOIN equipment e ON bi.equipment_id = e.equipment_id
      WHERE bi.transaction_id = ?
    `;
        const [itemsResult] = await connection.query(selectItemsQuery, [transaction_id]);
        if (itemsResult.length === 0) throw new Error("Borrow items not found");

        // 5. จัดรูปแบบข้อมูลสำหรับ response
        const responseData = {
            transaction_id,
            borrow_date: userResult[0].borrow_date,
            return_date: null,
            user_id,
            student_name: userResult[0].student_name,
            borrow_items: itemsResult.map(item => ({
                item_id: item.item_id,
                quantity: item.quantity,
                equipment_name: item.equipment_name,
                status: "Borrowed",
                image_return: null,
            })),
        };

        // ยืนยัน Transaction
        await connection.commit();

        // 6. แปลงวันที่ให้เป็นรูปแบบไทย (สำหรับแจ้งเตือน)
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
        itemsResult.forEach(item => {
            message += `- 🧰 อุปกรณ์: ${item.equipment_name} (${item.quantity} ชิ้น)\n`;
        });

        // ส่งแจ้งเตือนผ่าน LINE (นอก Transaction)
        lineNotify.sendMessage(message).catch(err => console.error("Error sending LINE notification:", err));

        res.status(201).json(responseData);
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error adding borrow:", error);
        res.status(500).json({ message: "Error adding borrow", error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

// =========================
// 3. อัปเดตสถานะการคืนอุปกรณ์ (Update Return Status)
// =========================
exports.updateReturnStatus = async (req, res) => {
    const { item_id } = req.params;
    const { status } = req.body;
    const image_return = req.file?.filename || null;

    if (!item_id) {
        return res.status(400).json({ message: "Missing required item_id" });
    }

    let connection;
    try {
        connection = await promisePool.getConnection();
        await connection.beginTransaction();

        // ดึงข้อมูลการยืมที่ต้องการอัปเดต
        const [items] = await connection.query(
            `SELECT bi.equipment_id, bi.quantity, bi.transaction_id 
       FROM borrow_items bi WHERE bi.item_id = ?`,
            [item_id]
        );
        if (!items.length) throw new Error("Borrow item not found");
        const { equipment_id, quantity, transaction_id } = items[0];

        // อัปเดตสถานะการคืน
        const updateBorrowQuery = `
      UPDATE borrow_items
      SET returned_at = ?, status = ?, image_return = ?
      WHERE item_id = ?
    `;
        const updatedStatus = status ? status : "Returned";
        const [updateResult] = await connection.query(updateBorrowQuery, [
            new Date(),
            updatedStatus,
            image_return,
            item_id,
        ]);
        if (updateResult.affectedRows === 0) throw new Error("Failed to update borrow item");

        // คืนจำนวนอุปกรณ์กลับไปในตาราง equipment
        const restoreQuery = `
      UPDATE equipment
      SET available_quantity = available_quantity + ?
      WHERE equipment_id = ?
    `;
        await connection.query(restoreQuery, [quantity, equipment_id]);

        // อัปเดตสถานะ transaction
        // ตรวจสอบว่าทุก items คืนครบหรือยัง
        const [remainingItems] = await connection.query(
            `SELECT COUNT(*) as count FROM borrow_items WHERE transaction_id = ? AND status = 'Borrowed'`,
            [transaction_id]
        );

        let transactionStatus = 'Borrowing';
        if (remainingItems[0].count === 0) {
            transactionStatus = 'Completed';
            // อัปเดต return_date ใน transaction
            await connection.query(
                `UPDATE borrow_transactions SET status = ?, return_date = ? WHERE transaction_id = ?`,
                [transactionStatus, new Date(), transaction_id]
            );
        } else {
            // ตรวจสอบว่ามีการคืนบางส่วนหรือไม่
            const [returnedItems] = await connection.query(
                `SELECT COUNT(*) as count FROM borrow_items WHERE transaction_id = ? AND status = 'Returned'`,
                [transaction_id]
            );
            if (returnedItems[0].count > 0) {
                transactionStatus = 'Partially_Returned';
                await connection.query(
                    `UPDATE borrow_transactions SET status = ? WHERE transaction_id = ?`,
                    [transactionStatus, transaction_id]
                );
            }
        }

        await connection.commit();

        // ปล่อย connection ทันทีหลัง commit เพื่อให้ผู้อื่นใช้งานได้
        connection.release();
        connection = null;

        // ดึงข้อมูลสำหรับแจ้งเตือน LINE (ใช้ promisePool แทน connection เดิมที่ถูก release ไปแล้ว)
        const selectReturnQuery = `
      SELECT u.student_name, u.phone, e.equipment_name, bi.returned_at, bi.status, bi.quantity
      FROM borrow_items bi
      JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
      JOIN users u ON bt.user_id = u.user_id
      JOIN equipment e ON bi.equipment_id = e.equipment_id
      WHERE bi.item_id = ?
    `;
        const [userResult] = await promisePool.query(selectReturnQuery, [item_id]);
        if (userResult.length) {
            const { student_name, phone, equipment_name, returned_at, status: borrow_status, quantity: returned_quantity } = userResult[0];
            const thai_return_date = new Date(returned_at).toLocaleString("th-TH", {
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
- 🔄 จำนวนที่คืน: ${returned_quantity} ชิ้น
- ✅ สถานะ: ${borrow_status}`;

            const imageUrl = image_return ? `${process.env.API_URL}/image_return/${image_return}` : null;
            lineNotify.sendMessage(message, imageUrl).catch(lineError =>
                console.error("Error sending LINE notification:", lineError)
            );
        }

        res.status(200).json({ message: "Return status updated successfully" });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error updating return status:", error);
        res.status(500).json({ message: "Error updating return status", error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

// =========================
// 4. ดึงข้อมูลการยืมทั้งหมด (Get All Borrows - with Pagination)
// =========================
exports.getAllBorrows = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const exportAll = req.query.exportAll === 'true'; // สำหรับ PDF Export
        const month = req.query.month; // 0-11
        const year = req.query.year;

        // สร้าง WHERE clause สำหรับ filter ตาม month/year
        let whereClause = '';
        let queryParams = [];

        if (month !== undefined && month !== '' && year) {
            const monthNum = parseInt(month);
            const yearNum = parseInt(year);
            whereClause = 'WHERE MONTH(bt.borrow_date) = ? AND YEAR(bt.borrow_date) = ?';
            queryParams = [monthNum + 1, yearNum]; // MySQL MONTH() returns 1-12
        }

        // นับจำนวน transactions ทั้งหมด
        const countQuery = `
            SELECT COUNT(DISTINCT bt.transaction_id) as total
            FROM borrow_transactions bt
            ${whereClause}
        `;
        const [countResult] = await promisePool.query(countQuery, queryParams);
        const totalCount = countResult[0].total;
        const totalPages = Math.ceil(totalCount / limit);

        // ดึงข้อมูล - ถ้า exportAll จะไม่ใช้ LIMIT/OFFSET
        let dataQuery = `
            SELECT 
                bt.transaction_id, 
                bt.borrow_date, 
                bt.user_id, 
                bt.status AS transaction_status,
                u.student_name,
                u.student_id,
                bi.item_id, 
                bi.returned_at, 
                bi.quantity, 
                e.equipment_name, 
                bi.status, 
                bi.image_return
            FROM borrow_transactions bt
            JOIN users u ON bt.user_id = u.user_id
            JOIN borrow_items bi ON bt.transaction_id = bi.transaction_id
            JOIN equipment e ON bi.equipment_id = e.equipment_id
            ${whereClause}
            ORDER BY bt.borrow_date DESC
        `;

        let dataParams = [...queryParams];

        if (!exportAll) {
            // ต้อง pagination ที่ระดับ transaction ไม่ใช่ row
            // ดึง transaction_ids ก่อน แล้วค่อยดึง items
            const transactionIdsQuery = `
                SELECT DISTINCT bt.transaction_id, bt.borrow_date
                FROM borrow_transactions bt
                ${whereClause}
                ORDER BY bt.borrow_date DESC
                LIMIT ? OFFSET ?
            `;
            const [transactionIds] = await promisePool.query(transactionIdsQuery, [...queryParams, limit, offset]);

            if (transactionIds.length === 0) {
                return res.json({
                    borrow_transactions: [],
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalCount,
                        limit
                    }
                });
            }

            const ids = transactionIds.map(t => t.transaction_id);
            dataQuery = `
                SELECT 
                    bt.transaction_id, 
                    bt.borrow_date, 
                    bt.user_id, 
                    bt.status AS transaction_status,
                    u.student_name,
                    u.student_id,
                    bi.item_id, 
                    bi.returned_at, 
                    bi.quantity, 
                    e.equipment_name, 
                    bi.status, 
                    bi.image_return
                FROM borrow_transactions bt
                JOIN users u ON bt.user_id = u.user_id
                JOIN borrow_items bi ON bt.transaction_id = bi.transaction_id
                JOIN equipment e ON bi.equipment_id = e.equipment_id
                WHERE bt.transaction_id IN (${ids.map(() => '?').join(',')})
                ORDER BY bt.borrow_date DESC
            `;
            dataParams = ids;
        }

        const [rows] = await promisePool.query(dataQuery, dataParams);

        // รวมข้อมูลให้เป็นรูปแบบ transaction เดียวโดยมี borrow_items เป็น Array
        const transactionsMap = {};
        rows.forEach(row => {
            if (!transactionsMap[row.transaction_id]) {
                transactionsMap[row.transaction_id] = {
                    transaction_id: row.transaction_id,
                    borrow_date: row.borrow_date,
                    return_date: row.returned_at,
                    user_id: row.user_id,
                    student_name: row.student_name,
                    student_id: row.student_id,
                    transaction_status: row.transaction_status,
                    borrow_items: [],
                };
            }
            transactionsMap[row.transaction_id].borrow_items.push({
                item_id: row.item_id,
                quantity: row.quantity,
                equipment_name: row.equipment_name,
                status: row.status,
                image_return: row.image_return,
                returned_at: row.returned_at,
            });
        });

        const borrowTransactions = Object.values(transactionsMap);

        // Sort by borrow_date descending
        borrowTransactions.sort((a, b) => new Date(b.borrow_date) - new Date(a.borrow_date));

        res.json({
            borrow_transactions: borrowTransactions,
            pagination: exportAll ? null : {
                currentPage: page,
                totalPages,
                totalCount,
                limit
            }
        });
    } catch (error) {
        console.error("Error fetching borrows:", error);
        res.status(500).json({ message: "Error fetching borrows", error: error.message });
    }
};

// =========================
// 5. ดึงข้อมูลการยืมของผู้ใช้ตาม user_id
// =========================
exports.getBorrowsByUserId = async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        // นับจำนวนสถานะ 'Borrowed'
        const countQuery = `
      SELECT COUNT(CASE WHEN bi.status = 'Borrowed' THEN 1 END) AS borrowed_count
      FROM borrow_items bi
      JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
      WHERE bt.user_id = ? AND bi.status = 'Borrowed' 
    `;
        const [countResults] = await promisePool.query(countQuery, [user_id]);

        // ดึงข้อมูลบันทึกการยืม
        const borrowQuery = `
      SELECT 
        e.equipment_id,
        e.image,
        e.equipment_name,
        bt.borrow_date,
        bi.status,
        bi.quantity,
        bi.item_id
      FROM borrow_items bi
      JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
      JOIN equipment e ON bi.equipment_id = e.equipment_id
      WHERE bt.user_id = ?
      ORDER BY bt.borrow_date DESC
    `;
        const [borrowResults] = await promisePool.query(borrowQuery, [user_id]);

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
                borrow_items: formattedBorrowResults,
            },
        });
    } catch (error) {
        console.error("Error fetching borrows by user:", error);
        res.status(500).json({ message: "An error occurred while fetching borrow records", error: error.message });
    }
};

// =========================
// 6. ลบรายการยืม (Delete Borrow Item)
// =========================
exports.deleteBorrowItem = async (req, res) => {
    const { item_id } = req.params;
    if (!item_id) {
        return res.status(400).json({ message: "Missing required item_id" });
    }

    let connection;
    try {
        connection = await promisePool.getConnection();
        await connection.beginTransaction();

        // ดึงข้อมูล borrow item ที่ต้องการลบ
        const [items] = await connection.query(
            `SELECT equipment_id, quantity, status FROM borrow_items WHERE item_id = ?`,
            [item_id]
        );
        if (!items.length) throw new Error("Borrow item not found");
        const { equipment_id, quantity, status } = items[0];

        // ลบรายการยืม
        const deleteQuery = `DELETE FROM borrow_items WHERE item_id = ?`;
        const [deleteResult] = await connection.query(deleteQuery, [item_id]);
        if (deleteResult.affectedRows === 0) throw new Error("Failed to delete borrow item");

        // ถ้ายังไม่คืน ให้คืนจำนวนอุปกรณ์กลับไปในตาราง equipment
        if (status === 'Borrowed') {
            const updateQuery = `
        UPDATE equipment
        SET available_quantity = available_quantity + ?
        WHERE equipment_id = ?
      `;
            await connection.query(updateQuery, [quantity, equipment_id]);
        }

        await connection.commit();
        res.status(200).json({ message: "Borrow item deleted successfully" });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error deleting borrow item:", error);
        res.status(500).json({ message: "Error deleting borrow item", error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

// =========================
// 7. ดึงข้อมูลการยืมตาม transaction_id
// =========================
exports.getBorrowsByTransactionId = async (req, res) => {
    const { transaction_id } = req.params;
    if (!transaction_id) return res.status(400).json({ message: "Transaction ID is required" });

    try {
        const query = `
      SELECT bi.item_id, bt.transaction_id, u.student_id, u.student_name, u.student_email, 
             u.phone, u.year_of_study,
             e.equipment_name, bt.borrow_date, bi.returned_at, 
             bi.status, bi.quantity, bi.image_return
      FROM borrow_items bi
      JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
      JOIN users u ON bt.user_id = u.user_id
      JOIN equipment e ON bi.equipment_id = e.equipment_id
      WHERE bt.transaction_id = ?
      ORDER BY bi.item_id ASC
    `;
        const [borrowResults] = await promisePool.query(query, [transaction_id]);
        if (!borrowResults.length) {
            return res.status(404).json({ message: "No borrow items found for this transaction" });
        }

        res.status(200).json(borrowResults);
    } catch (error) {
        console.error("Error fetching borrows by transaction ID:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// =========================
// 8. ดึงข้อมูลการยืมตาม item_id
// =========================
exports.getBorrowByItemId = async (req, res) => {
    const { item_id } = req.params;
    if (!item_id) return res.status(400).json({ message: "Item ID is required" });

    try {
        const query = `
      SELECT bi.item_id, u.student_id, u.student_name, u.student_email, 
             e.equipment_name, bt.borrow_date, bi.returned_at, 
             bi.status, bi.quantity, bi.image_return
      FROM borrow_items bi
      JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
      JOIN users u ON bt.user_id = u.user_id
      JOIN equipment e ON bi.equipment_id = e.equipment_id
      WHERE bi.item_id = ?
    `;
        const [borrowResults] = await promisePool.query(query, [item_id]);
        if (!borrowResults.length) {
            return res.status(404).json({ message: "No borrow item found" });
        }

        const borrowed_count = borrowResults.reduce(
            (total, record) => total + (record.quantity || 0),
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
            borrow_items: formattedResults,
        });
    } catch (error) {
        console.error("Error fetching borrow item by ID:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// =========================
// 9. ดึงรายการคืนอุปกรณ์ (Get Returned Items - Paginated)
// =========================
exports.getReturnedItems = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const offset = (page - 1) * limit;

        // นับจำนวน transactions ที่คืนครบทุก item
        const countQuery = `
            SELECT COUNT(DISTINCT bt.transaction_id) as total
            FROM borrow_transactions bt
            WHERE NOT EXISTS (
                SELECT 1 FROM borrow_items bi 
                WHERE bi.transaction_id = bt.transaction_id 
                AND bi.status != 'Returned'
            )
            AND EXISTS (
                SELECT 1 FROM borrow_items bi2 
                WHERE bi2.transaction_id = bt.transaction_id
            )
        `;
        const [countResult] = await promisePool.query(countQuery);
        const totalCount = countResult[0].total;
        const totalPages = Math.ceil(totalCount / limit);

        // ดึง transaction_ids ที่คืนครบแล้ว (paginated)
        const transactionIdsQuery = `
            SELECT DISTINCT bt.transaction_id, (
                SELECT MAX(bi3.returned_at) FROM borrow_items bi3 
                WHERE bi3.transaction_id = bt.transaction_id
            ) AS max_returned_at
            FROM borrow_transactions bt
            WHERE NOT EXISTS (
                SELECT 1 FROM borrow_items bi 
                WHERE bi.transaction_id = bt.transaction_id 
                AND bi.status != 'Returned'
            )
            AND EXISTS (
                SELECT 1 FROM borrow_items bi2 
                WHERE bi2.transaction_id = bt.transaction_id
            )
            ORDER BY max_returned_at DESC
            LIMIT ? OFFSET ?
        `;
        const [transactionIds] = await promisePool.query(transactionIdsQuery, [limit, offset]);

        if (transactionIds.length === 0) {
            return res.status(200).json({
                returned_items: [],
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    limit
                }
            });
        }

        // ดึงข้อมูลรายละเอียดของ transactions เหล่านั้น
        const ids = transactionIds.map(t => t.transaction_id);
        const dataQuery = `
            SELECT 
                bt.transaction_id,
                u.student_name,
                bi.item_id,
                e.equipment_name,
                bi.quantity,
                bi.status,
                bi.image_return,
                bi.returned_at
            FROM borrow_transactions bt
            JOIN users u ON bt.user_id = u.user_id
            JOIN borrow_items bi ON bt.transaction_id = bi.transaction_id
            JOIN equipment e ON bi.equipment_id = e.equipment_id
            WHERE bt.transaction_id IN (${ids.map(() => '?').join(',')})
            ORDER BY bi.returned_at DESC
        `;
        const [rows] = await promisePool.query(dataQuery, ids);

        // จัดกลุ่มตาม transaction_id
        const groupedData = {};
        rows.forEach(row => {
            if (!groupedData[row.transaction_id]) {
                groupedData[row.transaction_id] = {
                    transaction_id: row.transaction_id,
                    student_name: row.student_name,
                    items: []
                };
            }
            groupedData[row.transaction_id].items.push({
                item_id: row.item_id,
                equipment_name: row.equipment_name,
                quantity: row.quantity,
                status: row.status,
                image_return: row.image_return,
                returned_at: row.returned_at
            });
        });

        res.status(200).json({
            returned_items: Object.values(groupedData),
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                limit
            }
        });
    } catch (error) {
        console.error("Error fetching returned items:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
