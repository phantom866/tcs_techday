import { Detection, DetectionProvider } from '@/types';
import { calculateLocation } from '../utils';

// Curated synthetic demo dictionary for high-precision demonstration
const SYNTHETIC_NAMES = [
  'John Mehta',
  'Rahul Sharma',
  'Priya Singh',
  'Vikram Malhotra',
  'Ananya Desai',
  'Rajesh Kumar',
  'Sneha Patel',
  'Amit Verma',
  'Pooja Nair',
  'David Miller',
  'Sarah Jenkins',
  'Elena Rostova',
  'Marcus Vance',
  'Carlos Mendez',
  'Sunita Roy',
  'Ravi Teja',
  'Aditi Rao',
  'Arjun Kapoor',
  'Meera Krishnan',
  'Siddharth Joshi',
  'Tanvi Saxena',
  'Kunal Singhania'
];

const SYNTHETIC_LOCATIONS = [
  'Bangalore',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'New Delhi',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Gurgaon',
  'Gurugram',
  'Noida',
  'Ahmedabad',
  'Jaipur',
  'San Francisco',
  'New York',
  'London',
  'Seattle',
  'Singapore',
  'Toronto',
  'Chicago',
  'Austin',
  'Boston'
];

export class ContextDetectionProvider implements DetectionProvider {
  readonly name = 'ContextDetectionProvider';

