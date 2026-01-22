const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/db');  // เชื่อมต่อกับฐานข้อมูล
const sharp = require('sharp');

// เพิ่มอุปกรณ์
exports.addEquipment = (req, res) => {
  const { equipment_name, quantity } = req.body;
  const image = req.file ? req.file.filename : '';  // ใช้ไฟล์ที่อัพโหลดหรือค่าว่าง

  const query = 'INSERT INTO equipment (equipment_name,  quantity, image) VALUES (?, ?, ?)';
  pool.query(query, [equipment_name, quantity, image], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(201).json({ message: 'Equipment added successfully', equipment_id: result.insertId });
  });
};

// ดึงข้อมูลอุปกรณ์ทั้งหมด (ต้อง login)
exports.getAllEquipment = (req, res) => {
  const query = 'SELECT * FROM equipment';
  pool.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(200).json({ equipment: results });
  });
};

// ดึงข้อมูลอุปกรณ์สำหรับ Public (ไม่ต้อง login) - เฉพาะอุปกรณ์ที่ Available
exports.getPublicEquipment = (req, res) => {
  const query = 'SELECT equipment_id, equipment_name, quantity, image, status, timeupdate FROM equipment WHERE status = ?';
  pool.query(query, ['Available'], (err, results) => {
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
  pool.query(query, [id], (err, results) => {
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
  pool.query(query, [status, id], (err, results) => {
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
  const { equipment_name, quantity } = req.body;
  const newImage = req.file ? req.file.filename : null;

  const query = 'SELECT * FROM equipment WHERE equipment_id = ?';
  pool.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const oldImage = results[0].image;

    // ถ้ามีการอัปโหลดไฟล์ใหม่ ให้ลบรูปเก่า
    if (newImage && oldImage) {
      const filePath = path.join(__dirname, '..', 'uploads', oldImage);
      fs.access(filePath)
        .then(() => fs.unlink(filePath))
        .then(() => console.log('Old image deleted successfully'))
        .catch((err) => {
          if (err.code === 'ENOENT') {
            console.log('File does not exist, skipping deletion.');
          } else {
            console.error('Error deleting old image:', err);
          }
        });
    }

    // ใช้รูปเดิมถ้าไม่มีการอัปโหลดใหม่
    const updatedImage = newImage || oldImage;

    const updateQuery = `
      UPDATE equipment
      SET equipment_name = ?,  quantity = ?, image = ?
      WHERE equipment_id = ?
    `;
    pool.query(updateQuery, [equipment_name, quantity, updatedImage, id], (err, results) => {
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

  pool.query(query, [id], (err, results) => {
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
    pool.query(deleteQuery, [id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.status(200).json({ message: 'Equipment deleted successfully' });
    });
  });
};
