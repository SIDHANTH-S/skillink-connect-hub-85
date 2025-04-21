import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated, getActiveRole, getPreferredRole } from "@/utils/auth";
import { setupSupabaseSchema } from "@/utils/setupSupabase";

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
import BrowseMaterials from "./pages/homeowner/BrowseMaterials";

// Vendor pages
import ManageProducts from "./pages/vendor/ManageProducts";

// Error page
import NotFound from "./pages/NotFound";

// Root redirect handler as a proper component
const RootRedirect = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First set up our schema if needed
        await setupSupabaseSchema();
        
        // Check if user is authenticated
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          setRedirectPath("/login");
          return;
        }
        
        // Get active role from local storage first (for quick redirect)
        const activeRole = getActiveRole();
        if (activeRole) {
          setRedirectPath(`/dashboard/${activeRole}`);
          return;
        }
        
        // No active role, check for preferred role from previous sessions
        try {
          const preferredRole = await getPreferredRole();
          if (preferredRole) {
            setRedirectPath(`/dashboard/${preferredRole}`);
            return;
          }
        } catch (error) {
          console.error("Error getting preferred role:", error);
        }
        
        // No roles found or error, redirect to select role page
        setRedirectPath("/select-role");
      } catch (error) {
        console.error("Error during auth check:", error);
        setRedirectPath("/login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Use useEffect to perform the navigation after state is set
  useEffect(() => {
    if (!isLoading && redirectPath) {
      window.location.href = redirectPath;
    }
  }, [isLoading, redirectPath]);
  
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
            <Route path="/homeowner/browse-materials" element={<BrowseMaterials />} />
            
            {/* Vendor routes */}
            <Route path="/vendor/manage-products" element={<ManageProducts />} />
            
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
