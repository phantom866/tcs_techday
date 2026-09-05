import { Detection, DetectionProvider } from '@/types';
import { calculateLocation } from '../utils';

export class RegexDetectionProvider implements DetectionProvider {
  readonly name = 'RegexDetectionProvider';

  detect(text: string): Detection[] {
    const detections: Detection[] = [];

    // 1. EMAIL DETECTION
    // High-precision email regex matching standard RFC addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    let match: RegExpExecArray | null;

    while ((match = emailRegex.exec(text)) !== null) {
      const value = match[0];
      const start = match.index;
      const end = start + value.length;
      const { lineNumber, charRange } = calculateLocation(text, start, end);

      detections.push({
        id: `regex-email-${start}-${end}`,
        type: 'EMAIL',
        value,
        start,
        end,
        lineNumber,
        charRange,
        confidence: 99,
        explanation: 'Exact RFC email pattern match',
        provider: this.name,
      });
    }

    // 2. PHONE DETECTION
    // Matches common formats:
    // +91 9876543210, +91-9876543210, +919876543210
    // 9876543210 (10 digits starting with 6-9)
    // +1 555-123-4567, (555) 123-4567, 555-123-4567
    const phoneRegexes = [
      // International / US formats: +1 555-123-4567, (555) 123-4567, 555-123-4567
      {
        regex: /(?:\+1[\s.-]?)?(?:\(\d{3}\)|\b\d{3})[\s.-]\d{3}[\s.-]\d{4}\b/g,
        confidence: 97,
        label: 'Standard North American phone format',
      },
      // Indian mobile format with +91 or 0 prefix: +91 9876543210, +91-9876543210, 09876543210
      {
        regex: /(?:\+91[\s.-]?|0)[6-9]\d{4}[\s.-]?\d{5}\b/g,
        confidence: 98,
        label: 'Indian mobile number with country code prefix',
      },
      // 10-digit Indian mobile number without prefix (must start with 6, 7, 8, or 9 and have word boundaries)
      {
        regex: /(?<!\w|\d|\+)[6-9]\d{9}(?!\d|\w)/g,
        confidence: 94,
        label: '10-digit mobile number format',
      },
    ];

    for (const { regex, confidence, label } of phoneRegexes) {
      while ((match = regex.exec(text)) !== null) {
        const value = match[0].trim();
        const start = match.index;
        const end = start + match[0].length;
        const { lineNumber, charRange } = calculateLocation(text, start, end);

        // Avoid adding duplicate phone detection
        const alreadyDetected = detections.some(
          d => d.type === 'PHONE' && d.start <= start && d.end >= end
        );

        if (!alreadyDetected) {
          detections.push({
            id: `regex-phone-${start}-${end}`,
            type: 'PHONE',
            value,
            start,
            end,
            lineNumber,
            charRange,
            confidence,
            explanation: label,
            provider: this.name,
          });
        }
      }
    }

    // 3. ID_NUMBER DETECTION (Deterministic high-confidence patterns)
    // Aadhaar-like 12-digit grouped: 1234 5678 9012 or 1234-5678-9012
    const aadhaarRegex = /\b[2-9]\d{3}[\s\-]\d{4}[\s\-]\d{4}\b/g;
    while ((match = aadhaarRegex.exec(text)) !== null) {
      const value = match[0];
      const start = match.index;
      const end = start + value.length;
      const { lineNumber, charRange } = calculateLocation(text, start, end);

      detections.push({
        id: `regex-id-aadhaar-${start}-${end}`,
        type: 'ID_NUMBER',
        value,
        start,
        end,
        lineNumber,
        charRange,
        confidence: 96,
        explanation: 'Aadhaar-style 12-digit grouped identifier',
        provider: this.name,
      });
    }

    // PAN card format: 5 uppercase letters, 4 digits, 1 uppercase letter (e.g., ABCDE1234F)
    const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
    while ((match = panRegex.exec(text)) !== null) {
      const value = match[0];
      const start = match.index;
      const end = start + value.length;
      const { lineNumber, charRange } = calculateLocation(text, start, end);

      detections.push({
        id: `regex-id-pan-${start}-${end}`,
        type: 'ID_NUMBER',
        value,
        start,
        end,
        lineNumber,
        charRange,
        confidence: 98,
        explanation: 'Permanent Account Number (PAN) pattern',
        provider: this.name,
      });
    }

    // Common Employee ID patterns: EMP-48291, EMP_10293, ID-94821, EMP89421
    const empIdRegex = /\b(?:EMP|EMPLOYEE|STAFF|USR)[\-_][0-9A-Za-z]{3,10}\b|\b(?:EMP|STAFF|USR)[0-9]{4,8}\b/gi;
    while ((match = empIdRegex.exec(text)) !== null) {
      const value = match[0];
      const start = match.index;
      const end = start + value.length;
      const { lineNumber, charRange } = calculateLocation(text, start, end);

      detections.push({
        id: `regex-id-emp-${start}-${end}`,
        type: 'ID_NUMBER',
        value,
        start,
        end,
        lineNumber,
        charRange,
        confidence: 95,
        explanation: 'Standardized Employee/Staff Identifier code',
        provider: this.name,
      });
    }

    return detections;
  }
}
