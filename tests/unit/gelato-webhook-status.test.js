import { describe, it, expect, vi, beforeEach } from 'vitest';

// Comportament del webhook de Gelato pel que fa a l'estat de la comanda i al
// correu d'enviament.
//
// Dues coses que van estar malament i que aquest test fixa:
//
//  1. Gelato envia l'estat de la comanda de DUES maneres: `order_status_updated`
//     (camp `fulfillmentStatus`) i `order_item_status_updated` (camp `status`).
//     Només es gestionava la primera, així que els avisos reals del panell de
//     Gelato s'ignoraven i l'estat no s'actualitzava mai.
//
//  2. El correu d'enviament s'enviava només mirant l'estat, de manera que podia
//     sortir un correu dient "la teva comanda s'ha enviat" SENSE número de
//     seguiment. Ara calen les dues coses, arribin en l'ordre que arribin.

const SECRET = 'secret-de-prova';

let ordre = null;
let actualitzacions = [];
let correus = [];

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: (camp, valor) => ({
          maybeSingle: async () => {
            if (!ordre || ordre[camp] !== valor) {
              return { data: null, error: { message: 'no trobat' } };
            }
            return { data: { ...ordre }, error: null };
          },
        }),
      }),
      update: (canvis) => ({
        eq: async () => {
          actualitzacions.push({ ...canvis });
          Object.assign(ordre, canvis);
          return { error: null };
        },
      }),
    }),
  }),
}));

vi.mock('../../netlify/lib/email.js', () => ({
  sendOrderEmail: async (clau, dades) => {
    correus.push({ clau, dades });
    return { id: 'correu-de-prova' };
  },
}));

