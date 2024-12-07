const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { upload, compressImage } = require('../middleware/upload');

// เส้นทางการทำงานกับอุปกรณ์
router.post('/equipment', upload.single('image'), compressImage,equipmentController.addEquipment);  // เพิ่มอุปกรณ์
router.get('/equipment', equipmentController.getAllEquipment);  // ดึงข้อมูลอุปกรณ์ทั้งหมด
router.get('/equipment/:id', equipmentController.getEquipmentById);  // ดึงข้อมูลอุปกรณ์ตาม ID
router.put('/equipment/:id',upload.single('image'),compressImage,equipmentController.updateEquipment);  // อัพเดตข้อมูลอุปกรณ์
router.delete('/equipment/:id', equipmentController.deleteEquipment);  // ลบอุปกรณ์

module.exports = router;
