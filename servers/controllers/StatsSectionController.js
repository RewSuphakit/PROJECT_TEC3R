const { promisePool } = require('../config/db');
const sharp = require('sharp');


exports.getStats = async (req, res) => {
    try {
        const query = 'SELECT(SELECT COUNT(*) FROM equipment) AS total_equipment,(SELECT COUNT(*) FROM borrow_records) AS total_borrow_records,(SELECT COUNT(*) FROM users) AS total_users,(SELECT COUNT(*) FROM borrow_records WHERE status = "borrowed") AS total_borrowed,(SELECT COUNT(*) FROM borrow_records WHERE status = "returned") AS total_returned';
        const [rows] = await promisePool.query(query);
        res.json(rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}
exports.getReports = async (req, res) => {
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
        const [rows] = await promisePool.query(query);
    
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

exports.getReportDetails = async (req, res) => {
    try {
        const { transaction_id } = req.params;
        if (!transaction_id) {
            return res.status(400).json({ message: 'Transaction ID is required' });
        }
        const query = `
          SELECT
            u.student_name,
            u.year_of_study,
            u.student_email,
            u.phone,
            br.record_id,
            br.quantity_borrow,
            e.equipment_name,
            br.status,
            br.user_id,
            br.image_return,
            br.return_date,
            br.borrow_date
            FROM
            borrow_records br
            JOIN
            users u ON br.user_id = u.user_id
            JOIN equipment e ON br.equipment_id = e.equipment_id
            WHERE br.transaction_id = ?
            ORDER BY br.record_id DESC
            `;
        const [rows] = await promisePool.query(query, [transaction_id]);
        res.json({ borrow_records: rows });
    }
    catch (error) {
        console.error("Error fetching borrow records details:", error);
        res.status(500).json({ message: "Error fetching borrow records details", error: error.message });
    }
}