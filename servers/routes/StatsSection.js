const express = require('express');
const router = express.Router();
const StatsSectionController = require('../controllers/StatsSectionController');

router.get('/stats',StatsSectionController.getStats); // ดึงข้อมูลสถิติ
module.exports = router;   