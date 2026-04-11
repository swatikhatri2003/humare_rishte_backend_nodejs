const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define(
  'User',
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    
    mobile: {
      type: DataTypes.STRING(12),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    email_otp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    mobile_otp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    email_verified: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    mobile_verified: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = User;
