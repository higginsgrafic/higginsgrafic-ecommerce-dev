import { useEffect, useMemo, useState } from 'react';

const EPISODES_STORAGE_VERSION = '2.1';

const normalizeKey = (value) => {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeEpisodes = (payload) => {
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.episodes)
      ? payload.episodes
      : [];

  return raw
    .map((ep) => {
      if (!ep || typeof ep !== 'object') return null;
      const season = Number.isFinite(ep.season) ? ep.season : parseInt(ep.season, 10);
      const episode = Number.isFinite(ep.episode) ? ep.episode : parseInt(ep.episode, 10);
      const title = (ep.title || '').toString();
      const originalTitle = (ep.originalTitle || ep.original_title || ep.original || ep.title || '').toString();
      const text = (ep.text || '').toString();
      return {
        season: Number.isFinite(season) ? season : 0,
        episode: Number.isFinite(episode) ? episode : 0,
        title,
        originalTitle,
        text
      };
    })
    .filter(Boolean);
};

const buildCandidateKeys = (product) => {
  const keys = [];
  if (product?.slug) keys.push(normalizeKey(product.slug));
  // Canonical filenames are always normalized.
  if (product?.name) keys.push(normalizeKey(product.name));
  if (product?.id != null) keys.push(normalizeKey(product.id));
  return [...new Set(keys.filter(Boolean))];
};

const buildLangFolders = (language) => {
  // Standard folders: ca / en
  if (language === 'en') return ['en'];
  return ['ca'];
};

const flipLanguage = (language) => {
  return language === 'en' ? 'ca' : 'en';
};

const fetchGlobalFallback = async ({ language, markFallback, setState }) => {
  const path = `/product_episodes/${language}/_fallback.json`;
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) return { ok: false };
    const json = await res.json();
    const normalized = normalizeEpisodes(json);
    if (normalized.length === 0) return { ok: false };
    setState({ episodes: normalized, sourceUrl: path, usingLanguageFallback: !!markFallback });
    return { ok: true };
  } catch {
    return { ok: false };
  }
};

