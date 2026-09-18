import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Play, Coins, Trophy, User } from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 px-4 py-2 flex justify-around items-center">
      <Link
        to="/play"
        className={`flex flex-col items-center space-y-1 ${
          isActive('/play') ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Play className="w-5 h-5" />
        <span className="text-xs">Play</span>
      </Link>
      <Link
        to="/affiliate"
        className={`flex flex-col items-center space-y-1 ${
          isActive('/affiliate') ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Coins className="w-5 h-5" />
        <span className="text-xs">Affiliate</span>
      </Link>
      <Link
        to="/leaderboard"
        className={`flex flex-col items-center space-y-1 ${
          isActive('/leaderboard') ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-xs">Leaderboard</span>
      </Link>
      <Link
        to="/profile"
        className={`flex flex-col items-center space-y-1 ${
          isActive('/profile') ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-xs">Profile</span>
      </Link>
    </div>
  );
}