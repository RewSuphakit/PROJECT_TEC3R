const express = require('express');
const router = express.Router();
const borrowRecordsController = require('../controllers/borrow_recordsController');
const { upload_return, compressImage_return } = require('../middleware/upload_return');
const authenticate = require('../middleware/authenticate');


router.post('/add', authenticate, borrowRecordsController.addBorrowRecord);  // เพิ่มการยืม
router.put('/update/:record_id', authenticate, upload_return.single('image_return'), compressImage_return, borrowRecordsController.updateReturnStatus);  // อัพเดตการคืน
router.get('/all', authenticate, borrowRecordsController.getAllBorrowRecords);  // ดูการยืมทั้งหมด
router.get('/all/:user_id', authenticate, borrowRecordsController.getAllBorrowRecordsByUserId);  // ดูการยืมของ user
router.get('/history/:user_id', authenticate, borrowRecordsController.getHistoryByUserId);  // ดูประวัติการยืม
router.delete('/delete/:record_id', authenticate, borrowRecordsController.deleteBorrowRecord);  // ลบการยืม
router.get('/transaction/:transaction_id', authenticate, borrowRecordsController.getBorrowRecordsByTransactionId);  // ดูรายละเอียด transaction

module.exports = router;

