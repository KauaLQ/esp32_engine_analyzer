import { create } from 'zustand';
import type { User } from '../../types/auth';
import {getTokens, setTokens, clearTokens, isAuthenticated} from './tokenStorage';
import authApi from '../api/auth.api';

// Auth store state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  registerUser: (email: string, password: string, fullName: string, role: 'admin' | 'operator') => Promise<void>;
  clearError: () => void;
}

// Create auth store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login action
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      console.log("Bananudo da silva");
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log(isAuthenticated());
    } catch (error: any) {
      let errorMessage = 'An error occurred during login';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid credentials';
        } else if (error.response.status === 403) {
          errorMessage = 'User account is disabled';
        }
      }
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      
      throw error;
    }
  },

  // Logout action
  logout: async () => {
    set({ isLoading: true });
    try {
      const tokens = getTokens();
      if (tokens) {
        await authApi.logout({ refreshToken: tokens.refreshToken });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Check authentication status
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Check if we have tokens
      const tokens = getTokens();
      console.log(tokens);

      // Get current user
      const user = await authApi.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      // If error, clear tokens and set not authenticated
      console.log("Deu pau");
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },

  // Register new user (admin only)
  registerUser: async (email: string, password: string, fullName: string, role: 'admin' | 'operator') => {
    set({ isLoading: true, error: null });
    try {
      await authApi.registerUser({ email, password, fullName, role });
      set({ isLoading: false });
      // Note: We don't update the current user or tokens here
      // as per requirements, we ignore tokens returned from register
    } catch (error: any) {
      let errorMessage = 'An error occurred during user registration';
      
      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'Email already exists';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid data';
        }
      }
      
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
