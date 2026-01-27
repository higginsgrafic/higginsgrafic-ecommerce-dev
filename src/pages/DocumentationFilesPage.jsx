import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Code, Table, Bug, Settings, ArrowLeft, Eye, Download } from 'lucide-react';

const DocumentationFilesPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loading, setLoading] = useState(false);

  const files = {
    documentation: [
      { name: 'ADMIN_SYSTEM.md', path: '/ADMIN_SYSTEM.md', icon: FileText, color: 'text-blue-500' },
      { name: 'COM_PROVAR_SYNC.md', path: '/COM_PROVAR_SYNC.md', icon: FileText, color: 'text-green-500' },
      { name: 'DOWNLOAD_README.md', path: '/DOWNLOAD_README.md', icon: FileText, color: 'text-blue-500' },
      { name: 'GELATO_SETUP.md', path: '/GELATO_SETUP.md', icon: FileText, color: 'text-orange-500' },
      { name: 'PRODUCT_DETAILS_GUIDE.md', path: '/PRODUCT_DETAILS_GUIDE.md', icon: FileText, color: 'text-pink-500' },
    ],
    data: [
      { name: 'store_products_export.csv', path: '/store_products_export.csv', icon: Table, color: 'text-emerald-500' },
      { name: 'store_products_full.csv', path: '/store_products_full.csv', icon: Table, color: 'text-teal-500' },
    ],
    scripts: [
      { name: 'create-download.sh', path: '/scripts/create-download.sh', icon: Code, color: 'text-cyan-500' },
      { name: 'import-gelato-csv.js', path: '/scripts/import-gelato-csv.js', icon: Code, color: 'text-cyan-500' },
    ],
    debug: [
      { name: 'debug-sync.html', path: '/debug-sync.html', icon: Bug, color: 'text-red-500' },
      { name: 'test.html', path: '/public/test.html', icon: Bug, color: 'text-yellow-500' },
    ],
    config: [
      { name: 'eslint.config.js', path: '/eslint.config.js', icon: Settings, color: 'text-gray-500' },
      { name: '.gitignore', path: '/.gitignore', icon: Settings, color: 'text-gray-600' },
    ],
  };

  const loadFile = async (file) => {
    setLoading(true);
    setSelectedFile(file);
    try {
      const response = await fetch(file.path);
      const text = await response.text();
      setFileContent(text);
    } catch (error) {
      setFileContent(`Error carregant l'arxiu: ${error.message}`);
    }
    setLoading(false);
  };

  const downloadFile = (file) => {
    const element = document.createElement('a');
    const blob = new Blob([fileContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(blob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Tornar
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Arxius de Documentació i Desenvolupament
          </h1>
          <p className="text-gray-600">
            Aquests arxius són documentació, backups i eines de desenvolupament.
            <strong className="text-green-600"> NO són necessaris per al funcionament del web</strong> en producció.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Browser */}
          <div className="space-y-6">
            {/* Documentation */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Documentació (5 arxius)
              </h2>
              <div className="space-y-2">
                {files.documentation.map(file => (
                  <FileButton key={file.path} file={file} onSelect={loadFile} selected={selectedFile?.path === file.path} />
                ))}
              </div>
            </div>

            {/* Data Files */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Table className="w-5 h-5 text-emerald-500" />
                Dades CSV (2 arxius)
              </h2>
              <div className="space-y-2">
                {files.data.map(file => (
                  <FileButton key={file.path} file={file} onSelect={loadFile} selected={selectedFile?.path === file.path} />
                ))}
              </div>
            </div>

            {/* Scripts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-500" />
                Scripts (2 arxius)
              </h2>
              <div className="space-y-2">
                {files.scripts.map(file => (
                  <FileButton key={file.path} file={file} onSelect={loadFile} selected={selectedFile?.path === file.path} />
                ))}
              </div>
            </div>

            {/* Debug */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-500" />
                Debug/Test (2 arxius)
              </h2>
              <div className="space-y-2">
                {files.debug.map(file => (
                  <FileButton key={file.path} file={file} onSelect={loadFile} selected={selectedFile?.path === file.path} />
                ))}
              </div>
            </div>

            {/* Config */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" />
                Configuració Dev (2 arxius)
              </h2>
              <div className="space-y-2">
                {files.config.map(file => (
                  <FileButton key={file.path} file={file} onSelect={loadFile} selected={selectedFile?.path === file.path} />
                ))}
              </div>
            </div>
          </div>

          {/* File Viewer */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {!selectedFile ? (
                <div className="text-center py-12 text-gray-400">
                  <Eye className="w-12 h-12 mx-auto mb-4" />
                  <p>Selecciona un arxiu per veure'n el contingut</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <selectedFile.icon className={`w-6 h-6 ${selectedFile.color}`} />
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedFile.name}</h3>
                        <p className="text-sm text-gray-500">{selectedFile.path}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(selectedFile)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      disabled={loading || !fileContent}
                    >
                      <Download className="w-4 h-4" />
                      Descarregar
                    </button>
                  </div>

                  <div className="max-h-[calc(100vh-300px)] overflow-auto">
                    {loading ? (
                      <div className="text-center py-8 text-gray-400">Carregant...</div>
                    ) : (
                      <pre className="text-xs font-mono bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
                        {fileContent}
                      </pre>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Impact Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            ℹ️ Aquests arxius entorpeixen el projecte?
          </h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>NO</strong>, per les següents raons:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>No es carreguen en temps d'execució</strong> - El navegador no els descarrega</li>
              <li><strong>No augmenten el bundle size</strong> - Vite no els inclou al build de producció</li>
              <li><strong>Només ocupen espai al disc</strong> - Aprox. 500KB en total</li>
              <li><strong>Útils per manteniment</strong> - Documentació de com funciona el sistema</li>
              <li><strong>Fàcils d'eliminar</strong> - Es poden esborrar sense afectar el funcionament</li>
            </ul>
            <p className="mt-3 pt-3 border-t border-blue-200">
              <strong>Recomanació:</strong> Mantenir-los si fas desenvolupament. Eliminar-los si només vols un projecte net.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FileButton = ({ file, onSelect, selected }) => {
  const Icon = file.icon;
  return (
    <button
      onClick={() => onSelect(file)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        selected
          ? 'bg-blue-50 border-2 border-blue-300'
          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
      }`}
    >
      <Icon className={`w-5 h-5 ${file.color}`} />
      <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
    </button>
  );
};

export default DocumentationFilesPage;
