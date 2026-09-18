// frontend/src/pages/PlayPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gamepad2, 
  FileUp, 
  ArrowRight, 
  Loader2, 
  Play, 
  Upload, 
  Trophy, 
  Sparkles, 
  Flame, 
  Award, 
  BookOpen, 
  CheckCircle2,
  Atom,
  BrainCircuit
} from 'lucide-react';
import { GestureDetector } from '../components/game/GestureDetector';
import { Link, useNavigate } from 'react-router-dom';
import { useGameRunner } from "../hooks/ugr.js";

export default function PlayPage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null); // 'game' | 'upload' | null
  const [gameStarted, setGameStarted] = useState(false);

  // Database Question Bank State
  const [questionBank, setQuestionBank] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Strict Hierarchical Game Configuration States
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [timerOption, setTimerOption] = useState('None');

  // File Upload & Custom Questions States
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [customQuestions, setCustomQuestions] = useState(null);

  // NEW: last game result, so we can show a summary bar / debug info if needed
  const [lastResult, setLastResult] = useState(null);

  // Fetch questions from the backend database on mount
  useEffect(() => {
    let isMounted = true;
    const fetchQuestionsFromDB = async () => {
      try {
        setLoadingQuestions(true);
        setFetchError(null);
        const response = await fetch('/api/questions');
        if (!isMounted) return;

        if (response.ok) {
          const resData = await response.json();
          const items = Array.isArray(resData) 
            ? resData 
            : (resData.questions || resData.data || []);
          setQuestionBank(items);
        } else {
          setFetchError('Failed to synchronize with question database.');
          console.error('Failed to fetch questions from database');
        }
      } catch (error) {
        if (!isMounted) return;
        setFetchError('Network error connecting to backend API.');
        console.error('Error connecting to database API:', error);
      } finally {
        if (isMounted) setLoadingQuestions(false);
      }
    };

    fetchQuestionsFromDB();
    return () => {
      isMounted = false;
    };
  }, []);

  const availableSubjects = useMemo(() => {
    return [...new Set(questionBank.map(q => q.subject))].filter(Boolean);
  }, [questionBank]);

  const availableGrades = useMemo(() => {
    if (!subject) return [];
    const filtered = questionBank.filter(q => q.subject === subject);
    return [...new Set(filtered.map(q => q.grade))].filter(Boolean);
  }, [questionBank, subject]);

  const availableDifficulties = useMemo(() => {
    if (!subject || !grade) return [];
    const filtered = questionBank.filter(q => q.subject === subject && q.grade === grade);
    return [...new Set(filtered.map(q => q.difficulty))].filter(Boolean);
  }, [questionBank, subject, grade]);

  const availableLevels = useMemo(() => {
    if (!subject || !grade || !difficulty) return [];
    
    const filtered = questionBank.filter(
      q => q.subject === subject && q.grade === grade && q.difficulty === difficulty
    );

    const levels = filtered
      .map(q => (q.level !== undefined && q.level !== null && q.level !== '' ? Number(q.level) : null))
      .filter(l => l !== null && !isNaN(l));

    return [...new Set(levels)].sort((a, b) => a - b);
  }, [questionBank, subject, grade, difficulty]);

  // NEW: does a level greater than the currently selected one exist in this
  // subject/grade/difficulty bucket? Drives the "Next Level" vs "Back to
  // Main Menu" button on a perfect run. Always false for uploaded/custom
  // question sets, since those aren't part of the leveled hierarchy.
  const hasNextLevel = useMemo(() => {
    if (customQuestions) return false;
    if (selectedLevel === null || availableLevels.length === 0) return false;
    return availableLevels.some(lvl => lvl > Number(selectedLevel));
  }, [customQuestions, availableLevels, selectedLevel]);

  const handleSubjectChange = (newSubject) => {
    setSubject(newSubject);
    setGrade('');
    setDifficulty('');
    setSelectedLevel(null);
  };

  const handleGradeChange = (newGrade) => {
    setGrade(newGrade);
    setDifficulty('');
    setSelectedLevel(null);
  };

  const handleDifficultyChange = (newDiff) => {
    setDifficulty(newDiff);
    setSelectedLevel(null);
  };

  // Compute final session questions based on strict hierarchical selections
  const computedSessionQuestions = useMemo(() => {
    if (customQuestions) return customQuestions;
    if (!subject || !grade || !difficulty || selectedLevel === null) return [];

    // Find the level document that matches
    const matchedLevelDoc = questionBank.find(
      q => q.subject === subject && 
           q.grade === grade && 
           q.difficulty === difficulty &&
           Number(q.levelNumber || q.level) === Number(selectedLevel)
    );

    if (matchedLevelDoc && Array.isArray(matchedLevelDoc.questions)) {
      return matchedLevelDoc.questions;
    }

    // Fallback if questions are individual items
    return questionBank.filter(
      q => q.subject === subject && 
           q.grade === grade && 
           q.difficulty === difficulty &&
           Number(q.level) === Number(selectedLevel)
    );
  }, [customQuestions, questionBank, subject, grade, difficulty, selectedLevel]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const fileText = await file.text();
      const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      const systemPrompt = "You are an expert quiz generator. Analyze the provided source text and generate high-quality 4-choice multiple-choice questions. You must return your response strictly as a JSON object containing a 'questions' array where each object has 'question', 'choices' (array of 4 strings), and 'correctIndex' (number 0 to 3 representing the correct choice index).";
      const userQuery = `Generate 10 trivia questions based on the following text.\n\nSource Text:\n${fileText}`;

      const payload = {
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery }
       ],
        response_format: { type: 'json_object' }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        const parsedContent = JSON.parse(data.choices[0].message.content);
        const questionsList = parsedContent.questions || [];
        setCustomQuestions(questionsList);
        setAnalysisResult({ url: '#', data: parsedContent });
      } else {
        console.error('Groq API error:', data);
      }
    } catch (error) {
      console.error('Error uploading/processing file:', error);
    } finally {
      setUploading(false);
    }
  };

  // NEW: called by GestureDetector's onComplete with the full result object:
  // { outcome: 'eaten' | 'perfect' | 'partial', completed, score, correctAnswers, totalQuestions, mistakes }
  const handleGameComplete = (result) => {
    console.log('Game completed!', result);
    setLastResult(result);
  };

  // NEW: advances to the next numeric level within the same
  // subject/grade/difficulty bucket, then restarts the game on it.
  const handleNextLevel = () => {
    const next = availableLevels.find(lvl => lvl > Number(selectedLevel));
    if (next === undefined) return;
    setSelectedLevel(next);
    setLastResult(null);
    // GestureDetector remounts because `questions` (computedSessionQuestions)
    // changes identity once selectedLevel changes and this re-renders.
  };

  // NEW: leaves the active game and returns to the level-configuration screen
  // (kept on 'game' mode, just resets `gameStarted`) rather than the mode-select screen.
  const handleBackToLevelConfig = () => {
    setGameStarted(false);
    setLastResult(null);
  };

  if (selectedMode === 'game' && gameStarted) {
    return (
      <div className="flex flex-col flex-grow p-6 h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-slate-100">Matheth Game Arena</h2>
            <span className="text-xs px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 font-medium">
              {customQuestions ? 'Source: Uploaded Document' : `${subject} | Grade ${grade} | ${difficulty} | Level ${selectedLevel} (${computedSessionQuestions.length} Qs) | Timer: ${timerOption}`}
            </span>
          </div>
          <button 
            onClick={() => { setGameStarted(false); setSelectedMode(null); setCustomQuestions(null); setLastResult(null); }}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Exit Game
          </button>
        </div>
        <div className="flex-grow flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative">
          <GestureDetector 
            key={`${subject}-${grade}-${difficulty}-${selectedLevel}-${customQuestions ? 'custom' : 'db'}`}
            questions={computedSessionQuestions}
            timerOption={timerOption}
            hasNextLevel={hasNextLevel}
            onNextLevel={handleNextLevel}
            onBackToLevels={handleBackToLevelConfig}
            onComplete={handleGameComplete}
          />
        </div>
      </div>
  );
}

  if (selectedMode === 'game' && !gameStarted) {
    return (
      <div className="flex flex-col flex-grow p-8 max-w-xl mx-auto w-full justify-center overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Configure Matheth Session</h2>
          <button 
            onClick={() => setSelectedMode(null)}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Back
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {loadingQuestions ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-sm">Loading questions from database...</p>
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <p className="text-sm text-red-400 font-medium">{fetchError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {/* 1. Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                {availableSubjects.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSubjects.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSubjectChange(item)}
                        className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all cursor-pointer ${
                          subject === item 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-400 italic">No subjects found in the database. Please add questions via the Admin Dashboard.</p>
                )}
              </div>

              {/* 2. Grade Level Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Grade Level</label>
                {availableGrades.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableGrades.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleGradeChange(item)}
                        className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all cursor-pointer ${
                          grade === item 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        Grade {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Please select a subject first.</p>
                )}
              </div>

              {/* 3. Difficulty Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                {availableDifficulties.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableDifficulties.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleDifficultyChange(item)}
                        className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all cursor-pointer ${
                          difficulty === item 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Please select a grade level first.</p>
                )}
              </div>

              {/* 4. Level Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-300">Select Level</label>
                  {selectedLevel !== null && (
                    <span className="text-xs text-cyan-400 font-semibold">{computedSessionQuestions.length} Questions</span>
                  )}
                </div>
                {availableLevels.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {availableLevels.map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedLevel(lvl)}
                        className={`py-2 px-3 rounded-lg text-sm font-bold border transition-all cursor-pointer ${
                          selectedLevel === lvl
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        Level {lvl}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {difficulty ? 'No specific levels found for this combination in the database.' : 'Please complete preceding hierarchy steps to view available levels.'}
                  </p>
                )}
              </div>

              {/* Timer Option */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Timer per Question</label>
                <div className="grid grid-cols-4 gap-2">
                  {['None', '15s', '30s', '60s'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTimerOption(item)}
                      className={`py-2 px-2 text-xs rounded-lg border font-medium transition-all cursor-pointer ${
                        timerOption === item 
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setGameStarted(true)}
                disabled={computedSessionQuestions.length === 0 || selectedLevel === null}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-6 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                Start Game ({computedSessionQuestions.length} Questions)
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (selectedMode === 'upload' || selectedMode === 'pdf-upload') {
    return (
      <div className="flex flex-col flex-grow p-8 max-w-2xl mx-auto w-full justify-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Upload Study Document</h2>
          <button 
            onClick={() => { setSelectedMode(null); setFile(null); setAnalysisResult(null); setCustomQuestions(null); }}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Back to Options
          </button>
        </div>

        {!analysisResult ? (
          <form onSubmit={handleUploadSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors bg-slate-900/50">
              <FileUp className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-2">Drag and drop your PDF or document here, or browse</p>
              <input 
                type="file" 
                accept=".pdf,.txt,.doc,.docx" 
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
              />
              {file && <p className="mt-3 text-sm text-cyan-400 font-medium">Selected: {file.name}</p>}
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Parsing Document with AI...
                </>
              ) : (
                'Upload & Generate AI Content'
              )}
            </button>
          </form>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-cyan-400">Document Uploaded & Parsed Successfully!</h3>
            <p className="text-slate-300 text-sm">Generated <span className="text-cyan-400 font-bold">{customQuestions?.length || 0}</span> questions from your document.</p>
            <button
              onClick={() => { setSelectedMode('game'); setGameStarted(true); }}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Start Game with Generated Questions
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center flex-grow p-8 text-center">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Game Arena</h1>
      <p className="text-slate-400 max-w-md mb-10">
        Choose your pathway below to begin your interactive challenge session.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        <button
          onClick={() => { setSelectedMode('game'); setCustomQuestions(null); }}
          className="flex flex-col items-center p-8 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl transition-all group text-left cursor-pointer"
        >
          <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Matheth Game</h2>
          <p className="text-slate-400 text-sm mb-6">
            Launch the interactive camera-based game using hand gestures to answer questions.
          </p>
          <div className="flex items-center text-cyan-400 font-semibold text-sm mt-auto gap-1">
            Configure & Play <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          onClick={() => navigate('/upload')}
          className="flex flex-col items-center p-8 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl transition-all group text-left cursor-pointer"
        >
          <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-xl mb-4 group-hover:scale-110 transition-transform">
            <FileUp className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Upload Document</h2>
          <p className="text-slate-400 text-sm mb-6">
            Upload study documents or notes for AI parsing and automated quiz generation.
          </p>
          <div className="flex items-center text-cyan-400 font-semibold text-sm mt-auto gap-1">
            Upload File <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
}