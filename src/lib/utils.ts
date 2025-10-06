import { GenerationModel } from '../types/database';

export const calculateTokens = (model: GenerationModel, durationSeconds: number): number => {
  const rates: Record<GenerationModel, number> = {
    V3_5: 10,
    V4: 15,
    V4_5: 25,
  };
  const durationMinutes = Math.ceil(durationSeconds / 60);
  return rates[model] * durationMinutes;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const downloadAudio = async (audioUrl: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

export const getModelDisplayName = (model: GenerationModel): string => {
  const names: Record<GenerationModel, string> = {
    V3_5: 'V3.5 (Balanced)',
    V4: 'V4 (High Quality)',
    V4_5: 'V4.5 (Advanced)',
  };
  return names[model];
};
