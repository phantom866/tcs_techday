import { defaultDetectionEngine } from '../detection/engine';
import { SYNTHETIC_TEST_CASES } from './test-cases';
import { EvaluationResult, TestCaseEvaluationDetail, ExpectedEntity, Detection } from '@/types';

/**
 * Normalizes entity strings for comparison (case-insensitive, trimmed, spacing normalized)
 */
function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[\s\-_]/g, '').trim();
}

/**
 * Checks if a detection matches an expected entity by type and value
 */
function matchesExpected(detection: Detection, expected: ExpectedEntity): boolean {
  if (detection.type !== expected.type) return false;

  const detNorm = normalizeString(detection.value);
  const expNorm = normalizeString(expected.value);

  return detNorm === expNorm || detNorm.includes(expNorm) || expNorm.includes(detNorm);
}

/**
 * Runs live evaluation of HybridDetectionEngine against the synthetic ground truth dataset.
 * Calculates true positives, false negatives, false positives, recall, and false positive rate.
 */
export function runEvaluation(): EvaluationResult {
  const caseResults: TestCaseEvaluationDetail[] = [];
  let totalExpected = 0;
  let correctlyDetected = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (const tc of SYNTHETIC_TEST_CASES) {
    const detections = defaultDetectionEngine.detect(tc.text);
    const expected = tc.expectedEntities;
    totalExpected += expected.length;

    const matchedExpectedIndices = new Set<number>();
    const matchedDetectionIndices = new Set<number>();
    const matches: string[] = [];

    // Match detected entities with ground truth expected entities
    for (let dIdx = 0; dIdx < detections.length; dIdx++) {
      const det = detections[dIdx];
      for (let eIdx = 0; eIdx < expected.length; eIdx++) {
        if (matchedExpectedIndices.has(eIdx)) continue;

        if (matchesExpected(det, expected[eIdx])) {
          matchedExpectedIndices.add(eIdx);
          matchedDetectionIndices.add(dIdx);
          matches.push(`${det.type}: "${det.value}"`);
          break;
        }
      }
    }

    const tcCorrect = matchedExpectedIndices.size;
    correctlyDetected += tcCorrect;

    // Identify missed entities (False Negatives)
    const missed: ExpectedEntity[] = [];
    for (let eIdx = 0; eIdx < expected.length; eIdx++) {
      if (!matchedExpectedIndices.has(eIdx)) {
        missed.push(expected[eIdx]);
        falseNegatives++;
      }
    }

    // Identify unexpected detections (potential False Positives)
    const unexpected: Detection[] = [];
    for (let dIdx = 0; dIdx < detections.length; dIdx++) {
      if (!matchedDetectionIndices.has(dIdx)) {
        const det = detections[dIdx];
        unexpected.push(det);

        // Check if it triggered on known non-sensitive candidate words
        const matchesCandidate = tc.nonSensitiveCandidates.some(c =>
          normalizeString(c).includes(normalizeString(det.value))
        );
        if (matchesCandidate) {
          falsePositives++;
        }
      }
    }

    const tcRecall = expected.length > 0 ? (tcCorrect / expected.length) * 100 : 100;
    const passed = tcRecall >= 90;

    caseResults.push({
      id: tc.id,
      title: tc.title,
      passed,
      recall: Math.round(tcRecall * 10) / 10,
      expected,
      detected: detections,
      matches,
      missed,
      unexpected,
    });
  }

  // Calculate global recall and false positive rate
  const recall = totalExpected > 0 ? Math.round((correctlyDetected / totalExpected) * 1000) / 10 : 100;
  
  // Total non-sensitive candidate pool size across all test cases
  const totalCandidatePool = SYNTHETIC_TEST_CASES.reduce(
    (acc, tc) => acc + tc.nonSensitiveCandidates.length,
    0
  );

  const falsePositiveRate =
    totalCandidatePool > 0
      ? Math.round((falsePositives / totalCandidatePool) * 1000) / 10
      : 0;

  return {
    totalTestCases: SYNTHETIC_TEST_CASES.length,
    totalExpected,
    correctlyDetected,
    falsePositives,
    falseNegatives,
    recall,
    falsePositiveRate,
    caseResults,
    evaluatedAt: new Date().toLocaleTimeString(),
  };
}
