const express = require('express');
const authRoutes = require('./authRoutes');
const stateRoutes = require('./stateRoutes');
const cityRoutes = require('./cityRoutes');
const communityRoutes = require('./communityRoutes');
const kutumbRoutes = require('./kutumbRoutes');
const memberRoutes = require('./memberRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running.',
    data: { service: 'humare-rishte-api' },
  });
});

router.use('/auth', authRoutes);
router.use('/states', stateRoutes);
router.use('/cities', cityRoutes);
router.use('/communities', communityRoutes);
router.use('/kutumbs', kutumbRoutes);
router.use('/members', memberRoutes);

module.exports = router;
