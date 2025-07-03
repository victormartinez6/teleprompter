import { Play, Pause, RotateCcw, Maximize, Minimize, FileText, X, Layout, Timer } from 'lucide-react';
import { BluetoothControls } from './BluetoothControls';

interface LandscapeControlsProps {
  isPlaying: boolean;
  settings: any;
  onTogglePlay: () => void;
  onReset: () => void;
  onUpdateSettings: (settings: any) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpenScriptManager: () => void;
  onOpenTemplateManager: () => void;
  onOpenPracticeMode: () => void;
  onHide: () => void;
  onBluetoothCommand: (command: string) => void;
}

export function LandscapeControls({
  isPlaying,
  settings,
  onTogglePlay,
  onReset,
  onUpdateSettings,
  onToggleFullscreen,
  isFullscreen,
  onOpenScriptManager,
  onOpenTemplateManager,
  onOpenPracticeMode,
  onHide,
  onBluetoothCommand
}: LandscapeControlsProps) {
  return (
    <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-3 z-50 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo_tele.svg" 
            alt="Teleprompter Fácil" 
            className="h-6 w-auto"
          />
          <span className="text-sm font-semibold text-gray-900 hidden sm:block">Teleprompter Fácil</span>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-1 px-3 py-2 bg-[#F1613D] text-white rounded-lg hover:bg-[#e55532] transition-colors text-sm shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pausar' : 'Play'}</span>
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Control */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-600 font-medium">Vel:</span>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={settings.speed}
              onChange={(e) => onUpdateSettings({ ...settings, speed: parseFloat(e.target.value) })}
              className="w-16 accent-[#F1613D]"
            />
            <span className="text-xs text-gray-600 font-mono w-8">{settings.speed.toFixed(1)}x</span>
          </div>

          {/* Bluetooth Controls */}
          <div className="hidden sm:block">
            <BluetoothControls onCommand={onBluetoothCommand} />
          </div>

          <button
            onClick={onOpenScriptManager}
            className="flex items-center gap-1 px-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm shadow-md"
          >
            <FileText className="w-4 h-4" />
          </button>
          
          <button
            onClick={onOpenTemplateManager}
            className="flex items-center gap-1 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-md"
          >
            <Layout className="w-4 h-4" />
          </button>
          
          <button
            onClick={onOpenPracticeMode}
            className="flex items-center gap-1 px-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm shadow-md"
          >
            <Timer className="w-4 h-4" />
          </button>
          
          <button
            onClick={onToggleFullscreen}
            className="flex items-center gap-1 px-2 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm shadow-md"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          <button
            onClick={onHide}
            className="flex items-center gap-1 px-2 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Bluetooth Controls */}
      <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
        <BluetoothControls onCommand={onBluetoothCommand} />
      </div>
    </div>
  );
}