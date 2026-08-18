import { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/soundEngine';

// Cross-browser SpeechRecognition type definitions
interface IWindowSpeechRecognition extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseVoiceDictationOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export interface UseVoiceDictationReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  finalTranscript: string;
  error: string | null;
  startListening: (options?: Partial<UseVoiceDictationOptions>) => void;
  stopListening: () => void;
  toggleListening: (options?: Partial<UseVoiceDictationOptions>) => void;
  resetTranscript: () => void;
}

export const useVoiceDictation = (defaultOptions: UseVoiceDictationOptions = {}): UseVoiceDictationReturn => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const optionsRef = useRef<UseVoiceDictationOptions>(defaultOptions);
  optionsRef.current = defaultOptions;

  // Check support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const windowWithSpeech = window as unknown as IWindowSpeechRecognition;
      const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
      setIsSupported(Boolean(SpeechRecognitionClass));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Recognition may already be stopped
      }
    }
    setIsListening(false);
    setInterimTranscript('');
    try {
      soundEngine.playPencilScratchSound();
    } catch (e) {}
  }, []);

  const startListening = useCallback((customOptions?: Partial<UseVoiceDictationOptions>) => {
    if (typeof window === 'undefined') return;

    const windowWithSpeech = window as unknown as IWindowSpeechRecognition;
    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    // Stop any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognitionClass();
      const mergedOptions = { ...optionsRef.current, ...customOptions };

      recognition.continuous = mergedOptions.continuous !== undefined ? mergedOptions.continuous : true;
      recognition.interimResults = mergedOptions.interimResults !== undefined ? mergedOptions.interimResults : true;
      recognition.lang = mergedOptions.lang || (typeof navigator !== 'undefined' ? navigator.language : 'en-US');

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setInterimTranscript('');
        try {
          soundEngine.playPaperTurnSound();
        } catch (e) {}
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += transcriptChunk;
          } else {
            currentInterim += transcriptChunk;
          }
        }

        if (currentFinal) {
          setFinalTranscript(prev => {
            const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return `${prev}${separator}${currentFinal}`;
          });

          if (mergedOptions.onTranscript) {
            mergedOptions.onTranscript(currentFinal, true);
          }
        }

        setInterimTranscript(currentInterim);
        if (currentInterim && mergedOptions.onTranscript) {
          mergedOptions.onTranscript(currentInterim, false);
        }
      };

      recognition.onerror = (event: any) => {
        // Handle common speech errors gracefully
        if (event.error === 'no-speech') {
          // Normal silence, don't break
          return;
        }

        let errorMessage = 'Voice dictation paused.';
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          errorMessage = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'network') {
          errorMessage = 'Network connection issue with device voice recognition.';
        } else if (event.error === 'audio-capture') {
          errorMessage = 'No microphone was detected on your device.';
        }

        setError(errorMessage);
        if (mergedOptions.onError) {
          mergedOptions.onError(errorMessage);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Failed to initialize speech recognition:', err);
      setError(err?.message || 'Unable to start speech recognition.');
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback((customOptions?: Partial<UseVoiceDictationOptions>) => {
    if (isListening) {
      stopListening();
    } else {
      startListening(customOptions);
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setFinalTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    interimTranscript,
    finalTranscript,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript
  };
};
