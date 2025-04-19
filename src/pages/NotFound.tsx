import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HardHat, Home } from "lucide-react";
import { isAuthenticated, getActiveRole } from "@/utils/auth";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleNavigateHome = () => {
    if (isAuthenticated()) {
      const activeRole = getActiveRole();
      if (activeRole) {
        navigate(`/dashboard/${activeRole}`);
      } else {
        navigate("/select-role");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-skillink-light">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-4">
          <div className="bg-skillink-primary p-3 rounded-full text-white">
            <HardHat size={32} />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-skillink-secondary mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! We couldn't find that page</p>
        <Button
          onClick={handleNavigateHome}
          className="bg-skillink-primary hover:bg-skillink-dark text-white"
        >
          <Home className="mr-2 h-4 w-4" />
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
