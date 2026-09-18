import React from 'react';
import { Trophy, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BadgeShopPage() {
  const badges = [
    { id: 1, name: 'Math Wizard', price: 500, description: 'Master of complex algebraic equations.', owned: true },
    { id: 2, name: 'AI Pioneer', price: 750, description: 'Uploaded 10+ custom documents for AI quizzes.', owned: false },
    { id: 3, name: 'Speed Runner', price: 1000, description: 'Completed a maze game under 60 seconds.', owned: false },
    { id: 4, name: 'Gesture Master', price: 1200, description: 'Answered 50 questions using hand gestures.', owned: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <ShoppingBag className="w-8 h-8 text-cyan-400" />
        <h1 className="text-3xl font-bold text-slate-100">Badge & Reward Shop</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <div key={badge.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4 text-cyan-400">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-1">{badge.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{badge.description}</p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
              <span className="text-sm font-bold text-cyan-400 flex items-center space-x-1">
                <Sparkles className="w-4 h-4 mr-1" />
                {badge.price} pts
              </span>
              {badge.owned ? (
                <span className="flex items-center text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Owned
                </span>
              ) : (
                <button className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-medium rounded-lg transition-colors">
                  Purchase
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}