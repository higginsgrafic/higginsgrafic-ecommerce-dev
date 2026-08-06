import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { MoreHorizontal, Loader2, Truck, AlertCircle, X, Package } from 'lucide-react';

const STATUS_COLOR = {
  'PENDENT': '#9CA3AF',
  'EN PREPARACIÓ': '#7C3AED',
  'EN REPARTIMENT': '#D97706',
  'ATURADA': '#EAB308',
  'CANCEL·LADA': '#991B1B',
  'ENTREGADA': '#16A34A',
};

const STATUS_ICON = {
  'PENDENT': MoreHorizontal,
  'EN PREPARACIÓ': Loader2,
  'EN REPARTIMENT': Truck,
  'ATURADA': AlertCircle,
  'CANCEL·LADA': X,
  'ENTREGADA': Package,
};

const LEGEND = ['PENDENT', 'EN PREPARACIÓ', 'EN REPARTIMENT', 'ATURADA', 'CANCEL·LADA', 'ENTREGADA'];

const COL_TEMPLATE = '2.2fr 1fr 1.3fr 1.3fr 0.9fr';

const TEXT = { fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 300, fontSize: '9pt', color: '#475059' };
const HEAD = { fontFamily: 'Oswald, sans-serif', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2F3540' };

const IMG_W = 1024;
const IMG_H = 270;
const IMG_RATIO = IMG_H / IMG_W;

function TransparentInput({ placeholder, defaultValue, style }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      style={{
        ...TEXT,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '0 8px',
        border: 'none',
        borderRadius: 0,
        outline: 'none',
        background: 'transparent',
        ...style,
      }}
    />
  );
}

