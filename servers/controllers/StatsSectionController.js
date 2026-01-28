const { promisePool } = require('../config/db');
const sharp = require('sharp');


exports.getStats = async (req, res) => {
  try {
    const query = `
            SELECT 
                (SELECT COUNT(*) FROM equipment) AS total_equipment,
                (SELECT COUNT(*) FROM borrow_items) AS total_borrow_items,
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM borrow_items WHERE status = 'Borrowed') AS total_borrowed,
                (SELECT COUNT(*) FROM borrow_items WHERE status = 'Returned') AS total_returned
        `;
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
            bt.status AS transaction_status,
            u.student_name,
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
          ORDER BY bt.transaction_id DESC
        `;
    const [rows] = await promisePool.query(query);

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
      });
    });

    const borrowTransactions = Object.values(transactionsMap);
    res.json({ borrow_transactions: borrowTransactions });
  } catch (error) {
    console.error("Error fetching borrow items:", error);
    res.status(500).json({ message: "Error fetching borrow items", error: error.message });
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
            bi.item_id,
            bi.quantity,
            e.equipment_name,
            bi.status,
            bt.user_id,
            bi.image_return,
            bi.returned_at,
            bt.borrow_date
            FROM borrow_items bi
            JOIN borrow_transactions bt ON bi.transaction_id = bt.transaction_id
            JOIN users u ON bt.user_id = u.user_id
            JOIN equipment e ON bi.equipment_id = e.equipment_id
            WHERE bi.transaction_id = ?
            ORDER BY bi.item_id DESC
            `;
    const [rows] = await promisePool.query(query, [transaction_id]);
    res.json({ borrow_items: rows });
  }
  catch (error) {
    console.error("Error fetching borrow items details:", error);
    res.status(500).json({ message: "Error fetching borrow items details", error: error.message });
  }
}
