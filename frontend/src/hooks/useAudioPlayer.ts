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
  playbackError: string | null;
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
    currentIndex: -1,
    playbackError: null,
  });

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setState((s) => ({ ...s, currentTime: audio.currentTime }));
    };
    const onDurationChange = () => {
      setState((s) => ({ ...s, duration: isFinite(audio.duration) ? audio.duration : 0 }));
    };
    const onEnded = () => {
      setState((s) => ({ ...s, playbackState: 'stopped', currentTime: 0 }));
    };
    const onError = () => {
      const err = audio.error;
      const msg = err ? `Audio error (code ${err.code}): ${err.message}` : 'Unknown audio error';
      setState((s) => ({ ...s, playbackState: 'stopped', playbackError: msg }));
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const play = useCallback(async () => {
    if (!isUnlocked) return;
    const audio = audioRef.current;
    if (!audio) return;

    // Must have a src set
    if (!audio.src || audio.src === window.location.href) {
      setState((s) => ({ ...s, playbackError: 'No track loaded. Select a track from the playlist.' }));
      return;
    }

    // Clear any previous error
    setState((s) => ({ ...s, playbackError: null }));

    try {
      // Step 1: Initialize and resume AudioContext (must happen on user gesture)
      const ctx = await audioEngine.initializeContext();
      if (!ctx) {
        setState((s) => ({ ...s, playbackError: 'Audio engine failed to initialize.' }));
        return;
      }

      // Step 2: Ensure context is running (resume if still suspended after init)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Step 3: Connect the audio element to the filter chain (safe to call multiple times)
      audioEngine.connectSource(audio);

      // Step 4: Play — await the promise so we can catch NotAllowedError etc.
      await audio.play();
      setState((s) => ({ ...s, playbackState: 'playing', playbackError: null }));
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.name === 'NotAllowedError'
            ? 'Playback blocked by browser. Tap Play again.'
            : err.name === 'NotSupportedError'
            ? 'Audio format not supported by your browser.'
            : `Playback error: ${err.message}`
          : 'Unknown playback error';
      setState((s) => ({ ...s, playbackState: 'stopped', playbackError: msg }));
    }
  }, [isUnlocked, audioEngine]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setState((s) => ({ ...s, playbackState: 'paused' }));
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setState((s) => ({ ...s, playbackState: 'stopped', currentTime: 0 }));
  }, []);

  const loadTrack = useCallback(
    (track: AudioFile, index: number, autoPlay = false) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.pause();
      audio.src = track.url;
      audio.load();

      setState((s) => ({
        ...s,
        currentTrack: track,
        currentIndex: index,
        playbackState: 'stopped',
        currentTime: 0,
        duration: track.duration,
        playbackError: null,
      }));

      if (autoPlay && isUnlocked) {
        // Small delay to let the browser register the new src before playing
        setTimeout(() => {
          // Re-read the ref inside the timeout to get the latest audio element
          const a = audioRef.current;
          if (!a) return;
          audioEngine.initializeContext().then((ctx) => {
            if (!ctx) return;
            const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
            resume.then(() => {
              audioEngine.connectSource(a);
              a.play()
                .then(() => {
                  setState((s) => ({ ...s, playbackState: 'playing', playbackError: null }));
                })
                .catch((err) => {
                  const msg =
                    err instanceof Error
                      ? err.name === 'NotAllowedError'
                        ? 'Playback blocked by browser. Tap Play.'
                        : `Playback error: ${err.message}`
                      : 'Unknown playback error';
                  setState((s) => ({ ...s, playbackError: msg }));
                });
            });
          });
        }, 80);
      }
    },
    [isUnlocked, audioEngine]
  );

  const next = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (state.currentIndex + 1) % playlist.length;
    loadTrack(playlist[nextIndex], nextIndex, state.playbackState === 'playing');
  }, [playlist, state.currentIndex, state.playbackState, loadTrack]);

  const previous = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex =
      state.currentIndex <= 0 ? playlist.length - 1 : state.currentIndex - 1;
    loadTrack(playlist[prevIndex], prevIndex, state.playbackState === 'playing');
  }, [playlist, state.currentIndex, state.playbackState, loadTrack]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setState((s) => ({ ...s, currentTime: time }));
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, playbackError: null }));
  }, []);

  return {
    state,
    loadTrack,
    play,
    pause,
    stop,
    next,
    previous,
    seek,
    clearError,
  };
}
