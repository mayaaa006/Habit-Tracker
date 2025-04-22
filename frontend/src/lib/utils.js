/**
 * Utility functions for the Habit Tracker application
 */

// Format a date to a readable string
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Get color for progress bar based on completion percentage
export function getProgressColor(progress) {
  if (progress === 0) return 'bg-gray-300';
  if (progress <= 25) return 'bg-orange-400';
  if (progress <= 50) return 'bg-yellow-400';
  if (progress <= 75) return 'bg-blue-400';
  return 'bg-green-400';
}

// Convert progress percentage to a status label
export function getProgressStatus(progress) {
  if (progress === 0) return 'Not Started';
  if (progress <= 25) return 'Just Beginning';
  if (progress <= 50) return 'In Progress';
  if (progress <= 75) return 'Well Underway';
  if (progress < 100) return 'Almost There';
  return 'Completed';
}

// Format a number to have a + sign if it's positive
export function formatChange(value) {
  if (value > 0) return `+${value}`;
  return value.toString();
}

// Generate unique ID (simple implementation)
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Clamp a number between min and max values
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Calculate the current streak based on completion history
 * Streak is defined as the number of consecutive days a habit has been completed
 * If a day is skipped, the streak resets to 0
 * 
 * @param {Array} completedEntries - Array of completed habit entries with date and count
 * @returns {Number} - The current streak count
 */
export function calculateStreak(completedEntries) {
  if (!completedEntries || completedEntries.length === 0) return 0;
  
  // Sort entries by date (newest first)
  const sortedEntries = [...completedEntries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Check today first
  const todayEntry = sortedEntries.find(entry => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    return entryDate.getTime() === currentDate.getTime();
  });
  
  // If no entry for today, check if there was an entry yesterday to maintain streak
  if (!todayEntry) {
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayEntry = sortedEntries.find(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === yesterday.getTime();
    });
    
    // If no entry yesterday either, streak is 0
    if (!yesterdayEntry) return 0;
    
    // Start counting from yesterday
    currentDate = yesterday;
  }
  
  // Count consecutive days
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    entryDate.setHours(0, 0, 0, 0);
    
    // Check if this entry matches our current date we're looking for
    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      // Move to the previous day to continue checking
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (entryDate.getTime() < currentDate.getTime()) {
      // We found an older entry, which means we broke the streak
      break;
    }
    // If entry date is in the future, just ignore it and continue
  }
  
  return streak;
}