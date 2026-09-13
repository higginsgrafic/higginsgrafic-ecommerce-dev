/**
 * Adreça pública de la botiga.
 *
 * PER QUÈ CAL
 *
 * Els correus i els enllaços de seguiment no tenen "pàgina actual": si hi va
 * una ruta relativa (/track, /reset-password, /emails/assets/logo.png), el
 * client de correu no la pot resoldre. Cal l'adreça sencera, i per tant cal
 * saber en quin domini viu la botiga.
 *
 * IMPORTANT: no hi posis cap domini escrit a mà. La botiga es prova a
 * dev.higginsgrafic.com i el dia de la publicació viurà a higginsgrafic.com.
 * Si el domini final estigués fixat al codi, durant les proves els correus
 * enviarien la gent a un lloc que encara no està actualitzat.
 *
 * Ordre de preferència:
 *   1. SITE_URL / VITE_SITE_ORIGIN — per fixar-ho a mà si mai cal
 *   2. URL / DEPLOY_PRIME_URL      — les posa Netlify tot sol, i s'actualitzen
 *                                    soles quan canvia el domini principal
 *   3. dev.higginsgrafic.com       — últim recurs (lloc de proves)
 */
export function getSiteBase() {
  const candidats = [
    process.env.SITE_URL,
    process.env.VITE_SITE_ORIGIN,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
  ];

  for (const candidat of candidats) {
    const valor = (candidat || '').toString().trim();
    if (valor.startsWith('http')) return valor.replace(/\/$/, '');
  }

  return 'https://dev.higginsgrafic.com';
}
