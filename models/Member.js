const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Member = sequelize.define(
  'Member',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    gender: { type: DataTypes.INTEGER, allowNull: false },
    father_name: { type: DataTypes.STRING(100), allowNull: true },
    mother_name: { type: DataTypes.STRING(100), allowNull: true },
    father_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    mother_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    spouse_name: { type: DataTypes.STRING(100), allowNull: true },
    spouse_id: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    dob: { type: DataTypes.DATEONLY, allowNull: true },
    is_expired: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    photo: { type: DataTypes.STRING(200), allowNull: true },
    state_name: { type: DataTypes.STRING(100), allowNull: false },
    city_name: { type: DataTypes.STRING(100), allowNull: false },
    state_id: { type: DataTypes.INTEGER, allowNull: false },
    city_id: { type: DataTypes.INTEGER, allowNull: false },
    village: { type: DataTypes.STRING(150), allowNull: false },
    status: { type: DataTypes.INTEGER, allowNull: false },
    kutumb_id: { type: DataTypes.INTEGER, allowNull: true },
    spouse_kutumb_id: { type: DataTypes.INTEGER, allowNull: true },
    order_no: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    is_vip: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
    is_private: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  },
  {
    tableName: 'members',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Member;
