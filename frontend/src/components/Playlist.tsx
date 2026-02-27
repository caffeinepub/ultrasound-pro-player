import { AudioFile } from '../hooks/useAudioFiles';
import { PlaybackState } from '../hooks/useAudioPlayer';
import { Trash2, Music } from 'lucide-react';

interface Props {
  files: AudioFile[];
  currentIndex: number;
  playbackState: PlaybackState;
  onSelect: (file: AudioFile, index: number) => void;
  onRemove: (id: string) => void;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const FORMAT_COLORS: Record<string, string> = {
  MP3: '#FFD700',
  WAV: '#00BFFF',
  FLAC: '#00FF7F',
  OGG: '#FF69B4',
  AAC: '#FFA500',
  M4A: '#FFA500',
};

export function Playlist({ files, currentIndex, playbackState, onSelect, onRemove }: Props) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <Music size={32} style={{ color: 'rgba(255,215,0,0.2)' }} />
        <p className="font-rajdhani text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          No tracks loaded
        </p>
        <p className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Add files above to get started
        </p>
      </div>
    );
  }

  const isCurrentPlaying = playbackState === 'playing';

  return (
    <div className="flex flex-col gap-1">
      <h3
        className="font-orbitron font-bold text-sm uppercase tracking-widest mb-2"
        style={{ color: '#FFD700' }}
      >
        🎵 Playlist ({files.length})
      </h3>
      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto scrollbar-thin pr-1">
        {files.map((file, index) => {
          const isActive = currentIndex === index;
          const isPlayingThis = isActive && isCurrentPlaying;

          return (
            <div
              key={file.id}
              className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 group"
              style={{
                background: isActive ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.03)',
                border: isActive
                  ? '1px solid rgba(255,215,0,0.35)'
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isActive ? '0 0 12px rgba(255,215,0,0.2)' : 'none',
              }}
              onClick={() => onSelect(file, index)}
            >
              {/* Track number / playing indicator */}
              <div
                className="w-5 h-5 flex items-center justify-center text-xs font-orbitron font-bold shrink-0"
                style={{ color: isActive ? '#FFD700' : 'rgba(255,255,255,0.3)' }}
              >
                {isPlayingThis ? (
                  <span style={{ animation: 'pulse-gold 1s ease-in-out infinite' }}>▶</span>
                ) : isActive ? (
                  '▶'
                ) : (
                  index + 1
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-rajdhani font-semibold text-sm truncate leading-tight"
                  style={{ color: isActive ? '#FFD700' : 'white' }}
                >
                  {file.name}
                </p>
                <p
                  className="font-rajdhani text-xs truncate"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  {file.artist}
                </p>
              </div>

              {/* Duration */}
              <span
                className="font-orbitron text-xs shrink-0"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {formatDuration(file.duration)}
              </span>

              {/* Format badge */}
              <span
                className="font-orbitron text-xs px-1.5 py-0.5 rounded shrink-0"
                style={{
                  background: `${FORMAT_COLORS[file.format] || '#FFD700'}20`,
                  border: `1px solid ${FORMAT_COLORS[file.format] || '#FFD700'}50`,
                  color: FORMAT_COLORS[file.format] || '#FFD700',
                  fontSize: '9px',
                }}
              >
                {file.format}
              </span>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                style={{
                  color: 'rgba(255,68,68,0.7)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
