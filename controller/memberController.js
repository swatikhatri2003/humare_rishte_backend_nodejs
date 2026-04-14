const { sequelize, Member, Kutumb, State, City, MemberDetail } = require('../models');
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

async function upsertMemberDetailForMember(memberId, detailBody, transaction) {
  const { mobile, email, about } = detailBody;
  let detail = await MemberDetail.findOne({
    where: { member_id: memberId },
    transaction,
  });
  if (detail) {
    await detail.update({ mobile, email, about }, { transaction });
    return detail;
  }
  return MemberDetail.create(
    { member_id: memberId, mobile, email, about },
    { transaction }
  );
}

const memberIncludeDetail = {
  model: MemberDetail,
  as: 'detail',
  required: false,
};

exports.create = asyncHandler(async (req, res) => {
  const { id: memberIdFromBody, detail: detailBody, ...bodyFields } = req.body;
  const payload = { ...bodyFields };
  if (payload.user_id == null) {
    payload.user_id = req.userId;
  }

  const hasDetail =
    detailBody != null && typeof detailBody === 'object' && Object.keys(detailBody).length > 0;

  if (memberIdFromBody != null && memberIdFromBody !== '') {
    const id = Number(memberIdFromBody);
    const row = await Member.findByPk(id);
    if (!row) {
      throw new AppError('Member not found.', 404);
    }
    const ownerId = row.user_id;
    if (ownerId != null && ownerId !== req.userId) {
      throw new AppError('You can only update members linked to your account.', 403);
    }

    if (hasDetail) {
      const t = await sequelize.transaction();
      try {
        await row.update(payload, { transaction: t });
        await upsertMemberDetailForMember(id, detailBody, t);
        await t.commit();
      } catch (e) {
        await t.rollback();
        throw e;
      }
    } else {
      await row.update(payload);
    }

    const updated = await Member.findByPk(id, {
      include: [memberIncludeDetail, { model: Kutumb, as: 'kutumb' }, { model: State, as: 'state' }, { model: City, as: 'city' }],
    });
    return res.status(200).json({
      success: true,
      message: 'Member updated successfully.',
      data: { member: updated },
    });
  }

  if (hasDetail) {
    const t = await sequelize.transaction();
    let row;
    try {
      row = await Member.create(payload, { transaction: t });
      await upsertMemberDetailForMember(row.id, detailBody, t);
      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
    await row.reload({
      include: [memberIncludeDetail, { model: Kutumb, as: 'kutumb' }, { model: State, as: 'state' }, { model: City, as: 'city' }],
    });
    return res.status(201).json({
      success: true,
      message: 'Member created successfully.',
      data: { member: row },
    });
  }

  const row = await Member.create(payload);
  const withAssoc = await Member.findByPk(row.id, {
    include: [memberIncludeDetail, { model: Kutumb, as: 'kutumb' }, { model: State, as: 'state' }, { model: City, as: 'city' }],
  });
  res.status(201).json({
    success: true,
    message: 'Member created successfully.',
    data: { member: withAssoc },
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
