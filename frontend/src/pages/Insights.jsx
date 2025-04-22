import { useTheme } from "../context/ThemeContext";
import Sidebar from "../components/Sidebar";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from "chart.js";
import axios from "axios";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const Insights = () => {
  const { darkMode, setDarkMode } = useTheme(); 
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState('all');
  const [detailedInsight, setDetailedInsight] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch habits from MongoDB API
    const fetchHabits = async () => {
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
        
        setHabits(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch habits:", err);
        setError("Failed to load habits. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, []);

  const calculateStatistics = (progressData) => {
    if (!progressData || progressData.length === 0) return null;
    
    // Sort by date
    const sortedData = [...progressData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate average progress
    const totalProgress = sortedData.reduce((sum, entry) => sum + entry.progress, 0);
    const averageProgress = totalProgress / sortedData.length;
    
    // Calculate trend (comparing first half to second half)
    const midPoint = Math.floor(sortedData.length / 2);
    const firstHalf = sortedData.slice(0, midPoint);
    const secondHalf = sortedData.slice(midPoint);
    
    const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.progress, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.progress, 0) / secondHalf.length;
    
    const trend = secondHalfAvg - firstHalfAvg;
    
    // Find best and worst days
    const bestDay = sortedData.reduce((best, entry) => 
      entry.progress > best.progress ? entry : best, sortedData[0]);
    
    const worstDay = sortedData.reduce((worst, entry) => 
      entry.progress < worst.progress ? entry : worst, sortedData[0]);
    
    // Current streak
    let currentStreak = 0;
    let today = new Date().setHours(0, 0, 0, 0);
    let dayCheck = today;
    
    for (let i = sortedData.length - 1; i >= 0; i--) {
      const entryDate = new Date(sortedData[i].date).setHours(0, 0, 0, 0);
      
      if (dayCheck - entryDate > 86400000) {
        // Gap found
        break;
      }
      
      currentStreak++;
      dayCheck = entryDate - 86400000; // Move to previous day
    }
    
    return {
      averageProgress: averageProgress.toFixed(1),
      trend: trend.toFixed(1),
      bestDay: {
        date: new Date(bestDay.date).toLocaleDateString(),
        progress: bestDay.progress
      },
      worstDay: {
        date: new Date(worstDay.date).toLocaleDateString(),
        progress: worstDay.progress
      },
      currentStreak,
      totalDays: sortedData.length
    };
  };

  const filterProgressData = (progressData, timeFrame) => {
    if (timeFrame === 'all') return progressData;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeFrame) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return progressData;
    }
    
    return progressData.filter(entry => new Date(entry.date) >= cutoffDate);
  };

  const handlePointClick = (habit, progressData) => {
    const stats = calculateStatistics(progressData);
    setDetailedInsight({
      habit,
      stats
    });
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

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"}`}>
      <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-800 dark:text-white">Habit Insights & Analytics</h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setSelectedTimeFrame('week')}
              className={`px-3 py-1 rounded-md ${selectedTimeFrame === 'week' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setSelectedTimeFrame('month')}
              className={`px-3 py-1 rounded-md ${selectedTimeFrame === 'month' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setSelectedTimeFrame('year')}
              className={`px-3 py-1 rounded-md ${selectedTimeFrame === 'year' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white'}`}
            >
              Year
            </button>
            <button 
              onClick={() => setSelectedTimeFrame('all')}
              className={`px-3 py-1 rounded-md ${selectedTimeFrame === 'all' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-white'}`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Summary Stats Section */}
        {habits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Habits</h3>
              <p className="text-2xl font-bold text-purple-600">{habits.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Active Habits</h3>
              <p className="text-2xl font-bold text-purple-600">
                {habits.filter(h => h.completed && h.completed.length > 0).length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Check-ins</h3>
              <p className="text-2xl font-bold text-purple-600">
                {habits.reduce((sum, habit) => sum + (habit.completed ? habit.completed.length : 0), 0)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">Avg. Completion</h3>
              <p className="text-2xl font-bold text-purple-600">
                {habits.length > 0 ? 
                  Math.round(habits.reduce((sum, habit) => {
                    const progressData = habit.progressHistory || 
                      (habit.completed ? habit.completed.map(entry => ({
                        progress: Math.min(Math.round((entry.count / habit.goal) * 100), 100) || entry.progress || 0
                      })) : []);
                    
                    if (progressData.length === 0) return sum;
                    
                    const avgProgress = progressData.reduce((pSum, entry) => pSum + entry.progress, 0) / progressData.length;
                    return sum + avgProgress;
                  }, 0) / habits.filter(h => h.completed && h.completed.length > 0).length) + '%'
                  : '0%'
                }
              </p>
            </div>
          </div>
        )}

        {/* If no habits exist, show a message and Add Habit button */}
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              No habits found! Start tracking your progress by adding a new habit.
            </p>
            <button
              onClick={() => navigate("/add-habit")}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Add Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {habits.map((habit) => {
              // Try to use progressHistory or convert from completed array
              const progressData = habit.progressHistory || 
              (habit.completed ? habit.completed.map(entry => ({
                date: entry.date,
                progress: Math.min(Math.round((entry.count / habit.goal) * 100), 100) || entry.progress || 0
              })) : []);
      
              if (progressData.length === 0) {
                return null; // Skip habits with no progress data
              }

              const filteredData = filterProgressData(progressData, selectedTimeFrame);
              
              if (filteredData.length === 0) {
                return (
                  <div key={habit._id} className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-md">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      {habit.title || habit.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">No data available for selected time period</p>
                  </div>
                );
              }

              const labels = filteredData.map((entry) =>
                new Date(entry.date).toLocaleDateString()
              );

              const data = {
                labels,
                datasets: [
                {
                  label: `${habit.title || habit.name} Progress`,
                  data: filteredData.map((entry) => entry.progress),
                  borderColor: "#8B5CF6",
                  backgroundColor: "rgba(139, 92, 246, 0.5)",
                  tension: 0.4,
                },
                ],
              };

              // Calculate statistics for the habit
              const stats = calculateStatistics(filteredData);

              const options = {
                responsive: true,
                plugins: {
                  tooltip: {
                    callbacks: {
                      title: function(context) {
                        return context[0].label;
                      },
                      label: function(context) {
                        const dataIndex = context.dataIndex;
                        const progress = filteredData[dataIndex].progress;
                        return `Progress: ${progress}%`;
                      },
                      afterLabel: function(context) {
                        const dataIndex = context.dataIndex;
                        const date = new Date(filteredData[dataIndex].date);
                        
                        // Get day of week
                        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                        
                        // Basic tooltip enhancement
                        return `Day: ${dayOfWeek}`;
                      }
                    }
                  }
                },
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const dataIndex = elements[0].index;
                    const clickedData = filteredData[dataIndex];
                    handlePointClick(habit, filteredData);
                  }
                }
              };

              return (
                <div key={habit._id} className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-md">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    {habit.title || habit.name}
                  </h2>
                  {stats && (
                    <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600 dark:text-gray-300">
                        Avg: {stats.averageProgress}%
                      </div>
                      <div className={`${parseFloat(stats.trend) > 0 ? 'text-green-500' : parseFloat(stats.trend) < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        Trend: {stats.trend > 0 ? '+' : ''}{stats.trend}%
                      </div>
                    </div>
                  )}
                  <Line data={data} options={options} />
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Insight Modal */}
        {detailedInsight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-purple-800 dark:text-white">
                  {detailedInsight.habit.title || detailedInsight.habit.name} Insights
                </h3>
                <button 
                  onClick={() => setDetailedInsight(null)}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {detailedInsight.stats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Progress</h4>
                      <p className="text-2xl font-bold text-purple-600">{detailedInsight.stats.averageProgress}%</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Streak</h4>
                      <p className="text-2xl font-bold text-purple-600">{detailedInsight.stats.currentStreak} days</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Day</h4>
                      <p className="font-medium">{detailedInsight.stats.bestDay.date}</p>
                      <p className="text-green-500">{detailedInsight.stats.bestDay.progress}%</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trend</h4>
                      <p className={`text-lg font-medium ${
                        parseFloat(detailedInsight.stats.trend) > 0 
                          ? 'text-green-500' 
                          : parseFloat(detailedInsight.stats.trend) < 0 
                            ? 'text-red-500' 
                            : 'text-gray-500'
                      }`}>
                        {detailedInsight.stats.trend > 0 ? '+' : ''}{detailedInsight.stats.trend}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {parseFloat(detailedInsight.stats.trend) > 0 
                          ? 'Improving' 
                          : parseFloat(detailedInsight.stats.trend) < 0 
                            ? 'Declining' 
                            : 'Stable'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Performance Analysis</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      {parseFloat(detailedInsight.stats.trend) > 5 
                        ? "Great improvement! You're making excellent progress on this habit." 
                        : parseFloat(detailedInsight.stats.trend) > 0 
                          ? "Steady improvement. Keep up the good work!" 
                          : parseFloat(detailedInsight.stats.trend) < -5 
                            ? "This habit has been declining significantly. Consider what challenges you're facing."
                            : parseFloat(detailedInsight.stats.trend) < 0 
                              ? "Slight decline in progress. Try to refocus on this habit."
                              : "Consistent performance. Consider increasing your goal to challenge yourself."}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tracking for {detailedInsight.stats.totalDays} days
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;