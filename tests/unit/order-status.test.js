import { describe, it, expect } from 'vitest';
import {
  STATUS_TO_STAGE,
  ESTATS_ANORMALS,
  avisDEstatAnormal,
} from '../../src/lib/orderStatus.js';

// Aquest test protegeix la informació que el client es creu sobre la seva
// comanda. Va estar malament i no ha de tornar a estar-ho mai:
//
//   - una comanda ja enviada es mostrava com "Processant"
//   - una comanda CANCEL·LADA es mostrava com "Comanda rebuda i confirmada"
//   - una comanda aturada es mostrava com "Processant"

// Etapes que dibuixa la barra de progrés de la pàgina de seguiment.
const ETAPES_VALIDES = ['created', 'processing', 'in_production', 'shipped', 'delivered'];

// Estats que el servidor pot desar a la base de dades (vegeu
// netlify/functions/create-payment-intent.js, netlify/functions/stripe-webhook.js
// i netlify/functions/gelato-webhook.js).
const ESTATS_DEL_SERVIDOR = [
  'pendent',
  'confirmada',
  'en_preparacio',
  'seguiment',
  'en_repartiment',
  'entregada',
  'cancel_lada',
  'aturada',
];

describe('orderStatus — què veu el client', () => {
  it('cada etapa del mapa és una etapa que la pàgina sap dibuixar', () => {
    for (const etapa of Object.values(STATUS_TO_STAGE)) {
      expect(ETAPES_VALIDES).toContain(etapa);
    }
  });

  it("'seguiment' (comanda enviada) es mostra com a enviada, no com a 'processant'", () => {
    expect(STATUS_TO_STAGE['seguiment']).toBe('shipped');
    expect(STATUS_TO_STAGE['en_repartiment']).toBe('shipped');
  });

  it("una comanda cancel·lada NO es pot pintar com una etapa normal", () => {
    expect(STATUS_TO_STAGE['cancel_lada']).toBeUndefined();
    expect(STATUS_TO_STAGE['aturada']).toBeUndefined();
  });

  it('cada estat del servidor o bé té etapa, o bé té avís propi', () => {
    for (const estat of ESTATS_DEL_SERVIDOR) {
      const teEtapa = Boolean(STATUS_TO_STAGE[estat]);
      const teAvis = Boolean(avisDEstatAnormal(estat));
      expect(teEtapa || teAvis, `l'estat "${estat}" no es mostra de cap manera`).toBe(true);
      // I no pot tenir les dues coses alhora: o va endavant o està aturada.
      expect(teEtapa && teAvis, `l'estat "${estat}" es mostra de dues maneres`).toBe(false);
    }
  });

  it('els estats anormals tenen un avís amb títol i explicació', () => {
    for (const estat of ESTATS_ANORMALS) {
      const avis = avisDEstatAnormal(estat);
      expect(avis).not.toBeNull();
      expect(avis.titol.length).toBeGreaterThan(0);
      expect(avis.text.length).toBeGreaterThan(20);
      expect(avis.classes.length).toBeGreaterThan(0);
    }
  });

  it('una comanda cancel·lada diu que està cancel·lada, no que vagi bé', () => {
    const avis = avisDEstatAnormal('cancel_lada');
    expect(avis.titol.toLowerCase()).toContain('cancel');
  });

  it('una comanda normal no té cap avís', () => {
    for (const estat of ['en_preparacio', 'seguiment', 'entregada']) {
      expect(avisDEstatAnormal(estat)).toBeNull();
    }
  });

  it('un estat desconegut o buit no genera avís', () => {
    expect(avisDEstatAnormal('inventat')).toBeNull();
    expect(avisDEstatAnormal(null)).toBeNull();
    expect(avisDEstatAnormal(undefined)).toBeNull();
  });
});