export default function MegaslidePagina4({
  orders,
  adminEmail,
  touchMegaPublicActivity,
}) {
  const { user, authReady } = useAuth();
  const { profile, orders: profileOrders, addresses } = useProfile();

  const displayOrders = (profileOrders && profileOrders.length > 0) ? profileOrders : (orders && orders.length > 0 ? orders : []);
  const defaultAddress = (addresses && addresses[0]) || {};

  return (
    <div style={{ width: '25%', flexShrink: 0, display: 'flex', height: '100%', position: 'relative', justifyContent: 'center' }}>
      <div style={{ flex: '1 1 auto' }} />

      <div style={{
        flex: '0 0 auto',
        width: 'var(--hg-mega-w, min(1350px, calc(100vw - 32px)))',
        maxWidth: 'none',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '0px',
        paddingRight: '0px',
      }}>
        <div style={{
          transform: 'scale(0.94)',
          transformOrigin: 'top center',
          width: '100%',
          height: '100%',
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* Container with background image — fills full area, preserves aspect ratio */}
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            backgroundImage: 'url("/placeholders/fons_pagina_4/pagina-4-fons.png")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top left',
            backgroundSize: '100% 100%',
          }}>
            {/* Form overlay — absolute on top of background image */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
            }}>
              {/* COLUMNA 1: COMANDES */}
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 10px 10px', overflow: 'hidden' }}>
                {/* Title */}
                <div style={{
                  ...HEAD,
                  fontSize: '11pt',
                  textAlign: 'center',
                  padding: '6px 0',
                  flexShrink: 0,
                }}>
                  Comandes
                </div>
                {/* Table */}
                <table style={{
                  width: 'calc(100% + 14px)',
                  marginLeft: '-9px',
                  marginTop: '2px',
                  marginBottom: '4px',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  flex: 1,
                  border: 'none',
                }}>
                  <colgroup>
                    <col style={{ width: '30.7%' }} />
                    <col style={{ width: '7.8%' }} />
                    <col style={{ width: '29.5%' }} />
                    <col style={{ width: '9.75%' }} />
                    <col style={{ width: '7.95%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {['Nombre de comanda', 'Estat', 'Nombre de seguiment', 'Data', 'Preu'].map((h, i) => (
                        <th key={h} style={{
                          ...HEAD,
                          fontSize: '7pt',
                          fontWeight: 400,
                          textAlign: 'center',
                          paddingBottom: '6px',
                          whiteSpace: 'nowrap',
                          border: 'none',
                          padding: '4px',
                          paddingRight: '4px',
                          height: '30px',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayOrders.length > 0 ? displayOrders.slice(0, 8).map((o, idx) => {
                      const status = o.status || o.raw?.status || 'PENDENT';
                      const Icon = STATUS_ICON[status] || MoreHorizontal;
                      const color = STATUS_COLOR[status] || '#9CA3AF';
                      return (
                        <tr key={o.num || idx}>
                          <td style={{ ...TEXT, fontSize: '7pt', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '4px', textAlign: 'left', border: 'none' }}>{o.num}</td>
                          <td style={{ padding: '4px', textAlign: 'center', border: 'none' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <Icon size={9} color={color} strokeWidth={2} />
                              <span style={{ ...TEXT, fontSize: '6pt', color, fontWeight: 300 }}>{status}</span>
                            </div>
                          </td>
                          <td style={{ ...TEXT, fontSize: '7pt', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '4px', textAlign: 'right', border: 'none' }}>{o.tracking_number || o.raw?.tracking_number || '—'}</td>
                          <td style={{ ...TEXT, fontSize: '7pt', padding: '4px', textAlign: 'right', border: 'none' }}>{o.date}</td>
                          <td style={{ ...TEXT, fontSize: '7pt', padding: '4px', textAlign: 'right', border: 'none' }}>{o.total || '—'}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={5} style={{ ...TEXT, fontSize: '8pt', opacity: 0.4, padding: '16px 0', textAlign: 'center', border: 'none' }}>Encara no s'ha fet cap comanda</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* Legend */}
                <div style={{
                  flexShrink: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px 12px',
                  alignItems: 'center',
                  paddingTop: '12px',
                }}>
                  {LEGEND.map((label) => {
                    const Icon = STATUS_ICON[label];
                    const color = STATUS_COLOR[label];
                    return (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon size={11} color={color} strokeWidth={2} />
                        <span style={{ ...HEAD, fontSize: '6pt', color: '#475059' }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COLUMNA 2: MISSATGES */}
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 10px 10px', overflow: 'hidden' }}>
                {/* Title */}
                <div style={{
                  ...HEAD,
                  fontSize: '11pt',
                  textAlign: 'center',
                  padding: '6px 0',
                  flexShrink: 0,
                }}>
                  Missatges
                </div>
                {/* Form table */}
                <table style={{
                  width: '100%',
                  marginTop: '1px',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  flex: 1,
                  border: 'none',
                }}>
                  <tbody>
                    {/* Row 1: Nom + eCorreu */}
                    <tr>
                      <td style={{ width: '50%', padding: '4px', border: 'none' }}>
                        <TransparentInput placeholder="Nom" defaultValue={profile?.full_name || ''} />
                      </td>
                      <td style={{ width: '50%', padding: '4px', border: 'none' }}>
                        <TransparentInput placeholder="eCorreu" defaultValue={user?.email || ''} />
                      </td>
                    </tr>
                    {/* Row 2: Assumpte */}
                    <tr>
                      <td colSpan={2} style={{ padding: '4px', border: 'none' }}>
                        <TransparentInput placeholder="Assumpte" />
                      </td>
                    </tr>
                    {/* Row 3: Missatge */}
                    <tr>
                      <td colSpan={2} style={{ padding: '0 4px', border: 'none', height: '100%', verticalAlign: 'top' }}>
                        <textarea
                          placeholder="Missatge"
                          style={{
                            ...TEXT,
                            width: '100%',
                            height: '100%',
                            boxSizing: 'border-box',
                            padding: '4px 8px',
                            border: 'none',
                            borderRadius: 0,
                            outline: 'none',
                            resize: 'none',
                            background: 'transparent',
                            fontSize: '8pt',
                            textAlign: 'left',
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', height: '9%', flexShrink: 0, position: 'relative', top: '7px' }}>
                  {['Adjunta', "Cancel·la", 'Envia'].map((label, i) => (
                    <button key={label} style={{
                      ...HEAD,
                      fontSize: '7pt',
                      color: i === 2 ? '#FFFFFF' : '#475059',
                      backgroundColor: i === 2 ? '#2F3540' : 'rgba(244,246,248,0.7)',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      padding: 0,
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* COLUMNA 3: COMPTE */}
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 10px 10px', overflow: 'hidden' }}>
                {/* Title */}
                <div style={{
                  ...HEAD,
                  fontSize: '11pt',
                  textAlign: 'center',
                  padding: '6px 0',
                  flexShrink: 0,
                }}>
                  Compte
                </div>
                {authReady && !user ? (
                  <div style={{ ...TEXT, fontSize: '8pt', opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>
                    Inicia sessió per veure les teves dades
                  </div>
                ) : (
                  <div style={{ flex: '0.390', marginTop: '9px' }}>
                  <table style={{
                    width: 'calc(100% + 11px)',
                    marginLeft: '-2px',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                    border: 'none',
                  }}>
                    <thead>
                      <tr>
                        <th style={{ ...HEAD, fontSize: '7pt', textAlign: 'center', padding: '4px', border: 'none' }}>Dades de contacte</th>
                        <th style={{ ...HEAD, fontSize: '7pt', textAlign: 'center', padding: '4px', border: 'none' }}>Dades d'enviament</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Nom" defaultValue={profile?.full_name || ''} /></td>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Carrer" defaultValue={defaultAddress.street || ''} /></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="eCorreu" defaultValue={user?.email || ''} /></td>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Pis" defaultValue={defaultAddress.floor_door || ''} /></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Telèfon" defaultValue={profile?.phone || ''} /></td>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Ciutat" defaultValue={defaultAddress.city || ''} /></td>
                      </tr>
                      <tr>
                        <td style={{ border: 'none', paddingBottom: '2.5px' }} />
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="CP" defaultValue={defaultAddress.postal_code || ''} /></td>
                      </tr>
                      <tr>
                        <td style={{ border: 'none', paddingBottom: '2.5px' }} />
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Província" defaultValue={defaultAddress.province || ''} /></td>
                      </tr>
                      <tr>
                        <td style={{ border: 'none' }} />
                        <td style={{ padding: '2px 4px', border: 'none' }}><TransparentInput placeholder="País" defaultValue={defaultAddress.country || ''} /></td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                )}
                <div style={{ flex: 1 }} />
                {/* Desa button — same size and Y position as bloc 2 buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', height: '9%', flexShrink: 0, position: 'relative', top: '7px', marginRight: '-9px' }}>
                  <div />
                  <div />
                  <button style={{
                    ...HEAD,
                    fontSize: '7pt',
                    color: '#FFFFFF',
                    backgroundColor: '#2F3540',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    padding: 0,
                    height: '100%',
                  }}>
                    Desa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: '1 1 auto' }} />
    </div>
  );
}
