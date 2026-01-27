import React from 'react';

export default function FullBleedUnderHeader({ as: Component = 'div', className = '', style = {}, children, ...props }) {
  return (
    <Component
      className={className}
      style={{
        marginTop: 'calc(var(--appHeaderOffset, 0px) * -1)',
        paddingTop: 'var(--appHeaderOffset, 0px)',
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
