require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./route');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./models');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `No route found for ${req.method} ${req.originalUrl}.`,
  });
});

app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established (hamare).');
  } catch (e) {
    console.error('Unable to connect to the database:', e.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
  });
}

start();
