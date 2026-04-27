const { sequelize, Member, Kutumb, State, City, MemberDetail } = require('../models');
const AppError = require('../util/AppError');
const asyncHandler = require('../util/asyncHandler');

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
  if (memberIdFromBody != null && memberIdFromBody !== '') {
    throw new AppError('POST /members does not update. Use PATCH /members/:memberId instead.', 400);
  }
  const payload = { ...bodyFields };
  if (payload.user_id == null) {
    payload.user_id = req.userId;
  }

  const hasDetail =
    detailBody != null && typeof detailBody === 'object' && Object.keys(detailBody).length > 0;

  if (hasDetail) {
    const t = await sequelize.transaction();
    let row;
    try {
      row = await Member.create(payload, { transaction: t });
      if (detailBody.about == null) detailBody.about = '';
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

function buildTree(members, rootId) {
  const byId = new Map(members.map((m) => [Number(m.id), m]));
  const childrenByParent = new Map(); // parentId -> childIds[]

  for (const m of members) {
    const fid = Number(m.father_id || 0);
    const mid = Number(m.mother_id || 0);
    if (fid) {
      const arr = childrenByParent.get(fid) || [];
      arr.push(Number(m.id));
      childrenByParent.set(fid, arr);
    }
    if (mid) {
      const arr = childrenByParent.get(mid) || [];
      arr.push(Number(m.id));
      childrenByParent.set(mid, arr);
    }
  }

  const visited = new Set();
  const dfs = (id) => {
    if (!id || visited.has(id)) return null;
    visited.add(id);
    const node = byId.get(id);
    if (!node) return null;

    const fatherId = Number(node.father_id || 0) || null;
    const motherId = Number(node.mother_id || 0) || null;
    const spouseId = Number(node.spouse_id || 0) || null;
    const childIds = childrenByParent.get(id) || [];

    return {
      member: node,
      father: fatherId ? dfs(fatherId) : null,
      mother: motherId ? dfs(motherId) : null,
      spouse: spouseId ? dfs(spouseId) : null,
      children: childIds.map((cid) => dfs(cid)).filter(Boolean),
    };
  };

  return dfs(Number(rootId));
}

/** First member row for this user (registration profile) — used as vanshavali root. */
exports.getMyMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({
    where: { user_id: req.userId },
    order: [['id', 'ASC']],
    include: [memberIncludeDetail, { model: Kutumb, as: 'kutumb' }],
  });
  if (!member) {
    throw new AppError('No member profile found for this account.', 404);
  }
  res.status(200).json({
    success: true,
    message: 'Your member profile.',
    data: { member },
  });
});

exports.getKutumbTree = asyncHandler(async (req, res) => {
  const root = await Member.findByPk(req.params.memberId, {
    include: [memberIncludeDetail, { model: Kutumb, as: 'kutumb' }],
  });
  if (!root) throw new AppError('Member not found.', 404);

  const where = {};
  if (root.kutumb_id) where.kutumb_id = root.kutumb_id;
  else if (root.user_id) where.user_id = root.user_id;
  else where.id = root.id;

  const members = await Member.findAll({
    where,
    include: [memberIncludeDetail],
    order: [['order_no', 'ASC'], ['id', 'ASC']],
  });

  const tree = buildTree(members, root.id);
  res.status(200).json({
    success: true,
    message: 'Kutumb tree retrieved successfully.',
    data: { rootId: root.id, kutumb_id: root.kutumb_id || null, members, tree },
  });
});

exports.addRelative = asyncHandler(async (req, res) => {
  const base = await Member.findByPk(req.params.memberId);
  if (!base) throw new AppError('Member not found.', 404);
  if (base.user_id != null && base.user_id !== req.userId) {
    throw new AppError('You can only add relatives for your own members.', 403);
  }

  const { relation, member: memberBody, detail: detailBody } = req.body;

  const t = await sequelize.transaction();
  try {
    const relativePayload = {
      ...memberBody,
      user_id: base.user_id ?? req.userId,
      kutumb_id: base.kutumb_id ?? memberBody.kutumb_id ?? null,
      state_id: memberBody.state_id ?? base.state_id,
      city_id: memberBody.city_id ?? base.city_id,
      state_name: memberBody.state_name ?? base.state_name,
      city_name: memberBody.city_name ?? base.city_name,
      village: memberBody.village ?? base.village ?? '',
      status: memberBody.status ?? 1,
      order_no: memberBody.order_no ?? 0,
      is_vip: memberBody.is_vip ?? 0,
      is_private: memberBody.is_private ?? 0,
      is_expired: memberBody.is_expired ?? 0,
    };

    // Relation-specific linkage
    if (relation === 'father') {
      relativePayload.gender = relativePayload.gender ?? 1;
    } else if (relation === 'mother') {
      relativePayload.gender = relativePayload.gender ?? 2;
    } else if (relation === 'spouse') {
      // gender is required in table; default to opposite of base (fallback: 2)
      const baseGender = Number(base.gender);
      relativePayload.gender = relativePayload.gender ?? (baseGender === 2 ? 1 : 2);
    }

    if (relation === 'son' || relation === 'daughter') {
      relativePayload.gender = relativePayload.gender ?? (relation === 'son' ? 1 : 2);
      const baseGender = Number(base.gender);
      const spouseId = Number(base.spouse_id || 0);
      let spouse = null;
      if (spouseId) {
        spouse = await Member.findByPk(spouseId, { transaction: t });
      }

      // Primary parent = the member you clicked (base). If base has a linked spouse, set the other parent too.
      if (baseGender === 2) {
        relativePayload.mother_id = base.id;
        relativePayload.mother_name = base.name;
        if (spouse) {
          relativePayload.father_id = spouse.id;
          relativePayload.father_name = spouse.name;
        }
      } else {
        relativePayload.father_id = base.id;
        relativePayload.father_name = base.name;
        if (spouse) {
          relativePayload.mother_id = spouse.id;
          relativePayload.mother_name = spouse.name;
        }
      }
    }

    const relative = await Member.create(relativePayload, { transaction: t });

    const hasDetail =
      detailBody != null && typeof detailBody === 'object' && Object.keys(detailBody).length > 0;
    if (hasDetail) {
      // DB column is NOT NULL but can be an empty string.
      if (detailBody.about == null) detailBody.about = '';
      await upsertMemberDetailForMember(relative.id, detailBody, t);
    }

    if (relation === 'father') {
      await base.update(
        { father_id: relative.id, father_name: relative.name },
        { transaction: t }
      );
    } else if (relation === 'mother') {
      await base.update(
        { mother_id: relative.id, mother_name: relative.name },
        { transaction: t }
      );
    } else if (relation === 'spouse') {
      await base.update(
        { spouse_id: relative.id, spouse_name: relative.name },
        { transaction: t }
      );
      await relative.update(
        { spouse_id: base.id, spouse_name: base.name },
        { transaction: t }
      );
    }

    await t.commit();

    const updatedBase = await Member.findByPk(base.id, { include: [memberIncludeDetail] });
    const createdRelative = await Member.findByPk(relative.id, { include: [memberIncludeDetail] });

    res.status(201).json({
      success: true,
      message: 'Relative created and linked successfully.',
      data: {
        base: updatedBase,
        relative: createdRelative,
        relation,
      },
    });
  } catch (e) {
    await t.rollback();
    throw e;
  }
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
