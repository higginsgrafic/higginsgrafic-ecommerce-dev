import { useEffect } from 'react';
import { touchMegaPublicActivity } from '@/components/fullwide/megaPublicSelectorState.js';

const ALLOWED = new Set(['first_contact', 'the_human_inside', 'austen', 'cube', 'miscellania']);

/**
 * Syncs the `active` collection state to the `?active=` or `?collection=` URL
 * query param whenever the location's search string changes.
 *
 * @param {string} search - the current `location.search`
 * @param {(value: string) => void} setActive - setter for the active state
 */
export default function useUrlActiveCollection(search, setActive) {
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const p = new URLSearchParams(search);
      const fromUrl = p.get('active') || p.get('collection') || '';
      const next = typeof fromUrl === 'string' ? fromUrl.trim() : '';
      if (next && ALLOWED.has(next)) {
        setActive(next);
        touchMegaPublicActivity();
      }
    } catch {
      // ignore
    }
  }, [search, setActive]);
}
