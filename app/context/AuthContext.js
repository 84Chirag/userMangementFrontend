'use client';

import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getImageUrl } from '../utils/api';

// Use proxy URL
const API_URL = '/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // Reset loading state when routing completes after login
  useEffect(() => {
    // This effect will run when isAuthenticated changes to true
    if (isAuthenticated && loading) {
      // Use a small delay to ensure the routing has completed
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setRegisterError(null);
      setLoginError(null);
      setRegisterSuccess(false);
      
      const formData = new FormData();
      
      // Add text data
      for (const key in userData) {
        if (key !== 'images') {
          formData.append(key, userData[key]);
        }
      }
      
      // Add images
      if (userData.images) {
        for (let i = 0; i < userData.images.length; i++) {
          formData.append('images', userData.images[i]);
        }
      }
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Set registration success flag
        setRegisterSuccess(true);
        
        // Don't set token or user, just redirect to login page
        router.push('/login');
      }
    } catch (err) {
      setRegisterError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async ({ email, password }) => {
    try {
      setLoading(true);
      setLoginError(null);
      setRegisterError(null);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Set token in cookie with 30 days expiry
        Cookies.set('token', data.token, { expires: 30 });
        
        // Mark as authenticated immediately to prevent login form flash
        setIsAuthenticated(true);
        
        // Get user data before redirecting
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`
          },
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success) {
            setUser(userData.data);
            router.push('/dashboard');
            return;
          }
        }
        
        // Fallback - redirect even if user data fetch fails
        router.push('/dashboard');
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed');
      setLoading(false); // Only set loading to false on error
    }
    // Loading state will be reset by the useEffect after redirect completes
  };

  // Logout user
  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  // Check if user is logged in
  const checkUserLoggedIn = async () => {
    try {
      const token = Cookies.get('token');
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        Cookies.remove('token');
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginError,
        registerError,
        registerSuccess,
        isAuthenticated,
        register,
        login,
        logout,
        checkUserLoggedIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 