import { useState, useCallback } from 'react';

export interface AudioFile {
  id: string;
  file: File;
  name: string;
  artist: string;
  duration: number;
  format: string;
  url: string;
}

const ACCEPTED_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'];

function getFormat(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return ext.toUpperCase();
}

function isAccepted(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return ACCEPTED_FORMATS.includes(ext);
}

function parseNameArtist(filename: string): { name: string; artist: string } {
  const base = filename.replace(/\.[^/.]+$/, '');
  if (base.includes(' - ')) {
    const parts = base.split(' - ');
    return { artist: parts[0].trim(), name: parts.slice(1).join(' - ').trim() };
  }
  return { name: base, artist: 'Unknown Artist' };
}

async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    setTimeout(() => resolve(0), 3000);
  });
}

export function useAudioFiles() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const rejected: string[] = [];
    const accepted: File[] = [];

    for (const f of fileArray) {
      if (isAccepted(f.name)) {
        accepted.push(f);
      } else {
        rejected.push(f.name);
      }
    }

    if (rejected.length > 0) {
      setError(`Rejected: ${rejected.join(', ')} — Only MP3, WAV, FLAC, OGG, AAC accepted`);
      setTimeout(() => setError(null), 4000);
    }

    const newAudioFiles: AudioFile[] = await Promise.all(
      accepted.map(async (f) => {
        const { name, artist } = parseNameArtist(f.name);
        const duration = await getAudioDuration(f);
        const url = URL.createObjectURL(f);
        return {
          id: `${f.name}-${f.size}-${Date.now()}`,
          file: f,
          name,
          artist,
          duration,
          format: getFormat(f.name),
          url
        };
      })
    );

    setFiles(prev => {
      // Avoid duplicates by id
      const existingIds = new Set(prev.map(f => f.id));
      const unique = newAudioFiles.filter(f => !existingIds.has(f.id));
      return [...prev, ...unique];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { files, addFiles, removeFile, error, clearError };
}
