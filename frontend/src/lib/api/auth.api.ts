import http from './http';
import type {
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  LogoutRequest,
  RegisterUserRequest,
  RegisterUserResponse,
  User
} from '../../types/auth';

// Auth API service
const authApi = {
  // Login user
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await http.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // Refresh token
  refresh: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await http.post<RefreshTokenResponse>('/auth/refresh', data);
    return response.data;
  },

  // Logout user
  logout: async (data: LogoutRequest): Promise<void> => {
    await http.post('/auth/logout', data);
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await http.get<User>('/auth/me');
    return response.data;
  },

  // Register new user (admin only)
  registerUser: async (data: RegisterUserRequest): Promise<RegisterUserResponse> => {
    const response = await http.post<RegisterUserResponse>('/auth/register', data);
    return response.data;
  }
};

export default authApi;
