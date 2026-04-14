const fs = require('fs');
const path = require('path');

const PREFIX = '/uploads/communities/';

function absolutePathFromPublicUrl(publicUrl) {
  if (!publicUrl || typeof publicUrl !== 'string') return null;
  if (!publicUrl.startsWith(PREFIX)) return null;
  return path.join(__dirname, '..', publicUrl.replace(/^\//, ''));
}

/** Safe delete for logos stored under uploads/communities (ignores missing files). */
function deleteCommunityLogoFile(publicUrl) {
  const abs = absolutePathFromPublicUrl(publicUrl);
  if (!abs) return;
  try {
    fs.unlinkSync(abs);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
}

module.exports = {
  deleteCommunityLogoFile,
};
