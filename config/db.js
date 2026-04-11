require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'hamare',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3307,
    dialect: 'mysql',
    // Persist/read DATETIME as India Standard Time (IST, UTC+5:30).
    timezone: process.env.DB_TIMEZONE || '+05:30',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      freezeTableName: true,
      underscored: false,
    },
    dialectOptions: {
      decimalNumbers: true,
    },
  }
);

module.exports = sequelize;
