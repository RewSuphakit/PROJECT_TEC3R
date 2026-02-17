const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ตั้งค่าการเก็บไฟล์ในหน่วยความจำ
const storage = multer.memoryStorage();

// ตรวจสอบชนิดของไฟล์ (รองรับเฉพาะ .jpg, .jpeg, .png)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);  // อนุญาตให้ไฟล์อัปโหลด
  } else {
    cb(new Error('Only .jpg, .jpeg, .png files are allowed!'), false);
  }
};

// กำหนด Multer middleware
const upload_return = multer({
  storage: storage, // เก็บไฟล์ใน RAM ก่อนบีบอัด
  limits: { fileSize: 10 * 1024 * 1024 }, // จำกัดขนาดไฟล์ 10MB
  fileFilter: fileFilter
});

// ตรวจสอบและสร้างโฟลเดอร์หากยังไม่มี
const ensureUploadPath = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Middleware สำหรับการบีบอัดไฟล์
const compressImage_return = async (req, res, next) => {
  try {
    if (!req.file) return next(); // ถ้าไม่มีไฟล์ให้ข้ามไป

    const uploadFolder = path.join(__dirname, '..', 'image_return'); // ที่เก็บไฟล์
    ensureUploadPath(uploadFolder); // สร้างโฟลเดอร์ถ้ายังไม่มี

    const filename = `RMUTI-${Date.now()}.jpg`; // ตั้งชื่อไฟล์ใหม่
    const outputPath = path.join(uploadFolder, filename); // ระบุเส้นทางไฟล์

    // ใช้ sharp บีบอัดไฟล์และบันทึกลงดิสก์
    await sharp(req.file.buffer)
      .resize(774, 776, { fit: 'inside', withoutEnlargement: true }) // ปรับขนาดภาพโดยรักษาสัดส่วน
      .jpeg({ quality: 80 }) // บีบอัดเป็น .jpg คุณภาพ 80%
      .toFile(outputPath);

    // เก็บข้อมูลไฟล์ที่บีบอัดไว้ใน req.file
    req.file.path = outputPath;
    req.file.filename = filename;

    next(); // ไปยัง middleware ถัดไป
  } catch (err) {
    console.error('Error during image compression:', err);
    res.status(500).json({ message: 'Error during image compression' });
  }
};

module.exports = { upload_return, compressImage_return };
