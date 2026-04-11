const { body, param } = require('express-validator');

const createCommunityRules = [
  body('community_name')
    .trim()
    .notEmpty()
    .withMessage('community_name is required.')
    .isLength({ max: 255 })
    .withMessage('community_name must be at most 255 characters.'),
  body('color_code').notEmpty().withMessage('color_code is required.'),
  body('community_logo').notEmpty().withMessage('community_logo is required.'),
  body('community_description').notEmpty().withMessage('community_description is required.'),
  body('community_date')
    .notEmpty()
    .withMessage('community_date is required.')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('community_date must be YYYY-MM-DD.'),
  body('meta_title').notEmpty().withMessage('meta_title is required.'),
  body('meta_key').notEmpty().withMessage('meta_key is required.'),
  body('meta_description').notEmpty().withMessage('meta_description is required.'),
  body('content').notEmpty().withMessage('content is required.'),
];

const communityIdParam = [
  param('communityId')
    .isInt({ min: 1 })
    .withMessage('communityId must be a positive integer.'),
];

module.exports = { createCommunityRules, communityIdParam };
