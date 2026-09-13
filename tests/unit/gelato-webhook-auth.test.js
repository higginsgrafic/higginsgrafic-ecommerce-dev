import { describe, it, expect, vi, afterEach } from 'vitest';

// El webhook de Gelato és una adreça PÚBLICA: qualsevol la pot cridar.
//
// Va estar mal protegida: si no hi havia secret configurat, s'acceptava
// qualsevol avís. Com que els números de comanda són curts i endevinables,
// qualsevol podia enviar un avís fals i fer que un client rebés un correu
// autèntic de la botiga dient que la comanda s'ha enviat, amb un enllaç de
// seguiment inventat per l'atacant.
//
// Aquest test fixa el comportament correcte: sense secret configurat es
// REBUTJA tot, i amb secret configurat només passen els avisos que el porten.

const SECRET = 'secret-de-prova-1234567890';

async function carregaHandler(secret) {
  vi.resetModules();
  if (secret === null) delete process.env.GELATO_WEBHOOK_SECRET;
  else process.env.GELATO_WEBHOOK_SECRET = secret;
  process.env.SUPABASE_URL = 'https://exemple.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'clau-de-prova';

  const mod = await import('../../netlify/functions/gelato-webhook.js');
  return mod.handler;
}

function esdeveniment({ headers = {}, query = null, body = {} } = {}) {
  return {
    httpMethod: 'POST',
    headers,
    queryStringParameters: query,
    body: JSON.stringify(body),
  };
}

// Un cos sense referència de comanda: si l'autenticació passa, la funció
// respon 400 ("Falta la referència"). Així podem distingir "autenticat" (400)
// de "rebutjat" (401) sense tocar la base de dades ni enviar cap correu.
const COS_SENSE_REFERENCIA = { event: 'order_status_updated' };

afterEach(() => {
  delete process.env.GELATO_WEBHOOK_SECRET;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
});

describe('gelato-webhook — autenticació', () => {
  it('sense GELATO_WEBHOOK_SECRET rebutja tots els avisos (500)', async () => {
    const handler = await carregaHandler(null);

    const resposta = await handler(esdeveniment({ body: { orderReferenceId: '#1', event: 'order_status_updated' } }));
    expect(resposta.statusCode).toBe(500);

    // Ni tan sols amb un secret inventat a la capçalera no passa
    const ambCapçalera = await handler(esdeveniment({ headers: { authorization: SECRET }, body: { orderReferenceId: '#1' } }));
    expect(ambCapçalera.statusCode).toBe(500);
  });

  it('amb secret configurat, un avís sense credencial és rebutjat (401)', async () => {
    const handler = await carregaHandler(SECRET);
    const resposta = await handler(esdeveniment({ body: COS_SENSE_REFERENCIA }));
    expect(resposta.statusCode).toBe(401);
  });

  it('amb secret configurat, una credencial equivocada és rebutjada (401)', async () => {
    const handler = await carregaHandler(SECRET);

    const dolenta = await handler(esdeveniment({ headers: { authorization: 'secret-dolent' }, body: COS_SENSE_REFERENCIA }));
    expect(dolenta.statusCode).toBe(401);

    // Mateixa longitud que el secret real, per comprovar que no passa per casualitat
    const mateixaLongitud = await handler(
      esdeveniment({ headers: { 'x-gelato-secret': 'X'.repeat(SECRET.length) }, body: COS_SENSE_REFERENCIA })
    );
    expect(mateixaLongitud.statusCode).toBe(401);
  });

  it('accepta el secret per la capçalera Authorization', async () => {
    const handler = await carregaHandler(SECRET);
    const resposta = await handler(esdeveniment({ headers: { authorization: SECRET }, body: COS_SENSE_REFERENCIA }));
    expect(resposta.statusCode).toBe(400);
  });

  it('accepta el secret amb el prefix "Bearer"', async () => {
    const handler = await carregaHandler(SECRET);
    const resposta = await handler(esdeveniment({ headers: { authorization: `Bearer ${SECRET}` }, body: COS_SENSE_REFERENCIA }));
    expect(resposta.statusCode).toBe(400);
  });

  it('accepta el secret per la capçalera x-gelato-secret', async () => {
    const handler = await carregaHandler(SECRET);
    const resposta = await handler(esdeveniment({ headers: { 'x-gelato-secret': SECRET }, body: COS_SENSE_REFERENCIA }));
    expect(resposta.statusCode).toBe(400);
  });

  it('accepta el secret pel paràmetre ?secret=', async () => {
    const handler = await carregaHandler(SECRET);
    const resposta = await handler(esdeveniment({ query: { secret: SECRET }, body: COS_SENSE_REFERENCIA }));
    expect(resposta.statusCode).toBe(400);
  });

  it('només accepta POST', async () => {
    const handler = await carregaHandler(SECRET);
    const resposta = await handler({ httpMethod: 'GET', headers: {}, body: null });
    expect(resposta.statusCode).toBe(405);
  });
});
