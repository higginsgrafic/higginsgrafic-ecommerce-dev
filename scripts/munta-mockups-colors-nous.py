#!/usr/bin/env python3
"""Munta els mockups dels 4 colors nous de samarreta.

LA NORMA DE LA INVERSIO (29/09/2026, dictada per l'amo)

    Blanc/Negre (tinta de linia)
        samarreta blanca  -> tinta NEGRA
        samarreta negra   -> tinta BLANCA
        la resta          -> el que correspongui segons el clic

    Color (tinta multi)
        samarreta blanca  -> tinta DARK
        samarreta negra   -> tinta LIGHT
        la resta          -> tinta LIGHT

Es a dir: la inversio nome's salta amb `white` i `black` de nom, no pel to.
Esta comprovat als mockups actuals: `-w-white` porta impressio NEGRA i
`-b-black` la porta BLANCA, i cap dels altres 12 colors inverteix.

QUE FA

Per a cada disseny de la llista de tasques (`mockups/tmp/pink`, que son els
mockups actuals sobre la samarreta `light-pink`) munta el mateix mockup sobre
els 4 colors nous: `rs-sport-grey`, `ice-grey`, `charcoal` i `dark-chocolate`.

D'ON SURT CADA COSA

  - La SAMARRETA: la base de 800x800 del joc nou
    (`public/placeholders/apparel/t-shirt/mockup-gildan/`), que es la mateixa
    familia de foto que la dels mockups actuals (0,2/255 de diferencia).
  - El DIBUIX: el PNG del volum `/Volumes/HD EXPORT/GRAFIC/<col·leccio>/...`,
    triat per la NORMA de dalt.
  - La POSICIO I LA MIDA de la impressio: es dedueixen del mockup de referencia
    comparant-lo amb la samarreta buida del seu color. Es proven tots els colors
    en que el disseny existeix i es queda el que te mes pixels d'impressio, que
    es el mes llegible.

COM ES COMPROVA

El dibuix triat es valida component-lo sobre la samarreta de referencia i
comparant el resultat amb el mockup de referencia: dels candidats de la seva
tinta, guanya el que hi assembla mes. Si el millor encara te una diferencia
gran, es marca com a sospitos.

Us:
    python3 scripts/munta-mockups-colors-nous.py --prova       # nome's diu que faria
    python3 scripts/munta-mockups-colors-nous.py --prova --limit 10
    python3 scripts/munta-mockups-colors-nous.py               # ho fa tot
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import os
import re
import shutil
import subprocess
import sys

from PIL import Image, ImageChops, ImageStat

# Els PNG de CUBE passen de 200 Mpx i la comprovacio de "bomba" de Pillow els
# refusa. Aqui es desactiva i el guio els redueix abans de carregar-los
# (vegeu `dibuix_lleuger`).
Image.MAX_IMAGE_PIXELS = None

ARREL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOLUM = '/Volumes/HD EXPORT/GRÀFIC'
TMP_BASE = '/tmp/mockups-blank'
TMP_DIBUIXOS = '/tmp/dibuixos-lleugers'
LIMIT_PX = 40_000_000   # per sobre d'aixo, el dibuix es redueix abans de carregar-lo
LLISTA = 'public/placeholders/apparel/mockups/tmp/pink'
MOCKUPS = 'public/placeholders/apparel/mockups'
BASE_NOUS = 'public/placeholders/apparel/t-shirt/mockup-gildan'
ARXIU = ('/Users/marc/EXTRA LOCAL/PROJECTES LOCAL/GRUP HIGGINS/GRÀFIC/COL·LECCIONS/'
         'COL·LECCIONS 2/_ 97 MOCKUPS/MOCKUPS 3/MOCKUPS')

COLORS_NOUS = ['rs-sport-grey', 'ice-grey', 'charcoal', 'dark-chocolate']
COLOR_REF = 'light-pink'
# Colors de referencia per mirar-s'hi, per ordre de contrast. La posicio es la
# mateixa per a tots els colors d'un disseny, o sigui que nome's cal que un
# sigui llegible; es proven aquests i prou (provar-los tots triga molt mes).
REFERENTS = {'b': ['white', 'black', 'light-blue'],
             'w': ['black', 'white', 'navy'],
             'multi': ['black', 'white', 'irish-green']}
PX_BONA = 2500   # a partir d'aqui la referencia ja es prou llegible

COL_FITXER = {
    'first-contact': '1. FIRST CONTACT',
    'the-human-inside': '2. THE HUMAN INSIDE',
    'cube': '3. CUBE',
    'austen-pemberley': '4. AUSTEN/PEMBERLEY HOUSE',
    'austen-keep-calm': '4. AUSTEN/KEEP CALM',
    'austen-cites-quotes': '4. AUSTEN/QUOTES',
    'austen-crosswords': '4. AUSTEN/CROSSWORDS',
    'austen-cites-looking-for-my-darcy': '4. AUSTEN/LOOKING FOR MY DARCY',
    'miscellania': '5. MISCELLANIA',
}
TINTA_CARPETA = {'w': 'BLANC', 'b': 'NEGRE', 'multi': 'COLOR'}

# NOMS QUE NO LLIGUEN. El nom del mockup i el del fitxer de produccio no sempre
# son el mateix: surt de `drawingPaths.js` (STRIPE_DESIGN_MAP) i de mesurar els
# originals. Sense aixo, el guio tria el dibuix pel nom i s'equivoca (per
# exemple, `pink-yellow-frame` agafava el dibuix del vermell).
MAPA_DIBUIX = {
    'austen-cites-looking-for-my-darcy': {
        'looking-for-my-darcy-pink-solid': 'looking-for-my-darcy-fuchsia-solid',
        'looking-for-my-darcy-pink-yellow-frame': 'looking-for-my-darcy-yellow-fuchsia-frame',
        'looking-for-my-darcy-red-yellow-frame': 'looking-for-my-darcy-yellow-red-frame',
        'looking-for-my-darcy-yellow-blue-frame': 'looking-for-my-darcy-blue-yellow-frame',
        'looking-for-my-darcy-yellow-pink-frame': 'looking-for-my-darcy-fuchsia-yellow-frame',
    },
    'austen-cites-quotes': {
        'quotes-i-admire-and-love-you': 'quotes-i-prefer-to-be',
        'quotes-unsociable-and-taciturn': 'quotes-body-and-soul',
        'quotes-you-have-bewitched-me': 'quotes-allow-me-to-tell-you',
    },
    'cube': {
        'robbocube': 'robocube',
        'maschinenmensch': 'maschinencube',
        'iron-kong': "iron-cube-'08-(iron-kong)",
        'iron-cube': "iron-cube-'68",
        'cylon-cube': "cylon-cube-'03",
        '3cube-p0': 'cube-3-p0',
        'afrodita-c': 'afrodita-cube',
        'cybercube': 'cyber-cube',
        'darth-cube': 'darth-cube',
        'mazinger-c': 'mazinger-c',
    },
}


# ---------------------------------------------------------------- la norma

def tinta_efectiva(tinta, color):
    """La tinta que s'ha de veure de debo, segons la norma de la inversio."""
    if tinta == 'w' and color == 'white':
        return 'b'
    if tinta == 'b' and color == 'black':
        return 'w'
    return tinta


