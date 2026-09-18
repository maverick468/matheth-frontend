// src/context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ 
    id: 'mock-user-1', 
    name: 'Test Player', 
    email: 'test@matheth.com', 
    isAdmin: true 
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const mockData = { user: { id: 'mock-user-1', name: 'Test Player', email, isAdmin: true } };
    setUser(mockData.user);
    return mockData;
  };

  const register = async (userData) => {
    const mockData = { user: { id: 'mock-user-1', ...userData } };
    setUser(mockData.user);
    return mockData;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}