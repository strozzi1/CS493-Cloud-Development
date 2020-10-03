const jwt = require('jsonwebtoken');

const secretKey = 'NobodyExpectsTheSpanishInquisition';

// generates an JWT auth token with userId and admin status
exports.generateAuthToken = function (userId, role) {
  const payload = { userId: userId, role: role };
  return jwt.sign(payload, secretKey, {expiresIn: '24h' });
};

// checks for authentication, if invalid authentication stop request.
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
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch (err) {
    console.log("  -- error:", err);
    res.status(401).send({
      error: "Invalid authentication token."
    });
  }
};

// checks for authentication, if invalid will allow user to continue
// as non-user.
exports.checkAuthentication = function (req, res, next) {
  /*
   * Authorization: Bearer <token>
   */
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ?
    authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.userId = payload.userId;
    req.role = payload.role;
    next();
  } catch (err) {
    // if not valid user req.userId and req.role will not be defined
    //req.userId = null;
    //req.role = false;
    next();
  }
};
