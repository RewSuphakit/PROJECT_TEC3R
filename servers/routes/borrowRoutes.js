const express = require('express');
const router = express.Router();
const borrowItemsController = require('../controllers/borrowItemsController');
const { upload_return, compressImage_return } = require('../middleware/upload_return');
const authenticate = require('../middleware/authenticate');

// เพิ่มการยืม
router.post('/add', authenticate, borrowItemsController.addBorrow);

// อัพเดตการคืน
router.put('/update/:item_id', authenticate, upload_return.single('image_return'), compressImage_return, borrowItemsController.updateReturnStatus);

// ดูการยืมทั้งหมด
router.get('/all', authenticate, borrowItemsController.getAllBorrows);

// ดูการยืมของ user
router.get('/all/:user_id', authenticate, borrowItemsController.getBorrowsByUserId);

// ดูประวัติการยืม
router.get('/history/:user_id', authenticate, borrowItemsController.getHistoryByUserId);

// ลบรายการยืม
router.delete('/delete/:item_id', authenticate, borrowItemsController.deleteBorrowItem);

// ดูรายละเอียด transaction
router.get('/transaction/:transaction_id', authenticate, borrowItemsController.getBorrowsByTransactionId);

// ดูรายละเอียด item
router.get('/item/:item_id', authenticate, borrowItemsController.getBorrowByItemId);

// ดูรายการที่คืนแล้ว (paginated)
router.get('/returned', authenticate, borrowItemsController.getReturnedItems);

module.exports = router;
