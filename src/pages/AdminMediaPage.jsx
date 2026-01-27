import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Copy, Image as ImageIcon, Trash2, Check, Video, FileText, Music, Folder, FolderPlus, Home, ChevronRight } from 'lucide-react';
import { uploadFile, listFiles, deleteFile, getPublicUrl, createFolder } from '@/api/storage';
import { useToast } from '@/components/ui/use-toast';

export default function AdminMediaPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const loadFiles = async () => {
    setLoading(true);
    const result = await listFiles(currentFolder);
    if (result.success) {
      const filesWithUrls = result.files.map(file => {
        const filePath = currentFolder ? `${currentFolder}/${file.name}` : file.name;
        return {
          ...file,
          url: file.id ? getPublicUrl(filePath) : null,
          path: filePath,
          isFolder: !file.id
        };
      });
      setFiles(filesWithUrls);
    } else {
      toast({
        title: "Error",
        description: result.error || "No s'han pogut carregar els fitxers",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = [...e.dataTransfer.files];
    await handleFiles(droppedFiles);
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = [...e.target.files];
    await handleFiles(selectedFiles);
  };

  const handleFiles = async (filesList) => {
    const validFiles = filesList.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      const isPDF = file.type === 'application/pdf';
      return isImage || isVideo || isAudio || isPDF;
    });

    if (validFiles.length === 0) {
      toast({
        title: "Format no vàlid",
        description: "Si us plau, seleccioneu fitxers d'imatge, vídeo, àudio o PDF",
        variant: "destructive",
      });
      return;
    }

    if (filesList.length > validFiles.length) {
      toast({
        title: "Alguns fitxers s'han ignorat",
        description: `${filesList.length - validFiles.length} fitxer(s) no tenen un format vàlid`,
      });
    }

    setUploading(true);

    for (const file of validFiles) {
      const result = await uploadFile(file, currentFolder);
      if (result.success) {
        toast({
          title: "Fitxer pujat",
          description: `${file.name} s'ha pujat correctament`,
        });
      } else {
        toast({
          title: "Error",
          description: `No s'ha pogut pujar ${file.name}: ${result.error}`,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
    await loadFiles();
  };

  const handleCopyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "URL copiada",
        description: "L'enllaç s'ha copiat al portapapers",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "No s'ha pogut copiar l'URL",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (filePath) => {
    const fileName = filePath.split('/').pop();
    if (!window.confirm(`Segur que voleu esborrar "${fileName}"?`)) {
      return;
    }

    const result = await deleteFile(filePath);
    if (result.success) {
      toast({
        title: "Fitxer esborrat",
        description: `${fileName} s'ha esborrat correctament`,
      });
      await loadFiles();
    } else {
      toast({
        title: "Error",
        description: result.error || "No s'ha pogut esborrar el fitxer",
        variant: "destructive",
      });
    }
  };

  const isImage = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
  };

  const isVideo = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext);
  };

  const isAudio = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const folderPath = currentFolder
      ? `${currentFolder}/${newFolderName}`
      : newFolderName;

    const result = await createFolder(folderPath);

    if (result.success) {
      toast({
        title: "Carpeta creada",
        description: `La carpeta "${newFolderName}" s'ha creat correctament`,
      });
      setShowNewFolder(false);
      setNewFolderName('');
      await loadFiles();
    } else {
      toast({
        title: "Error",
        description: result.error || "No s'ha pogut crear la carpeta",
        variant: "destructive",
      });
    }
  };

  const navigateToFolder = (folderName) => {
    const newPath = currentFolder
      ? `${currentFolder}/${folderName}`
      : folderName;
    setCurrentFolder(newPath);
  };

  const navigateUp = () => {
    const parts = currentFolder.split('/');
    parts.pop();
    setCurrentFolder(parts.join('/'));
  };

  const navigateToRoot = () => {
    setCurrentFolder('');
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestor de Media</h1>
          <p className="text-gray-600">Pugeu, gestioneu i organitzeu els fitxers del lloc</p>
        </div>

        {/* Navegació de carpetes */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={navigateToRoot}
                className={`p-2 hover:bg-gray-100 rounded ${!currentFolder ? 'bg-gray-100' : ''}`}
                title="Arrel"
              >
                <Home className="w-4 h-4" />
              </button>
              {currentFolder && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  {currentFolder.split('/').map((folder, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span className="text-gray-700 font-medium">{folder}</span>
                      {idx < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Nova carpeta
            </button>
          </div>

          {showNewFolder && (
            <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nom de la carpeta"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
              />
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Crear
              </button>
              <button
                onClick={() => {
                  setShowNewFolder(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel·lar
              </button>
            </div>
          )}
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-12 mb-8 transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Feu clic per seleccionar
                </span>
                <span className="text-gray-600"> o arrossegueu fitxers aquí</span>
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*,audio/*,application/pdf"
                onChange={handleFileSelect}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Imatges, vídeos, àudio i PDFs fins a 50MB
            </p>
            {currentFolder && (
              <p className="text-sm text-blue-600 mt-1 font-medium">
                Els fitxers es pujaran a: {currentFolder}
              </p>
            )}
          </div>
        </div>

        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-900 font-medium">Pujant fitxers...</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Carpeta buida</h3>
            <p className="text-gray-600">Comenceu pujant fitxers o creant subcarpetes</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                {files.length} {files.length === 1 ? 'element' : 'elements'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                    {file.isFolder ? (
                      <button
                        onClick={() => navigateToFolder(file.name)}
                        className="w-full h-full flex flex-col items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Folder className="w-16 h-16 text-blue-500 mb-2" />
                        <span className="text-sm font-medium text-gray-700 px-2 text-center">{file.name}</span>
                      </button>
                    ) : isImage(file.name) ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : isVideo(file.name) ? (
                      <>
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center pointer-events-none">
                          <Video className="w-12 h-12 text-white" />
                        </div>
                      </>
                    ) : isAudio(file.name) ? (
                      <div className="flex flex-col items-center justify-center w-full p-4">
                        <Music className="w-12 h-12 text-blue-500 mb-3" />
                        <p className="text-xs text-gray-600 text-center truncate w-full">{file.name}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-600 text-center px-2">{file.name.split('.').pop().toUpperCase()}</p>
                      </div>
                    )}
                  </div>

                  {!file.isFolder && (
                    <>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyUrl(file.url)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Copieu l'URL"
                          >
                            {copiedUrl === file.url ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-700" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(file.path)}
                            className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors"
                            title="Esborrar"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>

                      <div className="p-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600 truncate" title={file.name}>
                          {file.name}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
