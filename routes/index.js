const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('../middleware/auth');

router.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

module.exports = router;