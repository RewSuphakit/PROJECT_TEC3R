const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

// Rate limiter สำหรับ login - จำกัด 10 ครั้งใน 1 นาที
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 นาที
    max: 10, // จำกัด 10 ครั้ง
    message: {
        msg: 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ใน 1 นาที',
        error: 'Too many login attempts. Please try again later.'
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers
});



// LOGIN
router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
// AUTH
router.get('/profile', authenticate, authController.getUserProfile);
router.get('/users', authenticate, authController.getAllUsers);
router.put('/:user_id', authenticate, authController.updateUser);
router.put('/admin/:user_id', authenticate, authController.adminUpdateUser);
router.put('/email/:user_id', authenticate, authController.updateEmailPassword);
router.delete('/:user_id', authenticate, authController.deleteUser);

module.exports = router;        
