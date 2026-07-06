import { useCallback, useEffect, useState } from 'react';
import {
  fetchCalibrationByVersion,
  fetchCalibrationHistory,
  fetchLatestCalibration,
  publishCalibration,
} from '@/api/calibrations';
import {
  applyCalibrationSnapshot,
  isCalibrationKey,
  readCalibrationSnapshot,
} from '@/utils/calibrationKeys';

const HUD_STORAGE_KEY = 'hg.calibrationsHud.collapsed';

function readCollapsed() {
  try {
    return window.localStorage.getItem(HUD_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed) {
  try {
    window.localStorage.setItem(HUD_STORAGE_KEY, collapsed ? '1' : '0');
  } catch {
    // ignore
  }
}

function formatDate(value) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    return date.toLocaleString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
}

function snapshotKeyCount(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return 0;
  return Object.keys(snapshot).length;
}

const buttonBase = {
  border: '1px solid rgba(71, 80, 89, 0.2)',
  borderRadius: '999px',
  padding: '4px 9px',
  fontSize: '12px',
  background: '#fff',
  color: '#475059',
  cursor: 'pointer',
  fontFamily: 'Roboto Condensed, sans-serif',
};

const dangerButton = {
  ...buttonBase,
  background: '#dc2626',
  color: '#fff',
  borderColor: '#dc2626',
};

const ghostButton = {
  ...buttonBase,
  background: 'transparent',
};

function CalibrationsHud() {
  const [collapsed, setCollapsed] = useState(() => readCollapsed());
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [latestRow, historyRows] = await Promise.all([
        fetchLatestCalibration(),
        fetchCalibrationHistory(10),
      ]);
      setLatest(latestRow);
      setHistory(historyRows);
    } catch (e) {
      setError(e?.message || 'Error obtenint dades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  useEffect(() => {
    writeCollapsed(collapsed);
  }, [collapsed]);

  const localKeyCount = snapshotKeyCount(readCalibrationSnapshot());

  const handleCloneToNamespace = useCallback((ns) => {
    if (busy) return;
    const prefix = `${ns}_`;
    const keysToClone = [
      'MEGA_STRIPE_REF_ENABLED',
      'MEGA_STRIPE_REF_SRC',
      'MEGA_STRIPE_REF2_ENABLED',
      'MEGA_STRIPE_REF2_SRC',
      'MEGA_STRIPE_SPRITE_ENABLED',
      'MEGA_STRIPE_TILE_GAP_PX',
      'HG_SHIRT_DRAWING_ENABLED',
      'HG_SHIRT_DRAWING_OVERLAY_ENABLED',
      'HG_DRAWING_OVERLAY_SRC',
      'MEGA_TILE_SELECTOR_ENABLED',
      'MEGA_TILE_SELECTOR_TARGET',
      'MEGA_TILE_SELECTOR_SIZE_PX',
      'MEGA_TILE_SELECTOR_STROKE_PX',
      'MEGA_TILE_SELECTOR_COLOR',
      'MEGA_TILE_SELECTOR_STEP_X',
      'MEGA_TILE_SELECTOR_STEP_Y',
      'MEGA_TILE_SELECTOR_RADIUS_PX',
      'MEGA_TILE_SELECTOR_EXTEND_TOP_PX',
      'MEGA_TILE_SELECTOR_EXTEND_RIGHT_PX',
      'MEGA_TILE_SELECTOR_EXTEND_BOTTOM_PX',
      'MEGA_TILE_SELECTOR_EXTEND_LEFT_PX',
      'MEGA_TILE_SELECTOR_V2_ENABLED',
      'MEGA_TILE_SELECTOR_V2_TARGET',
      'MEGA_TILE_SELECTOR_V2_SIZE_PX',
      'MEGA_TILE_SELECTOR_V2_STROKE_PX',
      'MEGA_TILE_SELECTOR_V2_COLOR',
      'MEGA_TILE_SELECTOR_V2_STEP_X',
      'MEGA_TILE_SELECTOR_V2_STEP_Y',
      'MEGA_TILE_SELECTOR_V2_RADIUS_PX',
      'MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX',
      'MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX',
      'MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX',
      'MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX',
    ];
    let count = 0;
    try {
      keysToClone.forEach((key) => {
        const raw = window.localStorage.getItem(key);
        if (raw == null) return;
        window.localStorage.setItem(`${prefix}${key}`, raw);
        count += 1;
      });
      // Dispatch events so hooks pick up the change
      keysToClone.forEach((key) => {
        const evtMap = {
          MEGA_STRIPE_REF_ENABLED: 'mega-stripe-ref-changed',
          MEGA_STRIPE_REF_SRC: 'mega-stripe-ref-changed',
          MEGA_STRIPE_REF2_ENABLED: 'mega-stripe-ref2-changed',
          MEGA_STRIPE_REF2_SRC: 'mega-stripe-ref2-changed',
          MEGA_STRIPE_SPRITE_ENABLED: 'mega-stripe-sprite-enabled-changed',
          MEGA_STRIPE_TILE_GAP_PX: 'mega-stripe-tile-gap-changed',
          HG_SHIRT_DRAWING_ENABLED: 'hg-shirt-drawing-enabled-changed',
          HG_SHIRT_DRAWING_OVERLAY_ENABLED: 'hg-shirt-drawing-overlay-enabled-changed',
          HG_DRAWING_OVERLAY_SRC: 'hg-drawing-overlay-changed',
        };
        const evt = evtMap[key];
        if (evt) window.dispatchEvent(new Event(`${prefix}${evt}`));
      });
      window.dispatchEvent(new Event(`${prefix}mega-tile-selector-changed`));
      setInfo(`Clonades ${count} claus a ${ns}_`);
    } catch (e) {
      setError(e?.message || 'Error clonant');
    }
  }, [busy]);

  const handlePublish = useCallback(async () => {
    if (!unlocked || busy) return;
    const snapshot = readCalibrationSnapshot();
    const count = Object.keys(snapshot).length;
    const message = `Publicar calibratge actual?\n\nClaus a publicar: ${count}\nÚltima publicació: ${latest ? formatDate(latest.created_at) : '—'}\n\nAquesta acció afegirà una nova versió al servidor.`;
    if (!window.confirm(message)) return;
    const label = window.prompt('Etiqueta (opcional)', '') || 'manual';
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await publishCalibration(snapshot, label);
      setInfo('Publicat correctament');
      setUnlocked(false);
      await refresh();
    } catch (e) {
      setError(e?.message || 'Error publicant');
    } finally {
      setBusy(false);
    }
  }, [unlocked, busy, latest, refresh]);

  const handleReloadFromServer = useCallback(async () => {
    if (busy) return;
    if (!latest) {
      setError('No hi ha cap calibratge al servidor');
      return;
    }
    const localCount = Object.keys(readCalibrationSnapshot()).length;
    if (!window.confirm(`Sobreescriure ${localCount} claus locals amb el calibratge del servidor (${snapshotKeyCount(latest.data)} claus)?\n\nEs perdran els canvis locals no publicats.`)) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      applyCalibrationSnapshot(latest.data || {});
      setInfo('Calibratge aplicat. Es recarregarà la pàgina…');
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setError(e?.message || 'Error aplicant calibratge');
      setBusy(false);
    }
  }, [busy, latest]);

  const handleRestoreVersion = useCallback(async (versionId) => {
    if (busy) return;
    if (!window.confirm('Restaurar aquesta versió?\n\nEs sobreescriurà el calibratge local i es recarregarà la pàgina.')) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const row = await fetchCalibrationByVersion(versionId);
      if (!row || !row.data) {
        throw new Error('Versió no trobada');
      }
      applyCalibrationSnapshot(row.data);
      setInfo('Versió restaurada. Es recarregarà la pàgina…');
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setError(e?.message || 'Error restaurant');
      setBusy(false);
    }
  }, [busy]);

  return (
    <div
      className="debug-exempt"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 16,
        transform: 'translateX(-50%)',
        width: collapsed ? 'auto' : undefined,
        maxWidth: 'calc(100vw - 32px)',
        background: '#fff',
        border: '1px solid rgba(71, 80, 89, 0.18)',
        borderRadius: 12,
        boxShadow: '0 14px 40px rgba(15, 23, 42, 0.16)',
        color: '#475059',
        fontFamily: 'Roboto Condensed, sans-serif',
        fontSize: 12,
        zIndex: 200000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column-reverse',
      }}
    >
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '8px 12px',
          background: '#475059',
          color: '#fff',
          border: 0,
          cursor: 'pointer',
          fontFamily: 'Roboto Condensed, sans-serif',
          fontSize: 12,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <span>Calibratges</span>
        <span style={{ opacity: 0.8 }}>{collapsed ? '▸' : '▾'}</span>
      </button>

      {collapsed ? null : (
        <div style={{ padding: 12, display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <div><strong>Local:</strong> {localKeyCount} claus</div>
            <div><strong>Servidor:</strong> {latest ? `${snapshotKeyCount(latest.data)} claus · ${formatDate(latest.created_at)}${latest.label ? ` · ${latest.label}` : ''}` : (loading ? 'carregant…' : 'cap publicació')}</div>
          </div>

          {error ? (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 8px', borderRadius: 6 }}>{error}</div>
          ) : null}
          {info ? (
            <div style={{ background: '#ecfdf5', color: '#065f46', padding: '6px 8px', borderRadius: 6 }}>{info}</div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              type="button"
              style={{ ...ghostButton, opacity: busy ? 0.6 : 1 }}
              disabled={busy}
              onClick={refresh}
            >
              Refrescar
            </button>
            <button
              type="button"
              style={{ ...ghostButton, opacity: (busy || !latest) ? 0.6 : 1 }}
              disabled={busy || !latest}
              onClick={handleReloadFromServer}
            >
              Recarregar del servidor
            </button>
          </div>

          <div style={{ borderTop: '1px solid rgba(71, 80, 89, 0.12)', paddingTop: 8, display: 'grid', gap: 6 }}>
            <div style={{ fontWeight: 600 }}>Clonar calibratge</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button
                type="button"
                style={{ ...ghostButton, opacity: busy ? 0.6 : 1 }}
                disabled={busy}
                onClick={() => handleCloneToNamespace('p2')}
              >
                Clonar a p2
              </button>
              <button
                type="button"
                style={{ ...ghostButton, opacity: busy ? 0.6 : 1 }}
                disabled={busy}
                onClick={() => {
                  if (!window.confirm('Eliminar totes les claus p2_?')) return;
                  try {
                    const toRemove = [];
                    for (let i = 0; i < window.localStorage.length; i++) {
                      const k = window.localStorage.key(i);
                      if (k && k.startsWith('p2_')) toRemove.push(k);
                    }
                    toRemove.forEach((k) => window.localStorage.removeItem(k));
                    setInfo(`Eliminades ${toRemove.length} claus p2_`);
                  } catch (e) {
                    setError(e?.message || 'Error netejant');
                  }
                }}
              >
                Netejar p2
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(71, 80, 89, 0.12)', paddingTop: 8, display: 'grid', gap: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={unlocked}
                onChange={(event) => setUnlocked(event.target.checked)}
              />
              Desbloquejar publicació
            </label>
            <button
              type="button"
              style={{ ...(unlocked ? dangerButton : buttonBase), opacity: (busy || !unlocked) ? 0.6 : 1 }}
              disabled={busy || !unlocked}
              onClick={handlePublish}
            >
              Publicar al servidor
            </button>
          </div>

          {history.length > 0 ? (
            <div style={{ borderTop: '1px solid rgba(71, 80, 89, 0.12)', paddingTop: 8, display: 'grid', gap: 6 }}>
              <div style={{ fontWeight: 600 }}>Historial</div>
              <div style={{ display: 'grid', gap: 4, maxHeight: 180, overflow: 'auto' }}>
                {history.map((row) => (
                  <div
                    key={row.version_id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formatDate(row.created_at)}{row.label ? ` · ${row.label}` : ''}
                    </span>
                    <button
                      type="button"
                      style={{ ...ghostButton, opacity: busy ? 0.6 : 1 }}
                      disabled={busy}
                      onClick={() => handleRestoreVersion(row.version_id)}
                    >
                      Restaurar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default CalibrationsHud;
