'use client';

import React from 'react';
import { ShieldCheck, Cpu, Code2, Sparkles, Terminal } from 'lucide-react';

interface NavbarProps {
  onOpenApiModal: () => void;
  onOpenPrivacyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenApiModal, onOpenPrivacyModal }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Redact<span className="text-cyan-400">AI</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                TCS Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Sensitive Data Detection & Redaction Engine
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Status badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">Local Processing</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Hybrid Engine
            </span>
          </div>

          {/* Privacy info button */}
          <button
            onClick={onOpenPrivacyModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
            title="View Security & Privacy Notice"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Privacy First</span>
          </button>

          {/* API / MCP Modal trigger */}
          <button
            onClick={onOpenApiModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 text-xs font-medium text-cyan-300 transition-colors"
            title="Inspect REST API & Tool Interface"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>API / MCP</span>
          </button>
        </div>
      </div>
    </header>
  );
};
