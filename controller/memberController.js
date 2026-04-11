const { Member, Kutumb, State, City, MemberDetail } = require('../models');
const AppError = require('../util/AppError');
const asyncHandler = require('../util/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.kutumb_id) {
    where.kutumb_id = Number(req.query.kutumb_id);
  }

  const rows = await Member.findAll({
    where,
    include: [
      { model: Kutumb, as: 'kutumb', attributes: ['kutumb_id', 'label'] },
      { model: State, as: 'state', attributes: ['state_id', 'state_name'] },
      { model: City, as: 'city', attributes: ['city_id', 'city_name'] },
      { model: MemberDetail, as: 'detail', required: false },
    ],
    order: [['order_no', 'ASC'], ['id', 'ASC']],
  });

  res.status(200).json({
    success: true,
    message: 'Members retrieved successfully.',
    data: { members: rows },
  });
});

exports.getById = asyncHandler(async (req, res) => {
  const row = await Member.findByPk(req.params.memberId, {
    include: [
      { model: Kutumb, as: 'kutumb' },
      { model: State, as: 'state' },
      { model: City, as: 'city' },
      { model: MemberDetail, as: 'detail', required: false },
    ],
  });
  if (!row) {
    throw new AppError('Member not found.', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Member retrieved successfully.',
    data: { member: row },
  });
});

exports.create = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.user_id == null) {
    payload.user_id = req.userId;
  }
  const row = await Member.create(payload);
  res.status(201).json({
    success: true,
    message: 'Member created successfully.',
    data: { member: row },
  });
});

exports.update = asyncHandler(async (req, res) => {
  const row = await Member.findByPk(req.params.memberId);
  if (!row) {
    throw new AppError('Member not found.', 404);
  }

  const ownerId = row.user_id;
  if (ownerId != null && ownerId !== req.userId) {
    throw new AppError('You can only update members linked to your account.', 403);
  }

  await row.update(req.body);
  res.status(200).json({
    success: true,
    message: 'Member updated successfully.',
    data: { member: row },
  });
});
