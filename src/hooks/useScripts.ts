import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SerializedScript {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function useScripts() {
  const [rawScripts, setRawScripts] = useLocalStorage<SerializedScript[]>('teleprompter-scripts', []);
  const [currentScript, setCurrentScript] = useState<Script | null>(null);

  // Convert serialized scripts back to proper Script objects with Date instances
  const scripts = useMemo(() => {
    return rawScripts.map(script => ({
      ...script,
      createdAt: new Date(script.createdAt),
      updatedAt: new Date(script.updatedAt)
    }));
  }, [rawScripts]);

  const createScript = useCallback((title: string, content: string) => {
    const newScript: Script = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const serializedScript: SerializedScript = {
      ...newScript,
      createdAt: newScript.createdAt.toISOString(),
      updatedAt: newScript.updatedAt.toISOString()
    };

    setRawScripts(prev => [serializedScript, ...prev]);
    setCurrentScript(newScript);
    return newScript;
  }, [setRawScripts]);

  const updateScript = useCallback((id: string, title: string, content: string) => {
    const updatedAt = new Date();
    
    setRawScripts(prev => prev.map(script => 
      script.id === id 
        ? { ...script, title, content, updatedAt: updatedAt.toISOString() }
        : script
    ));

    if (currentScript?.id === id) {
      setCurrentScript(prev => prev ? { ...prev, title, content, updatedAt } : null);
    }
  }, [setRawScripts, currentScript]);

  const deleteScript = useCallback((id: string) => {
    setRawScripts(prev => prev.filter(script => script.id !== id));
    
    if (currentScript?.id === id) {
      setCurrentScript(null);
    }
  }, [setRawScripts, currentScript]);

  const selectScript = useCallback((script: Script) => {
    setCurrentScript(script);
  }, []);

  const getScriptById = useCallback((id: string) => {
    return scripts.find(script => script.id === id) || null;
  }, [scripts]);

  return {
    scripts,
    currentScript,
    createScript,
    updateScript,
    deleteScript,
    selectScript,
    getScriptById
  };
}