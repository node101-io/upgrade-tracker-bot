const express = require('express');

const router = express.Router();

const isLoggedIn = require('../middleware/isLoggedIn');

const indexGetController = require('../controllers/index/get');
const filterPostController = require('../controllers/filter/post');

router.get(
  '/',
    isLoggedIn,
    indexGetController
);

router.post(
  '/',
    isLoggedIn,
    filterPostController
);

module.exports = router;
