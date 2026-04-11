const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MemberDetail = sequelize.define(
  'members_detail',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    about: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    tableName: 'members_detail',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

module.exports = MemberDetail;
