
import { supabase } from "@/integrations/supabase/client";
import { Role } from "@/types";

// LocalStorage keys
export const LS_KEYS = {
  ACTIVE_ROLE: "skillink_active_role",
  USER_ID: "skillink_user_id",
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
      
      // Try to get user profile and set active role if exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileData && !profileError && profileData.roles && profileData.roles.length > 0) {
        setActiveRole(profileData.roles[0]);
      }
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

// Get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id || null;
};

// Get current user email
export const getCurrentUserEmail = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.email || null;
};

// Set active role
export const setActiveRole = (role: Role): void => {
  localStorage.setItem(LS_KEYS.ACTIVE_ROLE, role);
};

// Get active role
export const getActiveRole = (): Role | null => {
  const role = localStorage.getItem(LS_KEYS.ACTIVE_ROLE);
  if (role === "homeowner" || role === "professional" || role === "vendor") {
    return role as Role;
  }
  return null;
};

// Check if user has completed onboarding for a specific role
export const hasCompletedOnboarding = async (role: Role): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) return false;
  
  // First check if the user has this role in their profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  // If error or no roles property, treat as not having the role
  const hasRole = profileData && !profileError && 
                  profileData.roles && 
                  Array.isArray(profileData.roles) && 
                  profileData.roles.includes(role);
                  
  if (!hasRole) return false;
  
  if (role === 'professional') {
    // Check in Supabase if the user exists in the professionals table
    const { data: professionalData } = await supabase
      .from('professionals')
      .select('id')
      .eq('user_id', userId)
      .single();
      
    return !!professionalData;
  }
  
  if (role === 'vendor') {
    // Check if the user has vendor data in their profile
    const { data: vendorProfileData, error: vendorProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    return !vendorProfileError && 
           vendorProfileData && 
           vendorProfileData.vendor_data !== undefined && 
           vendorProfileData.vendor_data !== null;
  }
  
  // Homeowners don't have onboarding
  if (role === 'homeowner') {
    return true;
  }
  
  return false;
};

// Get all roles that the user has completed onboarding for
export const getUserRoles = async (): Promise<Role[]> => {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  
  // Get roles from user profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (!profileError && profileData && profileData.roles && Array.isArray(profileData.roles)) {
    return profileData.roles as Role[];
  }
  
  // Fallback to empty array
  return [];
};

// Get the preferred role for a user (first role with complete onboarding, or homeowner)
export const getPreferredRole = async (): Promise<Role | null> => {
  const roles = await getUserRoles();
  
  // Return the first role that's not homeowner, or homeowner if it's the only role
  return roles.find(role => role !== 'homeowner') || (roles.includes('homeowner') ? 'homeowner' : null);
};

// Save user's role to their profile
export const saveUserRole = async (role: Role): Promise<boolean> => {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  
  // Get current roles
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  let roles: Role[] = [];
  
  // If user has existing roles, add the new one if not already present
  if (!profileError && existingProfile && existingProfile.roles && Array.isArray(existingProfile.roles)) {
    roles = [...existingProfile.roles];
    if (!roles.includes(role)) {
      roles.push(role);
    }
  } else {
    // No existing roles, just add the new one
    roles = [role];
  }
  
  console.log("Saving role to profile:", role, "Roles array:", roles);
  
  // Update profile with new roles array
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      roles,
      // Make sure we're creating the user's profile if it doesn't exist yet
      full_name: existingProfile?.full_name || null,
      avatar_url: existingProfile?.avatar_url || null,
      updated_at: new Date().toISOString(),
      created_at: existingProfile?.created_at || new Date().toISOString(),
    });
    
  return !error;
};

// Utility to generate unique ID (for localStorage)
export const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
