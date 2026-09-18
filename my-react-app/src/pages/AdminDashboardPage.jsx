// frontend/src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { adminService } from '../services/adminService';

// Configure PDF.js worker using unpkg with installed package version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const SUBJECTS = ['Maths', 'Physics', 'Chemistry', 'English', 'Economics', 'Biology', 'SAT', 'Geography', 'History'];
const GRADES = ['9', '10', '11', '12'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('levels'); // 'levels', 'create', 'upload-pdf', 'pdf-cutter'
  
  // Existing Levels State
  const [levels, setLevels] = useState([]);
  const [fetchingLevels, setFetchingLevels] = useState(false);
  const [editingLevelId, setEditingLevelId] = useState(null);

  // AI PDF Extraction State
  const [pdfFile, setPdfFile] = useState(null);
  const [extractingPdf, setExtractingPdf] = useState(false);

  // PDF Slicing / Cutter State
  const [cutterFile, setCutterFile] = useState(null);
  const [cutterTotalPages, setCutterTotalPages] = useState(0);
  const [cutterPageRange, setCutterPageRange] = useState('');
  const [cutterProcessing, setCutterProcessing] = useState(false);
  const [cutterDownloadUrl, setCutterDownloadUrl] = useState(null);
  const [cutterDownloadName, setCutterDownloadName] = useState('');
  const cutterFileInputRef = useRef(null);

  // Form State
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [grade, setGrade] = useState(GRADES[2]); 
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[1]); 
  const [levelNumber, setLevelNumber] = useState(1);
  
  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }, () => ({
      question: '',
      choices: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    }))
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'levels') {
      fetchLevels();
    }
  }, [activeTab]);

  const fetchLevels = async () => {
    setFetchingLevels(true);
    setError(null);
    try {
      const data = await adminService.getAllLevels();
      setLevels(data || []);
    } catch (err) {
      setError('Failed to fetch existing levels.');
    } finally {
      setFetchingLevels(false);
    }
  };

  const handleDeleteLevel = async (levelId) => {
    if (!window.confirm('Are you sure you want to delete this level batch?')) return;
    try {
      await adminService.deleteLevel(levelId);
      setLevels(levels.filter(l => (l._id || l.id) !== levelId));
      setMessage('Level successfully deleted.');
    } catch (err) {
      setError('Failed to delete level.');
    }
  };

  const handleEditLevel = (lvl) => {
    const targetId = lvl._id || lvl.id;
    setEditingLevelId(targetId);
    setSubject(lvl.subject);
    setGrade(lvl.grade);
    setDifficulty(lvl.difficulty);
    setLevelNumber(lvl.levelNumber || lvl.level || 1);
    setQuestions(lvl.questions || Array.from({ length: 10 }, () => ({ question: '', choices: ['', '', '', ''], correctIndex: 0, explanation: '' })));
    setActiveTab('create');
  };

  const handleResetForm = () => {
    setEditingLevelId(null);
    setSubject(SUBJECTS[0]);
    setGrade(GRADES[2]);
    setDifficulty(DIFFICULTIES[1]);
    setLevelNumber(1);
    setQuestions(
      Array.from({ length: 10 }, () => ({
        question: '',
        choices: ['', '', '', ''],
        correctIndex: 0,
        explanation: ''
      }))
    );
    setPdfFile(null);
    setCutterFile(null);
    setCutterTotalPages(0);
    setCutterPageRange('');
    setCutterDownloadUrl(null);
    setCutterDownloadName('');
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleChoiceChange = (qIndex, cIndex, value) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const parsedLevelNum = Number(levelNumber);
      const formattedQuestions = questions.map(q => ({
        ...q,
        level: parsedLevelNum
      }));

      const payload = { 
        subject, 
        grade, 
        difficulty, 
        levelNumber: parsedLevelNum, 
        questions: formattedQuestions 
      };
      
      let res;
      if (editingLevelId) {
        res = await adminService.updateLevelBatch(editingLevelId, payload);
        setMessage('Level successfully updated!');
      } else {
        res = await adminService.addLevelBatch(payload);
        setMessage(res.message || 'Level successfully created!');
      }
      
      handleResetForm();
      setTimeout(() => {
        setActiveTab('levels');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save level.');
    } finally {
      setLoading(false);
    }
  };

  // AI PDF Extraction Function
  const handleExtractPdfAI = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setError('Please select or drop a PDF file first.');
      return;
    }

    if (pdfFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setExtractingPdf(true);
    setError(null);
    setMessage(null);

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'}/generate-quiz`;

    let success = false;
    let attempts = 0;
    let delay = 1000;
    let parsedQuestions = [];

    while (!success && attempts < 3) {
      try {
        attempts++;
        const formData = new FormData();
        formData.append('file', pdfFile);
        formData.append('questionCount', '10');
        formData.append('difficulty', difficulty);
        formData.append('grade', grade);

        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.text();
          throw new Error(`HTTP error! status: ${response.status} - ${errData}`);
        }
        
        const result = await response.json();
        parsedQuestions = result.questions;

        if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          success = true;
        } else {
          throw new Error('Invalid questions structure returned from AI.');
        }
      } catch (err) {
        if (attempts >= 3) {
          setError(`Failed to extract questions: ${err.message}`);
          setExtractingPdf(false);
          return;
        }
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }

    const formattedExtracted = parsedQuestions.slice(0, 10).map(q => ({
      question: q.question || '',
      choices: q.choices || ['', '', '', ''],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      explanation: q.explanation || ''
    }));

    setQuestions(formattedExtracted);
    setExtractingPdf(false);
    setMessage('Successfully extracted 10 questions via AI! Review and publish below.');
    setActiveTab('create');
  };

  // PDF Cutter File Handler
  const handleCutterFileProcess = async (file) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF document.');
      return;
    }
    setCutterProcessing(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      setCutterFile(file);
      setCutterTotalPages(pdfDoc.numPages);
      setCutterPageRange(`1-${pdfDoc.numPages}`);
      setCutterProcessing(false);
      setMessage(`Loaded ${file.name} (${pdfDoc.numPages} pages)`);
    } catch (err) {
      setCutterProcessing(false);
      setError('Failed to read PDF structure. Try another file.');
    }
  };

  // Parse page range string (e.g. "1-5, 8, 10-15") into 0-based indices
  const parsePageRanges = (rangeStr, maxPages) => {
    const indices = new Set();
    const parts = rangeStr.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(num => parseInt(num.trim(), 10));
        if (isNaN(start) || isNaN(end)) throw new Error(`Invalid range format: "${trimmed}"`);
        if (start < 1 || end > maxPages || start > end) {
          throw new Error(`Pages out of bounds (1 - ${maxPages}): "${trimmed}"`);
        }
        for (let i = start; i <= end; i++) {
          indices.add(i - 1);
        }
      } else {
        const pageNum = parseInt(trimmed, 10);
        if (isNaN(pageNum) || pageNum < 1 || pageNum > maxPages) {
          throw new Error(`Invalid page number: "${trimmed}"`);
        }
        indices.add(pageNum - 1);
      }
    }
    return Array.from(indices);
  };

  // Execute PDF Slicing using pdf-lib
  const handleExecutePdfCut = async () => {
    if (!cutterFile) return;

    setCutterProcessing(true);
    setError(null);
    try {
      const arrayBuffer = await cutterFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const targetIndices = parsePageRanges(cutterPageRange, cutterTotalPages);
      if (targetIndices.length === 0) {
        throw new Error('Please specify at least one valid page to extract.');
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, targetIndices);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const originalNameWithoutExt = cutterFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${originalNameWithoutExt}_sliced.pdf`;

      setCutterDownloadUrl(url);
      setCutterDownloadName(outName);
      setCutterProcessing(false);
      setMessage('PDF sliced successfully! Ready for download.');
    } catch (err) {
      setCutterProcessing(false);
      setError(err.message || 'Error processing PDF pages.');
    }
  };

  const choiceLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-6xl mx-auto p-6 text-slate-100 min-h-screen">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
            Matheth Admin Portal
          </h1>
          <p className="text-sm text-slate-400 mt-1">Curate trivia levels, manage question pipelines, and configure curricula.</p>
        </div>
        
        <div className="flex flex-wrap bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-inner gap-1">
          <button 
            onClick={() => { setActiveTab('levels'); handleResetForm(); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'levels' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Existing Levels ({levels.length})
          </button>
          <button 
            onClick={() => { setActiveTab('create'); handleResetForm(); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'create' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            + Manual Batch
          </button>
          <button 
            onClick={() => { setActiveTab('upload-pdf'); handleResetForm(); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'upload-pdf' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            ✨ AI PDF Extraction
          </button>
          <button 
            onClick={() => { setActiveTab('pdf-cutter'); handleResetForm(); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === 'pdf-cutter' ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            ✂️ PDF Cutter
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-sm animate-pulse">{error}</div>}
      {message && <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-200 text-sm">{message}</div>}

      {/* TAB 1: EXISTING LEVELS VIEW */}
      {activeTab === 'levels' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-200">Curated Question Batches</h2>
            <button 
              onClick={fetchLevels}
              className="text-xs text-cyan-400 hover:text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 transition cursor-pointer"
            >
              Refresh List
            </button>
          </div>

          {fetchingLevels ? (
            <div className="text-center py-20 text-slate-500">Loading curriculum database...</div>
          ) : levels.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <p className="text-slate-400 mb-4">No question levels found in the database.</p>
              <button 
                onClick={() => setActiveTab('create')} 
                className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl text-sm hover:bg-cyan-400 transition cursor-pointer"
              >
                Create First Batch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levels.map((lvl) => {
                const levelId = lvl._id || lvl.id;
                return (
                  <div key={levelId} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-xs font-bold rounded-full">
                          {lvl.subject} • Grade {lvl.grade}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                          lvl.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                          lvl.difficulty === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-900' :
                          'bg-rose-950 text-rose-400 border border-rose-900'
                        }`}>
                          {lvl.difficulty}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">Level {lvl.levelNumber || lvl.level || levelId}</h3>
                      <p className="text-xs text-slate-400 mb-4">Contains {lvl.questions?.length || 0} verified questions</p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                      <span className="text-xs text-slate-500">Added: {lvl.createdAt ? new Date(lvl.createdAt).toLocaleDateString() : 'N/A'}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditLevel(lvl)}
                          className="px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900 text-cyan-300 border border-cyan-900/60 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteLevel(levelId)}
                          className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900 text-red-300 border border-red-900/60 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI PDF EXTRACTION VIEW */}
      {activeTab === 'upload-pdf' && (
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-cyan-300">AI PDF Question Extractor</h2>
            <p className="text-sm text-slate-400">Upload a resource PDF to automatically generate exactly 10 multiple-choice questions for review.</p>
          </div>
          
          <form onSubmit={handleExtractPdfAI} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Subject Target</label>
                <select 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium focus:border-cyan-500 focus:outline-none"
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Difficulty Tier</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium focus:border-cyan-500 focus:outline-none"
                >
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) setPdfFile(file);
              }}
              className="border-2 border-dashed border-slate-700 p-8 rounded-2xl text-center bg-slate-950/50 hover:border-cyan-500 transition cursor-pointer"
            >
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0])}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-3">{pdfFile ? `Loaded: ${pdfFile.name}` : 'Drop PDF document or browse files (Max 10MB)'}</p>
            </div>

            <button 
              type="submit" 
              disabled={extractingPdf}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl transition cursor-pointer disabled:opacity-50 text-sm flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/10"
            >
              {extractingPdf ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></div>
                  <span>AI Parsing Document (10 Questions)...</span>
                </>
              ) : (
                <span>Extract 10 Questions via AI</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: REAL PDF CUTTER VIEW */}
      {activeTab === 'pdf-cutter' && (
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-cyan-300">PDF Page Cutter & Extractor</h2>
            <p className="text-sm text-slate-400">Upload a full PDF document, specify your custom page range or slices, and export a clean sliced PDF instantly.</p>
          </div>

          {!cutterFile ? (
            <div 
              onClick={() => cutterFileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleCutterFileProcess(file);
              }}
              className="border-2 border-dashed border-slate-700 p-10 rounded-2xl text-center bg-slate-950/50 hover:border-cyan-500 transition cursor-pointer space-y-4"
            >
              <input 
                ref={cutterFileInputRef}
                type="file" 
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCutterFileProcess(file);
                }}
                className="hidden" 
              />
              <div className="w-14 h-14 mx-auto rounded-full bg-cyan-950/80 text-cyan-400 flex items-center justify-center text-xl shadow-inner">
                <i className="fa-solid fa-file-pdf"></i>
              </div>
              <div>
                <p className="font-semibold text-slate-200 text-base">Click to upload PDF or drag & drop</p>
                <p className="text-xs text-slate-500 mt-1">Supports multi-page textbook or document PDFs</p>
              </div>
            </div>
          ) : cutterProcessing && !cutterDownloadUrl ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-medium text-slate-400">Analyzing PDF page structure...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="truncate pr-4">
                  <p className="text-xs text-slate-500 uppercase font-bold">Loaded Document</p>
                  <p className="text-sm font-semibold text-white truncate">{cutterFile.name}</p>
                  <p className="text-xs text-cyan-400 mt-0.5">Total Pages Available: {cutterTotalPages}</p>
                </div>
                <button 
                  onClick={() => { setCutterFile(null); setCutterDownloadUrl(null); }}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer shrink-0"
                >
                  Change File
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Target Pages or Range</label>
                <input 
                  type="text" 
                  value={cutterPageRange}
                  onChange={(e) => setCutterPageRange(e.target.value)}
                  placeholder="e.g. 1-8, 12, 15-20"
                  className="w-full p-4 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono focus:border-cyan-500 focus:outline-none text-cyan-400 font-bold"
                />
                <p className="text-xs text-slate-500">Specify ranges using hyphens (<code className="text-cyan-400">1-5</code>) or comma-separated pages.</p>
              </div>

              {!cutterDownloadUrl ? (
                <button 
                  type="button" 
                  onClick={handleExecutePdfCut}
                  disabled={cutterProcessing}
                  className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition cursor-pointer text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2"
                >
                  {cutterProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Slicing PDF Document...</span>
                    </>
                  ) : (
                    <span>Cut & Export Sliced PDF</span>
                  )}
                </button>
              ) : (
                <div className="p-6 bg-slate-950 border border-emerald-800/80 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center text-xl shadow-lg">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Sliced PDF Ready!</p>
                    <p className="text-xs text-emerald-400 mt-1 truncate">{cutterDownloadName}</p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <a 
                      href={cutterDownloadUrl} 
                      download={cutterDownloadName}
                      className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-lg"
                    >
                      <i className="fa-solid fa-download"></i>
                      <span>Download PDF</span>
                    </a>
                    <button 
                      onClick={() => { setCutterDownloadUrl(null); setCutterFile(null); }}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Cut Another
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CREATE / EDIT BATCH FORM */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-cyan-300">
              {editingLevelId ? 'Edit Question Batch' : 'Create / Review Question Batch'}
            </h2>
            {editingLevelId && (
              <button 
                type="button" 
                onClick={handleResetForm}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Cancel Editing
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Subject</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium focus:border-cyan-500 focus:outline-none"
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Grade Level</label>
              <select 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium focus:border-cyan-500 focus:outline-none"
              >
                {GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Difficulty Tier</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium focus:border-cyan-500 focus:outline-none"
              >
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-slate-400">Level Number</label>
              <input 
                type="number"
                min="1"
                value={levelNumber}
                onChange={(e) => setLevelNumber(parseInt(e.target.value) || 1)}
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium focus:border-cyan-500 focus:outline-none text-cyan-400 font-bold"
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-200">Question Builder Workspace</h3>
              <span className="text-xs px-3 py-1 bg-cyan-950/80 border border-cyan-800 text-cyan-300 rounded-full font-semibold">
                Batch Requirement: Exactly 10 Questions
              </span>
            </div>
            
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-6 bg-slate-950/80 border border-slate-800/80 rounded-2xl space-y-4 hover:border-slate-700 transition">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">Question {qIndex + 1} of 10</span>
                </div>
                
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Question Prompt</label>
                  <textarea 
                    rows={3}
                    placeholder="Type comprehensive question prompt here..." 
                    value={q.question}
                    onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                    className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:border-cyan-500 focus:outline-none resize-y leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2 font-medium">Answer Choices (A, B, C, D)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.choices.map((choice, cIndex) => (
                      <div key={cIndex} className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-cyan-500">
                        <span className="px-4 py-3 bg-slate-800 text-cyan-400 font-bold text-xs border-r border-slate-700">
                          {choiceLabels[cIndex]}
                        </span>
                        <input 
                          type="text" 
                          placeholder={`Enter option ${choiceLabels[cIndex]} text...`} 
                          value={choice}
                          onChange={(e) => handleChoiceChange(qIndex, cIndex, e.target.value)}
                          className="w-full p-3 bg-transparent text-sm focus:outline-none"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Correct Answer Key</label>
                    <select 
                      value={q.correctIndex}
                      onChange={(e) => handleQuestionChange(qIndex, 'correctIndex', parseInt(e.target.value))}
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-xs text-slate-400 block mb-1.5 font-medium">Explanation (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="Explain why the correct answer is right..." 
                      value={q.explanation}
                      onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/10 transition-all cursor-pointer disabled:opacity-50 text-base"
          >
            {loading ? 'Saving Changes...' : (editingLevelId ? 'Update Level Batch' : 'Publish Complete Level Batch (10 Questions)')}
          </button>
        </form>
      )}
    </div>
  );
}