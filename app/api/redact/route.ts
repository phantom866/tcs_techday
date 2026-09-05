import { NextRequest, NextResponse } from 'next/server';
import { defaultDetectionEngine } from '@/lib/detection/engine';
import { redactText, DEFAULT_REDACTION_RULES } from '@/lib/redaction/engine';
import { RedactionRules, EntityType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, rules } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "text" field in request body' },
        { status: 400 }
      );
    }

    // Safety guard against massive inputs
    if (text.length > 500000) {
      return NextResponse.json(
        { error: 'Text exceeds maximum payload limit of 500,000 characters' },
        { status: 413 }
      );
    }

    const mergedRules: RedactionRules = {
      ...DEFAULT_REDACTION_RULES,
      ...(rules || {}),
    };

    const startTime = performance.now();
    const detections = defaultDetectionEngine.detect(text);
    const redactedText = redactText(text, detections, mergedRules);
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

    return NextResponse.json({
      success: true,
      originalText: text,
      redactedText,
      detections,
      stats: {
        total: detections.length,
        byType,
        processingTimeMs: Math.round((endTime - startTime) * 100) / 100,
        characterCount: text.length,
      },
    });
  } catch (error) {
    console.error('API /api/redact error:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing redaction' },
      { status: 500 }
    );
  }
}
