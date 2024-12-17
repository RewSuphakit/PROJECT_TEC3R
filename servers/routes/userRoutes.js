const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
// LOGIN
router.post('/register', authController.register);
router.post('/login', authController.login);
// AUTH
router.get('/profile',authenticate, authController.getUserProfile);

module.exports = router;
