import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Video, Check, Folder, ChevronRight, Home } from 'lucide-react';
import { uploadFile, listFiles, getPublicUrl } from '@/api/storage';
import { useToast } from '@/components/ui/use-toast';

export default function MediaPicker({ isOpen, onClose, onSelect, mediaType = 'all' }) {
  const [activeTab, setActiveTab] = useState('library');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('');
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- (02/10/2026) loadFiles es recrea a cada render; la entrada reactiva real es isOpen/currentFolder (recarrega en obrir i en canviar de carpeta)
  }, [isOpen, currentFolder]);

  const loadFiles = async () => {
    setLoading(true);
    const result = await listFiles(currentFolder);
    if (result.success) {
      const filesWithUrls = result.files
        .map(file => {
          const filePath = currentFolder ? `${currentFolder}/${file.name}` : file.name;
          return {
            ...file,
            url: file.id ? getPublicUrl(filePath) : null,
            path: filePath,
            isFolder: !file.id
          };
        })
        .filter(file => {
          if (file.isFolder) return true;
          if (mediaType === 'image') return isImage(file.name);
          if (mediaType === 'video') return isVideo(file.name);
          return isImage(file.name) || isVideo(file.name);
        });
      setFiles(filesWithUrls);
    }
    setLoading(false);
  };

  const isImage = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
  };

  const isVideo = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext);
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = [...e.target.files];
    const validFiles = selectedFiles.filter(file => {
      if (mediaType === 'image') return file.type.startsWith('image/');
      if (mediaType === 'video') return file.type.startsWith('video/');
      return file.type.startsWith('image/') || file.type.startsWith('video/');
    });

    if (validFiles.length === 0) {
      toast({
        title: 'Format no vàlid',
        description: `Si us plau, seleccioneu ${mediaType === 'image' ? 'imatges' : mediaType === 'video' ? 'vídeos' : 'imatges o vídeos'}`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    for (const file of validFiles) {
      const result = await uploadFile(file, currentFolder);
      if (result.success) {
        const filePath = currentFolder ? `${currentFolder}/${file.name}` : file.name;
        const url = getPublicUrl(filePath);

        toast({
          title: 'Fitxer pujat',
          description: `${file.name} s'ha pujat correctament`,
        });

        setSelectedFile({ name: file.name, url, path: filePath });
      } else {
        toast({
          title: 'Error',
          description: `No s'ha pogut pujar ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    setUploading(false);
    await loadFiles();
    setActiveTab('library');
  };

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile.url);
      onClose();
    }
  };

  const navigateToFolder = (folderName) => {
    const newPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-pure/50" onClick={onClose}>
      <div
        className="bg-paper rounded-lg shadow-xl max-w-5xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            Seleccioneu {mediaType === 'image' ? 'imatge' : mediaType === 'video' ? 'vídeo' : 'mèdia'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-paper-soft rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'library'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-ink-2 hover:bg-paper-soft'
            }`}
          >
            Biblioteca
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-ink-2 hover:bg-paper-soft'
            }`}
          >
            Pugeu-ne un de nou
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'library' ? (
            <>
              <div className="flex items-center gap-2 text-sm mb-4 p-2 bg-paper-soft rounded">
                <button
                  onClick={navigateToRoot}
                  className={`p-1.5 hover:bg-paper-tint rounded ${!currentFolder ? 'bg-paper-tint' : ''}`}
                  title="Arrel"
                >
                  <Home className="w-4 h-4" />
                </button>
                {currentFolder && (
                  <>
                    <ChevronRight className="w-4 h-4 text-muted-2" />
                    {currentFolder.split('/').map((folder, idx, arr) => (
                      <React.Fragment key={idx}>
                        <span className="text-ink-2 font-medium">{folder}</span>
                        {idx < arr.length - 1 && <ChevronRight className="w-4 h-4 text-muted-2" />}
                      </React.Fragment>
                    ))}
                  </>
                )}
                {currentFolder && (
                  <button
                    onClick={navigateUp}
                    className="ml-auto px-3 py-1 text-sm bg-paper-tint hover:bg-muted-foreground rounded"
                  >
                    Amunt
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink-strong"></div>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="mx-auto h-12 w-12 text-muted-2 mb-4" />
                  <h3 className="text-lg font-medium text-ink-strong mb-2">Carpeta buida</h3>
                  <p className="text-ink-2">No hi ha fitxers disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {files.map((file) => (
                    <div
                      key={file.name}
                      className={`relative bg-paper-soft rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedFile?.path === file.path
                          ? 'ring-2 ring-blue-500'
                          : 'hover:ring-2 hover:ring-line-strong'
                      }`}
                      onClick={() => file.isFolder ? navigateToFolder(file.name) : setSelectedFile(file)}
                    >
                      <div className="aspect-square flex items-center justify-center">
                        {file.isFolder ? (
                          <div className="flex flex-col items-center justify-center w-full h-full hover:bg-paper-tint transition-colors">
                            <Folder className="w-12 h-12 text-blue-500 mb-1" />
                            <span className="text-xs font-medium text-ink-2 px-2 text-center truncate max-w-full">
                              {file.name}
                            </span>
                          </div>
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
                            <div className="absolute inset-0 bg-ink-pure/20 flex items-center justify-center pointer-events-none">
                              <Video className="w-8 h-8 text-paper" />
                            </div>
                          </>
                        ) : null}
                      </div>
                      {!file.isFolder && selectedFile?.path === file.path && (
                        <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-1">
                          <Check className="w-4 h-4 text-paper" />
                        </div>
                      )}
                      {!file.isFolder && (
                        <div className="p-1.5 bg-paper border-t">
                          <p className="text-xs text-ink-2 truncate" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="border-2 border-dashed border-line-strong rounded-lg p-12 w-full max-w-md text-center hover:border-muted-2 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-muted-2 mb-4" />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium text-lg">
                    Feu clic per seleccionar
                  </span>
                  <span className="text-ink-2 text-lg"> o arrossegueu fitxers aquí</span>
                </label>
                <input
                  ref={fileInputRef}
                  id="media-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept={
                    mediaType === 'image' ? 'image/*' :
                    mediaType === 'video' ? 'video/*' :
                    'image/*,video/*'
                  }
                  onChange={handleFileSelect}
                />
                <p className="text-sm text-ink-soft mt-4">
                  {mediaType === 'image' ? 'Imatges fins a 50MB' :
                   mediaType === 'video' ? 'Vídeos fins a 50MB' :
                   'Imatges i vídeos fins a 50MB'}
                </p>
              </div>

              {uploading && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-md">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                    <p className="text-blue-900 font-medium">Pujant fitxers...</p>
                  </div>
                </div>
              )}

              {selectedFile && !uploading && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 w-full max-w-md">
                  <div className="flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    <p className="text-green-900 font-medium">Fitxer pujat: {selectedFile.name}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-paper-soft">
          <div className="text-sm text-ink-2">
            {selectedFile && (
              <span className="font-medium">Seleccionat: {selectedFile.name}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-ink-2 bg-paper border border-line-strong rounded-lg hover:bg-paper-soft transition-colors"
            >
              Cancel·lar
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedFile}
              className="px-4 py-2 bg-blue-600 text-paper rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Seleccioneu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
