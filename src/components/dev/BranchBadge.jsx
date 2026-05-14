import React, { useState } from 'react';

const BRANCH = typeof __HG_GIT_BRANCH__ !== 'undefined' ? __HG_GIT_BRANCH__ : 'unknown';

function getBranchStyle(branch) {
  if (branch.startsWith('clean/')) {
    return { bg: 'rgba(16, 185, 129, 0.92)', border: 'rgba(6, 95, 70, 0.9)', label: 'CLEAN' };
  }
  if (branch.startsWith('dirty/')) {
    return { bg: 'rgba(234, 179, 8, 0.92)', border: 'rgba(120, 53, 15, 0.9)', label: 'DIRTY' };
  }
  if (branch.startsWith('trash/')) {
    return { bg: 'rgba(239, 68, 68, 0.92)', border: 'rgba(127, 29, 29, 0.9)', label: 'TRASH' };
  }
  return { bg: 'rgba(71, 80, 89, 0.92)', border: 'rgba(31, 41, 55, 0.9)', label: 'BRANCH' };
}

function BranchBadge() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  const { bg, border, label } = getBranchStyle(BRANCH);

  return (
    <div
      onClick={() => setHidden(true)}
      title={`Branca git: ${BRANCH} (clic per amagar)`}
      style={{
        position: 'fixed',
        right: '10px',
        bottom: '10px',
        zIndex: 2147483646,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '999px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: '#fff',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '11px',
        lineHeight: 1,
        letterSpacing: '0.04em',
        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span style={{ opacity: 0.85 }}>{BRANCH}</span>
    </div>
  );
}

export default BranchBadge;
