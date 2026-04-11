const { MemberDetail, Member } = require('../models');
const AppError = require('../util/AppError');
const asyncHandler = require('../util/asyncHandler');

exports.getByMemberId = asyncHandler(async (req, res) => {
  const member = await Member.findByPk(req.params.memberId);
  if (!member) {
    throw new AppError('Member not found.', 404);
  }

  const detail = await MemberDetail.findOne({ where: { member_id: member.id } });
  if (!detail) {
    throw new AppError('No contact details found for this member.', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Member details retrieved successfully.',
    data: { detail },
  });
});

exports.upsertByMemberId = asyncHandler(async (req, res) => {
  const member = await Member.findByPk(req.params.memberId);
  if (!member) {
    throw new AppError('Member not found.', 404);
  }

  if (member.user_id != null && member.user_id !== req.userId) {
    throw new AppError('You can only manage details for your own members.', 403);
  }

  const { mobile, email, about } = req.body;
  let detail = await MemberDetail.findOne({ where: { member_id: member.id } });

  if (detail) {
    await detail.update({ mobile, email, about });
    res.status(200).json({
      success: true,
      message: 'Member details updated successfully.',
      data: { detail },
    });
    return;
  }

  detail = await MemberDetail.create({
    member_id: member.id,
    mobile,
    email,
    about,
  });

  res.status(201).json({
    success: true,
    message: 'Member details created successfully.',
    data: { detail },
  });
});
