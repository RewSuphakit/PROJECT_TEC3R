const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/db');  // เชื่อมต่อกับฐานข้อมูล
const sharp = require('sharp');

// เพิ่มอุปกรณ์
exports.addEquipment = (req, res) => {
  const { equipment_name, total_quantity } = req.body;
  const image = req.file ? req.file.filename : '';
  const available_quantity = total_quantity || 0;

  const query = 'INSERT INTO equipment (equipment_name, total_quantity, available_quantity, image) VALUES (?, ?, ?, ?)';
  pool.query(query, [equipment_name, total_quantity, available_quantity, image], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.status(201).json({ message: 'Equipment added successfully', equipment_id: result.insertId });
  });
};

// ดึงข้อมูลอุปกรณ์ทั้งหมด (ต้อง login)
exports.getAllEquipment = (req, res) => {
  const query = 'SELECT equipment_id, equipment_name, total_quantity, available_quantity, status, image, created_at, updated_at FROM equipment';
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
  const query = 'SELECT equipment_id, equipment_name, total_quantity, available_quantity, image, status, updated_at FROM equipment WHERE status = ? AND available_quantity > 0';
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

// อัปเดตสถานะของอุปกรณ์ (เฉพาะ status)
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
  const { equipment_name, total_quantity } = req.body;
  const newImage = req.file ? req.file.filename : null;

  const query = 'SELECT * FROM equipment WHERE equipment_id = ?';
  pool.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const oldEquipment = results[0];
    const oldImage = oldEquipment.image;
    const oldTotalQuantity = oldEquipment.total_quantity;

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

    // คำนวณ available_quantity ใหม่
    // ถ้า total_quantity เปลี่ยน ให้ปรับ available_quantity ตามส่วนต่าง
    const newTotalQuantity = parseInt(total_quantity) || oldTotalQuantity;
    const quantityDiff = newTotalQuantity - oldTotalQuantity;
    const newAvailableQuantity = Math.max(0, oldEquipment.available_quantity + quantityDiff);

    const updateQuery = `
      UPDATE equipment
      SET equipment_name = ?, total_quantity = ?, available_quantity = ?, image = ?
      WHERE equipment_id = ?
    `;
    pool.query(updateQuery, [equipment_name, newTotalQuantity, newAvailableQuantity, updatedImage, id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(200).json({ message: 'Equipment updated successfully' });
    });
  });
};

// ลบอุปกรณ์
exports.deleteEquipment = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM equipment WHERE equipment_id = ?';

  pool.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const oldImage = results[0].image;

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
