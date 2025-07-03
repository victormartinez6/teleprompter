import { useState, useCallback } from 'react';

interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

export function useBluetooth() {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError('Bluetooth not supported in this browser');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const bluetoothDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['device_information']
      });

      const server = await bluetoothDevice.gatt?.connect();
      
      if (server) {
        setDevice({
          id: bluetoothDevice.id,
          name: bluetoothDevice.name || 'Unknown Device',
          connected: true
        });

        bluetoothDevice.addEventListener('gattserverdisconnected', () => {
          setDevice(prev => prev ? { ...prev, connected: false } : null);
        });
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('cancelled') || errorMessage.includes('User cancelled')) {
        setError('Bluetooth connection cancelled by user');
      } else {
        setError('Failed to connect to Bluetooth device');
      }
      console.error('Bluetooth connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
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