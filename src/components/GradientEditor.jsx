import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Save, Heart, HeartOff, RotateCcw } from 'lucide-react';
import { supabase } from '@/api/supabase-products';
import { useToast } from '@/components/ui/use-toast';

export default function GradientEditor({ stops, angle, onStopsChange, onAngleChange }) {
  const [selectedStopIndex, setSelectedStopIndex] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [presets, setPresets] = useState([]);
  const [presetName, setPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const barRef = useRef(null);
  const justDraggedRef = useRef(false);
  const { toast } = useToast();

  const getGradientCSS = () => {
    if (!stops || stops.length === 0) return 'linear-gradient(90deg, #000 0%, #fff 100%)';
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const gradient = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
    return `linear-gradient(90deg, ${gradient})`;
  };

  const handleBarClick = (e) => {
    if (draggingIndex !== null) return;

    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }

    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.round((x / rect.width) * 100);

    const clampedPosition = Math.max(0, Math.min(100, position));

    const newStop = {
      color: '#888888',
      position: clampedPosition
    };

    const newStops = [...stops, newStop];
    onStopsChange(newStops);
    setSelectedStopIndex(newStops.length - 1);
  };

  const handleStopMouseDown = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingIndex(index);
    setSelectedStopIndex(index);
    justDraggedRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (draggingIndex === null || !barRef.current) return;

    justDraggedRef.current = true;

    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.round((x / rect.width) * 100);

    const clampedPosition = Math.max(0, Math.min(100, position));

    const newStops = [...stops];
    newStops[draggingIndex] = {
      ...newStops[draggingIndex],
      position: clampedPosition
    };
    onStopsChange(newStops);
  };

  const handleMouseUp = () => {
    if (draggingIndex !== null) {
      setDraggingIndex(null);
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 50);
    }
  };

  const handleColorChange = (index, color) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], color };
    onStopsChange(newStops);
  };

  const handleDeleteStop = (index) => {
    if (stops.length <= 2) return;
    const newStops = stops.filter((_, i) => i !== index);
    onStopsChange(newStops);
    setSelectedStopIndex(null);
  };

  const handleResetGradient = () => {
    const defaultStops = [
      { color: '#000000', position: 0 },
      { color: '#ffffff', position: 100 }
    ];
    onStopsChange(defaultStops);
    setSelectedStopIndex(null);
  };

  const loadPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('gradient_presets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresets(data || []);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const savePreset = async () => {
    if (!presetName.trim()) {
      toast({
        title: 'Error',
        description: 'Introdueix un nom per al preset',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('gradient_presets')
        .insert({
          name: presetName.trim(),
          stops: stops,
          angle: angle
        });

      if (error) throw error;

      toast({
        title: 'Preset guardat',
        description: `El degradat "${presetName}" s'ha guardat correctament`
      });

      setPresetName('');
      setShowSaveDialog(false);
      loadPresets();
    } catch (error) {
      console.error('Error saving preset:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut guardar el preset',
        variant: 'destructive'
      });
    }
  };

  const loadPreset = (preset) => {
    onStopsChange(preset.stops);
    onAngleChange(preset.angle);
    toast({
      title: 'Preset carregat',
      description: `S'ha carregat el degradat "${preset.name}"`
    });
  };

  const deletePreset = async (id) => {
    try {
      const { error } = await supabase
        .from('gradient_presets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Preset eliminat',
        description: 'El preset s\'ha eliminat correctament'
      });

      loadPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast({
        title: 'Error',
        description: 'No s\'ha pogut eliminar el preset',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadPresets();
  }, []);

  useEffect(() => {
    if (draggingIndex !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingIndex, stops]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-2">
          Angle del Degradat: {angle}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={angle}
          onChange={(e) => onAngleChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium">
            Color (clica per afegir colors)
          </label>
          <button
            type="button"
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Save className="w-3 h-3" />
            Guardar
          </button>
        </div>

        {showSaveDialog && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <label className="block text-xs font-medium">Nom del preset</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && savePreset()}
                placeholder="Ex: Blau a vermell"
                className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={savePreset}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {presets.length > 0 && (
          <div className="mb-3">
            <label className="block text-xs font-medium mb-2">Presets guardats</label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="relative group"
                >
                  <button
                    type="button"
                    onClick={() => loadPreset(preset)}
                    className="w-full h-12 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-all overflow-hidden"
                    style={{
                      background: `linear-gradient(${preset.angle}deg, ${[...preset.stops].sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position}%`).join(', ')})`
                    }}
                    title={preset.name}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                    {preset.name}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePreset(preset.id);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar preset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <div
            ref={barRef}
            className="relative h-12 rounded-lg border-2 border-gray-300 cursor-crosshair overflow-visible"
            style={{ background: getGradientCSS() }}
            onClick={handleBarClick}
          >
            {stops?.map((stop, index) => (
              <div
                key={index}
                className="absolute top-full mt-1 transform -translate-x-1/2 cursor-grab active:cursor-grabbing"
                style={{ left: `${stop.position}%` }}
                onMouseDown={(e) => handleStopMouseDown(e, index)}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={`w-6 h-6 rounded-full border-3 shadow-lg transition-all ${
                    selectedStopIndex === index
                      ? 'border-blue-500 scale-110'
                      : 'border-white'
                  }`}
                  style={{ backgroundColor: stop.color }}
                />

                <div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-0.5 h-3 bg-gray-400"
                />
              </div>
            ))}
          </div>

          <div className="h-8" />
        </div>

        {selectedStopIndex !== null && stops[selectedStopIndex] && (
          <div className="mt-4 p-3 bg-white border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">
                Color a {stops[selectedStopIndex].position}%
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleResetGradient}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Resetejar degradat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                {stops.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteStop(selectedStopIndex)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar color"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={stops[selectedStopIndex].color}
                onChange={(e) => handleColorChange(selectedStopIndex, e.target.value)}
                className="h-10 w-16 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={stops[selectedStopIndex].color}
                onChange={(e) => handleColorChange(selectedStopIndex, e.target.value)}
                className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Posició: {stops[selectedStopIndex].position}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={stops[selectedStopIndex].position}
                onChange={(e) => {
                  const newStops = [...stops];
                  newStops[selectedStopIndex] = {
                    ...newStops[selectedStopIndex],
                    position: parseInt(e.target.value)
                  };
                  onStopsChange(newStops);
                }}
                className="w-full"
              />
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Clica la barra per afegir colors • Arrossega els cercles per moure'ls • Clica un cercle per editar-lo
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1">Vista prèvia amb angle</label>
        <div
          className="w-full h-16 rounded-lg border"
          style={{
            background: stops && stops.length > 0
              ? `linear-gradient(${angle}deg, ${[...stops].sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position}%`).join(', ')})`
              : '#000000'
          }}
        />
      </div>
    </div>
  );
}
