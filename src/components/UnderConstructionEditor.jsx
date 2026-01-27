import React, { useState, useEffect } from 'react';
import { supabase } from '@/api/supabase-products';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RotateCcw, Eye, Image as ImageIcon, Video, Palette, ExternalLink } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import GradientEditor from '@/components/GradientEditor';

export default function UnderConstructionEditor() {
  const [config, setConfig] = useState({
    backgroundType: 'color',
    videoUrl: '',
    imageUrl: '',
    backgroundColor: '#000000',
    gradientStops: null,
    gradientAngle: 180,
    title: 'Estem treballant en alguna cosa increïble',
    subtitle: 'Tornarem aviat',
    description: 'El nostre lloc web està en construcció. Estem treballant dur per oferir-vos la millor experiència.',
    buttonText: 'Tornar a l\'inici',
    buttonLink: '/',
    showButton: true,
    textColor: '#ffffff',
    redirectUrl: '',
    autoRedirect: false,
    globalRedirect: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [initialLoad, setInitialLoad] = useState(true);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState('all');
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('media_pages')
        .select('*')
        .eq('slug', 'default')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          backgroundType: data.background_type || 'color',
          videoUrl: data.video_url || '',
          imageUrl: data.image_url || '',
          backgroundColor: data.background_color || '#000000',
          gradientStops: data.gradient_stops || null,
          gradientAngle: data.gradient_angle ?? 180,
          title: data.title || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          buttonText: data.button_text || '',
          buttonLink: data.button_link || '/',
          showButton: data.show_button ?? true,
          textColor: data.text_color || '#ffffff',
          redirectUrl: data.redirect_url || '',
          autoRedirect: data.auto_redirect ?? false,
          globalRedirect: data.global_redirect ?? false
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut carregar la configuració',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    if (initialLoad) {
      return;
    }

    setAutoSaveStatus('saving');
    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    setAutoSaveStatus('saving');
    try {
      const { error } = await supabase
        .from('media_pages')
        .upsert({
          slug: 'default',
          background_type: config.backgroundType,
          video_url: config.videoUrl,
          image_url: config.imageUrl,
          background_color: config.backgroundColor,
          gradient_stops: config.gradientStops,
          gradient_angle: config.gradientAngle,
          title: config.title,
          subtitle: config.subtitle,
          description: config.description,
          button_text: config.buttonText,
          button_link: config.buttonLink,
          show_button: config.showButton,
          text_color: config.textColor,
          redirect_url: config.redirectUrl,
          auto_redirect: config.autoRedirect,
          global_redirect: config.globalRedirect,
          is_active: true
        }, {
          onConflict: 'slug'
        });

      if (error) throw error;

      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Error saving config:', error);
      setAutoSaveStatus('error');
      toast({
        title: 'Error',
        description: 'No s\'ha pogut desar la configuració',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Segur que voleu restaurar la configuració per defecte?')) {
      setConfig({
        backgroundType: 'color',
        videoUrl: '',
        imageUrl: '',
        backgroundColor: '#000000',
        gradientStops: null,
        gradientAngle: 180,
        title: 'Estem treballant en alguna cosa increïble',
        subtitle: 'Tornarem aviat',
        description: 'El nostre lloc web està en construcció. Estem treballant dur per oferir-vos la millor experiència.',
        buttonText: 'Tornar a l\'inici',
        buttonLink: '/',
        showButton: true,
        textColor: '#ffffff',
        redirectUrl: '',
        autoRedirect: false,
        globalRedirect: false
      });
    }
  };

  const openMediaPicker = (type, target) => {
    setMediaPickerType(type);
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (url) => {
    if (mediaPickerTarget === 'image') {
      setConfig({ ...config, imageUrl: url });
    } else if (mediaPickerTarget === 'video') {
      setConfig({ ...config, videoUrl: url });
    }
    setMediaPickerOpen(false);
  };

  const toggleGradientMode = () => {
    if (config.gradientStops) {
      setConfig({ ...config, gradientStops: null });
    } else {
      setConfig({
        ...config,
        gradientStops: [
          { color: '#000000', position: 0 },
          { color: '#ffffff', position: 100 }
        ]
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Carregant...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold">Configuració "En Construcció"</h2>
          <div className="flex items-center gap-2">
            <p className="text-gray-600 text-sm">Personalitzeu la pàgina de manteniment del lloc web</p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              autoSaveStatus === 'saved' ? 'bg-green-100 text-green-700' :
              autoSaveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
              'bg-red-100 text-red-700'
            }`}>
              {autoSaveStatus === 'saved' ? '✓ Desat' :
               autoSaveStatus === 'saving' ? '↻ Desant...' :
               '✗ Error'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => window.open('/ec-preview-lite', '_blank')}
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-1" />
            Vista prèvia
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reiniciar
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {/* Global Redirect - Warning Banner */}
          <div className={`rounded-lg border-2 p-4 ${
            config.globalRedirect
              ? 'bg-red-50 border-red-300'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-bold">Mode "En Construcció"</h3>
                  {config.globalRedirect && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                      ACTIU
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  {config.globalRedirect
                    ? '⚠️ Tots els visitants del web seran redirigits a la pàgina "En Construcció"'
                    : 'Activa aquesta opció per mostrar la pàgina "En Construcció" a tots els visitants'
                  }
                </p>
                {config.globalRedirect && (
                  <p className="text-xs text-red-600 font-medium">
                    Important: El web no estarà accessible mentre aquesta opció estigui activada
                  </p>
                )}
              </div>
              <label className="flex items-center gap-3 cursor-pointer flex-shrink-0">
                <span className="text-sm font-medium">
                  {config.globalRedirect ? 'Desactivar' : 'Activar'}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config.globalRedirect}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setConfig({ ...config, globalRedirect: newValue });
                    }}
                    className="sr-only"
                  />
                  <div className={`w-14 h-8 rounded-full transition-colors ${
                    config.globalRedirect ? 'bg-red-600' : 'bg-gray-300'
                  }`}>
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      config.globalRedirect ? 'transform translate-x-6' : ''
                    }`} />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Background Type - Full Width */}
          <div className="bg-white rounded-lg border p-3">
            <h3 className="text-base font-semibold mb-3">Tipus de Fons</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setConfig({ ...config, backgroundType: 'color' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  config.backgroundType === 'color'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Palette className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-medium">Color</p>
              </button>
              <button
                onClick={() => setConfig({ ...config, backgroundType: 'image' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  config.backgroundType === 'image'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ImageIcon className="w-6 h-6 mx-auto mb-1 text-green-600" />
                <p className="text-xs font-medium">Imatge</p>
              </button>
              <button
                onClick={() => setConfig({ ...config, backgroundType: 'video' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  config.backgroundType === 'video'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Video className="w-6 h-6 mx-auto mb-1 text-red-600" />
                <p className="text-xs font-medium">Vídeo</p>
              </button>
            </div>

            <div className="mt-3">
              {config.backgroundType === 'color' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">Color / Degradat</label>
                    <button
                      type="button"
                      onClick={toggleGradientMode}
                      className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      {config.gradientStops ? 'Color Simple' : 'Degradat'}
                    </button>
                  </div>

                  {!config.gradientStops ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                        className="h-9 w-16 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.backgroundColor}
                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#000000"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <GradientEditor
                        stops={config.gradientStops}
                        angle={config.gradientAngle}
                        onStopsChange={(stops) => setConfig({ ...config, gradientStops: stops })}
                        onAngleChange={(angle) => setConfig({ ...config, gradientAngle: angle })}
                      />
                    </div>
                  )}
                </div>
              )}

              {config.backgroundType === 'image' && (
                <div>
                  <label className="block text-sm font-medium mb-2">URL de la Imatge</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.imageUrl}
                      onChange={(e) => setConfig({ ...config, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => openMediaPicker('image', 'image')}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Seleccioneu
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Seleccioneu una imatge de la biblioteca o pugeu-ne una de nova
                  </p>
                </div>
              )}

              {config.backgroundType === 'video' && (
                <div>
                  <label className="block text-sm font-medium mb-2">URL del Vídeo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.videoUrl}
                      onChange={(e) => setConfig({ ...config, videoUrl: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/video.mp4"
                    />
                    <button
                      type="button"
                      onClick={() => openMediaPicker('video', 'video')}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Video className="w-4 h-4" />
                      Seleccioneu
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Seleccioneu un vídeo de la biblioteca o pugeu-ne un de nou
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Left Column: Content */}
            <div className="space-y-3">
              <div className="bg-white rounded-lg border p-3">
                <h3 className="text-base font-semibold mb-3">Contingut</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Títol</label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig({ ...config, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Estem treballant en alguna cosa increïble"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Subtítol</label>
                    <input
                      type="text"
                      value={config.subtitle}
                      onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tornarem aviat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Descripció</label>
                    <textarea
                      value={config.description}
                      onChange={(e) => setConfig({ ...config, description: e.target.value })}
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="El nostre lloc web està en construcció..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Color del Text</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                        className="h-9 w-16 rounded border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.textColor}
                        onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                        className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Button & Redirect */}
            <div className="space-y-3">
              {/* Button */}
              <div className="bg-white rounded-lg border p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">Botó d'Acció</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showButton}
                      onChange={(e) => setConfig({ ...config, showButton: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">Mostrar</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text del Botó</label>
                    <input
                      type="text"
                      value={config.buttonText}
                      onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tornar a l'inici"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Enllaç del Botó</label>
                    <input
                      type="text"
                      value={config.buttonLink}
                      onChange={(e) => setConfig({ ...config, buttonLink: e.target.value })}
                      className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/"
                    />
                  </div>
                </div>
              </div>

              {/* Redirect */}
              <div className="bg-white rounded-lg border p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold">Redirecció</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoRedirect}
                      onChange={(e) => setConfig({ ...config, autoRedirect: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm">Activar</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <ExternalLink className="w-4 h-4 inline mr-1" />
                    URL de Redirecció
                  </label>
                  <input
                    type="text"
                    value={config.redirectUrl}
                    onChange={(e) => setConfig({ ...config, redirectUrl: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com o /pagina"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Quan el vídeo acabi, es redirigirà automàticament
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MediaPicker
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        mediaType={mediaPickerType}
      />
    </div>
  );
}
