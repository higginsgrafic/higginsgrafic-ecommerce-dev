import { useCallback, useEffect, useState } from 'react';

function validateSlidesConfig(json) {
  const errors = [];
  const warnings = [];

  if (!json || typeof json !== 'object') {
    errors.push('Config buida o invàlida');
    return { ok: false, errors, warnings };
  }

  const presets = json?.slides?.presets;
  if (!presets || typeof presets !== 'object') {
    errors.push("Falta 'slides.presets'");
    return { ok: false, errors, warnings };
  }

  for (const [presetId, preset] of Object.entries(presets)) {
    if (!preset || typeof preset !== 'object') {
      warnings.push(`Preset '${presetId}' invàlid (no és objecte)`);
      continue;
    }

    const shellVariant = preset?.shell?.variant;
    if (shellVariant && !['right-drawer', 'full-wide'].includes(shellVariant)) {
      warnings.push(`Preset '${presetId}': shell.variant desconegut ('${shellVariant}')`);
    }

    const hasRegionsArray = Array.isArray(preset?.ui?.regions);
    const hasBlocksArray = Array.isArray(preset?.ui?.blocks);
    if (!hasRegionsArray && !hasBlocksArray) {
      warnings.push(`Preset '${presetId}': falta ui.regions (array) o ui.blocks (array)`);
    }

    const templateAreas = preset?.layout?.grid?.templateAreas;
    if (templateAreas != null) {
      if (!Array.isArray(templateAreas) || templateAreas.some((row) => typeof row !== 'string')) {
        warnings.push(`Preset '${presetId}': layout.grid.templateAreas ha de ser array de strings`);
      }
    }

    if (hasBlocksArray) {
      for (const block of preset.ui.blocks) {
        if (!block || typeof block !== 'object') {
          warnings.push(`Preset '${presetId}': ui.blocks conté un item invàlid`);
          continue;
        }
        if (!block.id || typeof block.id !== 'string') {
          warnings.push(`Preset '${presetId}': ui.blocks item falta id`);
        }
        if (block.gridArea != null && typeof block.gridArea !== 'string') {
          warnings.push(`Preset '${presetId}': ui.blocks '${block.id || '?'}' gridArea ha de ser string`);
        }
      }
    }

    if (preset?.ui?.modals != null && !Array.isArray(preset.ui.modals)) {
      warnings.push(`Preset '${presetId}': ui.modals ha de ser array`);
    }

    const tools = preset?.tools;
    if (tools != null) {
      if (typeof tools !== 'object') {
        warnings.push(`Preset '${presetId}': tools ha de ser objecte`);
      } else {
        const catalog = tools?.catalog;
        const order = tools?.order;

        if (!catalog || typeof catalog !== 'object') {
          warnings.push(`Preset '${presetId}': tools.catalog ha de ser objecte`);
        }
        if (!Array.isArray(order)) {
          warnings.push(`Preset '${presetId}': tools.order ha de ser array`);
        }

        if (catalog && typeof catalog === 'object' && Array.isArray(order)) {
          for (const toolId of order) {
            if (!Object.prototype.hasOwnProperty.call(catalog, toolId)) {
              warnings.push(`Preset '${presetId}': tools.order referencia tool inexistent ('${toolId}')`);
            }
          }

          for (const [toolId, tool] of Object.entries(catalog)) {
            if (!tool || typeof tool !== 'object') {
              warnings.push(`Preset '${presetId}': tool '${toolId}' invàlid (no és objecte)`);
              continue;
            }

            if (!tool.type || typeof tool.type !== 'string') {
              warnings.push(`Preset '${presetId}': tool '${toolId}' falta type`);
            }

            if (tool.ref != null && typeof tool.ref !== 'string') {
              warnings.push(`Preset '${presetId}': tool '${toolId}' ref ha de ser string`);
            }

            if (typeof tool.ref === 'string' && !tool.ref.startsWith('ui.')) {
              warnings.push(`Preset '${presetId}': tool '${toolId}' ref hauria de començar per 'ui.' (got '${tool.ref}')`);
            }
          }
        }
      }
    }
  }

  return { ok: true, errors, warnings };
}

export default function useSlidesConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/slides.config.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`No s'ha pogut carregar la config (${res.status})`);
      const json = await res.json();

      const result = validateSlidesConfig(json);
      if (!result.ok) {
        throw new Error(result.errors[0] || 'Config invàlida');
      }

      if (import.meta?.env?.DEV && result.warnings.length > 0) {
        console.warn('[slides.config] Warnings:', result.warnings);
      }

      setConfig(json);
    } catch (e) {
      setError(e?.message || 'Error carregant la config');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { config, loading, error, refresh };
}
