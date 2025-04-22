const express = require('express');
const router = express.Router();
const {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
  completeHabit
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

// Individual route protection instead of router.use(protect)
router.route('/')
  .get(protect, getHabits)
  .post(protect, createHabit);

router.route('/:id')
  .get(protect, getHabit)
  .put(protect, updateHabit)
  .delete(protect, deleteHabit);

router.route('/:id/complete')
  .post(protect, completeHabit);

module.exports = router;