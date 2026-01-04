import type {ReactNode} from "react";
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { LoadingOverlay } from '@mantine/core';

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'operator')[];
}

/**
 * Route guard component that checks if the user is authenticated
 * and optionally if they have the required role
 */
export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };

    verifyAuth();
  }, [checkAuth]);

  // Show loading while checking authentication
  if (isChecking) {
    return <LoadingOverlay visible={true} />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Deus me ajude !!!! " + isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/app/dashboard" replace />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
}

export default RequireAuth;
