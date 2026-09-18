import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';

const ALL_SUBJECTS = ['Maths', 'Physics', 'Chemistry', 'English', 'Economics', 'Biology', 'SAT', 'Geography', 'History'];
const ALL_GRADES = ['9', '10', '11', '12'];
const ALL_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function LevelSelectPage() {
  const navigate = useNavigate();
  const [availableLevels, setAvailableLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedLevelIds, setSelectedLevelIds] = useState([]); // Multiple level selection support

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const levels = await adminService.getAllLevels();
        setAvailableLevels(levels || []);
      } catch (err) {
        console.error('Failed to load available levels', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetadata();
  }, []);

  // Filter available options based on existing admin data configuration
  const activeSubjects = ALL_SUBJECTS.filter(sub => 
    availableLevels.some(l => l.subject === sub)
  );

  const activeGrades = ALL_GRADES.filter(grade => 
    !selectedSubject || availableLevels.some(l => l.subject === selectedSubject && l.grade === grade)
  );

  const activeDifficulties = ALL_DIFFICULTIES.filter(diff => 
    (!selectedSubject || !selectedGrade) || 
    availableLevels.some(l => l.subject === selectedSubject && l.grade === selectedGrade && l.difficulty === diff)
  );

  // Filter explicit level documents matching the current chain
  const matchingLevels = availableLevels.filter(l => 
    l.subject === selectedSubject && 
    l.grade === selectedGrade && 
    l.difficulty === selectedDifficulty
  );

  const toggleLevelSelection = (levelId) => {
    if (selectedLevelIds.includes(levelId)) {
      setSelectedLevelIds(selectedLevelIds.filter(id => id !== levelId));
    } else {
      setSelectedLevelIds([...selectedLevelIds, levelId]);
    }
  };

  const handleStartGame = () => {
    // Collect questions from all chosen levels (10 questions per level)
    const chosenDocs = matchingLevels.filter(l => selectedLevelIds.includes(l.id));
    const combinedQuestions = chosenDocs.flatMap(l => l.questions || []);

    navigate('/game', { 
      state: { 
        subject: selectedSubject, 
        grade: selectedGrade, 
        difficulty: selectedDifficulty,
        questions: combinedQuestions,
        levelCount: selectedLevelIds.length
      } 
    });
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading curriculum data...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 text-white space-y-6">
      <h2 className="text-2xl font-bold text-cyan-400">Select Your Challenge</h2>
      
      {/* Subject Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subject</label>
        <div className="grid grid-cols-3 gap-2">
          {ALL_SUBJECTS.map(sub => {
            const isAvailable = activeSubjects.includes(sub);
            return (
              <button
                key={sub}
                disabled={!isAvailable}
                onClick={() => { 
                  setSelectedSubject(sub); 
                  setSelectedGrade(''); 
                  setSelectedDifficulty(''); 
                  setSelectedLevelIds([]); 
                }}
                className={`p-3 rounded-xl text-sm font-semibold border transition ${
                  !isAvailable ? 'opacity-20 bg-slate-950 border-slate-900 cursor-not-allowed line-through' :
                  selectedSubject === sub ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grade Filter */}
      {selectedSubject && (
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Grade Level</label>
          <div className="grid grid-cols-4 gap-2">
            {ALL_GRADES.map(grade => {
              const isAvailable = availableLevels.some(l => l.subject === selectedSubject && l.grade === grade);
              return (
                <button
                  key={grade}
                  disabled={!isAvailable}
                  onClick={() => { 
                    setSelectedGrade(grade); 
                    setSelectedDifficulty(''); 
                    setSelectedLevelIds([]); 
                  }}
                  className={`p-3 rounded-xl text-sm font-semibold border transition ${
                    !isAvailable ? 'opacity-20 bg-slate-950 border-slate-900 cursor-not-allowed line-through' :
                    selectedGrade === grade ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  Grade {grade}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Difficulty Filter */}
      {selectedGrade && (
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Difficulty Tier</label>
          <div className="grid grid-cols-3 gap-2">
            {ALL_DIFFICULTIES.map(diff => {
              const isAvailable = availableLevels.some(l => l.subject === selectedSubject && l.grade === selectedGrade && l.difficulty === diff);
              return (
                <button
                  key={diff}
                  disabled={!isAvailable}
                  onClick={() => { 
                    setSelectedDifficulty(diff); 
                    setSelectedLevelIds([]); 
                  }}
                  className={`p-3 rounded-xl text-sm font-semibold border transition ${
                    !isAvailable ? 'opacity-20 bg-slate-950 border-slate-900 cursor-not-allowed line-through' :
                    selectedDifficulty === diff ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {diff}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Level Selection (Multi-select allowing accumulation of 10 Qs per level) */}
      {selectedDifficulty && matchingLevels.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
            Select Level(s) — Each level adds 10 questions ({selectedLevelIds.length * 10} Questions Selected)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {matchingLevels.map((lvl) => {
              const isSelected = selectedLevelIds.includes(lvl.id);
              return (
                <button
                  key={lvl.id}
                  onClick={() => toggleLevelSelection(lvl.id)}
                  className={`p-3 rounded-xl text-sm font-semibold border transition flex items-center justify-between ${
                    isSelected ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold' : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <span>Level {lvl.levelNumber || 'Custom'}</span>
                  <span className="text-xs opacity-75">({lvl.questions?.length || 10} Qs)</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedLevelIds.length > 0 && (
        <button 
          onClick={handleStartGame}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black rounded-2xl shadow-xl mt-6 cursor-pointer hover:from-cyan-400 hover:to-teal-300 transition"
        >
          Launch Interactive Level ({selectedLevelIds.length * 10} Questions)
        </button>
      )}
    </div>
  );
}