import { describe, it, expect } from 'vitest';
import { srcDibuixVelatEnNegre } from '../../src/utils/resolveStripeTile.js';

// EL DIBUIX DE LES SAMARRETES VELADES, EN NEGRE (28/09/2026).
//
// Ho va demanar en Marc: «Quan les samarretes velades tenen a sota un color
// blanc o un de color no es veuen i sembla que la samarreta estigui buida. Per
// tant, a partir d'ara hauran de tenir el dibuix en negre. Quan se les cliqui,
// el color passarà a ser el del selector» i, tot seguit, «les que només són en
// color no les toquis!».
//
// Aqui es fixa la regla: les cases d'una col·lecció que no és l'activa demanen
// el dibuix en negre, EXCEPTE les que només existeixen en color (els solids i
// els marcs de LOOKING FOR MY DARCY), que es queden com són.

const FIRST_CONTACT_ITEM = 'NX-01';
const BLACK = '/custom_logos/drawings/images_stripe/first_contact/black/nx-01-b-stripe.webp';
const WHITE = '/custom_logos/drawings/images_stripe/first_contact/white/nx-01-w-stripe.webp';
const COLOR = '/custom_logos/drawings/images_stripe/first_contact/color/nx-01-multi-light-stripe.webp';

// Els dibuixos que només existeixen en color: `resolveForItem` retorna el mateix
// camí per a qualsevol variant (el del color).
const DARCY_SOLID = '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/red-solid-grid.webp';
const DARCY_FRAME = '/custom_logos/drawings/images_grid/austen/looking_for_my_darcy/blue-frame-grid.webp';

describe('srcDibuixVelatEnNegre', () => {
  it('una casa velada amb versió negra demana el dibuix NEGRE', () => {
    expect(srcDibuixVelatEnNegre({
      item: FIRST_CONTACT_ITEM,
      collection: 'first_contact',
      variant: 'white',
      displayedShirtColor: 'white',
    })).toBe(BLACK);

    // Tambe si la variant de sempre es la de color.
    expect(srcDibuixVelatEnNegre({
      item: FIRST_CONTACT_ITEM,
      collection: 'first_contact',
      variant: 'color',
      displayedShirtColor: 'white',
    })).toBe(BLACK);
  });

  it('una casa velada que NOMES existeix en color es queda en color', () => {
    // Els solids i els marcs de LOOKING FOR MY DARCY no tenen versió blanca ni
    // negra: el que es demana es el mateix dibuix, i no s'hi ha de tocar res.
    const solid = srcDibuixVelatEnNegre({
      item: DARCY_SOLID,
      collection: 'austen',
      variant: 'color',
      displayedShirtColor: 'white',
    });
    expect(solid).toContain('/looking_for_my_darcy/color/solid/');
    expect(solid).not.toContain('/black/');

    const marc = srcDibuixVelatEnNegre({
      item: DARCY_FRAME,
      collection: 'austen',
      variant: 'color',
      displayedShirtColor: 'white',
    });
    expect(marc).toContain('/looking_for_my_darcy/color/frame/');
    expect(marc).not.toContain('/black/');
  });

  it('la casa ACTIVA no hi passa: el seu dibuix el tria la variant de sempre', () => {
    // (Aquesta funcio nome's es per a les velades; la comprovacio es que la
    // variant que li passem es la que mana quan no hi ha versio negra.)
    const ambBlanc = srcDibuixVelatEnNegre({
      item: FIRST_CONTACT_ITEM,
      collection: 'first_contact',
      variant: 'white',
      displayedShirtColor: 'white',
    });
    expect(ambBlanc).not.toBe(WHITE);
    expect(ambBlanc).toBe(BLACK);
    // I la variant de color d'un dibuix que si que en te, tambe acaba en negre.
    expect(srcDibuixVelatEnNegre({
      item: FIRST_CONTACT_ITEM,
      collection: 'first_contact',
      variant: 'color',
      displayedShirtColor: 'white',
    })).toBe(BLACK);
  });

  it('si ja ve en negre, es queda igual', () => {
    expect(srcDibuixVelatEnNegre({
      item: FIRST_CONTACT_ITEM,
      collection: 'first_contact',
      variant: 'black',
      displayedShirtColor: 'white',
    })).toBe(BLACK);
  });

  it('un dibuix que no es resol dona null (i la casa queda fora de la tira)', () => {
    expect(srcDibuixVelatEnNegre({
      item: 'NO-EXISTEIX',
      collection: 'first_contact',
      variant: 'white',
      displayedShirtColor: 'white',
    })).toBe(null);
  });

  it('la variant de color del mateix dibuix tambe te el seu camí (control)', () => {
    // Perque el test de dalt tingui sentit: el camí de color existeix i es
    // DIFFERENT del negre. Si algun dia deixessin de ser-ho, aixo saltaria.
    expect(COLOR).not.toBe(BLACK);
    expect(COLOR).toContain('/color/');
    expect(BLACK).toContain('/black/');
  });
});
