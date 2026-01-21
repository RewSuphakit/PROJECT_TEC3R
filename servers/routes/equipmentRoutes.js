const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { upload, compressImage } = require('../middleware/upload');
const authenticate = require('../middleware/authenticate');

// ======= PUBLIC ENDPOINT (ไม่ต้อง login) =======
router.get('/public', equipmentController.getPublicEquipment);  // สำหรับ Guest - ดูอุปกรณ์ที่ Available

// ======= PROTECTED ENDPOINTS (ต้อง login) =======
router.post('/equipment', authenticate, upload.single('image'), compressImage, equipmentController.addEquipment);  // เพิ่มอุปกรณ์
router.get('/equipment', authenticate, equipmentController.getAllEquipment);  // ดึงข้อมูลอุปกรณ์ทั้งหมด
router.get('/equipment/:id', authenticate, equipmentController.getEquipmentById);  // ดึงข้อมูลอุปกรณ์ตาม ID
router.put('/equipment/:id', authenticate, upload.single('image'), compressImage, equipmentController.updateEquipment);  // อัพเดตข้อมูลอุปกรณ์
router.delete('/equipment/:id', authenticate, equipmentController.deleteEquipment);  // ลบอุปกรณ์
router.put('/equipment/:id/status', authenticate, equipmentController.updateEquipmentStatus);  // อัพเดตสถานะอุปกรณ์

module.exports = router;
