import { useState, useEffect } from 'react';
import { getPromotionsConfig } from '@/api/promotions';
import api from '@/api/endpoints';

/**
 * Hook per obtenir la configuració del header d'ofertes des del backend
 *
 * Retorna:
 * - enabled: boolean - Si el header està actiu
 * - text: string - Text a mostrar
 * - loading: boolean - Si està carregant
 *
 * Prioritat:
 * 1. Base de dades Supabase (promotions_config)
 * 2. LocalStorage (HomeEditor - legacy)
 * 3. Backend API (legacy)
 * 4. Configuració per defecte
 */
export const useOffersConfig = () => {
  const [config, setConfig] = useState({
    enabled: import.meta.env.VITE_OFFERS_ENABLED !== 'false',
    text: 'Transport inclòs',
    loading: true,
    bgColor: '#111827',
    textColor: '#ffffff',
    fontSize: '14px',
    font: 'Roboto',
    link: null,
    clickable: false,
    discountEnabled: false,
    discountRate: 0,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      // PRIORITAT 1: Base de dades Supabase
      try {
        const supabaseConfig = await getPromotionsConfig();

        if (supabaseConfig) {
          setConfig({
            enabled: supabaseConfig.enabled,
            text: supabaseConfig.text,
            loading: false,
            bgColor: supabaseConfig.bgColor,
            textColor: supabaseConfig.textColor,
            fontSize: supabaseConfig.fontSize,
            font: supabaseConfig.font,
            link: supabaseConfig.link,
            clickable: supabaseConfig.clickable,
            discountEnabled: supabaseConfig.discountEnabled ?? false,
            discountRate: supabaseConfig.discountRate ?? 0,
          });
          return;
        }
      } catch (error) {
        console.warn('⚠️ No s\'ha pogut obtenir configuració de Supabase, provant altres fonts');
      }

      // PRIORITAT 2: LocalStorage (HomeEditor - legacy)
      const savedOffersHeader = localStorage.getItem('homeEditorOffersHeader');

      if (savedOffersHeader) {
        try {
          const editorData = JSON.parse(savedOffersHeader);
          setConfig({
            enabled: true,
            text: editorData.text || 'Transport inclòs',
            loading: false,
            bgColor: editorData.bgColor || '#111827',
            textColor: editorData.textColor || '#ffffff',
            fontSize: editorData.fontSize || '14px',
            font: editorData.font || 'Roboto',
            link: editorData.link || null,
            clickable: editorData.clickable || false,
            discountEnabled: false,
            discountRate: 0,
          });
          return;
        } catch (error) {
          console.warn('⚠️ Error parseant localStorage');
        }
      }

      // PRIORITAT 3: Backend API (legacy)
      try {
        const response = await api.getOffersConfig();

        if (response && typeof response.enabled !== 'undefined') {
          setConfig({
            enabled: response.enabled,
            text: response.text || 'Transport inclòs',
            loading: false,
            bgColor: response.bgColor || '#111827',
            textColor: response.textColor || '#ffffff',
            fontSize: response.fontSize || '14px',
            font: response.font || 'Roboto',
            link: response.link || null,
            clickable: response.clickable || false,
            discountEnabled: response.discountEnabled ?? false,
            discountRate: response.discountRate ?? 0,
          });
          return;
        }
      } catch (error) {
        console.warn('⚠️ No s\'ha pogut obtenir configuració del backend');
      }

      // PRIORITAT 4: Configuració per defecte
      setConfig(prev => ({ ...prev, loading: false }));
    };

    fetchConfig();

    const handleConfigChange = () => {
      console.log('🔄 Promotions config changed, reloading...');
      fetchConfig();
    };

    window.addEventListener('promotionsConfigChanged', handleConfigChange);

    return () => {
      window.removeEventListener('promotionsConfigChanged', handleConfigChange);
    };
  }, []);

  return config;
};

export default useOffersConfig;
