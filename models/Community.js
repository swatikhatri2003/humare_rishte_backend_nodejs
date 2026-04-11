const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Community = sequelize.define(
  'community',
  {
    community_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    community_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    color_code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    community_logo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    community_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    community_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    meta_title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    meta_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'community',
    timestamps: false,
  }
);

module.exports = Community;
