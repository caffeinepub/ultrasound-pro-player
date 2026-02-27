import { useRef, useCallback } from 'react';
import { EQ_FREQUENCIES } from '../utils/audioConstants';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private filters: BiquadFilterNode[] = [];
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private sourceMap = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();

  initContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.filters = EQ_FREQUENCIES.map((freq) => {
        const filter = this.audioContext!.createBiquadFilter();
        filter.type = 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.0;
        filter.gain.value = 0;
        return filter;
      });

      // Chain: filters[0] → filters[1] → ... → filters[19] → gainNode → destination
      //                                                      → analyserNode
      for (let i = 0; i < this.filters.length - 1; i++) {
        this.filters[i].connect(this.filters[i + 1]);
      }
      const lastFilter = this.filters[this.filters.length - 1];
      lastFilter.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.connect(this.analyserNode);
    } else if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  connectSource(audioElement: HTMLAudioElement): void {
    if (!this.audioContext || this.filters.length === 0) {
      console.warn('[AudioEngine] connectSource called before initContext');
      return;
    }
    if (this.sourceMap.has(audioElement)) {
      console.log('[AudioEngine] Source already connected, skipping duplicate connection');
      return;
    }
    const source = this.audioContext.createMediaElementSource(audioElement);
    this.sourceMap.set(audioElement, source);
    source.connect(this.filters[0]);
    console.log('[AudioEngine] Source connected to filter chain');
  }

  setEQBand(index: number, gain: number): void {
    if (this.filters[index]) {
      this.filters[index].gain.value = gain;
    }
  }

  setGainCorrection(gain: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = gain;
    }
  }

  applyAutoGainCorrection(): void {
    if (this.gainNode) {
      this.gainNode.gain.value = 1.0;
    }
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode;
  }

  getGainNode(): GainNode | null {
    return this.gainNode;
  }

  isReady(): boolean {
    return this.audioContext !== null && this.filters.length > 0;
  }
}

let sharedEngine: AudioEngine | null = null;

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);

  if (!engineRef.current) {
    if (!sharedEngine) {
      sharedEngine = new AudioEngine();
    }
    engineRef.current = sharedEngine;
  }

  const initContext = useCallback(() => {
    return engineRef.current!.initContext();
  }, []);

  const connectSource = useCallback((audioElement: HTMLAudioElement) => {
    engineRef.current!.connectSource(audioElement);
  }, []);

  const setEQBand = useCallback((index: number, gain: number) => {
    engineRef.current!.setEQBand(index, gain);
  }, []);

  const setGainCorrection = useCallback((gain: number) => {
    engineRef.current!.setGainCorrection(gain);
  }, []);

  const getAnalyserNode = useCallback(() => {
    return engineRef.current!.getAnalyserNode();
  }, []);

  return {
    audioEngine: engineRef.current,
    initContext,
    connectSource,
    setEQBand,
    setGainCorrection,
    getAnalyserNode,
  };
}
