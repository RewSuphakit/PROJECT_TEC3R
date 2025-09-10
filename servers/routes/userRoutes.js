const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
// LOGIN
router.post('/register', authController.register);
router.post('/login', authController.login);
// AUTH
router.get('/profile',authenticate, authController.getUserProfile);
router.get('/users',authenticate, authController.getAllUsers);
router.put('/:user_id',authenticate,authController.updateUser);
router.put('/admin/:user_id', authenticate, authController.adminUpdateUser);
router.put('/email/:user_id', authenticate, authController.updateEmailPassword);
router.delete('/:user_id', authenticate, authController.deleteUser);

module.exports = router;        
