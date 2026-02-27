import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Radio } from 'lucide-react';
import { PlayerState } from '../hooks/useAudioPlayer';
import { AudioFile } from '../hooks/useAudioFiles';

interface Props {
  playerState: PlayerState;
  onPlay: (track: AudioFile) => void;
  onPause: () => void;
  onResume: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerControls({
  playerState,
  onPause,
  onResume,
  onSeek,
  onVolumeChange,
  onNext,
  onPrevious,
}: Props) {
  const { currentTrack, isPlaying, currentTime, duration, volume, playbackError } = playerState;
  const [errorDismissed, setErrorDismissed] = useState(false);

  const showError = !!playbackError && !errorDismissed;
  const isStream = currentTrack?.isStream ?? false;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-3">
      {/* Error Banner */}
      {showError && (
        <div className="flex items-start gap-2 bg-red-500/15 border border-red-500/40 rounded-lg px-3 py-2 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
          <span className="text-red-400 text-sm font-rajdhani flex-1">{playbackError}</span>
          <button onClick={() => setErrorDismissed(true)} className="text-red-400/60 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Now Playing */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-ultra-gold/10 border border-ultra-gold/20 flex items-center justify-center shrink-0">
          {isStream ? <Radio className="w-5 h-5 text-ultra-blue" /> : <span className="text-lg">🎵</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-rajdhani font-bold text-white/90 truncate text-sm">
            {currentTrack ? currentTrack.name : 'No track selected'}
          </p>
          <div className="flex items-center gap-2">
            {currentTrack && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold ${
                isStream ? 'bg-ultra-blue/20 text-ultra-blue border border-ultra-blue/30' : 'bg-white/10 text-white/50'
              }`}>
                {isStream ? 'STREAM' : currentTrack.format}
              </span>
            )}
            {isStream && isPlaying && (
              <span className="text-xs text-red-400 font-rajdhani font-bold animate-pulse">● LIVE STREAM</span>
            )}
          </div>
        </div>
      </div>

      {/* Seek Bar (hidden for streams) */}
      {!isStream && (
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="eq-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FFD700 ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
            }}
          />
          <div className="flex justify-between text-xs text-white/40 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrevious}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={isPlaying ? onPause : onResume}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-ultra-gold/20 border-2 border-ultra-gold hover:bg-ultra-gold/30 text-ultra-gold shadow-glow-gold transition-all"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        <button
          onClick={onNext}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3">
        <Volume2 className="w-4 h-4 text-white/50 shrink-0" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="eq-slider flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00BFFF ${volume * 100}%, rgba(255,255,255,0.15) ${volume * 100}%)`,
          }}
        />
        <span className="text-xs text-white/40 font-mono w-8 text-right">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}
