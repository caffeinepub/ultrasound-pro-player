import React from 'react';

const ENGINES = ['Crystal Engine', 'Deep Bass Engine', 'Surround Engine', 'Pure HD Engine'];

interface Props {
  currentEngine: string;
  onSelect: (engine: string) => void;
}

export default function SoundEngineSelector({ currentEngine, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {ENGINES.map((engine) => {
        const isActive = engine === currentEngine;
        return (
          <button
            key={engine}
            onClick={() => onSelect(engine)}
            className={`
              px-3 py-2 rounded-lg font-rajdhani font-semibold text-sm transition-all duration-200
              min-h-[44px] border
              ${isActive
                ? 'bg-ultra-gold/20 border-ultra-gold text-ultra-gold shadow-glow-gold'
                : 'bg-white/5 border-white/20 text-white/70 hover:border-ultra-blue/60 hover:text-ultra-blue hover:bg-ultra-blue/10'
              }
            `}
          >
            {engine}
          </button>
        );
      })}
    </div>
  );
}
