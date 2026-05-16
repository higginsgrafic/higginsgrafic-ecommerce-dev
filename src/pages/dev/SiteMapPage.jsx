import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { GROUPS, TAG_COLORS } from '@/dev/pagesManifest';

const CARD_W = 140;
const CARD_H = 22;
const CELL_GAP = 6;
const GROUP_HEADER_H = 24;
const GROUP_PAD_X = 10;
const GROUP_PAD_Y = 8;
const GROUP_GAP = 16;
const CANVAS_TARGET_W = 1500;

function clampScale(v) {
  return Math.min(3, Math.max(0.1, v));
}

// Pick the column count for a group that gives the best width/height aspect
// (close to a target golden-ish ratio for a balanced cluster).
function pickColumns(n, target = 1.7) {
  if (n <= 1) return 1;
  let best = 1;
  let bestDiff = Infinity;
  for (let c = 1; c <= n; c += 1) {
    const r = Math.ceil(n / c);
    const aspect = (c * (CARD_W + CELL_GAP)) / (r * (CARD_H + CELL_GAP));
    const diff = Math.abs(Math.log(aspect / target));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = c;
    }
  }
  return best;
}

// Compact wrap-grid layout for one group.
function layoutGroup(nodes) {
  const sorted = [...nodes].sort((a, b) => a.path.localeCompare(b.path));
  const cols = pickColumns(sorted.length);
  const rows = Math.ceil(sorted.length / cols);
  const positions = {};
  sorted.forEach((n, i) => {
    const r = Math.floor(i / cols);
    const c = i % cols;
    positions[n.path] = {
      x: c * (CARD_W + CELL_GAP),
      y: r * (CARD_H + CELL_GAP),
      w: CARD_W,
      h: CARD_H,
    };
  });
  const width = cols * (CARD_W + CELL_GAP) - CELL_GAP;
  const height = rows * (CARD_H + CELL_GAP) - CELL_GAP;
  return { positions, width, height, cols, rows };
}

// Shelf-pack groups left-to-right; wrap when exceeding the target canvas width.
function layoutAll(nodes, canvasWidth = CANVAS_TARGET_W) {
  const byGroup = new Map();
  for (const g of GROUPS) byGroup.set(g, []);
  for (const n of nodes) {
    if (!byGroup.has(n.group)) byGroup.set(n.group, []);
    byGroup.get(n.group).push(n);
  }

  // Precompute each group's inner box + outer dimensions.
  const groups = [];
  for (const g of GROUPS) {
    const items = byGroup.get(g) || [];
    if (items.length === 0) continue;
    const inner = layoutGroup(items);
    const outerW = inner.width + GROUP_PAD_X * 2;
    const outerH = inner.height + GROUP_PAD_Y * 2 + GROUP_HEADER_H;
    groups.push({ group: g, inner, outerW, outerH, x: 0, y: 0 });
  }

  // Pack with a simple shelf algorithm.
  let cursorX = 0;
  let cursorY = 0;
  let shelfH = 0;
  let totalW = 0;
  for (const gb of groups) {
    if (cursorX + gb.outerW > canvasWidth && cursorX > 0) {
      cursorX = 0;
      cursorY += shelfH + GROUP_GAP;
      shelfH = 0;
    }
    gb.x = cursorX;
    gb.y = cursorY;
    cursorX += gb.outerW + GROUP_GAP;
    shelfH = Math.max(shelfH, gb.outerH);
    totalW = Math.max(totalW, cursorX - GROUP_GAP);
  }
  const totalH = cursorY + shelfH;

  // Compose global positions.
  const positions = {};
  for (const gb of groups) {
    for (const [path, p] of Object.entries(gb.inner.positions)) {
      positions[path] = {
        x: gb.x + GROUP_PAD_X + p.x,
        y: gb.y + GROUP_HEADER_H + GROUP_PAD_Y + p.y,
        w: p.w,
        h: p.h,
        group: gb.group,
      };
    }
  }
  return { kind: 'mosaic', positions, width: totalW, height: totalH, groups };
}

// ---------- radial layout + hierarchical edge bundling ------------------

const RADIAL_R_LEAF = 380;        // radius of leaves
const RADIAL_R_GROUP = 150;       // radius of group anchors (for bundling)
const RADIAL_PADDING = 200;       // outer padding for label space
const RADIAL_GAP_DEG = 4;         // gap (deg) between group sectors
const HEB_BETA = 0.85;            // bundling strength (0 = straight, 1 = full)

function layoutRadial(nodes) {
  const cx = RADIAL_R_LEAF + RADIAL_PADDING;
  const cy = RADIAL_R_LEAF + RADIAL_PADDING;
  const size = (RADIAL_R_LEAF + RADIAL_PADDING) * 2;

  const byGroup = new Map();
  for (const g of GROUPS) byGroup.set(g, []);
  for (const n of nodes) {
    if (!byGroup.has(n.group)) byGroup.set(n.group, []);
    byGroup.get(n.group).push(n);
  }
  const populated = GROUPS.filter((g) => (byGroup.get(g) || []).length > 0);
  const totalCount = nodes.length;
  const totalGap = populated.length * RADIAL_GAP_DEG;
  const arcAvailable = 360 - totalGap;

  const positions = {};   // path -> { x, y, angle, group }
  const groupAnchors = {}; // group -> { x, y, midDeg, startDeg, endDeg, count }

  let cursor = -90; // start at top
  for (const g of populated) {
    const items = byGroup.get(g).slice().sort((a, b) => a.path.localeCompare(b.path));
    const arc = arcAvailable * (items.length / totalCount);
    const start = cursor;
    const end = cursor + arc;
    const mid = (start + end) / 2;
    items.forEach((n, i) => {
      const t = (i + 0.5) / items.length;
      const angle = start + t * arc;
      const rad = (angle * Math.PI) / 180;
      positions[n.path] = {
        x: cx + RADIAL_R_LEAF * Math.cos(rad),
        y: cy + RADIAL_R_LEAF * Math.sin(rad),
        angle,
        group: g,
      };
    });
    const midRad = (mid * Math.PI) / 180;
    groupAnchors[g] = {
      x: cx + RADIAL_R_GROUP * Math.cos(midRad),
      y: cy + RADIAL_R_GROUP * Math.sin(midRad),
      midDeg: mid,
      startDeg: start,
      endDeg: end,
      count: items.length,
    };
    cursor = end + RADIAL_GAP_DEG;
  }

  return {
    kind: 'radial',
    positions,
    groupAnchors,
    populated,
    center: { x: cx, y: cy },
    width: size,
    height: size,
    rLeaf: RADIAL_R_LEAF,
    rGroup: RADIAL_R_GROUP,
  };
}

