const { City, State } = require('../models');
const AppError = require('../util/AppError');
const asyncHandler = require('../util/asyncHandler');

exports.listByState = asyncHandler(async (req, res) => {
  const stateId = Number(req.query.state_id);
  const state = await State.findByPk(stateId);
  if (!state) {
    throw new AppError('No state exists with this state_id.', 404);
  }

  const cities = await City.findAll({
    where: { state_id: stateId, status: 1 },
    order: [['city_name', 'ASC']],
  });

  res.status(200).json({
    success: true,
    message: 'Cities retrieved successfully.',
    data: { state_id: stateId, cities },
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const city = await City.findByPk(req.params.cityId, {
    include: [{ model: State, as: 'state', attributes: ['state_id', 'state_name', 'state_code'] }],
  });
  if (!city) {
    throw new AppError('City not found.', 404);
  }
  res.status(200).json({
    success: true,
    message: 'City retrieved successfully.',
    data: { city },
  });
});
