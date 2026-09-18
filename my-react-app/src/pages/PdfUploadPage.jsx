import React, { useState, useRef } from 'react';

export default function QuizApp() {
  const [view, setView] = useState('upload'); // 'upload' | 'loading' | 'game' | 'results'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [manualText, setManualText] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [difficultyLevel, setDifficultyLevel] = useState('Medium');
  
  const [quizData, setQuizData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit.', 'error');
      return;
    }
    setSelectedFile(file);
    setSelectedFileName(file.name);
    showToast(`Loaded ${file.name} successfully!`, 'info');
  };

  const generateQuiz = async () => {
    if (!selectedFile && !manualText.trim()) {
      showToast('Please upload a file or paste study text first.', 'error');
      return;
    }

    setView('loading');

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/generate-quiz`;

    let success = false;
    let attempts = 0;
    let delay = 1000;
    let parsedQuiz = [];

    while (!success && attempts < 3) {
      try {
        attempts++;

        const formData = new FormData();
        if (selectedFile) {
          formData.append('file', selectedFile);
        }
        if (manualText.trim()) {
          formData.append('sourceText', manualText.trim());
        }
        formData.append('questionCount', questionCount);
        formData.append('difficulty', difficultyLevel);
        formData.append('grade', '11');

        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errData}`);
        }
        
        const result = await response.json();
        parsedQuiz = result.questions;

        if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0) {
          success = true;
        } else {
          throw new Error('Invalid quiz structure returned.');
        }
      } catch (err) {
        if (attempts >= 3) {
          showToast(`Failed to generate quiz: ${err.message}`, 'error');
          setView('upload');
          return;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }

    setQuizData(parsedQuiz);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswerIndex(null);
    setIsAnswerLocked(false);
    setView('game');
  };

  const selectAnswer = (idx) => {
    if (isAnswerLocked) return;
    setIsAnswerLocked(true);
    setSelectedAnswerIndex(idx);

    const currentQ = quizData[currentQuestionIndex];
    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 10);
      showToast('Correct Answer!', 'info');
    } else {
      showToast('Incorrect!', 'error');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex + 1 < quizData.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setIsAnswerLocked(false);
    } else {
      setView('results');
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswerIndex(null);
    setIsAnswerLocked(false);
    setView('game');
  };

  const resetToUpload = () => {
    setQuizData([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedFile(null);
    setSelectedFileName('');
    setManualText('');
    setSelectedAnswerIndex(null);
    setIsAnswerLocked(false);
    setView('upload');
  };

  const currentQ = quizData[currentQuestionIndex];
  const maxPossibleScore = quizData.length * 10;
  const percentage = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;

  return (
    <div className={`h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <i className="fa-solid fa-brain text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">Matheth Quiz</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Interactive document-to-game portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={toggleDarkMode} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">

        {view === 'upload' && (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight">Transform Any Document Into a Trivia Game</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Upload PDFs, Word docs, images, or notes. Our AI will analyze the content and generate custom 4-choice multiple choice questions for your game.</p>
            </div>

            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-900/50"
              >
                <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {selectedFileName ? 'File Loaded Successfully:' : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-xs text-slate-500">Supports PDF, DOCX, Images, TXT, MD, CSV, JSON (max 10MB)</p>
                  </div>
                  {selectedFileName && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                      {selectedFileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Or paste your study text directly:</label>
                <textarea 
                  rows="4" 
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste chapters, notes, or article content here..." 
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Questions</label>
                  <select 
                    value={questionCount} 
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  >
                    <option value="5">5 Questions (Quick)</option>
                    <option value="10">10 Questions (Standard)</option>
                    <option value="15">15 Questions (Challenge)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Difficulty Level</label>
                  <select 
                    value={difficultyLevel} 
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  >
                    <option value="Easy">Easy (Beginner Friendly)</option>
                    <option value="Medium">Medium (Balanced)</option>
                    <option value="Hard">Hard (Expert)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={generateQuiz} 
                className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                <span>Generate Trivia Game</span>
              </button>
            </div>
          </div>
        )}

        {view === 'loading' && (
          <div className="text-center py-16 space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                <i className="fa-solid fa-brain animate-pulse"></i>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">Analyzing Your Document</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Gemini AI is processing your file natively and crafting high-quality 4-choice multiple choice questions...</p>
            </div>
          </div>
        )}

        {view === 'game' && currentQ && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {quizData.length}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5 text-amber-500 font-semibold text-sm">
                  <i className="fa-solid fa-fire"></i>
                  <span>Score: {score}</span>
                </div>
                <div className="w-32 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300" 
                    style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <h3 className="text-xl md:text-2xl font-semibold leading-snug">{currentQ.question}</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {currentQ.choices.map((choice, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  let btnStyle = "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20";
                  let badgeStyle = "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white";

                  if (isAnswerLocked) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200";
                      badgeStyle = "bg-emerald-600 text-white";
                    } else if (idx === selectedAnswerIndex) {
                      btnStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200";
                      badgeStyle = "bg-rose-600 text-white";
                    }
                  }

                  return (
                    <button 
                      key={idx}
                      onClick={() => selectAnswer(idx)}
                      disabled={isAnswerLocked}
                      className={`w-full text-left p-4 rounded-xl border font-medium text-sm flex items-center space-x-3 transition group ${btnStyle}`}
                    >
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition ${badgeStyle}`}>
                        {letters[idx]}
                      </span>
                      <span className="flex-1">{choice}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswerLocked && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <i className="fa-solid fa-circle-info"></i>
                    <span>Explanation</span>
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{currentQ.explanation}</p>
                </div>
              )}

              {isAnswerLocked && (
                <div className="flex justify-end pt-2">
                  <button 
                    onClick={nextQuestion}
                    className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition"
                  >
                    <span>{currentQuestionIndex + 1 < quizData.length ? 'Next Question' : 'View Results'}</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'results' && (
          <div className="text-center space-y-6 py-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Quiz Completed!</h2>
              <p className="text-slate-500 dark:text-slate-400">Here is how you performed on your uploaded document.</p>
            </div>

            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md mx-auto shadow-xl space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 uppercase">Final Score</p>
                  <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{score} / {maxPossibleScore}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 uppercase">Accuracy</p>
                  <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{percentage}%</p>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-xl">
                {percentage >= 80 ? "🏆 Outstanding! You've mastered the material." : percentage >= 50 ? "👍 Good job! You have a solid grasp of the concepts." : "📚 Keep reviewing your notes and try again to boost your score!"}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={restartQuiz} className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition">
                  <i className="fa-solid fa-rotate-right mr-2"></i> Play Again
                </button>
                <button onClick={resetToUpload} className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition">
                  <i className="fa-solid fa-upload mr-2"></i> New File
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <p>© 2026 Matheth. All rights reserved.</p>
        <div className="flex justify-center space-x-4">
          <a href="#faq" className="hover:underline">FAQ</a>
          <span>•</span>
          <a href="#admin" className="hover:underline">Admin Portal</a>
        </div>
      </footer>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white font-medium text-sm flex items-center space-x-2 transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-slate-900 dark:bg-slate-800 border border-slate-700'}`}>
          <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation text-red-200' : 'fa-circle-info text-indigo-400'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}