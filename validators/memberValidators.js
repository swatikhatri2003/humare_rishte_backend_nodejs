const { body, param, query } = require('express-validator');

const optionalInt = (field, label) =>
  body(field)
    .optional()
    .isInt()
    .withMessage(`${label} must be an integer.`);

const requiredInt = (field, label) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isInt()
    .withMessage(`${label} must be an integer.`);

const textField = (field, label, max = 250) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} is required.`)
    .customSanitizer((v) => (v == null ? '' : String(v).trim()))
    .isLength({ min: 1, max })
    .withMessage(`${label} must be between 1 and ${max} characters.`);

const createMemberRules = [
  /** When present, POST / performs update instead of create (same payload shape). */
  body('id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer.'),
  body('user_id').optional().isInt({ min: 1 }).withMessage('user_id must be a positive integer.'),
  textField('name', 'name'),
  requiredInt('gender', 'gender'),
  requiredInt('father_name', 'father_name'),
  requiredInt('mother_name', 'mother_name'),
  requiredInt('father_id', 'father_id'),
  requiredInt('mother_id', 'mother_id'),
  requiredInt('spouse_name', 'spouse_name'),
  requiredInt('spouse_id', 'spouse_id'),
  requiredInt('dob', 'dob'),
  requiredInt('is_expired', 'is_expired'),
  requiredInt('photo', 'photo'),
  textField('state_name', 'state_name'),
  textField('city_name', 'city_name'),
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
  requiredInt('village', 'village'),
  requiredInt('status', 'status'),
  body('kutumb_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('kutumb_id must be a positive integer.'),
  body('spouse_kutumb_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('spouse_kutumb_id must be a positive integer.'),
  requiredInt('order_no', 'order_no'),
  requiredInt('is_vip', 'is_vip'),
  requiredInt('is_private', 'is_private'),
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
    .notEmpty()
    .withMessage('detail.about is required when detail is sent.')
    .isLength({ max: 500 })
    .withMessage('detail.about must be at most 500 characters.'),
];

const updateMemberRules = [
  body('user_id').optional().isInt({ min: 1 }),
  body('name')
    .optional()
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ min: 1, max: 250 })
    .withMessage('name must be between 1 and 250 characters.'),
  optionalInt('gender', 'gender'),
  optionalInt('father_name', 'father_name'),
  optionalInt('mother_name', 'mother_name'),
  optionalInt('father_id', 'father_id'),
  optionalInt('mother_id', 'mother_id'),
  optionalInt('spouse_name', 'spouse_name'),
  optionalInt('spouse_id', 'spouse_id'),
  optionalInt('dob', 'dob'),
  optionalInt('is_expired', 'is_expired'),
  optionalInt('photo', 'photo'),
  body('state_name')
    .optional()
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ min: 1, max: 250 })
    .withMessage('state_name must be between 1 and 250 characters.'),
  body('city_name')
    .optional()
    .customSanitizer((v) => (v == null ? v : String(v).trim()))
    .isLength({ min: 1, max: 250 })
    .withMessage('city_name must be between 1 and 250 characters.'),
  body('state_id').optional().isInt({ min: 1 }),
  body('city_id').optional().isInt({ min: 1 }),
  optionalInt('village', 'village'),
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

const listMembersQuery = [
  query('kutumb_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('kutumb_id must be a positive integer.'),
];

module.exports = {
  createMemberRules,
  updateMemberRules,
  memberIdParam,
  listMembersQuery,
};
