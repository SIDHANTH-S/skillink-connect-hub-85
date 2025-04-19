import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
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

const queryClient = new QueryClient();

// Root redirect handler
const RootRedirect = () => {
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
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
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
