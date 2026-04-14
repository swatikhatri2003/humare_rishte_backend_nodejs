const express = require('express');
const cityController = require('../controller/cityController');
const validateRequest = require('../middleware/validateRequest');
const { listCitiesRules, cityIdParam } = require('../validators/cityValidators');

const router = express.Router();

// router.get('/', listCitiesRules, validateRequest, cityController.listByState);
// router.get('/:cityId', cityIdParam, validateRequest, cityController.getById);

module.exports = router;
