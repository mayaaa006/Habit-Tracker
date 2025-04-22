const Habit = require('../models/Habit');
const User = require('../models/User');
const asyncHandler = require('express-async-handler'); // If you're using this

// @desc    Create new habit
// @route   POST /api/habits
// @access  Private
const createHabit = asyncHandler(async (req, res) => {
  const { title, description, frequency, goal } = req.body;

  const habit = await Habit.create({
    title,
    description,
    frequency,
    goal,
    user: req.user.id
  });

  res.status(201).json(habit);
});

// @desc    Get user habits
// @route   GET /api/habits
// @access  Private
const getHabits = asyncHandler(async (req, res) => {
  const habits = await Habit.find({ user: req.user.id });
  res.status(200).json(habits);
});

// @desc    Get single habit
// @route   GET /api/habits/:id
// @access  Private
const getHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Check if habit belongs to user
  if (habit.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  res.status(200).json(habit);
});

// @desc    Update habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Check if habit belongs to user
  if (habit.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedHabit = await Habit.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedHabit);
});

// @desc    Delete habit
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = asyncHandler(async (req, res) => {
  const habit = await Habit.findById(req.params.id);

  if (!habit) {
    res.status(404);
    throw new Error('Habit not found');
  }

  // Check if habit belongs to user
  if (habit.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await habit.deleteOne();
  res.status(200).json({ id: req.params.id });
});

// @desc    Complete a habit for today
// @route   POST /api/habits/:id/complete
// @access  Private


// @desc    Complete a habit for today
// @route   POST /api/habits/:id/complete
// @access  Private
// Replace the existing completeHabit function in habitController.js with this:

// @desc    Complete a habit for today
// @route   POST /api/habits/:id/complete
// @access  Private
const completeHabit = asyncHandler(async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    
    if (!habit) {
      res.status(404);
      throw new Error('Habit not found');
    }

    // Check if habit belongs to user
    if (habit.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized');
    }

    console.log("Request body:", req.body);
    const requestCount = req.body.count || 1;
    console.log("Request count:", requestCount);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's entry if it exists
    const todayIndex = habit.completed.findIndex(
      item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === today.getTime();
      }
    );

    console.log("Today's index:", todayIndex);

    // Update or create today's entry
    if (todayIndex !== -1) {
      // Update existing entry
      habit.completed[todayIndex].count = Math.min(requestCount, habit.goal);
      console.log("Updated count:", habit.completed[todayIndex].count);
    } else {
      // Create new entry for today
      habit.completed.push({
        date: today,
        count: Math.min(requestCount, habit.goal)
      });
      console.log("Created new entry with count:", Math.min(requestCount, habit.goal));
    }

    // Check if the habit is completed for today (reached goal)
    const isCompletedToday = 
      (todayIndex !== -1 && habit.completed[todayIndex].count >= habit.goal) ||
      (todayIndex === -1 && Math.min(requestCount, habit.goal) >= habit.goal);

    // Update streak only if completing the goal today
    if (isCompletedToday) {
      console.log("Habit completed for today, updating streak");
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if yesterday was completed
      const yesterdayCompleted = habit.completed.some(
        item => {
          const itemDate = new Date(item.date);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate.getTime() === yesterday.getTime() && 
                 item.count >= habit.goal;
        }
      );
      
      if (yesterdayCompleted) {
        habit.streak += 1;
        console.log("Incremented streak to:", habit.streak);
      } else {
        habit.streak = 1;
        console.log("Reset streak to 1");
      }
    }

    await habit.save();
    res.status(200).json(habit);
  } catch (error) {
    console.error("Error in completeHabit:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
  completeHabit
};