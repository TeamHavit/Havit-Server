const express = require('express');
const router = express.Router();

router.get('/', require('./healthCheckGET'));

module.exports = router;