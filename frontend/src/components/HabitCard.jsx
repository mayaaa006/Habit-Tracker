import { getProgressColor, calculateStreak } from '../lib/utils';

const HabitCard = ({ habit }) => {
  // Calculate progress based on completed entries
  const calculateProgress = () => {
    if (!habit.completed || habit.completed.length === 0) return 0;
    
    // Check for today's entry
    const today = new Date().setHours(0, 0, 0, 0);
    const todayEntry = habit.completed.find(
      item => new Date(item.date).setHours(0, 0, 0, 0) === today
    );
    
    if (!todayEntry) return 0;
    
    // Calculate percentage based on goal
    return Math.min(Math.round((todayEntry.count / habit.goal) * 100), 100);
  };
  
  const progress = calculateProgress();
  const currentStreak = calculateStreak(habit.completed);
  
  return (
    <div className="bg-purple-100 dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-semibold text-purple-800 dark:text-white mb-2">{habit.title}</h3>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        Added on: {new Date(habit.createdAt).toLocaleDateString()}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {habit.frequency} • Goal: {habit.goal} times
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
        <div 
          className={`h-2.5 rounded-full ${getProgressColor(progress)}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-right text-sm text-gray-600 dark:text-gray-400">
        {progress}% complete
      </div>
      {currentStreak > 0 && (
        <div className="mt-2 text-sm font-medium text-orange-500">
          🔥 {currentStreak} day streak
        </div>
      )}
    </div>
  );
};

export default HabitCard;