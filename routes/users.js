const express = require('express');
const router = express.Router({ mergeParams: true });
 
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUser
} = require('../controllers/users');

const User = require('../models/User');

const advanceResults = require('../middleware/advanceResult');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(advanceResults(User), getUsers)
  .post(createUser)

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

module.exports = router;
