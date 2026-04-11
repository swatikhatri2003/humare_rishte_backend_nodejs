const jwt = require('jsonwebtoken');
const AppError = require('../util/AppError');
const { User } = require('../models');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new AppError('Authentication required. Send Authorization: Bearer <token>.', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('Server is not configured for authentication (JWT_SECRET missing).', 500);
    }

    const decoded = jwt.verify(token, secret);
    const userId = decoded.userId ?? decoded.user_id;
    if (!userId) {
      throw new AppError('Invalid token payload.', 401);
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'email_otp', 'mobile_otp'] },
    });
    if (!user) {
      throw new AppError('User no longer exists.', 401);
    }

    req.user = user;
    req.userId = user.user_id;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { requireAuth };
