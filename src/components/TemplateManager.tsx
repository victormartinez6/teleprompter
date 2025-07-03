import { useState, memo } from 'react';
import { X, FileText, Search, Copy } from 'lucide-react';
import { Template, DEFAULT_TEMPLATES, getAllCategories, getTemplatesByCategory } from '../utils/templates';

interface TemplateManagerProps {
  onTemplateSelect: (content: string) => void;
  onClose: () => void;
}

const TemplateManager = memo(function TemplateManager({
  onTemplateSelect,
  onClose
}: TemplateManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const categories = getAllCategories();
  
  const filteredTemplates = selectedCategory 
    ? getTemplatesByCategory(selectedCategory)
    : DEFAULT_TEMPLATES;

  const searchedTemplates = filteredTemplates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate.content);
      onClose();
    }
  };

  const handleCopyTemplate = async () => {
    if (selectedTemplate) {
      try {
        await navigator.clipboard.writeText(selectedTemplate.content);
        // Você pode adicionar um toast de sucesso aqui
      } catch (error) {
        console.error('Erro ao copiar template:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#F1613D] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">Templates de Texto</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-[#F1613D] focus:outline-none focus:ring-2 focus:ring-[#F1613D]/20"
              />
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-[#F1613D] focus:outline-none focus:ring-2 focus:ring-[#F1613D]/20"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Template List */}
            <div className="space-y-2">
              {searchedTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-[#F1613D] bg-[#F1613D]/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-1">
                    {template.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {template.description}
                  </p>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {template.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedTemplate ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedTemplate.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {selectedTemplate.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUseTemplate}
                      className="px-4 py-2 bg-[#F1613D] text-white rounded-lg hover:bg-[#e55532] transition-colors font-medium"
                    >
                      Usar Template
                    </button>
                    <button
                      onClick={handleCopyTemplate}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-medium text-gray-900 mb-3">Preview:</h4>
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {selectedTemplate.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Selecione um template</p>
                  <p className="text-sm">
                    Escolha um template da lista para visualizar o conteúdo
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export { TemplateManager };
