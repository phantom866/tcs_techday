import { Detection } from '@/types';

/**
 * Calculates human-readable location information (1-indexed line and character range)
 * from a 0-indexed character span in text.
 */
export function calculateLocation(
  text: string,
  start: number,
  end: number
): { lineNumber: number; charRange: string } {
  const precedingText = text.slice(0, start);
  const lines = precedingText.split('\n');
  const lineNumber = lines.length;

  const lastNewlineIndex = precedingText.lastIndexOf('\n');
  const charStartInLine = lastNewlineIndex === -1 ? start + 1 : start - lastNewlineIndex;
  const charEndInLine = charStartInLine + (end - start) - 1;

  const charRange = `Line ${lineNumber}, characters ${charStartInLine}–${charEndInLine}`;

  return { lineNumber, charRange };
}

/**
 * Resolves overlapping spans between detections.
 * Priority rule:
 * 1. Higher confidence wins
 * 2. Longer length wins if confidence is equal
 * 3. Earlier match wins if all else equal
 */
export function resolveOverlaps(detections: Detection[]): Detection[] {
  if (detections.length <= 1) return detections;

  // Sort by start index ascending, then by confidence descending
  const sorted = [...detections].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.confidence - a.confidence;
  });

  const nonOverlapping: Detection[] = [];

  for (const current of sorted) {
    if (nonOverlapping.length === 0) {
      nonOverlapping.push(current);
      continue;
    }

    const previous = nonOverlapping[nonOverlapping.length - 1];

    // Check for overlap: previous.end > current.start
    if (previous.end > current.start) {
      // Conflict: decide which one to keep
      if (current.confidence > previous.confidence) {
        // Current has higher confidence, replace previous
        nonOverlapping[nonOverlapping.length - 1] = current;
      } else if (
        current.confidence === previous.confidence &&
        (current.end - current.start) > (previous.end - previous.start)
      ) {
        // Equal confidence but longer match
        nonOverlapping[nonOverlapping.length - 1] = current;
      }
      // Else keep previous
    } else {
      nonOverlapping.push(current);
    }
  }

  // Return sorted by start position
  return nonOverlapping.sort((a, b) => a.start - b.start);
}
