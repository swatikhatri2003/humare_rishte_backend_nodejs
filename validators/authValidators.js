const { body } = require('express-validator');

const registerRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('Name must be between 2 and 150 characters.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .normalizeEmail()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .isLength({ max: 50 })
    .withMessage('Email must be at most 50 characters (database limit).'),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required.')
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage('Mobile must be 10–15 digits (spaces, +, or - allowed for formatting).'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6, max: 72 })
    .withMessage('Password must be between 6 and 72 characters.'),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required.')
    .isInt({ min: 1, max: 2 })
    .withMessage('gender must be 1 (female) or 2 (male).'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City name is required.')
    .isLength({ min: 1, max: 250 })
    .withMessage('City name must be at most 250 characters.'),
  body('city_id')
    .notEmpty()
    .withMessage('city_id is required (you can also send cityId).')
    .isInt({ min: 1 })
    .withMessage('city_id must be a positive integer.'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State name is required.')
    .isLength({ min: 1, max: 250 })
    .withMessage('State name must be at most 250 characters.'),
  body('state_id')
    .notEmpty()
    .withMessage('state_id is required (you can also send stateId).')
    .isInt({ min: 1 })
    .withMessage('state_id must be a positive integer.'),
];

const loginRules = [
  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 1, max: 72 })
    .withMessage('Password must be at most 72 characters.'),
  body('mobile')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty()
    .withMessage('mobile cannot be empty when provided.')
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage('Mobile must be 10–15 digits (spaces, +, or - allowed for formatting).'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty()
    .withMessage('email cannot be empty when provided.')
    .normalizeEmail()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .isLength({ max: 50 })
    .withMessage('Email must be at most 50 characters.'),
  body().custom((_, { req }) => {
    const e = req.body.email != null && String(req.body.email).trim() !== '';
    const m = req.body.mobile != null && String(req.body.mobile).trim() !== '';
    if (e && m) {
      throw new Error('Send either email or mobile for sign in, not both.');
    }
    if (!e && !m) {
      throw new Error('Either mobile or email is required to sign in.');
    }
    return true;
  }),
];

const otpSendRules = [
  body().custom((_, { req }) => {
    const e = req.body.email != null && String(req.body.email).trim() !== '';
    const m = req.body.mobile != null && String(req.body.mobile).trim() !== '';
    if (!e && !m) {
      throw new Error('Send at least one of email or mobile in the body.');
    }
    return true;
  }),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty()
    .withMessage('email cannot be empty when provided.')
    .normalizeEmail()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .isLength({ max: 50 })
    .withMessage('Email must be at most 50 characters.'),
  body('mobile')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty()
    .withMessage('mobile cannot be empty when provided.')
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage('Mobile must be 10–15 digits (spaces, +, or - allowed for formatting).'),
];

const otpVerifyRules = [
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('otp is required.')
    .isLength({ min: 4, max: 10 })
    .withMessage('otp looks invalid.'),
  body('channel')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['email', 'mobile'])
    .withMessage('channel must be email or mobile.'),
  body().custom((_, { req }) => {
    const e = req.body.email != null && String(req.body.email).trim() !== '';
    const m = req.body.mobile != null && String(req.body.mobile).trim() !== '';
    if (!e && !m) {
      throw new Error('Send at least one of email or mobile so we can find your account.');
    }
    if (e && m) {
      const c = String(req.body.channel || '').trim().toLowerCase();
      if (c !== 'email' && c !== 'mobile') {
        throw new Error(
          'When both email and mobile are sent, channel is required and must be "email" or "mobile".'
        );
      }
    }
    return true;
  }),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty()
    .withMessage('email cannot be empty when provided.')
    .normalizeEmail()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .isLength({ max: 50 })
    .withMessage('Email must be at most 50 characters.'),
  body('mobile')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty()
    .withMessage('mobile cannot be empty when provided.')
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage('Mobile must be 10–15 digits (spaces, +, or - allowed for formatting).'),
];

/** Forgot password: verify OTP (email or mobile channel) and set a new password. Call POST /auth/otp/send first to receive the OTP. */
const forgotPasswordResetRules = [
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('otp is required.')
    .isLength({ min: 4, max: 10 })
    .withMessage('otp looks invalid.'),
  body('new_password')
    .optional({ values: 'falsy' })
    .isLength({ min: 6, max: 72 })
    .withMessage('new_password must be between 6 and 72 characters.'),
  body('password')
    .optional({ values: 'falsy' })
    .isLength({ min: 6, max: 72 })
    .withMessage('password must be between 6 and 72 characters.'),
  body().custom((_, { req }) => {
    const np =
      req.body.new_password != null && String(req.body.new_password).trim() !== '';
    const p = req.body.password != null && String(req.body.password).trim() !== '';
    if (!np && !p) {
      throw new Error('Send new_password (or password) with your new password (6–72 characters).');
    }
    return true;
  }),
  body('channel')
    .optional({ values: 'falsy' })
    .trim()
    .isIn(['email', 'mobile'])
    .withMessage('channel must be email or mobile.'),
  body().custom((_, { req }) => {
    const e = req.body.email != null && String(req.body.email).trim() !== '';
    const m = req.body.mobile != null && String(req.body.mobile).trim() !== '';
    if (!e && !m) {
      throw new Error('Send email or mobile so we can verify your OTP.');
    }
    if (e && m) {
      const c = String(req.body.channel || '').trim().toLowerCase();
      if (c !== 'email' && c !== 'mobile') {
        throw new Error(
          'When both email and mobile are sent, channel is required and must be "email" or "mobile".'
        );
      }
    }
    return true;
  }),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty()
    .withMessage('email cannot be empty when provided.')
    .normalizeEmail()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .isLength({ max: 50 })
    .withMessage('Email must be at most 50 characters.'),
  body('mobile')
    .optional({ values: 'falsy' })
    .trim()
    .notEmpty()
    .withMessage('mobile cannot be empty when provided.')
    .matches(/^[0-9+\-\s]{10,15}$/)
    .withMessage('Mobile must be 10–15 digits (spaces, +, or - allowed for formatting).'),
];

module.exports = {
  registerRules,
  loginRules,
  otpSendRules,
  otpVerifyRules,
  forgotPasswordResetRules,
};
