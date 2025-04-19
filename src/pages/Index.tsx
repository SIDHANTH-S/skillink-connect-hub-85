import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getActiveRole } from "@/utils/auth";
import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect based on auth state
    if (isAuthenticated()) {
      const activeRole = getActiveRole();
      if (activeRole) {
        navigate(`/dashboard/${activeRole}`);
      } else {
        navigate("/select-role");
      }
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-skillink-light">
      <div className="text-center max-w-2xl px-4">
        <div className="flex justify-center mb-6">
          <div className="bg-skillink-primary p-4 rounded-full text-white">
            <HardHat size={48} />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-skillink-secondary">Welcome to Skillink 24/7</h1>
        <p className="text-xl text-gray-600 mb-8">
          Connecting homeowners with professionals and vendors in the construction industry
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            className="bg-skillink-primary hover:bg-skillink-dark text-white px-8 py-2 text-lg"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
