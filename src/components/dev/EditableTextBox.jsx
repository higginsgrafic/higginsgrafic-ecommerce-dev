import React, { useMemo } from 'react';

const TEXT_LAYER_Z = 10;

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
  onTextChange,
  presetVersion,
  editorPreview,
}) {
  const text = initialText ?? '';
  const settings = {
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
  };

  const lines = useMemo(() => {
    if (!splitLines) return [text];
    return String(text || '').split('\n').slice(0, 3);
  }, [splitLines, text]);

  const columnTexts = useMemo(() => {
    if (!Array.isArray(columns)) return [];
    const textColumns = String(text || '').trim().split(/\s+/).filter(Boolean);
    return columns.map((columnText, index) => textColumns[index] || columnText);
  }, [columns, text]);

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
    outline: 'none',
    outlineOffset: '2px',
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
      style={{ position: 'relative', ...style, minWidth: 0, minHeight: style?.height ? 0 : `${settings.fontSize}pt`, overflow: 'visible', contain: 'layout', zIndex: style?.zIndex }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
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
                key={`${id || 'editable-text'}-${index}`}
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
              >
                {line}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              ...textStyle,
              display: 'flex',
              alignItems: alignItemsByVerticalAlign[settings.verticalAlign] || 'center',
              justifyContent: justifyContentByTextAlign[settings.textAlign] || 'flex-start',
              whiteSpace: multiline ? 'pre-wrap' : 'nowrap',
            }}
          >
            {text}
          </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default EditableTextBox;
