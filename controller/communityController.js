const { Community } = require('../models');
const AppError = require('../util/AppError');
const asyncHandler = require('../util/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const rows = await Community.findAll({
    order: [['community_name', 'ASC']],
  });
  res.status(200).json({
    success: true,
    message: 'Communities retrieved successfully.',
    data: { communities: rows },
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const row = await Community.findByPk(req.params.communityId);
  if (!row) {
    throw new AppError('Community not found.', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Community retrieved successfully.',
    data: { community: row },
  });
});

exports.create = asyncHandler(async (req, res) => {
  const community = await Community.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Community created successfully.',
    data: { community },
  });
});
