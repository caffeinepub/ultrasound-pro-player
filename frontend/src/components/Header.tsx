import React from 'react';
import SoundEngineSelector from './SoundEngineSelector';

interface Props {
  currentEngine: string;
  onEngineSelect: (engine: string) => void;
}

export default function Header({ currentEngine, onEngineSelect }: Props) {
  return (
    <header className="glass-panel border-b border-ultra-gold/20 px-4 py-3">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/assets/generated/speaker-logo.dim_256x256.png"
            alt="UltraSound Pro Logo"
            className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]"
          />
          <div>
            <h1 className="font-orbitron font-black text-xl sm:text-2xl text-ultra-gold glow-gold tracking-widest leading-none">
              ULTRASOUND PRO
            </h1>
            <p className="font-rajdhani text-xs text-ultra-blue/80 tracking-widest uppercase">
              Professional Audio Engine
            </p>
          </div>
        </div>

        {/* Engine Selector */}
        <div className="flex-1 flex justify-center sm:justify-end">
          <SoundEngineSelector currentEngine={currentEngine} onSelect={onEngineSelect} />
        </div>
      </div>
    </header>
  );
}
