const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const City = sequelize.define(
  'city',
  {
    city_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    city_name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city_code: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: 'city',
    timestamps: false,
  }
);

module.exports = City;
