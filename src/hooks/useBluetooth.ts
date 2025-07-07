import { useState, useCallback, useEffect } from 'react';

// Declarações de tipo para Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options: any): Promise<any>;
    };
  }
}

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

  // Estado para armazenar a conexão HID
  const [hidDevice, setHidDevice] = useState<any>(null);

  // Mapear códigos HID para comandos do teleprompter
  const mapHidToCommand = useCallback((hidCode: number) => {
    console.log('Bluetooth HID Code recebido:', hidCode);
    
    // Mapeamento comum de controles remotos HID
    switch (hidCode) {
      case 0x28: // Enter
      case 0x2C: // Space
        return 'toggle_play';
      case 0x29: // Escape
        return 'reset';
      case 0x52: // Arrow Up
      case 0x4B: // Page Up
        return 'page_up';
      case 0x51: // Arrow Down
      case 0x4E: // Page Down
        return 'page_down';
      case 0x4F: // Arrow Right
      case 0x57: // Keypad +
        return 'speed_up';
      case 0x50: // Arrow Left
      case 0x56: // Keypad -
        return 'speed_down';
      // Números do controle
      case 0x1E: // 1
        return 'toggle_play';
      case 0x1F: // 2
        return 'reset';
      case 0x20: // 3
        return 'speed_down';
      case 0x21: // 4
        return 'speed_up';
      case 0x22: // 5
        return 'page_up';
      case 0x23: // 6
        return 'page_down';
      default:
        console.log('Código HID não mapeado:', hidCode);
        return null;
    }
  }, []);

  // Processar dados HID do controle remoto
  const handleHidData = useCallback((event: any) => {
    if (!props?.onCommand) return;
    
    const data = new Uint8Array(event.target.value.buffer);
    console.log('Bluetooth HID Data:', Array.from(data));
    
    // Processar cada byte de dados
    for (let i = 0; i < data.length; i++) {
      if (data[i] !== 0) { // Ignorar bytes vazios
        const command = mapHidToCommand(data[i]);
        if (command) {
          console.log('Bluetooth Command mapeado:', command);
          props.onCommand(command);
        }
      }
    }
  }, [props, mapHidToCommand]);

  // Mapear teclas do teclado (sempre ativo para teste)
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Verificar se temos o callback de comando
    if (!props?.onCommand) {
      console.log('❌ ERRO: props.onCommand não disponível');
      return;
    }

    // Lista de teclas que queremos capturar
    const controlKeys = [
      'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Enter', 'Escape', 'PageUp', 'PageDown',
      'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'
    ];
    
    // Só processar teclas que nos interessam
    if (!controlKeys.includes(event.code)) {
      return;
    }

    // PREVENIR comportamento padrão IMEDIATAMENTE
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    console.log('🎮 TECLA CAPTURADA:', event.code, event.key);

    // Mapear teclas para comandos do teleprompter
    let command = '';
    switch (event.code) {
      case 'Space':
      case 'Enter':
      case 'Digit1':
        command = 'toggle_play';
        break;
      case 'Escape':
      case 'Digit2':
        command = 'reset';
        break;
      case 'ArrowUp':
      case 'PageUp':
      case 'Digit5':
        command = 'page_up';
        break;
      case 'ArrowDown':
      case 'PageDown':
      case 'Digit6':
        command = 'page_down';
        break;
      case 'ArrowRight':
      case 'Equal':
      case 'Plus':
      case 'Digit4':
        command = 'speed_up';
        break;
      case 'ArrowLeft':
      case 'Minus':
      case 'Digit3':
        command = 'speed_down';
        break;
    }

    if (command) {
      console.log('🚀 ENVIANDO COMANDO:', command);
      props.onCommand(command);
    } else {
      console.log('⚠️  Tecla não mapeada:', event.code);
    }
  }, [props]);

  // Listener de teclado sempre ativo para teste
  useEffect(() => {
    if (props?.onCommand) {
      console.log('🎮 SISTEMA DE CONTROLE ATIVO!');
      console.log('📋 TESTE COM TECLADO:');
      console.log('   🎮 ESPAÇO: Play/Pause');
      console.log('   🔄 ESC: Reset');
      console.log('   ⬆️  SETA CIMA: Page Up');
      console.log('   ⬇️  SETA BAIXO: Page Down');
      console.log('   ➡️  SETA DIREITA: Speed +');
      console.log('   ⬅️  SETA ESQUERDA: Speed -');
      console.log('   🔢 Números 1-6: Comandos alternativos');
      console.log('\n🚨 IMPORTANTE: Se ESPAÇO ainda fizer scroll, há conflito!');
      
      // Usar capture=true para capturar antes de outros listeners
      document.addEventListener('keydown', handleKeyPress, { capture: true, passive: false });
      
      return () => {
        console.log('🚫 SISTEMA DE CONTROLE DESATIVADO');
        document.removeEventListener('keydown', handleKeyPress, { capture: true } as any);
      };
    }
  }, [handleKeyPress, props?.onCommand]);

  // Debug específico para dispositivo conectado
  useEffect(() => {
    if (device?.connected) {
      console.log('🔗 BLUETOOTH: Dispositivo conectado -', device.name);
      console.log('🧪 TESTE: Pressione os botões do controle remoto agora...');
      
      // Timer para verificar se recebemos algum evento
      const testTimer = setTimeout(() => {
        console.log('⚠️  BLUETOOTH: Nenhum evento detectado do controle remoto.');
        console.log('💡 SUGESTÃO: Teste com as teclas do teclado primeiro.');
      }, 5000);
      
      return () => clearTimeout(testTimer);
    }
  }, [device?.connected]);

  const connect = useCallback(async () => {
    if (!navigator.bluetooth) {
      setError('Bluetooth não suportado neste navegador');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('Bluetooth: Procurando dispositivos...');
      
      const bluetoothDevice = await navigator.bluetooth!.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'device_information',
          'human_interface_device',
          '00001812-0000-1000-8000-00805f9b34fb', // HID Service
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
          '00001800-0000-1000-8000-00805f9b34fb'  // Generic Access
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

        // Debug completo: listar todos os serviços disponíveis
        try {
          console.log('Bluetooth: Listando todos os serviços disponíveis...');
          const services = await server.getPrimaryServices();
          console.log('Bluetooth: Serviços encontrados:', services.length);
          
          for (const service of services) {
            console.log('Bluetooth: Serviço UUID:', service.uuid);
            try {
              const characteristics = await service.getCharacteristics();
              console.log(`Bluetooth: Serviço ${service.uuid} tem ${characteristics.length} características`);
              
              for (const characteristic of characteristics) {
                console.log('Bluetooth: Característica:', {
                  uuid: characteristic.uuid,
                  properties: characteristic.properties
                });
                
                // Tentar configurar notificações em TODAS as características que suportam
                if (characteristic.properties.notify) {
                  try {
                    console.log('Bluetooth: Configurando notificações para:', characteristic.uuid);
                    await characteristic.startNotifications();
                    characteristic.addEventListener('characteristicvaluechanged', (event) => {
                      console.log('Bluetooth: Evento recebido da característica:', characteristic.uuid);
                      handleHidData(event);
                    });
                    setHidDevice(characteristic);
                  } catch (notifyError) {
                    console.log('Bluetooth: Erro ao configurar notificações:', notifyError);
                  }
                }
                
                // Tentar ler características que suportam leitura
                if (characteristic.properties.read) {
                  try {
                    const value = await characteristic.readValue();
                    console.log('Bluetooth: Valor lido da característica:', characteristic.uuid, new Uint8Array(value.buffer));
                  } catch (readError) {
                    console.log('Bluetooth: Erro ao ler característica:', readError);
                  }
                }
              }
            } catch (charError) {
              console.log('Bluetooth: Erro ao acessar características do serviço:', service.uuid, charError);
            }
          }
        } catch (serviceError) {
          console.log('Bluetooth: Erro ao listar serviços:', serviceError);
        }
        
        // Tentar conectar especificamente ao serviço HID
        try {
          const hidService = await server.getPrimaryService('00001812-0000-1000-8000-00805f9b34fb');
          console.log('Bluetooth: Serviço HID específico encontrado');
        } catch (hidError) {
          console.log('Bluetooth: Serviço HID específico não disponível');
        }

        bluetoothDevice.addEventListener('gattserverdisconnected', () => {
          console.log('Bluetooth: Dispositivo desconectado');
          setDevice(prev => prev ? { ...prev, connected: false } : null);
          setHidDevice(null);
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