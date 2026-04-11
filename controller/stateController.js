const { State, City } = require('../models');
const AppError = require('../util/AppError');
const asyncHandler = require('../util/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const rows = await State.findAll({
    where: { status: 1 },
    order: [['state_name', 'ASC']],
  });
  res.status(200).json({
    success: true,
    message: 'States retrieved successfully.',
    data: { states: rows },
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const state = await State.findByPk(req.params.stateId);
  if (!state) {
    throw new AppError('State not found.', 404);
  }
  res.status(200).json({
    success: true,
    message: 'State retrieved successfully.',
    data: { state },
  });
});

exports.getByIdWithCities = asyncHandler(async (req, res) => {
  const state = await State.findByPk(req.params.stateId, {
    include: [{ model: City, as: 'cities', where: { status: 1 }, required: false }],
  });
  if (!state) {
    throw new AppError('State not found.', 404);
  }
  res.status(200).json({
    success: true,
    message: 'State and cities retrieved successfully.',
    data: { state },
  });
});

/**
 * POST body empty or without state_id → all active states.
 * POST body { state_id } → all active cities for that state.
 */
exports.postListStatesOrCities = asyncHandler(async (req, res) => {
  const raw = req.body && Object.prototype.hasOwnProperty.call(req.body, 'state_id')
    ? req.body.state_id
    : undefined;

  const wantsCities =
    raw !== undefined &&
    raw !== null &&
    typeof raw !== 'boolean' &&
    !(typeof raw === 'string' && raw.trim() === '');

  if (!wantsCities) {
    const states = await State.findAll({
      where: { status: 1 },
      order: [['state_name', 'ASC']],
    });
    return res.status(200).json({
      success: true,
      message: 'States retrieved successfully.',
      data: { states },
    });
  }

  const stateId = Number(raw);
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
