const { body, param, query } = require('express-validator');

const intField = (field, label) =>
  body(field)
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isInt()
    .withMessage(`${label} must be an integer.`);

const optionalInt = (field, label) =>
  body(field)
    .optional()
    .isInt()
    .withMessage(`${label} must be an integer.`);

/** Matches DB: varchar(150) */
const requiredNameField = (field, label) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required.`)
    .isLength({ max: 150 })
    .withMessage(`${label} must be at most 150 characters.`);

/** Optional: when present, POST / creates → update existing row (same payload as create). */
const createKutumbRules = [
  body('kutumb_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('kutumb_id must be a positive integer.'),
  requiredNameField('caste_name', 'caste_name'),
  requiredNameField('sur_name', 'sur_name'),
  requiredNameField('sub_sur_name', 'sub_sur_name'),
  requiredNameField('gotra', 'gotra'),
  body('community_id')
    .notEmpty()
    .withMessage('community_id is required.')
    .isInt({ min: 1 })
    .withMessage('community_id must be a positive integer.'),

  requiredNameField('state_name', 'state_name'),
  requiredNameField('city_name', 'city_name'),
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
  optionalInt('village', 'village'),
  body('latitude').optional().isLength({ max: 150 }).withMessage('latitude too long.'),
  body('longitude').optional().isLength({ max: 150 }).withMessage('longitude too long.'),
  body('address').optional().isLength({ max: 150 }).withMessage('address too long.'),
  intField('is_ancient', 'is_ancient'),
  intField('is_private', 'is_private'),
  body('symbol')
    .trim()
    .notEmpty()
    .withMessage('symbol is required.')
    .isLength({ max: 150 })
    .withMessage('symbol must be at most 150 characters.'),
  body('label')
    .trim()
    .notEmpty()
    .withMessage('label is required.')
    .isLength({ max: 150 })
    .withMessage('label must be at most 150 characters.'),
];

const kutumbIdParam = [
  param('kutumbId')
    .isInt({ min: 1 })
    .withMessage('kutumbId must be a positive integer.'),
];

const listKutumbsQuery = [
  query('community_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('community_id must be a positive integer.'),
];

module.exports = {
  createKutumbRules,
  kutumbIdParam,
  listKutumbsQuery,
};
