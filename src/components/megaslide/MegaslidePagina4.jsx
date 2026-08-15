import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { MoreHorizontal, Loader2, Truck, AlertCircle, X, Package, LogOut, ChevronUp, ChevronDown, PenLine, Check, Circle } from 'lucide-react';
import { MOCK_CLIENT } from '@/lib/mockOrderStore';

const STATUS_COLOR = {
  'PENDENT': '#9CA3AF',
  'PREPARACIÓ': '#7C3AED',
  'REPARTIMENT': '#D97706',
  'ATURADA': '#EAB308',
  'CANCEL·LADA': '#991B1B',
  'ENTREGADA': '#16A34A',
};

const STATUS_ICON = {
  'PENDENT': MoreHorizontal,
  'PREPARACIÓ': Loader2,
  'REPARTIMENT': Truck,
  'ATURADA': AlertCircle,
  'CANCEL·LADA': X,
  'ENTREGADA': Package,
};

const LEGEND = ['PENDENT', 'PREPARACIÓ', 'REPARTIMENT', 'ATURADA', 'CANCEL·LADA', 'ENTREGADA'];

const COL_TEMPLATE = '2.2fr 1fr 1.3fr 1.3fr 0.9fr';

const TEXT = { fontFamily: 'Roboto, sans-serif', fontWeight: 300, fontSize: '9pt', color: '#475059' };
const HEAD = { fontFamily: 'Oswald, sans-serif', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2F3540' };

const PHONE_PREFIXES = [
  '+34', '+39', '+33', '+49', '+353', '+44', '+46', '+45',
  '+351', '+32', '+31', '+43', '+48', '+420', '+36', '+385',
  '+421', '+386', '+359', '+40', '+30', '+358', '+372', '+371',
  '+370', '+352', '+356', '+357', '+376',
  '+47', '+354', '+423', '+41',
  '+1', '+61', '+64', '+55', '+65', '+81',
];

const IMG_W = 1024;
const IMG_H = 270;
const IMG_RATIO = IMG_H / IMG_W;

const TransparentInput = React.forwardRef(function TransparentInput({ placeholder, defaultValue, style, onBlur, error }, ref) {
  return (
    <input
      ref={ref}
      type="text"
      placeholder={placeholder}
      defaultValue={defaultValue}
      onBlur={onBlur}
      style={{
        ...TEXT,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: '0 8px',
        border: error ? '1px solid #e74c3c' : 'none',
        borderRadius: error ? '2px' : 0,
        outline: 'none',
        background: error ? 'rgba(231,76,60,0.05)' : 'transparent',
        ...style,
      }}
    />
  );
});

export default function MegaslidePagina4({
  orders,
  adminEmail,
  touchMegaPublicActivity,
}) {
  const { user, authReady, signOut } = useAuth();
  const { profile, orders: profileOrders, addresses, updateProfile, updateAddress, addAddress } = useProfile();
  const navigate = useNavigate();

  const VISIBLE_ROWS = 9;
  const ROW_HEIGHT = 24;
  const ordersRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const isScrolling = useRef(false);
  const [messagesSlideOpen, setMessagesSlideOpen] = useState(false);
  const [activeMessageTab, setActiveMessageTab] = useState('rebuts');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [missingFields, setMissingFields] = useState([]);
  const fileInputRef = useRef(null);

  const formSlideOpen = messagesSlideOpen;

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const streetRef = useRef(null);
  const streetNumberRef = useRef(null);
  const floorRef = useRef(null);
  const cityRef = useRef(null);
  const cpRef = useRef(null);
  const provinceRef = useRef(null);
  const countryRef = useRef(null);

  const msgNameRef = useRef(null);
  const msgEmailRef = useRef(null);
  const msgSubjectRef = useRef(null);
  const msgBodyRef = useRef(null);

  const handleAttach = () => {
    fileInputRef.current?.click();
  };

  const handleStreetBlur = (e) => {
    const val = e.target.value.trim();
    if (!val) return;
    const match = val.match(/^(.+?)\s+,?\s*(\d+[A-Za-z]?)\s*$/);
    if (match && streetNumberRef.current) {
      e.target.value = match[1].trim();
      streetNumberRef.current.value = match[2];
    }
  };

  const handleCpBlur = async (e) => {
    const cp = e.target.value.trim();
    if (!cp) return;
    try {
      const res = await fetch(`https://postali.app/api/v1/es/cp/${encodeURIComponent(cp)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.municipio && cityRef.current) cityRef.current.value = data.municipio;
      if (data.estado && provinceRef.current) provinceRef.current.value = data.estado;
      if (countryRef.current) countryRef.current.value = 'Espanya';
    } catch (err) {
      console.error('[CP lookup] Error:', err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleCancel = () => {
    setMessagesSlideOpen(false);
    setAttachments([]);
    setSent(false);
  };

  const handleSend = async () => {
    const name = msgNameRef.current?.value || '';
    const email = msgEmailRef.current?.value || '';
    const subject = msgSubjectRef.current?.value || '';
    const message = msgBodyRef.current?.value || '';

    if (!email || !message) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('subject', subject);
      formData.append('message', message);
      attachments.forEach((f, i) => formData.append(`file_${i}`, f));

      const res = await fetch('/.netlify/functions/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (data.ok) {
        setSent(true);
        setAttachments([]);
        if (msgSubjectRef.current) msgSubjectRef.current.value = '';
        if (msgBodyRef.current) msgBodyRef.current.value = '';
        setTimeout(() => setSent(false), 3000);
      }
    } catch (err) {
      console.error('[send-message] Error:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSave = async () => {
    const required = [
      { key: 'full_name', ref: nameRef, label: 'Nom' },
      { key: 'phone', ref: phoneRef, label: 'Mòbil' },
      { key: 'street', ref: streetRef, label: 'Carrer' },
      { key: 'street_number', ref: streetNumberRef, label: 'Nombre' },
      { key: 'city', ref: cityRef, label: 'Ciutat' },
      { key: 'postal_code', ref: cpRef, label: 'CP' },
      { key: 'province', ref: provinceRef, label: 'Província' },
      { key: 'country', ref: countryRef, label: 'País' },
    ];
    const missing = required.filter(f => !f.ref.current?.value?.trim());
    setMissingFields(missing.map(f => f.key));
    if (missing.length > 0) return;

    setSaving(true);
    const profileUpdates = {
      full_name: nameRef.current?.value || '',
      phone: phonePrefixState + (phoneRef.current?.value || ''),
    };
    const addressUpdates = {
      street: streetRef.current?.value || '',
      street_number: streetNumberRef.current?.value || '',
      floor_door: floorRef.current?.value || '',
      city: cityRef.current?.value || '',
      postal_code: cpRef.current?.value || '',
      province: provinceRef.current?.value || '',
      country: countryRef.current?.value || '',
    };
    const profileResult = await updateProfile(profileUpdates);
    let addressResult = null;
    if (defaultAddress?.id) {
      addressResult = await updateAddress(defaultAddress.id, addressUpdates);
    } else {
      addressResult = await addAddress({ ...addressUpdates, is_default: true });
    }
    console.log('[Desa] profileResult:', profileResult, 'addressResult:', addressResult, 'user:', user?.id, 'addressId:', defaultAddress?.id);
    if (!profileResult?.ok) console.error('[Desa] profile error:', profileResult?.error);
    if (!addressResult?.ok) console.error('[Desa] address error:', addressResult?.error);
    setSaving(false);
    setSaved(true);
    setMissingFields([]);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    setMissingFields([]);
    setSaved(false);
    setSaving(false);
    [nameRef, emailRef, phoneRef, streetRef, streetNumberRef, floorRef, cityRef, cpRef, provinceRef, countryRef].forEach(r => {
      if (r.current) r.current.value = '';
    });
  };

  const isLoggedIn = !!user?.id;
  const isDev = import.meta.env.DEV;
  const isTestUser = user?.email === 'client.prova@higginsgrafic.com';
  const useMocks = isDev && isLoggedIn && isTestUser;

  const displayOrders = isLoggedIn ? ((profileOrders && profileOrders.length > 0) ? profileOrders : (useMocks && orders && orders.length > 0 ? orders : [])) : [];
  const maxScroll = Math.max(0, displayOrders.length - VISIBLE_ROWS);

  useEffect(() => {
    const el = ordersRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (isScrolling.current || maxScroll === 0) return;
      isScrolling.current = true;
      setScrollIndex(prev => {
        if (e.deltaY > 0) return Math.min(prev + 1, maxScroll);
        return Math.max(prev - 1, 0);
      });
      setTimeout(() => { isScrolling.current = false; }, 200);
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [maxScroll]);
  const defaultAddress = (addresses && addresses[0]) || (useMocks ? {
    street: MOCK_CLIENT.address,
    floor_door: '2º 1ª',
    city: MOCK_CLIENT.city,
    postal_code: MOCK_CLIENT.postalCode,
    province: 'Barcelona',
    country: MOCK_CLIENT.country,
  } : {});
  const rawStreet = defaultAddress?.street || '';
  const streetNumber = defaultAddress?.street_number || '';
  const streetName = streetNumber ? rawStreet : rawStreet.replace(/\s+\d+[A-Za-z]?\s*$/, '').trim();
  const displayProfile = profile || (useMocks ? {
    full_name: MOCK_CLIENT.fullName,
    phone: '600 123 456',
  } : {});

  const [phonePrefixState, setPhonePrefixState] = useState('+34');

  const rawPhone = displayProfile?.phone || '';
  const phoneMatch = rawPhone.match(/^(\+\d{1,4})(.*)$/);
  const phonePrefix = phoneMatch ? phoneMatch[1] : '+34';
  const phoneNumber = phoneMatch ? phoneMatch[2] : rawPhone;

  useEffect(() => {
    setPhonePrefixState(phonePrefix);
  }, [phonePrefix]);

  const mockMessages = useMocks ? [
    { id: 1, type: 'rebuts', date: '2026-08-10', subject: 'Consulta sobre comanda', status: 'Respost', preview: 'Hola, voldria saber l\'estat de la meva comanda...' },
    { id: 2, type: 'rebuts', date: '2026-08-08', subject: 'Canvi de talla', status: 'Pendent', preview: 'Necessito canviar la talla d\'una samarreta...' },
    { id: 3, type: 'rebuts', date: '2026-08-05', subject: 'Problema amb el pagament', status: 'Respost', preview: 'El pagament no s\'ha processat correctament...' },
    { id: 4, type: 'enviats', date: '2026-08-02', subject: 'Informació sobre enviament', status: 'Respost', preview: 'Quan arribarà la meva comanda?' },
    { id: 5, type: 'enviats', date: '2026-08-01', subject: 'Re: Canvi de talla', status: 'Enviat', preview: 'Ja hem processat el canvi de talla...' },
    { id: 6, type: 'enviats', date: '2026-07-28', subject: 'Esborrany: Consulta disseny', status: 'Esborrany', preview: 'Hola, m\'agradaria saber si...' },
  ] : [];

  const rebutsMessages = mockMessages.filter(m => m.type === 'rebuts');
  const enviatsMessages = mockMessages.filter(m => m.type === 'enviats');

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
            backgroundImage: 'url("/placeholders/tots_els_fons/fons_pagina_4/pagina-4-fons.png")',
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
                {/* Taula — capçalera fixa + body scrollable */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <table style={{
                  width: '100%',
                  marginLeft: '0',
                  marginTop: '2px',
                  borderCollapse: 'collapse',
                  tableLayout: 'fixed',
                  flexShrink: 0,
                  border: 'none',
                }}>
                  <colgroup>
                    <col style={{ width: '34%' }} />
                    <col style={{ width: '7%' }} />
                    <col style={{ width: '32%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '13%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      {['Nombre de comanda', 'Estat', 'Nombre de seguiment', 'Data', 'Preu'].map((h) => (
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
                </table>
                {/* Body scrollable */}
                <div
                  ref={ordersRef}
                  style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
                >
                  <div style={{ transform: `translateY(-${scrollIndex * ROW_HEIGHT}px)`, transition: 'transform 0.3s ease-in-out' }}>
                    <table style={{
                      width: '100%',
                      marginLeft: '0',
                      borderCollapse: 'collapse',
                      tableLayout: 'fixed',
                      border: 'none',
                    }}>
                      <colgroup>
                        <col style={{ width: '34%' }} />
                        <col style={{ width: '7%' }} />
                        <col style={{ width: '32%' }} />
                        <col style={{ width: '14%' }} />
                        <col style={{ width: '13%' }} />
                      </colgroup>
                      <tbody>
                        {displayOrders.map((o, idx) => {
                          const status = o.status || o.raw?.status || 'PENDENT';
                          const Icon = STATUS_ICON[status] || MoreHorizontal;
                          const color = STATUS_COLOR[status] || '#9CA3AF';
                          return (
                            <tr key={o.num || idx} style={{ height: `${ROW_HEIGHT}px` }}>
                              <td style={{ ...TEXT, fontSize: '10pt', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '4px 2px', textAlign: 'center', border: 'none', maxWidth: 0 }}>{o.num}</td>
                              <td style={{ padding: '4px 2px', border: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                  <Icon size={11} color={color} strokeWidth={2} />
                                </div>
                              </td>
                              <td style={{ ...TEXT, fontSize: '10pt', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '4px 2px', textAlign: 'center', border: 'none', maxWidth: 0 }}>{o.tracking_number || o.raw?.tracking_number || '—'}</td>
                              <td style={{ ...TEXT, fontSize: '10pt', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '4px 2px', textAlign: 'center', border: 'none', maxWidth: 0 }}>{o.date}</td>
                              <td style={{ ...TEXT, fontSize: '10pt', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '4px 2px', textAlign: 'center', border: 'none', maxWidth: 0 }}>{o.total || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>
                {/* Legend */}
                <div style={{
                  flexShrink: 0,
                  display: 'flex',
                  flexWrap: 'nowrap',
                  gap: '4px 6px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: '12px',
                  overflow: 'hidden',
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
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0 10px 10px', overflow: 'hidden', position: 'relative' }}>
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

                {/* Messages list — visible by default */}
                <div style={{ flex: 1, overflow: 'auto', padding: '8px 0', display: 'flex', flexDirection: 'column' }}>
                  {/* Tab selector — estil selector de color pàgina 2 */}
                  <div style={{
                    display: 'flex',
                    backgroundColor: '#f3f4f6',
                    padding: '2px',
                    borderRadius: '4px',
                    border: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    marginBottom: '8px',
                  }}>
                    {['rebuts', 'enviats'].map((tab) => {
                      const isActive = activeMessageTab === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveMessageTab(tab)}
                          style={{
                            flex: 1,
                            fontFamily: 'Oswald, sans-serif',
                            fontSize: '9pt',
                            fontWeight: isActive ? 400 : 300,
                            letterSpacing: '0em',
                            lineHeight: 1,
                            textTransform: 'capitalize',
                            color: isActive ? '#111827' : '#9ca3af',
                            backgroundColor: isActive ? '#ffffff' : 'transparent',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            transition: 'all 150ms ease',
                            boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '5px 0',
                          }}
                        >
                          {tab}
                        </button>
                      );
                    })}
                  </div>

                  {mockMessages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '25px' }}>
                      <span style={{ ...TEXT, fontSize: '9pt', textAlign: 'center', opacity: 0.5 }}>
                        No hi ha cap missatge
                      </span>
                    </div>
                  ) : (
                    (activeMessageTab === 'rebuts' ? rebutsMessages : enviatsMessages).map((msg, idx) => (
                      <div
                        key={msg.id}
                        style={{
                          padding: '8px 0',
                          marginBottom: '3px',
                          cursor: 'pointer',
                          position: 'relative',
                          backgroundImage: `url("/placeholders/tots_els_fons/fons_pagina_4/fons-una-filera.png")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center center',
                          backgroundSize: '100% 100%',
                          transform: idx % 2 === 0 ? 'scaleX(-1)' : 'none',
                        }}
                      >
                        <div style={{ transform: idx % 2 === 0 ? 'scaleX(-1)' : 'none', position: 'relative', padding: '0 10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <span style={{ ...TEXT, fontSize: '10pt', color: '#111827', fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{msg.subject}</span>
                            <span style={{ ...TEXT, fontSize: '10pt', color: '#6b7280' }}>
                              {msg.date}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 300, fontSize: '10pt', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                              {msg.preview}
                            </div>
                            {msg.status === 'Pendent' ? (
                              <Circle size={10} color="#D97706" strokeWidth={2} style={{ marginLeft: '8px', flexShrink: 0 }} />
                            ) : (
                              <Check size={12} color="#16A34A" strokeWidth={2.5} style={{ marginLeft: '8px', flexShrink: 0 }} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Sliding panel for message form */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: messagesSlideOpen ? '3px' : '3px',
                    left: '10px',
                    right: '10px',
                    height: messagesSlideOpen ? 'calc(100% - 42px)' : '32px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backgroundImage: 'url("/placeholders/tots_els_fons/fons_pagina_4/pagina-4-fons-missatges.png")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center calc(50% + 36px)',
                    backgroundSize: '100% 100%',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
                    transition: 'height 0.3s ease-in-out, bottom 0.3s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    zIndex: 1,
                  }}
                >
                  {/* Arrow toggle button */}
                  <button
                    onClick={() => setMessagesSlideOpen(!messagesSlideOpen)}
                    style={{
                      width: '100%',
                      height: '32px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 12px',
                      flexShrink: 0,
                    }}
                  >
                    {messagesSlideOpen ? (
                      <ChevronDown size={16} color="#475059" strokeWidth={2} />
                    ) : (
                      <ChevronUp size={16} color="#475059" strokeWidth={2} />
                    )}
                    <PenLine size={14} color="#475059" strokeWidth={2} />
                    <div style={{ width: '16px' }} />
                  </button>

                  {/* Form table — inside slider */}
                  {messagesSlideOpen && (
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
                            <TransparentInput ref={msgNameRef} placeholder="Nom" defaultValue={displayProfile?.full_name || ''} style={{ fontSize: '10pt' }} />
                          </td>
                          <td style={{ width: '50%', padding: '4px', border: 'none' }}>
                            <TransparentInput ref={msgEmailRef} placeholder="eCorreu" defaultValue={user?.email || ''} style={{ fontSize: '10pt' }} />
                          </td>
                        </tr>
                        {/* Row 2: Assumpte */}
                        <tr>
                          <td colSpan={2} style={{ padding: '4px', border: 'none' }}>
                            <TransparentInput ref={msgSubjectRef} placeholder="Assumpte" style={{ fontSize: '10pt' }} />
                          </td>
                        </tr>
                        {/* Row 3: Missatge */}
                        <tr>
                          <td colSpan={2} style={{ padding: '0 4px', border: 'none', height: '100%', verticalAlign: 'top' }}>
                            <textarea
                              ref={msgBodyRef}
                              placeholder="Missatge"
                              style={{
                                ...TEXT,
                                width: '100%',
                                height: '100%',
                                boxSizing: 'border-box',
                                padding: '6px 8px',
                                border: 'none',
                                borderRadius: 0,
                                outline: 'none',
                                resize: 'none',
                                background: 'transparent',
                                fontSize: '10pt',
                                textAlign: 'left',
                              }}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  {/* Buttons — inside slider */}
                  {messagesSlideOpen && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', flexShrink: 0, padding: '4px 8px 8px' }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                      <button
                        onClick={handleAttach}
                        style={{
                          ...HEAD,
                          fontSize: '7pt',
                          color: '#475059',
                          backgroundColor: '#FFFFFF',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          padding: '4px 0',
                        }}>
                        {attachments.length > 0 ? `Adjunta (${attachments.length})` : 'Adjunta'}
                      </button>
                      <button
                        onClick={handleCancel}
                        style={{
                          ...HEAD,
                          fontSize: '7pt',
                          color: '#475059',
                          backgroundColor: '#FFFFFF',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          padding: '4px 0',
                        }}>
                        Cancel·la
                      </button>
                      <button
                        onClick={handleSend}
                        disabled={sending}
                        style={{
                          ...HEAD,
                          fontSize: '7pt',
                          color: '#FFFFFF',
                          backgroundColor: '#2F3540',
                          border: 'none',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          padding: '4px 0',
                          opacity: sending ? 0.6 : 1,
                        }}>
                        {sending ? 'Enviant…' : sent ? '✓ Enviat' : 'Envia'}
                      </button>
                    </div>
                  )}
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
                {!isLoggedIn ? (
                  <div style={{ flex: '0.390', marginTop: '7px', paddingTop: '2px' }}>
                    <table style={{
                      width: 'calc(100% + 11px)',
                      marginLeft: '-2px',
                      marginTop: '3px',
                      borderCollapse: 'collapse',
                      tableLayout: 'fixed',
                      border: 'none',
                    }}>
                      <thead>
                        <tr>
                          <th style={{ ...HEAD, fontSize: '7pt', textAlign: 'center', padding: '1px 4px 4px', border: 'none' }}>Dades de contacte</th>
                          <th style={{ ...HEAD, fontSize: '7pt', textAlign: 'center', padding: '1px 4px 4px', border: 'none' }}>Dades d'enviament</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Nom" defaultValue="" style={{ fontSize: '10pt' }} /></td>
                          <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><div style={{ display: 'flex', gap: '4px' }}><TransparentInput placeholder="Carrer" defaultValue="" style={{ fontSize: '10pt', flex: 1 }} /><TransparentInput placeholder="Nombre" defaultValue="" style={{ fontSize: '10pt', width: '38%' }} /></div></td>
                        </tr>
                        <tr>
                          <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="eCorreu" defaultValue="" style={{ fontSize: '10pt' }} /></td>
                          <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Pis" defaultValue="" style={{ fontSize: '10pt' }} /></td>
                        </tr>
                        <tr>
                          <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><div style={{ display: 'flex', gap: '4px' }}><select defaultValue="+34" style={{ fontSize: '10pt', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'Roboto, sans-serif', fontWeight: 300, color: '#9CA3AF', cursor: 'pointer' }}>{PHONE_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}</select><TransparentInput placeholder="Mòbil" defaultValue="" style={{ fontSize: '10pt', flex: 1 }} /></div></td>
                          <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="CP" defaultValue="" onBlur={handleCpBlur} style={{ fontSize: '10pt' }} /></td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingBottom: '2.5px' }} />
                          <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Ciutat" defaultValue="" style={{ fontSize: '10pt' }} /></td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none', paddingBottom: '2.5px' }} />
                          <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput placeholder="Província" defaultValue="" style={{ fontSize: '10pt' }} /></td>
                        </tr>
                        <tr>
                          <td style={{ border: 'none' }} />
                          <td style={{ padding: '2px 4px', border: 'none' }}><TransparentInput placeholder="País" defaultValue="" style={{ fontSize: '10pt' }} /></td>
                        </tr>
                        <tr style={{ height: '7.5px' }}><td style={{ border: 'none' }} colSpan={2} /></tr>
                        <tr>
                          <td style={{ border: 'none' }} />
                          <td style={{ padding: '2px 4px', border: 'none' }}>
                            <button onClick={() => navigate('/shipping')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: '9pt', fontWeight: 300, color: '#475059', padding: 0 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #9CA3AF', fontSize: '8pt', fontWeight: 400, color: '#9CA3AF', lineHeight: 1 }}>i</span>
                              Enviaments i Temps
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                <div style={{ flex: '0.390', marginTop: '7px', paddingTop: '2px' }}>
                  <table style={{
                    width: 'calc(100% + 11px)',
                    marginLeft: '-2px',
                    marginTop: '3px',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                    border: 'none',
                  }}>
                    <thead>
                      <tr>
                        <th style={{ ...HEAD, fontSize: '7pt', textAlign: 'center', padding: '1px 4px 4px', border: 'none' }}>Dades de contacte</th>
                        <th style={{ ...HEAD, fontSize: '7pt', textAlign: 'center', padding: '1px 4px 4px', border: 'none' }}>Dades d'enviament</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput ref={nameRef} placeholder="Nom" defaultValue={displayProfile?.full_name || ''} error={missingFields.includes('full_name')} style={{ fontSize: '10pt' }} /></td>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><div style={{ display: 'flex', gap: '4px' }}><TransparentInput ref={streetRef} placeholder="Carrer" defaultValue={streetName} error={missingFields.includes('street')} onBlur={handleStreetBlur} style={{ fontSize: '10pt', flex: 1 }} /><TransparentInput ref={streetNumberRef} placeholder="Nombre" defaultValue={streetNumber} error={missingFields.includes('street_number')} style={{ fontSize: '10pt', width: '38%' }} /></div></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput ref={emailRef} placeholder="eCorreu" defaultValue={user?.email || ''} style={{ fontSize: '10pt' }} /></td>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput ref={floorRef} placeholder="Pis" defaultValue={defaultAddress.floor_door || ''} style={{ fontSize: '10pt' }} /></td>
                      </tr>
                      <tr>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><div style={{ display: 'flex', gap: '4px' }}><select value={phonePrefixState} onChange={e => setPhonePrefixState(e.target.value)} style={{ fontSize: '10pt', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'Roboto, sans-serif', fontWeight: 300, color: '#9CA3AF', cursor: 'pointer' }}>{PHONE_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}</select><TransparentInput ref={phoneRef} placeholder="Mòbil" defaultValue={phoneNumber} error={missingFields.includes('phone')} style={{ fontSize: '10pt', flex: 1 }} /></div></td>
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput ref={cpRef} placeholder="CP" defaultValue={defaultAddress.postal_code || ''} onBlur={handleCpBlur} error={missingFields.includes('postal_code')} style={{ fontSize: '10pt' }} /></td>
                      </tr>
                      <tr>
                        <td style={{ border: 'none', paddingBottom: '2.5px' }} />
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput ref={cityRef} placeholder="Ciutat" defaultValue={defaultAddress.city || ''} error={missingFields.includes('city')} style={{ fontSize: '10pt' }} /></td>
                      </tr>
                      <tr>
                        <td style={{ border: 'none', paddingBottom: '2.5px' }} />
                        <td style={{ padding: '2px 4px 2.5px', border: 'none' }}><TransparentInput ref={provinceRef} placeholder="Província" defaultValue={defaultAddress.province || ''} error={missingFields.includes('province')} style={{ fontSize: '10pt' }} /></td>
                      </tr>
                      <tr>
                        <td style={{ border: 'none' }} />
                        <td style={{ padding: '2px 4px', border: 'none' }}><TransparentInput ref={countryRef} placeholder="País" defaultValue={defaultAddress.country || ''} error={missingFields.includes('country')} style={{ fontSize: '10pt' }} /></td>
                      </tr>
                      <tr style={{ height: '7.5px' }}><td style={{ border: 'none' }} colSpan={2} /></tr>
                      <tr>
                        <td style={{ border: 'none' }} />
                        <td style={{ padding: '2px 4px', border: 'none' }}>
                          <button onClick={() => navigate('/shipping')} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: '9pt', fontWeight: 300, color: '#475059', padding: 0 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '14px', height: '14px', borderRadius: '50%', border: '1px solid #9CA3AF', fontSize: '8pt', fontWeight: 400, color: '#9CA3AF', lineHeight: 1 }}>i</span>
                            Enviaments i Temps
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                )}
                <div style={{ flex: 1 }} />
                {/* Desa button — same size and Y position as bloc 2 buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', height: '9%', flexShrink: 0, position: 'relative', top: '7px', marginRight: '-9px' }}>
                  <div />
                  <button
                    onClick={handleSignOut}
                    style={{
                      ...HEAD,
                      fontSize: '7pt',
                      color: '#475059',
                      backgroundColor: 'rgba(244,246,248,0.7)',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      padding: 0,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <LogOut size={10} color="#475059" strokeWidth={2} />
                    Tanca sessió
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      ...HEAD,
                      fontSize: '7pt',
                      color: '#FFFFFF',
                      backgroundColor: '#2F3540',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      padding: 0,
                      height: '100%',
                      opacity: saving ? 0.6 : 1,
                    }}>
                    {saving ? 'Desant…' : saved ? '✓ Desat' : 'Desa'}
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
