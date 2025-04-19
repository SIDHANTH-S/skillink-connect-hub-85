
import { useEffect, useState } from "react";
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
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const authenticated = await isAuthenticated();
        if (!authenticated) {
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
        if (requireOnboarding) {
          const completed = await hasCompletedOnboarding(activeRole);
          if (!completed) {
            navigate(`/onboarding/${activeRole}`);
            return;
          }
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate, allowedRoles, requireOnboarding]);
  
  if (isChecking) {
    return <div>Loading...</div>;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
