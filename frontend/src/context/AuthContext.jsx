import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
        const claims = parseJwt(storedToken);
        if (claims && claims.exp * 1000 > Date.now()) {
          setToken(storedToken);
          const userInfo = {
            id: claims.userId || claims.id,
            email: claims.email || claims.sub,
            role: claims.role,
            baseId: claims.baseId || null,
          };
          setUser(userInfo);
          // Try to refresh full profile from /api/auth/me if available
          try {
            const profile = await authService.getCurrentUser();
            if (profile) {
              setUser(profile);
            }
          } catch (err) {
            // Fallback to claims info if /api/auth/me is unreachable or errors
          }
        } else {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const jwtToken = data.token || data.accessToken || data.jwt;
    
    if (!jwtToken) {
      throw new Error('No authentication token received from server');
    }

    localStorage.setItem('jwt_token', jwtToken);
    setToken(jwtToken);

    const claims = parseJwt(jwtToken);
    const userInfo = data.user || {
      id: claims?.userId,
      email: data.email || claims?.email || claims?.sub || email,
      role: data.role || claims?.role,
      baseId: data.baseId !== undefined ? data.baseId : claims?.baseId,
    };

    setUser(userInfo);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role,
    baseId: user?.baseId,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