def clau_tinta(tinta, color):
    """La clau amb que es busca el dibuix a l'index."""
    if tinta == 'multi':
        return 'multi-dark' if color == 'white' else 'multi-light'
    return tinta_efectiva(tinta, color)


# ---------------------------------------------------------------- utilitats

def base_git(color):
    """La samarreta buida de 800 px del color demanat (del joc vell, a git)."""
    os.makedirs(TMP_BASE, exist_ok=True)
    desti = os.path.join(TMP_BASE, f'{color}.webp')
    if not os.path.exists(desti):
        cami = (f'public/placeholders/apparel/t-shirt/gildan_5000/'
                f'gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_{color}_gpr-4-0_front.webp')
        res = subprocess.run(['git', 'show', f'HEAD:{cami}'], capture_output=True)
        if res.returncode != 0:
            return None
        with open(desti, 'wb') as f:
            f.write(res.stdout)
    return desti


def base_nova(color):
    return f'{BASE_NOUS}/mockup-gildan-t-shirt-{color}.webp'


def normalitza(s):
    return re.sub(r'[^a-z0-9]+', '', s.lower())


def mascara_diferencia(ref, blank, llindar=60):
    """La mascara de la impressio: on el mockup i la samarreta buida difereixen.

    Amb operacions d'imatge (rapid) i per canal, perque un dibuix blau pot tenir
    poca diferencia de lluminositat pero molta en un sol canal. El llindar es
    una taula de 256 valors: amb una lambda, `point` es torna lentissim.
    """
    if blank not in _CAU_RGB:
        _CAU_RGB[blank] = Image.open(blank).convert('RGB')
    A = _CAU_RGB[blank]
    B = Image.open(ref).convert('RGB')
    taula = bytes(255 if v > llindar else 0 for v in range(256))
    m = None
    for banda in ImageChops.difference(A, B).split():
        b = banda.point(taula)
        m = b if m is None else ImageChops.lighter(m, b)
    return m


