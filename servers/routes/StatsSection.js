const express = require('express');
const router = express.Router();
const StatsSectionController = require('../controllers/StatsSectionController');

router.get('/stats',StatsSectionController.getStats); // ดึงข้อมูลสถิติ
router.get('/reports',StatsSectionController.getReports); // ดึงข้อมูลรายงาน
router.get('/reports/:transaction_id',StatsSectionController.getReportDetails); // ดึงข้อมูลรายงานแต่ละรายการ
module.exports = router;   