const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { validate, schemas } = require('../middlewares/validation');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/auth');
const cors = require('cors');

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', validate(schemas.forgotPassword), forgotPassword);
router.put('/reset-password', validate(schemas.resetPassword), resetPassword);
router.put('/update-password', protect, updatePassword);

module.exports = router;