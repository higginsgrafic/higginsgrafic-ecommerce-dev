import React, { useEffect, useMemo, useRef, useState } from 'react';

const WORK_FONTS = [
  'Oswald',
  'Roboto',
  'Roboto Condensed',
  'Arial',
  'Georgia',
];

const FONT_WEIGHTS = [200, 300, 400, 500, 600, 700, 800, 900];
const TEXT_LAYER_Z = 10;
const EDITOR_LAYER_Z = 100000;
const STORAGE_PREFIX = 'HG_EDITABLE_TEXT_BOX_V1';

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readStoredState(id) {
  if (!id || typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredState(id, value) {
  if (!id || typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}:${id}`, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const controlStyle = {
  width: '100%',
  minHeight: '22px',
  boxSizing: 'border-box',
  border: '1px solid rgba(71, 80, 89, 0.2)',
  borderRadius: '6px',
  padding: '2px 5px',
  fontSize: '13px',
};

const labelStyle = {
  display: 'grid',
  gridTemplateRows: '14px 22px',
  gap: '3px',
  alignItems: 'start',
};

const justifyContentByTextAlign = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const alignItemsByVerticalAlign = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

function EditableTextBox({
  id,
  initialText,
  initialSettings,
  className = '',
  style,
  multiline = false,
  splitLines = false,
  columns = null,
  onClick,
  onDoubleClick,
  selectedColumn,
  onColumnSelect,
  renderText = true,
  renderHandle = false,
  onSettingsChange,
}) {
  const storedState = useMemo(() => readStoredState(id), [id]);
  const [selected, setSelected] = useState(false);
  const [text, setText] = useState(storedState?.text ?? initialText ?? '');
  const singleTextRef = useRef(null);
  const lineRefs = useRef([]);
  const [settings, setSettings] = useState({
    x: 0,
    y: 0,
    fontFamily: 'Roboto',
    fontSize: 16,
    fontWeight: 400,
    selectedFontWeight: 700,
    letterSpacing: 0,
    lineHeight: 1,
    textAlign: 'left',
    verticalAlign: 'center',
    color: '#475059',
    textTransform: 'none',
    ...initialSettings,
    ...storedState?.settings,
  });

  const lines = useMemo(() => {
    if (!splitLines) return [text];

    return String(text || '')
      .split('\n')
      .slice(0, 3);
  }, [splitLines, text]);

  const columnTexts = useMemo(() => {
    if (!Array.isArray(columns)) return [];

    const textColumns = String(text || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return columns.map((columnText, index) => textColumns[index] || columnText);
  }, [columns, text]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    writeStoredState(id, { text, settings });
    onSettingsChange?.(settings);
  }, [id, settings, text]);

  useEffect(() => {
    if (splitLines) {
      lines.forEach((line, index) => {
        const node = lineRefs.current[index];
        if (node && document.activeElement !== node && node.textContent !== line) {
          node.textContent = line;
        }
      });
      return;
    }

    const node = singleTextRef.current;
    if (node && document.activeElement !== node && node.textContent !== text) {
      node.textContent = text;
    }
  }, [lines, splitLines, text]);

  const textStyle = {
    color: settings.color,
    fontFamily: `${settings.fontFamily}, sans-serif`,
    fontSize: `${settings.fontSize}pt`,
    fontWeight: settings.fontWeight,
    letterSpacing: `${settings.letterSpacing}em`,
    lineHeight: settings.lineHeight,
    textAlign: settings.textAlign,
    textAlignLast: settings.textAlign === 'justify-all' ? 'justify' : 'auto',
    textTransform: settings.textTransform,
    transform: `translate(${settings.x}px, ${settings.y}px)`,
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    outline: selected ? '1px dashed rgba(14, 165, 233, 0.75)' : 'none',
    outlineOffset: '2px',
    cursor: 'text',
    position: 'relative',
    zIndex: TEXT_LAYER_Z,
  };

  const textViewportStyle = {
    position: 'absolute',
    inset: 0,
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    zIndex: TEXT_LAYER_Z,
  };

  return (
    <div
      className={className}
      style={{ position: 'relative', ...style, minWidth: 0, minHeight: style?.height ? 0 : `${settings.fontSize}pt`, overflow: 'visible', contain: 'layout', zIndex: selected ? EDITOR_LAYER_Z : style?.zIndex }}
      onFocus={() => setSelected(true)}
      onMouseDown={() => setSelected(true)}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {renderHandle ? (
        <button
          type="button"
          aria-label="Obrir editor de text"
          style={{
            position: 'absolute',
            right: '-18px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '14px',
            height: '14px',
            borderRadius: '999px',
            border: '1px solid rgba(71, 80, 89, 0.35)',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.18)',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: EDITOR_LAYER_Z,
          }}
          onClick={(event) => {
            event.stopPropagation();
            setSelected(true);
          }}
        />
      ) : null}

      {renderText ? (
        <div style={textViewportStyle}>
          {Array.isArray(columns) ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnTexts.length}, minmax(0, 1fr))`, gap: '5px', width: '100%', height: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {columnTexts.map((columnText, index) => (
              <div
                key={`${id || 'editable-text'}-column-${index}`}
                style={{
                  ...textStyle,
                  display: 'flex',
                  alignItems: alignItemsByVerticalAlign[settings.verticalAlign] || 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minWidth: 0,
                  minHeight: 0,
                  overflow: 'hidden',
                  pointerEvents: 'none',
                }}
              >
                {columnText}
              </div>
            ))}
          </div>
          ) : splitLines ? (
          <div style={{ display: 'grid', gridTemplateRows: `repeat(${Math.max(lines.length, 1)}, minmax(0, 1fr))`, width: '100%', height: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
            {lines.map((line, index) => (
              <div
                ref={(node) => {
                  lineRefs.current[index] = node;
                }}
                key={`${id || 'editable-text'}-${index}`}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                style={{
                  ...textStyle,
                  display: 'flex',
                  alignItems: alignItemsByVerticalAlign[settings.verticalAlign] || 'center',
                  justifyContent: justifyContentByTextAlign[settings.textAlign] || 'flex-start',
                  alignContent: 'center',
                  minWidth: 0,
                  minHeight: 0,
                  overflow: 'hidden',
                }}
                onInput={(event) => {
                  const nextLines = [...lines];
                  nextLines[index] = event.currentTarget.textContent || '';
                  setText(nextLines.join('\n'));
                }}
              />
            ))}
          </div>
        ) : (
          <div
            ref={singleTextRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            style={{
              ...textStyle,
              display: 'flex',
              alignItems: alignItemsByVerticalAlign[settings.verticalAlign] || 'center',
              justifyContent: justifyContentByTextAlign[settings.textAlign] || 'flex-start',
              whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
            }}
            onInput={(event) => setText(event.currentTarget.textContent || '')}
          />
          )}
        </div>
      ) : null}

      {selected ? (
        <div
          className="debug-exempt"
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 11px)',
            zIndex: EDITOR_LAYER_Z + 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '6px',
            width: '346px',
            padding: '11px',
            border: '1px solid rgba(71, 80, 89, 0.18)',
            borderRadius: '13px',
            background: '#ffffff',
            boxShadow: '0 14px 40px rgba(15, 23, 42, 0.16)',
            color: '#475059',
            fontFamily: 'Roboto Condensed, sans-serif',
            fontSize: '13px',
            lineHeight: 1.1,
            isolation: 'isolate',
          }}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <label style={{ gridColumn: '1 / 3', display: 'grid', gap: '3px' }}>
            Text
            {Array.isArray(columns) ? (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columnTexts.length}, minmax(0, 1fr))`, gap: '0', overflow: 'hidden', border: '1px solid rgba(71, 80, 89, 0.18)', borderRadius: '6px', background: '#f8fafc' }}>
                {columnTexts.map((columnText, index) => {
                  const isSelected = selectedColumn === columns[index];

                  return (
                    <button
                      key={`${id || 'editable-text'}-editor-column-${index}`}
                      type="button"
                      onClick={() => onColumnSelect?.(columns[index])}
                      style={{
                        minHeight: '36px',
                        border: 0,
                        borderRight: index === columnTexts.length - 1 ? 0 : '1px solid rgba(191, 219, 254, 0.85)',
                        background: isSelected ? '#475059' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#475059',
                        fontFamily: `${settings.fontFamily}, sans-serif`,
                        fontSize: `${settings.fontSize}pt`,
                        fontWeight: isSelected ? settings.selectedFontWeight : settings.fontWeight,
                        letterSpacing: `${settings.letterSpacing}em`,
                        lineHeight: settings.lineHeight,
                        cursor: 'pointer',
                      }}
                    >
                      {columnText}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={text}
                rows={splitLines ? 3 : 2}
                onChange={(event) => setText(event.target.value)}
                style={{ resize: 'vertical', border: '1px solid rgba(71, 80, 89, 0.2)', borderRadius: '6px', padding: '3px 5px', fontSize: '13px', lineHeight: 1.1 }}
              />
            )}
          </label>

          <label style={labelStyle}>
            Tipografia
            <select style={controlStyle} value={settings.fontFamily} onChange={(event) => updateSetting('fontFamily', event.target.value)}>
              {WORK_FONTS.map((font) => <option key={font} value={font}>{font}</option>)}
            </select>
          </label>

          <label style={labelStyle}>
            Pes
            <select style={controlStyle} value={settings.fontWeight} onChange={(event) => updateSetting('fontWeight', numberValue(event.target.value, 400))}>
              {FONT_WEIGHTS.map((weight) => <option key={weight} value={weight}>{weight}</option>)}
            </select>
          </label>

          {Array.isArray(columns) ? (
            <label style={labelStyle}>
              Pes seleccionada
              <select style={controlStyle} value={settings.selectedFontWeight} onChange={(event) => updateSetting('selectedFontWeight', numberValue(event.target.value, 700))}>
                {FONT_WEIGHTS.map((weight) => <option key={weight} value={weight}>{weight}</option>)}
              </select>
            </label>
          ) : null}

          <label style={labelStyle}>
            Mida pt
            <input style={controlStyle} type="number" value={settings.fontSize} step="0.5" onChange={(event) => updateSetting('fontSize', numberValue(event.target.value, 16))} />
          </label>

          <label style={labelStyle}>
            Tracking
            <input style={controlStyle} type="number" value={settings.letterSpacing} step="0.01" onChange={(event) => updateSetting('letterSpacing', numberValue(event.target.value, 0))} />
          </label>

          <label style={labelStyle}>
            Interlínia
            <input style={controlStyle} type="number" value={settings.lineHeight} step="0.05" onChange={(event) => updateSetting('lineHeight', numberValue(event.target.value, 1))} />
          </label>

          <label style={labelStyle}>
            Alineació
            <select style={controlStyle} value={settings.textAlign} onChange={(event) => updateSetting('textAlign', event.target.value)}>
              <option value="left">left</option>
              <option value="center">center</option>
              <option value="right">right</option>
              <option value="justify">justify</option>
              <option value="justify-all">justify all</option>
            </select>
          </label>

          <label style={labelStyle}>
            Vertical
            <select style={controlStyle} value={settings.verticalAlign} onChange={(event) => updateSetting('verticalAlign', event.target.value)}>
              <option value="top">top</option>
              <option value="center">center</option>
              <option value="bottom">bottom</option>
            </select>
          </label>

          <label style={labelStyle}>
            X px
            <input style={controlStyle} type="number" value={settings.x} step="1" onChange={(event) => updateSetting('x', numberValue(event.target.value, 0))} />
          </label>

          <label style={labelStyle}>
            Y px
            <input style={controlStyle} type="number" value={settings.y} step="1" onChange={(event) => updateSetting('y', numberValue(event.target.value, 0))} />
          </label>

          <label style={labelStyle}>
            Color
            <input style={controlStyle} type="text" value={settings.color} onChange={(event) => updateSetting('color', event.target.value)} />
          </label>

          <label style={labelStyle}>
            Caixa
            <select style={controlStyle} value={settings.textTransform} onChange={(event) => updateSetting('textTransform', event.target.value)}>
              <option value="none">none</option>
              <option value="uppercase">uppercase</option>
              <option value="lowercase">lowercase</option>
              <option value="capitalize">capitalize</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setSelected(false)}
            style={{ gridColumn: '1 / 3', border: '1px solid rgba(71, 80, 89, 0.2)', borderRadius: '999px', padding: '5px 9px', background: '#fff', fontSize: '13px' }}
          >
            Tancar controls
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default EditableTextBox;
