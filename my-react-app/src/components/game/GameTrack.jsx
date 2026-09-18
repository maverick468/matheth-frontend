// frontend/src/components/game/GameTrack.jsx
import React from 'react';
import runnerImg from '../../assets/runner.png';
import monsterImg from '../../assets/monster.png';
import bgImg from '../../assets/map-background.jpg';

export function GameTrack({
  current = 0,
  total = 1,
  progressPercent = null, // optional override, e.g. GestureDetector's custom runner math
  feedback = null,        // 'correct' | 'incorrect' | null — drives hit/celebrate animations
}) {
  const computedProgress = Math.min(Math.max((current / total) * 100, 5), 95);
  const progress = progressPercent !== null ? progressPercent : computedProgress;

  return (
    <div
      className="w-full h-28 relative rounded-2xl overflow-hidden border border-slate-800 bg-cover bg-center flex items-center shadow-inner mb-4"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]" />

      <div className="absolute bottom-4 left-8 right-8 h-2 bg-slate-900/80 rounded-full border border-slate-700 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={`absolute top-1/2 -translate-y-1/2 flex items-center z-10 ease-out ${feedback === 'incorrect' ? 'duration-500' : 'duration-700'} transition-all`}
        style={{ left: `calc(${progress}% - 40px)` }}
      >
        <img
          src={monsterImg}
          alt="Monster"
          className="w-12 h-12 object-contain -mr-4"
          style={{ animation: feedback === 'incorrect' ? 'pulse 0.4s ease-in-out 2' : 'pulse 2s infinite' }}
        />
        <img
          src={runnerImg}
          alt="Runner"
          className={`w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(6,182,212,0.6)] ${feedback === 'incorrect' ? '-scale-x-100' : ''} ${feedback === 'correct' ? 'animate-bounce' : ''}`}
        />
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 uppercase tracking-widest z-10">
        🏁 Finish
      </div>
    </div>
  );
}