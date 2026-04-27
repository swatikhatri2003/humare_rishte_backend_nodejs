const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { Op } = require('sequelize');
const {
  sequelize,
  User,
  Member,
  MemberDetail,
  City,
  State,
  Settings,
} = require('../models');
const AppError = require('../util/AppError');
const asyncHandler = require('../util/asyncHandler');
const { generateOtp, sendEmailOtp, sendSmsOtp } = require('../util/otpDelivery');

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET is not set on the server.', 500);
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/** Returns 10-digit mobile or null (handles +91 / leading 0). */
function normalizeIndianMobile(input) {
  const raw = String(input).replace(/\D/g, '');
  if (raw.length === 12 && raw.startsWith('91')) return raw.slice(2);
  if (raw.length === 11 && raw.startsWith('0')) return raw.slice(1);
  if (raw.length === 10) return raw;
  return null;
}

function normText(s) {
  return String(s).trim().toLowerCase();
}

exports.register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    mobile,
    password,
    gender,
    city,
    city_id: cityIdRaw,
    state,
    state_id: stateIdRaw,
  } = req.body;

  const city_id = Number(cityIdRaw);
  const state_id = Number(stateIdRaw);
  const genderNum = Number(gender);

  const mobileNorm = normalizeIndianMobile(mobile);
  if (!mobileNorm) {
    throw new AppError(
      'Mobile number must be a valid 10-digit Indian number (you can include country code +91).',
      400
    );
  }

  const emailNorm =
    validator.normalizeEmail(String(email).trim()) || String(email).trim().toLowerCase();

  const existing = await User.findOne({
    where: {
      [Op.or]: [{ mobile: mobileNorm }, { email: emailNorm }],
    },
  });
  if (existing) {
    throw new AppError(
      existing.mobile === mobileNorm
        ? 'This mobile number is already registered.'
        : 'This email is already registered.',
      409
    );
  }

  const cityRow = await City.findOne({
    where: { city_id, status: 1 },
  });
  if (!cityRow) {
    throw new AppError('Invalid city_id: no active city found for this id.', 404);
  }

  if (cityRow.state_id !== state_id) {
    throw new AppError(
      'state_id does not match this city. Choose the state that contains the selected city.',
      422
    );
  }

  const stateRow = await State.findOne({
    where: { state_id, status: 1 },
  });
  if (!stateRow) {
    throw new AppError('Invalid state_id: no active state found for this id.', 404);
  }

  if (normText(cityRow.city_name) !== normText(city)) {
    throw new AppError(
      'City name does not match city_id. Send the exact city name for the selected city_id.',
      422
    );
  }
  if (normText(stateRow.state_name) !== normText(state)) {
    throw new AppError(
      'State name does not match state_id. Send the exact state name for the selected state_id.',
      422
    );
  }

  const settingsRow = await Settings.findByPk(1);
  const otpBypass = settingsRow && Number(settingsRow.by_pass_otp) === 1 ? 1 : 0;

  const passwordHash = await bcrypt.hash(password, 10);
  const nameTrim = String(name).trim();

  const t = await sequelize.transaction();
  let user;
  let member;
  let memberDetail;
  try {
    user = await User.create(
      {
        mobile: mobileNorm,
        email: emailNorm,
        password: passwordHash,
        status: 1,
        email_verified: 0,
        mobile_verified: 0,
      },
      { transaction: t }
    );

    member = await Member.create(
      {
        user_id: user.user_id,
        name: nameTrim,
        gender: genderNum,
        state_name: stateRow.state_name,
        city_name: cityRow.city_name,
        state_id,
        city_id,
        village: '',
        status: 1,
        order_no: 1,
        is_vip: 0,
        is_private: 0,
      },
      { transaction: t }
    );

    memberDetail = await MemberDetail.create(
      {
        member_id: member.id,
        mobile: mobileNorm,
        email: emailNorm,
        about: '',
      },
      { transaction: t }
    );

    await t.commit();
  } catch (e) {
    await t.rollback();
    throw e;
  }

  const safeUser = user.toJSON();
  delete safeUser.password;
  delete safeUser.email_otp;
  delete safeUser.mobile_otp;

  const fullMember = member.get({ plain: true });
  const fullMemberDetail = memberDetail.get({ plain: true });

  const data = {
    user: safeUser,
    member: fullMember,
    member_detail: fullMemberDetail,
    otp_bypass: otpBypass,
  };
