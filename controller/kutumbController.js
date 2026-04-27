const { sequelize, Kutumb, Community, State, City, User, Member } = require('../models');
const AppError = require('../util/AppError');
const asyncHandler = require('../util/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.community_id) {
    where.community_id = Number(req.query.community_id);
  }

  const rows = await Kutumb.findAll({
    where,
    include: [
      { model: Community, as: 'community', attributes: ['community_id', 'community_name'] },
      { model: State, as: 'state', attributes: ['state_id', 'state_name'] },
      { model: City, as: 'city', attributes: ['city_id', 'city_name'] },
    ],
    order: [['kutumb_id', 'DESC']],
  });

  res.status(200).json({
    success: true,
    message: 'Kutumb records retrieved successfully.',
    data: { kutumbs: rows },
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const row = await Kutumb.findByPk(req.params.kutumbId, {
    include: [
      { model: Community, as: 'community' },
      { model: State, as: 'state' },
      { model: City, as: 'city' },
      { model: User, as: 'owner', attributes: { exclude: ['password'] } },
    ],
  });
  if (!row) {
    throw new AppError('Kutumb not found.', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Kutumb retrieved successfully.',
    data: { kutumb: row },
  });
});

exports.create = asyncHandler(async (req, res) => {
  const { kutumb_id: kutumbIdFromBody, ...bodyFields } = req.body;
  const payload = { ...bodyFields, user_id: req.userId };
  if (payload.status == null || payload.status === '') {
    payload.status = 1;
  }

  if (kutumbIdFromBody != null && kutumbIdFromBody !== '') {
    const kutumbId = Number(kutumbIdFromBody);
    const row = await Kutumb.findByPk(kutumbId);
    if (!row) {
      throw new AppError('Kutumb not found.', 404);
    }
    if (row.user_id !== req.userId) {
      throw new AppError('You can only update kutumb records that you created.', 403);
    }
    await row.update(payload);
    return res.status(200).json({
      success: true,
      message: 'Kutumb updated successfully.',
      data: { kutumb: row },
    });
  }

  const row = await Kutumb.create(payload);
  res.status(201).json({
    success: true,
    message: 'Kutumb created successfully.',
    data: { kutumb: row },
  });
});
