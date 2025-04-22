const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a habit title']
  },
  description: {
    type: String
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  goal: {
    type: Number,
    default: 1
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: [{
    date: {
      type: Date,
      required: true
    },
    count: {
      type: Number,
      default: 1
    }
  }],
  streak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Habit', habitSchema);