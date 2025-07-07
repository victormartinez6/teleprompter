import { Bluetooth, BluetoothConnected } from 'lucide-react';
import { useBluetooth } from '../hooks/useBluetooth';

interface BluetoothControlsProps {
  onCommand: (command: string) => void;
}

export function BluetoothControls({ onCommand }: BluetoothControlsProps) {
  console.log('🔵 BluetoothControls: Componente renderizado');
  console.log('🔵 BluetoothControls: onCommand recebido:', typeof onCommand, !!onCommand);
  
  const { 
    device, 
    isConnecting, 
    error, 
    connect, 
    disconnect, 
    isSupported,
    webHidDevice,
    connectWebHid,
    disconnectWebHid,
    isWebHidSupported
  } = useBluetooth({ onCommand });
  
  console.log('🔵 BluetoothControls: Hook retornou:', { 
    device: !!device, 
    isConnecting, 
    error, 
    isSupported,
    webHidDevice: !!webHidDevice,
    isWebHidSupported
  });

  if (!isSupported && !isWebHidSupported) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Bluetooth className="w-4 h-4" />
        <span className="text-xs sm:text-sm hidden sm:inline">Bluetooth/HID não suportado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Bluetooth */}
      {isSupported && (
        device ? (
          <button
            onClick={disconnect}
            className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs sm:text-sm transition-colors"
            title="Desconectar Bluetooth"
          >
            <BluetoothConnected className="w-4 h-4" />
            <span className="hidden sm:inline">BT OK</span>
            <span className="sm:hidden">BT</span>
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded text-xs sm:text-sm transition-colors"
            title="Conectar Bluetooth"
          >
            <Bluetooth className="w-4 h-4" />
            <span className="hidden sm:inline">{isConnecting ? 'Conectando...' : 'Bluetooth'}</span>
            <span className="sm:hidden">{isConnecting ? '...' : 'BT'}</span>
          </button>
        )
      )}
      
      {/* WebHID */}
      {isWebHidSupported && (
        webHidDevice ? (
          <button
            onClick={disconnectWebHid}
            className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs sm:text-sm transition-colors"
            title="Desconectar Controle HID"
          >
            <span className="text-xs">🎮</span>
            <span className="hidden sm:inline">HID OK</span>
            <span className="sm:hidden">HID</span>
          </button>
        ) : (
          <button
            onClick={connectWebHid}
            className="flex items-center gap-1 px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs sm:text-sm transition-colors"
            title="Conectar Controle via HID"
          >
            <span className="text-xs">🎮</span>
            <span className="hidden sm:inline">Controle</span>
            <span className="sm:hidden">HID</span>
          </button>
        )
      )}
      
      {error && (
        <div className="text-red-500 text-xs sm:text-sm max-w-32 sm:max-w-none truncate">{error}</div>
      )}
    </div>
  );
}