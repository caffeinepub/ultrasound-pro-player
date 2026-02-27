import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioFile } from './useAudioFiles';
import { AudioEngineControls } from './useAudioEngine';

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'stopped';

export interface PlayerState {
  playbackState: PlaybackState;
  currentTime: number;
  duration: number;
  currentTrack: AudioFile | null;
  currentIndex: number;
}

export function useAudioPlayer(
  playlist: AudioFile[],
  audioEngine: AudioEngineControls,
  isUnlocked: boolean
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    playbackState: 'idle',
    currentTime: 0,
    duration: 0,
    currentTrack: null,
    currentIndex: -1
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setState(s => ({ ...s, currentTime: audio.currentTime }));
    };
    const onDurationChange = () => {
      setState(s => ({ ...s, duration: audio.duration || 0 }));
    };
    const onEnded = () => {
      setState(s => ({ ...s, playbackState: 'stopped', currentTime: 0 }));
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const loadTrack = useCallback((track: AudioFile, index: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.src = track.url;
    audio.load();

    setState(s => ({
      ...s,
      currentTrack: track,
      currentIndex: index,
      playbackState: 'stopped',
      currentTime: 0,
      duration: track.duration
    }));
  }, []);

  const play = useCallback(() => {
    if (!isUnlocked) return;
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;

    // Initialize audio context on user interaction
    audioEngine.initializeContext();
    audioEngine.connectSource(audio);

    audio.play().then(() => {
      setState(s => ({ ...s, playbackState: 'playing' }));
    }).catch(err => {
      console.warn('Playback error:', err);
    });
  }, [isUnlocked, state.currentTrack, audioEngine]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setState(s => ({ ...s, playbackState: 'paused' }));
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setState(s => ({ ...s, playbackState: 'stopped', currentTime: 0 }));
  }, []);

  const next = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (state.currentIndex + 1) % playlist.length;
    loadTrack(playlist[nextIndex], nextIndex);
  }, [playlist, state.currentIndex, loadTrack]);

  const previous = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex = state.currentIndex <= 0 ? playlist.length - 1 : state.currentIndex - 1;
    loadTrack(playlist[prevIndex], prevIndex);
  }, [playlist, state.currentIndex, loadTrack]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setState(s => ({ ...s, currentTime: time }));
  }, []);

  return {
    state,
    loadTrack,
    play,
    pause,
    stop,
    next,
    previous,
    seek
  };
}
