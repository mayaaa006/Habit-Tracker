import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AuthForm from "../components/AuthForm";


const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const { darkMode, setDarkMode } = useTheme();

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-200 to-pink-200"}`}>
      <Sidebar setDarkMode={setDarkMode} darkMode={darkMode} />
      <div className="flex-1 flex items-center justify-center">
        <AuthForm isSignup={isSignup} setIsSignup={setIsSignup} />
      </div>
    </div>
  );
};

export default Auth;
