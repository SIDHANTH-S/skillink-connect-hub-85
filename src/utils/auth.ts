
import { Role, User } from "@/types";

// Default credentials
const DEFAULT_EMAIL = "test@skillink.com";
const DEFAULT_PASSWORD = "123456";

// LocalStorage keys
export const LS_KEYS = {
  AUTH_TOKEN: "skillink_auth_token",
  ACTIVE_ROLE: "skillink_active_role",
  USER_ID: "skillink_user_id",
  PROFESSIONALS: "skillink_professionals",
  VENDORS: "skillink_vendors",
  HOMEOWNERS: "skillink_homeowners",
};

// Login function
export const login = (email: string, password: string): boolean => {
  // Check if credentials match the default ones
  if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
    // Generate a simple token and store in localStorage
    const token = `token_${Date.now()}`;
    const userId = `user_${Date.now()}`;
    localStorage.setItem(LS_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(LS_KEYS.USER_ID, userId);
    return true;
  }
  return false;
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem(LS_KEYS.AUTH_TOKEN);
  localStorage.removeItem(LS_KEYS.ACTIVE_ROLE);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(LS_KEYS.AUTH_TOKEN);
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
export const hasCompletedOnboarding = (role: Role): boolean => {
  const userId = localStorage.getItem(LS_KEYS.USER_ID);
  
  if (!userId) return false;
  
  if (role === 'professional') {
    const professionals = JSON.parse(localStorage.getItem(LS_KEYS.PROFESSIONALS) || '[]');
    return professionals.some((prof: any) => prof.id === userId);
  }
  
  if (role === 'vendor') {
    const vendors = JSON.parse(localStorage.getItem(LS_KEYS.VENDORS) || '[]');
    return vendors.some((vendor: any) => vendor.id === userId);
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
