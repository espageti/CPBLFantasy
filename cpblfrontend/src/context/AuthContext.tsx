import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { baseLink } from '../models';
import { getCsrfToken } from '../axiosConfig';

// Define the shape of our auth context state
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  authenticatedFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
  // getAuthToken: (username: string, password: string) => Promise<string>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => {},
  authenticatedFetch: async () => new Response(),
});

// Create a provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status when the app loads
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Using fetch instead of axios
      const response = await fetch(`${baseLink}api/current-user/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setIsAuthenticated(true);
        setUser(userData);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function using fetch as requested
  const login = async (username: string, password: string) => {
    try {
      // Get CSRF token
      
      const csrfToken = await getCsrfToken();

      const response = await fetch(baseLink + 'accounts/api-login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
          },
          credentials: 'include',
          body: JSON.stringify({username, password})
      });
      
      if (!response.status.toString().startsWith('2')) {
        throw new Error('Login failed');
      }

      const tokenResponse = await fetch(baseLink + 'api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ username, password }),
      });
      if(!tokenResponse.ok) {
        throw new Error('Token fetch failed');
      }
      else
      {
        const tokenData = await tokenResponse.json();
        setToken(tokenData.token); 
      }   
      // Fetch user data after successful login
      await checkAuthStatus();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  

  // Logout function - you might want to update this to use fetch too
  const logout = async () => {
    try {
       // Get fresh CSRF token
      const csrfToken = await getCsrfToken();
      
      const response = await fetch(baseLink + 'accounts/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        credentials: 'include',
      });
      
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Add this new function to your AuthProvider component
  const getAuthToken = async () => {
    try {
      console.log("Getting missing token...");
      const csrfToken = await getCsrfToken();
      
      const tokenResponse = await fetch(baseLink + 'api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include', // Important: include cookies
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log("Token refreshed successfully");
        setToken(tokenData.token);
        return tokenData.token;
      } else {
        console.error("Failed to refresh token:", tokenResponse.status);
        return null;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  };

  // Authenticated fetch function
  // This function will be used to make API calls that require authentication
  // It will automatically include the CSRF token and the auth token in the request headers
  // currently nothing should need it?
  const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
    // If authenticated but no token, try to refresh
    if (isAuthenticated && !token) {
      console.log("User authenticated but token missing, attempting refresh");
      await getAuthToken();
    }

    // Get CSRF token if needed for non-GET requests
    let csrfToken = '';
    if (options.method && options.method !== 'GET') {
      csrfToken = await getCsrfToken();
    }

    // Add token to request
    const authOptions: RequestInit = {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        ...(token ? { 'Authorization': `Token ${token}` } : {}),
        ...(options.headers || {})
      }
    };
    
    console.log(authOptions);
    console.log("Request body:", options.body ? "Present" : "Missing");
    console.log("Full options:", JSON.stringify(options));
    
    // Make request with token
    const response = await fetch(baseLink + endpoint, authOptions);
    
    // Handle errors
    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw errorData;
      } catch (jsonError) {
        const errorText = await response.text();
        console.error("API Error Text:", errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
    }
    
    return response;
  };

  useEffect(() => {
    // If user is authenticated but token is missing, refresh token
    if (isAuthenticated && !token && !loading) {
      console.log("Detected authenticated user with missing token");
      getAuthToken();
    }
  }, [isAuthenticated, token, loading]);

  // Provide the auth context value to children
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      login, 
      logout,
      checkAuthStatus,
      authenticatedFetch,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);