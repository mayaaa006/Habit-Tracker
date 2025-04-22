// src/lib/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users/';

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL, userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get user profile
const getMe = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await axios.get(API_URL + 'me', config);
  return response.data;
};

// Fetch habits
const fetchHabits = async () => {
  const response = await fetch('/api/habits', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Could not fetch habits');
  return data;
};

// Fetch habit
const fetchHabit = async (id) => {
  const response = await fetch(`/api/habits/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Could not fetch habit');
  return data;
};

// Create habit
const createHabit = async (habitData) => {
  const response = await fetch('/api/habits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(habitData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Could not create habit');
  return data;
};

// Update habit
const updateHabit = async (id, habitData) => {
  const response = await fetch(`/api/habits/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(habitData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Could not update habit');
  return data;
};

// Delete habit
const deleteHabit = async (id) => {
  const response = await fetch(`/api/habits/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Could not delete habit');
  return data;
};

// Complete habit
const completeHabit = async (id) => {
  const response = await fetch(`/api/habits/${id}/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Could not complete habit');
  return data;
};


const authService = {
  register,
  login,
  logout,
  getMe,
  completeHabit,
  deleteHabit,
  updateHabit,
  createHabit,
  fetchHabit,
  fetchHabits
};

export default authService;