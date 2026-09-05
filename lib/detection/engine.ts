import { Detection, DetectionProvider, EntityType } from '@/types';
import { RegexDetectionProvider } from './providers/regex-provider';
import { ContextDetectionProvider } from './providers/context-provider';
import { resolveOverlaps } from './utils';

export class HybridDetectionEngine {
  private providers: DetectionProvider[] = [];

  constructor() {
    // Register deterministic and context providers
    this.registerProvider(new RegexDetectionProvider());
    this.registerProvider(new ContextDetectionProvider());
  }

  /**
   * Registers a new detection provider (e.g. future LLM or NER provider)
   */
  registerProvider(provider: DetectionProvider): void {
    this.providers.push(provider);
  }

  /**
   * Gets list of all active provider names
   */
  getActiveProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  /**
   * Runs all registered detection providers on input text,
   * merges candidate detections, and resolves overlapping character spans.
   */
  detect(text: string, allowedTypes?: EntityType[]): Detection[] {
    if (!text || text.trim() === '') {
      return [];
    }

    const allDetections: Detection[] = [];

    for (const provider of this.providers) {
      try {
        const results = provider.detect(text);
        allDetections.push(...results);
      } catch (err) {
        console.error(`Error in detection provider ${provider.name}:`, err);
      }
    }

    // Filter by allowed entity types if specified
    const filtered = allowedTypes
      ? allDetections.filter(d => allowedTypes.includes(d.type))
      : allDetections;

    // Resolve overlapping spans
    const resolved = resolveOverlaps(filtered);

    // Final sorting by start position
    return resolved.sort((a, b) => a.start - b.start);
  }
}

// Global singleton instance for easy reuse across client and server routes
export const defaultDetectionEngine = new HybridDetectionEngine();
