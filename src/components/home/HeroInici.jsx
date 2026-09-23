

/**
 * LA HERO DE L'INICI NOU.
 *
 * NOMES LA CAIXA. El contingut (el carrusel de diapositives) encara no hi es:
 * aquesta passa fixa la MIDA i la POSICIO, que es el que la hero vella te
 * resolt amb tres coses que no volem arrossegar:
 *
 *   1. `transform: scale(0.705)`: la mida VISIBLE era la caixa multiplicada per
 *      0,705, o sigui que l'escala era qui definia la mida i no la caixa. Aqui
 *      la caixa FA DIRECTAMENT la mida final (952 i no 1351), i l'escala
 *      desapareix amb el seu `transform-origin` i el seu efecte sobre els fills.
 *   2. Una posicio `top: calc(-5px - 19px - 50px ...)` de cinc sumands, i un
 *      `heroOffsetPx` que es mesurava des de JavaScript amb correccio
 *      iterativa. Aqui no hi ha cap `top`: la hero es un bloc en flux.
 *   3. L'alcada presa d'una graella de 24 files de llenç (`gridRow: 10 / 25`).
 *      Aqui l'alcada es la proporcio mesurada de la propia caixa, 952 / 401,
 *      que reprodueix la mida vella a totes les mides d'escriptori.
 *
 * VA AL CARRIL, NO DINS DEL CONTINGUT AMB MARGE. L'amplada de la caixa surt del
 * carril de 1350 (952 = el 70,5 %), i aixo nomes es cert si el pare es el carril
 * sencer. Dins de `.hg-marc__contingut`, que te `--marge-lateral` a dins, el
 * pare fa 1270 i la caixa en sortiria 895: MESURAT, i era l'errada que hi havia.
 *
 * L'ALCADA. A escriptori es la proporcio (952 / 401 = 2,3728, mesurada a 1920,
 * 1440, 1280 i 1024). A la vista vertical NO: alla la caixa fa 541 x 430, una
 * alcada FIXA que no ve de la proporcio, i per aixo te la seva propia regla
 * d'orientacio.
 *
 * TODO: el contingut (les cinc diapositives amb la franja de color, el titol i
 * les icones), que ha de viure DINS d'aquesta caixa i escalar amb ella.
 */
function HeroInici() {
  return (
    // LA HERO OMPLE EL CARRIL SENCER, sense aire interior.
    //
    // ABANS HI HAVIA UN AIRE INTERIOR del 14,74 % a cada costat: el complement
    // del `scale(0.705)` de la pagina vella, que feia que la caixa nomes en fos
    // el 70,5 %. L'amo demana que la hero arribi a les dues vores del carril, i
    // per tant l'aire marxa.
    //
    // El bloc es `hg-carril`: l'amplada la mana el carril (que la capçalera
    // publica) i l'alcada surt de la proporcio de la caixa.
    <div
      data-hero-inici="1"
      className="hg-carril"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div
        data-hero-caixa="1"
        className="hg-hero-caixa"
        style={{
          background: 'hsl(var(--muted))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(var(--muted-foreground))',
          fontFamily: 'Roboto Condensed, sans-serif',
          fontSize: '0.875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          // L'amplada i l'alcada (la proporcio, amb la seva excepcio vertical)
          // les declara `foundation.css` a `.hg-hero-caixa`: son geometria, i el
          // seu lloc es alla.
          //
          // Sense `overflow: hidden` ni radi: les dues coses eren de la hero
          // vella (retallar el contingut escalat, i un radi que canviava per
          // dispositiu). Son decisions de dibuix, i es prendran amb el
          // contingut a dins, no abans.
        }}
      >
        Hero
      </div>
    </div>
  );
}

export default HeroInici;
