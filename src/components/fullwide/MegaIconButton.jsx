import React from 'react';

/**
 * IconButton
 * -----------------------------------------------------------------------------
 * Botó quadrat amb icona, usat al header del mega-slide (search, user, cart).
 * És un wrapper minimal sobre `<button>` amb estils consistents per a la
 * barra superior.
 *
 * Notes:
 *  - El fitxer es diu `MegaIconButton.jsx` perquè `Icon*` està al .gitignore;
 *    el component, però, manté el nom `IconButton` per claredat al codi.
 */
const IconButton = React.forwardRef(function IconButton({
  id,
  label,
  onClick,
  onDoubleClick,
  onMouseEnter,
  buttonRef,
  children,
  ...rest
}, ref) {
  const setRefs = (node) => {
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
    if (buttonRef) {
      if (typeof buttonRef === 'function') buttonRef(node);
      else buttonRef.current = node;
    }
  };
  return (
    <button
      id={id}
      ref={setRefs}
      type="button"
      aria-label={label}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      className="inline-flex h-9 w-9 items-end justify-center pb-[2px] rounded-md text-foreground hover:bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:h-10 lg:w-10 lg:pb-[3px]"
      {...rest}
    >
      {children}
    </button>
  );
});

export default IconButton;
