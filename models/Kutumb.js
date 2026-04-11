const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Kutumb = sequelize.define(
  'kutumb',
  {
    kutumb_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    caste_name: { type: DataTypes.INTEGER, allowNull: false },
    sur_name: { type: DataTypes.INTEGER, allowNull: false },
    sub_sur_name: { type: DataTypes.INTEGER, allowNull: false },
    gotra: { type: DataTypes.INTEGER, allowNull: false },
    community_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    state_name: { type: DataTypes.INTEGER, allowNull: false },
    city_name: { type: DataTypes.INTEGER, allowNull: false },
    state_id: { type: DataTypes.INTEGER, allowNull: false },
    city_id: { type: DataTypes.INTEGER, allowNull: false },
    village: { type: DataTypes.INTEGER, allowNull: true },
    latitude: { type: DataTypes.STRING(150), allowNull: true },
    longitude: { type: DataTypes.STRING(150), allowNull: true },
    address: { type: DataTypes.STRING(150), allowNull: true },
    is_ancient: { type: DataTypes.TINYINT, allowNull: false },
    is_private: { type: DataTypes.TINYINT, allowNull: false },
    symbol: { type: DataTypes.STRING(150), allowNull: false },
    label: { type: DataTypes.STRING(150), allowNull: false },
  },
  {
    tableName: 'kutumb',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = Kutumb;
