const { param, body } = require('express-validator');

const stateIdParam = [
  param('stateId')
    .isInt({ min: 1 })
    .withMessage('stateId must be a positive integer.'),
];

/** POST /states — omit or falsy state_id for all states; positive integer for that state's cities. */
const postStatesOrCitiesBody = [
  body('state_id')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('state_id must be a positive integer.'),
];

module.exports = { stateIdParam, postStatesOrCitiesBody };
