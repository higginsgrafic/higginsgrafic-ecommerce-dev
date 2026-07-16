import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  STRIPE_DRAWING_CALIBRATIONS,
  SHIRT_DRAWING_OVERLAY_DEFAULTS,
  STRIPE_DRAWING_OVERLAY_DEFAULTS,
  STRIPE_LAYOUT_DEFAULTS,
} from '@/config/stripeCalibrations';
import {
  clampScale,
  canonicalStripeDrawingOverlayKey,
} from '@/utils/megaStripeCalibration';
import useDraftInput from '@/hooks/useDraftInput';

export default function useMegaStripeDebugState({ beltEnabledFromUrl, locationPathname }) {
  // ─── State declarations ─────────────────────────────────────────────
  const [megaStripeDx, setMegaStripeDx] = useState(0);
  const [megaStripeDy, setMegaStripeDy] = useState(0);
  const [megaStripeSpriteEnabled, setMegaStripeSpriteEnabled] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_STRIPE_SPRITE_ENABLED');
      if (raw == null) return true;
      const v = String(raw).trim().toLowerCase();
      if (v === '') return true;
      return v === '1' || v === 'true' || v === 'on' || v === 'yes';
    } catch {
      return true;
    }
  });
  const [megaStripeBeltEnabled, setMegaStripeBeltEnabled] = useState(beltEnabledFromUrl);
  const [megaStripeOverlayMode, setMegaStripeOverlayMode] = useState('off');
  const [megaShirtDrawingEnabled, setMegaShirtDrawingEnabled] = useState(() => {
    try {
      const parseBool = (raw, fallback = true) => {
        if (raw == null) return fallback;
        const v = String(raw).trim().toLowerCase();
        if (v === '') return fallback;
        return v === '1' || v === 'true' || v === 'on' || v === 'yes';
      };
      const rawNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
      if (rawNew != null) return parseBool(rawNew, true);
      const rawOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
      if (rawOld != null) return parseBool(rawOld, true);
      return true;
    } catch {
      return true;
    }
  });
  const [megaShirtDrawingOverlayDx, setMegaShirtDrawingOverlayDx] = useState(SHIRT_DRAWING_OVERLAY_DEFAULTS.dx);
  const [megaShirtDrawingOverlayDy, setMegaShirtDrawingOverlayDy] = useState(SHIRT_DRAWING_OVERLAY_DEFAULTS.dy);
  const [megaShirtDrawingOverlayScale, setMegaShirtDrawingOverlayScale] = useState(SHIRT_DRAWING_OVERLAY_DEFAULTS.scale);
  const [megaStripeDrawingOverlayDx, setMegaStripeDrawingOverlayDx] = useState(STRIPE_DRAWING_OVERLAY_DEFAULTS.dx);
  const [megaStripeDrawingOverlayDy, setMegaStripeDrawingOverlayDy] = useState(STRIPE_DRAWING_OVERLAY_DEFAULTS.dy);
  const [megaStripeDrawingOverlayScale, setMegaStripeDrawingOverlayScale] = useState(STRIPE_DRAWING_OVERLAY_DEFAULTS.scale);
  const [megaShirtDrawingOverlaySrc, setMegaShirtDrawingOverlaySrc] = useState(() => {
    try {
      return String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || '');
    } catch {
      return '';
    }
  });
  const [megaStripeOverlayDx, setMegaStripeOverlayDx] = useState(0);
  const [megaStripeOverlayDy, setMegaStripeOverlayDy] = useState(0);
  const [megaStripeOverlayScale, setMegaStripeOverlayScale] = useState(STRIPE_LAYOUT_DEFAULTS.overlayScale);
  const [megaStripeScale, setMegaStripeScale] = useState(STRIPE_LAYOUT_DEFAULTS.stripe.scale);
  const [megaStripeRefEnabled, setMegaStripeRefEnabled] = useState(false);
  const [megaStripeRefSrc, setMegaStripeRefSrc] = useState('');
  const [megaStripeRef2Enabled, setMegaStripeRef2Enabled] = useState(false);
  const [megaStripeRef2Src, setMegaStripeRef2Src] = useState('');
  const [megaStripeRefCollection, setMegaStripeRefCollection] = useState('first_contact');
  const [megaStripeRefDx, setMegaStripeRefDx] = useState(0);
  const [megaStripeRefDy, setMegaStripeRefDy] = useState(0);
  const [megaStripeRefScale, setMegaStripeRefScale] = useState(1);
  const [megaStripeRef2Dx, setMegaStripeRef2Dx] = useState(STRIPE_LAYOUT_DEFAULTS.ref2.dx);
  const [megaStripeRef2Dy, setMegaStripeRef2Dy] = useState(STRIPE_LAYOUT_DEFAULTS.ref2.dy);
  const [megaStripeRef2Scale, setMegaStripeRef2Scale] = useState(STRIPE_LAYOUT_DEFAULTS.ref2.scale);
  const [stripeEditTool, setStripeEditTool] = useState('ref');
  const [megaStripeNudgeStep, setMegaStripeNudgeStep] = useState(1);
  const [megaStripeTileGapPx, setMegaStripeTileGapPx] = useState(0);

  const [megaTileSelectorV1Enabled, setMegaTileSelectorV1Enabled] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_ENABLED');
      if (raw == null) return false;
      const v = String(raw).trim().toLowerCase();
      if (v === '') return true;
      return v === '1' || v === 'true' || v === 'on' || v === 'yes';
    } catch {
      return false;
    }
  });
  const [megaTileSelectorEnabled, setMegaTileSelectorEnabled] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_ENABLED');
      if (raw == null) return true;
      const v = String(raw).trim().toLowerCase();
      if (v === '') return true;
      return v === '1' || v === 'true' || v === 'on' || v === 'yes';
    } catch {
      return true;
    }
  });
  const [megaTileSelectorTarget, setMegaTileSelectorTarget] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_TARGET');
      return raw == null ? 'NCC-1701-D' : String(raw);
    } catch {
      return 'NCC-1701-D';
    }
  });
  const [megaTileSelectorSizePx, setMegaTileSelectorSizePx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_SIZE_PX');
      const n = raw == null ? 200 : Number.parseFloat(String(raw));
      return Number.isFinite(n) && n > 0 ? n : 200;
    } catch {
      return 200;
    }
  });
  const [megaTileSelectorStrokePx, setMegaTileSelectorStrokePx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STROKE_PX');
      const n = raw == null ? 10 : Number.parseFloat(String(raw));
      return Number.isFinite(n) && n >= 0 ? n : 10;
    } catch {
      return 10;
    }
  });
  const [megaTileSelectorColor, setMegaTileSelectorColor] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_COLOR');
      return raw == null ? 'black' : String(raw);
    } catch {
      return 'black';
    }
  });
  const [megaTileSelectorStepX, setMegaTileSelectorStepX] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_X');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(99, Math.max(-99, n)) : 0;
    } catch {
      return 0;
    }
  });
  const [megaTileSelectorStepY, setMegaTileSelectorStepY] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_Y');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(99, Math.max(-99, n)) : 0;
    } catch {
      return 0;
    }
  });
  const [megaTileSelectorRadiusPx, setMegaTileSelectorRadiusPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_RADIUS_PX');
      const n = raw == null ? 8 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(200, Math.max(0, n)) : 8;
    } catch {
      return 8;
    }
  });
  const [megaTileSelectorExtendTopPx, setMegaTileSelectorExtendTopPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX');
      const n = raw == null ? 30 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(500, Math.max(-500, n)) : 30;
    } catch {
      return 30;
    }
  });
  const [megaTileSelectorExtendRightPx, setMegaTileSelectorExtendRightPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(500, Math.max(-500, n)) : 0;
    } catch {
      return 0;
    }
  });
  const [megaTileSelectorExtendBottomPx, setMegaTileSelectorExtendBottomPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(500, Math.max(-500, n)) : 0;
    } catch {
      return 0;
    }
  });
  const [megaTileSelectorExtendLeftPx, setMegaTileSelectorExtendLeftPx] = useState(() => {
    try {
      const raw = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX');
      const n = raw == null ? 0 : Number.parseFloat(String(raw));
      return Number.isFinite(n) ? Math.min(500, Math.max(-500, n)) : 0;
    } catch {
      return 0;
    }
  });

  // ─── Draft inputs ───────────────────────────────────────────────────
  const { focusedRef: megaStripeOverlayScaleInputFocusedRef, draft: megaStripeOverlayScaleDraft, setDraft: setMegaStripeOverlayScaleDraft } = useDraftInput(megaStripeOverlayScale);
  const { focusedRef: megaStripeDrawingOverlayDxInputFocusedRef, draft: megaStripeDrawingOverlayDxDraft, setDraft: setMegaStripeDrawingOverlayDxDraft } = useDraftInput(megaStripeDrawingOverlayDx);
  const { focusedRef: megaStripeDrawingOverlayDyInputFocusedRef, draft: megaStripeDrawingOverlayDyDraft, setDraft: setMegaStripeDrawingOverlayDyDraft } = useDraftInput(megaStripeDrawingOverlayDy);
  const { focusedRef: megaStripeDrawingOverlayScaleInputFocusedRef, draft: megaStripeDrawingOverlayScaleDraft, setDraft: setMegaStripeDrawingOverlayScaleDraft } = useDraftInput(megaStripeDrawingOverlayScale);
  const { focusedRef: megaStripeDxInputFocusedRef, draft: megaStripeDxDraft, setDraft: setMegaStripeDxDraft } = useDraftInput(megaStripeDx);
  const { focusedRef: megaStripeDyInputFocusedRef, draft: megaStripeDyDraft, setDraft: setMegaStripeDyDraft } = useDraftInput(megaStripeDy);
  const { focusedRef: megaStripeScaleInputFocusedRef, draft: megaStripeScaleDraft, setDraft: setMegaStripeScaleDraft } = useDraftInput(megaStripeScale);
  const { focusedRef: megaStripeRefDxInputFocusedRef, draft: megaStripeRefDxDraft, setDraft: setMegaStripeRefDxDraft } = useDraftInput(megaStripeRefDx);
  const { focusedRef: megaStripeRefDyInputFocusedRef, draft: megaStripeRefDyDraft, setDraft: setMegaStripeRefDyDraft } = useDraftInput(megaStripeRefDy);
  const { focusedRef: megaStripeRefScaleInputFocusedRef, draft: megaStripeRefScaleDraft, setDraft: setMegaStripeRefScaleDraft } = useDraftInput(megaStripeRefScale);
  const { focusedRef: megaStripeRef2DxInputFocusedRef, draft: megaStripeRef2DxDraft, setDraft: setMegaStripeRef2DxDraft } = useDraftInput(megaStripeRef2Dx);
  const { focusedRef: megaStripeRef2DyInputFocusedRef, draft: megaStripeRef2DyDraft, setDraft: setMegaStripeRef2DyDraft } = useDraftInput(megaStripeRef2Dy);
  const { focusedRef: megaStripeRef2ScaleInputFocusedRef, draft: megaStripeRef2ScaleDraft, setDraft: setMegaStripeRef2ScaleDraft } = useDraftInput(megaStripeRef2Scale);
  const { focusedRef: megaStripeTileGapPxInputFocusedRef, draft: megaStripeTileGapPxDraft, setDraft: setMegaStripeTileGapPxDraft } = useDraftInput(megaStripeTileGapPx || 0);
  const { focusedRef: megaTileSelectorSizePxInputFocusedRef, draft: megaTileSelectorSizePxDraft, setDraft: setMegaTileSelectorSizePxDraft } = useDraftInput(megaTileSelectorSizePx || 0);
  const { focusedRef: megaTileSelectorStrokePxInputFocusedRef, draft: megaTileSelectorStrokePxDraft, setDraft: setMegaTileSelectorStrokePxDraft } = useDraftInput(megaTileSelectorStrokePx || 0);
  const { focusedRef: megaTileSelectorStepXInputFocusedRef, draft: megaTileSelectorStepXDraft, setDraft: setMegaTileSelectorStepXDraft } = useDraftInput(megaTileSelectorStepX || 0);
  const { focusedRef: megaTileSelectorStepYInputFocusedRef, draft: megaTileSelectorStepYDraft, setDraft: setMegaTileSelectorStepYDraft } = useDraftInput(megaTileSelectorStepY || 0);
  const { focusedRef: megaTileSelectorRadiusPxInputFocusedRef, draft: megaTileSelectorRadiusPxDraft, setDraft: setMegaTileSelectorRadiusPxDraft } = useDraftInput(megaTileSelectorRadiusPx || 0);
  const { focusedRef: megaTileSelectorExtendTopPxInputFocusedRef, draft: megaTileSelectorExtendTopPxDraft, setDraft: setMegaTileSelectorExtendTopPxDraft } = useDraftInput(megaTileSelectorExtendTopPx || 0);
  const { focusedRef: megaTileSelectorExtendRightPxInputFocusedRef, draft: megaTileSelectorExtendRightPxDraft, setDraft: setMegaTileSelectorExtendRightPxDraft } = useDraftInput(megaTileSelectorExtendRightPx || 0);
  const { focusedRef: megaTileSelectorExtendBottomPxInputFocusedRef, draft: megaTileSelectorExtendBottomPxDraft, setDraft: setMegaTileSelectorExtendBottomPxDraft } = useDraftInput(megaTileSelectorExtendBottomPx || 0);
  const { focusedRef: megaTileSelectorExtendLeftPxInputFocusedRef, draft: megaTileSelectorExtendLeftPxDraft, setDraft: setMegaTileSelectorExtendLeftPxDraft } = useDraftInput(megaTileSelectorExtendLeftPx || 0);

  // ─── HUD state ──────────────────────────────────────────────────────
  const [megaStripeHudTopPx, setMegaStripeHudTopPx] = useState(null);
  const [megaStripeHudLockedTopPx, setMegaStripeHudLockedTopPx] = useState(() => {
    try {
      const raw = window?.localStorage?.getItem?.('MEGA_STRIPE_HUD_LOCKED_TOP');
      const n = raw == null ? NaN : Number.parseFloat(String(raw));
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  });
  const [megaStripeHudLockedHPx, setMegaStripeHudLockedHPx] = useState(null);
  const [megaStripeHudOwnHPx, setMegaStripeHudOwnHPx] = useState(() => {
    try {
      const raw = window?.localStorage?.getItem?.('MEGA_STRIPE_HUD_OWN_H');
      const n = raw == null ? NaN : Number.parseFloat(String(raw));
      return Number.isFinite(n) && n > 120 ? n : 360;
    } catch {
      return 360;
    }
  });
  const [megaStripeHudMaxRefPresets, setMegaStripeHudMaxRefPresets] = useState(12);
  const megaStripeHudWrapRef = useRef(null);
  const megaStripeParamsGridRef = useRef(null);
  const megaStripeLastGoodHudTopPxRef = useRef(null);
  const [megaStripeHudSnapDyPx, setMegaStripeHudSnapDyPx] = useState(0);
  const [hudCollapsed, setHudCollapsed] = useState(true);
  const [hudActiveTab, setHudActiveTab] = useState('stripe');
  const megaStripeLastNonOffOverlayModeRef = useRef('black');
  const prevMegaStripeOverlayModeRef = useRef('off');

  // ─── Effects: load from localStorage on mount ───────────────────────
  useEffect(() => {
    try {
      const rawDx = window.localStorage.getItem('MEGA_STRIPE_DX');
      const rawDy = window.localStorage.getItem('MEGA_STRIPE_DY');
      const rawSpriteEnabled = window.localStorage.getItem('MEGA_STRIPE_SPRITE_ENABLED');
      const rawBelt = window.localStorage.getItem('MEGA_STRIPE_BELT');
      const rawOverlayMode = window.localStorage.getItem('MEGA_STRIPE_OVERLAY_MODE');
      const rawShirtDrawingEnabledNew = window.localStorage.getItem('HG_SHIRT_DRAWING_ENABLED');
      const rawShirtDrawingEnabledOld = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_ENABLED');
      const rawDrawingOverlaySrc = window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC');
      const rawShirtOverlayDx = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_DX');
      const rawShirtOverlayDy = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_DY');
      const rawShirtOverlayScale = window.localStorage.getItem('HG_SHIRT_DRAWING_OVERLAY_SCALE');
      const rawStripeDrawingDx = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_DX');
      const rawStripeDrawingDy = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_DY');
      const rawStripeDrawingScale = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_SCALE');
      const rawStripeDrawingMap = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
      const rawOverlayDx = window.localStorage.getItem('MEGA_STRIPE_OVERLAY_DX');
      const rawOverlayDy = window.localStorage.getItem('MEGA_STRIPE_OVERLAY_DY');
      const rawOverlayScale = window.localStorage.getItem('MEGA_STRIPE_OVERLAY_SCALE');
      const rawScale = window.localStorage.getItem('MEGA_STRIPE_SCALE');
      const rawRefEnabled = window.localStorage.getItem('MEGA_STRIPE_REF_ENABLED');
      const rawRefSrc = window.localStorage.getItem('MEGA_STRIPE_REF_SRC');
      const rawRefCol = window.localStorage.getItem('MEGA_STRIPE_REF_COLLECTION');
      const rawRefDx = window.localStorage.getItem('MEGA_STRIPE_REF_DX');
      const rawRefDy = window.localStorage.getItem('MEGA_STRIPE_REF_DY');
      const rawRefScale = window.localStorage.getItem('MEGA_STRIPE_REF_SCALE');
      const rawRef2Enabled = window.localStorage.getItem('MEGA_STRIPE_REF2_ENABLED');
      const rawRef2Src = window.localStorage.getItem('MEGA_STRIPE_REF2_SRC');
      const rawRef2Dx = window.localStorage.getItem('MEGA_STRIPE_REF2_DX');
      const rawRef2Dy = window.localStorage.getItem('MEGA_STRIPE_REF2_DY');
      const rawRef2Scale = window.localStorage.getItem('MEGA_STRIPE_REF2_SCALE');
      const rawNudge = window.localStorage.getItem('MEGA_STRIPE_NUDGE_STEP');
      const rawTileGap = window.localStorage.getItem('MEGA_STRIPE_TILE_GAP_PX');
      const rawTileSelectorV1Enabled = window.localStorage.getItem('MEGA_TILE_SELECTOR_ENABLED');
      const rawTileSelectorEnabled = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_ENABLED');
      const rawTileSelectorTarget = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_TARGET');
      const rawTileSelectorSize = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_SIZE_PX');
      const rawTileSelectorStroke = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STROKE_PX');
      const rawTileSelectorColor = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_COLOR');
      const rawTileSelectorStepX = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_X');
      const rawTileSelectorStepY = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_STEP_Y');
      const rawTileSelectorRadius = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_RADIUS_PX');
      const rawTileSelectorExtTop = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX');
      const rawTileSelectorExtRight = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX');
      const rawTileSelectorExtBottom = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX');
      const rawTileSelectorExtLeft = window.localStorage.getItem('MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX');
      const dx = rawDx == null ? 0 : Number.parseFloat(String(rawDx));
      const dy = rawDy == null ? 0 : Number.parseFloat(String(rawDy));
      if (Number.isFinite(dx)) setMegaStripeDx(dx);
      if (Number.isFinite(dy)) setMegaStripeDy(dy);
      if (rawSpriteEnabled != null) {
        const v = String(rawSpriteEnabled).trim().toLowerCase();
        setMegaStripeSpriteEnabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      }
      if (beltEnabledFromUrl) {
        setMegaStripeBeltEnabled(true);
      } else if (rawBelt != null) {
        setMegaStripeBeltEnabled(rawBelt === '1');
      }
      setMegaStripeOverlayMode('off');
      if (rawShirtDrawingEnabledNew != null) {
        const v = String(rawShirtDrawingEnabledNew).trim().toLowerCase();
        setMegaShirtDrawingEnabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      } else if (rawShirtDrawingEnabledOld != null) {
        const v = String(rawShirtDrawingEnabledOld).trim().toLowerCase();
        setMegaShirtDrawingEnabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      }
      if (rawShirtOverlayDx != null) {
        const n = Number.parseFloat(String(rawShirtOverlayDx));
        if (Number.isFinite(n)) setMegaShirtDrawingOverlayDx(n);
      }
      if (rawShirtOverlayDy != null) {
        const n = Number.parseFloat(String(rawShirtOverlayDy));
        if (Number.isFinite(n)) setMegaShirtDrawingOverlayDy(n);
      }
      if (rawShirtOverlayScale != null) {
        const n = Number.parseFloat(String(rawShirtOverlayScale));
        if (Number.isFinite(n) && n > 0) setMegaShirtDrawingOverlayScale(clampScale(n, 1));
      }

      const overlayKey = String(rawDrawingOverlaySrc || '').trim();
      const canonicalOverlayKey = canonicalStripeDrawingOverlayKey(overlayKey);
      let picked = null;
      try {
        const parsed = rawStripeDrawingMap ? JSON.parse(String(rawStripeDrawingMap)) : null;
        if (parsed && typeof parsed === 'object' && (canonicalOverlayKey || overlayKey)) {
          const v = (canonicalOverlayKey && parsed[canonicalOverlayKey]) || (overlayKey && parsed[overlayKey]);
          if (v && typeof v === 'object') picked = v;
        }
      } catch {
        picked = null;
      }
      if (!picked && (canonicalOverlayKey || overlayKey)) {
        const fromDefaults = (canonicalOverlayKey && STRIPE_DRAWING_CALIBRATIONS[canonicalOverlayKey]) || STRIPE_DRAWING_CALIBRATIONS[overlayKey];
        if (fromDefaults && typeof fromDefaults === 'object') picked = fromDefaults;
      }

      const stripeDrawingDxFallbackRaw = picked?.dx ?? (rawStripeDrawingDx != null ? rawStripeDrawingDx : rawShirtOverlayDx);
      const stripeDrawingDyFallbackRaw = picked?.dy ?? (rawStripeDrawingDy != null ? rawStripeDrawingDy : rawShirtOverlayDy);
      const stripeDrawingScaleFallbackRaw = picked?.scale ?? (rawStripeDrawingScale != null ? rawStripeDrawingScale : rawShirtOverlayScale);

      if (stripeDrawingDxFallbackRaw != null) {
        const n = Number.parseFloat(String(stripeDrawingDxFallbackRaw));
        if (Number.isFinite(n)) setMegaStripeDrawingOverlayDx(n);
      }
      if (stripeDrawingDyFallbackRaw != null) {
        const n = Number.parseFloat(String(stripeDrawingDyFallbackRaw));
        if (Number.isFinite(n)) setMegaStripeDrawingOverlayDy(n);
      }
      if (stripeDrawingScaleFallbackRaw != null) {
        const n = Number.parseFloat(String(stripeDrawingScaleFallbackRaw));
        if (Number.isFinite(n) && n > 0) setMegaStripeDrawingOverlayScale(clampScale(n, 1));
      }

      if (rawOverlayDx != null) {
        const n = Number.parseFloat(String(rawOverlayDx));
        if (Number.isFinite(n)) setMegaStripeOverlayDx(n);
      }
      if (rawOverlayDy != null) {
        const n = Number.parseFloat(String(rawOverlayDy));
        if (Number.isFinite(n)) setMegaStripeOverlayDy(n);
      }
      if (rawOverlayScale != null) {
        const n = Number.parseFloat(String(rawOverlayScale));
        if (Number.isFinite(n) && n > 0) setMegaStripeOverlayScale(clampScale(n, 1));
      }
      if (rawScale != null) {
        const n = Number.parseFloat(String(rawScale));
        if (Number.isFinite(n) && n > 0) setMegaStripeScale(clampScale(n, 1.2125));
      }
      if (rawRefEnabled != null) setMegaStripeRefEnabled(rawRefEnabled === '1');
      if (rawRefSrc != null) setMegaStripeRefSrc(String(rawRefSrc));
      if (rawRef2Enabled != null) setMegaStripeRef2Enabled(rawRef2Enabled === '1');
      if (rawRef2Src != null) setMegaStripeRef2Src(String(rawRef2Src));
      if (rawRefCol != null) {
        const v = String(rawRefCol);
        const allowed = new Set(['first_contact', 'thin', 'austen', 'cube', 'miscellania', 'the_human_inside']);
        if (allowed.has(v)) {
          setMegaStripeRefCollection(v === 'the_human_inside' ? 'thin' : v);
        }
      }
      if (rawRefDx != null) {
        const n = Number.parseFloat(String(rawRefDx));
        if (Number.isFinite(n)) setMegaStripeRefDx(n);
      }
      if (rawRefDy != null) {
        const n = Number.parseFloat(String(rawRefDy));
        if (Number.isFinite(n)) setMegaStripeRefDy(n);
      }
      if (rawRefScale != null) {
        const n = Number.parseFloat(String(rawRefScale));
        if (Number.isFinite(n) && n > 0) setMegaStripeRefScale(clampScale(n, 1));
      }
      if (rawRef2Dx != null) {
        const n = Number.parseFloat(String(rawRef2Dx));
        if (Number.isFinite(n)) setMegaStripeRef2Dx(n);
      }
      if (rawRef2Dy != null) {
        const n = Number.parseFloat(String(rawRef2Dy));
        if (Number.isFinite(n)) setMegaStripeRef2Dy(n);
      }
      if (rawRef2Scale != null) {
        const n = Number.parseFloat(String(rawRef2Scale));
        if (Number.isFinite(n) && n > 0) setMegaStripeRef2Scale(clampScale(n, 1));
      }
      if (rawNudge != null) {
        const n = Number.parseInt(String(rawNudge), 10);
        if (Number.isFinite(n) && n > 0) setMegaStripeNudgeStep(Math.min(50, Math.max(1, n)));
      }
      if (rawTileGap != null) {
        const n = Number.parseFloat(String(rawTileGap));
        if (Number.isFinite(n)) setMegaStripeTileGapPx(Math.min(200, Math.max(-200, n)));
      }

      if (rawTileSelectorV1Enabled != null) {
        const v = String(rawTileSelectorV1Enabled).trim().toLowerCase();
        setMegaTileSelectorV1Enabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      }
      if (rawTileSelectorEnabled != null) {
        const v = String(rawTileSelectorEnabled).trim().toLowerCase();
        setMegaTileSelectorEnabled(v === '' || v === '1' || v === 'true' || v === 'on' || v === 'yes');
      }
      if (rawTileSelectorTarget != null) setMegaTileSelectorTarget(String(rawTileSelectorTarget));
      if (rawTileSelectorSize != null) {
        const n = Number.parseFloat(String(rawTileSelectorSize));
        if (Number.isFinite(n) && n > 0) setMegaTileSelectorSizePx(Math.min(800, Math.max(20, n)));
      }
      if (rawTileSelectorStroke != null) {
        const n = Number.parseFloat(String(rawTileSelectorStroke));
        if (Number.isFinite(n) && n >= 0) setMegaTileSelectorStrokePx(Math.min(80, Math.max(0, n)));
      }
      if (rawTileSelectorColor != null) setMegaTileSelectorColor(String(rawTileSelectorColor));
      if (rawTileSelectorStepX != null) {
        const n = Number.parseFloat(String(rawTileSelectorStepX));
        if (Number.isFinite(n)) setMegaTileSelectorStepX(Math.min(99, Math.max(-99, n)));
      }
      if (rawTileSelectorStepY != null) {
        const n = Number.parseFloat(String(rawTileSelectorStepY));
        if (Number.isFinite(n)) setMegaTileSelectorStepY(Math.min(99, Math.max(-99, n)));
      }
      if (rawTileSelectorRadius != null) {
        const n = Number.parseFloat(String(rawTileSelectorRadius));
        if (Number.isFinite(n)) setMegaTileSelectorRadiusPx(Math.min(200, Math.max(0, n)));
      }
      if (rawTileSelectorExtTop != null) {
        const n = Number.parseFloat(String(rawTileSelectorExtTop));
        if (Number.isFinite(n)) setMegaTileSelectorExtendTopPx(Math.min(500, Math.max(-500, n)));
      }
      if (rawTileSelectorExtRight != null) {
        const n = Number.parseFloat(String(rawTileSelectorExtRight));
        if (Number.isFinite(n)) setMegaTileSelectorExtendRightPx(Math.min(500, Math.max(-500, n)));
      }
      if (rawTileSelectorExtBottom != null) {
        const n = Number.parseFloat(String(rawTileSelectorExtBottom));
        if (Number.isFinite(n)) setMegaTileSelectorExtendBottomPx(Math.min(500, Math.max(-500, n)));
      }
      if (rawTileSelectorExtLeft != null) {
        const n = Number.parseFloat(String(rawTileSelectorExtLeft));
        if (Number.isFinite(n)) setMegaTileSelectorExtendLeftPx(Math.min(500, Math.max(-500, n)));
      }
    } catch {
      // ignore
    }
  }, []);

  // ─── Effects: persist to localStorage + sync CSS vars ───────────────
  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_ENABLED', megaTileSelectorEnabled ? '1' : '0');
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_TARGET', String(megaTileSelectorTarget || ''));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_SIZE_PX', String(Math.min(800, Math.max(20, Number(megaTileSelectorSizePx) || 200))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_STROKE_PX', String(Math.min(80, Math.max(0, Number(megaTileSelectorStrokePx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_COLOR', String(megaTileSelectorColor || 'black'));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_STEP_X', String(Math.min(99, Math.max(-99, Number(megaTileSelectorStepX) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_STEP_Y', String(Math.min(99, Math.max(-99, Number(megaTileSelectorStepY) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_RADIUS_PX', String(Math.min(200, Math.max(0, Number(megaTileSelectorRadiusPx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_EXTEND_TOP_PX', String(Math.min(500, Math.max(-500, Number(megaTileSelectorExtendTopPx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_EXTEND_RIGHT_PX', String(Math.min(500, Math.max(-500, Number(megaTileSelectorExtendRightPx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_EXTEND_BOTTOM_PX', String(Math.min(500, Math.max(-500, Number(megaTileSelectorExtendBottomPx) || 0))));
      window.localStorage.setItem('MEGA_TILE_SELECTOR_V2_EXTEND_LEFT_PX', String(Math.min(500, Math.max(-500, Number(megaTileSelectorExtendLeftPx) || 0))));
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
    } catch {
      // ignore
    }
  }, [megaTileSelectorColor, megaTileSelectorEnabled, megaTileSelectorExtendBottomPx, megaTileSelectorExtendLeftPx, megaTileSelectorExtendRightPx, megaTileSelectorExtendTopPx, megaTileSelectorRadiusPx, megaTileSelectorSizePx, megaTileSelectorStepX, megaTileSelectorStepY, megaTileSelectorStrokePx, megaTileSelectorTarget]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_TILE_SELECTOR_ENABLED', megaTileSelectorV1Enabled ? '1' : '0');
      window.dispatchEvent(new Event('mega-tile-selector-changed'));
    } catch {
      // ignore
    }
  }, [megaTileSelectorV1Enabled]);

  useEffect(() => {
    const activeRoute = locationPathname === '/full-wide-slide' || locationPathname === '/constructor/full-wide-slide' || locationPathname === '/full-wide-slide-demo';
    if (!activeRoute) {
      window.localStorage.removeItem('MEGA_STRIPE_HUD_LOCKED_TOP');
      return;
    }
    if (Number.isFinite(megaStripeHudLockedTopPx) && megaStripeHudLockedTopPx > 0) {
      window.localStorage.setItem('MEGA_STRIPE_HUD_LOCKED_TOP', String(megaStripeHudLockedTopPx));
    }
  }, [locationPathname, megaStripeHudLockedTopPx]);

  useEffect(() => {
    const activeRoute = locationPathname === '/full-wide-slide' || locationPathname === '/constructor/full-wide-slide' || locationPathname === '/full-wide-slide-demo';
    if (!activeRoute) return;
    try {
      const flagKey = 'MEGA_STRIPE_HUD_OWN_H_DOUBLED_ONCE';
      const undoKey = 'MEGA_STRIPE_HUD_OWN_H_UNDO_DOUBLING_ONCE';
      const doubled = window.localStorage.getItem(flagKey) === '1';
      const undone = window.localStorage.getItem(undoKey) === '1';
      if (doubled && !undone) {
        const raw = window.localStorage.getItem('MEGA_STRIPE_HUD_OWN_H');
        const n = raw == null ? NaN : Number.parseFloat(String(raw));
        if (Number.isFinite(n) && n > 0) {
          const halved = Math.min(2000, Math.max(160, n / 2));
          window.localStorage.setItem('MEGA_STRIPE_HUD_OWN_H', String(halved));
          setMegaStripeHudOwnHPx(halved);
        }
        window.localStorage.setItem(undoKey, '1');
        window.localStorage.removeItem(flagKey);
      }
    } catch {
      // ignore
    }

    try {
      const tripledKey = 'MEGA_STRIPE_HUD_OWN_H_TRIPLED_ONCE';
      if (window.localStorage.getItem(tripledKey) !== '1') {
        const raw = window.localStorage.getItem('MEGA_STRIPE_HUD_OWN_H');
        const fromStorage = raw == null ? NaN : Number.parseFloat(String(raw));
        const base = Number.isFinite(fromStorage) && fromStorage > 0
          ? fromStorage
          : (Number.isFinite(megaStripeHudOwnHPx) && megaStripeHudOwnHPx > 0 ? megaStripeHudOwnHPx : 360);
        const next = Math.min(3000, Math.max(160, base * 3));
        window.localStorage.setItem('MEGA_STRIPE_HUD_OWN_H', String(next));
        window.localStorage.setItem(tripledKey, '1');
        setMegaStripeHudOwnHPx(next);
      }
    } catch {
      // ignore
    }

    try {
      const plus20Key = 'MEGA_STRIPE_HUD_OWN_H_PLUS20_ONCE';
      if (window.localStorage.getItem(plus20Key) !== '1') {
        const raw = window.localStorage.getItem('MEGA_STRIPE_HUD_OWN_H');
        const fromStorage = raw == null ? NaN : Number.parseFloat(String(raw));
        const base = Number.isFinite(fromStorage) && fromStorage > 0
          ? fromStorage
          : (Number.isFinite(megaStripeHudOwnHPx) && megaStripeHudOwnHPx > 0 ? megaStripeHudOwnHPx : 360);
        const next = Math.min(3000, Math.max(160, base * 1.2));
        window.localStorage.setItem('MEGA_STRIPE_HUD_OWN_H', String(next));
        window.localStorage.setItem(plus20Key, '1');
        setMegaStripeHudOwnHPx(next);
      }
    } catch {
      // ignore
    }

    try {
      if (Number.isFinite(megaStripeHudOwnHPx) && megaStripeHudOwnHPx > 0) {
        window.localStorage.setItem('MEGA_STRIPE_HUD_OWN_H', String(megaStripeHudOwnHPx));
      }
    } catch {
      // ignore
    }
  }, [locationPathname, megaStripeHudOwnHPx]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeDx) ? megaStripeDx : 0;
      const dy = Number.isFinite(megaStripeDy) ? megaStripeDy : 0;
      document.documentElement.style.setProperty('--megaStripeDx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeDy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_DY', String(dy));
    } catch {
      // ignore
    }
  }, [megaStripeDx, megaStripeDy]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_SPRITE_ENABLED', megaStripeSpriteEnabled ? '1' : '0');
      window.dispatchEvent(new Event('mega-stripe-sprite-enabled-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeSpriteEnabled]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeOverlayDx) ? megaStripeOverlayDx : 0;
      const dy = Number.isFinite(megaStripeOverlayDy) ? megaStripeOverlayDy : 0;
      document.documentElement.style.setProperty('--megaStripeOverlayDx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeOverlayDy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_OVERLAY_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_OVERLAY_DY', String(dy));
      window.dispatchEvent(new Event('mega-stripe-overlay-mode-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeOverlayDx, megaStripeOverlayDy]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaStripeOverlayScale) ? megaStripeOverlayScale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--megaStripeOverlayScale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_OVERLAY_SCALE', String(clamped));
      window.dispatchEvent(new Event('mega-stripe-overlay-mode-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeOverlayScale]);

  useEffect(() => {
    try {
      const s = Number.isFinite(megaStripeScale) ? megaStripeScale : 1.2125;
      const clamped = clampScale(s, 1.2125);
      document.documentElement.style.setProperty('--megaStripeScale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_SCALE', String(clamped));
    } catch {
      // ignore
    }
  }, [megaStripeScale]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeRefDx) ? megaStripeRefDx : 0;
      const dy = Number.isFinite(megaStripeRefDy) ? megaStripeRefDy : 0;
      document.documentElement.style.setProperty('--megaStripeRefDx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeRefDy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_REF_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_REF_DY', String(dy));
      window.dispatchEvent(new Event('mega-stripe-ref-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRefDx, megaStripeRefDy]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeRef2Dx) ? megaStripeRef2Dx : 0;
      const dy = Number.isFinite(megaStripeRef2Dy) ? megaStripeRef2Dy : 0;
      document.documentElement.style.setProperty('--megaStripeRef2Dx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeRef2Dy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_REF2_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_REF2_DY', String(dy));
      window.dispatchEvent(new Event('mega-stripe-ref2-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRef2Dx, megaStripeRef2Dy]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaStripeRefScale) ? megaStripeRefScale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--megaStripeRefScale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_REF_SCALE', String(clamped));
      window.dispatchEvent(new Event('mega-stripe-ref-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRefScale]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaStripeRef2Scale) ? megaStripeRef2Scale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--megaStripeRef2Scale', String(clamped));
      window.localStorage.setItem('MEGA_STRIPE_REF2_SCALE', String(clamped));
      window.dispatchEvent(new Event('mega-stripe-ref2-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRef2Scale]);

  useEffect(() => {
    try {
      const raw = Number.isFinite(megaStripeTileGapPx) ? megaStripeTileGapPx : 0;
      const v = Math.min(200, Math.max(-200, raw));
      document.documentElement.style.setProperty('--megaStripeTileGapPx', `${v}px`);
      window.localStorage.setItem('MEGA_STRIPE_TILE_GAP_PX', String(v));
      window.dispatchEvent(new Event('mega-stripe-tile-gap-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeTileGapPx]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_BELT', megaStripeBeltEnabled ? '1' : '0');
    } catch {
      // ignore
    }
  }, [megaStripeBeltEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_OVERLAY_MODE', 'off');
      window.dispatchEvent(new Event('mega-stripe-overlay-mode-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem('HG_SHIRT_DRAWING_ENABLED', megaShirtDrawingEnabled ? '1' : '0');
      window.dispatchEvent(new Event('hg-shirt-drawing-enabled-changed'));
    } catch {
      // ignore
    }
  }, [megaShirtDrawingEnabled]);

  useEffect(() => {
    const sync = () => {
      try {
        setMegaShirtDrawingOverlaySrc(String(window.localStorage.getItem('HG_DRAWING_OVERLAY_SRC') || ''));
      } catch {
        setMegaShirtDrawingOverlaySrc('');
      }
    };
    sync();
    window.addEventListener('hg-drawing-overlay-changed', sync);
    return () => window.removeEventListener('hg-drawing-overlay-changed', sync);
  }, []);

  useEffect(() => {
    const activeRoute = locationPathname === '/full-wide-slide' || locationPathname === '/constructor/full-wide-slide' || locationPathname === '/full-wide-slide-demo';
    if (!activeRoute) return;

    const overlayKey = String(megaShirtDrawingOverlaySrc || '').trim();
    if (!overlayKey) return;
    const canonicalOverlayKey = canonicalStripeDrawingOverlayKey(overlayKey);

    const pickEntry = (map, key, canonical) => {
      if (!map || typeof map !== 'object') return null;
      const e = (canonical && map[canonical]) || map[key];
      return (e && typeof e === 'object') ? e : null;
    };
    try {
      const rawStripeDrawingMap = window.localStorage.getItem('MEGA_STRIPE_DRAWING_OVERLAY_TRANSFORMS_BY_SRC');
      const parsed = rawStripeDrawingMap ? JSON.parse(String(rawStripeDrawingMap)) : null;
      const entry = pickEntry(parsed, overlayKey, canonicalOverlayKey)
        || pickEntry(STRIPE_DRAWING_CALIBRATIONS, overlayKey, canonicalOverlayKey);
      if (entry) {
        const dx = Number.parseFloat(String(entry.dx));
        const dy = Number.parseFloat(String(entry.dy));
        const scale = Number.parseFloat(String(entry.scale));
        setMegaStripeDrawingOverlayDx(Number.isFinite(dx) ? dx : 0);
        setMegaStripeDrawingOverlayDy(Number.isFinite(dy) ? dy : 0);
        setMegaStripeDrawingOverlayScale(Number.isFinite(scale) && scale > 0 ? clampScale(scale, 1) : 1);
      } else {
        setMegaStripeDrawingOverlayDx(0);
        setMegaStripeDrawingOverlayDy(0);
        setMegaStripeDrawingOverlayScale(1);
      }
    } catch {
      const entry = pickEntry(STRIPE_DRAWING_CALIBRATIONS, overlayKey, canonicalOverlayKey);
      if (entry) {
        const dx = Number.parseFloat(String(entry.dx));
        const dy = Number.parseFloat(String(entry.dy));
        const scale = Number.parseFloat(String(entry.scale));
        setMegaStripeDrawingOverlayDx(Number.isFinite(dx) ? dx : 0);
        setMegaStripeDrawingOverlayDy(Number.isFinite(dy) ? dy : 0);
        setMegaStripeDrawingOverlayScale(Number.isFinite(scale) && scale > 0 ? clampScale(scale, 1) : 1);
      } else {
        setMegaStripeDrawingOverlayDx(0);
        setMegaStripeDrawingOverlayDy(0);
        setMegaStripeDrawingOverlayScale(1);
      }
    }
  }, [locationPathname, megaShirtDrawingOverlaySrc]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaShirtDrawingOverlayDx) ? megaShirtDrawingOverlayDx : 0;
      const dy = Number.isFinite(megaShirtDrawingOverlayDy) ? megaShirtDrawingOverlayDy : 0;
      document.documentElement.style.setProperty('--hgShirtOverlayDx', `${dx}px`);
      document.documentElement.style.setProperty('--hgShirtOverlayDy', `${dy}px`);
      window.localStorage.setItem('HG_SHIRT_DRAWING_OVERLAY_DX', String(dx));
      window.localStorage.setItem('HG_SHIRT_DRAWING_OVERLAY_DY', String(dy));
      window.dispatchEvent(new Event('hg-shirt-drawing-overlay-transform-changed'));
    } catch {
      // ignore
    }
  }, [megaShirtDrawingOverlayDx, megaShirtDrawingOverlayDy]);

  useEffect(() => {
    try {
      const dx = Number.isFinite(megaStripeDrawingOverlayDx) ? megaStripeDrawingOverlayDx : 0;
      const dy = Number.isFinite(megaStripeDrawingOverlayDy) ? megaStripeDrawingOverlayDy : 0;
      document.documentElement.style.setProperty('--megaStripeDrawingOverlayDx', `${dx}px`);
      document.documentElement.style.setProperty('--megaStripeDrawingOverlayDy', `${dy}px`);
      window.localStorage.setItem('MEGA_STRIPE_DRAWING_OVERLAY_DX', String(dx));
      window.localStorage.setItem('MEGA_STRIPE_DRAWING_OVERLAY_DY', String(dy));
    } catch {
      // ignore
    }
  }, [megaStripeDrawingOverlayDx, megaStripeDrawingOverlayDy]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaShirtDrawingOverlayScale) ? megaShirtDrawingOverlayScale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--hgShirtOverlayScale', String(clamped));
      window.localStorage.setItem('HG_SHIRT_DRAWING_OVERLAY_SCALE', String(clamped));
      window.dispatchEvent(new Event('hg-shirt-drawing-overlay-transform-changed'));
    } catch {
      // ignore
    }
  }, [megaShirtDrawingOverlayScale]);

  useEffect(() => {
    try {
      const v = Number.isFinite(megaStripeDrawingOverlayScale) ? megaStripeDrawingOverlayScale : 1;
      const clamped = clampScale(v, 1);
      document.documentElement.style.setProperty('--megaStripeDrawingOverlayScale', String(clamped));
    } catch {
      // ignore
    }
  }, [megaStripeDrawingOverlayScale]);

  useEffect(() => {
    const v = String(megaStripeOverlayMode || 'off');
    if (v !== 'off') megaStripeLastNonOffOverlayModeRef.current = v;
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    try {
      const v = String(megaStripeOverlayMode || 'off');
      if (v !== 'off') {
        setStripeEditTool((prev) => (String(prev || 'ref') === 'ref' ? 'overlay' : prev));
      }
    } catch {
      // ignore
    }
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    try {
      const prev = String(prevMegaStripeOverlayModeRef.current || 'off');
      const cur = String(megaStripeOverlayMode || 'off');
      prevMegaStripeOverlayModeRef.current = cur;
      if (prev === 'off' && cur !== 'off') {
        setMegaStripeOverlayDx(0);
        setMegaStripeOverlayDy(0);
      }
    } catch {
      // ignore
    }
  }, [megaStripeOverlayMode]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_REF_ENABLED', megaStripeRefEnabled ? '1' : '0');
      window.localStorage.setItem('MEGA_STRIPE_REF_SRC', String(megaStripeRefSrc || ''));
      window.localStorage.setItem('MEGA_STRIPE_REF_COLLECTION', String(megaStripeRefCollection || 'first_contact'));
      window.dispatchEvent(new Event('mega-stripe-ref-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRefCollection, megaStripeRefEnabled, megaStripeRefSrc]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_REF2_ENABLED', megaStripeRef2Enabled ? '1' : '0');
      window.localStorage.setItem('MEGA_STRIPE_REF2_SRC', String(megaStripeRef2Src || ''));
      window.dispatchEvent(new Event('mega-stripe-ref2-changed'));
    } catch {
      // ignore
    }
  }, [megaStripeRef2Enabled, megaStripeRef2Src]);

  useEffect(() => {
    try {
      window.localStorage.setItem('MEGA_STRIPE_NUDGE_STEP', String(Math.min(50, Math.max(1, Math.round(megaStripeNudgeStep || 1)))));
    } catch {
      // ignore
    }
  }, [megaStripeNudgeStep]);

  // ─── Layout effects: HUD sizing ─────────────────────────────────────
  useLayoutEffect(() => {
    const activeRoute = locationPathname === '/full-wide-slide' || locationPathname === '/constructor/full-wide-slide' || locationPathname === '/full-wide-slide-demo';
    if (!activeRoute) {
      if (megaStripeHudLockedHPx != null) setMegaStripeHudLockedHPx(null);
      if (megaStripeHudLockedTopPx != null) setMegaStripeHudLockedTopPx(null);
      return;
    }
    if (megaStripeHudLockedHPx != null) return;
    const vh = (typeof window !== 'undefined' && Number.isFinite(window.innerHeight)) ? window.innerHeight : 0;
    if (!Number.isFinite(vh) || vh <= 0) return;
    const h = Math.max(0, Math.round(vh));
    if (h <= 0) return;
    setMegaStripeHudLockedHPx(h);
  }, [locationPathname, megaStripeHudOwnHPx]);

  useLayoutEffect(() => {
    const activeRoute = locationPathname === '/full-wide-slide' || locationPathname === '/constructor/full-wide-slide' || locationPathname === '/full-wide-slide-demo';
    if (!activeRoute) return undefined;

    let raf = null;
    const update = () => {
      try {
        const lastTop = megaStripeLastGoodHudTopPxRef.current;
        const effectiveTop = Number.isFinite(megaStripeHudLockedTopPx)
          ? megaStripeHudLockedTopPx
          : (Number.isFinite(megaStripeHudTopPx)
            ? megaStripeHudTopPx
            : (Number.isFinite(lastTop) ? lastTop : 0));
        const top = Number.isFinite(effectiveTop) ? effectiveTop : 0;
        const vh = (typeof window !== 'undefined' && Number.isFinite(window.innerHeight)) ? window.innerHeight : 0;
        const available = Math.max(0, vh - top - 80);

        const estimatedHeaderAndInputsPx = 140;
        const estimatedRowPx = 30;
        const max = Math.max(4, Math.min(30, Math.floor((available - estimatedHeaderAndInputsPx) / estimatedRowPx)));
        setMegaStripeHudMaxRefPresets((prev) => (prev === max ? prev : max));
      } catch {
        // ignore
      }
    };

    const onResize = () => {
      if (raf != null) return;
      raf = window.requestAnimationFrame(() => {
        raf = null;
        update();
      });
    };

    update();
    window.addEventListener('resize', onResize);
    return () => {
      if (raf != null) window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [locationPathname, megaStripeHudTopPx, megaStripeHudLockedTopPx]);

  useLayoutEffect(() => {
    const activeRoute = locationPathname === '/full-wide-slide' || locationPathname === '/constructor/full-wide-slide' || locationPathname === '/full-wide-slide-demo';
    if (!activeRoute) {
      try {
        document.documentElement.style.removeProperty('--megaStripeHudTopPx');
        document.documentElement.style.removeProperty('--megaStripeHudHPx');
        document.documentElement.style.removeProperty('--megaStripeHudBottomHPx');
      } catch {
        // ignore
      }
      return undefined;
    }

    const setVars = () => {
      try {
        const fallbackH = Number.isFinite(megaStripeHudOwnHPx) ? Math.max(0, Math.round(megaStripeHudOwnHPx)) : 0;
        if (fallbackH > 0) {
          document.documentElement.style.setProperty('--megaStripeHudBottomHPx', `${fallbackH}px`);
        }
        const el = megaStripeHudWrapRef.current;
        const rect = el?.getBoundingClientRect?.();
        const h = rect && Number.isFinite(rect.height) ? Math.max(0, Math.round(rect.height)) : 0;
        document.documentElement.style.setProperty('--megaStripeHudBottomHPx', `${h}px`);
      } catch {
        // ignore
      }
    };

    setVars();
    let raf = 0;
    const onResize = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(setVars);
    };
    window.addEventListener('resize', onResize);

    let ro = null;
    try {
      const el = megaStripeHudWrapRef.current;
      if (el && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => {
          if (raf) window.cancelAnimationFrame(raf);
          raf = window.requestAnimationFrame(setVars);
        });
        ro.observe(el);
      }
    } catch {
      // ignore
    }

    return () => {
      try {
        if (raf) window.cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        if (ro) ro.disconnect();
      } catch {
        // ignore
      }
    };
  }, [locationPathname, megaStripeHudTopPx, megaStripeHudLockedHPx, megaStripeHudLockedTopPx]);

  useLayoutEffect(() => {
    const activeRoute = locationPathname === '/full-wide-slide' || locationPathname === '/constructor/full-wide-slide' || locationPathname === '/full-wide-slide-demo';
    if (!activeRoute) {
      setMegaStripeHudSnapDyPx(0);
      return undefined;
    }

    let raf = 0;
    const update = () => {
      try {
        const el = megaStripeHudWrapRef.current;
        const rect = el?.getBoundingClientRect?.();
        const top = rect && Number.isFinite(rect.top) ? rect.top : null;
        if (top == null) return;

        const dpr = (typeof window !== 'undefined' && Number.isFinite(window.devicePixelRatio)) ? window.devicePixelRatio : 1;
        const step = dpr > 1 ? (1 / dpr) : 1;
        const snappedTop = Math.round(top / step) * step;
        const delta = snappedTop - top;

        setMegaStripeHudSnapDyPx((prev) => {
          const a = Number.isFinite(prev) ? prev : 0;
          const b = Number.isFinite(delta) ? delta : 0;
          if (Math.abs(a - b) < 0.001) return prev;
          return b;
        });
      } catch {
        // ignore
      }
    };

    const schedule = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    };

    schedule();

    try {
      window.addEventListener('resize', schedule);
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('orientationchange', schedule);
    } catch {
      // ignore
    }

    return () => {
      try {
        if (raf) window.cancelAnimationFrame(raf);
        window.removeEventListener('resize', schedule);
        window.removeEventListener('scroll', schedule, { passive: true });
        window.removeEventListener('orientationchange', schedule);
      } catch {
        // ignore
      }
    };
  }, [locationPathname, megaStripeHudOwnHPx]);

  useLayoutEffect(() => {
    const activeRoute = locationPathname === '/full-wide-slide' || locationPathname === '/constructor/full-wide-slide' || locationPathname === '/full-wide-slide-demo';
    if (!activeRoute) return undefined;

    let raf = 0;
    const update = () => {
      try {
        const el = megaStripeParamsGridRef.current;
        const rect = el?.getBoundingClientRect?.();
        const h = rect && Number.isFinite(rect.height) ? rect.height : null;
        if (h == null || h <= 0) return;
        const cellH = h / 18;
        el.style.setProperty('--megaStripeHudCellHPx', `${cellH}px`);
      } catch {
        // ignore
      }
    };

    const schedule = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(update);
    };

    schedule();

    let ro = null;
    try {
      const el = megaStripeParamsGridRef.current;
      if (el && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(schedule);
        ro.observe(el);
      }
    } catch {
      // ignore
    }

    try {
      window.addEventListener('resize', schedule);
    } catch {
      // ignore
    }

    return () => {
      try {
        if (raf) window.cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        window.removeEventListener('resize', schedule);
      } catch {
        // ignore
      }
    };
  }, [locationPathname]);

  // ─── Keyboard handler ───────────────────────────────────────────────
  useEffect(() => {
    const activeRoute = locationPathname === '/full-wide-slide' || locationPathname === '/constructor/full-wide-slide' || locationPathname === '/full-wide-slide-demo';
    if (!activeRoute) return undefined;

    const shouldIgnoreEvent = (e) => {
      try {
        if (!e) return true;
        if (e.defaultPrevented) return true;
        const el = typeof document !== 'undefined' ? document.activeElement : null;
        const tag = (el?.tagName || '').toString().toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
        if (el?.isContentEditable) return true;
        return false;
      } catch {
        return true;
      }
    };

    const onKeyDown = (e) => {
      if (shouldIgnoreEvent(e)) return;

      const k = (e.key || '').toString();
      const step = e.shiftKey ? 5 : 0.5;
      const overlayStep = step * 0.5;
      const tileStep = (e.shiftKey ? 1 : 0.1) * 0.5;

      if ((e.metaKey || e.ctrlKey) && (k === '+' || k === '=' || k === '-' || k === '_' || k === '0')) {
        return;
      }

      if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        const kc = k.toLowerCase();
        if (kc === 'c') {
          e.preventDefault();
          if (stripeEditTool === 'overlay') {
            setMegaStripeDrawingOverlayDx(0);
            setMegaStripeDrawingOverlayDy(0);
            setMegaStripeDrawingOverlayScale(1);
          } else if (stripeEditTool === 'ref2') {
            setMegaStripeRef2Dx(0);
            setMegaStripeRef2Dy(0);
            setMegaStripeRef2Scale(1);
          } else if (stripeEditTool === 'tile') {
            setMegaStripeTileGapPx(0);
          } else {
            setMegaStripeRefDx(0);
            setMegaStripeRefDy(0);
          }
          return;
        }
        if (kc === 'o') {
          e.preventDefault();
          setStripeEditTool('overlay');
          return;
        }
        if (kc === 'r') {
          e.preventDefault();
          setStripeEditTool('ref');
          return;
        }
        if (kc === 't') {
          e.preventDefault();
          setStripeEditTool('tile');
          return;
        }
        if (kc === '2') {
          e.preventDefault();
          setMegaStripeRef2Enabled(true);
          setMegaStripeRef2Src((prev) => (String(prev || '').trim() ? prev : megaStripeRefSrc));
          setStripeEditTool('ref2');
          return;
        }
      }

      if (k === 'ArrowLeft') {
        e.preventDefault();
        if (stripeEditTool === 'ref2') setMegaStripeRef2Dx((v) => (Number.isFinite(v) ? v - step : -step));
        else if (stripeEditTool === 'overlay') setMegaStripeDrawingOverlayDx((v) => (Number.isFinite(v) ? v - overlayStep : -overlayStep));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v - tileStep)) : -tileStep));
        else setMegaStripeRefDx((v) => (Number.isFinite(v) ? v - step : -step));
        return;
      }
      if (k === 'ArrowRight') {
        e.preventDefault();
        if (stripeEditTool === 'ref2') setMegaStripeRef2Dx((v) => (Number.isFinite(v) ? v + step : step));
        else if (stripeEditTool === 'overlay') setMegaStripeDrawingOverlayDx((v) => (Number.isFinite(v) ? v + overlayStep : overlayStep));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v + tileStep)) : tileStep));
        else setMegaStripeRefDx((v) => (Number.isFinite(v) ? v + step : step));
        return;
      }
      if (k === 'ArrowUp') {
        e.preventDefault();
        if (stripeEditTool === 'ref2') setMegaStripeRef2Dy((v) => (Number.isFinite(v) ? v - step : -step));
        else if (stripeEditTool === 'overlay') setMegaStripeDrawingOverlayDy((v) => (Number.isFinite(v) ? v - overlayStep : -overlayStep));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v - tileStep)) : -tileStep));
        else setMegaStripeRefDy((v) => (Number.isFinite(v) ? v - step : -step));
        return;
      }
      if (k === 'ArrowDown') {
        e.preventDefault();
        if (stripeEditTool === 'ref2') setMegaStripeRef2Dy((v) => (Number.isFinite(v) ? v + step : step));
        else if (stripeEditTool === 'overlay') setMegaStripeDrawingOverlayDy((v) => (Number.isFinite(v) ? v + overlayStep : overlayStep));
        else if (stripeEditTool === 'tile') setMegaStripeTileGapPx((v) => (Number.isFinite(v) ? Math.min(200, Math.max(-200, v + tileStep)) : tileStep));
        else setMegaStripeRefDy((v) => (Number.isFinite(v) ? v + step : step));
        return;
      }

      if (e.altKey && (k === '+' || k === '=')) {
        e.preventDefault();
        setMegaStripeNudgeStep((v) => {
          const n = Math.min(50, Math.max(1, Math.round(Number.isFinite(v) ? v : 1) + 1));
          return n;
        });
        return;
      }
      if (e.altKey && (k === '-' || k === '_')) {
        e.preventDefault();
        setMegaStripeNudgeStep((v) => {
          const n = Math.min(50, Math.max(1, Math.round(Number.isFinite(v) ? v : 1) - 1));
          return n;
        });
        return;
      }

      if (k === '+' || k === '=') {
        if (stripeEditTool === 'tile') return;
        e.preventDefault();
        const inc = e.shiftKey ? 0.1 : 0.01;

        if (stripeEditTool === 'overlay') {
          setMegaStripeDrawingOverlayScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur + inc).toFixed(4), 1);
            return next;
          });
          return;
        }
        if (stripeEditTool === 'ref2') {
          setMegaStripeRef2Scale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur + inc).toFixed(4), 1);
            return next;
          });
          return;
        }
        if (stripeEditTool === 'ref') {
          setMegaStripeRefScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur + inc).toFixed(4), 1);
            return next;
          });
          return;
        }
        setMegaStripeScale((v) => {
          const cur = Number.isFinite(v) ? v : 1.2125;
          const next = clampScale(+(cur + inc).toFixed(4), 1.2125);
          return next;
        });
        return;
      }
      if (k === '-' || k === '_') {
        if (stripeEditTool === 'tile') return;
        e.preventDefault();
        const dec = e.shiftKey ? 0.1 : 0.01;

        if (stripeEditTool === 'overlay') {
          setMegaStripeDrawingOverlayScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur - dec).toFixed(4), 1);
            return next;
          });
          return;
        }
        if (stripeEditTool === 'ref2') {
          setMegaStripeRef2Scale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur - dec).toFixed(4), 1);
            return next;
          });
          return;
        }
        if (stripeEditTool === 'ref') {
          setMegaStripeRefScale((v) => {
            const cur = Number.isFinite(v) ? v : 1;
            const next = clampScale(+(cur - dec).toFixed(4), 1);
            return next;
          });
          return;
        }
        setMegaStripeScale((v) => {
          const cur = Number.isFinite(v) ? v : 1.2125;
          const next = clampScale(+(cur - dec).toFixed(4), 1.2125);
          return next;
        });
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [locationPathname, megaStripeNudgeStep, stripeEditTool]);

  // ─── Return all state + setters + refs + drafts ─────────────────────
  return {
    // Core stripe state
    megaStripeDx, setMegaStripeDx,
    megaStripeDy, setMegaStripeDy,
    megaStripeSpriteEnabled, setMegaStripeSpriteEnabled,
    megaStripeBeltEnabled, setMegaStripeBeltEnabled,
    megaStripeOverlayMode, setMegaStripeOverlayMode,
    megaShirtDrawingEnabled, setMegaShirtDrawingEnabled,
    megaShirtDrawingOverlayDx, setMegaShirtDrawingOverlayDx,
    megaShirtDrawingOverlayDy, setMegaShirtDrawingOverlayDy,
    megaShirtDrawingOverlayScale, setMegaShirtDrawingOverlayScale,
    megaShirtDrawingOverlaySrc, setMegaShirtDrawingOverlaySrc,
    megaStripeDrawingOverlayDx, setMegaStripeDrawingOverlayDx,
    megaStripeDrawingOverlayDy, setMegaStripeDrawingOverlayDy,
    megaStripeDrawingOverlayScale, setMegaStripeDrawingOverlayScale,
    megaStripeOverlayDx, setMegaStripeOverlayDx,
    megaStripeOverlayDy, setMegaStripeOverlayDy,
    megaStripeOverlayScale, setMegaStripeOverlayScale,
    megaStripeScale, setMegaStripeScale,
    megaStripeRefEnabled, setMegaStripeRefEnabled,
    megaStripeRefSrc, setMegaStripeRefSrc,
    megaStripeRef2Enabled, setMegaStripeRef2Enabled,
    megaStripeRef2Src, setMegaStripeRef2Src,
    megaStripeRefCollection, setMegaStripeRefCollection,
    megaStripeRefDx, setMegaStripeRefDx,
    megaStripeRefDy, setMegaStripeRefDy,
    megaStripeRefScale, setMegaStripeRefScale,
    megaStripeRef2Dx, setMegaStripeRef2Dx,
    megaStripeRef2Dy, setMegaStripeRef2Dy,
    megaStripeRef2Scale, setMegaStripeRef2Scale,
    stripeEditTool, setStripeEditTool,
    megaStripeNudgeStep, setMegaStripeNudgeStep,
    megaStripeTileGapPx, setMegaStripeTileGapPx,

    // Tile selector state
    megaTileSelectorV1Enabled, setMegaTileSelectorV1Enabled,
    megaTileSelectorEnabled, setMegaTileSelectorEnabled,
    megaTileSelectorTarget, setMegaTileSelectorTarget,
    megaTileSelectorSizePx, setMegaTileSelectorSizePx,
    megaTileSelectorStrokePx, setMegaTileSelectorStrokePx,
    megaTileSelectorColor, setMegaTileSelectorColor,
    megaTileSelectorStepX, setMegaTileSelectorStepX,
    megaTileSelectorStepY, setMegaTileSelectorStepY,
    megaTileSelectorRadiusPx, setMegaTileSelectorRadiusPx,
    megaTileSelectorExtendTopPx, setMegaTileSelectorExtendTopPx,
    megaTileSelectorExtendRightPx, setMegaTileSelectorExtendRightPx,
    megaTileSelectorExtendBottomPx, setMegaTileSelectorExtendBottomPx,
    megaTileSelectorExtendLeftPx, setMegaTileSelectorExtendLeftPx,

    // HUD state
    megaStripeHudTopPx, setMegaStripeHudTopPx,
    megaStripeHudLockedTopPx, setMegaStripeHudLockedTopPx,
    megaStripeHudLockedHPx, setMegaStripeHudLockedHPx,
    megaStripeHudOwnHPx, setMegaStripeHudOwnHPx,
    megaStripeHudMaxRefPresets, setMegaStripeHudMaxRefPresets,
    megaStripeHudSnapDyPx, setMegaStripeHudSnapDyPx,
    hudCollapsed, setHudCollapsed,
    hudActiveTab, setHudActiveTab,

    // Refs
    megaStripeHudWrapRef,
    megaStripeParamsGridRef,
    megaStripeLastGoodHudTopPxRef,
    megaStripeLastNonOffOverlayModeRef,
    prevMegaStripeOverlayModeRef,

    // Draft inputs
    megaStripeOverlayScaleInputFocusedRef, megaStripeOverlayScaleDraft, setMegaStripeOverlayScaleDraft,
    megaStripeDrawingOverlayDxInputFocusedRef, megaStripeDrawingOverlayDxDraft, setMegaStripeDrawingOverlayDxDraft,
    megaStripeDrawingOverlayDyInputFocusedRef, megaStripeDrawingOverlayDyDraft, setMegaStripeDrawingOverlayDyDraft,
    megaStripeDrawingOverlayScaleInputFocusedRef, megaStripeDrawingOverlayScaleDraft, setMegaStripeDrawingOverlayScaleDraft,
    megaStripeDxInputFocusedRef, megaStripeDxDraft, setMegaStripeDxDraft,
    megaStripeDyInputFocusedRef, megaStripeDyDraft, setMegaStripeDyDraft,
    megaStripeScaleInputFocusedRef, megaStripeScaleDraft, setMegaStripeScaleDraft,
    megaStripeRefDxInputFocusedRef, megaStripeRefDxDraft, setMegaStripeRefDxDraft,
    megaStripeRefDyInputFocusedRef, megaStripeRefDyDraft, setMegaStripeRefDyDraft,
    megaStripeRefScaleInputFocusedRef, megaStripeRefScaleDraft, setMegaStripeRefScaleDraft,
    megaStripeRef2DxInputFocusedRef, megaStripeRef2DxDraft, setMegaStripeRef2DxDraft,
    megaStripeRef2DyInputFocusedRef, megaStripeRef2DyDraft, setMegaStripeRef2DyDraft,
    megaStripeRef2ScaleInputFocusedRef, megaStripeRef2ScaleDraft, setMegaStripeRef2ScaleDraft,
    megaStripeTileGapPxInputFocusedRef, megaStripeTileGapPxDraft, setMegaStripeTileGapPxDraft,
    megaTileSelectorSizePxInputFocusedRef, megaTileSelectorSizePxDraft, setMegaTileSelectorSizePxDraft,
    megaTileSelectorStrokePxInputFocusedRef, megaTileSelectorStrokePxDraft, setMegaTileSelectorStrokePxDraft,
    megaTileSelectorStepXInputFocusedRef, megaTileSelectorStepXDraft, setMegaTileSelectorStepXDraft,
    megaTileSelectorStepYInputFocusedRef, megaTileSelectorStepYDraft, setMegaTileSelectorStepYDraft,
    megaTileSelectorRadiusPxInputFocusedRef, megaTileSelectorRadiusPxDraft, setMegaTileSelectorRadiusPxDraft,
    megaTileSelectorExtendTopPxInputFocusedRef, megaTileSelectorExtendTopPxDraft, setMegaTileSelectorExtendTopPxDraft,
    megaTileSelectorExtendRightPxInputFocusedRef, megaTileSelectorExtendRightPxDraft, setMegaTileSelectorExtendRightPxDraft,
    megaTileSelectorExtendBottomPxInputFocusedRef, megaTileSelectorExtendBottomPxDraft, setMegaTileSelectorExtendBottomPxDraft,
    megaTileSelectorExtendLeftPxInputFocusedRef, megaTileSelectorExtendLeftPxDraft, setMegaTileSelectorExtendLeftPxDraft,
  };
}
