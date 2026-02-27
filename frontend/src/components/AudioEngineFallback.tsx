export function AudioEngineFallback() {
  return (
    <div className="glass-panel p-8 flex flex-col items-center justify-center gap-4 text-center">
      <div className="text-4xl">⚠️</div>
      <h3 className="font-orbitron font-bold text-lg" style={{ color: '#FFD700' }}>
        Web Audio API Unavailable
      </h3>
      <p className="text-gray-300 text-sm max-w-sm">
        Web Audio API is not supported in your browser. Please use a modern browser (Chrome, Firefox, Safari, Edge) to enjoy ULTRASOUND PRO.
      </p>
    </div>
  );
}
