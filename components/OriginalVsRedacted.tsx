'use client';

import React, { useState } from 'react';
import { Copy, Check, Download, FileText, SplitSquareVertical, Eye, Sparkles } from 'lucide-react';
import { ScanResult, Detection, EntityType } from '@/types';

interface OriginalVsRedactedProps {
  result: ScanResult | null;
}

const ENTITY_COLORS: Record<EntityType, { bg: string; text: string; border: string }> = {
  NAME: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-300',
    border: 'border-blue-500/40',
  },
  EMAIL: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    border: 'border-emerald-500/40',
  },
  PHONE: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-300',
    border: 'border-purple-500/40',
  },
  ID_NUMBER: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/40',
  },
  LOCATION: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-300',
    border: 'border-rose-500/40',
  },
};

export const OriginalVsRedacted: React.FC<OriginalVsRedactedProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const { originalText, redactedText, detections, fileName, fileType } = result;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(redactedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const isCsv = fileType === 'csv' || fileName?.endsWith('.csv');
    const extension = isCsv ? 'csv' : 'txt';
    const mimeType = isCsv ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';

    const baseName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'document';
    const downloadFileName = `redacted_${baseName}.${extension}`;

    const blob = new Blob([redactedText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', downloadFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build segmented original text with highlighted spans
  const renderHighlightedOriginal = () => {
    if (detections.length === 0) {
      return <span>{originalText}</span>;
    }

    // Sort detections by start ascending
    const sorted = [...detections].sort((a, b) => a.start - b.start);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((det, i) => {
      // Add text before match
      if (det.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{originalText.slice(lastIndex, det.start)}</span>
        );
      }

      // Add highlighted entity
      const style = ENTITY_COLORS[det.type] || {
        bg: 'bg-cyan-500/20',
        text: 'text-cyan-300',
        border: 'border-cyan-500/40',
      };

      elements.push(
        <span
          key={`entity-${det.id}-${i}`}
          className={`inline-block px-1 py-0.5 rounded border ${style.bg} ${style.text} ${style.border} font-medium mx-0.5 relative group`}
          title={`${det.type} (${det.confidence}% confidence): ${det.explanation}`}
        >
          {originalText.slice(det.start, det.end)}
          <span className="opacity-70 text-[9px] ml-1 font-mono uppercase">
            [{det.type}]
          </span>
        </span>
      );

      lastIndex = det.end;
    });

    // Add trailing text
    if (lastIndex < originalText.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>{originalText.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  // Highlight redacted placeholders in the redacted view
  const renderHighlightedRedacted = () => {
    const regex = /(\[(?:NAME|EMAIL|PHONE|ID_NUMBER|LOCATION|HASH:[a-f0-9]+)\])/g;
    const parts = redactedText.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        let tagColor = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
        if (part.includes('NAME')) tagColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
        if (part.includes('EMAIL')) tagColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        if (part.includes('PHONE')) tagColor = 'bg-purple-500/20 text-purple-300 border-purple-500/40';
        if (part.includes('ID_NUMBER')) tagColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        if (part.includes('LOCATION')) tagColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
        if (part.includes('HASH')) tagColor = 'bg-slate-800 text-cyan-300 border-cyan-600/40 font-mono';

        return (
          <span
            key={index}
            className={`inline-block px-1.5 py-0.5 rounded border font-mono font-semibold text-[11px] ${tagColor} mx-0.5`}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <SplitSquareVertical className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Side-by-Side Comparison (Original vs Redacted)
            </h2>
            <p className="text-xs text-slate-400">
              Visual verification of all masked or hashed sensitive tokens
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Copy redacted text to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Redacted Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-semibold text-slate-950 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            title="Download sanitized file"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download Redacted File</span>
          </button>
        </div>
      </div>

      {/* Side by side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Original Panel */}
        <div className="flex flex-col rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-xs font-semibold text-slate-200">Original Content</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {detections.length} sensitive {detections.length === 1 ? 'entity' : 'entities'} flagged
            </span>
          </div>
          <div className="p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
            {renderHighlightedOriginal()}
          </div>
        </div>

        {/* Redacted Panel */}
        <div className="flex flex-col rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-slate-200">Redacted Content</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">Safe for Distribution</span>
          </div>
          <div className="p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
            {renderHighlightedRedacted()}
          </div>
        </div>
      </div>
    </div>
  );
};
