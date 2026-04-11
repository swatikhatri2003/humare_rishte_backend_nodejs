const express = require('express');
const memberController = require('../controller/memberController');
const memberDetailController = require('../controller/memberDetailController');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/auth');
const {
  createMemberRules,
  updateMemberRules,
  memberIdParam,
  listMembersQuery,
} = require('../validators/memberValidators');
const {
  upsertMemberDetailRules,
  memberIdForDetailParam,
} = require('../validators/memberDetailValidators');

const router = express.Router();

router.get('/', listMembersQuery, validateRequest, memberController.list);
router.get('/:memberId/detail', memberIdForDetailParam, validateRequest, memberDetailController.getByMemberId);
router.put(
  '/:memberId/detail',
  requireAuth,
  memberIdForDetailParam,
  upsertMemberDetailRules,
  validateRequest,
  memberDetailController.upsertByMemberId
);
router.get('/:memberId', memberIdParam, validateRequest, memberController.getById);
router.post('/', requireAuth, createMemberRules, validateRequest, memberController.create);
router.patch(
  '/:memberId',
  requireAuth,
  memberIdParam,
  updateMemberRules,
  validateRequest,
  memberController.update
);

module.exports = router;
