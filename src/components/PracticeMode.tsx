import { useState, useEffect, useCallback, memo } from 'react';
import { Play, Pause, RotateCcw, X, Clock, Target, TrendingUp } from 'lucide-react';

interface PracticeModeProps {
  text: string;
  onClose: () => void;
  targetWPM?: number;
}

interface PracticeStats {
  wordsRead: number;
  timeElapsed: number;
  currentWPM: number;
  averageWPM: number;
  accuracy: number;
}

const PracticeMode = memo(function PracticeMode({ 
  text, 
  onClose, 
  targetWPM = 180 
}: PracticeModeProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [stats, setStats] = useState<PracticeStats>({
    wordsRead: 0,
    timeElapsed: 0,
    currentWPM: 0,
    averageWPM: 0,
    accuracy: 100
  });

  const words = text.trim().split(/\s+/);
  const totalWords = words.length;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        setCurrentTime(elapsed);
        
        // Calculate stats
        const wordsRead = Math.floor((currentPosition / text.length) * totalWords);
        const timeInMinutes = elapsed / 60;
        const currentWPM = timeInMinutes > 0 ? Math.round(wordsRead / timeInMinutes) : 0;
        
        setStats(prev => ({
          ...prev,
          wordsRead,
          timeElapsed: elapsed,
          currentWPM,
          averageWPM: timeInMinutes > 0.1 ? Math.round(wordsRead / timeInMinutes) : 0
        }));
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, currentPosition, text.length, totalWords]);

  const handleStart = useCallback(() => {
    if (!isRunning) {
      setStartTime(Date.now() - currentTime * 1000);
    }
    setIsRunning(true);
  }, [isRunning, currentTime]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setCurrentTime(0);
    setCurrentPosition(0);
    setStats({
      wordsRead: 0,
      timeElapsed: 0,
      currentWPM: 0,
      averageWPM: 0,
      accuracy: 100
    });
  }, []);

  const handleTextClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const totalHeight = element.scrollHeight;
    const clickPosition = y / totalHeight;
    
    setCurrentPosition(Math.floor(clickPosition * text.length));
  }, [text.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getWPMColor = (wpm: number) => {
    if (wpm >= targetWPM) return 'text-green-600';
    if (wpm >= targetWPM * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const progress = totalWords > 0 ? (stats.wordsRead / totalWords) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Modo Prática</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="w-4 h-4" />
              <span>Meta: {targetWPM} PPM</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={isRunning ? handlePause : handleStart}
              className="flex items-center gap-2 px-4 py-2 bg-[#F1613D] text-white rounded-lg hover:bg-[#e55532] transition-colors"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className={`font-bold ${getWPMColor(stats.currentWPM)}`}>
                {stats.currentWPM} PPM
              </span>
            </div>
            
            <div className="text-gray-600">
              {stats.wordsRead} / {totalWords} palavras
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#F1613D] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Text Display */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="h-full overflow-y-auto p-8 cursor-pointer"
          onClick={handleTextClick}
        >
          <div 
            className="text-white text-2xl leading-relaxed whitespace-pre-wrap text-center max-w-4xl mx-auto"
            style={{ 
              textShadow: '0 0 10px rgba(0,0,0,0.5)' 
            }}
          >
            {text || 'Nenhum texto carregado para prática'}
          </div>
          
          {/* Reading Position Indicator */}
          {currentPosition > 0 && (
            <div 
              className="absolute left-0 right-0 h-1 bg-[#F1613D] opacity-70"
              style={{ 
                top: `${(currentPosition / text.length) * 100}%` 
              }}
            />
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{formatTime(stats.timeElapsed)}</div>
            <div className="text-sm text-gray-500">Tempo Total</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${getWPMColor(stats.averageWPM)}`}>
              {stats.averageWPM}
            </div>
            <div className="text-sm text-gray-500">PPM Médio</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.wordsRead}</div>
            <div className="text-sm text-gray-500">Palavras Lidas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.accuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Precisão</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export { PracticeMode };
