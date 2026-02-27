import { useRef, useState, useCallback } from 'react';
import { Upload, FolderOpen } from 'lucide-react';

interface Props {
  onFilesAdded: (files: FileList | File[]) => void;
  error: string | null;
}

export function FilePicker({ onFilesAdded, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesAdded(files);
    }
    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  }, [onFilesAdded]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron font-bold text-sm uppercase tracking-widest" style={{ color: '#FFD700' }}>
          📁 File Picker
        </h3>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105"
          style={{
            background: 'rgba(255,215,0,0.15)',
            border: '1px solid rgba(255,215,0,0.4)',
            color: '#FFD700',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(255,215,0,0.2)'
          }}
        >
          <FolderOpen size={12} />
          Browse
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl cursor-pointer transition-all duration-300 ${isDragging ? 'drop-zone-active' : ''}`}
        style={{
          background: isDragging ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
          border: isDragging
            ? '2px dashed #FFD700'
            : '2px dashed rgba(255,215,0,0.25)',
          boxShadow: isDragging ? '0 0 30px rgba(255,215,0,0.4), inset 0 0 20px rgba(255,215,0,0.05)' : 'none',
          minHeight: '100px'
        }}
      >
        <Upload
          size={28}
          style={{
            color: isDragging ? '#FFD700' : 'rgba(255,215,0,0.4)',
            filter: isDragging ? 'drop-shadow(0 0 8px rgba(255,215,0,0.8))' : 'none',
            transition: 'all 0.3s'
          }}
        />
        <p className="font-rajdhani text-sm text-center" style={{ color: isDragging ? '#FFD700' : 'rgba(255,255,255,0.4)' }}>
          {isDragging ? 'Drop files here!' : 'Drag & drop audio files'}
        </p>
        <p className="font-rajdhani text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          MP3 · WAV · FLAC · OGG · AAC
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          className="p-2 rounded-md text-xs font-rajdhani"
          style={{
            background: 'rgba(255,68,68,0.1)',
            border: '1px solid rgba(255,68,68,0.3)',
            color: '#FF6B6B'
          }}
        >
          ⚠ {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".mp3,.wav,.flac,.ogg,.aac,.m4a,audio/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
