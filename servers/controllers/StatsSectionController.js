const connection = require('../config/db');
const sharp = require('sharp');


exports.getStats = async (req, res) => {
    try {
        const query = 'SELECT(SELECT COUNT(*) FROM equipment) AS total_equipment,(SELECT COUNT(*) FROM borrow_records) AS total_borrow_records,(SELECT COUNT(*) FROM users) AS total_users,(SELECT COUNT(*) FROM borrow_records WHERE status = "borrowed") AS total_borrowed,(SELECT COUNT(*) FROM borrow_records WHERE status = "returned") AS total_returned';
        const [rows] = await connection.promise().query(query);
        res.json(rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}
