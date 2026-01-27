import { useState, useEffect } from 'react';
import { mockupsAPI } from '../api/mockups';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductMockups({
  collection,
  designName,
  variantId = null,
  onMockupChange = null
}) {
  const [mockups, setMockups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMockup, setSelectedMockup] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filters, setFilters] = useState({
    base_color: null,
    drawing_color: null
  });
  const [availableColors, setAvailableColors] = useState({
    base: [],
    drawing: []
  });

  useEffect(() => {
    loadMockups();
  }, [collection, designName, variantId]);

  useEffect(() => {
    if (mockups.length > 0 && selectedMockup === null) {
      setSelectedMockup(mockups[0]);
      setCurrentIndex(0);
      if (onMockupChange) {
        onMockupChange(mockups[0]);
      }
    }
  }, [mockups]);

  async function loadMockups() {
    try {
      setLoading(true);

      let data;
      if (variantId) {
        data = await mockupsAPI.getByVariant(variantId);
      } else if (designName) {
        data = await mockupsAPI.getByDesign(collection, designName);
      } else {
        data = await mockupsAPI.getByCollection(collection);
      }

      setMockups(data);

      const baseColors = [...new Set(data.map(m => m.base_color))];
      const drawingColors = [...new Set(data.map(m => m.drawing_color))];

      setAvailableColors({
        base: baseColors,
        drawing: drawingColors
      });

    } catch (error) {
      console.error('Error loading mockups:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredMockups = mockups.filter(m => {
    if (filters.base_color && m.base_color !== filters.base_color) return false;
    if (filters.drawing_color && m.drawing_color !== filters.drawing_color) return false;
    return true;
  });

  function selectMockup(mockup, index) {
    setSelectedMockup(mockup);
    setCurrentIndex(index);
    if (onMockupChange) {
      onMockupChange(mockup);
    }
  }

  function nextMockup() {
    const nextIndex = (currentIndex + 1) % filteredMockups.length;
    selectMockup(filteredMockups[nextIndex], nextIndex);
  }

  function prevMockup() {
    const prevIndex = currentIndex === 0 ? filteredMockups.length - 1 : currentIndex - 1;
    selectMockup(filteredMockups[prevIndex], prevIndex);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregant mockups...</p>
        </div>
      </div>
    );
  }

  if (mockups.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">No hi ha mockups disponibles per aquest producte</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(availableColors.base.length > 1 || availableColors.drawing.length > 1) && (
        <div className="space-y-4">
          {availableColors.base.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color base
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, base_color: null })}
                  className={`px-4 py-2 rounded-lg border ${
                    filters.base_color === null
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Tots
                </button>
                {availableColors.base.map(color => (
                  <button
                    key={color}
                    onClick={() => setFilters({ ...filters, base_color: color })}
                    className={`px-4 py-2 rounded-lg border capitalize ${
                      filters.base_color === color
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableColors.drawing.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color del disseny
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, drawing_color: null })}
                  className={`px-4 py-2 rounded-lg border ${
                    filters.drawing_color === null
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Tots
                </button>
                {availableColors.drawing.map(color => (
                  <button
                    key={color}
                    onClick={() => setFilters({ ...filters, drawing_color: color })}
                    className={`px-4 py-2 rounded-lg border capitalize ${
                      filters.drawing_color === color
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedMockup && (
        <div className="relative">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={selectedMockup.file_path}
              alt={`${selectedMockup.design_name} - ${selectedMockup.base_color}`}
              className="w-full h-auto"
              onError={(e) => {
                e.target.src = '/placeholder-product.svg';
              }}
            />

            {filteredMockups.length > 1 && (
              <>
                <button
                  onClick={prevMockup}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  aria-label="Mockup anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={nextMockup}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                  aria-label="Següent mockup"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div className="space-y-1">
              <p>
                <span className="font-medium">Color base:</span>{' '}
                <span className="capitalize">{selectedMockup.base_color}</span>
              </p>
              <p>
                <span className="font-medium">Color disseny:</span>{' '}
                <span className="capitalize">{selectedMockup.drawing_color}</span>
              </p>
              {selectedMockup.product_type && (
                <p>
                  <span className="font-medium">Tipus:</span>{' '}
                  <span className="capitalize">{selectedMockup.product_type}</span>
                </p>
              )}
            </div>

            {filteredMockups.length > 1 && (
              <div className="text-gray-500">
                {currentIndex + 1} / {filteredMockups.length}
              </div>
            )}
          </div>
        </div>
      )}

      {filteredMockups.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {filteredMockups.map((mockup, index) => (
            <button
              key={mockup.id}
              onClick={() => selectMockup(mockup, index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedMockup?.id === mockup.id
                  ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={mockup.file_path}
                alt={`Variant ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {filteredMockups.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800">
            No hi ha mockups disponibles amb aquests filtres
          </p>
        </div>
      )}
    </div>
  );
}
