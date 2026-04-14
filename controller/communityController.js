const { Community } = require('../models');
const AppError = require('../util/AppError');
const asyncHandler = require('../util/asyncHandler');
const { deleteCommunityLogoFile } = require('../util/communityLogoFile');

const UPDATABLE_FIELDS = [
  'community_name',
  'color_code',
  'community_logo',
  'community_description',
  'community_date',
  'meta_title',
  'meta_key',
  'meta_description',
  'content',
];

function buildPartialPatch(body) {
  const patch = {};
  for (const key of UPDATABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      patch[key] = body[key];
    }
  }
  return patch;
}

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
  const rawId = req.body.id;
  const isUpdate =
    rawId !== undefined && rawId !== null && String(rawId).trim() !== '';

  if (isUpdate) {
    const id = Number(rawId);
    const existing = await Community.findByPk(id);
    if (!existing) {
      throw new AppError('Community not found.', 404);
    }

    const oldLogo = existing.community_logo;
    const patch = buildPartialPatch(req.body);

    await existing.update(patch);
    await existing.reload();

    if (oldLogo && oldLogo !== existing.community_logo) {
      deleteCommunityLogoFile(oldLogo);
    }

    return res.status(200).json({
      success: true,
      message: 'Community updated successfully.',
      data: { community: existing },
    });
  }

  const { id: _omit, ...createPayload } = req.body;
  const community = await Community.create(createPayload);

  res.status(201).json({
    success: true,
    message: 'Community created successfully.',
    data: { community },
  });
});
