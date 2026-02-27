import { useState, useEffect, useCallback } from 'react';

export interface AudioFile {
  id: string;
  file: File | null;
  url: string;
  name: string;
  duration: number;
  format: string;
  isStream: boolean;
}

const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/aac', 'audio/mp4', 'audio/webm', 'audio/x-m4a'];
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.ogg', '.aac', '.m4a', '.webm'];

function getFormat(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const formatMap: Record<string, string> = {
    mp3: 'MP3', wav: 'WAV', flac: 'FLAC', ogg: 'OGG',
    aac: 'AAC', m4a: 'M4A', webm: 'WEBM',
  };
  return formatMap[ext] || ext.toUpperCase() || 'AUDIO';
}

function isSupported(file: File): boolean {
  if (SUPPORTED_FORMATS.includes(file.type)) return true;
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
  return SUPPORTED_EXTENSIONS.includes(ext);
}

function getDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => resolve(isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => resolve(0);
    audio.src = url;
  });
}

export function useAudioFiles() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const objectUrls = useState<Map<string, string>>(() => new Map())[0];

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  const addFile = useCallback(async (file: File) => {
    if (!isSupported(file)) {
      console.warn('[useAudioFiles] Unsupported format:', file.type, file.name);
      return;
    }
    const url = URL.createObjectURL(file);
    objectUrls.set(file.name + Date.now(), url);
    const duration = await getDuration(url);
    const track: AudioFile = {
      id: crypto.randomUUID(),
      file,
      url,
      name: file.name.replace(/\.[^/.]+$/, ''),
      duration,
      format: getFormat(file),
      isStream: false,
    };
    console.log('[useAudioFiles] Added file:', track.name, 'duration:', duration);
    setFiles((prev) => [...prev, track]);
  }, [objectUrls]);

  const addStream = useCallback((url: string) => {
    const name = url.replace(/^https?:\/\//, '').split('/')[0] || 'Live Stream';
    const track: AudioFile = {
      id: crypto.randomUUID(),
      file: null,
      url,
      name,
      duration: 0,
      format: 'STREAM',
      isStream: true,
    };
    console.log('[useAudioFiles] Added stream:', url);
    setFiles((prev) => [...prev, track]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const track = prev.find((f) => f.id === id);
      if (track && track.url.startsWith('blob:')) {
        URL.revokeObjectURL(track.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const getFiles = useCallback(() => files, [files]);

  return { files, addFile, addStream, removeFile, getFiles };
}
