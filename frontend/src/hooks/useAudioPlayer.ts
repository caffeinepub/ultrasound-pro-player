import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioFile } from './useAudioFiles';
import { AudioEngine } from './useAudioEngine';

export interface PlayerState {
  currentTrack: AudioFile | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackError: string | null;
}

export function useAudioPlayer(audioEngine: AudioEngine) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    playbackError: null,
  });

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
        duration: isFinite(audio.duration) ? audio.duration : 0,
      }));
    };
    const onEnded = () => {
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, currentTime: 0 }));
    };
    const onError = () => {
      const err = audio.error;
      const msg = err ? `Audio error (code ${err.code}): ${err.message}` : 'Unknown audio error';
      console.error('[useAudioPlayer] Audio error:', msg);
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, playbackError: msg }));
    };
    const onPlay = () => setState((prev) => ({ ...prev, isPlaying: true, isPaused: false, playbackError: null }));
    const onPause = () => setState((prev) => ({ ...prev, isPlaying: false, isPaused: true }));

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback(async (track: AudioFile) => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('[useAudioPlayer] play() called for:', track.name, 'url:', track.url);
    setState((prev) => ({ ...prev, playbackError: null, currentTrack: track }));

    try {
      audio.src = track.url;
      audio.load();
      console.log('[useAudioPlayer] src set, resuming AudioContext...');
      audioEngine.initContext();
      console.log('[useAudioPlayer] AudioContext resumed, connecting source...');
      audioEngine.connectSource(audio);
      console.log('[useAudioPlayer] Source connected, calling audio.play()...');
      await audio.play();
      console.log('[useAudioPlayer] audio.play() resolved successfully');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[useAudioPlayer] play() failed:', msg);
      setState((prev) => ({ ...prev, isPlaying: false, isPaused: false, playbackError: msg }));
    }
  }, [audioEngine]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(async () => {
    try {
      await audioRef.current?.play();
    } catch (err) {
      console.error('[useAudioPlayer] resume() failed:', err);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setState((prev) => ({ ...prev, volume: vol }));
    }
  }, []);

  return { state, play, pause, resume, seek, setVolume };
}
