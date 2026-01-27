import { useState } from 'react';
import { uploadFile, deleteFile } from '../api/storage';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

export default function FileUploader({ folder = 'uploads', onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const result = await uploadFile(file, folder);

    if (result.success) {
      setUploadedFile({
        url: result.url,
        path: result.path,
        name: file.name
      });
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } else {
      setError(result.error);
    }

    setUploading(false);
  };

  const handleDelete = async () => {
    if (!uploadedFile) return;

    const result = await deleteFile(uploadedFile.path);
    if (result.success) {
      setUploadedFile(null);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        {!uploadedFile ? (
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
              accept="image/*,video/*,audio/*,.pdf"
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer flex flex-col items-center ${
                uploading ? 'opacity-50' : ''
              }`}
            >
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700">
                {uploading ? 'Pujant fitxer...' : 'Clica per pujar un fitxer'}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Imatges, vídeos, àudio o PDFs
              </span>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 p-4 rounded">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {uploadedFile.name}
                </p>
                <a
                  href={uploadedFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Veure fitxer
                </a>
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {uploadedFile && (
        <div className="mt-3 p-3 bg-gray-50 rounded text-xs font-mono break-all">
          <p className="font-semibold mb-1">URL permanent:</p>
          <p className="text-gray-600">{uploadedFile.url}</p>
        </div>
      )}
    </div>
  );
}