vi.stubEnv('GELATO_WEBHOOK_SECRET', SECRET);
vi.stubEnv('SUPABASE_URL', 'https://exemple.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'clau-de-prova');

const { handler } = await import('../../netlify/functions/gelato-webhook.js');

function avis(cos) {
  return {
    httpMethod: 'POST',
    headers: { authorization: SECRET },
    body: JSON.stringify(cos),
  };
}

beforeEach(() => {
  ordre = {
    id: 'oid-1',
    order_number: '#0001',
    status: 'en_preparacio',
    tracking_number: null,
    tracking_url: null,
    email: 'client@example.com',
  };
  actualitzacions = [];
  correus = [];
});

describe('gelato-webhook — estat de la comanda', () => {
  describe('order_item_status_updated (article a article)', () => {
    it('"passed" deixa la comanda en preparació', async () => {
      const resposta = await handler(
        avis({
          event: 'order_item_status_updated',
          orderReferenceId: '#0001',
          status: 'passed',
        })
      );

      expect(resposta.statusCode).toBe(200);
      expect(actualitzacions).toEqual([{ status: 'en_preparacio' }]);
    });

    it('"shipped" marca la comanda com a enviada', async () => {
      await handler(
        avis({ event: 'order_item_status_updated', orderReferenceId: '#0001', status: 'shipped' })
      );

      expect(actualitzacions).toEqual([{ status: 'seguiment' }]);
    });

    it('"delivered" marca la comanda com a entregada', async () => {
      await handler(
        avis({ event: 'order_item_status_updated', orderReferenceId: '#0001', status: 'delivered' })
      );

      expect(actualitzacions).toEqual([{ status: 'entregada' }]);
    });

    it('"canceled" marca la comanda com a cancel·lada', async () => {
      await handler(
        avis({ event: 'order_item_status_updated', orderReferenceId: '#0001', status: 'canceled' })
      );

      expect(actualitzacions).toEqual([{ status: 'cancel_lada' }]);
    });

    it('un estat desconegut no toca la comanda', async () => {
      const resposta = await handler(
        avis({ event: 'order_item_status_updated', orderReferenceId: '#0001', status: 'inventat' })
      );

      expect(actualitzacions).toEqual([]);
      expect(resposta.body).toContain('ignored');
    });
  });

  describe('order_status_updated (tota la comanda)', () => {
    it('segueix funcionant amb el camp fulfillmentStatus', async () => {
      await handler(
        avis({ event: 'order_status_updated', orderReferenceId: '#0001', fulfillmentStatus: 'shipped' })
      );

      expect(actualitzacions).toEqual([{ status: 'seguiment' }]);
    });

    it('no fa retrocedir una comanda ja entregada', async () => {
      ordre.status = 'entregada';

      await handler(
        avis({ event: 'order_status_updated', orderReferenceId: '#0001', fulfillmentStatus: 'shipped' })
      );

      expect(actualitzacions).toEqual([]);
    });

    it('no fa retrocedir una comanda cancel·lada', async () => {
      ordre.status = 'cancel_lada';

      await handler(
        avis({ event: 'order_status_updated', orderReferenceId: '#0001', fulfillmentStatus: 'in_production' })
      );

      expect(actualitzacions).toEqual([]);
    });
  });

  describe('número de seguiment', () => {
    it("es desa encara que la comanda encara no consti com a enviada, i no s'envia cap correu", async () => {
      await handler(
        avis({
          event: 'order_item_tracking_code_updated',
          orderReferenceId: '#0001',
          trackingCode: 'PQ123',
          trackingUrl: 'https://exemple.test/PQ123',
          shipmentMethodName: 'Correos',
        })
      );

      expect(actualitzacions).toEqual([
        { tracking_number: 'PQ123', tracking_url: 'https://exemple.test/PQ123', tracking_carrier: 'Correos' },
      ]);
      expect(correus).toEqual([]);
    });

    it('desa TOTS els números si Gelato divideix la comanda en dos paquets', async () => {
      // Exemple real del panell de Gelato: un avís d'estat amb dos enviaments.
      await handler(
        avis({
          event: 'order_status_updated',
          orderReferenceId: '#0001',
          fulfillmentStatus: 'shipped',
          items: [
            {
              itemReferenceId: 'item-1',
              fulfillmentStatus: 'shipped',
              fulfillments: [
                { trackingCode: 'code123', trackingUrl: 'https://exemple.test/1', shipmentMethodName: 'DHL' },
                { trackingCode: 'code234', trackingUrl: 'https://exemple.test/2', shipmentMethodName: 'DHL' },
              ],
            },
          ],
        })
      );

      expect(actualitzacions[0].tracking_number).toBe('code123 · code234');
      expect(actualitzacions[0].tracking_url).toBe('https://exemple.test/1');
    });

    it('acumula el número d\'un segon paquet que arriba en un avís posterior', async () => {
      ordre.tracking_number = 'code123';
      ordre.tracking_url = 'https://exemple.test/1';

      await handler(
        avis({
          event: 'order_item_tracking_code_updated',
          orderReferenceId: '#0001',
          trackingCode: 'code234',
          trackingUrl: 'https://exemple.test/2',
        })
      );

      expect(actualitzacions[0].tracking_number).toBe('code123 · code234');
    });

    it('no repeteix un número que ja teníem', async () => {
      ordre.tracking_number = 'code123';

      const resposta = await handler(
        avis({
          event: 'order_item_tracking_code_updated',
          orderReferenceId: '#0001',
          trackingCode: 'code123',
        })
      );

      // Ja el teníem i no hi ha res més a canviar: no es toca la comanda.
      expect(actualitzacions).toEqual([]);
      expect(resposta.statusCode).toBe(200);
    });
  });

  describe("correu d'enviament", () => {
    it("s'envia quan arriba l'estat d'enviament I ja teníem el número", async () => {
      ordre.tracking_number = 'PQ123';

      await handler(
        avis({ event: 'order_item_status_updated', orderReferenceId: '#0001', status: 'shipped' })
      );

      expect(correus).toHaveLength(1);
      expect(correus[0].clau).toBe('order_shipped');
      expect(correus[0].dades.tracking_number).toBe('PQ123');
    });

    it("s'envia quan arriba el número I la comanda ja constava com a enviada", async () => {
      ordre.status = 'seguiment';

      await handler(
        avis({
          event: 'order_item_tracking_code_updated',
          orderReferenceId: '#0001',
          trackingCode: 'PQ999',
        })
      );

      expect(actualitzacions).toHaveLength(1);
      expect(correus).toHaveLength(1);
      expect(correus[0].dades.tracking_number).toBe('PQ999');
    });

    it("NO s'envia si encara no hi ha número de seguiment", async () => {
      await handler(
        avis({ event: 'order_item_status_updated', orderReferenceId: '#0001', status: 'shipped' })
      );

      expect(correus).toEqual([]);
    });

    it("no s'envia dues vegades si ja s'havia enviat", async () => {
      ordre.status = 'seguiment';
      ordre.tracking_number = 'PQ123';

      await handler(
        avis({
          event: 'order_item_tracking_code_updated',
          orderReferenceId: '#0001',
          trackingCode: 'PQ123',
        })
      );

      expect(correus).toEqual([]);
    });

    it("no s'envia quan la comanda es marca com a entregada", async () => {
      ordre.tracking_number = 'PQ123';

      await handler(
        avis({ event: 'order_item_status_updated', orderReferenceId: '#0001', status: 'delivered' })
      );

      expect(correus).toEqual([]);
    });
  });

  it('una comanda desconeguda respon 200 (perquè Gelato no reintenti per sempre)', async () => {
    ordre = null;

    const resposta = await handler(
      avis({ event: 'order_item_status_updated', orderReferenceId: '#9999', status: 'shipped' })
    );

    expect(resposta.statusCode).toBe(200);
    expect(resposta.body).toContain('not_found');
    expect(actualitzacions).toEqual([]);
  });

  it('les comandes es poden trobar pel número de Gelato si no quadra la referència', async () => {
    ordre = {
      id: 'oid-2',
      order_number: '#0002',
      gelato_order_id: 'e82885f8-f92a-4326-b2c7-77d010f6996f',
      status: 'en_preparacio',
    };

    const resposta = await handler(
      avis({
        event: 'order_item_status_updated',
        orderReferenceId: '#0002',
        orderId: 'e82885f8-f92a-4326-b2c7-77d010f6996f',
        status: 'passed',
      })
    );

    expect(resposta.statusCode).toBe(200);
    expect(actualitzacions).toEqual([{ status: 'en_preparacio' }]);
  });
});
