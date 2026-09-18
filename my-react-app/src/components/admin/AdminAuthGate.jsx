// frontend/src/components/admin/AdminAuthGate.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminDashboardPage from '../../pages/AdminDashboardPage';

export default function AdminAuthGate({ children }) {
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children ? children : <AdminDashboardPage />;
}