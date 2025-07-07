import { useState, useEffect, useCallback } from 'react';
import { TeleprompterDisplay } from './components/TeleprompterDisplay';
import { ControlPanel } from './components/ControlPanel';
import { CountdownTimer } from './components/CountdownTimer';
import { BluetoothControls } from './components/BluetoothControls';
import { ScriptManager } from './components/ScriptManager';
import { LandscapeControls } from './components/LandscapeControls';
import { TemplateManager } from './components/TemplateManager';
import { PracticeMode } from './components/PracticeMode';
import { AccessibilityControls } from './components/AccessibilityControls';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useScripts } from './hooks/useScripts';
import { useOrientation } from './hooks/useOrientation';
import { DEFAULT_SETTINGS } from './utils/constants';

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

function App() {
  const [settings, setSettings] = useLocalStorage<Settings>('teleprompter-settings', DEFAULT_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScriptManager, setShowScriptManager] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showPracticeMode, setShowPracticeMode] = useState(false);
  const [showLandscapeControls, setShowLandscapeControls] = useState(false);
  const [showLandscapePlayButtons, setShowLandscapePlayButtons] = useState(false);
  
  const { isLandscape } = useOrientation();
  
  const {
    scripts,
    currentScript,
    createScript,
    updateScript,
    deleteScript,
    selectScript
  } = useScripts();

  // Handlers para controles do teleprompter
  const handleTogglePlay = useCallback(() => {
    if (settings.countdownTime > 0 && !isPlaying) {
      setShowCountdown(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, settings.countdownTime]);

  const handleReset = useCallback(() => {
    console.log('handleReset chamado - parando reprodução e resetando');
    console.log('Estado atual - scrollPosition:', scrollPosition, 'isPlaying:', isPlaying, 'mirror:', settings.mirror);
    
    // Parar a reprodução primeiro
    setIsPlaying(false);
    setShowCountdown(false);
    
    // Forçar uma atualização adicional para garantir que o DOM seja atualizado
    setTimeout(() => {
      const teleprompterDisplay = document.querySelector('.teleprompter-display');
      if (teleprompterDisplay) {
        const maxScroll = teleprompterDisplay.scrollHeight - teleprompterDisplay.clientHeight;
        
        console.log('handleReset: scrollHeight total:', teleprompterDisplay.scrollHeight);
        console.log('handleReset: clientHeight:', teleprompterDisplay.clientHeight);
        console.log('handleReset: maxScroll calculado:', maxScroll);
        console.log('handleReset: modo espelho ativo:', settings.mirror);
        
        if (settings.mirror) {
          // Modo espelho: texto desce de cima para baixo
          // Reset deve ir para o topo (posição 0) para o texto descer
          console.log('handleReset: modo espelho - resetando para o topo (0)');
          setScrollPosition(0);
          teleprompterDisplay.scrollTop = 0;
        } else {
          // Modo normal: texto sobe de baixo para cima
          // Reset deve ir para o final (maxScroll) para o texto subir
          console.log('handleReset: modo normal - resetando para o final (' + maxScroll + ')');
          setScrollPosition(maxScroll);
          teleprompterDisplay.scrollTop = maxScroll;
        }
        
        console.log('handleReset: scrollTop final:', teleprompterDisplay.scrollTop);
        console.log('handleReset: reset aplicado com sucesso');
      }
    }, 100);
  }, [scrollPosition, isPlaying, settings.mirror]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setIsPlaying(true);
  }, []);

  const handleCountdownCancel = useCallback(() => {
    setShowCountdown(false);
  }, []);



  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  // Auto-scroll logic with consistent speed
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setScrollPosition(prev => {
        // Velocidade consistente baseada na configuração do usuário
        // Multiplicador ajustado para uma velocidade mais natural
        const increment = settings.speed * 1.5;
        return prev + increment;
      });
    }, 50); // 20 FPS para scroll suave

    return () => clearInterval(interval);
  }, [isPlaying, settings.speed]);

  // Hide landscape controls after inactivity
  useEffect(() => {
    if (!isLandscape || !showLandscapeControls) return;

    const timer = setTimeout(() => {
      setShowLandscapeControls(false);
    }, 8000); // Aumentado para 8 segundos

    return () => clearTimeout(timer);
  }, [showLandscapeControls, isLandscape]);

  // Hide landscape play buttons after inactivity
  useEffect(() => {
    if (!isLandscape || !showLandscapePlayButtons) return;

    const timer = setTimeout(() => {
      setShowLandscapePlayButtons(false);
    }, 10000); // Aumentado para 10 segundos

    return () => clearTimeout(timer);
  }, [showLandscapePlayButtons, isLandscape]);

  // Reset landscape controls when orientation changes
  useEffect(() => {
    if (!isLandscape) {
      setShowLandscapePlayButtons(false);
      setShowLandscapeControls(false);
    }
  }, [isLandscape]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'r' && e.ctrlKey) {
        e.preventDefault();
        handleReset();
      } else if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        setShowScriptManager(true);
      } else if (e.key === 't' && e.ctrlKey) {
        e.preventDefault();
        setShowTemplateManager(true);
      } else if (e.key === 'p' && e.ctrlKey) {
        e.preventDefault();
        setShowPracticeMode(true);
      } else if (e.key === 'Escape' && isLandscape) {
        if (showLandscapeControls) {
          setShowLandscapeControls(false);
        } else {
          setShowLandscapePlayButtons(false);
        }
      } else if (e.key === 'c' && isLandscape) {
        setShowLandscapeControls(!showLandscapeControls);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLandscape, showLandscapeControls, showLandscapePlayButtons]);

  // Touch/click to show controls in landscape - improved detection
  useEffect(() => {
    if (!isLandscape) return;

    let touchStartY = 0;
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchMoved = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't interfere with button clicks
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.landscape-control-button')) {
        return;
      }
      
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      touchStartTime = Date.now();
      touchMoved = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartTime === 0) return;
      
      const touchCurrentY = e.touches[0].clientY;
      const touchCurrentX = e.touches[0].clientX;
      const touchDistanceY = Math.abs(touchCurrentY - touchStartY);
      const touchDistanceX = Math.abs(touchCurrentX - touchStartX);
      const totalDistance = Math.sqrt(touchDistanceX * touchDistanceX + touchDistanceY * touchDistanceY);
      
      // Mark as moved if distance is significant
      if (totalDistance > 30) {
        touchMoved = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Don't interfere with button clicks
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.landscape-control-button')) {
        return;
      }
      
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      
      // Show controls if it's a tap (not a scroll/swipe)
      if (!touchMoved && touchDuration < 600 && touchStartTime > 0) {
        setShowLandscapePlayButtons(true);
      }
      
      // Reset touch tracking
      touchStartTime = 0;
      touchMoved = false;
    };

    const handleClick = (e: MouseEvent) => {
      // Don't interfere with button clicks
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.landscape-control-button')) {
        return;
      }
      
      // For mouse clicks (desktop), show controls immediately
      setShowLandscapePlayButtons(true);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('click', handleClick);
    };
  }, [isLandscape]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Update settings text when script is selected
  useEffect(() => {
    console.log('🔄 USEEFFECT SETTINGS: Executando...');
    console.log('🔄 USEEFFECT SETTINGS: currentScript existe?', !!currentScript);
    console.log('🔄 USEEFFECT SETTINGS: currentScript:', currentScript?.title);
    
    if (currentScript) {
      console.log('🔄 USEEFFECT SETTINGS: Atualizando settings.text com:', currentScript.content?.substring(0, 50) + '...');
      
      setSettings(prev => {
        console.log('🔄 USEEFFECT SETTINGS: Settings ANTES da atualização:', prev?.text?.substring(0, 50) + '...');
        const newSettings = { ...prev, text: currentScript.content };
        console.log('🔄 USEEFFECT SETTINGS: Settings DEPOIS da atualização:', newSettings?.text?.substring(0, 50) + '...');
        return newSettings;
      });
      
      console.log('🔄 USEEFFECT SETTINGS: setSettings chamado com sucesso!');
    } else {
      console.log('🔄 USEEFFECT SETTINGS: currentScript é null/undefined, não atualizando');
    }
  }, [currentScript]); // Removido setSettings das dependências para evitar loop infinito

  // Prevent zoom on double tap for mobile - but allow scrolling
  useEffect(() => {
    let lastTouchEnd = 0;
    
    const preventZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Only prevent zoom, don't interfere with scrolling
    document.addEventListener('touchend', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  const handleBluetoothCommand = useCallback((command: string) => {
    console.log('🚀 COMANDO BLUETOOTH RECEBIDO:', command);
    
    // Expor função de teste global
    if (typeof window !== 'undefined') {
      (window as any).testTeleprompterCommands = () => {
        console.log('🧪 TESTE MANUAL: Iniciando sequência de comandos...');
        
        console.log('🎮 Testando TOGGLE_PLAY...');
        handleBluetoothCommand('toggle_play');
        
        setTimeout(() => {
          console.log('🎮 Testando RESET...');
          handleBluetoothCommand('reset');
        }, 2000);
        
        setTimeout(() => {
          console.log('🎮 Testando SPEED_UP...');
          handleBluetoothCommand('speed_up');
        }, 4000);
        
        setTimeout(() => {
          console.log('🎮 Testando PAGE_DOWN...');
          handleBluetoothCommand('page_down');
        }, 6000);
        
        console.log('✅ Teste iniciado! Observe o teleprompter por 8 segundos.');
      };
      
      console.log('🧪 FUNÇÃO DE TESTE CRIADA: window.testTeleprompterCommands()');
    }
    
    switch (command) {
      case 'play':
        if (!isPlaying) handleTogglePlay();
        break;
      case 'pause':
        if (isPlaying) setIsPlaying(false);
        break;
      case 'toggle_play':
        handleTogglePlay();
        break;
      case 'reset':
        handleReset();
        break;
      case 'speed_up':
        setSettings(prev => ({ ...prev, speed: Math.min(2.0, prev.speed + 0.1) }));
        break;
      case 'speed_down':
        setSettings(prev => ({ ...prev, speed: Math.max(0.1, prev.speed - 0.1) }));
        break;
      case 'page_up':
        // Rolar para cima (diminuir scroll)
        setScrollPosition(prev => Math.max(0, prev - 100));
        break;
      case 'page_down':
        // Rolar para baixo (aumentar scroll)
        setScrollPosition(prev => prev + 100);
        break;
    }
  }, [isPlaying, handleTogglePlay, handleReset, setSettings, setScrollPosition]);

  const handleTextChange = useCallback((newText: string) => {
    setSettings({ ...settings, text: newText });
  }, [settings, setSettings]);

  const handleTemplateSelect = useCallback((template: any) => {
    setSettings(prev => ({ ...prev, text: template.content }));
    setShowTemplateManager(false);
  }, [setSettings]);

  const handleScriptSelect = useCallback((script: any) => {
    console.log('🚀 INICIANDO handleScriptSelect');
    console.log('📝 SCRIPT RECEBIDO:', script);
    console.log('📄 TÍTULO:', script?.title);
    console.log('📄 CONTEÚDO:', script?.content?.substring(0, 100) + '...');
    console.log('📄 TAMANHO DO CONTEÚDO:', script?.content?.length);
    
    // Verificar se o script tem conteúdo
    if (!script || !script.content) {
      console.error('❌ ERRO: Script sem conteúdo!', script);
      return;
    }
    
    console.log('🔄 ATUALIZANDO SETTINGS...');
    // Atualizar o texto do teleprompter com o conteúdo do script
    setSettings(prev => {
      console.log('📊 SETTINGS ANTES:', prev.text?.substring(0, 50) + '...');
      const newSettings = { ...prev, text: script.content };
      console.log('📊 SETTINGS DEPOIS:', newSettings.text?.substring(0, 50) + '...');
      return newSettings;
    });
    
    console.log('🎯 SELECIONANDO SCRIPT NO HOOK...');
    // Selecionar o script no hook (passando o objeto completo, não apenas o ID)
    selectScript(script);
    
    console.log('🔄 RESETANDO SCROLL...');
    // Reset da posição de scroll
    setScrollPosition(0);
    
    console.log('❌ FECHANDO GERENCIADOR...');
    // Fechar o gerenciador de scripts
    setShowScriptManager(false);
    
    console.log('✅ PROCESSO COMPLETO! TEXTO DEVE APARECER AGORA!');
  }, [selectScript, setSettings, setScrollPosition]);

  // Landscape mode - reading focused layout
  if (isLandscape) {
    return (
      <div className="h-screen flex flex-col bg-white text-gray-900 overflow-hidden">
        {/* Landscape Controls - Only show when active */}
        {showLandscapeControls && (
          <LandscapeControls
            isPlaying={isPlaying}
            settings={settings}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            onUpdateSettings={setSettings}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            onOpenScriptManager={() => setShowScriptManager(true)}
            onOpenTemplateManager={() => setShowTemplateManager(true)}
            onOpenPracticeMode={() => setShowPracticeMode(true)}
            onHide={() => setShowLandscapeControls(false)}
            onBluetoothCommand={handleBluetoothCommand}
          />
        )}

        {/* Full Screen Text Display */}
        <TeleprompterDisplay
          text={settings.text}
          settings={settings}
          isPlaying={isPlaying}
          onTextChange={handleTextChange}
          scrollPosition={scrollPosition}
          onScrollPositionChange={setScrollPosition}
          isLandscapeMode={true}
        />

        {/* Landscape Play Buttons - Bottom Center */}
        {showLandscapePlayButtons && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão play/pause clicado em modo paisagem');
                handleTogglePlay();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão play/pause tocado em modo paisagem');
                handleTogglePlay();
              }}
              className="landscape-control-button flex items-center justify-center w-16 h-16 bg-[#F1613D] text-white rounded-full hover:bg-[#e55532] transition-all duration-200 shadow-2xl hover:shadow-3xl active:shadow-lg transform hover:scale-105 active:scale-95 touch-manipulation select-none"
              style={{ touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão reset clicado em modo paisagem');
                handleReset();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão reset tocado em modo paisagem');
                handleReset();
              }}
              className="landscape-control-button flex items-center justify-center w-12 h-12 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all duration-200 shadow-xl hover:shadow-2xl active:shadow-md transform hover:scale-105 active:scale-95 touch-manipulation select-none"
              style={{ touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão configurações clicado em modo paisagem');
                setShowLandscapePlayButtons(false);
                setShowLandscapeControls(true);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão configurações tocado em modo paisagem');
                setShowLandscapePlayButtons(false);
                setShowLandscapeControls(true);
              }}
              className="landscape-control-button flex items-center justify-center w-10 h-10 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-sm transform hover:scale-105 active:scale-95 touch-manipulation select-none"
              style={{ touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        )}

        {/* Script Manager */}
        {showScriptManager && (
          <ScriptManager
            scripts={scripts}
            currentScript={currentScript}
            onScriptSelect={handleScriptSelect}
            onScriptCreate={createScript}
            onScriptUpdate={updateScript}
            onScriptDelete={deleteScript}
            onClose={() => setShowScriptManager(false)}
          />
        )}

        {/* Template Manager */}
        {showTemplateManager && (
          <TemplateManager
            onTemplateSelect={handleTemplateSelect}
            onClose={() => setShowTemplateManager(false)}
          />
        )}

        {/* Practice Mode */}
        {showPracticeMode && (
          <PracticeMode
            text={settings.text}
            onClose={() => setShowPracticeMode(false)}
            targetWPM={180}
          />
        )}

        {/* Countdown Timer */}
        {showCountdown && (
          <CountdownTimer
            seconds={settings.countdownTime}
            onComplete={handleCountdownComplete}
            onCancel={handleCountdownCancel}
          />
        )}

        {/* Tap indicator - only show when no buttons are visible and not playing */}
        {!showLandscapePlayButtons && !showLandscapeControls && !isPlaying && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm animate-pulse">
            Toque na tela para mostrar controles
          </div>
        )}
      </div>
    );
  }

  // Portrait mode - normal layout with fixed header and footer
  return (
    <div className="h-screen flex flex-col bg-white text-gray-900 overflow-hidden">
      {/* Fixed Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4 flex-shrink-0 shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo_tele.svg" 
              alt="Teleprompter Fácil" 
              className="h-8 sm:h-10 w-auto"
            />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">Teleprompter Fácil</h1>
          </div>
          <div className="flex items-center gap-2">
            <BluetoothControls onCommand={handleBluetoothCommand} />
          </div>
        </div>
      </div>

      {/* Main Display with top and bottom padding for fixed elements */}
      <div className="flex-1 mt-[72px] mb-[140px] sm:mt-[88px] sm:mb-[160px]">
        <TeleprompterDisplay
          text={settings.text}
          settings={settings}
          isPlaying={isPlaying}
          onTextChange={handleTextChange}
          scrollPosition={scrollPosition}
          onScrollPositionChange={setScrollPosition}
          isLandscapeMode={false}
        />
      </div>

      {/* Fixed Control Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <ControlPanel
          isPlaying={isPlaying}
          settings={settings}
          onTogglePlay={handleTogglePlay}
          onReset={handleReset}
          onUpdateSettings={setSettings}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
          onOpenScriptManager={() => setShowScriptManager(true)}
          onOpenTemplateManager={() => setShowTemplateManager(true)}
          onOpenPracticeMode={() => setShowPracticeMode(true)}
        />
      </div>

      {/* Script Manager */}
      {showScriptManager && (
        <ScriptManager
          scripts={scripts}
          currentScript={currentScript}
          onScriptSelect={handleScriptSelect}
          onScriptCreate={createScript}
          onScriptUpdate={updateScript}
          onScriptDelete={deleteScript}
          onClose={() => setShowScriptManager(false)}
        />
      )}

      {/* Countdown Timer */}
      {showCountdown && (
        <CountdownTimer
          seconds={settings.countdownTime}
          onComplete={handleCountdownComplete}
          onCancel={handleCountdownCancel}
        />
      )}

      {/* Accessibility Controls */}
      <AccessibilityControls
        settings={{
          ...settings,
          highContrast: false,
          screenReader: false,
          keyboardNavigation: true
        }}
        onUpdateSettings={setSettings}
      />
    </div>
  );
}

export default App;