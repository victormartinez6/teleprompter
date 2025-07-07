import { useState, useCallback, useEffect } from 'react';

// Declarações de tipo para Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options: any): Promise<any>;
    };
    hid?: any;
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
  const [webHidDevice, setWebHidDevice] = useState<any>(null);

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
    // Verificar se temos o callback de comando (global ou local)
    const commandCallback = (window as any).__teleprompterCommandCallback || props?.onCommand;
    if (!commandCallback) {
      console.log('❌ ERRO: Nenhum callback de comando disponível');
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
      commandCallback(command);
    } else {
      console.log('⚠️  Tecla não mapeada:', event.code);
    }
  }, [props]);

  // Sistema global de controle - PERSISTENTE
  useEffect(() => {
    if (props?.onCommand) {
      // Sempre atualizar o callback, mesmo se já existe
      (window as any).__teleprompterCommandCallback = props.onCommand;
      
      // Verificar se já existe um listener ativo
      const existingListener = (window as any).__teleprompterKeyListener;
      
      if (existingListener) {
        console.log('✅ SISTEMA JÁ ATIVO - Callback atualizado');
        return () => {
          // NÃO LIMPAR - manter sistema ativo
          console.log('🔄 Re-render detectado - mantendo sistema ativo');
        };
      }
      
      console.log('🎮 SISTEMA DE CONTROLE ATIVO (GLOBAL - PERSISTENTE)!');
      console.log('📋 TESTE COM TECLADO:');
      console.log('   🎮 ESPAÇO: Play/Pause');
      console.log('   🔄 ESC: Reset');
      console.log('   ⬆️  SETA CIMA: Page Up');
      console.log('   ⬇️  SETA BAIXO: Page Down');
      console.log('   ➡️  SETA DIREITA: Speed +');
      console.log('   ⬅️  SETA ESQUERDA: Speed -');
      console.log('   🔢 Números 1-6: Comandos alternativos');
      console.log('\n🚨 TESTE: Pressione ESPAÇO agora!');
      
      // Listener global único
      const globalKeyHandler = (event: KeyboardEvent) => {
        const callback = (window as any).__teleprompterCommandCallback;
        if (callback) {
          handleKeyPress.call(null, event);
        }
      };
      
      // Marcar como ativo e armazenar referência
      (window as any).__teleprompterKeyListener = globalKeyHandler;
      (window as any).__teleprompterInitialized = true;
      
      // Usar capture=true para capturar antes de outros listeners
      document.addEventListener('keydown', globalKeyHandler, { capture: true, passive: false });
      
      // Adicionar log de teste imediato
      console.log('🎯 SISTEMA PRONTO! Teste agora: pressione ESPAÇO');
      
      return () => {
        // NÃO LIMPAR automaticamente - só em casos específicos
        console.log('🔄 useEffect cleanup - mantendo sistema ativo');
      };
    }
  }, [props?.onCommand]); // Removido handleKeyPress da dependência
  
  // Detectar page unload para limpeza adequada
  useEffect(() => {
    const handlePageUnload = () => {
      (window as any).__teleprompterPageUnloading = true;
    };
    
    window.addEventListener('beforeunload', handlePageUnload);
    window.addEventListener('unload', handlePageUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handlePageUnload);
      window.removeEventListener('unload', handlePageUnload);
    };
  }, []);

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

  // Função para conectar via WebHID
  const connectWebHid = useCallback(async () => {
    if (!navigator.hid) {
      setError('WebHID não suportado neste navegador');
      return;
    }

    try {
      console.log('🎮 TENTANDO CONECTAR VIA WEBHID...');
      
      // Solicitar dispositivos HID
      const devices = await (navigator as any).hid.requestDevice({
        filters: [
          { usagePage: 0x01, usage: 0x06 }, // Teclado
          { usagePage: 0x0C, usage: 0x01 }, // Consumer Control
          { usagePage: 0x01, usage: 0x02 }, // Mouse
        ]
      });

      if (devices.length === 0) {
        setError('Nenhum dispositivo HID selecionado');
        return;
      }

      const selectedDevice = devices[0];
      console.log('🎮 DISPOSITIVO HID SELECIONADO:', selectedDevice);
      
      // Abrir conexão
      await selectedDevice.open();
      setWebHidDevice(selectedDevice);
      
      // Escutar eventos de input
      selectedDevice.addEventListener('inputreport', (event: any) => {
        console.log('🎮 EVENTO HID RECEBIDO:', event);
        console.log('🎮 DADOS:', new Uint8Array(event.data.buffer));
        
        // Processar dados HID
        const data = new Uint8Array(event.data.buffer);
        processHidData(data);
      });
      
      // Debug adicional: verificar informações do dispositivo
      console.log('🔍 INFORMAÇÕES DO DISPOSITIVO:');
      console.log('  - Nome:', selectedDevice.productName);
      console.log('  - Vendor ID:', selectedDevice.vendorId);
      console.log('  - Product ID:', selectedDevice.productId);
      console.log('  - Collections:', selectedDevice.collections);
      
      // Testar se o dispositivo está enviando dados
      console.log('🚨 TESTE: Pressione QUALQUER botão do controle agora!');
      console.log('🚨 Se não aparecer "EVENTO HID RECEBIDO", o controle não está enviando dados HID.');
      
      // Fallback: Se o controle não enviar dados HID diretamente,
      // ele pode estar funcionando como teclado virtual do sistema
      setTimeout(() => {
        console.log('⏰ TIMEOUT: Verificando se recebemos eventos HID...');
        console.log('💡 DICA: Se não funcionou, o controle pode estar enviando teclas do sistema.');
        console.log('💡 Teste: Pressione os botões e veja se aparecem como teclas no teclado global.');
      }, 3000);
      
      console.log('✅ WEBHID CONECTADO COM SUCESSO!');
      setError(null);
      
    } catch (err: any) {
      console.error('❌ Erro ao conectar WebHID:', err);
      setError(`Erro WebHID: ${err.message}`);
    }
  }, [navigator.hid]);

  // Processar dados HID recebidos
  const processHidData = useCallback((data: Uint8Array) => {
    console.log('🔍 PROCESSANDO DADOS HID:', Array.from(data).map(b => b.toString(16).padStart(2, '0')).join(' '));
    console.log('🔍 DADOS RAW:', Array.from(data));
    console.log('🔍 TAMANHO:', data.length, 'bytes');
    
    if (!props?.onCommand) {
      console.log('❌ Callback de comando não disponível');
      return;
    }
    
    // Mapear códigos HID comuns para comandos
    // Baseado em códigos de teclado HID padrão
    const firstByte = data[0];
    const secondByte = data.length > 1 ? data[1] : 0;
    const keyCode = data.length > 2 ? data[2] : 0;
    
    let command = '';
    
    // Códigos de teclas comuns
    switch (keyCode) {
      case 0x2C: // Espaço
        command = 'toggle_play';
        break;
      case 0x29: // ESC
        command = 'reset';
        break;
      case 0x52: // Seta para cima
        command = 'page_up';
        break;
      case 0x51: // Seta para baixo
        command = 'page_down';
        break;
      case 0x4F: // Seta para direita
        command = 'speed_up';
        break;
      case 0x50: // Seta para esquerda
        command = 'speed_down';
        break;
    }
    
    // Códigos de Consumer Control (botões de mídia)
    if (firstByte === 0x01) { // Consumer Control Report
      switch (secondByte) {
        case 0xCD: // Play/Pause
          command = 'toggle_play';
          break;
        case 0xB5: // Scan Next Track
          command = 'page_down';
          break;
        case 0xB6: // Scan Previous Track
          command = 'page_up';
          break;
        case 0xE9: // Volume Up
          command = 'speed_up';
          break;
        case 0xEA: // Volume Down
          command = 'speed_down';
          break;
      }
    }
    
    if (command) {
      console.log('🚀 COMANDO HID DETECTADO:', command);
      props.onCommand(command);
    } else {
      console.log('⚠️ Código HID não mapeado:', { firstByte: firstByte.toString(16), secondByte: secondByte.toString(16), keyCode: keyCode.toString(16) });
      console.log('💡 SUGESTÃO: Adicione este mapeamento se for um botão válido do seu controle.');
      
      // Tentar mapear códigos específicos do controle 2.4G Receiver
      if (data.length > 0) {
        console.log('🔧 TENTANDO MAPEAMENTO ESPECÍFICO PARA 2.4G RECEIVER...');
        
        // Mapear baseado nos dados brutos recebidos
        const dataStr = Array.from(data).join(',');
        let specificCommand = '';
        
        // Você pode adicionar mapeamentos específicos aqui baseado nos logs
        // Por exemplo: if (dataStr === '1,0,0') specificCommand = 'toggle_play';
        
        if (specificCommand) {
          console.log('🎯 COMANDO ESPECÍFICO DETECTADO:', specificCommand);
          props.onCommand(specificCommand);
        }
      }
    }
  }, [props]);

  // Desconectar WebHID
  const disconnectWebHid = useCallback(async () => {
    if (webHidDevice) {
      try {
        await webHidDevice.close();
        setWebHidDevice(null);
        console.log('🚫 WEBHID DESCONECTADO');
      } catch (err) {
        console.error('Erro ao desconectar WebHID:', err);
      }
    }
  }, [webHidDevice]);

  // Verificar suporte ao Web Bluetooth e WebHID
  const isSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  const isWebHidSupported = typeof navigator !== 'undefined' && 'hid' in navigator;

  return {
    device,
    isConnecting,
    error,
    connect,
    disconnect,
    isSupported,
    // WebHID
    webHidDevice,
    connectWebHid,
    disconnectWebHid,
    isWebHidSupported
  };
}