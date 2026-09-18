import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext'
import { GameProvider } from './context/GameContext'
import { NotificationProvider } from './context/NotificationContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import MobileBottomNav from './components/layout/MobileBottomNav'

export default function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <GameProvider>
          <NotificationProvider>
            <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-16 md:pb-0">
              <Navbar />
              <main className="flex flex-col flex-grow">
                <AppRoutes />
              </main>
              <Footer />
              <MobileBottomNav />
            </div>
          </NotificationProvider>
        </GameProvider>
      </AuthProvider>
    </Router>
  )
}