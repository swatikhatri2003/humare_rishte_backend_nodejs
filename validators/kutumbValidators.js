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

const createKutumbRules = [
  intField('caste_name', 'caste_name'),
  intField('sur_name', 'sur_name'),
  intField('sub_sur_name', 'sub_sur_name'),
  intField('gotra', 'gotra'),
  body('community_id')
    .notEmpty()
    .withMessage('community_id is required.')
    .isInt({ min: 1 })
    .withMessage('community_id must be a positive integer.'),
  intField('status', 'status'),
  intField('state_name', 'state_name'),
  intField('city_name', 'city_name'),
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

const updateKutumbRules = [
  optionalInt('caste_name', 'caste_name'),
  optionalInt('sur_name', 'sur_name'),
  optionalInt('sub_sur_name', 'sub_sur_name'),
  optionalInt('gotra', 'gotra'),
  body('community_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('community_id must be a positive integer.'),
  optionalInt('status', 'status'),
  optionalInt('state_name', 'state_name'),
  optionalInt('city_name', 'city_name'),
  body('state_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('state_id must be a positive integer.'),
  body('city_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('city_id must be a positive integer.'),
  optionalInt('village', 'village'),
  body('latitude').optional().isLength({ max: 150 }),
  body('longitude').optional().isLength({ max: 150 }),
  body('address').optional().isLength({ max: 150 }),
  optionalInt('is_ancient', 'is_ancient'),
  optionalInt('is_private', 'is_private'),
  body('symbol').optional().trim().isLength({ max: 150 }),
  body('label').optional().trim().isLength({ max: 150 }),
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
  updateKutumbRules,
  kutumbIdParam,
  listKutumbsQuery,
};
