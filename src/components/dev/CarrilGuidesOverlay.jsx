import DevPortal, { DEV_LAYER_Z } from '@/components/dev/DevPortal';

/**
 * CarrilGuidesOverlay
 * -----------------------------------------------------------------------------
 * Les DUES guies verticals del carril: les seves vores, a `--hg-mega-x` i
 * `--hg-mega-x + --hg-mega-w`.
 *
 * PER QUE ES UN COMPONENT A PART (24/09/2026). Aquestes dues linies vivien
 * dins de `BeltReferenceOverlay`, que s'encen amb el commutador "Belt 2" i que
 * tambe dibuixa les seves propies linies (les verdes del marc del lloc, la del
 * mig i dues d'horitzontals de calibratge desades). Qui volia comprovar si una
 * peca cau dins del carril havia d'encendre tot allo i, a mes, es trobava una
 * linia horitzontal a mitja pantalla que no te res a veure amb el carril.
 *
 * Ara les guies del carril tenen el seu propi commutador ("Carril", o
 * `?carril=1`) i surten soles: dues linies i prou.
 *
 * Es dibuixen amb `calc` sobre les variables publicades i no amb una mesura:
 * la capçalera va `fixed` amb `marginLeft: calc(var(--hg-mega-x) -
 * var(--rulerInset))` i el seu pare arrenca a `--rulerInset`, o sigui que la
 * seva vora esquerra cau exactament a `--hg-mega-x` en coordenades de finestra,
 * que son les mateixes que fa servir `position: fixed`.
 */
const COLOR_CARRIL = 'rgba(37, 99, 235, 0.85)';

export default function CarrilGuidesOverlay({ enabled }) {
  if (!enabled) return null;
  return (
    <DevPortal
      zIndex={DEV_LAYER_Z.belt}
      pointerEvents="none"
      className="debug-exempt"
      aria-hidden="true"
      data-dev-overlay="true"
    >
      <div
        data-guia-carril="esq"
        style={{
          position: 'fixed',
          left: 'var(--hg-mega-x, 0px)',
          top: 0,
          height: '100vh',
          width: 0,
          borderLeft: `1px solid ${COLOR_CARRIL}`,
        }}
      />
      <div
        data-guia-carril="dret"
        style={{
          position: 'fixed',
          left: 'calc(var(--hg-mega-x, 0px) + var(--hg-mega-w, 0px))',
          top: 0,
          height: '100vh',
          width: 0,
          borderLeft: `1px solid ${COLOR_CARRIL}`,
        }}
      />
    </DevPortal>
  );
}
