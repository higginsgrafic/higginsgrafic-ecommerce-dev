import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2, Search, X, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DockSection from '@/components/DockSection';
import { useProductContext } from '@/contexts/ProductContext';
import { useTexts } from '@/hooks/useTexts';
import { supabase } from '@/api/supabase-products';
import { useToast } from '@/components/ui/use-toast';
import { useAdmin } from '@/contexts/AdminContext';
import HeroSettingsPage from '@/pages/HeroSettingsPage';
import OverlayUnderHeader from '@/components/OverlayUnderHeader';
import NikeHeroSlider from '@/components/NikeHeroSlider';

function Home({ onAddToCart, cartItems, onUpdateQuantity }) {
  const texts = useTexts();
  const navigate = useNavigate();
  const { getRandomProductsByCollection } = useProductContext();
  const [collections, setCollections] = useState([]);
  const { toast } = useToast();
  const { isAdmin } = useAdmin();

  // Hero editor states
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [autoplayInterval, setAutoplayInterval] = useState(8000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [editMode, setEditMode] = useState(false);
  const [searchDialog, setSearchDialog] = useState({ open: false, type: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [editingInterval, setEditingInterval] = useState(false);
  const [tempInterval, setTempInterval] = useState({ seconds: 8, milliseconds: 0 });
  const initialLoadRef = useRef(true);
  const isDragging = useRef(false);
  const [showHeroSettings, setShowHeroSettings] = useState(false);

  const availableRoutes = [
    { path: '/', label: 'Inici' },
    { path: '/first-contact', label: 'First Contact' },
    { path: '/about', label: 'Sobre nosaltres' },
    { path: '/contact', label: 'Contacte' },
  ];

  const availableVideos = [
    { id: 'I0VjId1PtNA', label: 'First Contact' },
  ];

  const defaultSlides = [
    {
      slide_index: 0,
      title: "First Contact",
      subtitle: "Explora el primer contacte amb altres civilitzacions",
      video_url: "I0VjId1PtNA",
      path: "/first-contact",
      bg_type: "video",
      bg_value: "I0VjId1PtNA",
      bg_opacity: 0.6,
      autoplay_enabled: true,
      autoplay_interval: 8000,
      active: true,
      order: 0
    }
  ];

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setCollections(data);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    if (initialLoadRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveSlides();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [slides, autoplay, autoplayInterval]);

  useEffect(() => {
    if (!autoplay || editMode || slides.length === 0) return;

    const timer = setInterval(() => {
      if (!isDragging.current) {
        nextSlide();
      }
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, autoplayInterval, currentSlide, editMode, slides.length]);

  useEffect(() => {
    const seconds = Math.floor(autoplayInterval / 1000);
    const milliseconds = autoplayInterval % 1000;
    setTempInterval({ seconds, milliseconds });
  }, [autoplayInterval]);

  const openSearchDialog = (type) => {
    setSearchDialog({ open: true, type });
    setSearchQuery('');
  };

  const closeSearchDialog = () => {
    setSearchDialog({ open: false, type: null });
    setSearchQuery('');
  };

  const selectValue = (value) => {
    if (searchDialog.type === 'video') {
      updateSlide(currentSlide, 'bg_value', value);
    } else if (searchDialog.type === 'route') {
      updateSlide(currentSlide, 'path', value);
    }
    closeSearchDialog();
  };

  const getFilteredOptions = () => {
    const query = searchQuery.toLowerCase();
    if (searchDialog.type === 'video') {
      return availableVideos.filter(v =>
        v.id.toLowerCase().includes(query) ||
        v.label.toLowerCase().includes(query)
      );
    } else if (searchDialog.type === 'route') {
      return availableRoutes.filter(r =>
        r.path.toLowerCase().includes(query) ||
        r.label.toLowerCase().includes(query)
      );
    }
    return [];
  };

  const handleIntervalClick = () => {
    setEditingInterval(true);
  };

  const handleIntervalChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setTempInterval(prev => ({
      ...prev,
      [field]: Math.max(0, numValue)
    }));
  };

  const handleIntervalBlur = () => {
    const newInterval = (tempInterval.seconds * 1000) + tempInterval.milliseconds;
    if (newInterval >= 1000) {
      setAutoplayInterval(newInterval);
    } else {
      const seconds = Math.floor(autoplayInterval / 1000);
      const milliseconds = autoplayInterval % 1000;
      setTempInterval({ seconds, milliseconds });
    }
    setEditingInterval(false);
  };

  const handleIntervalKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleIntervalBlur();
    } else if (e.key === 'Escape') {
      const seconds = Math.floor(autoplayInterval / 1000);
      const milliseconds = autoplayInterval % 1000;
      setTempInterval({ seconds, milliseconds });
      setEditingInterval(false);
    }
  };

  const loadSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_config')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setSlides(defaultSlides);
      } else {
        setSlides(data);
        if (data.length > 0) {
          setAutoplay(data[0].autoplay_enabled);
          setAutoplayInterval(data[0].autoplay_interval);
        }
      }
    } catch (error) {
      console.error('Error loading slides:', error);
      setSlides(defaultSlides);
    } finally {
      setLoading(false);
      setTimeout(() => {
        initialLoadRef.current = false;
      }, 100);
    }
  };

  const saveSlides = async () => {
    if (slides.length === 0) return;

    try {
      setSaving(true);

      const { error: deleteError } = await supabase
        .from('hero_config')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (deleteError) throw deleteError;

      const slidesToSave = slides.map((slide, index) => {
        const { id, created_at, ...slideData } = slide;
        return {
          ...slideData,
          order: index,
          autoplay_enabled: autoplay,
          autoplay_interval: autoplayInterval
        };
      });

      const { error: insertError } = await supabase
        .from('hero_config')
        .insert(slidesToSave);

      if (insertError) throw insertError;
    } catch (error) {
      console.error('Error saving slides:', error);
      toast({
        title: "Error",
        description: "No s'ha pogut guardar la configuració",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const addSlide = () => {
    const newSlide = {
      slide_index: slides.length,
      title: "Nou Slide",
      subtitle: "Descripció del nou slide",
      video_url: "I0VjId1PtNA",
      path: "/",
      bg_type: "video",
      bg_value: "I0VjId1PtNA",
      bg_opacity: 0.6,
      autoplay_enabled: true,
      autoplay_interval: 8000,
      active: true,
      order: slides.length
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;

    setTimeout(() => {
      isDragging.current = false;
    }, 100);

    if (info.offset.x < -swipeThreshold) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold) {
      prevSlide();
    }
  };

  const handleContainerClick = () => {
    if (!isDragging.current && !editMode && slides[currentSlide]?.path) {
      navigate(slides[currentSlide].path);
    }
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) {
      toast({
        title: "Error",
        description: "Has de mantenir almenys un slide",
        variant: "destructive"
      });
      return;
    }

    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    }
  };


  const heroSliderSlides = useMemo(() => {
    const fallbackImages = [
      '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_royal_gpr-4-0_front.png',
      '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_black_gpr-4-0_front.png',
      '/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_forest-green_gpr-4-0_front.png',
    ];

    if (!Array.isArray(slides) || slides.length === 0) return [];

    return slides.map((s, idx) => {
      const imageSrc = s.image_src || s.imageSrc || fallbackImages[idx % fallbackImages.length];
      const href = s.path || '/';
      return {
        id: s.id || `hero-${idx}`,
        imageSrc,
        imageAlt: s.title || s.subtitle || `Hero ${idx + 1}`,
        kicker: s.title,
        headline: s.subtitle,
        primaryCta: { label: 'Compra', href },
        secondaryCta: { label: 'Descobreix', href },
      };
    });
  }, [slides]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Carregant...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{texts.home.seo.title}</title>
        <meta name="description" content={texts.home.seo.description} />
      </Helmet>

      <OverlayUnderHeader open={showHeroSettings} onClose={() => setShowHeroSettings(false)}>
        <HeroSettingsPage
          mode="embedded"
          onRequestClose={() => setShowHeroSettings(false)}
        />
      </OverlayUnderHeader>

      <div className="mt-4">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="py-8 lg:py-10">
            <div className="text-xs font-semibold tracking-[0.18em] text-muted-foreground opacity-50">ADIDAS-STYLE DEMO</div>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Header + Mega-menú (placeholders)
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground opacity-60">
              Aquesta pàgina és una demo per iterar ràpidament sobre un header tipus adidas.es: sticky, mega-menú desktop,
              menú mobile i layout de categories. Les lògiques les podem ajustar fins trobar el que busques.
            </p>
          </div>
        </div>

        <NikeHeroSlider
          slides={heroSliderSlides}
          autoplay={autoplay}
          autoplayIntervalMs={autoplayInterval}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50"
              onClick={() => setDeleteConfirmDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg shadow-xl z-50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Esborrar slide
                  </h3>
                  <button
                    onClick={() => setDeleteConfirmDialog(false)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  Estàs segur que vols esborrar aquest slide? Aquesta acció no es pot desfer.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setDeleteConfirmDialog(false)}
                    className="px-4 py-2 text-sm text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    Cancel·lar
                  </button>
                  <button
                    onClick={() => {
                      deleteSlide(currentSlide);
                      setDeleteConfirmDialog(false);
                    }}
                    className="px-4 py-2 text-sm text-whiteStrong bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Esborrar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Dialog */}
      <AnimatePresence>
        {searchDialog.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/50 z-50"
              onClick={closeSearchDialog}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg shadow-xl z-50"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {searchDialog.type === 'video' ? 'Selecciona un vídeo' : 'Selecciona una ruta'}
                  </h3>
                  <button
                    onClick={closeSearchDialog}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="max-h-80 overflow-y-auto space-y-1">
                  {getFilteredOptions().map((option) => (
                    <button
                      key={searchDialog.type === 'video' ? option.id : option.path}
                      onClick={() => selectValue(searchDialog.type === 'video' ? option.id : option.path)}
                      className="w-full text-left px-4 py-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="font-medium text-foreground">
                        {searchDialog.type === 'video' ? option.id : option.path}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.label}
                      </div>
                    </button>
                  ))}
                  {getFilteredOptions().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No s'han trobat resultats
                    </div>
                  )}
                </div>

                {searchDialog.type === 'video' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          selectValue(searchQuery.trim());
                        }
                      }}
                      placeholder="O escriu un ID personalitzat"
                      className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                    <button
                      onClick={() => searchQuery.trim() && selectValue(searchQuery.trim())}
                      disabled={!searchQuery.trim()}
                      className="w-full mt-2 px-4 py-2 bg-blue-600 text-whiteStrong rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Usar ID personalitzat
                    </button>
                  </div>
                )}

                {searchDialog.type === 'route' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          selectValue(searchQuery.trim());
                        }
                      }}
                      placeholder="O escriu una ruta personalitzada"
                      className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                    />
                    <button
                      onClick={() => searchQuery.trim() && selectValue(searchQuery.trim())}
                      disabled={!searchQuery.trim()}
                      className="w-full mt-2 px-4 py-2 bg-blue-600 text-whiteStrong rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Usar ruta personalitzada
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Collection Sections */}
      <div>
        <div className="space-y-0">
          {collections.map((collection) => (
            <DockSection
              key={collection.slug}
              collectionSlug={collection.slug}
              onAddToCart={onAddToCart}
              cartItems={cartItems}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
