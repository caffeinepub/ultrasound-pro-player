import { SoundEngineSelector } from './SoundEngineSelector';
import { SoundEngine } from '../utils/audioConstants';

interface Props {
  activeEngine: SoundEngine;
  onEngineSelect: (engine: SoundEngine) => void;
}

export function Header({ activeEngine, onEngineSelect }: Props) {
  return (
    <header
      className="w-full px-6 py-4 flex items-center justify-between flex-wrap gap-4"
      style={{
        background: 'rgba(6,9,24,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,215,0,0.15)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.5), 0 1px 0 rgba(255,215,0,0.1)'
      }}
    >
      {/* Logo + Title */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src="/assets/generated/speaker-logo.dim_256x256.png"
            alt="UltraSound Pro Logo"
            className="w-12 h-12 object-contain animate-float"
            style={{ filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.7))' }}
          />
        </div>
        <div>
          <h1
            className="font-orbitron font-black text-2xl md:text-3xl tracking-widest text-glow-gold leading-none"
            style={{ color: '#FFD700' }}
          >
            ULTRASOUND PRO
          </h1>
          <p className="font-rajdhani text-xs tracking-[0.3em] uppercase mt-0.5" style={{ color: 'rgba(0,191,255,0.8)' }}>
            Ultra-Premium Audio Experience
          </p>
        </div>
      </div>

      {/* Sound Engine Selector */}
      <SoundEngineSelector activeEngine={activeEngine} onSelect={onEngineSelect} />
    </header>
  );
}
