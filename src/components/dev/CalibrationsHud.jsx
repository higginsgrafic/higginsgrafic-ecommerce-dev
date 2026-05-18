import { useCallback, useEffect, useState } from 'react';
import {
  fetchCalibrationByVersion,
  fetchCalibrationHistory,
  fetchLatestCalibration,
  publishCalibration,
} from '@/api/calibrations';
import {
  applyCalibrationSnapshot,
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
        left: 'calc((var(--belt2-xL, 16px) + var(--belt2-xR, calc(100vw - 16px))) / 2 + 8px)',
        right: 'calc(100vw - var(--belt2-xR, calc(100vw - 16px)))',
        bottom: 'calc(100vh - var(--belt2-debug-yB, calc(100vh - 360px)) - 8px - 34px)',
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
