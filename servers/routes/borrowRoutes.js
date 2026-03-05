const express = require('express');
const router = express.Router();
const borrowItemsController = require('../controllers/borrowItemsController');
const { upload_return, compressImage_return } = require('../middleware/upload');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');

// เพิ่มการยืม
router.post('/add', authenticate, borrowItemsController.addBorrow);

// อัพเดตการคืน (admin only)
router.put('/update/:item_id', authenticate, requireAdmin, upload_return.single('image_return'), compressImage_return, borrowItemsController.updateReturnStatus);

// ดูการยืมทั้งหมด (admin only)
router.get('/all', authenticate, requireAdmin, borrowItemsController.getAllBorrows);

// ดูการยืมของ user
router.get('/all/:user_id', authenticate, borrowItemsController.getBorrowsByUserId);

// ดูประวัติการยืม
router.get('/history/:user_id', authenticate, borrowItemsController.getHistoryByUserId);

// ลบรายการยืม (admin only)
router.delete('/delete/:item_id', authenticate, requireAdmin, borrowItemsController.deleteBorrowItem);

// ดูรายละเอียด transaction
router.get('/transaction/:transaction_id', authenticate, borrowItemsController.getBorrowsByTransactionId);

// ดูรายละเอียด item
router.get('/item/:item_id', authenticate, borrowItemsController.getBorrowByItemId);

// ดูรายการที่คืนแล้ว (paginated, admin only)
router.get('/returned', authenticate, requireAdmin, borrowItemsController.getReturnedItems);

module.exports = router;