// Render an open-uniform Catmull-Rom curve through the given control points
// as a sequence of cubic-bezier segments.
function catmullRomPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Holten's hierarchical edge bundling: relax control points of the
// hierarchical path between source and target with parameter beta.
function bundledEdgePath(source, target, layout, beta = HEB_BETA) {
  const sGroup = layout.groupAnchors[source.group];
  const tGroup = layout.groupAnchors[target.group];
  let pts;
  if (source.group === target.group) {
    pts = [source, sGroup, target];
  } else {
    pts = [source, sGroup, layout.center, tGroup, target];
  }
  const N = pts.length - 1;
  const sx = source.x;
  const sy = source.y;
  const tx = target.x;
  const ty = target.y;
  const relaxed = pts.map((p, i) => {
    const lx = sx + (tx - sx) * (i / N);
    const ly = sy + (ty - sy) * (i / N);
    return {
      x: beta * p.x + (1 - beta) * lx,
      y: beta * p.y + (1 - beta) * ly,
    };
  });
  return catmullRomPath(relaxed);
}

// Build an SVG arc path (annular segment) for a group sector.
function describeAnnularArc(cx, cy, rInner, rOuter, startDeg, endDeg) {
  const sr = (startDeg * Math.PI) / 180;
  const er = (endDeg * Math.PI) / 180;
  const x1 = cx + rOuter * Math.cos(sr);
  const y1 = cy + rOuter * Math.sin(sr);
  const x2 = cx + rOuter * Math.cos(er);
  const y2 = cy + rOuter * Math.sin(er);
  const x3 = cx + rInner * Math.cos(er);
  const y3 = cy + rInner * Math.sin(er);
  const x4 = cx + rInner * Math.cos(sr);
  const y4 = cy + rInner * Math.sin(sr);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

// ---------- card --------------------------------------------------------

function NodeCard({ node, pos, dim, onHover, hovered }) {
  const tagColor = TAG_COLORS[node.tag] || '#64748b';
  const isFaded = hovered && hovered !== node.path && !dim.relatedToHover;
  const isHover = hovered === node.path;
  return (
    <div
      data-path={node.path}
      onMouseEnter={() => onHover(node.path)}
      onMouseLeave={() => onHover(null)}
      onClick={() => window.open(node.path, '_blank', 'noopener')}
      title={`${node.label} · ${node.path}`}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: pos.w,
        height: pos.h,
        background: '#ffffff',
        border: `1px solid ${isHover ? '#0f172a' : '#e2e8f0'}`,
        borderLeft: `3px solid ${tagColor}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        fontSize: 11,
        color: '#0f172a',
        fontWeight: 500,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        boxShadow: isHover ? '0 4px 10px rgba(15,23,42,0.18)' : 'none',
        opacity: isFaded ? 0.3 : 1,
        transition: 'opacity 120ms, box-shadow 120ms, border-color 120ms',
        cursor: 'pointer',
      }}
    >
      {node.label}
    </div>
  );
}

function MosaicView({ data, layout, hovered, onHover, related }) {
  return (
    <>
      {layout.groups.map((gb) => (
        <div
          key={gb.group}
          style={{
            position: 'absolute',
            left: gb.x,
            top: gb.y,
            width: gb.outerW,
            height: gb.outerH,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}
        >
          <h2
            style={{
              margin: 0,
              padding: '4px 10px',
              height: GROUP_HEADER_H,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span>{gb.group}</span>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>
              · {Object.keys(gb.inner.positions).length}
            </span>
          </h2>
        </div>
      ))}

      <svg
        style={{ position: 'absolute', left: 0, top: 0, width: layout.width, height: layout.height, pointerEvents: 'none' }}
        width={layout.width}
        height={layout.height}
      >
        {data.edges.map((e, i) => {
          const a = layout.positions[e.from];
          const b = layout.positions[e.to];
          if (!a || !b) return null;
          const x1 = a.x + a.w;
          const y1 = a.y + a.h / 2;
          const x2 = b.x;
          const y2 = b.y + b.h / 2;
          const dx = Math.max(40, Math.abs(x2 - x1) / 2);
          const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
          const isHighlighted = hovered && (e.from === hovered || e.to === hovered);
          const isDim = hovered && !isHighlighted;
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#0f172a"
              strokeOpacity={isHighlighted ? 0.9 : isDim ? 0.03 : 0.12}
              strokeWidth={isHighlighted ? 1.5 : 0.6}
            />
          );
        })}
      </svg>

      {data.nodes.map((node) => {
        const pos = layout.positions[node.path];
        if (!pos) return null;
        const dim = { relatedToHover: related ? related.has(node.path) : false };
        return (
          <NodeCard
            key={node.path}
            node={node}
            pos={pos}
            dim={dim}
            onHover={onHover}
            hovered={hovered}
          />
        );
      })}
    </>
  );
}

function RadialView({ data, layout, hovered, onHover, related }) {
  const { width, height, center, rLeaf, groupAnchors, populated, positions } = layout;

  // Edges, sorted so that highlighted ones render on top.
  const sortedEdges = useMemo(() => {
    if (!hovered) return data.edges;
    const norm = [];
    const high = [];
    for (const e of data.edges) {
      if (e.from === hovered || e.to === hovered) high.push(e);
      else norm.push(e);
    }
    return [...norm, ...high];
  }, [data.edges, hovered]);

  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', left: 0, top: 0, width, height, overflow: 'visible' }}
    >
      {/* Group sectors (annular segments) */}
      {populated.map((g) => {
        const a = groupAnchors[g];
        const color = GROUP_COLORS[g] || '#94a3b8';
        const isHoverGroup = hovered && positions[hovered] && positions[hovered].group === g;
        return (
          <g key={`sector-${g}`}>
            <path
              d={describeAnnularArc(center.x, center.y, rLeaf + 6, rLeaf + 18, a.startDeg, a.endDeg)}
              fill={color}
              opacity={isHoverGroup ? 0.95 : 0.65}
            />
          </g>
        );
      })}

      {/* Edges with hierarchical edge bundling */}
      <g style={{ pointerEvents: 'none' }}>
        {sortedEdges.map((e, i) => {
          const s = positions[e.from];
          const t = positions[e.to];
          if (!s || !t) return null;
          const isHighlighted = hovered && (e.from === hovered || e.to === hovered);
          const isDim = hovered && !isHighlighted;
          const colorSrc = GROUP_COLORS[s.group] || '#0f172a';
          return (
            <path
              key={i}
              d={bundledEdgePath(s, t, layout)}
              fill="none"
              stroke={isHighlighted ? colorSrc : '#0f172a'}
              strokeOpacity={isHighlighted ? 0.85 : isDim ? 0.02 : 0.08}
              strokeWidth={isHighlighted ? 1.4 : 0.5}
            />
          );
        })}
      </g>

      {/* Group labels (above sectors) */}
      {populated.map((g) => {
        const a = groupAnchors[g];
        const rad = (a.midDeg * Math.PI) / 180;
        const lx = center.x + (rLeaf + 64) * Math.cos(rad);
        const ly = center.y + (rLeaf + 64) * Math.sin(rad);
        const rotateDeg = a.midDeg + (a.midDeg > 90 || a.midDeg < -90 ? 180 : 0);
        return (
          <text
            key={`gl-${g}`}
            x={lx}
            y={ly}
            transform={`rotate(${rotateDeg} ${lx} ${ly})`}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fill: GROUP_COLORS[g] || '#475569',
            }}
          >
            {g} · {a.count}
          </text>
        );
      })}

      {/* Leaf nodes with radial labels */}
      {data.nodes.map((node) => {
        const p = positions[node.path];
        if (!p) return null;
        const isHover = hovered === node.path;
        const isFaded = hovered && !isHover && !(related && related.has(node.path));
        const angDeg = p.angle;
        const rad = (angDeg * Math.PI) / 180;
        const lx = center.x + (rLeaf + 22) * Math.cos(rad);
        const ly = center.y + (rLeaf + 22) * Math.sin(rad);
        const flip = angDeg > 90 || angDeg < -90;
        const rotateDeg = flip ? angDeg + 180 : angDeg;
        const anchor = flip ? 'end' : 'start';
        const tagColor = TAG_COLORS[node.tag] || '#64748b';
        return (
          <g
            key={node.path}
            data-path={node.path}
            onMouseEnter={() => onHover(node.path)}
            onMouseLeave={() => onHover(null)}
            onClick={() => window.open(node.path, '_blank', 'noopener')}
            style={{ cursor: 'pointer', opacity: isFaded ? 0.25 : 1, transition: 'opacity 120ms' }}
          >
            <circle cx={p.x} cy={p.y} r={isHover ? 4.5 : 3} fill={tagColor} stroke="#fff" strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              transform={`rotate(${rotateDeg} ${lx} ${ly})`}
              textAnchor={anchor}
              dominantBaseline="middle"
              style={{
                fontSize: 9,
                fontWeight: isHover ? 700 : 500,
                fill: isHover ? '#0f172a' : '#475569',
                pointerEvents: 'none',
              }}
            >
              {node.label}
            </text>
            {/* Larger invisible hit area for hovering */}
            <circle cx={p.x} cy={p.y} r={10} fill="transparent" />
          </g>
        );
      })}
    </svg>
  );
}

const GROUP_COLORS = {
  Home: '#0ea5e9',
  'Col·leccions': '#14b8a6',
  Constructors: '#a855f7',
  Comerç: '#22c55e',
  Servei: '#f59e0b',
  'Lab/Proves': '#6366f1',
  Admin: '#0f172a',
  Tècnic: '#64748b',
};

// =========================================================================
// Tree (BFS hierarchical) layout & view
// =========================================================================

const TREE_COL_W = 180;
const TREE_ROW_H = 28;
const TREE_PAD = 20;

function layoutTree(data) {
  const root =
    data.nodes.find((n) => n.path === '/') ||
    data.nodes.find((n) => n.group === 'Home') ||
    data.nodes[0];
  if (!root) {
    return { kind: 'tree', positions: {}, byDepth: new Map(), width: 0, height: 0, totalDepths: 0 };
  }

  const out = new Map();
  for (const e of data.edges) {
    if (!out.has(e.from)) out.set(e.from, []);
    out.get(e.from).push(e.to);
  }
  const depth = new Map([[root.path, 0]]);
  const queue = [root.path];
  while (queue.length) {
    const p = queue.shift();
    const d = depth.get(p);
    for (const t of out.get(p) || []) {
      if (!depth.has(t)) {
        depth.set(t, d + 1);
        queue.push(t);
      }
    }
  }
  let maxD = 0;
  for (const v of depth.values()) if (v > maxD) maxD = v;
  let hasOrphans = false;
  const orphanDepth = maxD + 1;
  for (const n of data.nodes) {
    if (!depth.has(n.path)) {
      depth.set(n.path, orphanDepth);
      hasOrphans = true;
    }
  }
  const totalDepths = (hasOrphans ? orphanDepth : maxD) + 1;

  const byDepth = new Map();
  for (let d = 0; d < totalDepths; d += 1) byDepth.set(d, []);
  for (const n of data.nodes) byDepth.get(depth.get(n.path)).push(n);
  for (const list of byDepth.values()) {
    list.sort((a, b) =>
      a.group !== b.group ? a.group.localeCompare(b.group) : a.label.localeCompare(b.label)
    );
  }

  const positions = {};
  let maxRows = 0;
  for (const [d, list] of byDepth) {
    list.forEach((n, i) => {
      positions[n.path] = {
        x: TREE_PAD + d * TREE_COL_W,
        y: TREE_PAD + GROUP_HEADER_H + i * TREE_ROW_H,
        w: CARD_W,
        h: CARD_H,
        group: n.group,
        depth: d,
      };
    });
    if (list.length > maxRows) maxRows = list.length;
  }
  return {
    kind: 'tree',
    positions,
    byDepth,
    hasOrphans,
    orphanDepth,
    totalDepths,
    width: TREE_PAD + totalDepths * TREE_COL_W,
    height: TREE_PAD + GROUP_HEADER_H + maxRows * TREE_ROW_H + TREE_PAD,
  };
}

function TreeView({ data, layout, hovered, onHover, related }) {
  return (
    <>
      {[...layout.byDepth.entries()].map(([d, list]) => (
        <div
          key={`treecol-${d}`}
          style={{
            position: 'absolute',
            left: TREE_PAD + d * TREE_COL_W,
            top: TREE_PAD,
            width: CARD_W,
            height: GROUP_HEADER_H,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderBottom: '1px solid #cbd5e1',
          }}
        >
          <span>
            {d === 0
              ? 'Arrel'
              : layout.hasOrphans && d === layout.orphanDepth
              ? 'Orfes'
              : `Nivell ${d}`}
          </span>
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>· {list.length}</span>
        </div>
      ))}

      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: layout.width,
          height: layout.height,
          pointerEvents: 'none',
        }}
        width={layout.width}
        height={layout.height}
      >
        {data.edges.map((e, i) => {
          const a = layout.positions[e.from];
          const b = layout.positions[e.to];
          if (!a || !b) return null;
          const x1 = a.x + a.w;
          const y1 = a.y + a.h / 2;
          const x2 = b.x;
          const y2 = b.y + b.h / 2;
          const isHighlighted = hovered && (e.from === hovered || e.to === hovered);
          const isDim = hovered && !isHighlighted;
          let d;
          if (x2 > x1) {
            const midX = (x1 + x2) / 2;
            const r = Math.min(6, Math.abs(y2 - y1) / 2, (x2 - x1) / 2);
            const dirY = y2 > y1 ? 1 : -1;
            d = `M ${x1} ${y1} L ${midX - r} ${y1} Q ${midX} ${y1} ${midX} ${y1 + r * dirY} L ${midX} ${y2 - r * dirY} Q ${midX} ${y2} ${midX + r} ${y2} L ${x2} ${y2}`;
          } else {
            // Back-edge (right→left): route via outer channel below source.
            const channelY = Math.max(y1, y2) + 14;
            d = `M ${x1} ${y1} L ${x1 + 10} ${y1} L ${x1 + 10} ${channelY} L ${x2 - 10} ${channelY} L ${x2 - 10} ${y2} L ${x2} ${y2}`;
          }
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={isHighlighted ? '#0f172a' : '#94a3b8'}
              strokeOpacity={isHighlighted ? 0.9 : isDim ? 0.03 : 0.25}
              strokeWidth={isHighlighted ? 1.5 : 0.7}
            />
          );
        })}
      </svg>

      {data.nodes.map((node) => {
        const pos = layout.positions[node.path];
        if (!pos) return null;
        const dim = { relatedToHover: related ? related.has(node.path) : false };
        return <NodeCard key={node.path} node={node} pos={pos} dim={dim} onHover={onHover} hovered={hovered} />;
      })}
    </>
  );
}

// =========================================================================
// Columns-by-group (orthogonal edges) layout & view
// =========================================================================

const COLS_COL_W = 200;
const COLS_ROW_H = 28;
const COLS_GAP = 60;
const COLS_PAD = 20;

function layoutColumns(data) {
  const byGroup = new Map();
  for (const g of GROUPS) byGroup.set(g, []);
  for (const n of data.nodes) {
    if (!byGroup.has(n.group)) byGroup.set(n.group, []);
    byGroup.get(n.group).push(n);
  }
  const populated = GROUPS.filter((g) => (byGroup.get(g) || []).length > 0);
  for (const g of populated) {
    byGroup.get(g).sort((a, b) => a.label.localeCompare(b.label));
  }

  const positions = {};
  const columns = [];
  let maxRows = 0;
  populated.forEach((g, idx) => {
    const list = byGroup.get(g);
    const x = COLS_PAD + idx * (COLS_COL_W + COLS_GAP);
    columns.push({ group: g, x, w: COLS_COL_W, count: list.length });
    list.forEach((n, i) => {
      positions[n.path] = {
        x: x + (COLS_COL_W - CARD_W) / 2,
        y: COLS_PAD + GROUP_HEADER_H + i * COLS_ROW_H,
        w: CARD_W,
        h: CARD_H,
        group: g,
        colIndex: idx,
      };
    });
    if (list.length > maxRows) maxRows = list.length;
  });
  return {
    kind: 'columns',
    positions,
    columns,
    populated,
    width: COLS_PAD + populated.length * (COLS_COL_W + COLS_GAP),
    height: COLS_PAD + GROUP_HEADER_H + maxRows * COLS_ROW_H + COLS_PAD,
  };
}

function ColumnsView({ data, layout, hovered, onHover, related }) {
  return (
    <>
      {layout.columns.map((c, idx) => (
        <div
          key={`colbg-${c.group}`}
          style={{
            position: 'absolute',
            left: c.x - 8,
            top: COLS_PAD - 4,
            width: COLS_COL_W + 16,
            height: layout.height - COLS_PAD * 2 + 8,
            background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
          }}
        >
          <h2
            style={{
              margin: 0,
              padding: '4px 10px',
              height: GROUP_HEADER_H,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: GROUP_COLORS[c.group] || '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <span>{c.group}</span>
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>· {c.count}</span>
          </h2>
        </div>
      ))}

      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: layout.width,
          height: layout.height,
          pointerEvents: 'none',
        }}
        width={layout.width}
        height={layout.height}
      >
        {data.edges.map((e, i) => {
          const a = layout.positions[e.from];
          const b = layout.positions[e.to];
          if (!a || !b) return null;
          const isHighlighted = hovered && (e.from === hovered || e.to === hovered);
          const isDim = hovered && !isHighlighted;
          let d;
          if (a.colIndex === b.colIndex) {
            const x = a.x + a.w + 10;
            d = `M ${a.x + a.w} ${a.y + a.h / 2} C ${x + 20} ${a.y + a.h / 2}, ${x + 20} ${b.y + b.h / 2}, ${a.x + a.w} ${b.y + b.h / 2}`;
          } else {
            const x1 = a.x + a.w;
            const y1 = a.y + a.h / 2;
            const x2 = b.x;
            const y2 = b.y + b.h / 2;
            if (x2 > x1) {
              const midX = (x1 + x2) / 2;
              const r = Math.min(6, Math.abs(y2 - y1) / 2 || 6, (x2 - x1) / 2);
              const dirY = y2 > y1 ? 1 : -1;
              d = `M ${x1} ${y1} L ${midX - r} ${y1} Q ${midX} ${y1} ${midX} ${y1 + r * dirY} L ${midX} ${y2 - r * dirY} Q ${midX} ${y2} ${midX + r} ${y2} L ${x2} ${y2}`;
            } else {
              const channelY = Math.min(y1, y2) - 14;
              d = `M ${x1} ${y1} L ${x1 + 10} ${y1} L ${x1 + 10} ${channelY} L ${x2 - 10} ${channelY} L ${x2 - 10} ${y2} L ${x2} ${y2}`;
            }
          }
          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={isHighlighted ? GROUP_COLORS[a.group] || '#0f172a' : '#94a3b8'}
              strokeOpacity={isHighlighted ? 0.9 : isDim ? 0.03 : 0.2}
              strokeWidth={isHighlighted ? 1.5 : 0.7}
            />
          );
        })}
      </svg>

      {data.nodes.map((node) => {
        const pos = layout.positions[node.path];
        if (!pos) return null;
        const dim = { relatedToHover: related ? related.has(node.path) : false };
        return <NodeCard key={node.path} node={node} pos={pos} dim={dim} onHover={onHover} hovered={hovered} />;
      })}
    </>
  );
}

// =========================================================================
// Group-level Sankey (origin → destination ribbons)
// =========================================================================

const SANKEY_W = 1100;
const SANKEY_BAR_W = 100;
const SANKEY_H = 800;
const SANKEY_GAP = 14;
const SANKEY_PAD = 40;
const SANKEY_LABEL_PAD = 160;

function layoutSankey(data) {
  const byGroup = new Map();
  for (const g of GROUPS) byGroup.set(g, 0);
  for (const n of data.nodes) {
    if (!byGroup.has(n.group)) byGroup.set(n.group, 0);
    byGroup.set(n.group, byGroup.get(n.group) + 1);
  }
  const populated = GROUPS.filter((g) => (byGroup.get(g) || 0) > 0);
  const nodeGroup = new Map();
  for (const n of data.nodes) nodeGroup.set(n.path, n.group);

  const flows = [];
  const flowMap = new Map();
  for (const e of data.edges) {
    const s = nodeGroup.get(e.from);
    const t = nodeGroup.get(e.to);
    if (!s || !t) continue;
    const key = `${s}|${t}`;
    if (!flowMap.has(key)) {
      const f = { from: s, to: t, count: 0 };
      flowMap.set(key, f);
      flows.push(f);
    }
    flowMap.get(key).count += 1;
  }

  const outVol = new Map();
  const inVol = new Map();
  for (const g of populated) {
    outVol.set(g, 0);
    inVol.set(g, 0);
  }
  for (const f of flows) {
    outVol.set(f.from, (outVol.get(f.from) || 0) + f.count);
    inVol.set(f.to, (inVol.get(f.to) || 0) + f.count);
  }
  const totalFlow = flows.reduce((a, b) => a + b.count, 0) || 1;
  const usableH = SANKEY_H - populated.length * SANKEY_GAP;
  const scale = usableH / totalFlow;

  const leftBars = new Map();
  let cursorL = SANKEY_PAD;
  for (const g of populated) {
    const v = outVol.get(g) || 0;
    const h = Math.max(8, v * scale);
    leftBars.set(g, { x: SANKEY_LABEL_PAD, y: cursorL, w: SANKEY_BAR_W, h, vol: v });
    cursorL += h + SANKEY_GAP;
  }
  const rightBars = new Map();
  let cursorR = SANKEY_PAD;
  for (const g of populated) {
    const v = inVol.get(g) || 0;
    const h = Math.max(8, v * scale);
    rightBars.set(g, { x: SANKEY_LABEL_PAD + SANKEY_W - SANKEY_BAR_W, y: cursorR, w: SANKEY_BAR_W, h, vol: v });
    cursorR += h + SANKEY_GAP;
  }

  const groupIdx = new Map(populated.map((g, i) => [g, i]));
  const flowsBySource = new Map();
  for (const f of flows) {
    if (!flowsBySource.has(f.from)) flowsBySource.set(f.from, []);
    flowsBySource.get(f.from).push(f);
  }
  for (const list of flowsBySource.values()) {
    list.sort((a, b) => groupIdx.get(a.to) - groupIdx.get(b.to));
  }
  const ribbons = [];
  for (const g of populated) {
    const bar = leftBars.get(g);
    let off = 0;
    for (const f of flowsBySource.get(g) || []) {
      const h = f.count * scale;
      ribbons.push({ flow: f, srcY1: bar.y + off, srcY2: bar.y + off + h });
      off += h;
    }
  }
  const tgtList = new Map();
  for (const r of ribbons) {
    if (!tgtList.has(r.flow.to)) tgtList.set(r.flow.to, []);
    tgtList.get(r.flow.to).push(r);
  }
  for (const [g, list] of tgtList) {
    list.sort((a, b) => groupIdx.get(a.flow.from) - groupIdx.get(b.flow.from));
    const bar = rightBars.get(g);
    let off = 0;
    for (const r of list) {
      const h = r.flow.count * scale;
      r.tgtY1 = bar.y + off;
      r.tgtY2 = bar.y + off + h;
      off += h;
    }
  }

  return {
    kind: 'sankey',
    leftBars,
    rightBars,
    ribbons,
    populated,
    width: SANKEY_LABEL_PAD * 2 + SANKEY_W,
    height: Math.max(cursorL, cursorR) + SANKEY_PAD,
  };
}

function SankeyView({ layout, hovered, onHover }) {
  return (
    <svg
      width={layout.width}
      height={layout.height}
      style={{ position: 'absolute', left: 0, top: 0, width: layout.width, height: layout.height, overflow: 'visible' }}
    >
      <g>
        {layout.ribbons.map((r, i) => {
          const leftBar = layout.leftBars.get(r.flow.from);
          const rightBar = layout.rightBars.get(r.flow.to);
          const x1 = leftBar.x + leftBar.w;
          const x2 = rightBar.x;
          const cx = (x1 + x2) / 2;
          const d = [
            `M ${x1} ${r.srcY1}`,
            `C ${cx} ${r.srcY1}, ${cx} ${r.tgtY1}, ${x2} ${r.tgtY1}`,
            `L ${x2} ${r.tgtY2}`,
            `C ${cx} ${r.tgtY2}, ${cx} ${r.srcY2}, ${x1} ${r.srcY2}`,
            'Z',
          ].join(' ');
          const color = GROUP_COLORS[r.flow.from] || '#94a3b8';
          const isHighlighted = hovered && (hovered === r.flow.from || hovered === r.flow.to);
          const isDim = hovered && !isHighlighted;
          return (
            <path
              key={i}
              d={d}
              fill={color}
              fillOpacity={isHighlighted ? 0.55 : isDim ? 0.04 : 0.22}
              stroke="none"
            >
              <title>{`${r.flow.from} → ${r.flow.to}: ${r.flow.count}`}</title>
            </path>
          );
        })}
      </g>

      {layout.populated.map((g) => {
        const left = layout.leftBars.get(g);
        const right = layout.rightBars.get(g);
        const color = GROUP_COLORS[g] || '#94a3b8';
        const isHover = hovered === g;
        return (
          <g key={g}>
            <rect
              x={left.x}
              y={left.y}
              width={left.w}
              height={left.h}
              fill={color}
              opacity={isHover ? 1 : 0.85}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHover(g)}
              onMouseLeave={() => onHover(null)}
            />
            <text
              x={left.x - 10}
              y={left.y + left.h / 2}
              textAnchor="end"
              dominantBaseline="middle"
              style={{ fontSize: 11, fontWeight: 700, fill: '#0f172a' }}
            >
              {`${g} · ${left.vol}`}
            </text>
            <rect
              x={right.x}
              y={right.y}
              width={right.w}
              height={right.h}
              fill={color}
              opacity={isHover ? 1 : 0.85}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHover(g)}
              onMouseLeave={() => onHover(null)}
            />
            <text
              x={right.x + right.w + 10}
              y={right.y + right.h / 2}
              textAnchor="start"
              dominantBaseline="middle"
              style={{ fontSize: 11, fontWeight: 700, fill: '#0f172a' }}
            >
              {`${g} · ${right.vol}`}
            </text>
          </g>
        );
      })}

      <text
        x={SANKEY_LABEL_PAD + SANKEY_BAR_W / 2}
        y={20}
        textAnchor="middle"
        style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', fill: '#475569', textTransform: 'uppercase' }}
      >
        Origen
      </text>
      <text
        x={SANKEY_LABEL_PAD + SANKEY_W - SANKEY_BAR_W / 2}
        y={20}
        textAnchor="middle"
        style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', fill: '#475569', textTransform: 'uppercase' }}
      >
        Destinació
      </text>
    </svg>
  );
}

// =========================================================================
// Treemap (squarified) layout & view
// =========================================================================

const TREEMAP_W = 1400;
const TREEMAP_H = 900;
const TREEMAP_PAD = 20;
const TREEMAP_GROUP_PAD = 4;

function squarifyTreemap(items, rect, pxPerUnit) {
  const out = [];
  let { x, y, w, h } = rect;
  const remaining = items.slice();

  const worst = (row, side) => {
    if (row.length === 0) return Infinity;
    const areas = row.map((r) => r.value * pxPerUnit);
    const s = areas.reduce((a, b) => a + b, 0);
    const max = Math.max(...areas);
    const min = Math.min(...areas);
    return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min));
  };

  while (remaining.length > 0) {
    const side = Math.min(w, h);
    let row = [];
    while (remaining.length > 0) {
      const trial = [...row, remaining[0]];
      if (row.length === 0 || worst(trial, side) <= worst(row, side)) {
        row = trial;
        remaining.shift();
      } else {
        break;
      }
    }
    const rowAreas = row.map((r) => r.value * pxPerUnit);
    const rowSum = rowAreas.reduce((a, b) => a + b, 0);
    if (w <= h) {
      const stripH = rowSum / w;
      let cx = x;
      row.forEach((item, k) => {
        const itemW = rowAreas[k] / stripH;
        out.push({ ...item, x: cx, y, w: itemW, h: stripH });
        cx += itemW;
      });
      y += stripH;
      h -= stripH;
    } else {
      const stripW = rowSum / h;
      let cy = y;
      row.forEach((item, k) => {
        const itemH = rowAreas[k] / stripW;
        out.push({ ...item, x, y: cy, w: stripW, h: itemH });
        cy += itemH;
      });
      x += stripW;
      w -= stripW;
    }
  }
  return out;
}

function layoutTreemap(data) {
  const byGroup = new Map();
  for (const g of GROUPS) byGroup.set(g, []);
  for (const n of data.nodes) {
    if (!byGroup.has(n.group)) byGroup.set(n.group, []);
    byGroup.get(n.group).push(n);
  }
  const populated = GROUPS.filter((g) => (byGroup.get(g) || []).length > 0);
  const items = populated
    .map((g) => ({ group: g, value: byGroup.get(g).length, nodes: byGroup.get(g) }))
    .sort((a, b) => b.value - a.value);

  const total = items.reduce((a, b) => a + b.value, 0) || 1;
  const totalArea = (TREEMAP_W - TREEMAP_PAD * 2) * (TREEMAP_H - TREEMAP_PAD * 2);
  const pxPerUnit = totalArea / total;
  const groupRects = squarifyTreemap(
    items,
    { x: TREEMAP_PAD, y: TREEMAP_PAD, w: TREEMAP_W - TREEMAP_PAD * 2, h: TREEMAP_H - TREEMAP_PAD * 2 },
    pxPerUnit
  );

  const positions = {};
  const groups = [];
  for (const gr of groupRects) {
    const innerX = gr.x + TREEMAP_GROUP_PAD;
    const innerY = gr.y + GROUP_HEADER_H;
    const innerW = gr.w - TREEMAP_GROUP_PAD * 2;
    const innerH = gr.h - GROUP_HEADER_H - TREEMAP_GROUP_PAD;
    const list = gr.nodes;
    const n = list.length;
    const cols = Math.max(
      1,
      Math.min(n, Math.round(Math.sqrt((n * innerW) / Math.max(40, innerH))))
    );
    const rows = Math.ceil(n / cols);
    const cellW = innerW / cols;
    const cellH = Math.max(18, innerH / rows);
    list
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label))
      .forEach((node, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        positions[node.path] = {
          x: innerX + c * cellW + 2,
          y: innerY + r * cellH + 2,
          w: Math.max(40, cellW - 4),
          h: Math.max(16, cellH - 4),
          group: gr.group,
        };
      });
    groups.push(gr);
  }

  return { kind: 'treemap', positions, groups, width: TREEMAP_W, height: TREEMAP_H };
}

function TreemapView({ data, layout, hovered, onHover, related }) {
  return (
    <>
      {layout.groups.map((g) => {
        const color = GROUP_COLORS[g.group] || '#94a3b8';
        return (
          <div
            key={`tm-${g.group}`}
            style={{
              position: 'absolute',
              left: g.x,
              top: g.y,
              width: g.w,
              height: g.h,
              background: `${color}14`,
              border: `1px solid ${color}55`,
              borderRadius: 6,
              boxSizing: 'border-box',
            }}
          >
            <h2
              style={{
                margin: 0,
                padding: '4px 8px',
                height: GROUP_HEADER_H,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderBottom: `1px solid ${color}33`,
              }}
            >
              <span>{g.group}</span>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>· {g.nodes.length}</span>
            </h2>
          </div>
        );
      })}

      <svg
        style={{ position: 'absolute', left: 0, top: 0, width: layout.width, height: layout.height, pointerEvents: 'none' }}
        width={layout.width}
        height={layout.height}
      >
        {data.edges.map((e, i) => {
          const a = layout.positions[e.from];
          const b = layout.positions[e.to];
          if (!a || !b) return null;
          const x1 = a.x + a.w / 2;
          const y1 = a.y + a.h / 2;
          const x2 = b.x + b.w / 2;
          const y2 = b.y + b.h / 2;
          const isHighlighted = hovered && (e.from === hovered || e.to === hovered);
          const isDim = hovered && !isHighlighted;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} L ${x2} ${y2}`}
              fill="none"
              stroke="#0f172a"
              strokeOpacity={isHighlighted ? 0.7 : isDim ? 0.02 : 0.06}
              strokeWidth={isHighlighted ? 1.5 : 0.4}
            />
          );
        })}
      </svg>

      {data.nodes.map((node) => {
        const pos = layout.positions[node.path];
        if (!pos) return null;
        const dim = { relatedToHover: related ? related.has(node.path) : false };
        return <NodeCard key={node.path} node={node} pos={pos} dim={dim} onHover={onHover} hovered={hovered} />;
      })}
    </>
  );
}

function SiteMapPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [zoom, setZoom] = useState(0.7);
  const [view, setView] = useState('mosaic');
  const [topInset, setTopInset] = useState(0);
  const [leftInset, setLeftInset] = useState(0);
  const viewportRef = useRef(null);

  // Compensate for any global fixed/sticky elements docked to the top OR left
  // of the viewport (AdminBanner, DevHeader, vertical rulers, …) so our
  // chrome sits next to them, not under them.
  useEffect(() => {
    const measure = () => {
      let bottomMax = 0;
      let rightMax = 0;
      const all = document.querySelectorAll('body *');
      for (const el of all) {
        if (el.closest('[data-site-map]')) continue;
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
        const r = el.getBoundingClientRect();
        // Top-docked wide bar.
        if (
          r.width > window.innerWidth * 0.5 &&
          r.height > 0 &&
          r.height < 200 &&
          r.top >= -1 &&
          r.top + r.height <= 200
        ) {
          bottomMax = Math.max(bottomMax, r.top + r.height);
        }
        // Left-docked tall strip (e.g. vertical ruler).
        if (
          r.height > window.innerHeight * 0.5 &&
          r.width > 0 &&
          r.width < 60 &&
          r.left >= -1 &&
          r.left + r.width <= 60
        ) {
          rightMax = Math.max(rightMax, r.left + r.width);
        }
      }
      setTopInset(Math.round(bottomMax));
      setLeftInset(Math.round(rightMax));
    };
    measure();
    const id1 = window.setTimeout(measure, 50);
    const id2 = window.setTimeout(measure, 250);
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(id1);
      window.clearTimeout(id2);
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/site-map.json', { cache: 'no-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (!cancelled) setData(j);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Layout pass (depends on selected view).
  const layout = useMemo(() => {
    if (!data) return null;
    switch (view) {
      case 'radial':
        return layoutRadial(data.nodes);
      case 'tree':
        return layoutTree(data);
      case 'columns':
        return layoutColumns(data);
      case 'sankey':
        return layoutSankey(data);
      case 'treemap':
        return layoutTreemap(data);
      case 'mosaic':
      default:
        return layoutAll(data.nodes);
    }
  }, [data, view]);

  // Build adjacency for hover highlights.
  const adjacency = useMemo(() => {
    if (!data) return { out: new Map(), in: new Map() };
    const out = new Map();
    const incoming = new Map();
    for (const e of data.edges) {
      if (!out.has(e.from)) out.set(e.from, new Set());
      out.get(e.from).add(e.to);
      if (!incoming.has(e.to)) incoming.set(e.to, new Set());
      incoming.get(e.to).add(e.from);
    }
    return { out, in: incoming };
  }, [data]);

  const onHover = useCallback((path) => setHovered(path), []);

  // Pan & zoom handlers.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const factor = Math.exp(-e.deltaY * 0.0015);
        setZoom((z) => clampScale(z * factor));
        return;
      }
      // Plain wheel: pan (vertical) or shift+wheel: horizontal pan.
      e.preventDefault();
      if (e.shiftKey) {
        setTx((v) => v - e.deltaY);
      } else {
        setTx((v) => v - e.deltaX);
        setTy((v) => v - e.deltaY);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Drag-to-pan on empty canvas.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startTx = 0;
    let startTy = 0;
    const onDown = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('[data-path], a, button, input')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startTx = tx;
      startTy = ty;
      el.style.cursor = 'grabbing';
    };
    const onMove = (e) => {
      if (!dragging) return;
      setTx(startTx + (e.clientX - startX));
      setTy(startTy + (e.clientY - startY));
    };
    const onUp = () => {
      dragging = false;
      el.style.cursor = '';
    };
    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [tx, ty]);

  // Auto-fit when layout (view or data) changes.
  useEffect(() => {
    if (!layout || !viewportRef.current) return;
    const vw = viewportRef.current.clientWidth;
    const vh = viewportRef.current.clientHeight - 44;
    // Layouts that should fit fully inside the viewport (both axes).
    const fitBoth = ['radial', 'sankey', 'treemap', 'tree'].includes(layout.kind);
    if (fitBoth) {
      const z = clampScale(Math.min(vw / (layout.width + 40), vh / (layout.height + 40)));
      setZoom(z);
      setTx((vw - layout.width * z) / 2);
      setTy((vh - layout.height * z) / 2);
    } else {
      const z = clampScale(vw / (layout.width + 40));
      setZoom(z);
      setTx(20);
      setTy(20);
    }
  }, [layout]);

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: 'ui-monospace, Menlo, monospace' }}>
        <h1 style={{ fontSize: 16 }}>Site Map</h1>
        <p style={{ color: '#b91c1c' }}>{`No s'ha pogut carregar /site-map.json: ${String(error)}`}</p>
        <p>Executa <code>npm run site-map:build</code> per generar-lo.</p>
      </div>
    );
  }

  if (!data || !layout) {
    return (
      <div style={{ padding: 24, color: '#475569' }}>Carregant mapa…</div>
    );
  }

  const related = hovered
    ? new Set([
        hovered,
        ...(adjacency.out.get(hovered) || []),
        ...(adjacency.in.get(hovered) || []),
      ])
    : null;

  return (
    <div data-site-map style={{ position: 'fixed', top: topInset, left: leftInset, right: 0, bottom: 0, background: '#f1f5f9', overflow: 'hidden', color: '#0f172a' }}>
      <Helmet>
        <title>Site Map · Dev</title>
      </Helmet>

      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#0f172a',
          color: '#f8fafc',
          borderBottom: '1px solid #1e293b',
          fontSize: 12,
          boxShadow: '0 2px 6px rgba(15,23,42,0.18)',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        <strong style={{ fontSize: 13, color: '#f8fafc', flexShrink: 0 }}>Site Map</strong>
        <span style={{ color: '#cbd5e1', flexShrink: 0 }}>
          {data.nodes.length} · {data.edges.length}
        </span>
        <span
          title={`Generat ${new Date(data.generatedAt).toLocaleString()}`}
          style={{ color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: '0 1 auto' }}
        >
          {new Date(data.generatedAt).toLocaleDateString()}
        </span>
        <div style={{ flex: 1, minWidth: 8 }} />
        <div
          style={{
            display: 'inline-flex',
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          {[
            { id: 'mosaic', label: 'Mosaic' },
            { id: 'radial', label: 'Radial' },
            { id: 'tree', label: 'Arbre' },
            { id: 'columns', label: 'Columnes' },
            { id: 'sankey', label: 'Sankey' },
            { id: 'treemap', label: 'Treemap' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              style={{
                fontSize: 11,
                padding: '4px 10px',
                border: 'none',
                background: view === v.id ? '#0f172a' : 'transparent',
                color: view === v.id ? '#fff' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {v.label}
            </button>
          ))}
        </div>
        <span
          title="drag = pan · wheel = pan · ⌘/Ctrl+wheel = zoom · click = obre"
          style={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: '0 1 auto' }}
        >
          drag · wheel · ⌘+wheel zoom
        </span>
        <button
          type="button"
          onClick={() => {
            // Re-trigger fit-to-view by toggling the layout dependency.
            setView((v) => v);
            // Small hack: simply reset transforms; the fit effect runs on layout change.
            const el = viewportRef.current;
            if (!el || !layout) return;
            const vw = el.clientWidth;
            const vh = el.clientHeight - 44;
            const fitBoth = ['radial', 'sankey', 'treemap', 'tree'].includes(layout.kind);
            if (fitBoth) {
              const z = clampScale(Math.min(vw / (layout.width + 40), vh / (layout.height + 40)));
              setZoom(z);
              setTx((vw - layout.width * z) / 2);
              setTy((vh - layout.height * z) / 2);
            } else {
              const z = clampScale(vw / (layout.width + 40));
              setZoom(z);
              setTx(20);
              setTy(20);
            }
          }}
          style={{ fontSize: 11, padding: '4px 10px', border: '1px solid #cbd5e1', borderRadius: 6, background: '#fff', cursor: 'pointer', flexShrink: 0 }}
        >
          Reset
        </button>
        <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', color: '#cbd5e1', minWidth: 44, textAlign: 'right', flexShrink: 0 }}>
          {(zoom * 100).toFixed(0)}%
        </span>
      </header>

      <div
        ref={viewportRef}
        style={{ position: 'absolute', inset: 0, paddingTop: 44, cursor: 'grab', overflow: 'hidden' }}
      >
        <div
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
            transformOrigin: '0 0',
            position: 'absolute',
            top: 44,
            left: 0,
            width: layout.width,
            height: layout.height,
          }}
        >
          {layout.kind === 'radial' ? (
            <RadialView data={data} layout={layout} hovered={hovered} onHover={onHover} related={related} />
          ) : layout.kind === 'tree' ? (
            <TreeView data={data} layout={layout} hovered={hovered} onHover={onHover} related={related} />
          ) : layout.kind === 'columns' ? (
            <ColumnsView data={data} layout={layout} hovered={hovered} onHover={onHover} related={related} />
          ) : layout.kind === 'sankey' ? (
            <SankeyView layout={layout} hovered={hovered} onHover={onHover} />
          ) : layout.kind === 'treemap' ? (
            <TreemapView data={data} layout={layout} hovered={hovered} onHover={onHover} related={related} />
          ) : (
            <MosaicView data={data} layout={layout} hovered={hovered} onHover={onHover} related={related} />
          )}
        </div>
      </div>
    </div>
  );
}

export default SiteMapPage;
