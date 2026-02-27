import { useRef, useCallback, useState } from 'react';
import { EQ_FREQUENCIES, SOUND_ENGINE_PRESETS, SoundEngine } from '../utils/audioConstants';

export interface AudioEngineState {
  isAvailable: boolean;
  isInitialized: boolean;
  error: string | null;
}

export interface AudioEngineControls {
  initializeContext: () => AudioContext | null;
  connectSource: (element: HTMLAudioElement) => void;
  disconnectSource: () => void;
  setFilterGain: (bandIndex: number, gainDb: number) => void;
  setMultipleFilterGains: (gains: number[]) => void;
  setSoundEngine: (engine: SoundEngine) => void;
  getAnalyser: () => AnalyserNode | null;
  getFilterGains: () => number[];
  state: AudioEngineState;
}

export function useAudioEngine(): AudioEngineControls {
  const audioContextRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const currentElementRef = useRef<HTMLAudioElement | null>(null);
  const filterGainsRef = useRef<number[]>(new Array(20).fill(0));

  const [state, setState] = useState<AudioEngineState>({
    isAvailable: typeof AudioContext !== 'undefined' || typeof (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== 'undefined',
    isInitialized: false,
    error: null
  });

  const initializeContext = useCallback((): AudioContext | null => {
    if (audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      return audioContextRef.current;
    }

    try {
      const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) {
        setState(s => ({ ...s, isAvailable: false, error: 'Web Audio API not supported' }));
        return null;
      }

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      // Create 20 BiquadFilterNodes in series
      const filters: BiquadFilterNode[] = [];
      for (let i = 0; i < EQ_FREQUENCIES.length; i++) {
        const filter = ctx.createBiquadFilter();
        if (i === 0) {
          filter.type = 'lowshelf';
        } else if (i === EQ_FREQUENCIES.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
        }
        filter.frequency.value = EQ_FREQUENCIES[i];
        filter.Q.value = 1.4;
        filter.gain.value = 0;
        filters.push(filter);
      }
      filtersRef.current = filters;

      // Create gain node
      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.0;
      gainNodeRef.current = gainNode;

      // Create analyser
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Connect filter chain: filters[0] -> filters[1] -> ... -> filters[19] -> gainNode -> analyser -> destination
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      filters[filters.length - 1].connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(ctx.destination);

      setState({ isAvailable: true, isInitialized: true, error: null });
      return ctx;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize audio engine';
      setState(s => ({ ...s, error: msg }));
      return null;
    }
  }, []);

  const connectSource = useCallback((element: HTMLAudioElement) => {
    const ctx = initializeContext();
    if (!ctx || !filtersRef.current.length) return;

    // If same element already connected, skip
    if (currentElementRef.current === element && sourceNodeRef.current) {
      return;
    }

    // Disconnect previous source
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (_) { /* ignore */ }
    }

    try {
      const source = ctx.createMediaElementSource(element);
      sourceNodeRef.current = source;
      currentElementRef.current = element;
      source.connect(filtersRef.current[0]);
    } catch (err) {
      // Element might already be connected to a different context
      console.warn('Could not connect audio source:', err);
    }
  }, [initializeContext]);

  const disconnectSource = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch (_) { /* ignore */ }
      sourceNodeRef.current = null;
      currentElementRef.current = null;
    }
  }, []);

  const setFilterGain = useCallback((bandIndex: number, gainDb: number) => {
    if (bandIndex < 0 || bandIndex >= filtersRef.current.length) return;
    const filter = filtersRef.current[bandIndex];
    if (filter) {
      filter.gain.setTargetAtTime(gainDb, audioContextRef.current?.currentTime ?? 0, 0.01);
      filterGainsRef.current[bandIndex] = gainDb;
    }
  }, []);

  const setMultipleFilterGains = useCallback((gains: number[]) => {
    gains.forEach((gain, i) => {
      if (i < filtersRef.current.length) {
        const filter = filtersRef.current[i];
        if (filter) {
          filter.gain.setTargetAtTime(gain, audioContextRef.current?.currentTime ?? 0, 0.01);
          filterGainsRef.current[i] = gain;
        }
      }
    });
  }, []);

  const setSoundEngine = useCallback((engine: SoundEngine) => {
    const preset = SOUND_ENGINE_PRESETS[engine];
    if (preset) {
      setMultipleFilterGains(preset);
    }
  }, [setMultipleFilterGains]);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  const getFilterGains = useCallback(() => [...filterGainsRef.current], []);

  return {
    initializeContext,
    connectSource,
    disconnectSource,
    setFilterGain,
    setMultipleFilterGains,
    setSoundEngine,
    getAnalyser,
    getFilterGains,
    state
  };
}
