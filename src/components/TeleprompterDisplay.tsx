import React, { useRef, useEffect, useState, memo, useCallback } from 'react';
import { Edit3, Eye, EyeOff, BarChart3, Save, X } from 'lucide-react';
import { TextStats } from './TextStats';
import { parseMarkdown, hasMarkdownFormatting, stripMarkdown } from '../utils/markdown';

interface Settings {
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  mirror: boolean;
  showReadingIndicator: boolean;
  speed: number;
}

interface TeleprompterDisplayProps {
  text: string;
  settings: Settings;
  isPlaying: boolean;
  onTextChange: (text: string) => void;
  scrollPosition: number;
  onScrollPositionChange: (position: number) => void;
  isLandscapeMode?: boolean;
}

const TeleprompterDisplay = memo(function TeleprompterDisplay({
  text,
  settings,
  isPlaying,
  onTextChange,
  scrollPosition,
  onScrollPositionChange,
  isLandscapeMode = false
}: TeleprompterDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [enableMarkdown, setEnableMarkdown] = useState(false);
  const [editText, setEditText] = useState(text);
  const [maxScrollHeight, setMaxScrollHeight] = useState(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Calculate max scroll height when text changes
  useEffect(() => {
    if (displayRef.current) {
      const element = displayRef.current;
      const maxScroll = element.scrollHeight - element.clientHeight;
      setMaxScrollHeight(maxScroll);
    }
  }, [text, settings.fontSize]);

  // Handle scroll position updates
  useEffect(() => {
    if (!displayRef.current || !isPlaying) return;

    const element = displayRef.current;
    
    if (settings.mirror) {
      // No modo espelho, começar do final e rolar para cima
      // Inverter a posição do scroll
      const invertedPosition = maxScrollHeight - scrollPosition;
      element.scrollTop = Math.max(0, invertedPosition);
    } else {
      // Modo normal - rolar de cima para baixo
      element.scrollTop = Math.min(scrollPosition, maxScrollHeight);
    }
  }, [scrollPosition, isPlaying, settings.mirror, maxScrollHeight]);

  // Handle manual scroll when not playing
  useEffect(() => {
    if (!displayRef.current || isPlaying) return;

    const handleScroll = () => {
      if (displayRef.current) {
        const currentScroll = displayRef.current.scrollTop;
        if (settings.mirror) {
          // No modo espelho, inverter a posição para o estado interno
          const invertedPosition = maxScrollHeight - currentScroll;
          onScrollPositionChange(Math.max(0, invertedPosition));
        } else {
          onScrollPositionChange(currentScroll);
        }
      }
    };

    const element = displayRef.current;
    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [isPlaying, onScrollPositionChange, settings.mirror, maxScrollHeight]);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  // Auto-detect markdown formatting
  useEffect(() => {
    if (text && hasMarkdownFormatting(text)) {
      setEnableMarkdown(true);
    }
  }, [text]);

  const handleStartEdit = useCallback(() => {
    if (!isPlaying && !isLandscapeMode) {
      setIsEditing(true);
      setEditText(text);
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [isPlaying, isLandscapeMode, text]);

  const handleSaveEdit = useCallback(() => {
    onTextChange(editText);
    setIsEditing(false);
  }, [editText, onTextChange]);

  const handleCancelEdit = useCallback(() => {
    setEditText(text);
    setIsEditing(false);
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  const textStyle = {
    fontSize: `${settings.fontSize}px`,
    color: settings.textColor,
    lineHeight: '1.6',
    // Modo espelho inverte verticalmente (scaleY) para uso com espelho físico
    // Quando você olhar no espelho, o texto aparecerá normal para leitura
    transform: settings.mirror ? 'scaleY(-1)' : 'none',
  };

  const backgroundStyle = {
    backgroundColor: settings.backgroundColor,
  };

  return (
    <div 
      className="relative flex-1 overflow-hidden"
      style={backgroundStyle}
    >
      {/* Reading Indicator */}
      {settings.showReadingIndicator && !isEditing && (
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-8 w-2 h-2 bg-red-500 rounded-full animate-pulse z-20" />
      )}

      {/* Text Statistics */}
      <TextStats 
        text={enableMarkdown ? stripMarkdown(text) : text} 
        isVisible={showStats && !isEditing} 
      />

      {/* Edit Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button
          onClick={() => setShowStats(!showStats)}
          className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors backdrop-blur-sm"
          title={showStats ? 'Ocultar estatísticas' : 'Mostrar estatísticas'}
        >
          <BarChart3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors backdrop-blur-sm"
          title={isEditing ? 'Sair do modo edição' : 'Editar texto'}
        >
          {isEditing ? <EyeOff className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        </button>
      </div>

      {/* Text Display */}
      <div
        ref={displayRef}
        className={`h-full overflow-y-auto teleprompter-display ${
          isLandscapeMode ? 'p-6 sm:p-12' : 'p-4 sm:p-8'
        } ${!isPlaying ? 'manual-scroll' : ''}`}
        style={backgroundStyle}
      >
        {isEditing && !isLandscapeMode ? (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                ...textStyle,
                backgroundColor: 'transparent',
                border: '2px dashed #F1613D',
                outline: 'none',
                resize: 'none',
                width: '100%',
                minHeight: 'calc(100vh - 200px)',
                fontFamily: 'inherit',
                padding: '16px',
                borderRadius: '8px',
                // No modo de edição, não aplicar espelhamento para facilitar a edição
                transform: 'none',
              }}
              className="placeholder-gray-400"
              placeholder="Digite seu texto aqui..."
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded shadow-sm">
              Ctrl+Enter para salvar • Esc para cancelar
            </div>
          </div>
        ) : (
          <div
            ref={textRef}
            className={`whitespace-pre-wrap leading-relaxed ${
              settings.mirror ? 'transform scale-y-[-1]' : ''
            }`}
            style={textStyle}
          >
            {/* Espaço extra antes do texto para facilitar leitura */}
            <div style={{ height: isLandscapeMode ? '100vh' : '50vh' }} />
            
            {enableMarkdown ? (
              <div dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }} />
            ) : (
              text || (
                <div className="text-gray-400 text-center py-8" style={{ transform: 'none' }}>
                  <Edit3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">
                    {isLandscapeMode ? 'Nenhum texto carregado' : 'Toque para começar a escrever'}
                  </p>
                  <p className="text-sm">
                    {isLandscapeMode ? 'Toque na tela para mostrar controles' : 'ou use o botão Scripts para carregar um texto'}
                  </p>
                </div>
              )
            )}
            
            {/* Espaço extra depois do texto */}
            <div style={{ height: isLandscapeMode ? '100vh' : '50vh' }} />
          </div>
        )}
      </div>
    </div>
  );
});

export { TeleprompterDisplay };