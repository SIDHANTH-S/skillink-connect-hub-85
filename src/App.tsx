
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated, getActiveRole } from "@/utils/auth";

// Auth pages
import Login from "./pages/Login";
import SelectRole from "./pages/SelectRole";

// Dashboard pages
import HomeownerDashboard from "./pages/dashboard/HomeownerDashboard";
import ProfessionalDashboard from "./pages/dashboard/ProfessionalDashboard";
import VendorDashboard from "./pages/dashboard/VendorDashboard";

// Onboarding pages
import ProfessionalOnboarding from "./pages/onboarding/ProfessionalOnboarding";
import VendorOnboarding from "./pages/onboarding/VendorOnboarding";

// Feature pages
import BrowseProfessionals from "./pages/homeowner/BrowseProfessionals";

// Error page
import NotFound from "./pages/NotFound";

// Root redirect handler as a proper component
const RootRedirect = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          window.location.href = "/login";
          return;
        }
        
        // Get active role
        const activeRole = getActiveRole();
        if (!activeRole) {
          window.location.href = "/select-role";
          return;
        }
        
        // Redirect to appropriate dashboard
        window.location.href = `/dashboard/${activeRole}`;
      } catch (error) {
        console.error("Error during auth check:", error);
        window.location.href = "/login";
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  return isLoading ? <div>Loading...</div> : null;
};

// Create QueryClient outside of component
const queryClient = new QueryClient();

// Define the App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/select-role" element={<SelectRole />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard/homeowner" element={<HomeownerDashboard />} />
            <Route path="/dashboard/professional" element={<ProfessionalDashboard />} />
            <Route path="/dashboard/vendor" element={<VendorDashboard />} />
            
            {/* Onboarding routes */}
            <Route path="/onboarding/professional" element={<ProfessionalOnboarding />} />
            <Route path="/onboarding/vendor" element={<VendorOnboarding />} />
            
            {/* Feature routes */}
            <Route path="/homeowner/browse-professionals" element={<BrowseProfessionals />} />
            
            {/* Fallback routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
