import { useState, useCallback, useEffect } from 'react';

interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

interface BluetoothHookProps {
  onCommand?: (command: string) => void;
}

export function useBluetooth(props?: BluetoothHookProps) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapear teclas do controle remoto para comandos
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!device?.connected || !props?.onCommand) return;

    // Prevenir comportamento padrão para teclas do controle
    const controlKeys = [
      'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Enter', 'Escape', 'PageUp', 'PageDown'
    ];
    
    if (controlKeys.includes(event.code)) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('Bluetooth Remote Key:', event.code, event.key);

    // Mapear teclas para comandos do teleprompter
    switch (event.code) {
      case 'Space':
      case 'Enter':
        props.onCommand('toggle_play');
        break;
      case 'Escape':
        props.onCommand('reset');
        break;
      case 'ArrowUp':
      case 'PageUp':
        props.onCommand('page_up');
        break;
      case 'ArrowDown':
      case 'PageDown':
        props.onCommand('page_down');
        break;
      case 'ArrowRight':
      case 'Equal':
      case 'Plus':
        props.onCommand('speed_up');
        break;
      case 'ArrowLeft':
      case 'Minus':
        props.onCommand('speed_down');
        break;
      // Teclas numéricas do controle
      case 'Digit1':
        props.onCommand('toggle_play');
        break;
      case 'Digit2':
        props.onCommand('reset');
        break;
      case 'Digit3':
        props.onCommand('speed_down');
        break;
      case 'Digit4':
        props.onCommand('speed_up');
        break;
      case 'Digit5':
        props.onCommand('page_up');
        break;
      case 'Digit6':
        props.onCommand('page_down');
        break;
    }
  }, [device?.connected, props]);

  // Adicionar/remover listener de teclado quando conectado
  useEffect(() => {
    if (device?.connected && props?.onCommand) {
      console.log('Bluetooth Remote: Ativando captura de teclas');
      document.addEventListener('keydown', handleKeyPress, true);
      
      return () => {
        console.log('Bluetooth Remote: Desativando captura de teclas');
        document.removeEventListener('keydown', handleKeyPress, true);
      };
    }
  }, [device?.connected, handleKeyPress, props?.onCommand]);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError('Bluetooth não suportado neste navegador');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('Bluetooth: Procurando dispositivos...');
      
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'device_information',
          'human_interface_device',
          '00001812-0000-1000-8000-00805f9b34fb' // HID Service
        ]
      });

      console.log('Bluetooth: Dispositivo selecionado:', bluetoothDevice.name);

      const server = await bluetoothDevice.gatt?.connect();
      
      if (server) {
        setDevice({
          id: bluetoothDevice.id,
          name: bluetoothDevice.name || 'Controle Remoto',
          connected: true
        });

        console.log('Bluetooth: Conectado com sucesso!');

        bluetoothDevice.addEventListener('gattserverdisconnected', () => {
          console.log('Bluetooth: Dispositivo desconectado');
          setDevice(prev => prev ? { ...prev, connected: false } : null);
        });
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('cancelled') || errorMessage.includes('User cancelled')) {
        setError('Conexão Bluetooth cancelada pelo usuário');
      } else {
        setError('Falha ao conectar dispositivo Bluetooth');
      }
      console.error('Erro de conexão Bluetooth:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('Bluetooth: Desconectando dispositivo');
    setDevice(null);
    setError(null);
  }, []);

  return {
    device,
    isConnecting,
    error,
    connect,
    disconnect,
    isSupported: !!navigator.bluetooth
  };
}