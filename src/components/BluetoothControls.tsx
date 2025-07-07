import { Bluetooth, BluetoothConnected } from 'lucide-react';
import { useBluetooth } from '../hooks/useBluetooth';

interface BluetoothControlsProps {
  onCommand: (command: string) => void;
}

export function BluetoothControls({ onCommand }: BluetoothControlsProps) {
  console.log('🔵 BluetoothControls: Componente renderizado');
  console.log('🔵 BluetoothControls: onCommand recebido:', typeof onCommand, !!onCommand);
  
  const { device, isConnecting, error, connect, disconnect, isSupported } = useBluetooth({ onCommand });
  
  console.log('🔵 BluetoothControls: Hook retornou:', { 
    device: !!device, 
    isConnecting, 
    error, 
    isSupported 
  });

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Bluetooth className="w-4 h-4" />
        <span className="text-xs sm:text-sm hidden sm:inline">Bluetooth não suportado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {device?.connected ? (
        <div className="flex items-center gap-2">
          <BluetoothConnected className="w-4 h-4 text-[#F1613D]" />
          <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">{device.name}</span>
          <button
            onClick={disconnect}
            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow-sm"
          >
            Desconectar
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-[#F1613D] text-white rounded-lg hover:bg-[#e55532] transition-colors disabled:opacity-50 shadow-md text-xs sm:text-sm"
        >
          <Bluetooth className="w-4 h-4" />
          <span className="hidden sm:inline">{isConnecting ? 'Conectando...' : 'Bluetooth'}</span>
          <span className="sm:hidden">{isConnecting ? '...' : 'BT'}</span>
        </button>
      )}
      
      {error && (
        <div className="text-red-500 text-xs sm:text-sm max-w-32 sm:max-w-none truncate">{error}</div>
      )}
    </div>
  );
}