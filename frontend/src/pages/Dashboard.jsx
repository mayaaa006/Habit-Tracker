import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import HabitCard from "../components/HabitCard";
import { useTheme } from "../context/ThemeContext";

const Dashboard = () => {
  const { darkMode, setDarkMode } = useTheme();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Don't set error state here to avoid showing error message for user data
      }
    };

    const fetchHabits = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/api/habits', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch habits');
        }
        
        const data = await response.json();
        setHabits(data);
      } catch (error) {
        console.error('Error fetching habits:', error);
        setError('Failed to load your habits. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch both user data and habits
    fetchUserData();
    fetchHabits();
  }, []);

  // Get current time to determine greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className={`flex h-screen transition-all duration-400 ${
      darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"
    }`}>
      {/* Sidebar */}
      <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Welcome Message */}
        {user && (
          <div className="mb-6">
            <h1 className={`text-2xl font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
              {getGreeting()}, <span className="font-bold text-purple-600 dark:text-purple-400">{user.name}</span>!
            </h1>
            <p className={`mt-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Here's an overview of your habit tracking journey.
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-800 dark:text-white">
            Track Your Daily Habits
          </h1>
          <Link 
            to="/add-habit" 
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Add Habit
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-blue-100 dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              You haven't added any habits yet. Click on "Add Habit" to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map(habit => (
              <Link to={`/habit/${habit._id}`} key={habit._id}>
                <HabitCard habit={habit} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;