// Token storage utility for JWT tokens
// Stores accessToken in memory and localStorage
// Stores refreshToken in localStorage only

// Types for tokens
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// In-memory storage for access token
let accessTokenMemory: string | null = null;

// Local storage keys
const ACCESS_TOKEN_KEY = 'rotorial_access_token';
const REFRESH_TOKEN_KEY = 'rotorial_refresh_token';

// Get tokens from storage
export const getTokens = (): Tokens | null => {
  const accessToken = accessTokenMemory || localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
};

// Get access token (from memory first, then localStorage)
export const getAccessToken = (): string | null => {
  return accessTokenMemory || localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Get refresh token (from localStorage only)
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Set tokens in storage
export const setTokens = (tokens: Tokens): void => {
  // Store access token in memory
  accessTokenMemory = tokens.accessToken;
  
  // Also store in localStorage as backup
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

// Update access token only
export const updateAccessToken = (accessToken: string): void => {
  accessTokenMemory = accessToken;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
};

// Clear all tokens
export const clearTokens = (): void => {
  accessTokenMemory = null;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Check if user is authenticated (has valid tokens)
export const isAuthenticated = (): boolean => {
  return getTokens() !== null;
};
