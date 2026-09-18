import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { Menu, X, Trophy, Coins, User, LogOut, Play } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Matheth
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/play" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1">
              <Play className="w-4 h-4" />
              <span>Play</span>
            </Link>
            <Link to="/affiliate" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1">
              <Coins className="w-4 h-4" />
              <span>Affiliate</span>
            </Link>
            <Link to="/leaderboard" className="text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1">
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400">
                  <User className="w-4 h-4" />
                  <span>{user.name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/play"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-300 hover:text-cyan-400"
          >
            Play Game
          </Link>
          <Link
            to="/affiliate"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-300 hover:text-cyan-400"
          >
            Affiliate
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-300 hover:text-cyan-400"
          >
            Leaderboard
          </Link>
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block py-2 text-slate-300 hover:text-cyan-400"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2 text-red-400 hover:text-red-300"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex space-x-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex-1 text-center py-2 border border-slate-700 rounded-lg text-slate-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex-1 text-center py-2 bg-cyan-500 rounded-lg text-slate-950 font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}