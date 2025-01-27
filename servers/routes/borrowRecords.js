const express = require('express');
const router = express.Router();
const borrowRecordsController = require('../controllers/borrow_recordsController');
const { upload, compressImage } = require('../middleware/upload_borrow');
const { upload_return, compressImage_return } = require('../middleware/upload_return');
router.post('/add', upload.single('image'),compressImage,borrowRecordsController.addBorrowRecord);
router.put('/update/:record_id',upload_return.single('image_return'),compressImage_return, borrowRecordsController.updateReturnStatus);
router.get('/all', borrowRecordsController.getAllBorrowRecords);
router.get('/all/:user_id', borrowRecordsController.getAllBorrowRecordsByUserId);
router.delete('/delete/:record_id', borrowRecordsController.deleteBorrowRecord);

module.exports = router;
