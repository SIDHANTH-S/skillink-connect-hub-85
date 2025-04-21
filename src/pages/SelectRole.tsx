
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  setActiveRole, 
  isAuthenticated, 
  hasCompletedOnboarding, 
  getUserRoles,
  getPreferredRole,
  saveUserRole
} from "@/utils/auth";
import { Role } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, User, Building, LogOut, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SelectRole = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [userRoles, setUserRoles] = useState<Role[]>([]);

  useEffect(() => {
    // Check if user is authenticated and fetch their roles
    const checkAuthAndRoles = async () => {
      try {
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          navigate("/login");
          return;
        }
        
        // Get existing user roles from Supabase
        const roles = await getUserRoles();
        setUserRoles(roles);
        
        // If user has only one role, automatically redirect to that dashboard
        if (roles.length === 1) {
          const role = roles[0];
          setActiveRole(role);
          navigate(`/dashboard/${role}`);
          return;
        }
        
        // If user has multiple roles, let them choose
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking auth and roles:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user profile. Please try again."
        });
        navigate("/login");
      }
    };
    
    checkAuthAndRoles();
  }, [navigate]);

  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role);
    setIsLoading(true);
    setActiveRole(role);
    
    try {
      // If the user already has this role, just redirect to dashboard
      if (userRoles.includes(role)) {
        navigate(`/dashboard/${role}`);
        return;
      }
      
      // Save the new role to user's profile
      await saveUserRole(role);
      
      // Homeowners don't need onboarding, redirect directly to dashboard
      if (role === 'homeowner') {
        navigate(`/dashboard/${role}`);
        return;
      }
      
      // Check if user has completed onboarding for this role
      const completed = await hasCompletedOnboarding(role);
      
      if (!completed) {
        // Redirect to onboarding if not completed
        navigate(`/onboarding/${role}`);
      } else {
        // Redirect to dashboard
        navigate(`/dashboard/${role}`);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again."
      });
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again."
      });
    }
  };

  const roleCards = [
    {
      id: "homeowner",
      title: "Homeowner",
      description: "Find and book professionals for your projects",
      icon: <Home className="h-12 w-12 mb-4 text-skillink-primary" />,
      color: "bg-gradient-to-br from-blue-50 to-blue-100"
    },
    {
      id: "professional",
      title: "Professional",
      description: "Offer your services to homeowners",
      icon: <User className="h-12 w-12 mb-4 text-skillink-secondary" />,
      color: "bg-gradient-to-br from-purple-50 to-purple-100"
    },
    {
      id: "vendor",
      title: "Vendor",
      description: "Sell materials and supplies to professionals",
      icon: <Building className="h-12 w-12 mb-4 text-skillink-accent" />,
      color: "bg-gradient-to-br from-orange-50 to-orange-100"
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-skillink-light">
        <div className="text-center">
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-skillink-light">
      <div className="w-full max-w-4xl p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-skillink-secondary mb-2">
            Welcome to Skillink 24/7
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            {userRoles.length > 1 
              ? "Select one of your roles to continue" 
              : "Select your role to continue to your personalized dashboard experience"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roleCards.map((card) => {
            const role = card.id as Role;
            const hasRole = userRoles.includes(role);
            
            // For roles the user already has, show "Continue as" button
            // For roles the user doesn't have, show "+ Add Role" button
            const buttonText = hasRole 
              ? `Continue as ${card.title}` 
              : `+ Add ${card.title} Role`;
              
            const buttonIcon = hasRole ? null : <Plus className="mr-1 h-4 w-4" />;
            
            return (
              <Card key={card.id} className={`overflow-hidden ${card.color} border-0 hover:shadow-lg transition-shadow duration-300`}>
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center">{card.icon}</div>
                  <CardTitle className="text-xl text-skillink-dark">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-sm min-h-[40px]">
                    {card.description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    className={`w-full ${hasRole 
                      ? "bg-white text-skillink-primary hover:bg-gray-100 border border-skillink-primary/20" 
                      : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-300"}`}
                    onClick={() => handleRoleSelect(role)}
                    disabled={isLoading && selectedRole === role}
                  >
                    {isLoading && selectedRole === role ? (
                      "Loading..."
                    ) : (
                      <span className="flex items-center">
                        {buttonIcon}
                        {buttonText}
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
