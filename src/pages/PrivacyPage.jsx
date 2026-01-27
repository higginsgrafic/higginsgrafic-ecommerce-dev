import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: '1. Informació que Recopilem',
      content: `Recopilem informació que ens proporciones directament quan:

• Crees un compte o realitzes una comanda
• Et subscrius al nostre butlletí
• Contactes amb el nostre servei d'atenció al client
• Participes en enquestes o promocions
• Interactues amb les nostres xarxes socials

La informació pot incloure: nom, adreça de correu electrònic, adreça postal, número de telèfon, informació de pagament i preferències de compra.`
    },
    {
      title: '2. Com Utilitzem la Teva Informació',
      content: `Utilitzem la informació per:

• Processar i complir les comandes
• Comunicar-nos sobre les comandes i el nostre servei
• Personalitzar l'experiència de compra
• Millorar els nostres productes i serveis
• Enviar comunicacions de màrqueting (si s'ha donat el consentiment)
• Detectar i prevenir fraus
• Complir amb les nostres obligacions legals`
    },
    {
      title: '3. Compartició de la Teva Informació',
      content: `Podem compartir la informació amb:

• **Proveïdors de serveis:** Empreses que ens ajuden a operar el nostre negoci (processament de pagaments, enviament, allotjament web)
• **Gelato:** El nostre soci de producció i enviament per a la fabricació i enviament dels productes
• **Serveis d'anàlisi:** Google Analytics per entendre com s'utilitza el nostre lloc web
• **Autoritats legals:** Quan sigui requerit per llei o per protegir els nostres drets

No venem ni lloguem informació personal a tercers per a fins de màrqueting.`
    },
    {
      title: '4. Cookies i Tecnologies Similars',
      content: `Utilitzem cookies i tecnologies similars per:

• Recordar les preferències i configuració
• Entendre com s'utilitza el nostre lloc web
• Personalitzar el contingut i els anuncis
• Millorar el rendiment del lloc web

Podeu gestionar les preferències de cookies a través de la configuració del navegador. Tingueu en compte que deshabilitar certes cookies pot afectar la funcionalitat del lloc web.`
    },
    {
      title: '5. Seguretat de les Dades',
      content: `Prenem seriosament la seguretat de les dades i implementem mesures tècniques i organitzatives adequades per protegir la informació personal contra:

• Accés no autoritzat
• Alteració
• Divulgació
• Destrucció

Utilitzem xifratge SSL per protegir la informació sensible durant la transmissió. Tot i això, cap mètode de transmissió per Internet o emmagatzematge electrònic és 100% segur.`
    },
    {
      title: '6. Els Teus Drets (RGPD)',
      content: `Segons el Reglament General de Protecció de Dades (RGPD), teniu dret a:

• **Accés:** Demanar una còpia de les dades personals
• **Rectificació:** Corregir dades inexactes o incompletes
• **Supressió:** Sol·licitar l'eliminació de les dades ("dret a l'oblit")
• **Restricció:** Limitar el tractament de les dades
• **Portabilitat:** Rebre les dades en un format estructurat
• **Oposició:** Oposar-vos al tractament de les dades
• **No ser objecte de decisions automatitzades**

Per exercir aquests drets, contacteu-nos a higginsgrafic@gmail.com`
    },
    {
      title: '7. Retenció de Dades',
      content: `Conservem la informació personal durant el temps necessari per complir amb els fins descrits en aquesta política, tret que la llei requereixi o permeti un període de retenció més llarg.

Criteris de retenció:
• Dades de comandes: 10 anys (obligació fiscal)
• Dades de compte: Mentre el compte estigui actiu
• Dades de màrqueting: Fins que retires el consentiment
• Dades de cookies: Segons la configuració del navegador`
    },
    {
      title: '8. Transferències Internacionals',
      content: `Les dades poden ser transferides i processades fora de l'Espai Econòmic Europeu (EEE), incloent:

• Servidors de Netlify (Estats Units)
• Sistemes de Gelato (global)
• Stripe per processament de pagaments

En aquests casos, ens assegurem que es prenguin mesures adequades per protegir les dades d'acord amb el RGPD, com ara clàusules contractuals estàndard aprovades per la Comissió Europea.`
    },
    {
      title: '9. Menors d\'Edat',
      content: `Els nostres serveis no estan dirigits a menors de 16 anys. No recopilem conscientment informació personal de menors de 16 anys. Si sou pare/mare o tutor i creieu que el vostre fill/a ens ha proporcionat informació personal, contacteu-nos immediatament.`
    },
    {
      title: '10. Canvis a Aquesta Política',
      content: `Podem actualitzar aquesta Política de Privacitat ocasionalment per reflectir canvis en les nostres pràctiques o per raons legals, operatives o reguladores.

Informarem de qualsevol canvi significatiu publicant la nova política en aquesta pàgina i actualitzant la data de "Última actualització" a la part superior.

Recomanem revisar aquesta política periòdicament per estar informat sobre com protegim la informació.`
    },
    {
      title: '11. Contacte',
      content: `Si teniu preguntes o preocupacions sobre aquesta Política de Privacitat o sobre com gestionem les dades personals, podeu contactar-nos:

**Email:** higginsgrafic@gmail.com
**Correu postal:** GRÀFIC, [Adreça completa]
**Telèfon:** [Número de telèfon]

També teniu dret a presentar una reclamació davant l'Agència Espanyola de Protecció de Dades (AEPD) si considereu que el tractament de les dades personals vulnera la normativa aplicable.

**AEPD:** www.aepd.es`
    }
  ];

  return (
    <>
      <SEO
        title="Política de Privacitat | GRÀFIC"
        description="Política de privacitat de GRÀFIC. Informació sobre com recopilem, utilitzem i protegim les dades personals segons el RGPD i LOPDGDD."
        keywords="política privacitat gràfic, rgpd, protecció dades, privacitat"
        type="website"
        url="/privacy"
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
                Política de Privacitat
              </h1>
              <p className="font-roboto text-[14pt] text-gray-300">
                Última actualització: 4 de desembre de 2024
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
                A GRÀFIC, ens comprometem a protegir la privacitat i les dades personals.
                Aquesta Política de Privacitat explica com recopilem, utilitzem, compartim i protegim
                la informació quan utilitzeu el nostre lloc web i serveis, en compliment amb el
                Reglament General de Protecció de Dades (RGPD) de la Unió Europea i la Llei Orgànica
                de Protecció de Dades Personals i garantia dels drets digitals (LOPDGDD) d'Espanya.
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
                <strong>Nota important:</strong> Aquesta Política de Privacitat està subjecta a la legislació espanyola i europea.
                En utilitzar els nostres serveis, accepteu els termes descrits en aquesta política.
                Si no esteu d'acord amb qualsevol part d'aquesta política, si us plau, no utilitzeu el nostre lloc web.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default PrivacyPage;
