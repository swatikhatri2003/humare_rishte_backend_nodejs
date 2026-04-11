const { body, param } = require('express-validator');

const upsertMemberDetailRules = [
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('mobile is required.')
    .isLength({ min: 10, max: 10 })
    .withMessage('mobile must be exactly 10 digits.')
    .matches(/^[0-9]+$/)
    .withMessage('mobile must contain only digits.'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('email is required.')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .isLength({ max: 50 })
    .withMessage('email must be at most 50 characters.'),
  body('about')
    .trim()
    .notEmpty()
    .withMessage('about is required.')
    .isLength({ max: 500 })
    .withMessage('about must be at most 500 characters.'),
];

const memberIdForDetailParam = [
  param('memberId')
    .isInt({ min: 1 })
    .withMessage('memberId must be a positive integer.'),
];

module.exports = { upsertMemberDetailRules, memberIdForDetailParam };
