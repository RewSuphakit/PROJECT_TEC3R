const fs = require('fs').promises;
const path = require('path');
const { promisePool } = require('../config/db');  // เปลี่ยนมาใช้ promisePool
const sharp = require('sharp');

// เพิ่มอุปกรณ์
exports.addEquipment = async (req, res) => {
  try {
    const { equipment_name, total_quantity } = req.body;
    const trimmedName = equipment_name ? equipment_name.trim() : '';
    const image = req.file ? req.file.filename : '';
    const available_quantity = total_quantity || 0;

    // ตรวจสอบว่าชื่ออุปกรณ์ซ้ำหรือไม่ (ลบ space ก่อนเปรียบเทียบ)
    const [existingEquipment] = await promisePool.query('SELECT equipment_id FROM equipment WHERE REPLACE(equipment_name, \' \', \'\') = REPLACE(?, \' \', \'\') ', [trimmedName]);
    if (existingEquipment.length > 0) {
      return res.status(400).json({ message: 'ชื่ออุปกรณ์นี้มีอยู่ในระบบแล้ว' });
    }

    const query = 'INSERT INTO equipment (equipment_name, total_quantity, available_quantity, image) VALUES (?, ?, ?, ?)';
    const [result] = await promisePool.query(query, [trimmedName, total_quantity, available_quantity, image]);

    res.status(201).json({
      message: 'Equipment added successfully',
      equipment_id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ดึงข้อมูลอุปกรณ์ทั้งหมด (ต้อง login) - รองรับ pagination และ filters
exports.getAllEquipment = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // สร้างเงื่อนไข WHERE
    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    if (status) {
      whereClause += ' AND status = ?';
      queryParams.push(status);
    }

    if (search) {
      whereClause += ' AND equipment_name LIKE ?';
      queryParams.push(`%${search}%`);
    }

    // นับจำนวนทั้งหมด (ตาม filter)
    const [countResult] = await promisePool.query(
      `SELECT COUNT(*) as total FROM equipment ${whereClause}`,
      queryParams
    );
    const totalCount = countResult[0].total;
    const totalPages = Math.ceil(totalCount / limit);

    // ดึงข้อมูลตาม pagination - เรียงตามจำนวนการยืมจากมากไปน้อย
    const query = `
      SELECT e.equipment_id, e.equipment_name, e.total_quantity, e.available_quantity, e.status, e.image, e.created_at, e.updated_at,
             COALESCE(SUM(bi.quantity), 0) AS total_borrowed
      FROM equipment e
      LEFT JOIN borrow_items bi ON e.equipment_id = bi.equipment_id
      ${whereClause.replace(/status/g, 'e.status').replace(/equipment_name/g, 'e.equipment_name')}
      GROUP BY e.equipment_id, e.equipment_name, e.total_quantity, e.available_quantity, e.status, e.image, e.created_at, e.updated_at
      ORDER BY total_borrowed DESC, e.updated_at DESC
      LIMIT ? OFFSET ?
    `;
    const [results] = await promisePool.query(query, [...queryParams, limit, offset]);

    res.status(200).json({
      equipment: results,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ดึงข้อมูลอุปกรณ์สำหรับ Public (ไม่ต้อง login) - เฉพาะอุปกรณ์ที่ Available - รองรับ pagination
exports.getPublicEquipment = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // สร้างเงื่อนไข search
    let whereClause = 'WHERE status = ? AND available_quantity > 0';
    let queryParams = ['Available'];

    if (search) {
      whereClause += ' AND equipment_name LIKE ?';
      queryParams.push(`%${search}%`);
    }

    // นับจำนวนทั้งหมด (ตาม filter)
    const [countResult] = await promisePool.query(
      `SELECT COUNT(*) as total FROM equipment ${whereClause}`,
      queryParams
    );
    const totalCount = countResult[0].total;
    const totalPages = Math.ceil(totalCount / limit);

    // ดึงข้อมูลตาม pagination - เรียงตามจำนวนการยืมจากมากไปน้อย
    const query = `
      SELECT e.equipment_id, e.equipment_name, e.total_quantity, e.available_quantity, e.image, e.status, e.updated_at,
             COALESCE(SUM(bi.quantity), 0) AS total_borrowed
      FROM equipment e
      LEFT JOIN borrow_items bi ON e.equipment_id = bi.equipment_id
      ${whereClause.replace(/status/g, 'e.status').replace(/equipment_name/g, 'e.equipment_name').replace(/available_quantity/g, 'e.available_quantity')}
      GROUP BY e.equipment_id, e.equipment_name, e.total_quantity, e.available_quantity, e.image, e.status, e.updated_at
      ORDER BY total_borrowed DESC, e.updated_at DESC
      LIMIT ? OFFSET ?
    `;
    const [results] = await promisePool.query(query, [...queryParams, limit, offset]);

    res.status(200).json({
      equipment: results,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ดึงข้อมูลอุปกรณ์ตาม ID
exports.getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM equipment WHERE equipment_id = ?';
    const [results] = await promisePool.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.status(200).json({ equipment: results[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// อัปเดตสถานะของอุปกรณ์ (เฉพาะ status)
exports.updateEquipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const query = 'UPDATE equipment SET status = ? WHERE equipment_id = ?';
    const [results] = await promisePool.query(query, [status, id]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.status(200).json({
      message: 'Equipment status updated successfully',
      equipment: { equipment_id: id, status }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// อัปเดตข้อมูลอุปกรณ์ (รวมการอัปเดตไฟล์ภาพ)
exports.updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { equipment_name, total_quantity } = req.body;
    const trimmedName = equipment_name ? equipment_name.trim() : '';
    const newImage = req.file ? req.file.filename : null;

    const [results] = await promisePool.query('SELECT * FROM equipment WHERE equipment_id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // ตรวจสอบว่าชื่ออุปกรณ์ซ้ำหรือไม่ (ลบ space ก่อนเปรียบเทียบ, ยกเว้นตัวเอง)
    const [existingEquipment] = await promisePool.query(
      'SELECT equipment_id FROM equipment WHERE REPLACE(equipment_name, \' \', \'\') = REPLACE(?, \' \', \'\') AND equipment_id != ?',
      [trimmedName, id]
    );
    if (existingEquipment.length > 0) {
      return res.status(400).json({ message: 'ชื่ออุปกรณ์นี้มีอยู่ในระบบแล้ว' });
    }

    const oldEquipment = results[0];
    const oldImage = oldEquipment.image;
    const oldTotalQuantity = oldEquipment.total_quantity;

    // ถ้ามีการอัปโหลดไฟล์ใหม่ ให้ลบรูปเก่า
    if (newImage && oldImage) {
      const filePath = path.join(__dirname, '..', 'uploads', oldImage);
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log('Old image deleted successfully');
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log('File does not exist, skipping deletion.');
        } else {
          console.error('Error deleting old image:', err);
        }
      }
    }

    const updatedImage = newImage || oldImage;
    const newTotalQuantity = parseInt(total_quantity) || oldTotalQuantity;
    const quantityDiff = newTotalQuantity - oldTotalQuantity;
    const newAvailableQuantity = Math.max(0, oldEquipment.available_quantity + quantityDiff);

    const updateQuery = `
      UPDATE equipment
      SET equipment_name = ?, total_quantity = ?, available_quantity = ?, image = ?
      WHERE equipment_id = ?
    `;
    await promisePool.query(updateQuery, [trimmedName, newTotalQuantity, newAvailableQuantity, updatedImage, id]);

    // ดึงข้อมูลล่าสุดกลับไปให้ frontend
    const [updatedResults] = await promisePool.query('SELECT * FROM equipment WHERE equipment_id = ?', [id]);

    res.status(200).json({
      message: 'Equipment updated successfully',
      updatedTool: updatedResults[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ลบอุปกรณ์
exports.deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await promisePool.query('SELECT * FROM equipment WHERE equipment_id = ?', [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    const oldImage = results[0].image;

    if (oldImage) {
      const filePath = path.join(__dirname, '..', 'uploads', oldImage);
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log('Image deleted successfully');
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log('File does not exist, skipping deletion.');
        } else {
          console.error('Error deleting image:', err);
        }
      }
    }

    const deleteQuery = 'DELETE FROM equipment WHERE equipment_id = ?';
    await promisePool.query(deleteQuery, [id]);
    res.status(200).json({ message: 'Equipment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
