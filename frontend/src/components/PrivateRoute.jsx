import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useContext(AuthContext);

  // Show loading spinner while checking user authentication status
  if (isLoading) {
    return <Loader />;
  }

  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If user is authenticated, render the children components
  return children;
};

export default PrivateRoute;
