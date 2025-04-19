
import { supabase } from "@/integrations/supabase/client";
import { Role, User } from "@/types";

// LocalStorage keys
export const LS_KEYS = {
  ACTIVE_ROLE: "skillink_active_role",
  USER_ID: "skillink_user_id",
  PROFESSIONALS: "skillink_professionals",
  VENDORS: "skillink_vendors",
  HOMEOWNERS: "skillink_homeowners",
};

// Login function using Supabase
export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error during login:', error);
    return false;
  }
};

// Logout function using Supabase
export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.removeItem(LS_KEYS.ACTIVE_ROLE);
};

// Check if user is authenticated using Supabase
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Set active role
export const setActiveRole = (role: Role): void => {
  localStorage.setItem(LS_KEYS.ACTIVE_ROLE, role);
};

// Get active role
export const getActiveRole = (): Role | null => {
  const role = localStorage.getItem(LS_KEYS.ACTIVE_ROLE);
  if (role === "homeowner" || role === "professional" || role === "vendor") {
    return role;
  }
  return null;
};

// Check if user has completed onboarding for a specific role
export const hasCompletedOnboarding = async (role: Role): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  
  if (!user) return false;
  
  if (role === 'professional') {
    const professionals = JSON.parse(localStorage.getItem(LS_KEYS.PROFESSIONALS) || '[]');
    return professionals.some((prof: any) => prof.id === user.id);
  }
  
  if (role === 'vendor') {
    const vendors = JSON.parse(localStorage.getItem(LS_KEYS.VENDORS) || '[]');
    return vendors.some((vendor: any) => vendor.id === user.id);
  }
  
  // Homeowners don't have onboarding
  if (role === 'homeowner') {
    return true;
  }
  
  return false;
};

// Utility to generate unique ID (for localStorage)
export const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
