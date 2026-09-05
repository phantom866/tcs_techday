'use client';

import React, { useState } from 'react';
import {
  Table,
  Eye,
  EyeOff,
  Filter,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { Detection, EntityType, RedactionRules } from '@/types';
import { partiallyMaskValue } from '@/lib/redaction/engine';

interface DetectionReportProps {
  detections: Detection[];
  rules: RedactionRules;
}

const TYPE_BADGES: Record<
  EntityType,
  { label: string; bg: string; text: string; border: string }
> = {
  NAME: {
    label: 'NAME',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  EMAIL: {
    label: 'EMAIL',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  PHONE: {
    label: 'PHONE',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  ID_NUMBER: {
    label: 'ID_NUMBER',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  LOCATION: {
    label: 'LOCATION',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
};

export const DetectionReport: React.FC<DetectionReportProps> = ({
  detections,
  rules,
}) => {
  const [selectedType, setSelectedType] = useState<EntityType | 'ALL'>('ALL');
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [globalReveal, setGlobalReveal] = useState(false);

  const toggleRowReveal = (id: string) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleGlobalReveal = () => {
    if (globalReveal) {
      setRevealedIds(new Set());
      setGlobalReveal(false);
    } else {
      const allIds = new Set(detections.map(d => d.id));
      setRevealedIds(allIds);
      setGlobalReveal(true);
    }
  };

  const filtered = selectedType === 'ALL'
    ? detections
    : detections.filter(d => d.type === selectedType);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Detection Audit Report</h2>
            <p className="text-xs text-slate-400">
              Granular entity positions, confidence scores, and redaction actions
            </p>
          </div>
        </div>

        {/* Global Privacy Toggle & Filter */}
        <div className="flex items-center space-x-2">
          {/* Entity Type Filter Tabs */}
          <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
            {(['ALL', 'NAME', 'EMAIL', 'PHONE', 'ID_NUMBER', 'LOCATION'] as const).map(
              t => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                    selectedType === t
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>

          {/* Reveal / Mask Toggle */}
          <button
            onClick={toggleGlobalReveal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
            title={globalReveal ? 'Mask values for privacy' : 'Reveal full raw values'}
          >
            {globalReveal ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Mask All</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reveal All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-400">
            {selectedType === 'ALL'
              ? 'No sensitive entities detected in this document.'
              : `No ${selectedType} entities detected.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Detected Value</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4 text-right">Privacy View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono">
              {filtered.map((item) => {
                const isRevealed = globalReveal || revealedIds.has(item.id);
                const displayValue = isRevealed
                  ? item.value
                  : partiallyMaskValue(item.value, item.type);
                const badge = TYPE_BADGES[item.type];
                const action = rules[item.type] || 'MASK';

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-900/60 transition-colors group"
                  >
                    {/* Entity Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* Detected Value */}
                    <td className="py-3 px-4 font-medium text-slate-200">
                      <div className="flex items-center space-x-2">
                        <span className={isRevealed ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                          {displayValue}
                        </span>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      <span className="text-[11px] text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {item.charRange}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-14 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              item.confidence >= 95
                                ? 'bg-emerald-400'
                                : item.confidence >= 85
                                ? 'bg-cyan-400'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${item.confidence}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-200">
                          {item.confidence}%
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          action === 'MASK'
                            ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                            : action === 'HASH'
                            ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                            : 'bg-rose-950/60 text-rose-300 border-rose-800'
                        }`}
                      >
                        {action}
                      </span>
                    </td>

                    {/* Toggle Privacy View */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleRowReveal(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isRevealed ? 'Mask value' : 'Reveal value'}
                      >
                        {isRevealed ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
