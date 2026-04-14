const express = require('express');
const stateController = require('../controller/stateController');
const validateRequest = require('../middleware/validateRequest');
const { stateIdParam, postStatesOrCitiesBody } = require('../validators/stateValidators');

const router = express.Router();

// router.get('/', stateController.list);
router.post('/', postStatesOrCitiesBody, validateRequest, stateController.postListStatesOrCities);
// router.get('/:stateId/cities', stateIdParam, validateRequest, stateController.getByIdWithCities);
// router.get('/:stateId', stateIdParam, validateRequest, stateController.getById);

module.exports = router;
