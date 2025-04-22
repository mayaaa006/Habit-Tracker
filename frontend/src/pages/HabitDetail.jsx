import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import HabitProgressChart from "../components/HabitProgressChart";
import { useTheme } from "../context/ThemeContext";
import { getProgressColor, calculateStreak } from "../lib/utils";

const HabitDetail = () => {
  const { darkMode, setDarkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHabit = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/habits/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch habit');
        }
        
        setHabit(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHabit();
  }, [id]);

const completeHabit = async () => {
  try {
    // Check if habit has already been completed today (reached 100%)
    const today = new Date().setHours(0, 0, 0, 0);
    const todayEntry = habit.completed.find(
      item => new Date(item.date).setHours(0, 0, 0, 0) === today
    );
    
    // Current count (if an entry exists for today)
    const currentCount = todayEntry ? todayEntry.count : 0;
    
    // If already completed fully today, don't allow marking again
    if (currentCount >= habit.goal) {
      setError("You've already completed this habit today!");
      // Auto-clear the error after 3 seconds
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    // Increment count by 1
    const newCount = currentCount + 1;
    
    console.log(`Sending request with count: ${newCount}, current: ${currentCount}, goal: ${habit.goal}`);
    
    const response = await fetch(`http://localhost:5000/api/habits/${id}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        date: new Date().toISOString(),
        count: newCount
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to complete habit');
    }
    
    console.log("Response from server:", data);
    
    // Update the habit state with the new data
    setHabit(data);
    
  } catch (err) {
    console.error("Error in completeHabit:", err);
    setError(err.message);
  }
};

  const deleteHabit = async () => {
    if (!window.confirm('Are you sure you want to delete this habit?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/habits/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete habit');
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculate today's progress
  const calculateTodayProgress = () => {
    if (!habit || !habit.completed || habit.completed.length === 0) return 0;
    
    const today = new Date().setHours(0, 0, 0, 0);
    const todayEntry = habit.completed.find(
      item => new Date(item.date).setHours(0, 0, 0, 0) === today
    );
    
    if (!todayEntry) return 0;
    
    // Calculate percentage based on goal
    return Math.min(Math.round((todayEntry.count / habit.goal) * 100), 100);
  };

  if (loading) {
    return (
      <div className={`flex h-screen justify-center items-center ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen justify-center items-center ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"
      }`}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-red-600 text-xl mb-2">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className={`flex h-screen justify-center items-center ${
        darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"
      }`}>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-gray-700 dark:text-gray-300 text-xl mb-2">Habit not found</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const todayProgress = calculateTodayProgress();
  const currentStreak = calculateStreak(habit.completed);

  return (
    <div className={`flex h-screen transition-all duration-400 ${
      darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"
    }`}>
      {/* Sidebar */}
      <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-pink-100 dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2 text-purple-800 dark:text-white">{habit.title}</h1>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Added on: {new Date(habit.createdAt).toLocaleDateString()}
          </div>
          
          {habit.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{habit.description}</p>
          )}
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Today's Progress</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
              <div 
                className={`h-4 rounded-full ${getProgressColor(todayProgress)}`} 
                style={{ width: `${todayProgress}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-600 dark:text-gray-400">
              {todayProgress}% complete
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-white">Track Progress</h3>
            <button
              onClick={completeHabit}
              className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors mr-2"
            >
              Mark as Complete
            </button>
            
            {currentStreak > 0 && (
              <span className="ml-3 text-orange-500 font-medium">
                🔥 {currentStreak} day streak
              </span>
            )}
          </div>
          
          <button 
            onClick={deleteHabit} 
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition"
          >
            Delete Habit
          </button>
        </div>
        
        <div className="bg-purple-100 dark:bg-gray-800 rounded-lg shadow-md p-6">
          <HabitProgressChart habit={habit} />
        </div>
      </div>
    </div>
  );
};

export default HabitDetail;