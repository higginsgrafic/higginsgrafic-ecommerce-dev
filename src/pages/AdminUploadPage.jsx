import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Folder, Archive, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import SEO from '@/components/SEO';
import { uploadFileToPath } from '@/api/storage';
import { supabase } from '@/api/supabase-products';

const AdminUploadPage = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [completed, setCompleted] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [uploadRuns, setUploadRuns] = useState([]);

  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupError, setCleanupError] = useState(null);
  const [cleanupReport, setCleanupReport] = useState(null);
  const [cleanupConfirmText, setCleanupConfirmText] = useState('');

  const [copyStatus, setCopyStatus] = useState(null);

  const folderInputRef = useRef(null);

  const isZipFile = (file) => {
    const name = (file?.name || '').toLowerCase();
    return file?.type === 'application/zip' || name.endsWith('.zip');
  };

  const extractZipFiles = async (zipFile) => {
    const zip = await JSZip.loadAsync(zipFile);
    const out = [];

    const entries = Object.values(zip.files || {});
    for (const entry of entries) {
      if (!entry || entry.dir) continue;

      const blob = await entry.async('blob');
      const fileName = (entry.name || '').split('/').filter(Boolean).pop() || 'file';
      const file = new File([blob], fileName, { type: blob.type || '' });
      file.webkitRelativePath = entry.name;
      out.push(file);
    }

    return out;
  };

  // Funció recursiva per processar carpetes
  const processEntry = async (entry, entryPath = '') => {
    if (entry.isFile) {
      const file = await new Promise((resolve, reject) => {
        try {
          entry.file(resolve);
        } catch (err) {
          reject(err);
        }
      });

      file.webkitRelativePath = entryPath + file.name;
      return [file];
    }

    if (entry.isDirectory) {
      const reader = entry.createReader();
      const readAllEntries = async () => {
        const all = [];
        while (true) {
          const batch = await new Promise((resolve, reject) => {
            try {
              reader.readEntries(resolve);
            } catch (err) {
              reject(err);
            }
          });

          if (!batch || batch.length === 0) break;
          all.push(...batch);
        }
        return all;
      };

      const entries = await readAllEntries();
      const nested = await Promise.all(
        entries.map(child => processEntry(child, entryPath + child.name + '/'))
      );
      return nested.flat();
    }

    return [];
  };

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    console.log('Files dropped:', acceptedFiles);
    console.log('File rejections:', fileRejections);

    if (acceptedFiles.length === 0) {
      console.warn('No files were accepted');
      return;
    }

    const expanded = [];

    for (const file of acceptedFiles) {
      if (isZipFile(file)) {
        try {
          const zipFiles = await extractZipFiles(file);
          expanded.push(...zipFiles);
        } catch (err) {
          console.error('Zip extract error:', err);
          setUploadError(`Error descomprimint zip: ${file.name}`);
          return;
        }
      } else {
        expanded.push(file);
      }
    }

    const newFiles = expanded.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      type: isZipFile(file) ? 'archive' :
            file.type.startsWith('image/') ? 'image' : 'file',
      size: file.size,
      name: file.name,
      path: (() => {
        const rawPath = file.webkitRelativePath || file.name;
        if (!rawPath || rawPath.includes('/')) return rawPath;
        const suggested = suggestPathFromFilename(file.name);
        return suggested || rawPath;
      })()
    }));

    console.log('Processed files:', newFiles);
    setFiles(prev => [...prev, ...newFiles]);
    setUploadError(null);
  }, []);

  const needsManualPath = (path) => {
    if (!path) return true;
    if (isIgnorablePath(path)) return false;
    return !parsePath(path);
  };

  const updateFilePath = (id, nextPath) => {
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, path: nextPath } : f)));
  };

  const toTitleCase = (value) => {
    return (value || '')
      .toString()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const suggestPathFromFilename = (fileName) => {
    const name = (fileName || '').toString().trim();
    if (!name) return null;

    const base = name.replace(/\.[^.]+$/, '');
    const tokens = base
      .split(/[-_]+/)
      .map(t => t.trim())
      .filter(Boolean);

    if (tokens.length < 2) return null;

    const knownCollections = new Set(['outcasted', 'first', 'contact', 'first-contact', 'austen', 'cube', 'the', 'human', 'inside', 'the-human-inside', 'grafic']);

    let collection = null;
    if (tokens[0] === 'first' && tokens[1] === 'contact') {
      collection = 'first-contact';
    } else if (tokens[0] === 'the' && tokens[1] === 'human' && tokens[2] === 'inside') {
      collection = 'the-human-inside';
    } else if (tokens[0] === 'first-contact' || tokens[0] === 'the-human-inside') {
      collection = tokens[0];
    } else if (knownCollections.has(tokens[0])) {
      collection = tokens[0];
    }

    const colorTokenToCanonical = (t) => {
      const v = (t || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (v === 'blanc' || v === 'white') return 'Blanc';
      if (v === 'negre' || v === 'black') return 'Negre';
      if (v === 'vermell' || v === 'red') return 'Vermell';
      if (v.includes('militar') || v.includes('military')) return 'Militar';
      if (v.includes('forest')) return 'Forest';
      if (v.includes('royal')) return 'Royal';
      if (v.includes('navy') || v.includes('marina')) return 'Navy';
      return null;
    };

    let color = null;
    let colorIdx = -1;
    for (let i = tokens.length - 1; i >= 0; i--) {
      const c = colorTokenToCanonical(tokens[i]);
      if (c) {
        color = c;
        colorIdx = i;
        break;
      }
    }

    if (!collection || !color) return null;

    const startIdx = collection === 'first-contact' ? 2 : collection === 'the-human-inside' ? 3 : 1;
    const designTokens = tokens.slice(startIdx, colorIdx >= 0 ? colorIdx : undefined);
    const designRaw = designTokens.join(' ').trim();
    const designName = toTitleCase(designRaw || 'Design');

    return `${collection}/${designName}/${color}/${name}`;
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    noKeyboard: true,
    useFsAccessApi: false, // Desactivar API de sistema de fitxers per millor compatibilitat
    getFilesFromEvent: async (event) => {
      const inputFiles = event?.target?.files;
      if (inputFiles && inputFiles.length > 0) {
        return Array.from(inputFiles);
      }

      const files = [];
      const items = event.dataTransfer?.items;
      
      if (items) {
        // Processar carpetes i fitxers
        const promises = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.kind === 'file') {
            const entry = item.webkitGetAsEntry();
            if (entry) {
              promises.push(processEntry(entry));
            }
          }
        }

        const nested = await Promise.all(promises);
        files.push(...nested.flat());
      }
      
      return files.length > 0 ? files : Array.from(event.dataTransfer?.files || []);
    }
  });

  const onFolderSelected = useCallback((event) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;

    const newFiles = selected.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      type: file.type === 'application/zip' ? 'archive' :
            file.type.startsWith('image/') ? 'image' : 'file',
      size: file.size,
      name: file.name,
      path: file.webkitRelativePath || file.name
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setUploadError(null);
    event.target.value = '';
  }, []);

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setCompleted(prev => prev.filter(f => f.id !== id));
  };

  const hasInvalidPaths = files.some(f => needsManualPath(f.path));

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const slugify = (value) => {
    return (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const inferCategoryFromDesignName = (designName) => {
    const v = (designName || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (v.includes('tote bag') || v.includes('[tote bag]') || v.includes('totebag') || v.includes('tote-bag')) {
      return 'tote-bag';
    }

    if (v.includes('[tassa]') || v.includes(' tassa ') || v.endsWith(' tassa') || v.includes(' mug ') || v.endsWith(' mug') || v.includes('[mug]')) {
      return 'mug';
    }

    return 'apparel';
  };

  const normalizeToCanonicalColor = (value) => {
    const v = (value || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (!v) return null;
    if (v === 'blanc' || v === 'white') return 'Blanc';
    if (v === 'negre' || v === 'black') return 'Negre';
    if (v === 'vermell' || v === 'red') return 'Vermell';
    if (v.includes('militar') || v.includes('military')) return 'Militar';
    if (v.includes('forest')) return 'Forest';
    if (v.includes('royal')) return 'Royal';
    if (v.includes('navy') || v.includes('marina')) return 'Navy';
    return null;
  };

  const mapColorToHex = (value) => {
    const v = normalizeToCanonicalColor(value);
    if (v === 'Blanc') return '#FFFFFF';
    if (v === 'Negre') return '#000000';
    if (v === 'Vermell') return '#D00000';
    if (v === 'Militar') return '#4B5320';
    if (v === 'Forest') return '#0B3D2E';
    if (v === 'Royal') return '#1F4EFF';
    if (v === 'Navy') return '#0A1F44';
    return null;
  };

  const inferShirtColorFromFileName = (fileName, fallbackColor = null) => {
    const base = (fileName || '').toString().trim().replace(/\.[^.]+$/, '');
    if (!base) return fallbackColor;
    const tokens = base
      .split(/[-_\s]+/)
      .map(t => t.trim())
      .filter(Boolean);
    for (let i = tokens.length - 1; i >= 0; i--) {
      const c = normalizeToCanonicalColor(tokens[i]);
      if (c) return c;
    }
    return fallbackColor;
  };

  const toSnakeCase = (value) => {
    const s = String(value || '').trim();
    if (!s) return '';
    return s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_');
  };

  const toKebabCaseFileName = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const parts = raw.split('/').filter(Boolean);
    const joined = parts.join('-');

    const dotIdx = joined.lastIndexOf('.');
    const base = dotIdx > 0 ? joined.slice(0, dotIdx) : joined;
    const ext = dotIdx > 0 ? joined.slice(dotIdx + 1) : '';

    const kebabBase = base
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');

    const kebabExt = ext
      ? ext
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
      : '';

    if (kebabExt) return `${kebabBase}.${kebabExt}`;
    return kebabBase;
  };

  const normalizeUploadPath = (parsed) => {
    const collection = toSnakeCase(parsed?.collection);
    const designName = toSnakeCase(parsed?.designName);
    const color = toSnakeCase(parsed?.color);
    const fileName = toKebabCaseFileName(parsed?.fileName);
    if (!collection || !designName || !color || !fileName) return null;
    return `${collection}/${designName}/${color}/${fileName}`;
  };

  function parsePath(relativePath) {
    const normalized = (relativePath || '')
      .replace(/^\/+/, '')
      .replace(/\\/g, '/');

    const parts = normalized.split('/').filter(Boolean);
    if (parts.length < 4) return null;

    // Stable parsing: first segments are authoritative, remainder is the filename (or nested filename).
    // This prevents mis-parsing when a user uploads paths that contain extra slashes
    // (e.g. "Nom - Color/Samarreta").
    const [collection, designName, color, ...rest] = parts;
    const fileName = rest.join('/');

    return {
      collection,
      designName,
      color,
      fileName,
      normalizedPath: normalized
    };
  }

  function isIgnorablePath(relativePath) {
    const normalized = (relativePath || '').replace(/\\/g, '/');
    const fileName = normalized.split('/').pop() || '';

    if (!fileName) return true;
    if (fileName === '.DS_Store') return true;
    if (fileName === 'Thumbs.db') return true;
    if (normalized.includes('/__MACOSX/')) return true;
    if (fileName.startsWith('._')) return true;
    return false;
  }

  const formatUploadError = (err) => {
    if (!err) return 'Upload error';
    if (typeof err === 'string') return err;
    
    if (err instanceof Error) return err.message || 'Upload error';

    const maybeSupabase = {
      name: err.name,
      message: err.message,
      details: err.details,
      hint: err.hint,
      code: err.code,
      status: err.status,
      statusCode: err.statusCode,
      error: err.error
    };

    const hasSupabaseFields = Object.values(maybeSupabase).some(v => !!v);
    if (hasSupabaseFields) {
      return [
        maybeSupabase.name ? `${maybeSupabase.name}: ${maybeSupabase.message || ''}`.trim() : maybeSupabase.message,
        maybeSupabase.statusCode ? `statusCode: ${maybeSupabase.statusCode}` : null,
        maybeSupabase.status ? `status: ${maybeSupabase.status}` : null,
        maybeSupabase.code ? `code: ${maybeSupabase.code}` : null,
        maybeSupabase.details ? `details: ${maybeSupabase.details}` : null,
        maybeSupabase.hint ? `hint: ${maybeSupabase.hint}` : null
      ]
        .filter(Boolean)
        .join(' | ');
    }

    try {
      const props = Object.getOwnPropertyNames(err);
      if (props.length > 0) {
        const out = {};
        for (const k of props) out[k] = err[k];
        return JSON.stringify(out);
      }
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadProgress({});
    setCompleted([]);
    setUploadError(null);

    const runId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const startedAt = new Date().toISOString();
    const run = {
      id: runId,
      startedAt,
      endedAt: null,
      status: 'running',
      items: []
    };

    try {
      const completedIds = [];

      for (const fileData of files) {
        const targetPath = fileData.path || fileData.name;
        const itemLog = {
          fileId: fileData.id,
          fileName: fileData.name,
          targetPath,
          startedAt: new Date().toISOString(),
          endedAt: null,
          status: 'running',
          url: null,
          error: null
        };

        run.items.push(itemLog);

        setUploadProgress(prev => ({ ...prev, [fileData.id]: 5 }));

        if (isIgnorablePath(targetPath)) {
          setUploadProgress(prev => ({ ...prev, [fileData.id]: 100 }));
          completedIds.push(fileData.id);
          itemLog.status = 'skipped';
          itemLog.endedAt = new Date().toISOString();
          continue;
        }

        const parsed = parsePath(targetPath);
        if (!parsed) {
          const e = new Error(`Invalid path structure: ${targetPath} (expected: Collection/DesignName/Color/file)`);
          itemLog.status = 'error';
          itemLog.error = formatUploadError(e);
          itemLog.endedAt = new Date().toISOString();
          throw e;
        }

        const normalizedUploadPath = normalizeUploadPath(parsed);
        if (!normalizedUploadPath) {
          const e = new Error(`Invalid normalized path for: ${targetPath}`);
          itemLog.status = 'error';
          itemLog.error = formatUploadError(e);
          itemLog.endedAt = new Date().toISOString();
          throw e;
        }

        setUploadProgress(prev => ({ ...prev, [fileData.id]: 10 }));
        const uploadResult = await uploadFileToPath(fileData.file, normalizedUploadPath, { upsert: true, viaEdge: true });

        if (!uploadResult.success) {
          const e = new Error(uploadResult.error || `Upload failed for ${targetPath}`);
          itemLog.status = 'error';
          itemLog.error = formatUploadError(e);
          itemLog.endedAt = new Date().toISOString();
          throw e;
        }

        itemLog.url = uploadResult.url;

        setUploadProgress(prev => ({ ...prev, [fileData.id]: 60 }));

        const designSlug = slugify(parsed.designName);
        const collectionSlug = slugify(parsed.collection);
        const productSlug = `${collectionSlug}-${designSlug}`;
        const inferredCategory = inferCategoryFromDesignName(parsed.designName);

        const { data: productRow, error: productError } = await supabase
          .from('products')
          .upsert(
            {
              slug: productSlug,
              name: parsed.designName,
              collection: collectionSlug,
              is_active: true,
              category: inferredCategory
            },
            { onConflict: 'slug' }
          )
          .select('id, image, description, price, currency, category')
          .single();

        if (productError) {
          itemLog.status = 'error';
          itemLog.error = formatUploadError(productError);
          itemLog.endedAt = new Date().toISOString();
          throw productError;
        }

        {
          const preferredOrder = ['Blanc', 'Vermell', 'Militar', 'Forest', 'Royal', 'Navy', 'Negre'];
          const folderColor = normalizeToCanonicalColor(parsed.color);
          const canonicalColor = inferShirtColorFromFileName(parsed.fileName, folderColor);
          const position = canonicalColor ? preferredOrder.indexOf(canonicalColor) : -1;
          const finalPosition = position >= 0 ? position : 999;

          const { data: existingImageRow, error: existingImageError } = await supabase
            .from('product_images')
            .select('id')
            .eq('product_id', productRow.id)
            .eq('url', uploadResult.url)
            .maybeSingle();

          if (existingImageError) {
            itemLog.status = 'error';
            itemLog.error = formatUploadError(existingImageError);
            itemLog.endedAt = new Date().toISOString();
            throw existingImageError;
          }

          if (existingImageRow?.id) {
            const { error: updateImageError } = await supabase
              .from('product_images')
              .update({ position: finalPosition })
              .eq('id', existingImageRow.id);

            if (updateImageError) {
              itemLog.status = 'error';
              itemLog.error = formatUploadError(updateImageError);
              itemLog.endedAt = new Date().toISOString();
              throw updateImageError;
            }
          } else {
            const { error: insertImageError } = await supabase
              .from('product_images')
              .insert({
                product_id: productRow.id,
                url: uploadResult.url,
                position: finalPosition
              });

            if (insertImageError) {
              itemLog.status = 'error';
              itemLog.error = formatUploadError(insertImageError);
              itemLog.endedAt = new Date().toISOString();
              throw insertImageError;
            }
          }
        }

        if (!productRow?.image) {
          await supabase
            .from('products')
            .update({ image: uploadResult.url })
            .eq('id', productRow.id);
        }

        if (!productRow?.description || !productRow?.price || !productRow?.currency || !productRow?.category) {
          const patch = {
            ...(productRow?.description ? {} : { description: parsed.designName }),
            ...(productRow?.price ? {} : { price: 29.99 }),
            ...(productRow?.currency ? {} : { currency: 'EUR' }),
            ...(productRow?.category ? {} : { category: inferredCategory })
          };

          if (Object.keys(patch).length > 0) {
            await supabase
              .from('products')
              .update(patch)
              .eq('id', productRow.id);
          }
        }

        const sizesToEnsure = inferredCategory === 'apparel' ? ['S', 'M', 'L', 'XL'] : ['UNI'];
        const folderColor = normalizeToCanonicalColor(parsed.color);
        const canonicalColor = inferShirtColorFromFileName(parsed.fileName, folderColor) || parsed.color;
        const colorHex = mapColorToHex(canonicalColor);
        for (const variantSize of sizesToEnsure) {
          const variantSku = `${productSlug}-${slugify(parsed.color)}-${variantSize}`;

          const { data: existingVariant, error: findVariantError } = await supabase
            .from('product_variants')
            .select('id')
            .eq('product_id', productRow.id)
            .eq('size', variantSize)
            .eq('color', canonicalColor)
            .eq('design', parsed.designName)
            .maybeSingle();

          if (findVariantError) {
            itemLog.status = 'error';
            itemLog.error = formatUploadError(findVariantError);
            itemLog.endedAt = new Date().toISOString();
            throw findVariantError;
          }

          if (existingVariant?.id) {
            const { error: updateVariantError } = await supabase
              .from('product_variants')
              .update({
                image_url: uploadResult.url,
                sku: variantSku,
                color_hex: colorHex,
                is_available: true
              })
              .eq('id', existingVariant.id);

            if (updateVariantError) {
              itemLog.status = 'error';
              itemLog.error = formatUploadError(updateVariantError);
              itemLog.endedAt = new Date().toISOString();
              throw updateVariantError;
            }
          } else {
            const { error: insertVariantError } = await supabase
              .from('product_variants')
              .insert({
                product_id: productRow.id,
                size: variantSize,
                color: canonicalColor,
                color_hex: colorHex,
                design: parsed.designName,
                sku: variantSku,
                image_url: uploadResult.url,
                is_available: true
              });

            if (insertVariantError) {
              itemLog.status = 'error';
              itemLog.error = formatUploadError(insertVariantError);
              itemLog.endedAt = new Date().toISOString();
              throw insertVariantError;
            }
          }
        }

        setUploadProgress(prev => ({ ...prev, [fileData.id]: 100 }));
        completedIds.push(fileData.id);
        itemLog.status = 'success';
        itemLog.endedAt = new Date().toISOString();
      }

      setCompleted(completedIds);
      console.log('Files uploaded:', files);

      run.status = 'success';
      run.endedAt = new Date().toISOString();
      setUploadRuns(prev => [run, ...prev].slice(0, 50));
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(formatUploadError(err));

      run.status = 'error';
      run.endedAt = new Date().toISOString();
      setUploadRuns(prev => [run, ...prev].slice(0, 50));
    } finally {
      setUploading(false);
    }
  };

  const legacyCopyViaTextarea = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = String(text || '');
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand && document.execCommand('copy');
    document.body.removeChild(textarea);
    return Boolean(ok);
  };

  const copyTextToClipboard = async (txt) => {
    const text = String(txt || '');
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fallthrough
    }
    try {
      return legacyCopyViaTextarea(text);
    } catch {
      return false;
    }
  };

  const runCopy = async (label, txt) => {
    const ok = await copyTextToClipboard(txt);
    setCopyStatus({ label, ok, at: Date.now() });
    window.clearTimeout(runCopy._t);
    runCopy._t = window.setTimeout(() => setCopyStatus(null), 2500);
  };

  const copyUploadLogToClipboard = async () => {
    await runCopy('upload-log', JSON.stringify(uploadRuns, null, 2));
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'archive':
        return <Archive className="w-5 h-5 text-orange-500" />;
      case 'image':
        return <File className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const canonicalCollectionsToPurge = ['first-contact', 'outcasted'];
  const dbCollectionKeysToMatch = ['first-contact', 'first_contact', 'outcasted'];

  const deriveStoragePathFromPublicUrl = (url) => {
    try {
      const u = new URL(url);
      const marker = '/storage/v1/object/public/media/';
      const idx = u.pathname.indexOf(marker);
      if (idx === -1) return null;
      const path = u.pathname.slice(idx + marker.length);
      return decodeURIComponent(path);
    } catch {
      return null;
    }
  };

  const chunkArray = (arr, size) => {
    const out = [];
    for (let i = 0; i < (arr || []).length; i += size) {
      out.push(arr.slice(i, i + size));
    }
    return out;
  };

  const buildCleanupReport = async () => {
    const slugMatchers = canonicalCollectionsToPurge.map((c) => `slug.ilike.${c}-%`).join(',');

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, slug, collection')
      .or(`collection.in.(${dbCollectionKeysToMatch.join(',')}),${slugMatchers}`);

    if (productsError) throw productsError;

    const productIds = (products || []).map((p) => p.id).filter(Boolean);
    if (productIds.length === 0) {
      return {
        products: [],
        productIds: [],
        productImages: [],
        productVariants: [],
        storagePaths: []
      };
    }

    const { data: productImages, error: imagesError } = await supabase
      .from('product_images')
      .select('id, product_id, url')
      .in('product_id', productIds);

    if (imagesError) throw imagesError;

    const { data: productVariants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, product_id')
      .in('product_id', productIds);

    if (variantsError) throw variantsError;

    const storagePaths = [...new Set(
      (productImages || [])
        .map((img) => deriveStoragePathFromPublicUrl(img?.url))
        .filter(Boolean)
    )];

    return {
      products: products || [],
      productIds,
      productImages: productImages || [],
      productVariants: productVariants || [],
      storagePaths
    };
  };

  const runCleanupDryRun = async () => {
    setCleanupLoading(true);
    setCleanupError(null);
    try {
      const report = await buildCleanupReport();
      setCleanupReport(report);
    } catch (err) {
      setCleanupError(formatUploadError(err));
    } finally {
      setCleanupLoading(false);
    }
  };

  const runCleanupExecute = async () => {
    const expected = 'DELETE FIRST-CONTACT OUTCASTED';
    if (cleanupConfirmText.trim().toUpperCase() !== expected) {
      setCleanupError(`Escriu exactament: ${expected}`);
      return;
    }

    setCleanupLoading(true);
    setCleanupError(null);
    try {
      const report = cleanupReport || await buildCleanupReport();
      const productIds = report.productIds || [];

      if (report.storagePaths?.length) {
        const batches = chunkArray(report.storagePaths, 100);
        for (const batch of batches) {
          const { error: removeError } = await supabase.storage
            .from('media')
            .remove(batch);
          if (removeError) throw removeError;
        }
      }

      if (productIds.length) {
        const { error: delVariantsErr } = await supabase
          .from('product_variants')
          .delete()
          .in('product_id', productIds);
        if (delVariantsErr) throw delVariantsErr;

        const { error: delImagesErr } = await supabase
          .from('product_images')
          .delete()
          .in('product_id', productIds);
        if (delImagesErr) throw delImagesErr;

        const { error: delProductsErr } = await supabase
          .from('products')
          .delete()
          .in('id', productIds);
        if (delProductsErr) throw delProductsErr;
      }

      setCleanupConfirmText('');
      const refreshed = await buildCleanupReport();
      setCleanupReport(refreshed);
    } catch (err) {
      setCleanupError(formatUploadError(err));
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <>
      <SEO title="Upload de Fitxers - Admin" />
      <div className="h-screen overflow-y-auto bg-gray-50 p-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload de Fitxers</h1>
            <p className="text-gray-600">Pugeu fitxers, arxius .zip i carpetes al sistema</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="min-w-[260px]">
                <h2 className="text-lg font-semibold text-gray-900">Neteja col·leccions (First Contact + Outcasted)</h2>
                <p className="text-sm text-gray-600 mt-1">Esborra productes, variants, imatges i fitxers del bucket <span className="font-mono">media</span>. Primer fes dry-run.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={runCleanupDryRun}
                  disabled={cleanupLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-60"
                >
                  {cleanupLoading ? 'Carregant...' : 'Dry-run'}
                </button>
                <button
                  type="button"
                  onClick={runCleanupExecute}
                  disabled={cleanupLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {cleanupLoading ? 'Esborrant...' : 'Delete for real'}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmació (obligatòria per esborrar)</label>
              <input
                value={cleanupConfirmText}
                onChange={(e) => setCleanupConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-mono"
                placeholder="DELETE FIRST-CONTACT OUTCASTED"
              />
            </div>

            {cleanupError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-medium text-red-900">Error neteja</div>
                  <button
                    type="button"
                    onClick={() => runCopy('cleanup-error', cleanupError)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-900 rounded hover:bg-red-200 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
                <pre className="mt-2 text-sm text-red-800 font-mono whitespace-pre-wrap break-all max-h-56 overflow-auto">{cleanupError}</pre>
              </div>
            )}

            {cleanupReport && (
              <div className="mt-4">
                <div className="flex items-center justify-end mb-3">
                  <button
                    type="button"
                    onClick={() => runCopy('cleanup-report', JSON.stringify(cleanupReport, null, 2))}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors"
                  >
                    Copiar report (JSON)
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold text-gray-900 mb-2">Resum</div>
                    <div>Products: <span className="font-mono">{cleanupReport.products.length}</span></div>
                    <div>Variants: <span className="font-mono">{cleanupReport.productVariants.length}</span></div>
                    <div>Product images: <span className="font-mono">{cleanupReport.productImages.length}</span></div>
                    <div>Storage paths: <span className="font-mono">{cleanupReport.storagePaths.length}</span></div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">Mostra (primeres 10 rutes)</div>
                  <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all max-h-40 overflow-auto">
                    {(cleanupReport.storagePaths || []).slice(0, 10).join('\n') || '(cap fitxer detectat via product_images.url)'}
                  </pre>
                </div>
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-red-900 mb-1">Error durant l'upload</h3>
                  <div className="flex items-start justify-between gap-3">
                    <pre className="text-sm text-red-800 font-mono whitespace-pre-wrap break-all max-h-56 overflow-auto flex-1">{uploadError}</pre>
                    <button
                      type="button"
                      onClick={() => runCopy('upload-error', uploadError)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-900 rounded hover:bg-red-200 transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {copyStatus && (
            <div className={`mb-6 border rounded-lg p-3 text-sm ${copyStatus.ok ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
              {copyStatus.ok ? 'Copiat al porta-retalls.' : 'No s\'ha pogut copiar (el navegador ho ha bloquejat).'}
            </div>
          )}

          {files.length > 0 && hasInvalidPaths && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-700 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-900 mb-1">Falten rutes vàlides</h3>
                  <p className="text-sm text-yellow-800">Abans de pujar, cada fitxer ha de tenir una ruta amb el format: Collection/DesignName/Color/file</p>
                </div>
              </div>
            </div>
          )}

          {/* Dropzone */}
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-8 mb-6">
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <input
                ref={folderInputRef}
                type="file"
                multiple
                webkitdirectory=""
                directory=""
                style={{ display: 'none' }}
                onChange={onFolderSelected}
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Deixa anar els fitxers aquí...</p>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    Arrossega fitxers aquí
                  </p>
                  <p className="text-sm text-gray-500">
                    Suporta fitxers individuals, .zip i carpetes
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={open}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Seleccioneu fitxers
                    </button>
                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Seleccioneu carpeta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Fitxers seleccionats ({files.length})</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
                {files.map(fileData => (
                  <div key={fileData.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getFileIcon(fileData.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fileData.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(fileData.size)}
                        </p>
                        <p className="text-xs text-gray-400 font-mono break-all">
                          {needsManualPath(fileData.path) ? (
                            <input
                              value={fileData.path}
                              onChange={(e) => updateFilePath(fileData.id, e.target.value)}
                              className="w-full px-2 py-1 border border-red-300 rounded bg-white text-gray-800"
                              placeholder="Collection/DesignName/Color/file"
                            />
                          ) : (
                            fileData.path
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {uploading && (
                        <div className="w-32">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[fileData.id] || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-10">
                              {Math.round(uploadProgress[fileData.id] || 0)}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {completed.includes(fileData.id) && (
                        <Check className="w-5 h-5 text-green-500" />
                      )}
                      
                      {!uploading && (
                        <button
                          onClick={() => removeFile(fileData.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {files.length > 0 && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setFiles([])}
                disabled={uploading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Netejar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || hasInvalidPaths}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{uploading ? 'Pujant...' : 'Pugeu fitxers'}</span>
              </button>
            </div>
          )}

          {uploadRuns.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-900">Registre d'Uploads ({uploadRuns.length})</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyUploadLogToClipboard}
                    className="px-3 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Copiar JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadRuns([])}
                    className="px-3 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Esborrar
                  </button>
                </div>
              </div>

              <div className="max-h-[45vh] overflow-y-auto divide-y divide-gray-100">
                {uploadRuns.map(run => (
                  <div key={run.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {run.status === 'success' ? '✅' : run.status === 'error' ? '❌' : '⏳'} {run.startedAt}
                        </div>
                        <div className="text-xs text-gray-500 font-mono break-all">{run.id}</div>
                      </div>
                      <div className="text-sm text-gray-700">
                        {run.items?.length || 0} fitxer(s)
                      </div>
                    </div>

                    {Array.isArray(run.items) && run.items.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {run.items.map((item, idx) => (
                          <div key={`${run.id}-${item.fileId}-${idx}`} className="rounded border border-gray-200 p-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-xs font-mono text-gray-900 break-all">
                                  {item.targetPath}
                                </div>
                                {item.url && (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-600 hover:underline break-all"
                                  >
                                    {item.url}
                                  </a>
                                )}
                                {item.error && (
                                  <div className="text-xs text-red-700 font-mono break-all">{item.error}</div>
                                )}
                              </div>
                              <div className="text-xs text-gray-700 whitespace-nowrap">
                                {item.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Informació d'Upload</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Suporta fitxers individuals de qualsevol tipus</li>
                  <li>• Podeu pujar arxius .zip comprimits</li>
                  <li>• Les carpetes es processaran mantenint l'estructura</li>
                  <li>• Els fitxers es guardaran al directori de uploads</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUploadPage;
