import { defaultDetectionEngine } from './lib/detection/engine';
import { redactText, DEFAULT_REDACTION_RULES } from './lib/redaction/engine';
import { runEvaluation } from './lib/evaluation/evaluator';
import { DEFAULT_DEMO_TEXT } from './lib/demo-data';

console.log('==================================================');
console.log('TEST 1: DEFAULT DEMO TEXT DETECTION & REDACTION');
console.log('==================================================');
console.log('Original Text:\n', DEFAULT_DEMO_TEXT);

const detections = defaultDetectionEngine.detect(DEFAULT_DEMO_TEXT);
console.log(`\nFound ${detections.length} detections:`);
detections.forEach(d => {
  console.log(`- [${d.type}] "${d.value}" at ${d.charRange} (Confidence: ${d.confidence}%, Provider: ${d.provider})`);
});

const masked = redactText(DEFAULT_DEMO_TEXT, detections, DEFAULT_REDACTION_RULES);
console.log('\nRedacted (MASK Mode):\n', masked);

const hashed = redactText(DEFAULT_DEMO_TEXT, detections, {
  NAME: 'HASH',
  EMAIL: 'HASH',
  PHONE: 'HASH',
  ID_NUMBER: 'HASH',
  LOCATION: 'HASH',
});
console.log('\nRedacted (HASH Mode):\n', hashed);

const removed = redactText(DEFAULT_DEMO_TEXT, detections, {
  NAME: 'REMOVE',
  EMAIL: 'REMOVE',
  PHONE: 'REMOVE',
  ID_NUMBER: 'REMOVE',
  LOCATION: 'REMOVE',
});
console.log('\nRedacted (REMOVE Mode):\n', removed);

console.log('\n==================================================');
console.log('TEST 2: SYNTHETIC GROUND TRUTH EVALUATION (10 CASES)');
console.log('==================================================');
const evalResult = runEvaluation();
console.log(`Total Test Cases: ${evalResult.totalTestCases}`);
console.log(`Total Expected Entities: ${evalResult.totalExpected}`);
console.log(`Correctly Detected: ${evalResult.correctlyDetected}`);
console.log(`Detection Recall: ${evalResult.recall}%`);
console.log(`False Positive Rate: ${evalResult.falsePositiveRate}%`);
console.log(`False Positives: ${evalResult.falsePositives}`);
console.log(`False Negatives: ${evalResult.falseNegatives}`);

console.log('\n==================================================');
console.log('TEST 3: EDGE CASES');
console.log('==================================================');
// Edge case 1: Empty text
const emptyDetections = defaultDetectionEngine.detect('');
console.log('Empty text detections:', emptyDetections.length, '(Expected: 0)');

// Edge case 2: Clean non-PII text
const cleanText = 'The quick brown fox jumps over the lazy dog. Version 2.0 released on Tuesday with 5000 units.';
const cleanDetections = defaultDetectionEngine.detect(cleanText);
console.log('Clean non-PII detections:', cleanDetections.length, '(Expected: 0)');

console.log('\nAll engine tests executed successfully!');
