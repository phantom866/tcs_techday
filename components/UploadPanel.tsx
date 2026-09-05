'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileType,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ClipboardPaste,
  Check,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { DEMO_SAMPLES, DemoSample } from '@/lib/demo-data';
import { parsePdfFile, parseDocxFile } from '@/lib/document-parser';

export type SupportedFileType = 'txt' | 'csv' | 'pdf' | 'docx' | 'pasted';

interface UploadPanelProps {
  text: string;
  onTextChange: (val: string) => void;
  onScan: () => void;
  isScanning: boolean;
  activeFileName?: string;
  activeFileType?: SupportedFileType;
  onFileLoaded: (name: string, type: 'txt' | 'csv' | 'pdf' | 'docx', content: string) => void;
  onClear: () => void;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  text,
  onTextChange,
  onScan,
  isScanning,
  activeFileName,
  activeFileType,
  onFileLoaded,
  onClear,
  errorMessage,
  setErrorMessage,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractingStatus, setExtractingStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !['txt', 'csv', 'pdf', 'docx'].includes(extension)) {
      setErrorMessage('File type not supported. Please upload a .txt, .csv, .pdf, or .docx file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File is too large for demonstration (maximum 10MB).');
      return;
    }

    if (extension === 'pdf') {
      try {
        setIsExtracting(true);
        setExtractingStatus(`Parsing PDF: ${file.name}...`);
        const content = await parsePdfFile(file);
        onFileLoaded(file.name, 'pdf', content);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to extract text from PDF.';
        setErrorMessage(message);
      } finally {
        setIsExtracting(false);
        setExtractingStatus('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    if (extension === 'docx') {
      try {
        setIsExtracting(true);
        setExtractingStatus(`Extracting Word document: ${file.name}...`);
        const content = await parseDocxFile(file);
        onFileLoaded(file.name, 'docx', content);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to read Word document.';
        setErrorMessage(message);
      } finally {
        setIsExtracting(false);
        setExtractingStatus('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      return;
    }

    // Handle .txt and .csv files via FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || content.trim() === '') {
        setErrorMessage('Uploaded file is empty.');
        return;
      }
      onFileLoaded(file.name, extension as 'txt' | 'csv', content);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file. Please ensure it is a valid text file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadDemo = (sample: DemoSample) => {
    onFileLoaded(
      sample.type === 'csv' ? `${sample.id}.csv` : `${sample.id}.txt`,
      sample.type,
      sample.text
    );
    setShowDemoMenu(false);
    setErrorMessage(null);
  };

  const lineCount = text ? text.split('\n').length : 0;
  const charCount = text.length;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ClipboardPaste className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Input Document & Text</h2>
            <p className="text-xs text-slate-400">
              {activeFileName ? (
                <span className="text-cyan-400 font-mono">
                  Loaded: {activeFileName} {activeFileType ? `(${activeFileType.toUpperCase()})` : ''}
                </span>
              ) : (
                'Paste text or upload .TXT / .CSV / .PDF / .DOCX'
              )}
            </p>
          </div>
        </div>

        {/* Demo Selector & Controls */}
        <div className="flex items-center space-x-2">
          {/* Preset Demo Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Demo Data</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Synthetic Test Scenarios
                </div>
                {DEMO_SAMPLES.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => handleLoadDemo(sample)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {sample.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{sample.category}</div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      .{sample.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClear}
            disabled={!text}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
            title="Clear current text"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isExtracting && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all mb-3 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20'
            : isExtracting
            ? 'border-indigo-500/50 bg-indigo-950/10 cursor-wait'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isExtracting}
        />
        <div className="flex items-center justify-center space-x-3">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
            {isExtracting ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            ) : (
              <UploadCloud className="w-5 h-5" />
            )}
          </div>
          <div className="text-left">
            {isExtracting ? (
              <div>
                <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <span>{extractingStatus}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Extracting text client-side in browser memory...
                </div>
              </div>
            ) : (
              <>
                <div className="text-xs font-medium text-slate-200">
                  Drag & drop a{' '}
                  <span className="text-cyan-400 font-semibold">.txt</span>,{' '}
                  <span className="text-cyan-400 font-semibold">.csv</span>,{' '}
                  <span className="text-cyan-400 font-semibold">.pdf</span>, or{' '}
                  <span className="text-cyan-400 font-semibold">.docx</span> file, or{' '}
                  <span className="underline text-blue-400">browse</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Supports TXT, CSV, PDF, and DOCX (up to 10MB) • 100% local browser execution
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 flex flex-col min-h-[220px] relative">
        <textarea
          value={text}
          onChange={(e) => {
            onTextChange(e.target.value);
            if (errorMessage) setErrorMessage(null);
          }}
          placeholder="Paste document text here, upload a .txt / .csv / .pdf / .docx file, or click 'Load Demo Data' above..."
          className="w-full flex-1 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-y"
          rows={9}
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 px-1">
          <div className="flex items-center space-x-3">
            <span>Lines: <strong className="text-slate-300">{lineCount}</strong></span>
            <span>Characters: <strong className="text-slate-300">{charCount.toLocaleString()}</strong></span>
          </div>
          {charCount > 400000 && (
            <span className="text-amber-400 text-[10px]">
              Large payload warning ({Math.round(charCount / 1000)}k chars)
            </span>
          )}
        </div>
      </div>

      {/* Error / Validation Banner */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-center space-x-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="pt-4 border-t border-slate-800/80 mt-3">
        <button
          onClick={onScan}
          disabled={isScanning || isExtracting}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Document Entities...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-slate-950" />
              <span>Scan & Redact</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
