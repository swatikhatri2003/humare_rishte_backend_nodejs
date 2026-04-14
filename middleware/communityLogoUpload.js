const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'uploads', 'communities');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const safe =
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/** Set req.body.community_logo from saved file so validators / DB see a string. */
function attachLogoUrlFromFile(req, _res, next) {
  if (req.file) {
    req.body.community_logo = `/uploads/communities/${req.file.filename}`;
  }
  next();
}

module.exports = {
  uploadCommunityLogo: upload.single('community_logo'),
  attachLogoUrlFromFile,
};
