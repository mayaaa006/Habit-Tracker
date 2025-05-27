import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddHabit from "./pages/AddHabit";
import HabitDetail from "./pages/HabitDetail";
import Streaks from "./pages/Streaks";
import Pomodoro from "./pages/Pomodoro";
import Insights from "./pages/Insights";
import Notes from "./pages/Notes";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/auth" 
          element={<Auth />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/add-habit" 
          element={
            <PrivateRoute>
              <AddHabit />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/habit/:id" 
          element={
            <PrivateRoute>
              <HabitDetail />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/streaks" 
          element={
            <PrivateRoute>
              <Streaks />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/pomodoro" 
          element={
            <PrivateRoute>
              <Pomodoro />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/notes" 
          element={
            <PrivateRoute>
              <Notes />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/insights" 
          element={
            <PrivateRoute>
              <Insights />
            </PrivateRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
