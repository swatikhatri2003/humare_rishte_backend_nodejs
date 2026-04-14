const express = require('express');
const communityController = require('../controller/communityController');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/auth');
const {
  uploadCommunityLogo,
  attachLogoUrlFromFile,
} = require('../middleware/communityLogoUpload');
const { createCommunityRules, communityIdParam } = require('../validators/communityValidators');

const router = express.Router();

router.get('/', communityController.list);
router.get('/:communityId', communityIdParam, validateRequest, communityController.getById);
router.post(
  '/',
  requireAuth,
  uploadCommunityLogo,
  attachLogoUrlFromFile,
  createCommunityRules,
  validateRequest,
  communityController.create
);

module.exports = router;
