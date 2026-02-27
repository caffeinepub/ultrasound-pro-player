import React from 'react';
import { Magnet } from 'lucide-react';

interface Props {
  isOn: boolean;
  onToggle: () => void;
}

export default function SoundMagnetToggle({ isOn, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-rajdhani font-bold text-sm
        transition-all duration-300 min-h-[44px]
        ${isOn
          ? 'bg-ultra-gold/20 border-ultra-gold text-ultra-gold shadow-glow-gold'
          : 'bg-white/5 border-white/20 text-white/50 hover:border-ultra-blue/40 hover:text-ultra-blue/70'
        }
      `}
    >
      <Magnet className={`w-4 h-4 ${isOn ? 'text-ultra-gold' : 'text-white/40'}`} />
      <span>Sound Magnet: {isOn ? 'ON' : 'OFF'}</span>
    </button>
  );
}