  detect(text: string): Detection[] {
    const detections: Detection[] = [];

    // Helper to safely add detection if span isn't already covered by a higher or equal item
    const addDetection = (det: Detection) => {
      const isDuplicate = detections.some(
        d => d.type === det.type && d.start === det.start && d.end === det.end
      );
      if (!isDuplicate) {
        detections.push(det);
      }
    };

    // 1. CONTEXTUAL ID_NUMBER DETECTION (Explicit labels)
    // Example: "Employee ID: EMP-48291", "Passport No: Z9182736", "Aadhaar: 4829 1928 3746", "National ID: 94819283"
    const idContextRegex = /(?:Employee\s*ID|Emp\s*ID|Patient\s*ID|Customer\s*ID|National\s*ID|Aadhaar(?:\s*No|\s*Number)?|Passport(?:\s*No)?|Voter\s*ID|Tax\s*ID|SSN|Account\s*No|ID\s*Number)\s*[:#-]?\s*([A-Za-z0-9\-/\s]{3,24})/gi;
    let match: RegExpExecArray | null;

    while ((match = idContextRegex.exec(text)) !== null) {
      const fullMatch = match[0];
      const captured = match[1].trim();

      // Ensure captured is not empty and contains at least 3 chars with digits or uppercase
      if (captured.length >= 3 && /[0-9A-Z]/.test(captured)) {
        // Find exact start of the captured group
        const offsetInFull = fullMatch.lastIndexOf(captured);
        const start = match.index + offsetInFull;
        const end = start + captured.length;
        const { lineNumber, charRange } = calculateLocation(text, start, end);

        addDetection({
          id: `context-id-${start}-${end}`,
          type: 'ID_NUMBER',
          value: captured,
          start,
          end,
          lineNumber,
          charRange,
          confidence: 96,
          explanation: `Contextual identifier following label: "${fullMatch.slice(0, offsetInFull).trim()}"`,
          provider: this.name,
        });
      }
    }

    // 2. CONTEXTUAL NAME DETECTION
    // A. Explicit Name labels:
    // "Employee Name: Rahul Sharma", "Patient: Priya Singh", "Customer Name: John Mehta", "Dr. Priya Singh", "Mr. John Mehta"
    const labeledNameRegex = /(?:Employee\s*Name|Patient\s*Name|Customer\s*Name|Contact\s*Person|Full\s*Name|Name|Employee|Patient|Customer|Doctor|Physician|Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s*[:#-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/g;
    while ((match = labeledNameRegex.exec(text)) !== null) {
      const fullMatch = match[0];
      const capturedName = match[1].trim();
      const offsetInFull = fullMatch.lastIndexOf(capturedName);
      const start = match.index + offsetInFull;
      const end = start + capturedName.length;
      const { lineNumber, charRange } = calculateLocation(text, start, end);

      addDetection({
        id: `context-name-label-${start}-${end}`,
        type: 'NAME',
        value: capturedName,
        start,
        end,
        lineNumber,
        charRange,
        confidence: 95,
        explanation: `Contextual name following label or honorific title`,
        provider: this.name,
      });
    }

    // B. Phrasal Context: "Contact John Mehta at...", "Reach out to John Mehta for..."
    const contactPhrasalRegex = /(?:Contact|Reach|Assigned\s*to|Spoke\s*with|Escalated\s*to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})(?:\s+(?:at|on|for|via|with|\.|\,))/g;
    while ((match = contactPhrasalRegex.exec(text)) !== null) {
      const capturedName = match[1].trim();
      const offsetInFull = match[0].indexOf(capturedName);
      const start = match.index + offsetInFull;
      const end = start + capturedName.length;
      const { lineNumber, charRange } = calculateLocation(text, start, end);

      addDetection({
        id: `context-name-phrase-${start}-${end}`,
        type: 'NAME',
        value: capturedName,
        start,
        end,
        lineNumber,
        charRange,
        confidence: 93,
        explanation: 'Actionable contact context ("Contact [Name] at...")',
        provider: this.name,
      });
    }

    // C. Synthetic Name Dictionary Matching
    for (const name of SYNTHETIC_NAMES) {
      // Escape for regex and ensure word boundaries
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const dictRegex = new RegExp(`\\b${escaped}\\b`, 'g');

      while ((match = dictRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + name.length;
        const { lineNumber, charRange } = calculateLocation(text, start, end);

        // Check if context has surrounding signals (or standalone)
        const precedingSlice = text.slice(Math.max(0, start - 30), start);
        const hasSurroundingSignal = /(?:name|contact|employee|patient|mr|dr|ms|mrs|for|at|with|by)\s*[:#-]?\s*$/i.test(precedingSlice);
        const confidence = hasSurroundingSignal ? 95 : 90;

        addDetection({
          id: `context-name-dict-${start}-${end}`,
          type: 'NAME',
          value: name,
          start,
          end,
          lineNumber,
          charRange,
          confidence,
          explanation: hasSurroundingSignal
            ? 'Known person entity with surrounding context cue'
            : 'Synthetic name dictionary match',
          provider: this.name,
        });
      }
    }

    // 3. CONTEXTUAL LOCATION DETECTION
    // A. Explicit Location labels & prepositional cues:
    // "Location: Bangalore", "Address: New York", "lives in Mumbai", "based in San Francisco", "from Seattle"
    const locationContextRegex = /(?:Location|Address|City|State|Country|lives\s*in|living\s*in|based\s*in|relocated\s*to|office\s*in|headquartered\s*in|hometown|from)\s*[:#-]?\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)/g;
    while ((match = locationContextRegex.exec(text)) !== null) {
      const fullMatch = match[0];
      const capturedLoc = match[1].trim();

      // Discard common English non-locations that might follow 'from' or 'based in'
      const nonLocations = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'January', 'February', 'Today', 'Yesterday', 'Home', 'Work', 'Scratch'];
      if (capturedLoc && !nonLocations.includes(capturedLoc)) {
        const offsetInFull = fullMatch.lastIndexOf(capturedLoc);
        const start = match.index + offsetInFull;
        const end = start + capturedLoc.length;
        const { lineNumber, charRange } = calculateLocation(text, start, end);

        addDetection({
          id: `context-loc-label-${start}-${end}`,
          type: 'LOCATION',
          value: capturedLoc,
          start,
          end,
          lineNumber,
          charRange,
          confidence: 93,
          explanation: `Contextual location cue ("${fullMatch.slice(0, offsetInFull).trim()}")`,
          provider: this.name,
        });
      }
    }

    // B. Synthetic Location Dictionary Matching
    for (const city of SYNTHETIC_LOCATIONS) {
      const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const dictRegex = new RegExp(`\\b${escaped}\\b`, 'g');

      while ((match = dictRegex.exec(text)) !== null) {
        const start = match.index;
        const end = start + city.length;
        const { lineNumber, charRange } = calculateLocation(text, start, end);

        const precedingSlice = text.slice(Math.max(0, start - 25), start);
        const hasCue = /(?:in|at|from|to|location|city|address)\s*[:#-]?\s*$/i.test(precedingSlice);
        const confidence = hasCue ? 94 : 88;

        addDetection({
          id: `context-loc-dict-${start}-${end}`,
          type: 'LOCATION',
          value: city,
          start,
          end,
          lineNumber,
          charRange,
          confidence,
          explanation: hasCue
            ? 'Geographic location with contextual preposition'
            : 'Known geographic entity match',
          provider: this.name,
        });
      }
    }

    return detections;
  }
}
