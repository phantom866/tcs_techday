export type EntityType = 'NAME' | 'EMAIL' | 'PHONE' | 'ID_NUMBER' | 'LOCATION';

export type RedactionMode = 'MASK' | 'HASH' | 'REMOVE';

export type RedactionRules = Record<EntityType, RedactionMode>;

export interface Detection {
  id: string;
  type: EntityType;
  value: string;
  start: number;
  end: number;
  lineNumber: number;
  charRange: string;
  confidence: number;
  explanation: string;
  provider: string;
}

export interface DetectionProvider {
  readonly name: string;
  detect(text: string): Detection[];
}

export interface ScanResult {
  originalText: string;
  redactedText: string;
  detections: Detection[];
  stats: {
    total: number;
    byType: Record<EntityType, number>;
    processingTimeMs: number;
    characterCount: number;
  };
  fileName?: string;
  fileType?: 'txt' | 'csv' | 'pdf' | 'docx' | 'pasted';
  timestamp: string;
}

export interface ExpectedEntity {
  type: EntityType;
  value: string;
}

export interface EvaluationTestCase {
  id: string;
  title: string;
  description: string;
  text: string;
  expectedEntities: ExpectedEntity[];
  nonSensitiveCandidates: string[];
}

export interface TestCaseEvaluationDetail {
  id: string;
  title: string;
  passed: boolean;
  recall: number;
  expected: ExpectedEntity[];
  detected: Detection[];
  matches: string[];
  missed: ExpectedEntity[];
  unexpected: Detection[];
}

export interface EvaluationResult {
  totalTestCases: number;
  totalExpected: number;
  correctlyDetected: number;
  falsePositives: number;
  falseNegatives: number;
  recall: number; // 0-100%
  falsePositiveRate: number; // 0-100%
  caseResults: TestCaseEvaluationDetail[];
  evaluatedAt: string;
}
