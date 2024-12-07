const fs = require('fs').promises;
const path = require('path');
const connection = require('../config/db');  // เชื่อมต่อกับฐานข้อมูล
const sharp = require('sharp');

// เพิ่มอุปกรณ์
exports.addEquipment = (req, res) => {
  const { equipment_name, description, quantity, available_quantity, status } = req.body;
  const image = req.file.filename;  // ใช้ไฟล์ที่อัพโหลดหรือค่าว่าง

  const query = 'INSERT INTO equipment (equipment_name, description, quantity, available_quantity, status, image) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [equipment_name, description, quantity, available_quantity, status, image], (err, result) => {
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

// อัพเดตข้อมูลอุปกรณ์
exports.updateEquipment = (req, res) => {
  const { id } = req.params;
  const { equipment_name, description, quantity, available_quantity, status } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';  // ใช้ไฟล์ใหม่หรือค่าว่าง

  // ดึงข้อมูลอุปกรณ์เดิมจากฐานข้อมูล
  const query = 'SELECT * FROM equipment WHERE equipment_id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const oldImage = results[0].image; // เก็บชื่อไฟล์เก่าไว้

    // ถ้ามีการอัพเดตไฟล์ภาพ (ไฟล์ใหม่ที่อัพโหลด)
    if (image && oldImage) {
      // ลบไฟล์ภาพเก่า (หากมีไฟล์เก่า)
      const filePath = path.join(__dirname, '..', oldImage); // คำนวณเส้นทางไฟล์เก่า
      fs.unlink(filePath)
        .then(() => {
          console.log('Old image deleted successfully');
        })
        .catch((err) => {
          console.error('Error deleting old image:', err);
        });
    }

    // อัพเดตข้อมูลอุปกรณ์
    const updateQuery = `UPDATE equipment
                         SET equipment_name = ?, description = ?, quantity = ?, available_quantity = ?, status = ?, image = ?
                         WHERE equipment_id = ?`;

    connection.query(updateQuery, [equipment_name, description, quantity, available_quantity, status, image, id], (err, results) => {
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
  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const oldImage = results[0].image; // เก็บชื่อไฟล์เก่าไว้

    // ลบไฟล์ภาพเก่า
    if (oldImage) {
      const filePath = path.join(__dirname, '..', oldImage);
      fs.unlink(filePath)
        .then(() => {
          console.log('Image deleted successfully');
        })
        .catch((err) => {
          console.error('Error deleting image:', err);
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
