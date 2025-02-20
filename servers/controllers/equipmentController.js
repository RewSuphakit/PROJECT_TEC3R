const fs = require('fs').promises;
const path = require('path');
const connection = require('../config/db');  // เชื่อมต่อกับฐานข้อมูล
const sharp = require('sharp');

// เพิ่มอุปกรณ์
exports.addEquipment = (req, res) => {
  const { equipment_name, description, quantity } = req.body;
  const image = req.file ? req.file.filename : '';  // ใช้ไฟล์ที่อัพโหลดหรือค่าว่าง

  const query = 'INSERT INTO equipment (equipment_name, description, quantity, image) VALUES (?, ?, ?, ?)';
  connection.query(query, [equipment_name, description, quantity, image], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(201).json({ message: 'Equipment added successfully', equipment_id: result.insertId });
  });
};

// ดึงข้อมูลอุปกรณ์ทั้งหมด
exports.getAllEquipment = (req, res) => {
  const query = 'SELECT * FROM equipment';
  connection.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json({ equipment: results });
  });
};

// ดึงข้อมูลอุปกรณ์ตาม ID
exports.getEquipmentById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM equipment WHERE equipment_id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.status(200).json({ equipment: results[0] });
  });
};
exports.updateEquipmentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const query = 'UPDATE equipment SET status = ? WHERE equipment_id = ?';
  connection.query(query, [status, id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.status(200).json({
      message: 'Equipment status updated successfully',
      equipment: { equipment_id: id, status }
    });
  });
};
// อัปเดตข้อมูลอุปกรณ์ (รวมการอัปเดตไฟล์ภาพ)
exports.updateEquipment = (req, res) => {
  const { id } = req.params;
  const { equipment_name, description, quantity } = req.body;
  const image = req.file ? req.file.filename : '';

  // ดึงข้อมูลอุปกรณ์เดิมจากฐานข้อมูล
  const query = 'SELECT * FROM equipment WHERE equipment_id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const oldImage = results[0].image; // เก็บชื่อไฟล์เก่าไว้

    // ถ้ามีการอัปเดตไฟล์ภาพ (มีไฟล์ใหม่) และมีไฟล์เก่าอยู่
    if (image && oldImage) {
      const filePath = path.join(__dirname, '..', 'uploads', oldImage);
      // ใช้ fs.access ตรวจสอบว่าไฟล์มีอยู่หรือไม่
      fs.access(filePath)
        .then(() => {
          // ถ้ามีอยู่ ให้ลบไฟล์
          return fs.unlink(filePath);
        })
        .then(() => {
          console.log('Old image deleted successfully');
        })
        .catch((err) => {
          if (err.code === 'ENOENT') {
            console.log('File does not exist, skipping deletion.');
          } else {
            console.error('Error deleting old image:', err);
          }
        });
    }

    // อัปเดตข้อมูลอุปกรณ์ในฐานข้อมูล
    const updateQuery = `
      UPDATE equipment
      SET equipment_name = ?, description = ?, quantity = ?, image = ?
      WHERE equipment_id = ?
    `;
    connection.query(updateQuery, [equipment_name, description, quantity, image, id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(200).json({ message: 'Equipment updated successfully' });
    });
  });
};

// อัปเดตสถานะของอุปกรณ์ (เฉพาะ status)
// Endpoint นี้จะใช้สำหรับ toggle สถานะ โดยไม่กระทบกับข้อมูลอื่น ๆ

// ลบอุปกรณ์
exports.deleteEquipment = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM equipment WHERE equipment_id = ?';

  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const oldImage = results[0].image; // ดึงชื่อไฟล์ภาพ

    if (oldImage) {
      const filePath = path.join(__dirname, '..', 'uploads', oldImage);
      fs.access(filePath)
        .then(() => fs.unlink(filePath))
        .then(() => {
          console.log('Image deleted successfully');
        })
        .catch((err) => {
          if (err.code === 'ENOENT') {
            console.log('File does not exist, skipping deletion.');
          } else {
            console.error('Error deleting image:', err);
          }
        });
    }

    // ลบข้อมูลจากฐานข้อมูล
    const deleteQuery = 'DELETE FROM equipment WHERE equipment_id = ?';
    connection.query(deleteQuery, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.status(200).json({ message: 'Equipment deleted successfully' });
    });
  });
};
