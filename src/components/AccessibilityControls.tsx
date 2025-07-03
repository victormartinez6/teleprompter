import { memo, useState } from 'react';
import { Eye, Volume2, VolumeX, Contrast, Type, Keyboard } from 'lucide-react';

interface AccessibilityControlsProps {
  settings: {
    fontSize: number;
    textColor: string;
    backgroundColor: string;
    highContrast: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  onUpdateSettings: (settings: any) => void;
}

const AccessibilityControls = memo(function AccessibilityControls({
  settings,
  onUpdateSettings
}: AccessibilityControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleHighContrast = () => {
    const newSettings = {
      ...settings,
      highContrast: !settings.highContrast,
      textColor: !settings.highContrast ? '#000000' : '#333333',
      backgroundColor: !settings.highContrast ? '#FFFFFF' : '#F5F5F5'
    };
    onUpdateSettings(newSettings);
  };

  const toggleScreenReader = () => {
    onUpdateSettings({
      ...settings,
      screenReader: !settings.screenReader
    });
  };

  const increaseFontSize = () => {
    const newSize = Math.min(settings.fontSize + 4, 120);
    onUpdateSettings({
      ...settings,
      fontSize: newSize
    });
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(settings.fontSize - 4, 16);
    onUpdateSettings({
      ...settings,
      fontSize: newSize
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
        title="Abrir controles de acessibilidade"
        aria-label="Abrir controles de acessibilidade"
      >
        <Eye className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-30 min-w-64">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Acessibilidade</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Fechar controles de acessibilidade"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Contraste Alto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Contrast className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Alto Contraste</span>
          </div>
          <button
            onClick={toggleHighContrast}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={settings.highContrast}
            aria-label="Alternar alto contraste"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.highContrast ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Tamanho da Fonte */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Tamanho da Fonte</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={decreaseFontSize}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              aria-label="Diminuir fonte"
            >
              A-
            </button>
            <span className="text-sm text-gray-600 min-w-12 text-center">
              {settings.fontSize}px
            </span>
            <button
              onClick={increaseFontSize}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              aria-label="Aumentar fonte"
            >
              A+
            </button>
          </div>
        </div>

        {/* Leitor de Tela */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.screenReader ? (
              <Volume2 className="w-4 h-4 text-gray-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-600" />
            )}
            <span className="text-sm text-gray-700">Leitor de Tela</span>
          </div>
          <button
            onClick={toggleScreenReader}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.screenReader ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            role="switch"
            aria-checked={settings.screenReader}
            aria-label="Alternar leitor de tela"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.screenReader ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Atalhos de Teclado */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Atalhos</span>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Ctrl + Espaço: Play/Pause</div>
            <div>Ctrl + R: Reset</div>
            <div>Ctrl + F: Tela cheia</div>
            <div>Ctrl + T: Templates</div>
            <div>Ctrl + P: Modo prática</div>
            <div>Ctrl + S: Scripts</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export { AccessibilityControls };
