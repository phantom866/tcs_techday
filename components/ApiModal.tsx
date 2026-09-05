'use client';

import React, { useState } from 'react';
import { X, Terminal, Copy, Check, ExternalLink } from 'lucide-react';

interface ApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiModal: React.FC<ApiModalProps> = ({ isOpen, onClose }) => {
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const curlExample = `curl -X POST http://localhost:3000/api/redact \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Contact John Mehta at john.mehta@email.com or 9876543210. Location: Bangalore.",
    "rules": {
      "NAME": "MASK",
      "EMAIL": "HASH",
      "PHONE": "MASK",
      "ID_NUMBER": "MASK",
      "LOCATION": "MASK"
    }
  }'`;

  const handleCopyCurl = async () => {
    try {
      await navigator.clipboard.writeText(curlExample);
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } catch (err) {
      console.error('Failed to copy curl command:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">REST API & MCP Tool Integration</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  POST /api/redact
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Programmatic endpoint for automation agents, IDE sidecars, and MCP tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs text-slate-300 overflow-y-auto font-mono flex-1">
          <div>
            <div className="flex items-center justify-between mb-1.5 font-sans">
              <span className="font-semibold text-slate-200">cURL Request Specification:</span>
              <button
                onClick={handleCopyCurl}
                className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400 text-[11px] cursor-pointer"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy cURL</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
              {curlExample}
            </pre>
          </div>

          <div>
            <span className="font-semibold text-slate-200 block mb-1.5 font-sans">
              JSON Response Format:
            </span>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
{`{
  "success": true,
  "originalText": "Contact John Mehta at john.mehta@email.com or 9876543210. Location: Bangalore.",
  "redactedText": "Contact [NAME] at [HASH:7b2a9f1c] or [PHONE]. Location: [LOCATION].",
  "detections": [
    {
      "id": "context-name-phrase-8-18",
      "type": "NAME",
      "value": "John Mehta",
      "start": 8,
      "end": 18,
      "lineNumber": 1,
      "charRange": "Line 1, characters 9–18",
      "confidence": 93,
      "explanation": "Actionable contact context (\\"Contact [Name] at...\\")",
      "provider": "ContextDetectionProvider"
    },
    {
      "id": "regex-email-22-42",
      "type": "EMAIL",
      "value": "john.mehta@email.com",
      "start": 22,
      "end": 42,
      "lineNumber": 1,
      "charRange": "Line 1, characters 23–42",
      "confidence": 99,
      "explanation": "Exact RFC email pattern match",
      "provider": "RegexDetectionProvider"
    }
  ],
  "stats": {
    "total": 4,
    "byType": { "NAME": 1, "EMAIL": 1, "PHONE": 1, "ID_NUMBER": 0, "LOCATION": 1 },
    "processingTimeMs": 1.42,
    "characterCount": 83
  }
}`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
