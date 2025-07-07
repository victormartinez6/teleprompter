import React, { useState } from 'react';
import { Plus, Edit3, Trash2, FileText, Search, Save, X, Play, ArrowLeft } from 'lucide-react';

interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ScriptManagerProps {
  scripts: Script[];
  currentScript: Script | null;
  onScriptSelect: (script: Script) => void;
  onScriptCreate: (title: string, content: string) => void;
  onScriptUpdate: (id: string, title: string, content: string) => void;
  onScriptDelete: (id: string) => void;
  onClose: () => void;
}

export function ScriptManager({
  scripts,
  currentScript,
  onScriptSelect,
  onScriptCreate,
  onScriptUpdate,
  onScriptDelete,
  onClose
}: ScriptManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showMobileEditor, setShowMobileEditor] = useState(false);

  const filteredScripts = scripts.filter(script =>
    script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateScript = () => {
    if (newTitle.trim() && newContent.trim()) {
      onScriptCreate(newTitle.trim(), newContent.trim());
      setNewTitle('');
      setNewContent('');
      setIsCreating(false);
      setShowMobileEditor(false);
      onClose();
    }
  };

  const handleUpdateScript = () => {
    if (editingScript && newTitle.trim() && newContent.trim()) {
      onScriptUpdate(editingScript.id, newTitle.trim(), newContent.trim());
      setEditingScript(null);
      setNewTitle('');
      setNewContent('');
      setShowMobileEditor(false);
    }
  };

  const handleSelectAndClose = (script: Script) => {
    console.log('🎯 SCRIPTMANAGER: handleSelectAndClose chamado');
    console.log('📝 SCRIPTMANAGER: Script selecionado:', script.title);
    console.log('📄 SCRIPTMANAGER: Conteúdo:', script.content?.substring(0, 50) + '...');
    console.log('🔄 SCRIPTMANAGER: Chamando onScriptSelect...');
    
    onScriptSelect(script);
    
    console.log('❌ SCRIPTMANAGER: Fechando modal...');
    onClose();
    
    console.log('✅ SCRIPTMANAGER: Processo completo!');
  };

  const startEditing = (script: Script) => {
    setEditingScript(script);
    setNewTitle(script.title);
    setNewContent(script.content);
    setIsCreating(false);
    setShowMobileEditor(true);
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingScript(null);
    setNewTitle('');
    setNewContent('');
    setShowMobileEditor(true);
  };

  const cancelEditing = () => {
    setIsCreating(false);
    setEditingScript(null);
    setNewTitle('');
    setNewContent('');
    setShowMobileEditor(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#F1613D]" />
            <span className="hidden sm:inline">Gerenciar Scripts</span>
            <span className="sm:hidden">Scripts</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Mobile Editor View */}
        {showMobileEditor && (
          <div className="flex-1 flex flex-col sm:hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <button
                onClick={() => setShowMobileEditor(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900">
                {isCreating ? 'Novo Script' : 'Editar Script'}
              </h3>
            </div>

            <div className="flex-1 p-4 flex flex-col">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Script
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Digite o título do script..."
                  className="w-full px-3 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#F1613D] focus:outline-none focus:ring-2 focus:ring-[#F1613D]/20 text-base"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo do Script
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Digite o conteúdo do script..."
                  className="flex-1 px-3 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#F1613D] focus:outline-none focus:ring-2 focus:ring-[#F1613D]/20 resize-none text-base"
                />
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={isCreating ? handleCreateScript : handleUpdateScript}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#F1613D] text-white rounded-lg hover:bg-[#e55532] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Save className="w-4 h-4" />
                  {isCreating ? 'Criar Script' : 'Salvar'}
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop View or Mobile List View */}
        {!showMobileEditor && (
          <div className="flex flex-1 overflow-hidden">
            {/* Scripts List */}
            <div className="w-full sm:w-1/2 sm:border-r border-gray-200 flex flex-col">
              {/* Search and Create */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar scripts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#F1613D] focus:outline-none focus:ring-2 focus:ring-[#F1613D]/20 text-base"
                  />
                </div>
                <button
                  onClick={startCreating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F1613D] text-white rounded-lg hover:bg-[#e55532] transition-colors shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Novo Script
                </button>
              </div>

              {/* Scripts List */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredScripts.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {searchTerm ? 'Nenhum script encontrado' : 'Nenhum script criado ainda'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredScripts.map((script) => (
                      <div
                        key={script.id}
                        className={`p-4 rounded-lg border transition-all ${
                          currentScript?.id === script.id
                            ? 'border-[#F1613D] bg-[#F1613D]/5'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 truncate flex-1 text-sm sm:text-base">
                            {script.title}
                          </h3>
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleSelectAndClose(script)}
                              className="p-1.5 text-gray-400 hover:text-[#F1613D] transition-colors"
                              title="Usar no teleprompter"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(script);
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                              title="Editar script"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Tem certeza que deseja excluir este script?')) {
                                  onScriptDelete(script.id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Excluir script"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {script.content.substring(0, 100)}...
                        </p>
                        <div className="text-xs text-gray-400 mb-3">
                          {formatDate(script.createdAt)}
                        </div>
                        <button
                          onClick={() => handleSelectAndClose(script)}
                          className="w-full px-3 py-2 bg-[#F1613D] text-white text-sm rounded hover:bg-[#e55532] transition-colors shadow-md"
                        >
                          Usar no Teleprompter
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Editor */}
            <div className="hidden sm:flex sm:w-1/2 flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isCreating ? 'Novo Script' : editingScript ? 'Editar Script' : 'Visualizar Script'}
                </h3>
              </div>

              <div className="flex-1 p-4 flex flex-col">
                {(isCreating || editingScript) ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título do Script
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Digite o título do script..."
                        className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#F1613D] focus:outline-none focus:ring-2 focus:ring-[#F1613D]/20"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conteúdo do Script
                      </label>
                      <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Digite o conteúdo do script..."
                        className="flex-1 px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-300 focus:border-[#F1613D] focus:outline-none focus:ring-2 focus:ring-[#F1613D]/20 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={isCreating ? handleCreateScript : handleUpdateScript}
                        disabled={!newTitle.trim() || !newContent.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F1613D] text-white rounded-lg hover:bg-[#e55532] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        {isCreating ? 'Criar e Usar Script' : 'Salvar Alterações'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : currentScript ? (
                  <>
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {currentScript.title}
                      </h4>
                      <div className="text-sm text-gray-500">
                        {formatDate(currentScript.createdAt)}
                      </div>
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto border border-gray-200">
                      <pre className="text-gray-900 whitespace-pre-wrap font-sans">
                        {currentScript.content}
                      </pre>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => handleSelectAndClose(currentScript)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F1613D] text-white rounded-lg hover:bg-[#e55532] transition-colors shadow-md"
                      >
                        <Play className="w-4 h-4" />
                        Usar no Teleprompter
                      </button>
                      <button
                        onClick={() => startEditing(currentScript)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                      >
                        <Edit3 className="w-4 h-4" />
                        Editar Script
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione um script para visualizar</p>
                      <p className="text-sm mt-2">ou crie um novo script</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}