import { memo } from 'react';
import { Clock, Type, FileText } from 'lucide-react';

interface TextStatsProps {
  text: string;
  isVisible: boolean;
}

const TextStats = memo(function TextStats({ text, isVisible }: TextStatsProps) {
  if (!isVisible) return null;

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  
  // Estimativa de tempo de leitura (média de 200 palavras por minuto)
  const readingTimeMinutes = Math.ceil(words / 200);
  const readingTimeSeconds = Math.ceil((words / 200) * 60);
  
  const formatReadingTime = () => {
    if (readingTimeSeconds < 60) {
      return `${readingTimeSeconds}s`;
    } else if (readingTimeMinutes < 60) {
      const minutes = Math.floor(readingTimeSeconds / 60);
      const seconds = readingTimeSeconds % 60;
      return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(readingTimeMinutes / 60);
      const minutes = readingTimeMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  return (
    <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs space-y-1 z-20">
      <div className="flex items-center gap-2">
        <Type className="w-3 h-3" />
        <span>{words} palavras</span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="w-3 h-3" />
        <span>{characters} caracteres</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-3 h-3" />
        <span>~{formatReadingTime()}</span>
      </div>
    </div>
  );
});

export { TextStats };
