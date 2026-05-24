const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const ApiError = require('../utils/ApiError');
const appConfig = require('../config/app');

const { User, UserRole, Role } = db;

const generateTokens = (user) => {
  const payload = { userId: user.id, role: user.role };
  const accessToken = jwt.sign(payload, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn,
  });
  const refreshToken = jwt.sign(payload, appConfig.jwt.refreshSecret, {
    expiresIn: appConfig.jwt.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
};

const register = async ({ email, password, name }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ email, password: hashedPassword, name });

  const buyerRole = await Role.findOne({ where: { name: 'buyer' } });
  if (buyerRole) {
    await UserRole.create({ userId: user.id, roleId: buyerRole.id });
  }

  const role = buyerRole ? 'buyer' : null;
  const tokens = generateTokens({ id: user.id, role });

  const userJson = user.toJSON();
  delete userJson.password;

  return { user: userJson, tokens };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const userRole = await UserRole.findOne({
    where: { userId: user.id },
    include: [{ model: Role, as: 'Role' }],
  });
  const role = userRole ? userRole.Role.name : null;

  const tokens = generateTokens({ id: user.id, role });

  await user.update({ lastLogin: new Date() });

  const userJson = user.toJSON();
  delete userJson.password;

  return { user: userJson, tokens };
};

const refreshToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, appConfig.jwt.refreshSecret);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findByPk(decoded.userId);
  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  const userRole = await UserRole.findOne({
    where: { userId: user.id },
    include: [{ model: Role, as: 'Role' }],
  });
  const role = userRole ? userRole.Role.name : null;

  const accessToken = jwt.sign({ userId: user.id, role }, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn,
  });

  return { accessToken };
};

const logout = async (userId, refreshToken) => {
  return { message: 'Logged out successfully' };
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
};
