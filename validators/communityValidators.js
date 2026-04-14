const { body, param } = require('express-validator');

/** Body `id` present and non-empty => treat as update (same POST route). */
function isCommunityUpdate(req) {
  const v = req.body?.id;
  return v !== undefined && v !== null && String(v).trim() !== '';
}

const createCommunityRules = [
  body('id')
    .if((value, { req }) => isCommunityUpdate(req))
    .trim()
    .notEmpty()
    .withMessage('id is required for update.')
    .isInt({ min: 1 })
    .withMessage('id must be a positive integer.'),
  body('community_name')
    .if((value, { req }) => !isCommunityUpdate(req))
    .trim()
    .notEmpty()
    .withMessage('community_name is required.')
    .isLength({ max: 255 })
    .withMessage('community_name must be at most 255 characters.'),
  body('community_name')
    .if((value, { req }) => isCommunityUpdate(req))
    .optional()
    .trim()
    .notEmpty()
    .withMessage('community_name cannot be empty if sent.')
    .isLength({ max: 255 })
    .withMessage('community_name must be at most 255 characters.'),
  body('color_code')
    .if((value, { req }) => !isCommunityUpdate(req))
    .notEmpty()
    .withMessage('color_code is required.'),
  body('color_code')
    .if((value, { req }) => isCommunityUpdate(req))
    .optional()
    .notEmpty()
    .withMessage('color_code cannot be empty if sent.'),
  body('community_logo')
    .if((value, { req }) => !isCommunityUpdate(req))
    .notEmpty()
    .withMessage('community_logo is required (upload a file or send a URL).'),
  body('community_logo')
    .if((value, { req }) => isCommunityUpdate(req))
    .optional()
    .notEmpty()
    .withMessage('community_logo cannot be empty if sent.'),
  body('community_description')
    .if((value, { req }) => !isCommunityUpdate(req))
    .notEmpty()
    .withMessage('community_description is required.'),
  body('community_description')
    .if((value, { req }) => isCommunityUpdate(req))
    .optional()
    .notEmpty()
    .withMessage('community_description cannot be empty if sent.'),
  body('community_date')
    .if((value, { req }) => !isCommunityUpdate(req))
    .notEmpty()
    .withMessage('community_date is required.')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('community_date must be YYYY-MM-DD.'),
  body('community_date')
    .if((value, { req }) => isCommunityUpdate(req))
    .optional()
    .notEmpty()
    .withMessage('community_date cannot be empty if sent.')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('community_date must be YYYY-MM-DD.'),
  body('meta_title')
    .if((value, { req }) => !isCommunityUpdate(req))
    .notEmpty()
    .withMessage('meta_title is required.'),
  body('meta_title')
    .if((value, { req }) => isCommunityUpdate(req))
    .optional()
    .notEmpty()
    .withMessage('meta_title cannot be empty if sent.'),
  body('meta_key')
    .if((value, { req }) => !isCommunityUpdate(req))
    .notEmpty()
    .withMessage('meta_key is required.'),
  body('meta_key')
    .if((value, { req }) => isCommunityUpdate(req))
    .optional()
    .notEmpty()
    .withMessage('meta_key cannot be empty if sent.'),
  body('meta_description')
    .if((value, { req }) => !isCommunityUpdate(req))
    .notEmpty()
    .withMessage('meta_description is required.'),
  body('meta_description')
    .if((value, { req }) => isCommunityUpdate(req))
    .optional()
    .notEmpty()
    .withMessage('meta_description cannot be empty if sent.'),
  body('content')
    .if((value, { req }) => !isCommunityUpdate(req))
    .notEmpty()
    .withMessage('content is required.'),
  body('content')
    .if((value, { req }) => isCommunityUpdate(req))
    .optional()
    .notEmpty()
    .withMessage('content cannot be empty if sent.'),
];

const communityIdParam = [
  param('communityId')
    .isInt({ min: 1 })
    .withMessage('communityId must be a positive integer.'),
];

module.exports = { createCommunityRules, communityIdParam };
