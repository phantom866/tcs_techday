'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MetricsCards } from '@/components/MetricsCards';
import { UploadPanel } from '@/components/UploadPanel';
import { RedactionSettings } from '@/components/RedactionSettings';
import { OriginalVsRedacted } from '@/components/OriginalVsRedacted';
import { DetectionReport } from '@/components/DetectionReport';
import { EvaluationPanel } from '@/components/EvaluationPanel';
import { PrivacyModal } from '@/components/PrivacyModal';
import { ApiModal } from '@/components/ApiModal';
import { DEFAULT_DEMO_TEXT } from '@/lib/demo-data';
import { defaultDetectionEngine } from '@/lib/detection/engine';
import { redactText, DEFAULT_REDACTION_RULES } from '@/lib/redaction/engine';
import { RedactionRules, ScanResult, EntityType } from '@/types';
import { Info, CheckCircle2, Shield, Lock, Cpu, Sparkles } from 'lucide-react';

export default function Home() {
  const [text, setText] = useState<string>(DEFAULT_DEMO_TEXT);
  const [rules, setRules] = useState<RedactionRules>(DEFAULT_REDACTION_RULES);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [activeFileName, setActiveFileName] = useState<string | undefined>(undefined);
  const [activeFileType, setActiveFileType] = useState<'txt' | 'csv' | 'pdf' | 'docx' | 'pasted'>('pasted');

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);

  // Perform detection & redaction
  const executeScan = (
    inputText: string,
    currentRules: RedactionRules,
    fileName?: string,
    fileType?: 'txt' | 'csv' | 'pdf' | 'docx' | 'pasted'
  ) => {
    // 1. Edge Case: Empty or whitespace input
    if (!inputText || inputText.trim() === '') {
      setErrorMessage('Please upload a file or paste text before scanning.');
      setScanResult(null);
      setInfoMessage(null);
      return;
    }

    // 2. Edge Case: Extreme length guard (> 500,000 characters)
    if (inputText.length > 500000) {
      setErrorMessage(
        'Text payload exceeds safe demonstration threshold (500,000 characters). Please split into smaller chunks.'
      );
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);
    setInfoMessage(null);

    // Simulate micro-task processing to ensure responsive UI and animation visibility
    setTimeout(() => {
      try {
        const startTime = performance.now();
        const detections = defaultDetectionEngine.detect(inputText);
        const redacted = redactText(inputText, detections, currentRules);
        const endTime = performance.now();

        const byType: Record<EntityType, number> = {
          NAME: 0,
          EMAIL: 0,
          PHONE: 0,
          ID_NUMBER: 0,
          LOCATION: 0,
        };

        for (const d of detections) {
          byType[d.type] = (byType[d.type] || 0) + 1;
        }

        const result: ScanResult = {
          originalText: inputText,
          redactedText: redacted,
          detections,
          stats: {
            total: detections.length,
            byType,
            processingTimeMs: Math.round((endTime - startTime) * 10) / 10,
            characterCount: inputText.length,
          },
          fileName: fileName || activeFileName,
          fileType: fileType || activeFileType,
          timestamp: new Date().toLocaleTimeString(),
        };

        setScanResult(result);

        // 3. Edge Case: No sensitive data found
        if (detections.length === 0) {
          setInfoMessage('No sensitive data found.');
        }
      } catch (err) {
        console.error('Scan processing error:', err);
        setErrorMessage('An unexpected error occurred during scanning. Document remains safe.');
      } finally {
        setIsScanning(false);
      }
    }, 150);
  };

  // Initial scan on mount with default hackathon demo text
  useEffect(() => {
    executeScan(DEFAULT_DEMO_TEXT, DEFAULT_REDACTION_RULES, 'hackathon_demo.txt', 'txt');
  }, []);

  const handleScanClick = () => {
    executeScan(text, rules, activeFileName, activeFileType);
  };

  const handleApplyRules = () => {
    if (scanResult) {
      // Re-apply new redaction rules to existing detections immediately
      const newRedacted = redactText(scanResult.originalText, scanResult.detections, rules);
      setScanResult({
        ...scanResult,
        redactedText: newRedacted,
      });
    } else if (text.trim()) {
      executeScan(text, rules, activeFileName, activeFileType);
    }
  };

  const handleResetRules = () => {
    setRules(DEFAULT_REDACTION_RULES);
    if (scanResult) {
      const resetRedacted = redactText(
        scanResult.originalText,
        scanResult.detections,
        DEFAULT_REDACTION_RULES
      );
      setScanResult({
        ...scanResult,
        redactedText: resetRedacted,
      });
    }
  };

  const handleFileLoaded = (name: string, type: 'txt' | 'csv' | 'pdf' | 'docx', content: string) => {
    setText(content);
    setActiveFileName(name);
    setActiveFileType(type);
    setErrorMessage(null);
    setInfoMessage(null);
    // Automatically trigger scan for loaded file
    executeScan(content, rules, name, type);
  };

  const handleClear = () => {
    setText('');
    setScanResult(null);
    setActiveFileName(undefined);
    setActiveFileType('pasted');
    setErrorMessage(null);
    setInfoMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Navbar
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
      />

      {/* Main Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Summary Metrics Bar */}
        <section aria-label="Detection Summary">
          <MetricsCards result={scanResult} />
        </section>

        {/* Input & Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main Upload & Input Panel */}
          <div className="lg:col-span-8 flex flex-col">
            <UploadPanel
              text={text}
              onTextChange={setText}
              onScan={handleScanClick}
              isScanning={isScanning}
              activeFileName={activeFileName}
              activeFileType={activeFileType}
              onFileLoaded={handleFileLoaded}
              onClear={handleClear}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          </div>

          {/* Right Redaction Rules Panel */}
          <div className="lg:col-span-4 flex flex-col">
            <RedactionSettings
              rules={rules}
              onRulesChange={setRules}
              onApply={handleApplyRules}
              onReset={handleResetRules}
              isScanning={isScanning}
            />
          </div>
        </div>

        {/* Informative message for Edge Case: No sensitive data found */}
        {infoMessage && (
          <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/80 text-blue-200 text-xs flex items-center space-x-2.5">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-white">{infoMessage}</span>
              <span className="ml-1 text-slate-300">
                The scanner completed full evaluation across all 5 entity classes without identifying any personal data.
              </span>
            </div>
          </div>
        )}

        {/* Side-by-Side Results (Original vs Redacted) */}
        {scanResult && (
          <section aria-label="Original vs Redacted View">
            <OriginalVsRedacted result={scanResult} />
          </section>
        )}

        {/* Detection Report Audit Table */}
        {scanResult && (
          <section aria-label="Detection Audit Report">
            <DetectionReport detections={scanResult.detections} rules={rules} />
          </section>
        )}

        {/* Detection Quality Benchmark (Recall & False Positive Rate) */}
        <section aria-label="Detection Quality Benchmark">
          <EvaluationPanel />
        </section>

        {/* Privacy & Security Presentation Callout */}
        <section
          aria-label="Privacy Guarantees"
          className="rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-900/60 to-slate-950 p-6 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Privacy First Engineering</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Local Execution
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Processing occurs entirely in browser memory. No sensitive personal data is logged or stored.
                  All preset demonstrations and test scenarios utilize synthetic datasets.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero Server Uploads</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>SHA-256 Hashing</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Synthetic Ground Truth</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            RedactAI • TCS Hackathon Edition • Sensitive Data Detection & Redaction Engine
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Next.js • TypeScript • Tailwind CSS • Pure Client Execution
          </span>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <ApiModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
    </div>
  );
}
