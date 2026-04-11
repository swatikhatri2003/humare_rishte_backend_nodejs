const { query, param } = require('express-validator');

const listCitiesRules = [
  query('state_id')
    .notEmpty()
    .withMessage('Query parameter state_id is required.')
    .isInt({ min: 1 })
    .withMessage('state_id must be a positive integer.'),
];

const cityIdParam = [
  param('cityId')
    .isInt({ min: 1 })
    .withMessage('cityId must be a positive integer.'),
];

module.exports = { listCitiesRules, cityIdParam };
