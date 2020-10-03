const jwt = require('jsonwebtoken');

const secretKey = 'SuperSecret123';

exports.generateAuthToken = function (userEmail, admin) {
  const payload = { sub: userEmail, admin: admin};
  return jwt.sign(payload, secretKey, { expiresIn: '24h' });
};

exports.requireAuthentication = function (req, res, next) {
  /*
   * Authorization: Bearer <token>
   */
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ?
    authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload.sub;
    req.admin = payload.admin;
    next();
  } catch (err) {
    console.error("  -- error:", err);
    res.status(401).send({
      error: "Invalid authentication token"
    });
  }
};

exports.adminTestAuthentication = function (req, res, next) {
  /*
   * Authorization: Bearer <token>
   */
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ?
    authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload.sub;
    req.admin = payload.admin;
    next();
  } catch (err) {
    req.admin = 0;
    next();
  }
};
