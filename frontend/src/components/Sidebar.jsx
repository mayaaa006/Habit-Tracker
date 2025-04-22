import { Link } from "react-router-dom";
import { FiHome, FiPlusCircle, FiMoon, FiSun, FiLogOut, FiTrendingUp, FiClock, FiBell, FiBarChart2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext"; 


const Sidebar = ({ setDarkMode, darkMode }) => {
  const { logout } = useAuth();
  return (
    <div className="w-64 h-screen bg-pink-200 dark:bg-gray-800 shadow-lg flex flex-col transition-all duration-500">
      <div className="p-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-purple-800 dark:text-white">
          Momentum
        </h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-4">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 text-lg font-medium text-purple-900 
              dark:text-white hover:bg-pink-300 dark:hover:bg-purple-700 rounded-md transition-all duration-500"
            >
              <FiHome className="mr-2" /> Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/add-habit"
              className="flex items-center px-4 py-2 text-lg font-medium text-purple-900 
              dark:text-white hover:bg-pink-300 dark:hover:bg-purple-700 rounded-md transition-all duration-500"
            >
              <FiPlusCircle className="mr-2" /> Add Habit
            </Link>
          </li>
          <li>
            <Link
              to="/streaks"
              className="flex items-center px-4 py-2 text-lg font-medium text-purple-900 
              dark:text-white hover:bg-pink-300 dark:hover:bg-purple-700 rounded-md transition-all duration-500"
            >
              <FiTrendingUp className="mr-2" /> Streaks
            </Link>
          </li>
          <li>
            <Link
              to="/pomodoro"
              className="flex items-center px-4 py-2 text-lg font-medium text-purple-900 
              dark:text-white hover:bg-pink-300 dark:hover:bg-purple-700 rounded-md transition-all duration-500"
            >
              <FiClock className="mr-2" /> Pomodoro Timer
            </Link>
          </li>
          <li>
            <Link
              to="/notes"
              className="flex items-center px-4 py-2 text-lg font-medium text-purple-900 
              dark:text-white hover:bg-pink-300 dark:hover:bg-purple-700 rounded-md transition-all duration-500"
            >
              <FiBell className="mr-2" /> Notes
            </Link>
          </li>
          <li>
            <Link
              to="/insights"
              className="flex items-center px-4 py-2 text-lg font-medium text-purple-900 
              dark:text-white hover:bg-pink-300 dark:hover:bg-purple-700 rounded-md transition-all duration-500"
            >
              <FiBarChart2 className="mr-2" /> Insights
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 flex flex-col space-y-4">
        <button
          className="w-full flex items-center justify-center px-4 py-2 
          bg-purple-500 dark:bg-gray-600 text-white rounded-md shadow-md 
          hover:bg-purple-600 dark:hover:bg-gray-500 transition-all duration-500"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <FiSun className="mr-2" /> : <FiMoon className="mr-2" />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        
        <button
          className="w-full flex items-center justify-center px-4 py-2 
          bg-red-500 dark:bg-red-700 text-white rounded-md shadow-md 
          hover:bg-red-600 dark:hover:bg-red-800 transition-all duration-500" onClick={logout}
        >
          <FiLogOut className="mr-2" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