export default function useProductEpisodes({ product, language = 'ca' }) {
  const langFolders = useMemo(() => buildLangFolders(language), [language]);
  const fallbackLanguage = useMemo(() => flipLanguage(language), [language]);
  const fallbackLangFolders = useMemo(() => buildLangFolders(fallbackLanguage), [fallbackLanguage]);
  const candidateKeys = useMemo(() => buildCandidateKeys(product), [product?.slug, product?.name, product?.id]);

  const storageBaseKey = useMemo(() => {
    const primary = candidateKeys[0] || 'unknown';
    return `productEpisodes::${language}::${primary}`;
  }, [candidateKeys, language]);

  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisodeIndex, setSelectedEpisodeIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [missingFile, setMissingFile] = useState(false);
  const [usingLanguageFallback, setUsingLanguageFallback] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(null);

  // Load persisted edits/index (fast path) + then try to fetch canonical JSON.
  useEffect(() => {
    if (!product) {
      setEpisodes([]);
      setSelectedEpisodeIndex(0);
      setMissingFile(false);
      setSourceUrl(null);
      return;
    }

    const versionKey = `${storageBaseKey}::v`;
    const episodesKey = `${storageBaseKey}::episodes`;
    const indexKey = `${storageBaseKey}::index`;

    const savedVersion = localStorage.getItem(versionKey);
    const savedEpisodesRaw = localStorage.getItem(episodesKey);
    const savedIndexRaw = localStorage.getItem(indexKey);

    const parsedEpisodes = savedVersion === EPISODES_STORAGE_VERSION ? safeJsonParse(savedEpisodesRaw) : null;
    if (Array.isArray(parsedEpisodes)) {
      setEpisodes(parsedEpisodes);
    } else {
      setEpisodes([]);
    }

    const parsedIndex = parseInt(savedIndexRaw || '', 10);
    setSelectedEpisodeIndex(Number.isFinite(parsedIndex) && parsedIndex >= 0 ? parsedIndex : 0);

    setMissingFile(false);
    setUsingLanguageFallback(false);
    setSourceUrl(null);
  }, [product, storageBaseKey]);

  useEffect(() => {
    if (!product) return;

    let canceled = false;

    const tryFetchFromFolders = async ({ folders, markFallback }) => {
      const pathsToTry = [];
      for (const folder of folders) {
        for (const key of candidateKeys) {
          pathsToTry.push(`/product_episodes/${folder}/${key}.json`);
        }
      }

      let sawMissing = false;
      for (const path of pathsToTry) {
        try {
          const res = await fetch(path, { cache: 'no-store' });
          if (res.status === 404) {
            sawMissing = true;
            continue;
          }
          if (!res.ok) continue;

          const json = await res.json();
          const normalized = normalizeEpisodes(json);

          // File exists but has no episodes.
          if (normalized.length === 0) {
            if (!canceled) {
              setEpisodes([]);
              setSourceUrl(path);
              setUsingLanguageFallback(!!markFallback);
            }
            return { ok: true, missing: false };
          }

          if (!canceled) {
            setEpisodes(normalized);
            setSourceUrl(path);
            setUsingLanguageFallback(!!markFallback);
            setSelectedEpisodeIndex((prev) => Math.max(0, Math.min(prev, Math.max(0, normalized.length - 1))));
          }
          return { ok: true, missing: false };
        } catch {
          // Keep trying.
        }
      }

      return { ok: false, missing: sawMissing };
    };

    const run = async () => {
      setLoading(true);
      setMissingFile(false);
      setUsingLanguageFallback(false);

      // Primary language first.
      const primary = await tryFetchFromFolders({ folders: langFolders, markFallback: false });
      if (primary.ok) {
        if (!canceled) {
          setMissingFile(false);
          setLoading(false);
        }
        return;
      }

      // Language fallback (backup) only if primary failed.
      const secondary = await tryFetchFromFolders({ folders: fallbackLangFolders, markFallback: true });

      if (secondary.ok) {
        if (!canceled) {
          setMissingFile(primary.missing);
          setLoading(false);
        }
        return;
      }

      // Global fallback (Tirant lo Blanc) if product-specific JSON missing.
      const setState = ({ episodes, sourceUrl, usingLanguageFallback }) => {
        if (canceled) return;
        setEpisodes(episodes);
        setSourceUrl(sourceUrl);
        setUsingLanguageFallback(!!usingLanguageFallback);
        setSelectedEpisodeIndex((prev) => Math.max(0, Math.min(prev, Math.max(0, episodes.length - 1))));
      };

      const globalPrimary = await fetchGlobalFallback({
        language,
        markFallback: false,
        setState
      });

      if (globalPrimary.ok) {
        if (!canceled) {
          setMissingFile(true);
          setLoading(false);
        }
        return;
      }

      const globalSecondary = await fetchGlobalFallback({
        language: fallbackLanguage,
        markFallback: true,
        setState
      });

      if (!canceled) {
        setMissingFile(true);
        setLoading(false);
        if (!globalSecondary.ok) {
          // Nothing else to do.
        }
      }
    };

    run();
    return () => {
      canceled = true;
    };
  }, [product, candidateKeys, langFolders, fallbackLangFolders, storageBaseKey, language, fallbackLanguage]);

  // Persist selected index.
  useEffect(() => {
    if (!product) return;
    const indexKey = `${storageBaseKey}::index`;
    localStorage.setItem(indexKey, selectedEpisodeIndex.toString());
  }, [product, selectedEpisodeIndex, storageBaseKey]);

  // Persist edits (episodes array).
  useEffect(() => {
    if (!product) return;
    // If we're currently showing the other language as a runtime fallback, do NOT persist
    // those episodes under the primary language namespace.
    if (usingLanguageFallback) return;
    const versionKey = `${storageBaseKey}::v`;
    const episodesKey = `${storageBaseKey}::episodes`;
    localStorage.setItem(versionKey, EPISODES_STORAGE_VERSION);
    localStorage.setItem(episodesKey, JSON.stringify(Array.isArray(episodes) ? episodes : []));
  }, [product, episodes, storageBaseKey, usingLanguageFallback]);

  const safeEpisodes = Array.isArray(episodes) ? episodes : [];
  const currentEpisode = safeEpisodes[selectedEpisodeIndex] || safeEpisodes[0] || null;

  const setEpisodeText = (index, text) => {
    setEpisodes((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      if (!arr[index]) return arr;
      const next = [...arr];
      next[index] = { ...next[index], text: (text || '').toString() };
      return next;
    });
  };

  return {
    episodes: safeEpisodes,
    currentEpisode,
    selectedEpisodeIndex,
    setSelectedEpisodeIndex,
    setEpisodeText,
    loading,
    missingFile,
    usingLanguageFallback,
    sourceUrl,
    candidateKeys
  };
}
