import { Detection, EntityType, RedactionMode, RedactionRules } from '@/types';
import { getShortHashToken } from './hasher';

export const DEFAULT_REDACTION_RULES: RedactionRules = {
  NAME: 'MASK',
  EMAIL: 'MASK',
  PHONE: 'MASK',
  ID_NUMBER: 'MASK',
  LOCATION: 'MASK',
};

/**
 * Applies configured redaction rules to text based on detected spans.
 * Replaces spans from right-to-left (descending start index) to maintain correct offsets.
 */
export function redactText(
  text: string,
  detections: Detection[],
  rules: RedactionRules = DEFAULT_REDACTION_RULES
): string {
  if (!text || detections.length === 0) {
    return text;
  }

  // Sort detections descending by start offset
  const sorted = [...detections].sort((a, b) => b.start - a.start);

  let result = text;

  for (const detection of sorted) {
    const mode: RedactionMode = rules[detection.type] || 'MASK';
    let replacement = '';

    switch (mode) {
      case 'MASK':
        replacement = `[${detection.type}]`;
        break;
      case 'HASH':
        replacement = getShortHashToken(detection.value);
        break;
      case 'REMOVE':
        replacement = '';
        break;
      default:
        replacement = `[${detection.type}]`;
    }

    result = result.slice(0, detection.start) + replacement + result.slice(detection.end);
  }

  return result;
}

/**
 * Partially masks sensitive values for safe reporting view.
 * Example:
 * John Mehta -> J*** M***a
 * john.mehta@email.com -> j***@email.com
 * 9876543210 -> 9876****10
 */
export function partiallyMaskValue(value: string, type: EntityType): string {
  if (!value || value.length <= 2) return '***';

  switch (type) {
    case 'EMAIL': {
      const parts = value.split('@');
      if (parts.length === 2) {
        const username = parts[0];
        const domain = parts[1];
        const visibleUser = username.slice(0, 1) + '***';
        return `${visibleUser}@${domain}`;
      }
      return value.slice(0, 2) + '***';
    }

    case 'PHONE': {
      const digits = value.replace(/\s+/g, '');
      if (digits.length >= 6) {
        return digits.slice(0, 3) + '****' + digits.slice(-2);
      }
      return '****';
    }

    case 'ID_NUMBER': {
      if (value.length > 5) {
        return value.slice(0, 3) + '****' + value.slice(-2);
      }
      return '****';
    }

    case 'NAME': {
      const words = value.split(' ');
      return words
        .map(w => (w.length > 1 ? `${w[0]}${'*'.repeat(Math.min(3, w.length - 1))}` : w))
        .join(' ');
    }

    case 'LOCATION': {
      if (value.length > 3) {
        return value.slice(0, 2) + '***' + value.slice(-1);
      }
      return '***';
    }

    default:
      return value.slice(0, 2) + '***';
  }
}
