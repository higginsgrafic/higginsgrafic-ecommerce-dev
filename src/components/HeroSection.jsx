import React, { useState, useEffect } from 'react';
import { useTexts } from '@/hooks/useTexts';
import { supabase } from '@/api/supabase-products';
import EditWrapper from '@/components/EditWrapper';
import HeroPreview from '@/components/HeroPreview';
import HeroSettingsPage from '@/pages/HeroSettingsPage';

const HeroSection = () => {
  const texts = useTexts();
  const [slides, setSlides] = useState([]);
  const [autoplayInterval, setAutoplayInterval] = useState(8000);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadHeroConfig();
  }, []);

  const getDefaultSlides = () => [
    {
      id: 1,
      title: texts.hero.slides.firstContact.title,
      subtitle: texts.hero.slides.firstContact.subtitle,
      path: "/first-contact",
      bg_value: 'I0VjId1PtNA',
      bg_opacity: 0.6
    },
    {
      id: 2,
      title: texts.hero.slides.theHumanInside.title,
      subtitle: texts.hero.slides.theHumanInside.subtitle,
      path: "/the-human-inside",
      bg_value: 'I0VjId1PtNA',
      bg_opacity: 0.6
    },
    {
      id: 3,
      title: texts.hero.slides.austen.title,
      subtitle: texts.hero.slides.austen.subtitle,
      path: "/austen",
      bg_value: 'dpAYDELHNR0',
      bg_opacity: 0.6
    },
    {
      id: 4,
      title: texts.hero.slides.cube.title,
      subtitle: texts.hero.slides.cube.subtitle,
      path: "/cube",
      bg_value: 'I0VjId1PtNA',
      bg_opacity: 0.6
    },
    {
      id: 5,
      title: texts.hero.slides.outcasted.title,
      subtitle: texts.hero.slides.outcasted.subtitle,
      path: "/outcasted",
      bg_value: '5eOZJ9CTIdY',
      bg_opacity: 0.6
    }
  ];

  const loadHeroConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_config')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSlides(data);
        if (data[0]?.autoplay_interval) {
          setAutoplayInterval(data[0].autoplay_interval);
        }
      } else {
        setSlides(getDefaultSlides());
      }
    } catch (error) {
      console.error('Error loading hero config:', error);
      setSlides(getDefaultSlides());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <EditWrapper
      editPath="/hero-settings"
      section="Hero"
      onEdit={() => setShowEditor((v) => !v)}
    >
      {showEditor ? (
        <HeroSettingsPage mode="embedded" onRequestClose={() => setShowEditor(false)} />
      ) : (
        <HeroPreview
          slides={slides}
          autoplayInterval={autoplayInterval}
        />
      )}
    </EditWrapper>
  );
};

export default HeroSection;