def bbox_impressio(ref, blank, llindar=60):
    """(requadre de la impressio, pixels d'impressio)."""
    m = mascara_diferencia(ref, blank, llindar)
    return m.getbbox(), m.histogram()[255]


def dibuix_lleuger(cami):
    """Una copia reduida del dibuix si es enorme.

    Els PNG de CUBE fan fins a 273 Mpx (18662x14647): carregar-los sencers son
    gairebe 1 GB de memoria, i per composar a ~200 px no cal. Es redueixen amb
    `sips` (que conserva l'alfa) i es desen a /tmp, per no tocar l'original.
    """
    try:
        with Image.open(cami) as im:
            mida = im.size
    except Exception:
        return cami
    if mida[0] * mida[1] <= LIMIT_PX:
        return cami
    os.makedirs(TMP_DIBUIXOS, exist_ok=True)
    clau = hashlib.md5(f'{cami}|{os.path.getmtime(cami)}'.encode()).hexdigest()[:12]
    desti = os.path.join(TMP_DIBUIXOS, f'{clau}.png')
    if not os.path.exists(desti):
        subprocess.run(['sips', '-Z', '2000', cami, '--out', desti],
                       capture_output=True, check=True)
    return desti


_CAU_TROS = {}
_CAU_IMATGES = {}
_CAU_RGB = {}
_CAU_CAIXA = {}


def tria_candidats(candidats, clau_nom):
    """Els candidats que lliguen de nom; si cap es exacte, els tres mes semblants."""
    exactes = [c for c in candidats if c[0] == clau_nom]
    if exactes:
        return exactes
    return sorted(candidats, key=lambda c: difflib.SequenceMatcher(None, clau_nom, c[0]).ratio(),
                  reverse=True)[:3]


def caixa_tinta(dibuix):
    """El requadre de la tinta del dibuix (cachetat)."""
    if dibuix not in _CAU_CAIXA:
        d = Image.open(dibuix_lleuger(dibuix)).convert('RGBA')
        _CAU_CAIXA[dibuix] = d.split()[3].getbbox()
        d.close()
    return _CAU_CAIXA[dibuix]


def aspecte(caixa):
    return (caixa[2] - caixa[0]) / (caixa[3] - caixa[1]) if caixa else 1.0


