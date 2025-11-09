/**
 * Utility functions for API calls
 */

/**
 * Gets authentication headers with the token from localStorage
 * @returns HeadersInit object with Content-Type and Authorization (if token exists)
 */
export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Gets the API URL from environment variables or uses the default
 * @returns API base URL
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'https://bis.runasp.net';
}

