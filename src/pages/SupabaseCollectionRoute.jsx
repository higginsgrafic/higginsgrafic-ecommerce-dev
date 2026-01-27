import React, { useEffect, useMemo, useState } from 'react';

import CollectionPage from '@/pages/CollectionPage.jsx';
import { supabase } from '@/api/supabase-products';
import { getCollectionConfig } from '@/config/collections.js';

function normalizeProductSlugs(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((x) => (x ?? '').toString().trim())
      .filter(Boolean);
  }

  const raw = (value ?? '').toString().trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((x) => (x ?? '').toString().trim())
        .filter(Boolean);
    }
  } catch {
    // ignore
  }

  return raw
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function SupabaseCollectionRoute({ collectionKey, ...pageProps }) {
  const localConfig = useMemo(() => getCollectionConfig(collectionKey), [collectionKey]);
  const [remoteRow, setRemoteRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!supabase) {
          setRemoteRow(null);
          setLoadError(true);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('collections')
          .select('*')
          .eq('slug', collectionKey)
          .maybeSingle();

        if (error) throw error;
        if (cancelled) return;
        setRemoteRow(data || null);
        setLoadError(false);
      } catch (err) {
        console.error('[SupabaseCollectionRoute] Error loading collection config:', err);
        if (cancelled) return;
        setRemoteRow(null);
        setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    load();

    return () => {
      cancelled = true;
    };
  }, [collectionKey]);

  const mergedConfig = useMemo(() => {
    const row = remoteRow || null;
    const productSlugs = normalizeProductSlugs(row?.product_slugs);

    const isProd = !!import.meta?.env?.PROD;
    const rowExists = !!row;
    const rowActive = typeof row?.is_active === 'boolean' ? row.is_active : true;
    const missingRowOrInactive = (!rowExists || !rowActive);
    const missingCuratedSlugs = productSlugs.length === 0;

    const disableProductFallback = isProd && (missingRowOrInactive || missingCuratedSlugs);
    const showConfigWarning = !!loadError || (isProd && (missingRowOrInactive || missingCuratedSlugs));

    const configWarningMessage = missingRowOrInactive
      ? 'Aquesta col·lecció no està disponible temporalment.'
      : missingCuratedSlugs
        ? 'Alguns continguts no es poden mostrar ara mateix.'
        : loadError
          ? 'No s’ha pogut carregar aquesta col·lecció. Torna-ho a provar més tard.'
          : '';

    return {
      ...(localConfig || {}),
      collectionSlug: (row?.slug || localConfig?.collectionSlug || collectionKey || '').toString(),
      textsKey: (row?.texts_key || localConfig?.textsKey || '').toString() || undefined,
      breadcrumbLabel: (row?.breadcrumb_label || localConfig?.breadcrumbLabel || row?.name || localConfig?.title || '').toString(),
      title: (row?.name || localConfig?.title || '').toString(),
      description: (row?.description || localConfig?.description || '').toString(),
      useFullBleedUnderHeader: typeof row?.use_full_bleed_under_header === 'boolean'
        ? row.use_full_bleed_under_header
        : (localConfig?.useFullBleedUnderHeader ?? true),
      headerClassName: (row?.header_class_name || localConfig?.headerClassName || '').toString(),
      bodyText: (row?.body_text || localConfig?.bodyText || '').toString(),
      productSlugs: productSlugs.length > 0 ? productSlugs : (isProd ? [] : (localConfig?.productSlugs || [])),
      showConfigWarning,
      configWarningMessage,
      disableProductFallback,
      seo: {
        ...(localConfig?.seo || {}),
        title: (row?.seo_title || localConfig?.seo?.title || '').toString(),
        description: (row?.seo_description || localConfig?.seo?.description || '').toString()
      }
    };
  }, [collectionKey, localConfig, remoteRow]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Carregant...</div>
      </div>
    );
  }

  return <CollectionPage config={mergedConfig} {...pageProps} />;
}
