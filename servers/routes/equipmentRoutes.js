const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { upload, compressImage } = require('../middleware/upload');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');


router.get('/public', equipmentController.getPublicEquipment);  // สำหรับ Guest - ดูอุปกรณ์ที่ Available


router.get('/equipment', authenticate, equipmentController.getAllEquipment);  // ดึงข้อมูลอุปกรณ์ทั้งหมด
router.get('/equipment/:id', authenticate, equipmentController.getEquipmentById);  // ดึงข้อมูลอุปกรณ์ตาม ID

// ADMIN ONLY
router.post('/equipment', authenticate, requireAdmin, upload.single('image'), compressImage, equipmentController.addEquipment);  // เพิ่มอุปกรณ์
router.put('/equipment/:id', authenticate, requireAdmin, upload.single('image'), compressImage, equipmentController.updateEquipment);  // อัพเดตข้อมูลอุปกรณ์
router.delete('/equipment/:id', authenticate, requireAdmin, equipmentController.deleteEquipment);  // ลบอุปกรณ์
router.put('/equipment/:id/status', authenticate, requireAdmin, equipmentController.updateEquipmentStatus);  // อัพเดตสถานะอุปกรณ์

module.exports = router;
