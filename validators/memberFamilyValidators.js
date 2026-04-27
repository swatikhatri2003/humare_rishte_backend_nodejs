const { body, param } = require('express-validator');

const memberIdParam = [
  param('memberId').isInt({ min: 1 }).withMessage('memberId must be a positive integer.'),
];

const createRelativeRules = [
  body('relation')
    .notEmpty()
    .withMessage('relation is required.')
    .isIn(['father', 'mother', 'son', 'daughter', 'spouse'])
    .withMessage('relation must be one of father, mother, son, daughter, spouse.'),

  // Relative member fields (same as members table, but keep it flexible)
  body('member').notEmpty().withMessage('member is required.').isObject().withMessage('member must be an object.'),
  body('member.name')
    .notEmpty()
    .withMessage('member.name is required.')
    .customSanitizer((v) => (v == null ? '' : String(v).trim()))
    .isLength({ min: 1, max: 100 })
    .withMessage('member.name must be between 1 and 100 characters.'),
  body('member.gender')
    .optional()
    .isInt({ min: 0 })
    .withMessage('member.gender must be an integer.'),
  body('member.dob')
    .optional({ nullable: true })
    .isISO8601({ strict: true })
    .withMessage('member.dob must be a valid date (YYYY-MM-DD).'),

  // Optional: contact detail row in members_detail
  body('detail').optional().isObject().withMessage('detail must be an object.'),
  body('detail.mobile')
    .if(body('detail').exists())
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage('detail.mobile must be exactly 10 digits.')
    .matches(/^[0-9]+$/)
    .withMessage('detail.mobile must contain only digits.'),
  body('detail.email')
    .if(body('detail').exists())
    .trim()
    .isEmail()
    .withMessage('detail.email must be a valid email.')
    .isLength({ max: 50 })
    .withMessage('detail.email must be at most 50 characters.'),
  body('detail.about')
    .if(body('detail').exists())
    .customSanitizer((v) => (v == null ? '' : String(v).trim()))
    .isLength({ max: 500 })
    .withMessage('detail.about must be at most 500 characters.'),
];

module.exports = { memberIdParam, createRelativeRules };

