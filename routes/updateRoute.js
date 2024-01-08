const express = require('express');

const router = express.Router();

const isLoggedIn = require('../middleware/isLoggedIn');

const indexGetController = require('../controllers/login/get');

const indexPostController = require('../controllers/login/post');

router.get(
  '/',
    isLoggedIn,
    indexGetController
);

router.post(
  '/',
    isLoggedIn,
    indexPostController
);

module.exports = router;
