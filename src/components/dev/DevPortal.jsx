import { createPortal } from 'react-dom';

// Tot l'stack dev queda per damunt del header de l'app (z-[10000]) perquè
// les guies/regles/HUDs siguin sempre visibles per sobre de qualsevol UI.
const DEV_LAYER_Z = {
  base: 100200,
  pauta: 100220,
  rulers: 100240,
  belt: 100260,
  hud: 100280,
  inspector: 100300,
};

function DevPortal({
  children,
  zIndex = DEV_LAYER_Z.base,
  pointerEvents = 'none',
  className,
  style,
  ...rest
}) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={className}
      data-dev-portal="true"
      {...rest}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex,
        pointerEvents,
        ...style,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export { DEV_LAYER_Z };
export default DevPortal;
