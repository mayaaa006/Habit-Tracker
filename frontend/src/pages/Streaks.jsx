import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";

const Streaks = () => {
  const { darkMode, setDarkMode } = useTheme();
  const [streaks, setStreaks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New state variables for calendar navigation
  const [displayMonths, setDisplayMonths] = useState(3); // Default to showing 3 months
  const [earliestMonth, setEarliestMonth] = useState(null);
  const [startMonthIndex, setStartMonthIndex] = useState(0); // Index of first month to display

  useEffect(() => {
    // Fetch habits from MongoDB API and calculate streaks
    const fetchHabitsAndCalculateStreaks = async () => {
      try {
        setLoading(true);
        
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Include the token in the request headers
        const response = await axios.get('http://localhost:5000/api/habits', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const habitsData = response.data;
        setHabits(habitsData);
        
        // Inside calculateStreak function in Streaks.jsx
        const calculateStreak = (completedArray) => {
          if (!completedArray || !completedArray.length) return 0;
          
          let streak = 0;
          let today = new Date().setHours(0, 0, 0, 0);
          
          // Sort completions by date, newest first
          const sortedCompletions = [...completedArray].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          
          // Check if streak is current by verifying the most recent completion is today or yesterday
          const mostRecent = new Date(sortedCompletions[0].date).setHours(0, 0, 0, 0);
          const isWithinOneDay = today - mostRecent <= 86400000; // 24 hours in ms
          
          if (!isWithinOneDay) return 0; // Break streak if no recent activity
          
          let currentDate = today;
          for (let i = 0; i < sortedCompletions.length; i++) {
            const completionDate = new Date(sortedCompletions[i].date).setHours(0, 0, 0, 0);
            
            // If this is the current date or the previous consecutive day
            if (completionDate === currentDate || completionDate === currentDate - 86400000) {
              if (completionDate < currentDate) {
                currentDate = completionDate; // Move to the previous day
              }
              streak++;
            } else if (completionDate < currentDate - 86400000) {
              // Found a gap, streak ends
              break;
            }
          }
          
          return streak;
        };

        // Update streak calculation to use the 'completed' array
        const streakData = habitsData.map(habit => ({
          habit: habit.title || habit.name,
          days: habit.completed && habit.completed.length ? calculateStreak(habit.completed) : 0,
          habitId: habit._id
        })).filter(h => h.days > 0);

        setStreaks(streakData);
        
        // If there are habits, select the first one for calendar display
        if (habitsData.length > 0) {
          setSelectedHabit(habitsData[0]);
          // Generate calendar data and determine earliest month for that habit
          const habitStartDate = findEarliestDate(habitsData[0]);
          setEarliestMonth(habitStartDate);
          generateCalendarData(habitsData[0], 0, habitStartDate);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch habits:", err);
        setError("Failed to load streak data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHabitsAndCalculateStreaks();
  }, []);
  
  // Find the earliest date a habit was active (either created date or first completion)
  const findEarliestDate = (habit) => {
    // Default to the habit's creation date if available
    let earliestDate = habit.createdAt ? new Date(habit.createdAt) : new Date();
    
    // If there are completions, check if any are earlier than the creation date
    if (habit.completed && habit.completed.length > 0) {
      const sortedCompletions = [...habit.completed].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      const firstCompletionDate = new Date(sortedCompletions[0].date);
      
      // Use the earlier of the two dates
      if (firstCompletionDate < earliestDate) {
        earliestDate = firstCompletionDate;
      }
    }
    
    // Set to the 1st of the month for consistency
    earliestDate.setDate(1);
    return earliestDate;
  };
  
  const generateCalendarData = (habit, monthsToDisplay = 3, startDate = null) => {
    // Generate calendar data starting from the provided start date
    const today = new Date();
    const calendar = [];
    
    // If no start date is provided, use the earliest month for this habit or default to 3 months ago
    let calendarStartDate;
    if (startDate) {
      calendarStartDate = new Date(startDate);
    } else {
      calendarStartDate = new Date(today);
      calendarStartDate.setMonth(today.getMonth() - (monthsToDisplay - 1));
    }
    
    calendarStartDate.setDate(1); // Start from the 1st of the month
    
    // Calculate end date (today or the end of the current month)
    const endDate = new Date(today);
    
    // Loop through each day from start to end date
    const currentDate = new Date(calendarStartDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check if this date has a completion
      const hasCompletion = habit.completed && habit.completed.some(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.toISOString().split('T')[0] === dateStr;
      });
      
      // Get progress if available
      let progress = 0;
      if (hasCompletion && habit.completed) {
        const entry = habit.completed.find(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.toISOString().split('T')[0] === dateStr;
        });
        
        if (entry) {
          progress = Math.min(Math.round((entry.count / habit.goal) * 100), 100) || entry.progress || 0;
        }
      }
      
      calendar.push({
        date: new Date(currentDate),
        hasCompletion,
        progress
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setCalendarData(calendar);
  };
  
  const handleHabitSelect = (habit) => {
    setSelectedHabit(habit);
    const habitStartDate = findEarliestDate(habit);
    setEarliestMonth(habitStartDate);
    setStartMonthIndex(0); // Reset to show the most recent months
    generateCalendarData(habit, displayMonths, habitStartDate);
  };

  // Function to navigate to previous months
  const showPreviousMonths = () => {
    if (!selectedHabit || !earliestMonth) return;
    
    const newStartIndex = startMonthIndex + displayMonths;
    setStartMonthIndex(newStartIndex);
    
    // Calculate the new start date by going back more months
    const today = new Date();
    const newStartDate = new Date(earliestMonth);
    
    // Find how many months to go back from today
    const monthsFromToday = (today.getFullYear() - earliestMonth.getFullYear()) * 12 + 
                            (today.getMonth() - earliestMonth.getMonth());
    
    // If we've reached the earliest month, don't go back further
    if (newStartIndex >= monthsFromToday) {
      setStartMonthIndex(monthsFromToday);
      generateCalendarData(selectedHabit, displayMonths, earliestMonth);
    } else {
      const adjustedDate = new Date(today);
      adjustedDate.setMonth(today.getMonth() - newStartIndex);
      adjustedDate.setDate(1);
      generateCalendarData(selectedHabit, displayMonths, adjustedDate);
    }
  };

  // Function to navigate to next months (more recent)
  const showNextMonths = () => {
    if (startMonthIndex <= 0) {
      setStartMonthIndex(0);
      return; // Already showing most recent months
    }
    
    const newStartIndex = Math.max(0, startMonthIndex - displayMonths);
    setStartMonthIndex(newStartIndex);
    
    // Calculate the new start date
    const today = new Date();
    const adjustedDate = new Date(today);
    adjustedDate.setMonth(today.getMonth() - newStartIndex);
    adjustedDate.setDate(1);
    
    generateCalendarData(selectedHabit, displayMonths, adjustedDate);
  };

  const getColorIntensity = (progress) => {
    if (progress === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (progress < 25) return 'bg-purple-100 dark:bg-purple-900';
    if (progress < 50) return 'bg-purple-200 dark:bg-purple-800';
    if (progress < 75) return 'bg-purple-300 dark:bg-purple-700';
    if (progress < 100) return 'bg-purple-400 dark:bg-purple-600';
    return 'bg-purple-500 dark:bg-purple-500';
  };

  if (loading) {
    return (
      <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"}`}>
        <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"}`}>
        <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />
        <div className="flex-1 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Group calendar dates by month
  const groupedCalendar = {};
  calendarData.forEach(day => {
    const monthYear = day.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!groupedCalendar[monthYear]) {
      groupedCalendar[monthYear] = [];
    }
    
    groupedCalendar[monthYear].push(day);
  });

  // Calculate if we're viewing the earliest month possible
  const isEarliestMonthShown = earliestMonth && startMonthIndex > 0;
  
  // Calculate if we're viewing the most recent months
  const isLatestMonthShown = startMonthIndex === 0;

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"}`}>
      <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />
      <div className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-purple-800 dark:text-white">Habit Streaks & Rewards</h1>
        
        {/* Current Streaks Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Current Streaks</h2>
          {streaks.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <p className="text-gray-600 dark:text-gray-300">No streaks yet! Stay consistent to earn rewards.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {streaks.map((streak) => (
                <li key={streak.habitId} className="p-4 bg-white dark:bg-gray-700 rounded shadow-md flex items-center">
                  <span className="text-lg mr-2">🔥</span>
                  <div>
                    <span className="font-medium">{streak.habit}</span>
                    <span className="ml-2 text-purple-600 dark:text-purple-400">{streak.days} day streak</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Streak Calendar Section */}
        {habits.length > 0 && (
          <div className="mt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Streak Calendar</h2>
              
              <div className="mt-2 md:mt-0 flex items-center space-x-4">
                <select 
                  value={selectedHabit ? selectedHabit._id : ''}
                  onChange={(e) => {
                    const habit = habits.find(h => h._id === e.target.value);
                    if (habit) handleHabitSelect(habit);
                  }}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-4 text-gray-700 dark:text-white"
                >
                  {habits.map(habit => (
                    <option key={habit._id} value={habit._id}>
                      {habit.title || habit.name}
                    </option>
                  ))}
                </select>
                
                {/* Month navigation buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={showPreviousMonths}
                    disabled={!isEarliestMonthShown}
                    className={`flex items-center justify-center px-3 py-2 rounded-md ${
                      isEarliestMonthShown 
                        ? 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M15 19l-7-7 7-7"></path>
                    </svg>
                    <span className="ml-1">Older</span>
                  </button>
                  
                  <button
                    onClick={showNextMonths}
                    disabled={!isLatestMonthShown}
                    className={`flex items-center justify-center px-3 py-2 rounded-md ${
                      !isLatestMonthShown 
                        ? 'bg-purple-500 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                    }`}
                  >
                    <span className="mr-1">Newer</span>
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Streak Calendar Legend */}
            <div className="flex items-center space-x-2 mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-300">Less</div>
              <div className="h-4 w-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
              <div className="h-4 w-4 bg-purple-100 dark:bg-purple-900 rounded"></div>
              <div className="h-4 w-4 bg-purple-200 dark:bg-purple-800 rounded"></div>
              <div className="h-4 w-4 bg-purple-300 dark:bg-purple-700 rounded"></div>
              <div className="h-4 w-4 bg-purple-400 dark:bg-purple-600 rounded"></div>
              <div className="h-4 w-4 bg-purple-500 dark:bg-purple-500 rounded"></div>
              <div className="text-sm text-gray-600 dark:text-gray-300">More</div>
            </div>
            
            {/* Calendar Grid */}
            <div className="space-y-8">
              {Object.keys(groupedCalendar).map(monthYear => (
                <div key={monthYear} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-200">{monthYear}</h3>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {/* Calendar headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        {day}
                      </div>
                    ))}
                    
                    {/* Empty cells for proper day alignment */}
                    {(() => {
                      const firstDay = groupedCalendar[monthYear][0].date;
                      const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
                      const emptyCells = [];
                      
                      for (let i = 0; i < dayOfWeek; i++) {
                        emptyCells.push(
                          <div key={`empty-${i}`} className="h-10 border border-gray-100 dark:border-gray-700 rounded"></div>
                        );
                      }
                      
                      return emptyCells;
                    })()}
                    
                    {/* Calendar days */}
                    {groupedCalendar[monthYear].map((day, index) => {
                      const isToday = new Date().toDateString() === day.date.toDateString();
                      
                      return (
                        <div 
                          key={index}
                          className={`h-10 flex flex-col items-center justify-center border ${
                            isToday 
                              ? 'border-purple-500 dark:border-purple-400' 
                              : 'border-gray-100 dark:border-gray-700'
                          } rounded ${getColorIntensity(day.progress)}`}
                          title={`${day.date.toLocaleDateString()}: ${day.progress}% completion`}
                        >
                          <span className={`text-xs font-medium ${
                            isToday 
                              ? 'text-purple-800 dark:text-purple-300' 
                              : day.hasCompletion 
                                ? 'text-gray-800 dark:text-gray-200' 
                                : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {day.date.getDate()}
                          </span>
                          {day.hasCompletion && (
                            <span className="text-xs mt-1">
                              {day.progress}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Information about earliest month */}
              {selectedHabit && earliestMonth && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <p>
                    Habit started in: {earliestMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
            
            {/* Streak Statistics */}
            {selectedHabit && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-200">Streak Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Completion Rate */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Completion Rate</h4>
                    <p className="text-xl font-bold text-purple-600">
                      {calendarData.filter(day => day.hasCompletion).length} / {calendarData.length}
                      <span className="text-sm font-normal ml-1">days</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {Math.round((calendarData.filter(day => day.hasCompletion).length / calendarData.length) * 100)}% of days
                    </p>
                  </div>
                  
                  {/* Average Performance */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Progress</h4>
                    <p className="text-xl font-bold text-purple-600">
                      {calendarData.filter(day => day.hasCompletion).length > 0 
                        ? Math.round(calendarData.reduce((sum, day) => sum + day.progress, 0) / calendarData.filter(day => day.hasCompletion).length)
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      per completion day
                    </p>
                  </div>
                  
                  {/* Best Day of Week */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Best Day of Week</h4>
                    {(() => {
                      const dayCountMap = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
                      const progressSum = [0, 0, 0, 0, 0, 0, 0];
                      
                      calendarData.forEach(day => {
                        if (day.hasCompletion) {
                          const dayOfWeek = day.date.getDay();
                          dayCountMap[dayOfWeek]++;
                          progressSum[dayOfWeek] += day.progress;
                        }
                      });
                      
                      // Get best day
                      let bestDayIndex = 0;
                      let bestDayAvg = 0;
                      
                      dayCountMap.forEach((count, index) => {
                        if (count > 0) {
                          const avg = progressSum[index] / count;
                          if (avg > bestDayAvg) {
                            bestDayAvg = avg;
                            bestDayIndex = index;
                          }
                        }
                      });
                      
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      
                      return (
                        <>
                          <p className="text-xl font-bold text-purple-600">
                            {dayCountMap.some(count => count > 0) ? days[bestDayIndex] : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {dayCountMap.some(count => count > 0) ? `${Math.round(bestDayAvg)}% average` : 'Not enough data'}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Streaks;