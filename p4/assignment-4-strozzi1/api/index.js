const router = require('express').Router();

router.use('/businesses', require('./businesses'));
router.use('/photos', require('./photos'));
router.use('/media', require('./media'));

module.exports = router;