def tros_dibuix(dibuix, bb):
    """(el dibuix retallat per la seva alfa i escalat, la posicio on va).

    L'escala es UNIFORME i el dibuix es centra al requadre: estirar-lo per
    encaixar-hi exactament el deformava quan el requadre de referencia no te
    exactament la mateixa forma que el dibuix (ho va veure l'amo al Darth Cube).
    """
    clau = (dibuix, bb)
    if clau not in _CAU_TROS:
        d = Image.open(dibuix_lleuger(dibuix)).convert('RGBA')
        caixa = d.split()[3].getbbox()
        if not caixa:
            _CAU_TROS[clau] = (None, (0, 0))
        else:
            ample, alt = bb[2] - bb[0], bb[3] - bb[1]
            escala = min(ample / (caixa[2] - caixa[0]), alt / (caixa[3] - caixa[1]))
            mida = (max(1, round((caixa[2] - caixa[0]) * escala)),
                    max(1, round((caixa[3] - caixa[1]) * escala)))
            tros = d.crop(caixa).resize(mida, Image.LANCZOS)
            _CAU_TROS[clau] = (tros, (bb[0] + (ample - mida[0]) // 2,
                                      bb[1] + (alt - mida[1]) // 2))
        d.close()
    return _CAU_TROS[clau]


def composa(blank, dibuix, bb):
    if blank not in _CAU_IMATGES:
        _CAU_IMATGES[blank] = Image.open(blank).convert('RGBA')
    b = _CAU_IMATGES[blank].copy()
    tros, posicio = tros_dibuix(dibuix, bb)
    if tros is not None:
        b.alpha_composite(tros, posicio)
    return b


def diferencia(a, b):
    if isinstance(a, str):
        a = Image.open(a)
    if isinstance(b, str):
        b = Image.open(b)
    return sum(ImageStat.Stat(ImageChops.difference(a.convert('RGB'), b.convert('RGB'))).mean) / 3


def index_dibuixos():
    """{colleccio: {clau_tinta: [(nom_normalitzat, cami)]}}."""
    idx = {}
    for col, carpeta in COL_FITXER.items():
        idx[col] = {}
        for tinta, sub in TINTA_CARPETA.items():
            d = os.path.join(VOLUM, carpeta, sub)
            if not os.path.isdir(d):
                continue
            fitxers = []
            for n in sorted(os.listdir(d)):
                if not n.lower().endswith('.png'):
                    continue
                base = re.sub(r'-stripe$', '', os.path.splitext(n)[0])
                fitxers.append((normalitza(base), os.path.join(d, n), n.lower()))
            if tinta == 'multi':
                # Hi ha dibuixos multi que no porten el to al nom (LFMD, CUBE):
                # aquests valen per als dos tos.
                clar = [f for f in fitxers if 'multi-light' in f[2]]
                fosc = [f for f in fitxers if 'multi-dark' in f[2]]
                sense_to = [f for f in fitxers if 'multi-light' not in f[2] and 'multi-dark' not in f[2]]
                idx[col]['multi-light'] = clar + sense_to
                idx[col]['multi-dark'] = fosc + sense_to
            else:
                idx[col][tinta] = fitxers
    return idx


def index_mockups():
    """{nom_de_fitxer: cami} de tots els mockups del projecte (tmp inclos)."""
    idx = {}
    for arrel, _, fitxers in os.walk(os.path.join(ARREL, MOCKUPS)):
        for n in fitxers:
            if n.endswith('.webp') and n not in idx:
                idx[n] = os.path.join(arrel, n)
    return idx


def llegeix_llista():
    """[(design, colleccio, tinta)] de la llista de tasques (`tmp/pink`)."""
    out = []
    for n in sorted(os.listdir(os.path.join(ARREL, LLISTA))):
        if not n.endswith(f'-{COLOR_REF}.webp'):
            continue
        m = re.match(r'^(.*)-(b|w|multi)$', n[: -(len(COLOR_REF) + 6)])
        if not m:
            print('  NO PUC LLEGIR:', n)
            continue
        cos, tinta = m.group(1), m.group(2)
        colleccio = next((c for c in sorted(COL_FITXER, key=len, reverse=True)
                          if cos == c or cos.startswith(c + '-')), None)
        if not colleccio and re.match(r'^(robocube|mazinger-c|maschinenmensch|iron-kong|iron-cube|'
                                      r'darth-cube|cylon-cube|cybercube|afrodita-c|3cube-p0)', cos):
            colleccio = 'cube'
        out.append((cos, colleccio, tinta))
    return out


def carpeta_desti(ref):
    return os.path.relpath(os.path.dirname(ref), os.path.join(ARREL, MOCKUPS))


def carpeta_arxiu(carpeta):
    """A l'arxiu, austen/cites/x viu a austen/x."""
    return (carpeta.replace('austen/cites/quotes', 'austen/quotes')
                   .replace('austen/cites/looking_for_my_darcy', 'austen/looking_for_my_darcy'))


def resol(design, colleccio, tinta, idx, idx_mock):
    """(bbox, dibuix, diferencia, color_ref, ref) o (None,)*5."""
    # El nom del dibuix. El to (light/dark) te la mateixa forma, o sigui que per
    # mirar l'aspecte dona igual quin dels dos s'agafi.
    resta = design[len(colleccio) + 1:] if design.startswith(colleccio + '-') else design
    resta = MAPA_DIBUIX.get(colleccio, {}).get(resta, resta)
    clau_nom = normalitza(resta)
    arrel = idx.get(colleccio, {})
    candidats0 = arrel.get(clau_tinta(tinta, REFERENTS[tinta][0]), [])
    if not candidats0:
        return (None,) * 5
    prova0 = tria_candidats(candidats0, clau_nom)
    asp = aspecte(caixa_tinta(prova0[0][1]))

    # La posicio: la referencia que te una forma que lliga amb la del dibuix. Si
    # nome's es mira el nombre de pixels, un dibuix fosc sobre samarreta fosca
    # enganya (nome's es veuen les llums) i el requadre surt deforme.
    refs = []
    for color in REFERENTS[tinta]:
        ref = idx_mock.get(f'{design}-{tinta}-{color}.webp')
        if not ref:
            continue
        blank = base_git(color)
        if not blank:
            continue
        bb, px = bbox_impressio(ref, blank)
        if not bb or px < 200:
            continue
        refs.append((abs(aspecte(bb) / asp - 1), -px, color, ref, blank, bb))
    if not refs:
        return (None,) * 5
    refs.sort(key=lambda r: (r[0], r[1]))
    _, _, color, ref, blank, bb = refs[0]

    # Els candidats del to QUE TOCA per aquest color (la inversio canvia el to
    # segons el color de samarreta), i es comprova component-los.
    candidats = arrel.get(clau_tinta(tinta, color), [])
    if not candidats:
        return (None,) * 5
    prova = tria_candidats(candidats, clau_nom)
    if len(prova) == 1 and prova[0][0] == clau_nom:
        cami = prova[0][1]
        return bb, cami, diferencia(composa(blank, cami, bb), ref), color, ref
    millor, millor_dif = None, None
    for _, cami, _ in prova:
        try:
            dif = diferencia(composa(blank, cami, bb), ref)
        except Exception:
            continue
        if millor_dif is None or dif < millor_dif:
            millor, millor_dif = cami, dif
    if not millor:
        return (None,) * 5
    return bb, millor, millor_dif, color, ref


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--prova', action='store_true', help="nome's diu que faria")
    ap.add_argument('--limit', type=int, default=0)
    args = ap.parse_args()

    if not os.path.isdir(VOLUM):
        print('ERROR: el volum de dibuixos no hi es:', VOLUM, file=sys.stderr)
        return 1
    idx = index_dibuixos()
    idx_mock = index_mockups()
    llista = llegeix_llista()
    total = len(llista) * len(COLORS_NOUS)
    print(f'  dissenys: {len(llista)} · colors nous: {len(COLORS_NOUS)} -> {total} mockups')
    print("  norma: w+white->b · b+black->w · multi: white->dark, resta->light")
    print()
    fets, sospitosos = 0, []
    for design, colleccio, tinta in (llista[: args.limit] if args.limit else llista):
        if not colleccio:
            print(f'  SENSE COLLECCIO: {design}')
            sospitosos.append((design, 'sense colleccio'))
            continue
        bb, dibuix, dif, color_ref, ref = resol(design, colleccio, tinta, idx, idx_mock)
        if not bb:
            print(f'  SENSE POSICIO: {design}')
            sospitosos.append((design, 'sense posicio'))
            continue
        carpeta = carpeta_desti(ref)
        marca = '   <-- SOSPITOS' if dif > 3 else ''
        print(f'  {design:58s} ref={color_ref:11s} '
              f'bbox=({bb[0]:3d},{bb[1]:3d})-({bb[2]:3d},{bb[3]:3d}) '
              f'({bb[2]-bb[0]:3d}x{bb[3]-bb[1]:3d}) dif={round(dif, 2)}{marca}')
        print(f'      {os.path.relpath(dibuix, VOLUM)}   ->  {carpeta}/')
        if dif > 3:
            sospitosos.append((design, f'dif={round(dif, 2)}'))
        if args.prova:
            continue
        # Cap dels 4 colors nous es diu white ni black, o sigui que la tinta
        # efectiva es la mateixa per als quatre i el dibuix tambe.
        for color in COLORS_NOUS:
            out = composa(base_nova(color), dibuix, bb)
            nom = f'{design}-{tinta}-{color}.webp'
            bases = [os.path.join(ARREL, MOCKUPS, carpeta),
                     os.path.join(ARXIU, carpeta_arxiu(carpeta))]
            for i, base in enumerate(bases):
                cami = os.path.join(base, nom)
                # EL VOLUM DE DIBUIXOS ES DE PRODUCCIO: NOME'S S'HIL LLEGEIX.
                if os.path.abspath(cami).startswith(os.path.abspath(VOLUM)):
                    raise RuntimeError(f'MAI s\'ha d\'escriure dins del volum: {cami}')
                os.makedirs(base, exist_ok=True)
                if i == 0:
                    # method=6 triga 2,6 s per fitxer; method=4, 0,06 s i fa la
                    # mateixa mida. La segona copia es copia, no es re-codifica.
                    out.save(cami, 'WEBP', quality=90, method=4)
                else:
                    shutil.copy2(os.path.join(bases[0], nom), cami)
        fets += 1
    print()
    print(f'  dissenys fets: {fets} · mockups escrits: {fets * len(COLORS_NOUS)}')
    if sospitosos:
        print(f'  SOSPITOSOS ({len(sospitosos)}):')
        for d, motiu in sospitosos:
            print(f'    {d}  {motiu}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
