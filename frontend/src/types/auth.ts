// Authentication types

// User roles
export type UserRole = 'admin' | 'operator';

// User status
export type UserStatus = 'active' | 'inactive';

// User data
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
}

// Login request payload
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Refresh token request
export interface RefreshTokenRequest {
  refreshToken: string;
}

// Refresh token response (same as login response)
export type RefreshTokenResponse = LoginResponse;

// Logout request
export interface LogoutRequest {
  refreshToken: string;
}

// Register user request
export interface RegisterUserRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

// Register user response (same as login response)
export type RegisterUserResponse = LoginResponse;

// Auth error types
export type AuthErrorType = 
  | 'invalid_credentials'
  | 'account_disabled'
  | 'invalid_refresh_token'
  | 'unauthorized'
  | 'email_already_exists'
  | 'invalid_data'
  | 'server_error'
  | 'network_error';

// Auth error
export interface AuthError {
  type: AuthErrorType;
  message: string;
}
