const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ตรวจสอบชนิดของไฟล์ (รองรับเฉพาะ .jpg, .jpeg, .png)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png files are allowed!'), false);
  }
};

// ตรวจสอบและสร้างโฟลเดอร์หากยังไม่มี
const ensureUploadPath = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

// Factory function สำหรับสร้าง upload + compress middleware
const createUploadMiddleware = ({ folder, format, maxWidth, maxHeight }) => {
  const storage = multer.memoryStorage();

  const uploadInstance = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter
  });

  const compressMiddleware = async (req, res, next) => {
    try {
      if (!req.file) return next();

      const uploadFolder = path.join(__dirname, '..', folder);
      ensureUploadPath(uploadFolder);

      const ext = format === 'webp' ? 'webp' : 'jpg';
      const filename = `RMUTI-${Date.now()}.${ext}`;
      const outputPath = path.join(uploadFolder, filename);

      let pipeline = sharp(req.file.buffer)
        .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true });

      if (format === 'webp') {
        pipeline = pipeline.webp({ quality: 80 });
      } else {
        pipeline = pipeline.jpeg({ quality: 80 });
      }

      await pipeline.toFile(outputPath);

      req.file.path = outputPath;
      req.file.filename = filename;

      next();
    } catch (err) {
      console.error('Error during image compression:', err);
      res.status(500).json({ message: 'Error during image compression' });
    }
  };

  return { upload: uploadInstance, compress: compressMiddleware };
};

// Preset สำหรับอัพโหลดรูปอุปกรณ์ (webp, 800×800, → uploads/)
const equipmentUpload = createUploadMiddleware({
  folder: 'uploads',
  format: 'webp',
  maxWidth: 800,
  maxHeight: 800
});

// Preset สำหรับอัพโหลดรูปคืนอุปกรณ์ (jpg, 774×776, → image_return/)
const returnUpload = createUploadMiddleware({
  folder: 'image_return',
  format: 'jpeg',
  maxWidth: 774,
  maxHeight: 776
});

// Export ด้วยชื่อเดิมเพื่อความเข้ากันได้
module.exports = {
  upload: equipmentUpload.upload,
  compressImage: equipmentUpload.compress,
  upload_return: returnUpload.upload,
  compressImage_return: returnUpload.compress
};
