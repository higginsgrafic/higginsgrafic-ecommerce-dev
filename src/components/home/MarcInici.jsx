/**
 * EL MARC DE LA PAGINA D'INICI.
 *
 * Es l'estructura de la pagina, i NOMES l'estructura: no te contingut, ni
 * textos, ni numeros. Rep una llista de seccions i les munta en ordre de
 * document, amb la columna vertebral que el pla descriu (§3):
 *
 *   1. Una sola columna: les seccions van en flux, en ordre.
 *   2. L'alcada la mana el contingut. Cap seccio te alcada propia.
 *   3. Els aires es declaren (`--esp-*`), no es mesuren.
 *
 * LES DUES PRIMERES SECCIONS VAN EN UNA TAULA DE DUES FILES IGUALS. No es un
 * caprici: la finestra te una alcada, i les dues peces de dalt (les icones i la
 * hero) s'hi reparteixen. La taula fa exactament la finestra menys la capçalera,
 * i cada element va centrat a la seva cella.
 *
 * PER QUE «MENYS LA CAPÇALERA» I NO «LA FINESTRA SENCERA». El `<main>` de
 * l'aplicacio ja porta el `paddingTop` de la capçalera, o sigui que la pagina ja
 * comença al fons de la capçalera. Per tant l'alcada que ha de fer la taula es
 * el que queda de finestra a partir d'aqui: `100vh − --appHeaderOffset`, que la
 * capçalera publica i que el `<main>` tambe escriu com a variable.
 *
 * AIXO ES EL QUE FA QUE LA PAGINA SIGUI AUTOSUFICIENT: el marc no depen de cap
 * numero de fora, nomes de la variable que la capçalera publica per a tothom.
 *
 * Cada cella rep el seu contingut amb l'embolcall que li toca (el carril sencer
 * o el contingut amb marge), i el centratge vertical tambe: el marc no decideix
 * com es centra cada peça, nomes que la cella existeixi i faci la meitat.
 */
function MarcInici({ seccions }) {
  const [primera, segona, ...resta] = seccions;
  return (
    <>
      {/* LA TAULA DE DUES FILES: les dues primeres seccions, centrades. */}
      <div
        className="hg-taula-inici"
        data-taula-inici="1"
        style={{
          height: 'calc(100vh - var(--appHeaderOffset, 0px))',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {[primera, segona].map((seccio, index) => (
          <div
            key={seccio.id}
            data-cella={index + 1}
            // Cada cella centra el seu contingut verticalment: es el que fa que
            // les icones i la hero quedin al mig de la seva meitat.
            style={{ flex: '1 1 50%', minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            {seccio.node}
          </div>
        ))}
      </div>

      {/* LA RESTA, EN FLUX. */}
      {resta.map((seccio) => (
        <div key={seccio.id} data-seguent={seccio.id}>
          {seccio.node}
        </div>
      ))}
    </>
  );
}

export default MarcInici;
