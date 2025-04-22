import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";

const Pomodoro = () => {
  const { darkMode, setDarkMode } = useTheme();
  const [currentTimer, setCurrentTimer] = useState("pomodoro");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const audio = useRef(new Audio("https://www.freespecialeffects.co.uk/soundfx/aircraft_cockpit/radar.wav"));

  const durations = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 10 * 60,
  };

  useEffect(() => {
    if (isRunning) {
      const end = Date.now() + timeLeft * 1000;
      intervalRef.current = setInterval(() => {
        const remaining = Math.floor((end - Date.now()) / 1000);
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          setTimeLeft(0);
          audio.current.play();
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleModeChange = (mode) => {
    setCurrentTimer(mode);
    setTimeLeft(durations[mode]);
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  const startTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  };

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-r from-blue-200 to-pink-200"}`}>
      <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6 text-purple-800 dark:text-white">Pomodoro Timer</h1>

        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded-md ${currentTimer === 'pomodoro' ? 'bg-purple-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}
            onClick={() => handleModeChange("pomodoro")}
          >
            Pomodoro
          </button>
          <button
            className={`px-4 py-2 rounded-md ${currentTimer === 'short' ? 'bg-purple-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}
            onClick={() => handleModeChange("short")}
          >
            Short Break
          </button>
          <button
            className={`px-4 py-2 rounded-md ${currentTimer === 'long' ? 'bg-purple-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}
            onClick={() => handleModeChange("long")}
          >
            Long Break
          </button>
        </div>

        <div className="text-6xl font-bold mb-6">{formatTime(timeLeft)}</div>
        <div className="space-x-4">
          <button className="px-4 py-2 bg-green-500 text-white rounded-md" onClick={startTimer}>Start</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-md" onClick={stopTimer}>Stop</button>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
