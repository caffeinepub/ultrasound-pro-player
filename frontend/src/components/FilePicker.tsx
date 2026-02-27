import React, { useRef, useState, useCallback } from 'react';
import { Upload, Link, Music } from 'lucide-react';

interface Props {
  onAdd: (files: File[]) => void;
  onStreamAdded: (url: string) => void;
}

const ACCEPTED = '.mp3,.wav,.flac,.ogg,.aac,.m4a,.webm';

export default function FilePicker({ onAdd, onStreamAdded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList);
    console.log('[FilePicker] handleFiles:', arr.map((f) => f.name));
    onAdd(arr);
  }, [onAdd]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const handleStreamSubmit = () => {
    const url = streamUrl.trim();
    if (!url) { setUrlError('Please enter a URL'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setUrlError('URL must start with http:// or https://');
      return;
    }
    setUrlError('');
    console.log('[FilePicker] Adding stream URL:', url);
    onStreamAdded(url);
    setStreamUrl('');
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-all duration-200
          ${isDragging
            ? 'border-ultra-gold bg-ultra-gold/10 shadow-glow-gold'
            : 'border-white/20 hover:border-ultra-blue/60 hover:bg-ultra-blue/5'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload className={`mx-auto mb-2 w-8 h-8 ${isDragging ? 'text-ultra-gold' : 'text-white/40'}`} />
        <p className="font-rajdhani font-semibold text-white/70 text-sm">
          {isDragging ? 'Drop files here!' : 'Drag & drop audio files'}
        </p>
        <p className="text-white/40 text-xs mt-1">MP3, WAV, FLAC, OGG, AAC, M4A, WEBM</p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
          className="mt-3 px-4 py-1.5 bg-ultra-blue/20 border border-ultra-blue/40 text-ultra-blue rounded-lg text-sm font-rajdhani font-semibold hover:bg-ultra-blue/30 transition-colors min-h-[44px]"
        >
          Browse Files
        </button>
      </div>

      {/* Stream URL */}
      <div className="glass-panel rounded-xl p-3 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Link className="w-4 h-4 text-ultra-blue" />
          <span className="font-rajdhani font-semibold text-white/80 text-sm">Stream URL</span>
        </div>
        <div className="flex gap-2">
          <input
            type="url"
            value={streamUrl}
            onChange={(e) => { setStreamUrl(e.target.value); setUrlError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleStreamSubmit()}
            placeholder="https://stream.example.com/radio"
            className="flex-1 bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white/80 text-sm font-rajdhani placeholder-white/30 focus:outline-none focus:border-ultra-blue/60 min-h-[44px]"
          />
          <button
            onClick={handleStreamSubmit}
            className="px-3 py-2 bg-ultra-blue/20 border border-ultra-blue/40 text-ultra-blue rounded-lg text-sm font-rajdhani font-semibold hover:bg-ultra-blue/30 transition-colors min-h-[44px]"
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
        {urlError && <p className="text-red-400 text-xs mt-1 font-rajdhani">{urlError}</p>}
      </div>
    </div>
  );
}
