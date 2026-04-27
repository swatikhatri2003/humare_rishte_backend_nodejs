const { body, param, query } = require('express-validator');

const optionalInt = (field, label) =>
  body(field)
    .optional()
    .isInt()
    .withMessage(`${label} must be an integer.`);

const requiredInt = (field, label, opts = {}) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isInt(opts)
    .withMessage(`${label} must be an integer.`);

const textField = (field, label, max = 250) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} is required.`)
    .customSanitizer((v) => (v == null ? '' : String(v).trim()))
    .isLength({ min: 1, max })
    .withMessage(`${label} must be between 1 and ${max} characters.`);

const optionalText = (field, label, max = 250) =>
  body(field)
    .optional({ nullable: true })
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ min: 0, max })
    .withMessage(`${label} must be at most ${max} characters.`);

const createMemberRules = [
  body('id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer.'),
  body('user_id').optional().isInt({ min: 1 }).withMessage('user_id must be a positive integer.'),
  textField('name', 'name', 100),
  requiredInt('gender', 'gender'),
  optionalText('father_name', 'father_name', 100),
  optionalText('mother_name', 'mother_name', 100),
  body('father_id').optional().isInt({ min: 0 }).withMessage('father_id must be an integer.'),
  body('mother_id').optional().isInt({ min: 0 }).withMessage('mother_id must be an integer.'),
  optionalText('spouse_name', 'spouse_name', 100),
  body('spouse_id').optional().isInt({ min: 0 }).withMessage('spouse_id must be an integer.'),
  body('dob')
    .optional({ nullable: true })
    .isISO8601({ strict: true })
    .withMessage('dob must be a valid date (YYYY-MM-DD).'),
  body('is_expired').optional().isInt({ min: 0, max: 1 }).withMessage('is_expired must be 0 or 1.'),
  body('photo')
    .optional({ nullable: true })
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ max: 200 })
    .withMessage('photo must be at most 200 characters.'),
  textField('state_name', 'state_name', 100),
  textField('city_name', 'city_name', 100),
  body('state_id')
    .notEmpty()
    .withMessage('state_id is required.')
    .isInt({ min: 1 })
    .withMessage('state_id must be a positive integer.'),
  body('city_id')
    .notEmpty()
    .withMessage('city_id is required.')
    .isInt({ min: 1 })
    .withMessage('city_id must be a positive integer.'),
  textField('village', 'village', 150),
  requiredInt('status', 'status', { min: 0 }),
  body('kutumb_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('kutumb_id must be a positive integer.'),
  body('spouse_kutumb_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('spouse_kutumb_id must be a positive integer.'),
  body('order_no').optional().isInt({ min: 0 }).withMessage('order_no must be an integer.'),
  body('is_vip').optional().isInt({ min: 0, max: 1 }).withMessage('is_vip must be 0 or 1.'),
  body('is_private').optional().isInt({ min: 0, max: 1 }).withMessage('is_private must be 0 or 1.'),
  /** Optional: create/update `members_detail` in the same request as `members`. */
  body('detail')
    .optional()
    .isObject()
    .withMessage('detail must be an object.'),
  body('detail.mobile')
    .if(body('detail').exists())
    .trim()
    .notEmpty()
    .withMessage('detail.mobile is required when detail is sent.')
    .isLength({ min: 10, max: 10 })
    .withMessage('detail.mobile must be exactly 10 digits.')
    .matches(/^[0-9]+$/)
    .withMessage('detail.mobile must contain only digits.'),
  body('detail.email')
    .if(body('detail').exists())
    .trim()
    .notEmpty()
    .withMessage('detail.email is required when detail is sent.')
    .isEmail()
    .withMessage('Please enter a valid detail.email.')
    .isLength({ max: 50 })
    .withMessage('detail.email must be at most 50 characters.'),
  body('detail.about')
    .if(body('detail').exists())
    .trim()
    .isLength({ max: 500 })
    .withMessage('detail.about must be at most 500 characters.'),
];

const updateMemberRules = [
  body('user_id').optional().isInt({ min: 1 }),
  body('name')
    .optional()
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ min: 1, max: 100 })
    .withMessage('name must be between 1 and 100 characters.'),
  optionalInt('gender', 'gender'),
  body('father_name')
    .optional({ nullable: true })
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ max: 100 })
    .withMessage('father_name must be at most 100 characters.'),
  body('mother_name')
    .optional({ nullable: true })
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ max: 100 })
    .withMessage('mother_name must be at most 100 characters.'),
  optionalInt('father_id', 'father_id'),
  optionalInt('mother_id', 'mother_id'),
  body('spouse_name')
    .optional({ nullable: true })
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ max: 100 })
    .withMessage('spouse_name must be at most 100 characters.'),
  optionalInt('spouse_id', 'spouse_id'),
  body('dob')
    .optional({ nullable: true })
    .isISO8601({ strict: true })
    .withMessage('dob must be a valid date (YYYY-MM-DD).'),
  optionalInt('is_expired', 'is_expired'),
  body('photo')
    .optional({ nullable: true })
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ max: 200 })
    .withMessage('photo must be at most 200 characters.'),
  body('state_name')
    .optional()
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ min: 1, max: 100 })
    .withMessage('state_name must be between 1 and 100 characters.'),
  body('city_name')
    .optional()
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ min: 1, max: 100 })
    .withMessage('city_name must be between 1 and 100 characters.'),
  body('state_id').optional().isInt({ min: 1 }),
  body('city_id').optional().isInt({ min: 1 }),
  body('village')
    .optional()
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ max: 150 })
    .withMessage('village must be at most 150 characters.'),
  optionalInt('status', 'status'),
  body('kutumb_id').optional().isInt({ min: 1 }),
  body('spouse_kutumb_id').optional().isInt({ min: 1 }),
  optionalInt('order_no', 'order_no'),
  optionalInt('is_vip', 'is_vip'),
  optionalInt('is_private', 'is_private'),
];

const memberIdParam = [
  param('memberId')
    .isInt({ min: 1 })
    .withMessage('memberId must be a positive integer.'),
];

module.exports = {
  createMemberRules,
  updateMemberRules,
  memberIdParam,
};
