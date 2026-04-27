const express = require('express');
const memberController = require('../controller/memberController');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/auth');
const {
  createMemberRules,
  updateMemberRules,
  memberIdParam,
} = require('../validators/memberValidators');
const { createRelativeRules } = require('../validators/memberFamilyValidators');

const router = express.Router();

// New member APIs (kutumb/vanshavali workflow)
router.post('/', requireAuth, createMemberRules, validateRequest, memberController.create);
router.get('/me', requireAuth, memberController.getMyMember);
router.post(
  '/:memberId/relative',
  requireAuth,
  memberIdParam,
  createRelativeRules,
  validateRequest,
  memberController.addRelative
);
router.get('/:memberId/kutumb', memberIdParam, validateRequest, memberController.getKutumbTree);
router.patch(
  '/:memberId',
  requireAuth,
  memberIdParam,
  updateMemberRules,
  validateRequest,
  memberController.update
);

module.exports = router;
