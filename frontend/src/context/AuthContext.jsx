import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create the context
const AuthContext = createContext();

// Create a hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage for user data when component mounts
    const checkStoredUser = () => {
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        // Optional: Check token validity here (e.g., by checking expiry)
        if (parsedUser.tokenExpiry && new Date(parsedUser.tokenExpiry) < new Date()) {
          logout(); // Log out if the token is expired
        } else {
          setUser(parsedUser);
        }
      }
      setLoading(false);
    };

    checkStoredUser();
  }, []);

  // Register user
  const signup = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', userData);
      
      if (response.data) {
        // Store both user data and token for signup
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Check if token exists in response and store it
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Store token expiration date (optional feature)
        const tokenExpiry = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour from now
        response.data.tokenExpiry = tokenExpiry;
        localStorage.setItem('user', JSON.stringify(response.data));
        
        setUser(response.data);
      }
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to register'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', userData);
      
      if (response.data) {
        // Store token first
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Store token expiration date (optional feature)
        const tokenExpiry = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour from now
        response.data.tokenExpiry = tokenExpiry;
        
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);
      }
      
      return response.data;
    } catch (error) {
      setError(
        error.response?.data?.message || 
        error.message || 
        'Invalid credentials'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Context value
  const authContextValue = {
    user,
    isLoading: loading,
    error,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;