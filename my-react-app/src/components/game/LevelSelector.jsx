// frontend/src/components/game/LevelSelector.jsx
import React, { useState, useEffect } from 'react';
import { questionService } from '../../services/questionService';

const SUBJECTS = ['Maths', 'Physics', 'Chemistry', 'English', 'Economics', 'Biology', 'SAT', 'Geography', 'History'];
const GRADES = ['9', '10', '11', '12'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function LevelSelector({ onSelectLevel }) {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[2]);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]);
  
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLevels();
  }, [subject, grade, difficulty]);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const data = await questionService.getAvailableLevels({ subject, grade, difficulty });
      setLevels(data);
    } catch (err) {
      console.error('Error fetching levels:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white space-y-6">
      <h2 className="text-2xl font-bold text-cyan-400">Select Game Level</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm">
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Grade</label>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm">
            {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Difficulty</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm">
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 text-slate-300">Available Unique Levels</h3>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading levels...</p>
        ) : levels.length === 0 ? (
          <p className="text-slate-500 text-sm italic">No levels curated yet for this combination. Check back later or ask an admin!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => onSelectLevel(lvl.id)}
                className="p-4 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700 rounded-xl transition-all text-center flex flex-col items-center justify-center gap-2 group"
              >
                <span className="text-xl font-extrabold text-cyan-400 group-hover:text-slate-950">Level {lvl.levelNumber}</span>
                <span className="text-xs text-slate-400 group-hover:text-slate-900">{lvl.questionCount} Questions</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}