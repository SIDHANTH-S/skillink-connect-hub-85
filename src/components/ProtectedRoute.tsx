
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveRole, isAuthenticated, hasCompletedOnboarding } from "@/utils/auth";
import { Role } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireOnboarding = true,
}) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }
      
      // Get current role
      const activeRole = getActiveRole();
      
      // If no role is selected, redirect to role selection
      if (!activeRole) {
        navigate("/select-role");
        return;
      }
      
      // If specific roles are required and current role isn't in the list
      if (allowedRoles.length > 0 && !allowedRoles.includes(activeRole)) {
        navigate(`/dashboard/${activeRole}`);
        return;
      }
      
      // Check if onboarding is required but not completed
      if (requireOnboarding && !hasCompletedOnboarding(activeRole)) {
        navigate(`/onboarding/${activeRole}`);
        return;
      }
    };
    
    checkAuth();
  }, [navigate, allowedRoles, requireOnboarding]);
  
  return <>{children}</>;
};

export default ProtectedRoute;
