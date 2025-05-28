import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [showFeatures, setShowFeatures] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark", !darkMode);
  };

  const handleLearnMoreClick = () => {
    const nextState = !showFeatures;
    setShowFeatures(nextState);
    if (nextState) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-200 text-gray-900"
      } px-4`}
    >
      <header className="absolute top-0 w-full flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold tracking-wide">Momentum</h1>
        <button
          onClick={() => navigate("/auth")}
          className="bg-purple-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-purple-700 transition"
        >
          Log In / Sign Up
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-5xl font-extrabold mb-6 leading-tight">
          Build Better Habits.
          <br />
          One Day at a Time.
        </h2>
        <p className="text-lg mb-8 max-w-xl">
          Track your progress, stay accountable, and watch your habits transform your life.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/auth")}
            className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition"
          >
            Get Started
          </button>
          <button
            onClick={handleLearnMoreClick}
            className="px-6 py-3 border border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-pink-300 hover:bg-opacity-50 dark:hover:bg-gray-800 transition"
          >
            {showFeatures ? "Show Less" : "Learn More"}
          </button>
        </div>
      </main>

      {showFeatures && (
        <>
          <section
            id="features"
            className={`w-full py-16 text-center ${
              darkMode 
                ? "bg-gray-800" 
                : "bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 backdrop-blur-sm"
            }`}
          >
            <h3 className="text-3xl font-bold mb-6">Our Key Features</h3>
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 px-4">
              <div className={`p-6 rounded-lg shadow-lg backdrop-blur-sm ${
                darkMode 
                  ? "bg-gray-700" 
                  : "bg-white bg-opacity-70 hover:bg-opacity-90"
              } transition-all duration-300 hover:shadow-xl hover:scale-105`}>
                <h4 className="text-xl font-semibold mb-3">Track Progress</h4>
                <p>
                  Monitor your habits and track progress over time with simple,
                  effective tools.
                </p>
              </div>
              <div className={`p-6 rounded-lg shadow-lg backdrop-blur-sm ${
                darkMode 
                  ? "bg-gray-700" 
                  : "bg-white bg-opacity-70 hover:bg-opacity-90"
              } transition-all duration-300 hover:shadow-xl hover:scale-105`}>
                <h4 className="text-xl font-semibold mb-3">Stay Accountable</h4>
                <p>
                  Get reminders and notifications to keep you on track with your
                  goals.
                </p>
              </div>
              <div className={`p-6 rounded-lg shadow-lg backdrop-blur-sm ${
                darkMode 
                  ? "bg-gray-700" 
                  : "bg-white bg-opacity-70 hover:bg-opacity-90"
              } transition-all duration-300 hover:shadow-xl hover:scale-105`}>
                <h4 className="text-xl font-semibold mb-3">Visual Insights</h4>
                <p>
                  Visualize your habit progress with graphs and charts to stay
                  motivated.
                </p>
              </div>
            </div>
          </section>

          <footer className={`text-sm py-4 ${
            darkMode 
              ? "text-gray-400" 
              : "text-gray-700"
          }`}>
            &copy; {new Date().getFullYear()} Momentum. All rights reserved.
          </footer>
        </>
      )}

      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className={`fixed bottom-4 left-4 p-2 rounded-full shadow-md transition ${
          darkMode
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-white bg-opacity-80 text-gray-800 hover:bg-opacity-100 backdrop-blur-sm"
        }`}
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? "🌙" : "🌞"}
      </button>
    </div>
  );
};

export default LandingPage;