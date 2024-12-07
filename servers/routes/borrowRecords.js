const express = require('express');
const router = express.Router();
const borrowRecordsController = require('../controllers/borrow_recordsController');

router.post('/add', borrowRecordsController.addBorrowRecord);
router.put('/update/:record_id', borrowRecordsController.updateReturnStatus);
router.get('/all', borrowRecordsController.getAllBorrowRecords);
router.delete('/delete/:record_id', borrowRecordsController.deleteBorrowRecord);

module.exports = router;
