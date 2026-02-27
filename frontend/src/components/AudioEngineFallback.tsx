import React from 'react';

export default function AudioEngineFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ultra-dark">
      <div className="glass-panel p-10 rounded-2xl border border-ultra-blue/30 max-w-md text-center">
        <div className="text-6xl mb-6">🔇</div>
        <h2 className="text-ultra-gold font-orbitron font-bold text-2xl mb-4 glow-gold">
          Web Audio API Unavailable
        </h2>
        <p className="text-white/70 font-rajdhani text-lg leading-relaxed">
          Web Audio API is not supported in your browser.
          Please use a modern browser like{' '}
          <span className="text-ultra-blue font-semibold">Chrome</span>,{' '}
          <span className="text-ultra-blue font-semibold">Firefox</span>, or{' '}
          <span className="text-ultra-blue font-semibold">Edge</span>.
        </p>
      </div>
    </div>
  );
}
