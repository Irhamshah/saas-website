import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    console.log('🔍 AuthContext: Checking for existing auth...');
    checkAuth();
  }, []);

  // Log user state changes
  useEffect(() => {
    console.log('👤 User state changed:', user);
  }, [user]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('❌ No token found');
      setLoading(false);
      return;
    }

    console.log('🔑 Token found, verifying...');

    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ User authenticated:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('❌ Auth check failed:', error.response?.data || error.message);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email);
      console.log('📍 API URL:', `${API_URL}/auth/login`);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      console.log('📦 Full login response:', response);
      console.log('📦 Response data:', response.data);
      console.log('📦 Response status:', response.status);

      // Check if response has data
      if (!response.data) {
        console.error('❌ No data in response');
        throw new Error('No data received from server');
      }

      const { token, user: userData } = response.data;

      // Log what we got
      console.log('🔍 Checking response structure:');
      console.log('  - Has token?', !!token);
      console.log('  - Has user?', !!userData);
      console.log('  - Token value:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('  - User value:', userData);

      // Better error messages
      if (!token) {
        console.error('❌ Token missing from response');
        console.error('Response keys:', Object.keys(response.data));
        throw new Error('Server did not return authentication token');
      }

      if (!userData) {
        console.error('❌ User data missing from response');
        console.error('Response keys:', Object.keys(response.data));
        throw new Error('Server did not return user information');
      }

      // Validate user data structure
      if (!userData.email) {
        console.error('❌ User email missing from response');
        console.error('User object:', userData);
        throw new Error('Invalid user data received from server');
      }

      // Save token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state - THIS IS CRITICAL!
      setUser(userData);
      
      console.log('✅ Login successful! User state updated:', userData);
      console.log('📊 Current user in state:', userData);
      console.log('💾 Saved to localStorage');

      return response.data;
    } catch (error) {
      console.error('❌ Login failed!');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received');
        console.error('Request:', error.request);
      }
      
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      console.log('📝 Attempting registration for:', email);
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        name
      });

      console.log('📦 Registration response:', response.data);

      const { token, user: userData } = response.data;

      if (!token) {
        console.error('❌ Token missing from registration response');
        throw new Error('Server did not return authentication token');
      }

      if (!userData) {
        console.error('❌ User data missing from registration response');
        throw new Error('Server did not return user information');
      }

      // Save token and user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);

      console.log('✅ Registration successful! User state updated:', userData);

      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('✅ Logged out successfully');
  };

  const updateUser = (updates) => {
    console.log('🔄 Updating user:', updates);
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('✅ User updated:', updatedUser);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('❌ Cannot refresh: No token');
      return;
    }

    try {
      console.log('🔄 Refreshing user data...');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      console.log('✅ User refreshed:', response.data);
    } catch (error) {
      console.error('❌ Refresh failed:', error.response?.data || error.message);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser
  };

  console.log('🎯 AuthContext rendering with user:', user);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;