//token agr otp by pass 1 h to hi aaaaaaega b=vrna nhi aaega
  if (otpBypass === 1) {
    const token = signToken(user.user_id);
    await user.update({ token });
    data.token = token;
    data.user.token = token;
  }

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data,
  });
});

const memberIncludeForLogin = {
  model: Member,
  as: 'members',
  required: false,
  include: [{ model: MemberDetail, as: 'detail', required: false }],
};

exports.login = asyncHandler(async (req, res) => {
  const { mobile, email, password } = req.body;

  const hasMobile = hasTruthy(mobile);
  const hasEmail = hasTruthy(email);
  if (hasMobile && hasEmail) {
    throw new AppError('Send either email or mobile for sign in, not both.', 400);
  }

  let user;
  if (hasMobile) {
    const m = normalizeIndianMobile(mobile);
    if (!m) {
      throw new AppError(
        'Mobile number must be a valid 10-digit Indian number (you can include country code +91).',
        400
      );
    }
    user = await User.findOne({
      where: { mobile: m },
      include: [memberIncludeForLogin],
    });
  } else {
    const raw = String(email).trim();
    const emailNorm = validator.normalizeEmail(raw) || raw.toLowerCase();
    user = await User.findOne({
      where: { email: emailNorm },
      include: [memberIncludeForLogin],
    });
  }
  if (!user) {
    throw new AppError('Invalid mobile/email or password.', 401);
  }

  if (Number(user.status) !== 1) {
    throw new AppError('This account is disabled. Please contact support.', 403);
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new AppError('Invalid mobile/email or password.', 401);
  }

  const token = signToken(user.user_id);
  await user.update({ token });

  const safe = user.toJSON();
  delete safe.password;
  delete safe.email_otp;
  delete safe.mobile_otp;
  safe.token = token;

  res.status(200).json({
    success: true,
    message: 'Signed in successfully.',
    data: { user: safe, token },
  });
});

exports.me = asyncHandler(async (req, res) => {
  const u = req.user.toJSON();
  delete u.password;
  delete u.email_otp;
  delete u.mobile_otp;
  res.status(200).json({
    success: true,
    message: 'Current user profile.',
    data: { user: u },
  });
});

function hasTruthy(v) {
  return v != null && String(v).trim() !== '';
}

async function findUserForOtp(body) {
  const hasEmail = hasTruthy(body.email);
  const hasMobile = hasTruthy(body.mobile);
  const emailNorm = hasEmail
    ? validator.normalizeEmail(String(body.email).trim()) || String(body.email).trim().toLowerCase()
    : null;
  const mobileNorm = hasMobile ? normalizeIndianMobile(body.mobile) : null;
  if (hasMobile && !mobileNorm) {
    throw new AppError(
      'Mobile number must be a valid 10-digit Indian number (you can include country code +91).',
      400
    );
  }

  if (hasEmail && hasMobile) {
    return User.findOne({ where: { email: emailNorm, mobile: mobileNorm } });
  }
  if (hasEmail) {
    return User.findOne({ where: { email: emailNorm } });
  }
  return User.findOne({ where: { mobile: mobileNorm } });
}

/** Which single channel is being verified (email OTP vs mobile OTP). */
function resolveOtpVerifyChannel(body) {
  const hasEmail = hasTruthy(body.email);
  const hasMobile = hasTruthy(body.mobile);
  if (hasEmail && hasMobile) {
    const c = String(body.channel || '').trim().toLowerCase();
    if (c !== 'email' && c !== 'mobile') {
      throw new AppError(
        'When both email and mobile are sent, add channel: "email" or "mobile" to indicate which OTP you are verifying.',
        400
      );
    }
    return c;
  }
  if (hasEmail) return 'email';
  if (hasMobile) return 'mobile';
  throw new AppError('Send at least one of email or mobile in the body.', 400);
}

