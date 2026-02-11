const express = require('express');
const router = express.Router();
const StatsSectionController = require('../controllers/StatsSectionController');
const authenticate = require('../middleware/authenticate');

// สถิติและรายงาน
router.get('/stats', StatsSectionController.getStats);  // ดึงข้อมูลสถิติ - public (ไม่ต้อง login)
router.get('/top-borrowed', StatsSectionController.getTopBorrowedEquipment);  // ดึงข้อมูลอุปกรณ์ที่ยืมเยอะสุด - public
router.get('/reports', authenticate, StatsSectionController.getReports);  // ดึงข้อมูลรายงาน
router.get('/reports/:transaction_id', authenticate, StatsSectionController.getReportDetails);  // ดึงข้อมูลรายงานแต่ละรายการ

module.exports = router;   