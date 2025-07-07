import React from 'react';
import { Play, Pause, RotateCcw, Settings2, Maximize, Minimize, FileText, Layout, Timer } from 'lucide-react';
import { SCROLL_MODES, COUNTDOWN_OPTIONS, TEXT_COLORS, BACKGROUND_COLORS } from '../utils/constants';

interface Settings {
  speed: number;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  scrollMode: string;
  countdownTime: number;
  mirror: boolean;
  displayMode: string;
  showReadingIndicator: boolean;
  showReadingGuide: boolean;
  text: string;
}

interface ControlPanelProps {
  isPlaying: boolean;
  settings: Settings;
  onTogglePlay: () => void;
  onReset: () => void;
  onUpdateSettings: (settings: Settings) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpenScriptManager: () => void;
  onOpenTemplateManager: () => void;
  onOpenPracticeMode: () => void;
}

export function ControlPanel({
  isPlaying,
  settings,
  onTogglePlay,
  onReset,
  onUpdateSettings,
  onToggleFullscreen,
  isFullscreen,
  onOpenScriptManager,
  onOpenTemplateManager,
  onOpenPracticeMode
}: ControlPanelProps) {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Main Controls - Mobile Optimized */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="flex items-center gap-2 px-4 py-3 bg-[#F1613D] text-white rounded-lg hover:bg-[#e55532] transition-colors font-medium shadow-md"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
            </button>
            
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenScriptManager}
              className="flex items-center gap-2 px-3 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Scripts</span>
            </button>
            
            <button
              onClick={onOpenTemplateManager}
              className="flex items-center gap-2 px-3 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </button>
            
            <button
              onClick={onOpenPracticeMode}
              className="flex items-center gap-2 px-3 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <Timer className="w-4 h-4" />
              <span className="hidden sm:inline">Prática</span>
            </button>
            
            <button
              onClick={onToggleFullscreen}
              className="flex items-center gap-2 px-3 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              <span className="hidden lg:inline">{isFullscreen ? 'Sair' : 'Tela Cheia'}</span>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-3 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </button>
          </div>
        </div>

        {/* Speed Control - Always Visible */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
          <label className="text-sm text-gray-700 font-medium min-w-0">Velocidade</label>
          <input
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            value={settings.speed}
            onChange={(e) => onUpdateSettings({ ...settings, speed: parseFloat(e.target.value) })}
            className="flex-1 min-w-0 accent-[#F1613D]"
          />
          <span className="text-sm text-gray-700 font-mono min-w-[3rem] text-right">{settings.speed.toFixed(1)}x</span>
        </div>
      </div>

      {/* Expanded Settings */}
      {showSettings && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Scroll Mode */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">Modo de Rolagem</label>
              <select
                value={settings.scrollMode}
                onChange={(e) => onUpdateSettings({ ...settings, scrollMode: e.target.value })}
                className="w-full p-2 bg-white text-gray-900 rounded border border-gray-300 focus:border-[#F1613D] focus:outline-none focus:ring-2 focus:ring-[#F1613D]/20"
              >
                <option value={SCROLL_MODES.AUTO}>Automático</option>
                <option value={SCROLL_MODES.REAL}>Real</option>
                <option value={SCROLL_MODES.COVER}>Cobertura</option>
              </select>
            </div>

            {/* Countdown */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">Contagem Regressiva</label>
              <select
                value={settings.countdownTime}
                onChange={(e) => onUpdateSettings({ ...settings, countdownTime: parseInt(e.target.value) })}
                className="w-full p-2 bg-white text-gray-900 rounded border border-gray-300 focus:border-[#F1613D] focus:outline-none focus:ring-2 focus:ring-[#F1613D]/20"
              >
                {COUNTDOWN_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">
                Tamanho da Fonte: {settings.fontSize}px
              </label>
              <input
                type="range"
                min="20"
                max="80"
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                className="w-full accent-[#F1613D]"
              />
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">Cor do Texto</label>
              <div className="flex flex-wrap gap-2">
                {TEXT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => onUpdateSettings({ ...settings, textColor: color })}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      settings.textColor === color ? 'border-[#F1613D] scale-110' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm text-gray-700 mb-2 font-medium">Cor de Fundo</label>
              <div className="flex flex-wrap gap-2">
                {BACKGROUND_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => onUpdateSettings({ ...settings, backgroundColor: color })}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      settings.backgroundColor === color ? 'border-[#F1613D] scale-110' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.mirror}
                    onChange={(e) => onUpdateSettings({ ...settings, mirror: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#F1613D]"
                  />
                  <span className="text-sm text-gray-700 font-medium">Modo Espelho Vertical</span>
                </label>
                <div className="text-xs text-gray-500 ml-7">
                  Inverte o texto verticalmente para uso com espelho físico
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.showReadingIndicator}
                  onChange={(e) => onUpdateSettings({ ...settings, showReadingIndicator: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#F1613D]"
                />
                <span className="text-sm text-gray-700 font-medium">Indicador de Leitura</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.showReadingGuide}
                  onChange={(e) => onUpdateSettings({ ...settings, showReadingGuide: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#F1613D]"
                />
                <span className="text-sm text-gray-700 font-medium">Linha Guia Central</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}