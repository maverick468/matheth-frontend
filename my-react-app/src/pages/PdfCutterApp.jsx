import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Added for URL query param support
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function PdfCutterApp() {
  const [searchParams] = useSearchParams(); // Read URL query parameters
  const [view, setView] = useState('upload'); // 'upload' | 'editor' | 'success'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageRange, setPageRange] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState('');
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  // Automatically parse URL parameters on load if passed from Admin Dashboard
  useEffect(() => {
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');
    if (startParam && endParam) {
      setPageRange(`${startParam}-${endParam}`);
      showToast(`Preset range loaded from admin: ${startParam}-${endParam}`, 'info');
    }
  }, [searchParams]);

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

  const processFile = async (file) => {
    if (file.type !== 'application/pdf') {
      showToast('Please upload a valid PDF document.', 'error');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showToast('File size exceeds 25MB limit.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      setSelectedFile(file);
      setTotalPages(pdfDoc.numPages);
      
      // Preserve admin range if present, otherwise default to full range
      const startParam = searchParams.get('start');
      const endParam = searchParams.get('end');
      if (!startParam || !endParam) {
        setPageRange(`1-${pdfDoc.numPages}`);
      }

      setIsProcessing(false);
      setView('editor');
      showToast(`Loaded ${file.name} (${pdfDoc.numPages} pages)`, 'info');
    } catch (err) {
      setIsProcessing(false);
      showToast('Failed to read PDF structure. Try another file.', 'error');
    }
  };

  // Parse page range string like "1-5, 8, 10-15" into an array of 0-based page indices
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
          indices.add(i - 1); // convert to 0-indexed
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

  const handleCutPdf = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const targetIndices = parsePageRanges(pageRange, totalPages);
      if (targetIndices.length === 0) {
        throw new Error('Please specify at least one valid page to extract.');
      }

      // Create a new PDF document
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, targetIndices);
      
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const originalNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${originalNameWithoutExt}_sliced.pdf`;

      setDownloadUrl(url);
      setDownloadFileName(outName);
      setIsProcessing(false);
      setView('success');
      showToast('PDF sliced successfully!', 'info');
    } catch (err) {
      setIsProcessing(false);
      showToast(err.message || 'Error processing PDF pages.', 'error');
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setTotalPages(0);
    setPageRange('');
    setDownloadUrl(null);
    setDownloadFileName('');
    setView('upload');
  };

  return (
    <div className={`h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <i className="fa-solid fa-scissors text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">PDFCutter SaaS</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extract exact page portions instantly</p>
            </div>
          </div>
          <button onClick={toggleDarkMode} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
            <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">

        {/* View 1: Upload */}
        {view === 'upload' && (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight">Slice Your PDF Documents</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">Upload any PDF file. Our tool analyzes its total page count and lets you slice out exact page ranges in seconds.</p>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-2xl p-10 text-center cursor-pointer transition bg-white/90 dark:bg-slate-900/95 shadow-xl"
            >
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-2xl shadow-inner">
                  <i className="fa-solid fa-file-pdf"></i>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-lg">Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-500">Supports multi-page PDF documents up to 25MB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Spinner View */}
        {isProcessing && view === 'upload' && (
          <div className="text-center py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-slate-500">Analyzing PDF page structure...</p>
          </div>
        )}

        {/* View 2: Editor & Range Selector */}
        {view === 'editor' && selectedFile && (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <i className="fa-solid fa-file-lines text-lg"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm truncate max-w-xs md:max-w-md">{selectedFile.name}</h3>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">Total Pages Available: {totalPages}</p>
                </div>
              </div>
              <button onClick={resetApp} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer">
                Change File
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Select Pages or Range to Extract:
              </label>
              <input 
                type="text" 
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="e.g. 1-8, 9-45, or 3, 5, 12-20"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
              />
              <p className="text-xs text-slate-500">
                You can specify continuous ranges (e.g. <code className="text-cyan-500 font-bold">1-8</code>), single pages, or comma-separated combinations.
              </p>
            </div>

            <button 
              onClick={handleCutPdf}
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Slicing PDF Portions...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-scissors"></i>
                  <span>Cut & Extract PDF Pages</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* View 3: Success & Download */}
        {view === 'success' && (
          <div className="text-center space-y-6 py-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-check"></i>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">PDF Successfully Sliced!</h2>
              <p className="text-slate-500 dark:text-slate-400">Your requested page range has been successfully extracted.</p>
            </div>

            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md mx-auto shadow-xl space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-500 uppercase">Output File Name</p>
                <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-1 truncate">{downloadFileName}</p>
              </div>

              <div className="flex flex-col gap-3">
                <a 
                  href={downloadUrl} 
                  download={downloadFileName}
                  className="w-full py-3.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>Download Sliced PDF</span>
                </a>
                <button 
                  onClick={resetApp} 
                  className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition text-sm cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-rotate-left mr-2"></i> Cut Another PDF
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <p>© 2026 PDFCutter SaaS. All rights reserved.</p>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white font-medium text-sm flex items-center space-x-2 transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-slate-900 dark:bg-slate-800 border border-slate-700'}`}>
          <i className={`fa-solid ${toast.type === 'error' ? 'fa-circle-exclamation text-red-200' : 'fa-circle-info text-cyan-400'}`}></i>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}