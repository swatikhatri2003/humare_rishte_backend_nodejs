const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const State = sequelize.define(
  'state',
  {
    state_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    state_name: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },
    state_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: 'state',
    timestamps: false,
  }
);

module.exports = State;
