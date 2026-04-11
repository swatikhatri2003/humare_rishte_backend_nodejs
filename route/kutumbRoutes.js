const express = require('express');
const kutumbController = require('../controller/kutumbController');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/auth');
const {
  createKutumbRules,
  updateKutumbRules,
  kutumbIdParam,
  listKutumbsQuery,
} = require('../validators/kutumbValidators');

const router = express.Router();

router.get('/', listKutumbsQuery, validateRequest, kutumbController.list);
router.get('/:kutumbId', kutumbIdParam, validateRequest, kutumbController.getById);
router.post('/', requireAuth, createKutumbRules, validateRequest, kutumbController.create);
router.patch(
  '/:kutumbId',
  requireAuth,
  kutumbIdParam,
  updateKutumbRules,
  validateRequest,
  kutumbController.update
);

module.exports = router;
