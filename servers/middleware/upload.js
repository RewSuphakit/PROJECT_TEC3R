const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

// ตั้งค่าในการเก็บไฟล์
const storage = multer.memoryStorage();  // ใช้ memoryStorage เพื่อเก็บไฟล์ในหน่วยความจำชั่วคราว

// ตรวจสอบชนิดของไฟล์ (รองรับเฉพาะ .jpg, .jpeg, .png)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);  // อนุญาตให้ไฟล์ชนิดนี้
  } else {
    cb(new Error('Only .jpg, .jpeg, .png files are allowed!'), false);  // ขัดจังหวะการอัพโหลดหากไม่ใช่ไฟล์ที่อนุญาต
  }
};

// สร้าง Multer middleware
const upload = multer({
  storage: storage,       // กำหนดการจัดเก็บไฟล์ในหน่วยความจำ
  limits: { fileSize: 10 * 1024 * 1024 },  // กำหนดขนาดไฟล์สูงสุด (10MB)
  fileFilter: fileFilter  // กรองชนิดไฟล์
});

// Middleware สำหรับการบีบอัดไฟล์
const compressImage = (req, res, next) => {
  if (!req.file) return next(); // ถ้าไม่มีไฟล์ก็ไม่ต้องทำอะไร

  const filename = `RMUTI-${Date.now()}.jpg`;  // ตั้งชื่อไฟล์ใหม่หลังจากบีบอัด
  const outputPath = path.join(__dirname, '..', 'uploads', filename);  // เส้นทางการเก็บไฟล์ที่บีบอัด

  // บีบอัดไฟล์
  sharp(req.file.buffer)  // ใช้ไฟล์ที่เก็บในหน่วยความจำ
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })  // ปรับขนาดภาพให้ไม่เกิน 800x800 โดยรักษาสัดส่วน
    .jpeg({ quality: 80 })  // บีบอัดไฟล์ภาพเป็น .jpg พร้อมลดคุณภาพ (80%)
    .toFile(outputPath, (err, info) => {
      if (err) {
        console.error('Error during image compression:', err);
        return res.status(500).json({ message: 'Error during image compression' });
      }


      // เก็บเส้นทางไฟล์ที่บีบอัดไว้ใน req.file เพื่อใช้ต่อ
      req.file.path = outputPath;
      req.file.filename = filename;

      next();  // ไปยัง middleware ถัดไป
    });
};

module.exports = { upload, compressImage };
