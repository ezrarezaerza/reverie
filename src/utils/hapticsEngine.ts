import { memoryStorage } from './storage';

export type HapticType = 'stamp' | 'click' | 'page_turn' | 'completion' | 'flutter';

class HapticsEngine {
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  /**
   * Check whether vibration is supported by the client browser/device
   */
  public hasSupport(): boolean {
    return this.isSupported;
  }

  /**
   * Check if user preferences allow haptic vibrations
   */
  public isEnabled(): boolean {
    if (!this.isSupported) return false;
    try {
      const prefs = memoryStorage.getPreferences();
      return prefs.hapticFeedbackEnabled !== false;
    } catch {
      return true;
    }
  }

  /**
   * Trigger a tailored tactile vibration pattern
   */
  public triggerHaptic(type: HapticType): void {
    if (!this.isEnabled()) return;

    try {
      switch (type) {
        case 'stamp':
          // Heavy mechanical rubber stamp thud: sharp impact, brief pause, deep thud
          navigator.vibrate([30, 40, 70]);
          break;

        case 'completion':
          // Celebratory hippocampal bookmark pulse
          navigator.vibrate([35, 45, 35, 45, 60]);
          break;

        case 'page_turn':
          // Soft paper page turn double-tap
          navigator.vibrate([15, 25, 15]);
          break;

        case 'flutter':
          // Rapid fluttering of pages (e.g. serendipity random memory roll)
          navigator.vibrate([10, 20, 10, 20, 15, 30, 45]);
          break;

        case 'click':
        default:
          // Subtle micro-tap
          navigator.vibrate(10);
          break;
      }
    } catch (e) {
      // Ignore vibration errors on non-supported or locked mobile contexts
    }
  }
}

export const hapticsEngine = new HapticsEngine();
