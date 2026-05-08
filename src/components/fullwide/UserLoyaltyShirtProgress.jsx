import React from 'react';

const LEVELS = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

const SEGMENTS = {
  10: 'M147 0 L158.8 36.2 L197 36.2 L166.1 58.6 L177.9 94.8 L147 72.4 L116.1 94.8 L127.9 58.6 L97 36.2 L135.2 36.2 Z',
  9: 'M67 111 L116 82 L178 82 L227 111 L260 135 L34 135 Z',
  8: 'M35 142 L259 142 L283 172 L11 172 Z',
  7: 'M0 180 L294 180 L307 194 L260 240 L247 224 L60 224 L47 240 L0 194 Z',
  6: 'M60 232 L247 232 L247 268 L60 268 Z',
  5: 'M60 276 L247 276 L247 312 L60 312 Z',
  4: 'M60 320 L247 320 L247 356 L60 356 Z',
  3: 'M60 364 L247 364 L247 400 L60 400 Z',
  2: 'M60 408 L247 408 L247 444 L60 444 Z',
  1: 'M60 452 L247 452 L247 488 L60 488 Z',
};

const UserLoyaltyShirtProgress = ({ current = 4, threshold = 10, rewardsAvailable = 0 }) => {
  const safeThreshold = Math.max(1, threshold);
  const safeCurrent = Math.max(0, Math.min(current, safeThreshold));
  const remaining = Math.max(0, safeThreshold - safeCurrent);
  const complete = safeCurrent >= safeThreshold;

  return (
    <div style={{
      width: '244px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: '7px',
      color: '#475059',
      fontFamily: 'Roboto Condensed, sans-serif',
    }}>
      <div style={{
        fontFamily: 'Oswald, sans-serif',
        fontSize: '13pt',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#475059',
        lineHeight: 1,
        marginBottom: '7px',
      }}>
        Progrés Higgins
      </div>

      <svg viewBox="0 0 307 488" width="178" height="282" aria-label={`Progrés Higgins ${safeCurrent} de ${safeThreshold}`} role="img" style={{ display: 'block' }}>
        {LEVELS.map((level) => {
          const filled = level <= safeCurrent;
          const isTop = level === 10;
          const fill = filled ? (complete ? '#2F61B2' : '#078BEA') : '#748596';
          const stroke = filled ? '#0BA2FF' : '#0F1720';
          const textColor = filled ? '#FFE600' : '#C6D0DB';
          return (
            <g key={level}>
              <path
                d={SEGMENTS[level]}
                fill={fill}
                stroke={stroke}
                strokeWidth={isTop ? 0 : 3}
                strokeLinejoin="round"
                opacity={filled ? 1 : 0.78}
              />
              <text
                x="153.5"
                y={level === 10 ? 48 : 488 - ((level - 0.5) * 44)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="Oswald, sans-serif"
                fontSize={level === 10 ? 22 : 25}
                fontWeight="500"
                fill={textColor}
              >
                {level}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{
        marginTop: '8px',
        fontFamily: 'Oswald, sans-serif',
        fontSize: '20pt',
        fontWeight: 500,
        lineHeight: 1,
        color: complete ? '#2F61B2' : '#078BEA',
      }}>
        {safeCurrent}/{safeThreshold}
      </div>

      <div style={{
        width: '205px',
        marginTop: '6px',
        fontSize: '10.5pt',
        lineHeight: 1.15,
        textAlign: 'center',
        color: '#475059',
      }}>
        {complete
          ? 'Recompensa desbloquejada per aplicar a la propera comanda.'
          : `Et falten ${remaining} samarretes per desbloquejar una recompensa.`}
      </div>

      {rewardsAvailable > 0 && (
        <div style={{
          marginTop: '7px',
          padding: '4px 9px',
          borderRadius: '999px',
          background: '#EAF3FF',
          color: '#2F61B2',
          fontSize: '9.5pt',
          fontWeight: 700,
        }}>
          {rewardsAvailable} recompensa pendent
        </div>
      )}
    </div>
  );
};

export default UserLoyaltyShirtProgress;
