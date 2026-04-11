const express = require('express');
const authController = require('../controller/authController');
const validateRequest = require('../middleware/validateRequest');
const mergeRegisterAliases = require('../middleware/mergeRegisterAliases');
const { requireAuth } = require('../middleware/auth');
const {
  registerRules,
  loginRules,
  otpSendRules,
  otpVerifyRules,
  forgotPasswordResetRules,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', mergeRegisterAliases, registerRules, validateRequest, authController.register);
router.post('/login', loginRules, validateRequest, authController.login);
router.post('/otp/send', otpSendRules, validateRequest, authController.sendOtp);
router.post('/otp/verify', otpVerifyRules, validateRequest, authController.verifyOtp);
router.post(
  '/forgot-password',
  forgotPasswordResetRules,
  validateRequest,
  authController.forgotPasswordReset
);
router.get('/me', requireAuth, authController.me);

module.exports = router;
