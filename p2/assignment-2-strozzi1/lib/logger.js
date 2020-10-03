module.exports = (req, res, next) => {
    console.log("== New request at " + new Date().toString());
    console.log("  -- Method:", req.method);
    console.log("  -- URL:", req.originalUrl);
    console.log("  -- user agent:", req.get('User-Agent'));
    next();
  };