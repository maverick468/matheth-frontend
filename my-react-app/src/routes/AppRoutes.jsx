// frontend/src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import PlayPage from '../pages/PlayPage';
import GamePage from '../pages/GamePage';
import ResultsPage from '../pages/ResultsPage';
import PdfUploadPage from '../pages/PdfUploadPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import ProfilePage from '../pages/ProfilePage';
import AffiliatePage from '../pages/AffiliatePage';
import BadgeShopPage from '../pages/BadgeShopPage';
import FAQPage from '../pages/FAQPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminAuthGate from '../components/admin/AdminAuthGate';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/play" element={<PlayPage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/upload" element={<PdfUploadPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/affiliate" element={<AffiliatePage />} />
      <Route path="/shop" element={<BadgeShopPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Point /admin/login directly to AdminLoginPage */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* Protect the dashboard with AdminAuthGate */}
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminAuthGate>
            <AdminDashboardPage />
          </AdminAuthGate>
        } 
      />
    </Routes>
  );
}