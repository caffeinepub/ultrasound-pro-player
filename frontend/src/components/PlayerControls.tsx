import { SkipBack, SkipForward, Play, Pause, Square, Music } from 'lucide-react';
import { PlayerState } from '../hooks/useAudioPlayer';
import { AudioFile } from '../hooks/useAudioFiles';

interface Props {
  playerState: PlayerState;
  isUnlocked: boolean;
  playlist: AudioFile[];
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PlayerControls({
  playerState,
  isUnlocked,
  playlist,
  onPlay,
  onPause,
  onStop,
  onNext,
  onPrevious,
  onSeek
}: Props) {
  const { playbackState, currentTime, duration, currentTrack } = playerState;
  const isPlaying = playbackState === 'playing';
  const hasTrack = !!currentTrack;
  const canControl = isUnlocked && hasTrack;

  return (
    <div className="flex flex-col gap-4">
      {/* Track Info */}
      <div className="flex items-center gap-4">
        {/* Album Art Placeholder */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{
            background: 'rgba(255,215,0,0.08)',
            border: '1px solid rgba(255,215,0,0.2)',
            boxShadow: isPlaying ? '0 0 20px rgba(255,215,0,0.3)' : 'none'
          }}
        >
          <Music size={28} style={{ color: isPlaying ? '#FFD700' : 'rgba(255,215,0,0.3)' }} />
          {isPlaying && (
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: 'radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%)',
                animation: 'pulse-gold 2s ease-in-out infinite'
              }}
            />
          )}
        </div>

        {/* Track Details */}
        <div className="flex-1 min-w-0">
          <p
            className="font-orbitron font-bold text-base truncate"
            style={{ color: currentTrack ? '#FFD700' : 'rgba(255,215,0,0.3)' }}
          >
            {currentTrack?.name || 'No Track Selected'}
          </p>
          <p className="font-rajdhani text-sm truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {currentTrack?.artist || 'Load a file to begin'}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="font-orbitron text-xs px-2 py-0.5 rounded"
              style={{
                background: isPlaying ? 'rgba(0,255,127,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isPlaying ? 'rgba(0,255,127,0.4)' : 'rgba(255,255,255,0.1)'}`,
                color: isPlaying ? '#00FF7F' : 'rgba(255,255,255,0.3)'
              }}
            >
              {isPlaying ? '● PLAYING' : playbackState === 'paused' ? '⏸ PAUSED' : '■ STOPPED'}
            </span>
          </div>
        </div>
      </div>

      {/* Seek Bar */}
      <div className="flex flex-col gap-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          disabled={!canControl}
          className="seek-slider w-full"
          style={{
            accentColor: '#FFD700',
            opacity: canControl ? 1 : 0.3
          }}
        />
        <div className="flex justify-between">
          <span className="font-orbitron text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {formatTime(currentTime)}
          </span>
          <span className="font-orbitron text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onPrevious}
          disabled={!canControl || playlist.length < 2}
          className="btn-control"
          title="Previous"
        >
          <SkipBack size={18} />
        </button>

        <button
          onClick={onStop}
          disabled={!canControl}
          className="btn-control"
          title="Stop"
        >
          <Square size={16} />
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!canControl}
          className="btn-control btn-play"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} />}
        </button>

        <button
          onClick={onNext}
          disabled={!canControl || playlist.length < 2}
          className="btn-control"
          title="Next"
        >
          <SkipForward size={18} />
        </button>
      </div>

      {/* Lock message */}
      {!isUnlocked && (
        <div
          className="text-center py-2 px-4 rounded-lg font-orbitron text-xs font-bold uppercase tracking-widest animate-text-flash"
          style={{
            background: 'rgba(255,68,68,0.1)',
            border: '1px solid rgba(255,68,68,0.3)',
            color: '#FF6B6B'
          }}
        >
          🔒 Charge Battery to Unlock Music
        </div>
      )}
    </div>
  );
}
