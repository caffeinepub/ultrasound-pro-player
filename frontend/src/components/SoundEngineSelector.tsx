import { SoundEngine } from '../utils/audioConstants';

interface Props {
  activeEngine: SoundEngine;
  onSelect: (engine: SoundEngine) => void;
}

const ENGINES: SoundEngine[] = [
  'Crystal Engine',
  'Deep Bass Engine',
  'Surround Engine',
  'Pure HD Engine'
];

const ENGINE_ICONS: Record<SoundEngine, string> = {
  'Crystal Engine': '💎',
  'Deep Bass Engine': '🔊',
  'Surround Engine': '🌐',
  'Pure HD Engine': '✨'
};

export function SoundEngineSelector({ activeEngine, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-orbitron text-xs font-bold uppercase tracking-widest mr-1" style={{ color: 'rgba(255,215,0,0.6)' }}>
        Engine:
      </span>
      {ENGINES.map(engine => (
        <button
          key={engine}
          onClick={() => onSelect(engine)}
          className="px-3 py-1.5 rounded-md text-xs font-rajdhani font-bold uppercase tracking-wider transition-all duration-200"
          style={{
            background: activeEngine === engine
              ? 'rgba(255,215,0,0.2)'
              : 'rgba(255,255,255,0.05)',
            border: activeEngine === engine
              ? '1px solid rgba(255,215,0,0.6)'
              : '1px solid rgba(255,255,255,0.1)',
            color: activeEngine === engine ? '#FFD700' : 'rgba(255,255,255,0.6)',
            boxShadow: activeEngine === engine
              ? '0 0 12px rgba(255,215,0,0.3)'
              : 'none',
            cursor: 'pointer'
          }}
        >
          {ENGINE_ICONS[engine]} {engine}
        </button>
      ))}
    </div>
  );
}