/** POST body: email and/or mobile — separate OTPs stored in `email_otp` / `mobile_otp` and sent per channel. */
exports.sendOtp = asyncHandler(async (req, res) => {
  const user = await findUserForOtp(req.body);
  if (!user) {
    throw new AppError('No account found for the email/mobile you sent.', 404);
  }

  const sent = [];
  const wantEmail = hasTruthy(req.body.email);
  const wantMobile = hasTruthy(req.body.mobile);

  const patch = {};
  let emailOtpVal;
  let mobileOtpVal;
  if (wantEmail) {
    emailOtpVal = generateOtp();
    patch.email_otp = emailOtpVal;
  }
  if (wantMobile) {
    mobileOtpVal = generateOtp();
    patch.mobile_otp = mobileOtpVal;
  }
  await user.update(patch);

  if (wantEmail) {
    const r = await sendEmailOtp(user.email, emailOtpVal);
    sent.push(r);
  }
  if (wantMobile) {
    const r = await sendSmsOtp(user.mobile, mobileOtpVal);
    sent.push(r);
  }

  res.status(200).json({
    success: true,
    message: 'OTP has been sent to the requested channel(s).',
    data: { channels: sent },
  });
});

/** POST body: email and/or mobile (to locate user), otp, and optional channel when both identifiers are sent. */
exports.verifyOtp = asyncHandler(async (req, res) => {
  const channel = resolveOtpVerifyChannel(req.body);
  const user = await findUserForOtp(req.body);
  if (!user) {
    throw new AppError('No account found for the email/mobile you sent.', 404);
  }

  const given = String(req.body.otp).trim();
  const updatePayload =
    channel === 'email'
      ? { email_verified: 1, email_otp: null }
      : { mobile_verified: 1, mobile_otp: null };

  if (channel === 'email') {
    if (!user.email_otp || given !== String(user.email_otp).trim()) {
      throw new AppError('Invalid or expired email OTP.', 400);
    }
  } else if (!user.mobile_otp || given !== String(user.mobile_otp).trim()) {
    throw new AppError('Invalid or expired mobile OTP.', 400);
  }

  const token = signToken(user.user_id);
  await user.update({ ...updatePayload, token });
  await user.reload();

  const safe = user.toJSON();
  delete safe.password;
  delete safe.email_otp;
  delete safe.mobile_otp;

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully.',
    data: {
      user: safe,
      token,
      email_verified: Number(safe.email_verified) === 1,
      mobile_verified: Number(safe.mobile_verified) === 1,
    },
  });
});

/**
 * Forgot password: client must first call POST /auth/otp/send with email or mobile to receive OTP.
 * Then POST here with the same identifier(s), otp, and new_password (or password).
 * Email OTP is checked when only email is sent (or channel=email); mobile OTP when only mobile (or channel=mobile).
 */
exports.forgotPasswordReset = asyncHandler(async (req, res) => {
  const channel = resolveOtpVerifyChannel(req.body);
  const user = await findUserForOtp(req.body);
  if (!user) {
    throw new AppError('No account found for the email/mobile you sent.', 404);
  }

  if (Number(user.status) !== 1) {
    throw new AppError('This account is disabled. Please contact support.', 403);
  }

  const given = String(req.body.otp).trim();
  if (channel === 'email') {
    if (!user.email_otp || given !== String(user.email_otp).trim()) {
      throw new AppError('Invalid or expired email OTP.', 400);
    }
  } else if (!user.mobile_otp || given !== String(user.mobile_otp).trim()) {
    throw new AppError('Invalid or expired mobile OTP.', 400);
  }

  const newPass = hasTruthy(req.body.new_password)
    ? String(req.body.new_password)
    : String(req.body.password);

  const passwordHash = await bcrypt.hash(newPass, 10);
  const token = signToken(user.user_id);
  await user.update({
    password: passwordHash,
    email_otp: null,
    mobile_otp: null,
    token,
  });
  await user.reload();

  const safe = user.toJSON();
  delete safe.password;
  delete safe.email_otp;
  delete safe.mobile_otp;

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully. You can sign in with your new password.',
    data: {
      user: safe,
      token,
    },
  });
});
