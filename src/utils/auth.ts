
import { supabase } from "@/integrations/supabase/client";
import { Role } from "@/types";

// LocalStorage keys
export const LS_KEYS = {
  ACTIVE_ROLE: "skillink_active_role",
  USER_ID: "skillink_user_id",
  VENDORS: "skillink_vendors",
  HOMEOWNERS: "skillink_homeowners",
};

// Login function using Supabase
export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    // Store user ID after successful login
    if (data && data.user) {
      localStorage.setItem(LS_KEYS.USER_ID, data.user.id);
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
  localStorage.removeItem(LS_KEYS.USER_ID);
};

// Check if user is authenticated using Supabase
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  
  if (data.session?.user) {
    // Ensure user ID is stored in localStorage when checking authentication
    localStorage.setItem(LS_KEYS.USER_ID, data.session.user.id);
    return true;
  }
  
  return false;
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
    // Check in Supabase if the user exists in the professionals table
    const { data: professionalData } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', user.id)
      .single();
      
    return !!professionalData;
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
