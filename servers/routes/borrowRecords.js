const express = require('express');
const router = express.Router();
const borrowRecordsController = require('../controllers/borrow_recordsController');
const { upload, compressImage } = require('../middleware/upload_borrow');
router.post('/add', upload.single('image'),compressImage,borrowRecordsController.addBorrowRecord);
router.put('/update/:record_id', borrowRecordsController.updateReturnStatus);
router.get('/all', borrowRecordsController.getAllBorrowRecords);
router.delete('/delete/:record_id', borrowRecordsController.deleteBorrowRecord);

module.exports = router;
