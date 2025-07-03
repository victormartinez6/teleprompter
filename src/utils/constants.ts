export const SCROLL_MODES = {
  AUTO: 'auto',
  REAL: 'real',
  COVER: 'cover'
} as const;

export const COUNTDOWN_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 3, label: '3 seconds' },
  { value: 5, label: '5 seconds' },
  { value: 10, label: '10 seconds' }
];

export const TEXT_COLORS = [
  '#000000', '#1f2937', '#374151', '#4b5563',
  '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb',
  '#f3f4f6', '#ffffff', '#fef3c7', '#fbbf24',
  '#f59e0b', '#d97706', '#92400e', '#78350f'
];

export const BACKGROUND_COLORS = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0',
  '#cbd5e1', '#94a3b8', '#64748b', '#475569',
  '#334155', '#1e293b', '#0f172a', '#000000',
  '#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb'
];

export const DISPLAY_MODES = {
  FIT: 'fit',
  FULL: 'full',
  CUSTOM: 'custom'
} as const;

export const DEFAULT_SETTINGS = {
  speed: 1.0,
  fontSize: 32,
  textColor: '#000000',
  backgroundColor: '#ffffff',
  scrollMode: SCROLL_MODES.AUTO,
  countdownTime: 3,
  mirror: false,
  displayMode: DISPLAY_MODES.FIT,
  showReadingIndicator: true,
  text: 'Bem-vindo ao Teleprompter Fácil!\n\nEste é seu aplicativo de teleprompter profissional com recursos avançados incluindo:\n\n• Múltiplos modos de rolagem\n• Controle remoto Bluetooth\n• Aparência personalizável\n• Recursos PWA\n• Funcionalidade offline\n\nComece digitando ou cole seu script aqui para começar. Use os controles para personalizar sua experiência e conecte um dispositivo Bluetooth para controle remoto.'
};