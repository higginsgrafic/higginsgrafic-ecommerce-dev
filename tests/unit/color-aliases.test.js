import { describe, it, expect } from 'vitest';
import { normalizeColor, normalizeSize } from '../../netlify/functions/create-payment-intent.js';

// Aquesta prova existeix per un error que impedia comprar.
//
// La fitxa de producte ensenya els colors en català ('Negre', 'Blanc',
// 'Vermell', 'Militar', 'Forest') i enviava aquests noms al servidor. El
// catàleg, en canvi, els guarda amb el nom de Gelato ('Black', 'White', 'Red',
// 'Military Green', 'Forest Green'). El servidor no trobava la variant i el
// pagament fallava amb "No s'ha pogut identificar la variant de Gelato":
// no es podia comprar ni una samarreta negra ni una de blanca.

describe('create-payment-intent — correspondència de noms', () => {
  describe('colors', () => {
    it('els noms catalans de la botiga equivalen als del catàleg', () => {
      expect(normalizeColor('Negre')).toBe(normalizeColor('Black'));
      expect(normalizeColor('Blanc')).toBe(normalizeColor('White'));
      expect(normalizeColor('Vermell')).toBe(normalizeColor('Red'));
      expect(normalizeColor('Militar')).toBe(normalizeColor('Military Green'));
      expect(normalizeColor('Forest')).toBe(normalizeColor('Forest Green'));
    });

    it('no distingeix majúscules, espais, guions ni accents', () => {
      expect(normalizeColor('NEGRE')).toBe(normalizeColor('negre'));
      expect(normalizeColor('Military-Green')).toBe(normalizeColor('Military Green'));
      expect(normalizeColor('military_green')).toBe(normalizeColor('Military Green'));
      expect(normalizeColor('  Black  ')).toBe(normalizeColor('black'));
    });

    it('els colors que ja coincideixen es queden igual', () => {
      for (const color of ['Royal', 'Navy', 'Gold', 'Purple', 'Daisy', 'Light Blue', 'Light Pink', 'Irish Green', 'kiwi']) {
        expect(normalizeColor(color)).toBe(color.toLowerCase().replace(/\s+/g, ''));
      }
    });

    it('un color desconegut no es converteix en un altre', () => {
      expect(normalizeColor('Inventat')).toBe('inventat');
      expect(normalizeColor('')).toBe('');
      expect(normalizeColor(null)).toBe('');
      expect(normalizeColor(undefined)).toBe('');
    });
  });

  describe('talles', () => {
    it('les talles dobles de la botiga equivalen a les del catàleg', () => {
      expect(normalizeSize('XXL')).toBe(normalizeSize('2XL'));
      expect(normalizeSize('XXXL')).toBe(normalizeSize('3XL'));
    });

    it('les talles normals es queden igual', () => {
      expect(normalizeSize('L')).toBe('L');
      expect(normalizeSize('s')).toBe('S');
      expect(normalizeSize(null)).toBe('');
    });
  });
});
