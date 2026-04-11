const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Settings = sequelize.define(
  'Settings',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    by_pass_otp: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'settings',
    timestamps: false,
  }
);

module.exports = Settings;
