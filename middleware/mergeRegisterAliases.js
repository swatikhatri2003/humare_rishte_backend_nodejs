/** Maps common camelCase keys to snake_case before register validation. */
function mergeRegisterAliases(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    if (req.body.city_id == null && req.body.cityId != null) {
      req.body.city_id = req.body.cityId;
    }
    if (req.body.state_id == null && req.body.stateId != null) {
      req.body.state_id = req.body.stateId;
    }
  }
  next();
}

module.exports = mergeRegisterAliases;
