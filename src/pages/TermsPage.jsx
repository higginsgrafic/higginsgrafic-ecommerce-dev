import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: '1. Informació General',
      content: `**Raó Social:** GRÀFIC
**NIF:** [Pendent]
**Domicili:** [Adreça completa]
**Email:** higginsgrafic@gmail.com
**Telèfon:** [Número de telèfon]

GRÀFIC és una marca de roba amb missatge que opera a través d'aquest lloc web per oferir productes de moda sostenible amb impressió sota demanda.`
    },
    {
      title: '2. Objecte i Àmbit d\'Aplicació',
      content: `Aquestes Condicions Generals regulen l'accés i ús del lloc web higginsgrafic.com (d'ara endavant, "el Lloc Web") i la compra de productes ofererts per GRÀFIC.

L'ús del Lloc Web i la realització de comandes implica l'acceptació plena i sense reserves d'aquestes Condicions Generals, així com de la Política de Privacitat.

Ens reservem el dret de modificar aquestes condicions en qualsevol moment. Les condicions aplicables seran les vigents en el moment de la formalització de la comanda.`
    },
    {
      title: '3. Productes i Preus',
      content: `**3.1 Descripció dels Productes**
Tots els productes es mostren amb fotografies i descripcions el més exactes possible. No obstant això, els colors poden variar lleugerament segons la pantalla utilitzada.

Els productes són fabricats sota demanda pel nostre soci Gelato, garantint qualitat i sostenibilitat.

**3.2 Preus**
• Tots els preus mostrats inclouen IVA (21% a Espanya)
• Els preus poden variar sense avís previ
• El preu aplicable és el vigent en el moment de la comanda
• Els costos d'enviament s'afegiran al preu del producte

**3.3 Disponibilitat**
Els productes estan subjectes a disponibilitat. Ens reservem el dret de limitar les quantitats venudes i de descontinuar productes sense avís previ.`
    },
    {
      title: '4. Procés de Comanda',
      content: `**4.1 Realització de la Comanda**
Per fer una comanda has de:
1. Seleccionar els productes i afegir-los a la cistella
2. Revisar la cistella i procedir al checkout
3. Proporcionar les dades personals i d'enviament
4. Seleccionar el mètode de pagament
5. Revisar i confirmar la comanda

**4.2 Confirmació**
Un cop rebut el pagament, us enviarem un correu de confirmació amb:
• Número de comanda
• Detalls dels productes
• Adreça d'enviament
• Import total
• Temps estimat d'enviament

**4.3 Contracte**
El contracte de compravenda es considerarà formalitzat quan rebis l'email de confirmació de la comanda.`
    },
    {
      title: '5. Pagament',
      content: `**5.1 Mètodes de Pagament**
Acceptem pagaments amb:
• Targetes de crèdit/dèbit (Visa, Mastercard, American Express)
• Altres mètodes habilitats a través de Stripe

**5.2 Seguretat**
Tots els pagaments es processen de forma segura a través de Stripe, que compleix amb els estàndards PCI DSS. No emmagatzemem les dades de la targeta als nostres servidors.

**5.3 Facturació**
Rebreu una factura electrònica per correu un cop s'hagi processat el pagament. Si necessiteu una factura amb dades fiscals específiques, indiqueu-ho abans de finalitzar la comanda.`
    },
    {
      title: '6. Enviament i Lliurament',
      content: `**6.1 Àrea d'Enviament**
Enviem a tots els països de la Unió Europea i seleccionats internacionalment a través de Gelato.

**6.2 Costos d'Enviament**
• Enviament GRATUÏT per comandes superiors a 50€ (a Espanya)
• Per comandes inferiors: segons destinació (calculat al checkout)
• Enviaments internacionals: segons país de destinació

**6.3 Temps de Lliurament**
Els temps de lliurament estimats són:
• **Producció:** 2-5 dies laborables (print-on-demand)
• **Enviament Espanya:** 3-5 dies laborables
• **Enviament UE:** 5-10 dies laborables
• **Enviament Internacional:** 10-15 dies laborables

**6.4 Seguiment**
Rebreu un número de seguiment per correu quan la comanda s'enviï.

**6.5 Lliuraments Fallits**
Si no es pot lliurar la comanda per:
• Adreça incorrecta o incompleta
• Absència del destinatari en diversos intents
• Rebuig del paquet

L'article es retornarà i podrem aplicar costos addicionals de reenvio o cancel·lar la comanda.`
    },
    {
      title: '7. Dret de Desistiment (14 dies)',
      content: `**7.1 Termini**
Segons la normativa europea de protecció dels consumidors, tens 14 dies naturals des de la recepció del producte per desistir de la compra sense necessitat de justificació.

**7.2 Com Exercir el Dret**
Per exercir el dret de desistiment has de:
1. Notificar-nos per email a higginsgrafic@gmail.com
2. Indicar número de comanda i producte(s) a retornar
3. Enviar el producte en condicions originals

**7.3 Condicions de Devolució**
• El producte ha d'estar sense usar i amb les etiquetes originals
• Ha d'estar en el seu embalatge original
• No s'accepten devolucions de productes personalitzats (si aplica)

**7.4 Reemborsament**
• Reemborsament en un màxim de 14 dies des de la recepció de la devolució
• Reemborsament pel mateix mètode de pagament utilitzat
• Costos d'enviament de devolució a càrrec del client (tret de defecte)
• No es reemborsaran els costos d'enviament originals`
    },
    {
      title: '8. Garantia i Defectes',
      content: `**8.1 Garantia Legal**
Tots els productes tenen una garantia legal de 2 anys contra defectes de fabricació, segons la legislació espanyola i europea.

**8.2 Productes Defectuosos**
Si el producte arriba amb defectes o danys:
1. Notifica'ns en un màxim de 7 dies des de la recepció
2. Envia fotos del defecte a higginsgrafic@gmail.com
3. T'enviarem un reemplaçament sense cost addicional

**8.3 Errors en la Comanda**
Si reps un producte incorrecte per error nostre, ens farem càrrec de:
• El cost del reenvio del producte correcte
• El cost de devolució del producte incorrecte

**8.4 Exclusions**
La garantia no cobreix:
• Danys causats per ús inadequat
• Desgast normal del producte
• Alteracions o reparacions no autoritzades`
    },
    {
      title: '9. Propietat Intel·lectual',
      content: `**9.1 Drets d'Autor**
Tots els dissenys, logotips, textos, imatges i altres elements del Lloc Web són propietat exclusiva de GRÀFIC o dels seus llicenciadors i estan protegits per les lleis de propietat intel·lectual.

**9.2 Ús Permès**
L'ús del Lloc Web t'atorga una llicència limitada, no exclusiva i no transferible per:
• Navegar pel Lloc Web
• Comprar productes per a ús personal
• Visualitzar contingut

**9.3 Prohibicions**
Queda prohibit:
• Reproduir, distribuir o modificar contingut sense autorització
• Utilitzar dissenys per a fins comercials sense llicència
• Fer enginyeria inversa del Lloc Web
• Extreure dades de forma automatitzada (scraping)`
    },
    {
      title: '10. Protecció de Dades',
      content: `El tractament de les dades personals es regeix per la nostra Política de Privacitat, que forma part integrant d'aquestes Condicions Generals.

En utilitzar aquest Lloc Web i realitzar comandes, accepteu el tractament de les dades segons s'especifica a la Política de Privacitat, en compliment amb el RGPD i la LOPDGDD.

Per exercir els drets (accés, rectificació, supressió, etc.), contacteu-nos a higginsgrafic@gmail.com`
    },
    {
      title: '11. Responsabilitat',
      content: `**11.1 Limitació de Responsabilitat**
GRÀFIC no serà responsable de:
• Interrupcions o errors del Lloc Web per causes tècniques
• Danys derivats de virus o malware
• Ús inadequat dels productes
• Casos de força major

**11.2 Disponibilitat del Lloc Web**
Ens esforcem per mantenir el Lloc Web disponible 24/7, però no garantim que estigui lliure d'errors o interrupcions. Ens reservem el dret de suspendre o modificar el servei per manteniment.

**11.3 Enllaços Externs**
El Lloc Web pot contenir enllaços a llocs web de tercers. No som responsables del contingut o polítiques de privacitat d'aquests llocs.`
    },
    {
      title: '12. Resolució de Conflictes',
      content: `**12.1 Llei Aplicable**
Aquestes Condicions Generals es regeixen per la legislació espanyola.

**12.2 Resolució Extrajudicial**
Com a consumidor, pots accedir a la plataforma europea de resolució de litigis en línia: https://ec.europa.eu/consumers/odr

**12.3 Jurisdicció**
Per qualsevol controvèrsia derivada d'aquestes Condicions, les parts se sotmeten als jutjats i tribunals que corresponguin segons la legislació de protecció dels consumidors.`
    },
    {
      title: '13. Disposicions Generals',
      content: `**13.1 Idioma**
Aquestes Condicions Generals estan redactades en català. En cas de traducció a altres idiomes, prevaldrà la versió en català.

**13.2 Nul·litat Parcial**
Si alguna clàusula d'aquestes Condicions fos declarada nul·la o no aplicable, la resta de clàusules continuaran vigents.

**13.3 Renúncia**
La manca d'exigència del compliment d'alguna clàusula no constitueix una renúncia als nostres drets.

**13.4 Comunicacions**
Totes les comunicacions relacionades amb comandes s'enviaran per email a l'adreça proporcionada durant el procés de compra.`
    },
    {
      title: '14. Contacte',
      content: `Per qualsevol qüestió relacionada amb aquestes Condicions Generals o amb les comandes, podeu contactar-nos:

**Email:** higginsgrafic@gmail.com
**Telèfon:** [Número de telèfon]
**Horari d'atenció:** Dilluns a Divendres, 9:00h - 18:00h (CET)

Ens comprometem a respondre les consultes en un màxim de 48 hores laborables.`
    }
  ];

  return (
    <>
      <SEO
        title="Termes i Condicions | GRÀFIC"
        description="Termes i condicions de compra de GRÀFIC. Informació sobre pagaments, enviaments, devolucions i garantia legal. Condicions generals de venda."
        keywords="termes condicions gràfic, condicions compra, garantia legal, devolucions"
        type="website"
        url="/terms"
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gray-900 text-white pt-[129px] lg:pt-[145px] pb-16 lg:pb-24">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-oswald text-[36pt] lg:text-[48pt] font-bold uppercase mb-4">
                Termes i Condicions
              </h1>
              <p className="font-roboto text-[14pt] text-gray-300">
                Condicions Generals de Venda | Última actualització: 4 de desembre de 2024
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none"
          >
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-12">
              <p className="font-roboto text-[13pt] text-gray-800 leading-relaxed m-0">
                Si us plau, llegiu atentament aquestes Condicions Generals abans de realitzar una comanda.
                En utilitzar el nostre lloc web i adquirir els nostres productes, accepteu quedar vinculat
                per aquestes condicions. Aquests termes estan dissenyats per protegir tant els teus drets
                com a consumidor com els nostres com a empresa, en compliment amb la legislació espanyola i europea.
              </p>
            </div>

            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="mb-12"
              >
                <h2 className="font-oswald text-[24pt] font-bold mb-4" style={{ color: '#141414' }}>
                  {section.title}
                </h2>
                <div className="font-roboto text-[13pt] text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </motion.div>
            ))}

            {/* Footer Note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-12">
              <p className="font-roboto text-[12pt] text-gray-600 leading-relaxed m-0">
                <strong>Nota important:</strong> Aquests Termes i Condicions constitueixen un acord legal vinculant
                entre vós i GRÀFIC. Si teniu qualsevol dubte sobre aquestes condicions, si us plau contacteu-nos
                abans de realitzar una comanda. La satisfacció i confiança són la nostra prioritat.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default TermsPage;
