'use client';

import React from 'react';
import { Sliders, RotateCcw, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { EntityType, RedactionMode, RedactionRules } from '@/types';
import { DEFAULT_REDACTION_RULES } from '@/lib/redaction/engine';

interface RedactionSettingsProps {
  rules: RedactionRules;
  onRulesChange: (newRules: RedactionRules) => void;
  onApply: () => void;
  onReset: () => void;
  isScanning: boolean;
}

const ENTITY_CONFIGS: Array<{
  type: EntityType;
  label: string;
  badgeColor: string;
  sample: string;
}> = [
  {
    type: 'NAME',
    label: 'Person Names',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    sample: 'John Mehta',
  },
  {
    type: 'EMAIL',
    label: 'Email Addresses',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    sample: 'user@example.com',
  },
  {
    type: 'PHONE',
    label: 'Phone Numbers',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    sample: '+91 9876543210',
  },
  {
    type: 'ID_NUMBER',
    label: 'ID Numbers (Aadhaar/PAN/EMP)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    sample: 'EMP-48291',
  },
  {
    type: 'LOCATION',
    label: 'Geographic Locations',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    sample: 'Bangalore',
  },
];

export const RedactionSettings: React.FC<RedactionSettingsProps> = ({
  rules,
  onRulesChange,
  onApply,
  onReset,
  isScanning,
}) => {
  const handleModeChange = (type: EntityType, mode: RedactionMode) => {
    onRulesChange({
      ...rules,
      [type]: mode,
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Redaction Rules</h2>
            <p className="text-xs text-slate-400">Configure action per entity type</p>
          </div>
        </div>
        <button
          onClick={onReset}
          disabled={isScanning}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          title="Reset to default MASK rules"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Rules Form */}
      <div className="space-y-3.5 flex-1">
        {ENTITY_CONFIGS.map(item => {
          const currentMode = rules[item.type];
          return (
            <div
              key={item.type}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700/80 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${item.badgeColor}`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs font-medium text-slate-200">{item.label}</span>
                </div>
              </div>

              {/* Selector */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => handleModeChange(item.type, 'MASK')}
                  className={`py-1.5 px-2 rounded font-medium transition-all text-center cursor-pointer ${
                    currentMode === 'MASK'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={`Replace with [${item.type}]`}
                >
                  Mask
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange(item.type, 'HASH')}
                  className={`py-1.5 px-2 rounded font-medium transition-all text-center cursor-pointer ${
                    currentMode === 'HASH'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Replace with SHA-256 hash token"
                >
                  Hash
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange(item.type, 'REMOVE')}
                  className={`py-1.5 px-2 rounded font-medium transition-all text-center cursor-pointer ${
                    currentMode === 'REMOVE'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Completely remove entity from text"
                >
                  Remove
                </button>
              </div>

              {/* Preview hint */}
              <div className="mt-1.5 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Output preview:</span>
                <span className="font-mono text-cyan-400/90 text-[10px]">
                  {currentMode === 'MASK' && `[${item.type}]`}
                  {currentMode === 'HASH' && `[HASH:8a3f5c1d]`}
                  {currentMode === 'REMOVE' && `(completely omitted)`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2">
        <button
          onClick={onApply}
          disabled={isScanning}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Check className="w-4 h-4 text-slate-950" />
          <span>Apply Rules & Re-Redact</span>
        </button>
        <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Rules execute strictly in local memory
        </p>
      </div>
    </div>
  );
};
