import React from 'react';
import { X, Radio, Music } from 'lucide-react';
import { AudioFile } from '../hooks/useAudioFiles';

interface Props {
  tracks: AudioFile[];
  currentTrack: AudioFile | null;
  isPlaying: boolean;
  onSelect: (track: AudioFile) => void;
  onRemove: (id: string) => void;
}

function formatDuration(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Playlist({ tracks, currentTrack, isPlaying, onSelect, onRemove }: Props) {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Music className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/40 font-rajdhani text-sm">No tracks loaded.</p>
        <p className="text-white/30 font-rajdhani text-xs mt-1">Add audio files or paste a stream URL.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
      {tracks.map((track) => {
        const isActive = currentTrack?.id === track.id;
        const isCurrentlyPlaying = isActive && isPlaying;

        return (
          <div
            key={track.id}
            onClick={() => onSelect(track)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group
              ${isActive
                ? 'bg-ultra-gold/15 border border-ultra-gold/40'
                : 'hover:bg-white/5 border border-transparent'
              }
            `}
          >
            {/* Play indicator */}
            <div className="w-5 h-5 shrink-0 flex items-center justify-center">
              {isCurrentlyPlaying ? (
                <div className="flex gap-0.5 items-end h-4">
                  <div className="w-1 bg-ultra-gold rounded-full animate-[bounce_0.6s_ease-in-out_infinite]" style={{ height: '60%' }} />
                  <div className="w-1 bg-ultra-gold rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.1s]" style={{ height: '100%' }} />
                  <div className="w-1 bg-ultra-gold rounded-full animate-[bounce_0.6s_ease-in-out_infinite_0.2s]" style={{ height: '40%' }} />
                </div>
              ) : track.isStream ? (
                <Radio className="w-4 h-4 text-ultra-blue/60" />
              ) : (
                <Music className="w-4 h-4 text-white/30 group-hover:text-white/60" />
              )}
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-rajdhani font-semibold truncate ${isActive ? 'text-ultra-gold' : 'text-white/80'}`}>
                {track.name}
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-bold ${
                  track.isStream
                    ? 'bg-ultra-blue/20 text-ultra-blue border border-ultra-blue/30'
                    : 'bg-white/10 text-white/50'
                }`}>
                  {track.isStream ? 'STREAM' : track.format}
                </span>
                {track.isStream ? (
                  <span className="text-xs text-red-400 font-rajdhani font-bold animate-pulse">● LIVE</span>
                ) : (
                  <span className="text-xs text-white/40 font-mono">{formatDuration(track.duration)}</span>
                )}
              </div>
            </div>

            {/* Remove button */}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(track.id); }}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
