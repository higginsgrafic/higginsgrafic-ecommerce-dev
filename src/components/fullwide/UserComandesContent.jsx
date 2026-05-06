import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  Package,
  Search,
  Truck,
  X,
} from 'lucide-react';
import usePersistentState from '@/hooks/usePersistentState';

// Plantilla de la secció COMANDES del perfil d'usuari — alineada amb la pauta verda
function UserComandesContent() {
  const [activeTab, setActiveTab] = usePersistentState('HG_USER_ACTIVE_TAB', 'COMANDES');
  const [sortDirs, setSortDirs] = usePersistentState('HG_USER_SORT_DIRS', { 'COMANDA': 'desc', 'ESTAT': 'desc', 'DATA': 'desc', 'TOT PLEGAT': 'desc' });
  const [contactMode, setContactMode] = usePersistentState('HG_USER_CONTACT_MODE', 'comanda'); // 'comanda' | 'correu'
  const [acceptCommActive, setAcceptCommActive] = useState(false);
  const [acceptShareActive, setAcceptShareActive] = useState(false);
  const [facturacioActive, setFacturacioActive] = useState(false);
  const [dadesOpen, setDadesOpen] = useState(true);
  const [gestioOpen, setGestioOpen] = useState(true);
  const [privacOpen, setPrivacOpen] = useState(true);
  const [enviamentOpen, setEnviamentOpen] = useState(true);
  const [formatsOpen, setFormatsOpen] = useState(true);
  const [mailingOpen, setMailingOpen] = useState(true);
  const [factorOpen, setFactorOpen] = useState(true);
  const [segVisible, setSegVisible] = useState(false);
  const [nameSortDir, setNameSortDir] = usePersistentState('HG_USER_NAME_SORT', 'asc'); // 'asc' | 'desc'
  const [dateSortDir, setDateSortDir] = usePersistentState('HG_USER_DATE_SORT', 'desc'); // 'asc' | 'desc'
  const toggleSort = (key) => setSortDirs((prev) => ({ ...prev, [key]: prev[key] === 'desc' ? 'asc' : 'desc' }));
  const ORDERS = [
    { num: '#00000000000000000000027', status: 'PENDENT', icon: MoreHorizontal, date: '27-04-26', total: '15,50€', active: true },
    { num: '#00000000000000000000026', status: 'EN PREPARACIÓ', icon: Loader2, date: '27-04-26', total: '15,50€', active: true },
    { num: '#00000000000000000000025', status: 'SEGUIMENT', icon: Search, date: '27-04-26', total: '15,50€', active: true },
    { num: '#00000000000000000000024', status: 'CONFIRMADA', icon: Check, date: '23-04-26', total: '15,50€', active: true },
    { num: '#00000000000000000000023', status: 'PENDENT', icon: MoreHorizontal, date: '23-04-26', total: '15,50€', active: true },
    { num: '#00000000000000000000022', status: 'EN REPARTIMENT', icon: Truck, date: '23-04-26', total: '15,50€', active: true },
    { num: '#00000000000000000000021', status: 'ENTREGADA', icon: Package, date: '23-04-26', total: '15,50€', active: true },
    { num: '#00000000000000000000020', status: 'CANCEL·LADA', icon: X, date: '23-04-26', total: '15,50€', active: false },
    { num: '#00000000000000000000019', status: 'ENTREGADA', icon: Package, date: '23-04-26', total: '15,50€', active: false },
    { num: '#00000000000000000000018', status: 'ENTREGADA', icon: Package, date: '23-04-26', total: '15,50€', active: false },
    { num: '#00000000000000000000017', status: 'CANCEL·LADA', icon: X, date: '23-04-26', total: '15,50€', active: false },
    { num: '#00000000000000000000016', status: 'ATURADA', icon: AlertCircle, date: '23-04-26', total: '15,50€', active: false },
    { num: '#00000000000000000000015', status: 'ENTREGADA', icon: Package, date: '23-04-26', total: '15,50€', active: false },
    { num: '#00000000000000000000014', status: 'ENTREGADA', icon: Package, date: '23-04-26', total: '15,50€', active: false },
    { num: '#00000000000000000000013', status: 'ENTREGADA', icon: Package, date: '23-04-26', total: '15,50€', active: false },
  ];

  const LEGEND = [
    { label: 'PENDENT', icon: MoreHorizontal },
    { label: 'CONFIRMADA', icon: Check },
    { label: 'EN PREPARACIÓ', icon: Loader2 },
    { label: 'SEGUIMENT', icon: Search },
    { label: 'EN REPARTIMENT', icon: Truck },
    { label: 'ATURADA', icon: AlertCircle },
    { label: 'CANCEL·LADA', icon: X },
    { label: 'ENTREGADA', icon: Package },
  ];

  const ROW_H = 32.8;
  const SEG_X_OFFSET = '0.5px';
  const SEG_Y_OFFSET = '1.75px';
  const SEG_TABLE_LOCKED_HEIGHT = '621.25px';
  const SEG_LEGEND_ITEMS = [
    'Totes les dades són xifrades.',
    'El CVV és només per a la verificació, no el guardem.',
    'Esborrar el compte és una acció permanent.',
    'Stripe, Redsys, Google Pay, etc.',
    "Google Authenticator, Authy, etc.",
  ];
  const TEXT = { fontFamily: 'Roboto Condensed, sans-serif', fontWeight: 400, fontSize: '12pt', color: '#475059' };
  const HEAD = { fontFamily: 'Oswald, sans-serif', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#475059' };

  // Graella de 5 columnes irregulars amb gutter de 7.5px (mesurades del mockup)
  const COL_TEMPLATE = '374px 299px 186px 188px 288px';
  const GUTTER = '7.5px';
  // Les 1.5 primeres línies de la pauta són espai en blanc (tabs a la posició original)
  const TOP_OFFSET = 1.5 * ROW_H;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      paddingTop: `${TOP_OFFSET}px`,
      boxSizing: 'border-box',
      overflow: 'hidden',
      zIndex: 1,
      ...TEXT,
    }}>
      {/* Mockup JPG guia per pestanya — desactivada */}
      {true && activeTab === 'SEGURETAT' && (
        <div style={{
          position: 'absolute',
          top: '-1px',
          left: '-280.5px',
          width: '100vw',
          height: '100vh',
          backgroundImage: `url("/tmp/USER/SEGURETAT.jpg?v=${Date.now()}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'calc(50% - 7.5px) -695.8px',
          backgroundSize: '2038px 1527px',
          pointerEvents: 'none',
          zIndex: -2,
        }} />
      )}
      {/* 1. TABS — alineades amb els rectangles grisos del slide (1320px = 1400-2*40) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        columnGap: GUTTER,
        height: `${ROW_H}px`,
        width: '1365.46px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {['COMANDES', 'MISSATGES', 'COMPTE', 'SEGURETAT'].map((tab, i) => {
          const isActive = activeTab === tab;
          return (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
              ...HEAD,
              fontSize: isActive ? '15pt' : '12pt',
              fontWeight: isActive ? 600 : 400,
              letterSpacing: isActive ? '1.5px' : HEAD.letterSpacing,
              color: isActive ? '#2F61B2' : '#475059',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textIndent: isActive ? '1.5px' : '0.4px',
              position: 'relative',
              boxSizing: 'border-box',
              cursor: 'pointer',
              userSelect: 'none',
            }}>
              <span style={{ display: 'inline-block', transform: isActive ? 'translateY(1px)' : 'none' }}>{tab}</span>
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: '2.5px',
                height: isActive ? '3px' : '1px',
                backgroundColor: isActive ? '#2F61B2' : '#7D8895',
              }} />
            </div>
          );
        })}
      </div>

      {/* Espai d'una fila entre tabs i secció (el conjunt taula/U-box puja una fila) */}
      <div style={{ height: `${ROW_H}px` }} />

      {activeTab === 'COMPTE' && (<>
        <style>{`
          .compte-grid { box-sizing: border-box; }
          .compte-grid td {
            box-sizing: border-box;
            padding: 0;
          }
          .compte-ph-wrap { position: relative; width: 100%; height: 100%; }
          .compte-ph-wrap input {
            width: 100%; height: 100%;
            box-sizing: border-box;
            padding: 0 10px;
            border: none; outline: none;
            background: transparent;
            font-family: 'Roboto Condensed', sans-serif;
            font-weight: 400;
            font-size: 12pt;
            color: #475059;
            display: block;
          }
          .compte-ph-wrap .compte-ph {
            position: absolute; inset: 0;
            display: flex; align-items: center;
            padding: 0 10px;
            pointer-events: none;
            font-family: 'Roboto Condensed', sans-serif;
            font-weight: 400;
            font-size: 12pt;
            line-height: 1;
          }
          .compte-ph-wrap input:focus ~ .compte-ph,
          .compte-ph-wrap input:not(:placeholder-shown) ~ .compte-ph { display: none; }
          .compte-ph-wrap input:-webkit-autofill,
          .compte-ph-wrap input:-webkit-autofill:hover,
          .compte-ph-wrap input:-webkit-autofill:focus,
          .compte-ph-wrap input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important;
            -webkit-text-fill-color: #475059 !important;
            caret-color: #475059;
            transition: background-color 9999s ease-in-out 0s;
          }
        `}</style>
        <div style={{ width: '1365.46px', marginLeft: 'auto', marginRight: 'auto', marginTop: '-0.5px', overflow: 'hidden', position: 'relative', backgroundImage: 'url("/placeholders/fons_acordio/fons-usuari-compte.png")', backgroundRepeat: 'no-repeat', backgroundPosition: 'top left', backgroundSize: '1365.46px 100%' }}>
          <table className="compte-grid" style={{
            width: '1380.46px',
            marginLeft: '-7.5px',
            marginTop: '-2.8px',
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: '7.5px 2.8px',
          }}>
            <colgroup>
              <col style={{ width: '324px' }} />
              <col style={{ width: '324.5px' }} />
              <col style={{ width: '158.5px' }} />
              <col style={{ width: '158.5px' }} />
              <col style={{ width: '324.5px' }} />
            </colgroup>
            <tbody>
              {(() => {
                const headStyle = { ...HEAD, fontSize: '12pt', padding: '0 10px', display: 'flex', alignItems: 'center', height: '100%', boxSizing: 'border-box', borderBottom: '2px solid #98A2B4' };
                const labelStyle = { ...TEXT, fontFamily: 'Roboto Condensed, sans-serif', fontSize: '12pt', padding: '0 10px', verticalAlign: 'middle' };
                const supStyle = { fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.65em', verticalAlign: 'baseline', position: 'relative', top: '-0.35em', marginLeft: '2px' };
                const COL_STRONG = '#475059';
                const COL_WEAK = '#C5CACF';
                const lbl = (text, req = false, strong = false) => (
                  <div className="compte-ph-wrap">
                    <input type="text" placeholder=" " />
                    <span className="compte-ph" style={{ color: strong ? COL_STRONG : COL_WEAK }}>
                      <span>{text}{req && <span style={supStyle}>1</span>}</span>
                    </span>
                  </div>
                );
                const chk = (text, req = false, active = false, onClick) => (
                  <div onClick={onClick} style={{ ...labelStyle, height: '100%', display: 'flex', alignItems: 'center', gap: '8px', color: COL_STRONG, boxSizing: 'border-box', cursor: onClick ? 'pointer' : 'default', userSelect: 'none' }}>
                    <span style={{ width: '14px', height: '14px', border: `1.5px solid ${active ? COL_STRONG : '#98A2B4'}`, borderRadius: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', flexShrink: 0 }}>
                      {active && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: COL_STRONG }} />}
                    </span>
                    <span>{text}{req && <span style={supStyle}>1</span>}</span>
                  </div>
                );
                const pwd = (text) => (
                  <div className="compte-ph-wrap">
                    <input type="password" placeholder=" " autoComplete="new-password" passwordrules="minlength: 30; required: lower; required: upper; required: digit; required: special;" />
                    <span className="compte-ph" style={{ color: COL_WEAK }}>
                      <span>{text}</span>
                    </span>
                  </div>
                );
                const passwordMask = (count = 5) => (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '0 10px', boxSizing: 'border-box' }}>
                    <span style={{ color: COL_WEAK, fontFamily: 'Roboto Condensed, sans-serif', fontSize: '14pt', letterSpacing: '4px', lineHeight: 1, userSelect: 'text' }}>
                      {'\u2022'.repeat(count)}
                    </span>
                  </div>
                );
                const headerNode = (title, open, onToggle) => (
                  <div onClick={onToggle} style={{ ...headStyle, cursor: 'pointer', justifyContent: 'space-between' }}>
                    <span>{title}</span>
                    {open ? <ChevronDown size={14} strokeWidth={1.75} /> : <ChevronRight size={14} strokeWidth={1.75} />}
                  </div>
                );
                const facturacioHead = (
                  <div onClick={() => setFacturacioActive(v => !v)} style={{ ...labelStyle, height: '100%', display: 'flex', alignItems: 'center', gap: '8px', boxSizing: 'border-box', cursor: 'pointer', userSelect: 'none', borderBottom: '2px solid #98A2B4', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '14px', height: '14px', border: `1.5px solid ${facturacioActive ? COL_STRONG : '#98A2B4'}`, borderRadius: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', flexShrink: 0 }}>
                        {facturacioActive && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: COL_STRONG }} />}
                      </span>
                      <span style={{ ...HEAD, fontSize: '12pt', color: COL_STRONG }}>FACTURACIÓ</span>
                      <span style={{ color: COL_STRONG }}>(Si no és la mateixa que a ENVIAMENT)</span>
                    </span>
                    {facturacioActive ? <ChevronDown size={14} strokeWidth={1.75} color={COL_STRONG} /> : <ChevronRight size={14} strokeWidth={1.75} color={COL_STRONG} />}
                  </div>
                );
                const splitR = (a, b) => [{ span: 2, content: a }, { span: 1, content: b }];
                const fullR = (c) => [{ span: 3, content: c }];
                const GAP = 2;
                const place = (sections) => {
                  const slots = new Array(16).fill(null);
                  let nextRow = 0;
                  sections.forEach((s) => {
                    if (s.spacer) { nextRow += s.spacer; return; }
                    const h = nextRow;
                    slots[h] = s.header;
                    if (s.open) {
                      s.content.forEach((c, i) => { slots[h + 1 + i] = c; });
                      nextRow = h + 1 + s.content.length + GAP;
                    } else {
                      nextRow = h + 1 + GAP;
                    }
                  });
                  return slots;
                };
                const addrBlock = [
                  lbl('Nom', true),
                  [lbl('Adreça', true), lbl('Pis i Porta', true)],
                  [lbl('Població', true), lbl('Codi Postal', true)],
                  [lbl('Província', true), lbl('País', true)],
                  lbl(<>NIF/CIF (Obligatori per a factures<span style={supStyle}>1</span>)</>),
                  lbl('Nom Fiscal (només si és diferent del nom personal)'),
                ];
                const addrR = addrBlock.map(c => Array.isArray(c) ? splitR(c[0], c[1]) : fullR(c));
                const isSeg = activeTab === 'SEGURETAT';
                const lSections = [
                  { open: dadesOpen, origHeader: 0, header: headerNode(isSeg ? 'MÈTODES DE PAGAMENT' : "DADES D'USUARI", dadesOpen, () => setDadesOpen(v => !v)), content: [
                    lbl('Nom', true), lbl('eCorreu', true), lbl('Telèfon', true), lbl('Empresa/Organització', true),
                  ] },
                ];
                if (!isSeg) {
                  lSections.push({ open: gestioOpen, origHeader: 7, header: headerNode('GESTIÓ DE LA CONTRASENYA', gestioOpen, () => setGestioOpen(v => !v)), content: [
                    passwordMask(), pwd('Contrasenya nova'), pwd('Confirma la contrasenya'),
                  ] });
                } else {
                  lSections.push({ spacer: 7 });
                }
                lSections.push({ open: privacOpen, origHeader: 13, header: headerNode(isSeg ? 'FORMATS' : 'PRIVACITAT', privacOpen, () => setPrivacOpen(v => !v)), content: [
                  chk('Accepto rebre comunicacions comercials', false, acceptCommActive, () => setAcceptCommActive(v => !v)),
                  chk('Accepto compartir dades amb el transportista', true, acceptShareActive, () => setAcceptShareActive(v => !v)),
                ] });
                const L = place(lSections);
                const rSections = [];
                if (!isSeg) {
                  rSections.push({ open: enviamentOpen, origHeader: 0, header: fullR(headerNode('ENVIAMENT', enviamentOpen, () => setEnviamentOpen(v => !v))), content: addrR });
                  rSections.push({ open: facturacioActive, origHeader: 9, header: fullR(facturacioHead), content: addrR });
                }
                const R = place(rSections);
                if (isSeg) {
                  R[10] = [
                    { span: 2, content: headerNode('MAILING', false, () => {}) },
                    { span: 1, content: headerNode('DOBLE FACTOR', false, () => {}) },
                  ];
                }

                return Array.from({ length: 16 }).map((_, r) => {
                  if (isSeg && r === 0) {
                    return (
                      <tr key={r} style={{ height: '30px' }}>
                        <td colSpan={5} style={{ height: '30px' }}>{L[r]}</td>
                      </tr>
                    );
                  }
                  if (isSeg && r !== 10 && r !== 13) {
                    return (
                      <tr key={r} style={{ height: '30px' }}>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <td key={i} style={{ height: '30px' }} />
                        ))}
                      </tr>
                    );
                  }
                  if (isSeg && r === 13) {
                    return (
                      <tr key={r} style={{ height: '30px' }}>
                        <td colSpan={2} style={{ height: '30px' }}>{L[r]}</td>
                        <td colSpan={3} style={{ height: '30px' }} />
                      </tr>
                    );
                  }
                  if (isSeg && r === 10) {
                    return (
                      <tr key={r} style={{ height: '30px' }}>
                        <td colSpan={2} style={{ height: '30px' }} />
                        {(R[r] || []).map((c, i) => (
                          <td key={i} colSpan={c.span} style={{ height: '30px' }}>{c.content}</td>
                        ))}
                      </tr>
                    );
                  }
                  const eyeBtn = (
                    <span
                      role="button"
                      aria-label={segVisible ? 'Amaga les dades' : 'Mostra les dades'}
                      onClick={(e) => { e.stopPropagation(); setSegVisible(v => !v); }}
                      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: '#475059', transform: 'translateX(57px)', position: 'relative', zIndex: 3 }}
                    >
                      {segVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </span>
                  );
                  const withEye = (left) => (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}>{left}</span>
                      <span></span>
                      {eyeBtn}
                    </span>
                  );
                  if (isSeg && r === 1) {
                    const red = (n) => <span style={{ color: '#FF0000', fontSize: '13pt' }}>{n}</span>;
                    const segCells = [
                      withEye(<span style={{ color: '#FF0000', fontSize: '13pt' }}>Entitat</span>),
                      red(<span style={{ display: 'inline-block', transform: 'translateX(-245px)' }}>Nom del titular</span>),
                      red(<span style={{ display: 'inline-block', transform: 'translateX(-7.5px)' }}>Número de targeta<span style={supStyle}>1</span></span>),
                      red(<span style={{ display: 'inline-block', transform: 'translateX(158.5px)' }}>Caducitat<span style={supStyle}>1</span></span>),
                      red(<span style={{ display: 'inline-block', transform: 'translateX(240px)' }}>CVV<span style={supStyle}>2</span></span>),
                    ];
                    return (
                      <tr key={r} style={{ height: '30px' }}>
                        {segCells.map((c, i) => (
                          <td key={i} colSpan={1} style={{ height: '30px' }}>{lbl(c)}</td>
                        ))}
                      </tr>
                    );
                  }
                  if (isSeg && r >= 2 && r <= 8) {
                    const cardDots = '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022';
                    const segDemo = [
                      { ent: 'Visa',       nom: 'Marc Higgins',  num: '4111 1111 1111 1111', exp: '12/29', cvv: '123' },
                      { ent: 'Mastercard', nom: 'Anna Soler',    num: '5500 0000 0000 0004', exp: '03/27', cvv: '456' },
                      { ent: 'Amex',       nom: 'Joan Vidal',    num: '3782 822463 10005',   exp: '11/26', cvv: '7890' },
                      { ent: 'Visa',       nom: 'Maria Pla',     num: '4242 4242 4242 4242', exp: '07/28', cvv: '321' },
                      { ent: 'Maestro',    nom: 'Pere Font',     num: '6759 6498 2643 8453', exp: '09/30', cvv: '654' },
                      { ent: 'Visa',       nom: 'Laura Riu',     num: '4012 8888 8888 1881', exp: '05/25', cvv: '987' },
                      { ent: 'Discover',   nom: 'Toni Gel',      num: '6011 0009 9013 9424', exp: '02/31', cvv: '159' },
                    ];
                    const d = segDemo[r - 2];
                    const rect = (
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%) scale(0.525)', transformOrigin: 'left center', width: '85px', height: '55px', background: '#E5E7EB', borderRadius: '5px', zIndex: 1, pointerEvents: 'none' }} />
                    );
                    const segCells = segVisible ? [
                      <>{rect}{withEye(d.ent)}</>,
                      <span style={{ display: 'inline-block', transform: 'translateX(-245px)' }}>{d.nom}</span>,
                      <span style={{ display: 'inline-block', transform: 'translateX(-7.5px)', whiteSpace: 'nowrap' }}>{d.num}</span>,
                      <span style={{ display: 'inline-block', transform: 'translateX(158.5px)', whiteSpace: 'nowrap' }}>{d.exp}</span>,
                      <span style={{ display: 'inline-block', transform: 'translateX(240px)', whiteSpace: 'nowrap' }}>{d.cvv}</span>,
                    ] : [
                      <>{rect}{withEye('')}</>,
                      <span style={{ display: 'inline-block', transform: 'translateX(-245px)' }}>Nom</span>,
                      <span style={{ display: 'inline-block', transform: 'translateX(-7.5px)', letterSpacing: '2px', fontSize: '1.5em', whiteSpace: 'nowrap' }}>{cardDots}</span>,
                      <span style={{ display: 'inline-block', transform: 'translateX(158.5px)', letterSpacing: '2px', fontSize: '1.5em', whiteSpace: 'nowrap' }}>{'\u2022\u2022/\u2022\u2022'}</span>,
                      <span style={{ display: 'inline-block', transform: 'translateX(240px)', letterSpacing: '2px', fontSize: '1.5em', whiteSpace: 'nowrap' }}>{'\u2022\u2022\u2022'}</span>,
                    ];
                    return (
                      <tr key={r} style={{ height: '30px' }}>
                        {segCells.map((c, i) => (
                          <td key={i} colSpan={1} style={{ height: '30px' }}>{lbl(c)}</td>
                        ))}
                      </tr>
                    );
                  }
                  return (
                    <tr key={r} style={{ height: '30px' }}>
                      <td colSpan={2} style={{ height: '30px' }}>{L[r]}</td>
                      {(R[r] || [{ span: 3, content: null }]).map((c, i) => (
                        <td key={i} colSpan={c.span} style={{ height: '30px' }}>{c.content}</td>
                      ))}
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Separador (fila 17) + llegenda (fila 18) */}
        {activeTab === 'COMPTE' && (<>
        <div style={{ height: `${ROW_H}px` }} />
        <div style={{
          width: '1365.46px',
          marginLeft: 'auto',
          marginRight: 'auto',
          height: `${ROW_H}px`,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          columnGap: '7.5px',
        }}>
        <div style={{
          gridColumn: '1 / span 4',
          height: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 10px',
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 300,
          fontSize: '9.5pt',
          letterSpacing: '0.05em',
          lineHeight: 1,
          color: '#474F58',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {(() => {
            const supSt = { fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.7em', verticalAlign: 'baseline' };
            const items = activeTab === 'SEGURETAT'
              ? [
                  'Totes les dades són xifrades.',
                  'El CVV és només per a la verificació, no el guardem.',
                  'Esborrar el compte és una acció permanent.',
                  'Stripe, Redsys, Google Pay, etc.',
                  'Google Authenticator, Authy, etc.',
                ]
              : ['Dades obligatòries per a poder servir el producte.'];
            return items.map((t, i) => (
              <span key={i} style={{ marginRight: i < items.length - 1 ? '10px' : 0 }}>
                <sup style={supSt}>{i + 1}</sup>{t}
              </span>
            ));
          })()}
        </div>
        </div>
        {/* Botonera central (REVERTEIX / CANCEL·LA / DESA) */}
        <div style={{
          width: '1365.46px',
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          columnGap: '7.5px',
        }}>
          <div style={{
            gridColumn: '2 / span 2',
            height: `${ROW_H - 2}px`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '7.5px',
          }}>
            {['REVERTEIX', 'CANCEL·LA', 'DESA'].map((label) => (
              <button key={label} style={{
                ...HEAD,
                fontFamily: 'Roboto Condensed, sans-serif',
                fontSize: '11pt',
                fontWeight: 500,
                color: '#98A2B4',
                backgroundColor: '#F4F6F8',
                border: 'none',
                borderRadius: '3px',
                boxSizing: 'border-box',
                cursor: 'pointer',
                padding: 0,
                height: '100%',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        </>)}
      </>)}

      {activeTab === 'SEGURETAT' && (
        <div style={{ width: '1365.46px', marginLeft: 'auto', marginRight: 'auto', marginTop: '0px', height: SEG_TABLE_LOCKED_HEIGHT, overflow: 'visible', position: 'relative', zIndex: 2, backgroundColor: 'transparent', backgroundImage: 'url("/placeholders/fons_acordio/fons-usuari-seguretat.png")', backgroundRepeat: 'no-repeat', backgroundPosition: 'top left', backgroundSize: '1365.46px 528px', paddingLeft: 0, paddingRight: 0, transform: `translate(${SEG_X_OFFSET}, ${SEG_Y_OFFSET})` }}>
          <style>{`.seguretat-table td { outline: none; border: none; box-shadow: none; background: transparent; }`}</style>
         <table className="seguretat-table" style={{
            width: '1380.56px',
            marginLeft: '-8.05px',
            marginTop: '-5px',
            color: '#475059',
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: '7.55px 3.05px',
          }}>
            <colgroup>
              <col style={{ width: '59.54px' }} />
              <col style={{ width: '51.54px' }} />
              <col style={{ width: '97.073px' }} />
              <col style={{ width: '97.073px' }} />
              <col style={{ width: '156.376px' }} />
              <col style={{ width: '156.376px' }} />
              <col style={{ width: '103.163px' }} />
              <col style={{ width: '103.163px' }} />
              <col style={{ width: '103.163px' }} />
              <col style={{ width: '103.163px' }} />
              <col style={{ width: '103.163px' }} />
              <col style={{ width: '103.163px' }} />
            </colgroup>
            <tbody>
              {(() => {
                const headStyle = { ...HEAD, fontSize: '12pt', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box', borderBottom: '2px solid #98A2B4' };
                const headerNode = (title, open = true, onToggle = null) => (
                  <div onClick={onToggle || undefined} style={{ ...headStyle, cursor: onToggle ? 'pointer' : 'default' }}>
                    <span>{title}</span>
                    {open ? <ChevronDown size={14} strokeWidth={1.75} /> : <ChevronRight size={14} strokeWidth={1.75} />}
                  </div>
                );
                const cellStyle = { ...TEXT, padding: '0 10px', display: 'flex', alignItems: 'center', height: '100%', boxSizing: 'border-box' };
                const supSt = { fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.65em', verticalAlign: 'baseline', position: 'relative', top: '-0.35em', marginLeft: '2px' };
                const RED = '#475059';
                const SEG_SHIFT_X = '7.55px';
                const optRow = (label, checked = false, muted = false, sup = null) => (
                  <div style={{ ...cellStyle, fontSize: '11pt', color: muted ? '#B7BDC6' : '#475059', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: `1px solid ${muted ? '#C9CED6' : '#8892A0'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', flexShrink: 0 }}>
                      {checked ? <span style={{ width: '6px', height: '6px', borderRadius: '2px', background: muted ? '#AEB5BF' : '#475059' }} /> : null}
                    </span>
                    <span>{label}{sup ? <sup style={supSt}>{sup}</sup> : null}</span>
                  </div>
                );
                const formatRows = [
                  optRow('Targeta bancària', true),
                  optRow('Passarel·la de pagament', true, false, '4'),
                  optRow('Transferència bancària', false, true),
                  optRow('Bizum', false, true),
                  optRow('Contra reemborsament', false, true),
                ];
                const mailingRows = [
                  optRow('Seguiment', true),
                  optRow('Recordatori de cistell abandonat', false, true),
                  optRow('Novetats', false),
                  null,
                  null,
                ];
                const factorRows = [
                  optRow('2FA', true),
                  optRow('SMS', false, true),
                  optRow("App d'autenticació", true, false, '5'),
                  null,
                  null,
                ];
                const anyBottomOpen = formatsOpen || mailingOpen || factorOpen;
                const eyeBtn = (
                  <span
                    role="button"
                    aria-label={segVisible ? 'Amaga les dades' : 'Mostra les dades'}
                    onClick={(e) => { e.stopPropagation(); setSegVisible(v => !v); }}
                    style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', color: '#475059' }}
                  >
                    {segVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </span>
                );
                const segDemo = [
                  { ent: 'Visa',       nom: 'Marc Higgins',  num: '4111 1111 1111 1111', exp: '12/29', cvv: '123' },
                  { ent: 'Mastercard', nom: 'Anna Soler',    num: '5500 0000 0000 0004', exp: '03/27', cvv: '456' },
                  { ent: 'Amex',       nom: 'Joan Vidal',    num: '3782 822463 10005',   exp: '11/26', cvv: '7890' },
                  { ent: 'Visa',       nom: 'Maria Pla',     num: '4242 4242 4242 4242', exp: '07/28', cvv: '321' },
                  { ent: 'Maestro',    nom: 'Pere Font',     num: '6759 6498 2643 8453', exp: '09/30', cvv: '654' },
                  { ent: 'Visa',       nom: 'Laura Riu',     num: '4012 8888 8888 1881', exp: '05/25', cvv: '987' },
                  { ent: 'Discover',   nom: 'Toni Gel',      num: '6011 0009 9013 9424', exp: '02/31', cvv: '159' },
                ];
                const cardDots = '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022';
                return Array.from({ length: 19 }).map((_, r) => {
                  if (r === 0) {
                    return (
                      <tr key={r} style={{ height: '29.75px' }}>
                        <td colSpan={12} style={{ height: '29.75px', padding: 0 }}>{headerNode('MÈTODES DE PAGAMENT', dadesOpen, () => setDadesOpen(v => !v))}</td>
                      </tr>
                    );
                  }
                  if (r === 1) {
                    if (!dadesOpen) {
                      return (
                        <tr key={r} style={{ height: '0px' }}>
                          <td colSpan={12} style={{ height: '0px', padding: 0 }} />
                        </tr>
                      );
                    }
                    return (
                      <tr key={r} style={{ height: '29.75px' }}>
                        <td colSpan={1} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: RED, fontSize: '13pt' }}>
                            <span>Entitat</span>
                          </div>
                        </td>
                        <td colSpan={1} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, justifyContent: 'center' }}>{eyeBtn}</div>
                        </td>
                        <td colSpan={4} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: RED, fontSize: '13pt' }}>Nom del titular</div>
                        </td>
                        <td colSpan={3} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: RED, fontSize: '13pt', transform: `translateX(${SEG_SHIFT_X})` }}>Número de targeta<span style={supSt}>1</span></div>
                        </td>
                        <td colSpan={2} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: RED, fontSize: '13pt', transform: `translateX(${SEG_SHIFT_X})` }}>Caducitat<span style={supSt}>1</span></div>
                        </td>
                        <td colSpan={1} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: RED, fontSize: '13pt', transform: `translateX(${SEG_SHIFT_X})` }}>CVV<span style={supSt}>2</span></div>
                        </td>
                      </tr>
                    );
                  }
                  if (r >= 2 && r <= 8) {
                    if (!dadesOpen) {
                      return (
                        <tr key={r} style={{ height: '0px' }}>
                          <td colSpan={12} style={{ height: '0px', padding: 0 }} />
                        </tr>
                      );
                    }
                    const d = segDemo[r - 2];
                    const noPupilEye = (
                      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M1 5C2.8 2.3 5.6 1 9 1C12.4 1 15.2 2.3 17 5C15.2 7.7 12.4 9 9 9C5.6 9 2.8 7.7 1 5Z" stroke="#C3C8CD" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    );
                    const rect = (
                      <span style={{ width: '45px', height: '29px', background: '#E5E7EB', borderRadius: '5px', flexShrink: 0, marginRight: '10px' }} />
                    );
                    return (
                      <tr key={r} style={{ height: '29.75px', color: '#C3C8CD' }}>
                        <td colSpan={1} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: '#C3C8CD' }}>
                            {rect}
                            <span style={{ flex: 1 }}>{segVisible ? d.ent : ''}</span>
                          </div>
                        </td>
                        <td colSpan={1} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: '#C3C8CD', justifyContent: 'center' }}>{noPupilEye}</div>
                        </td>
                        <td colSpan={4} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: '#C3C8CD' }}>{segVisible ? d.nom : 'Nom'}</div>
                        </td>
                        <td colSpan={3} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: '#C3C8CD', whiteSpace: 'nowrap', letterSpacing: segVisible ? 'normal' : '2px', fontSize: segVisible ? '12pt' : '14pt', transform: `translateX(${SEG_SHIFT_X})` }}>{segVisible ? d.num : cardDots}</div>
                        </td>
                        <td colSpan={2} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: '#C3C8CD', whiteSpace: 'nowrap', letterSpacing: segVisible ? 'normal' : '2px', fontSize: segVisible ? '12pt' : '14pt', transform: `translateX(${SEG_SHIFT_X})` }}>{segVisible ? d.exp : '••/••'}</div>
                        </td>
                        <td colSpan={1} style={{ height: '29.75px', padding: 0 }}>
                          <div style={{ ...cellStyle, color: '#C3C8CD', whiteSpace: 'nowrap', letterSpacing: segVisible ? 'normal' : '2px', fontSize: segVisible ? '12pt' : '14pt', transform: `translateX(${SEG_SHIFT_X})` }}>{segVisible ? d.cvv : '•••'}</div>
                        </td>
                      </tr>
                    );
                  }
                  if (r === 9) {
                    return (
                      <tr key={r} style={{ height: '29.75px' }}>
                        <td colSpan={12} style={{ height: '29.75px', padding: 0 }} />
                      </tr>
                    );
                  }
                  if (r === 10) {
                    return (
                      <tr key={r} style={{ height: '29.75px' }}>
                        <td colSpan={4} style={{ height: '29.75px', padding: 0 }}>{headerNode('FORMATS', formatsOpen, () => setFormatsOpen(v => !v))}</td>
                        <td colSpan={2} style={{ height: '29.75px', padding: 0 }} />
                        <td colSpan={3} style={{ height: '29.75px', padding: 0 }}>{headerNode('MAILING', mailingOpen, () => setMailingOpen(v => !v))}</td>
                        <td colSpan={3} style={{ height: '29.75px', padding: 0 }}>{headerNode('DOBLE FACTOR', factorOpen, () => setFactorOpen(v => !v))}</td>
                      </tr>
                    );
                  }
                  if (r >= 11 && r <= 15) {
                    const i = r - 11;
                    return (
                      <tr key={r} style={{ height: anyBottomOpen ? '29.75px' : '0px' }}>
                        <td colSpan={4} style={{ height: anyBottomOpen ? '29.75px' : '0px', padding: 0 }}>{formatsOpen ? formatRows[i] : null}</td>
                        <td colSpan={2} style={{ height: anyBottomOpen ? '29.75px' : '0px', padding: 0 }} />
                        <td colSpan={3} style={{ height: anyBottomOpen ? '29.75px' : '0px', padding: 0 }}>{mailingOpen ? mailingRows[i] : null}</td>
                        <td colSpan={3} style={{ height: anyBottomOpen ? '29.75px' : '0px', padding: 0 }}>{factorOpen ? factorRows[i] : null}</td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={r} style={{ height: '29.75px' }}>
                      <td colSpan={4} style={{ height: '29.75px', padding: 0 }} />
                      <td colSpan={2} style={{ height: '29.75px', padding: 0 }} />
                      <td colSpan={3} style={{ height: '29.75px', padding: 0 }} />
                      <td colSpan={3} style={{ height: '29.75px', padding: 0 }} />
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'SEGURETAT' && (<>
        <div style={{
          width: '1365.46px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '-63.5px',
          position: 'relative',
          zIndex: 5,
          display: 'grid',
          rowGap: '3.05px',
        }}>
          <div style={{
            height: `${ROW_H}px`,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            columnGap: '7.5px',
          }}>
            <div style={{
              gridColumn: '2 / span 3',
              height: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateY(5px)',
              padding: '0 10px',
              fontFamily: 'Oswald, sans-serif',
              fontWeight: 300,
              fontSize: '9.5pt',
              letterSpacing: '0.03em',
              lineHeight: 1,
              color: '#474F58',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {SEG_LEGEND_ITEMS.map((t, i) => (
                <span key={i} style={{ marginRight: i < SEG_LEGEND_ITEMS.length - 1 ? '10px' : 0 }}>
                  <sup style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.7em', verticalAlign: 'baseline' }}>{i + 1}</sup>{t}
                </span>
              ))}
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            columnGap: '7.5px',
            transform: 'translateY(-0.5px)',
          }}>
            <div style={{
              gridColumn: '2 / span 2',
              height: `${ROW_H - 2}px`,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '7.5px',
            }}>
              {['REVERTEIX', 'CANCEL·LA', 'DESA'].map((label) => (
                <button key={label} style={{
                  ...HEAD,
                  fontFamily: 'Roboto Condensed, sans-serif',
                  fontSize: '11pt',
                  lineHeight: 1,
                  fontWeight: 500,
                  color: '#98A2B4',
                  backgroundColor: '#F4F6F8',
                  border: 'none',
                  borderRadius: '3px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  height: '100%',
                }}>
                  <span style={{ display: 'inline-block', position: 'relative', top: '1.25px' }}>{label}</span>
                </button>
              ))}
            </div>
            <button style={{
              ...HEAD,
              fontFamily: 'Roboto Condensed, sans-serif',
              fontSize: '11pt',
              lineHeight: 1,
              fontWeight: 500,
              color: '#FFFFFF',
              backgroundColor: '#FF0000',
              letterSpacing: '0.1em',
              border: 'none',
              borderRadius: '3px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              height: `${ROW_H - 2}px`,
            }}>
              <span style={{ display: 'inline-block', transform: 'translateY(0.75px)' }}>
                ESBORRA EL COMPTE<sup style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.7em', verticalAlign: 'baseline', position: 'relative', top: '-0.35em', marginLeft: '2px' }}>3</sup>
              </span>
            </button>
          </div>
        </div>
      </>)}

      {activeTab === 'MISSATGES' && (<>
        {/* 3. Taula (còpia de COMANDES) */}
        <style>{`
          .missatges-table { box-sizing: border-box; }
          .missatges-table th, .missatges-table td {
            overflow: hidden;
            box-sizing: border-box;
            position: relative;
          }
          .missatges-table th::after, .missatges-table td::after {
            content: '';
            position: absolute;
            inset: 0;
            border: 0.5px solid transparent;
            box-sizing: border-box;
            pointer-events: none;
            z-index: 10;
          }
          .missatges-table th > *, .missatges-table td > * { min-width: 0; max-width: 100%; }
          .msg-ph-wrap { position: relative; width: 100%; height: 100%; }
          .msg-ph-wrap .msg-ph {
            position: absolute; inset: 0;
            display: flex; align-items: center;
            padding: 0 10px;
            pointer-events: none;
            font-family: 'Roboto Condensed', sans-serif;
            font-weight: 400;
            font-size: 12pt;
            line-height: 1;
            color: #98A2B4;
          }
          .msg-ph-wrap .msg-ph > span { display: inline; }
          .msg-ph-wrap .msg-ph sup {
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
            font-size: 0.7em;
            vertical-align: baseline;
            position: relative;
            top: -0.35em;
          }
          .msg-ph-wrap input:focus ~ .msg-ph,
          .msg-ph-wrap input:not(:placeholder-shown) ~ .msg-ph,
          .msg-ph-wrap textarea:focus ~ .msg-ph,
          .msg-ph-wrap textarea:not(:placeholder-shown) ~ .msg-ph { display: none; }
          .msg-ph-wrap.msg-ph-top .msg-ph { align-items: flex-start; padding: 8px 10px; }
        `}</style>
        <div style={{
          width: '1365.46px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '-0.5px',
          position: 'relative',
          boxSizing: 'border-box',
          backgroundImage: 'url("/placeholders/fons_acordio/fons-usuari-missatges.png")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'top left',
          backgroundSize: '1365.46px 525.2px',
        }}>
          <div style={{ overflow: 'hidden' }}>
          <table className="missatges-table" style={{
            width: '1380.46px',
            marginLeft: '-7.5px',
            marginTop: '-2.8px',
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: '7.5px 2.8px',
          }}>
            <colgroup>
              <col style={{ width: '324px' }} />
              <col style={{ width: '324.5px' }} />
              <col style={{ width: '490.5px' }} />
              <col style={{ width: '158.5px' }} />
            </colgroup>
            <thead>
              <tr style={{ height: '30px' }}>
                <th colSpan={4} style={{ padding: 0, height: '30px', verticalAlign: 'middle' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '324px 324.5px 490.5px 158.5px',
                    columnGap: '7.5px',
                    width: '1365.46px',
                  }}>
                    {[0, 1].map((i) => {
                      const toggleMode = i === 0 ? 'comanda' : 'correu';
                      const toggleLabel = i === 0 ? 'AMB COMANDA' : 'SENSE COMANDA';
                      const isActive = contactMode === toggleMode;
                      return (
                        <button
                          key={`bot-row1-${i}`}
                          onClick={() => setContactMode(toggleMode)}
                          style={{
                            ...HEAD,
                            fontFamily: 'Roboto Condensed, sans-serif',
                            fontSize: '11pt',
                            fontWeight: isActive ? 600 : 300,
                            color: isActive ? '#3163B2' : '#474F58',
                            backgroundColor: '#FFFFFF',
                            border: isActive ? '2px solid #2F61B2' : '1px solid #989898',
                            borderRadius: '3px',
                            boxSizing: 'border-box',
                            cursor: 'pointer',
                            padding: 0,
                            height: '30px',
                            display: 'block',
                            transition: 'border-color 0.15s, border-width 0.15s, color 0.15s, font-weight 0.15s',
                          }}
                        >
                          {toggleLabel}
                        </button>
                      );
                    })}
                    {(() => {
                      const sortBtn = {
                        ...HEAD,
                        fontFamily: 'Roboto Condensed, sans-serif',
                        fontSize: '11pt',
                        fontWeight: 500,
                        color: '#475059',
                        backgroundColor: '#FFFFFF',
                        border: 'none',
                        borderBottom: '2px solid #98A2B4',
                        borderRadius: 0,
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                        padding: '0 10px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        userSelect: 'none',
                      };
                      return (
                        <>
                          <button
                            key="bot-row1-az"
                            onClick={() => setNameSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                            style={sortBtn}
                          >
                            <span>{nameSortDir === 'asc' ? 'A-Z' : 'Z-A'}</span>
                            {nameSortDir === 'asc'
                              ? <ChevronDown size={16} strokeWidth={1.5} style={{ color: '#7D8895' }} />
                              : <ChevronUp size={16} strokeWidth={1.5} style={{ color: '#7D8895' }} />}
                          </button>
                          <button
                            key="bot-row1-data"
                            onClick={() => setDateSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                            style={sortBtn}
                          >
                            <span>DATA</span>
                            {dateSortDir === 'asc'
                              ? <ChevronDown size={16} strokeWidth={1.5} style={{ color: '#7D8895' }} />
                              : <ChevronUp size={16} strokeWidth={1.5} style={{ color: '#7D8895' }} />}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {[...ORDERS, null, null, null].map((_, idx) => {
                const inputStyle = {
                  ...TEXT,
                  fontFamily: 'Roboto Condensed, sans-serif',
                  fontSize: '11pt',
                  color: '#475059',
                  backgroundColor: '#F8FAFC',
                  border: 'none',
                  borderRadius: '3px',
                  boxSizing: 'border-box',
                  padding: '0 10px',
                  width: '100%',
                  height: '30px',
                  display: 'block',
                  outline: 'none',
                };
                if (idx === 0) {
                  return (
                    <tr key={idx} style={{ height: '30px' }}>
                      <td style={{ height: '30px', padding: 0 }}>
                        <div className="msg-ph-wrap">
                          <input type="text" placeholder=" " style={inputStyle} />
                          <span className="msg-ph"><span>Nom<sup>1</sup></span></span>
                        </div>
                      </td>
                      <td style={{ height: '30px', padding: 0 }}>
                        <div className="msg-ph-wrap">
                          <input type="text" placeholder=" " style={inputStyle} />
                          <span className="msg-ph"><span>{contactMode === 'comanda' ? <>Nombre de comanda<sup>1</sup></> : <>eCorreu<sup>1</sup></>}</span></span>
                        </div>
                      </td>
                      <td style={{ height: '30px', padding: 0 }} />
                      <td style={{ height: '30px', padding: 0 }} />
                    </tr>
                  );
                }
                if (idx === 1) {
                  return (
                    <tr key={idx} style={{ height: '30px' }}>
                      <td colSpan={2} style={{ height: '30px', padding: 0 }}>
                        <div className="msg-ph-wrap">
                          <input type="text" placeholder=" " style={inputStyle} />
                          <span className="msg-ph"><span>Assumpte<sup>1</sup></span></span>
                        </div>
                      </td>
                      <td style={{ height: '30px', padding: 0 }} />
                      <td style={{ height: '30px', padding: 0 }} />
                    </tr>
                  );
                }
                // Files 4..(N-2): àrea de Missatge (rowSpan), cols 1+2.
                // Última fila (N-1): reservada per a la llegenda (encara per posar).
                const totalRows = ORDERS.length + 3; // 14 + 3 nulls = 17
                const lastIdx = totalRows - 1; // fila de botons
                const legendIdx = lastIdx - 1;
                const messageStart = 2;
                const messageEnd = legendIdx - 1; // fila just abans de la llegenda
                const messageRowSpan = messageEnd - messageStart + 1;
                if (idx === messageStart) {
                  return (
                    <tr key={idx} style={{ height: '30px' }}>
                      <td colSpan={2} rowSpan={messageRowSpan} style={{ height: `${messageRowSpan * 30 + (messageRowSpan - 1) * 2.8}px`, padding: 0, verticalAlign: 'top' }}>
                        <div className="msg-ph-wrap msg-ph-top">
                          <textarea placeholder=" " style={{
                            ...inputStyle,
                            backgroundColor: 'transparent',
                            height: '100%',
                            padding: '8px 10px',
                            resize: 'none',
                            lineHeight: 1.3,
                          }} />
                          <span className="msg-ph"><span>Missatge<sup>1</sup></span></span>
                        </div>
                      </td>
                      <td style={{ height: '30px', padding: 0 }} />
                      <td style={{ height: '30px', padding: 0 }} />
                    </tr>
                  );
                }
                if (idx > messageStart && idx <= messageEnd) {
                  return (
                    <tr key={idx} style={{ height: '30px' }}>
                      <td style={{ height: '30px', padding: 0 }} />
                      <td style={{ height: '30px', padding: 0 }} />
                    </tr>
                  );
                }
                if (idx === legendIdx) {
                  return (
                    <tr key={idx} style={{ height: '30px' }}>
                      <td colSpan={2} style={{ height: '30px', padding: 0 }}>
                        <div style={{
                          width: '100%',
                          height: '100%',
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 10px',
                          fontFamily: 'Oswald, sans-serif',
                          fontWeight: 300,
                          fontSize: '9.5pt',
                          letterSpacing: '0.05em',
                          lineHeight: 1,
                          color: '#474F58',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          <span><sup style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, fontSize: '0.7em', verticalAlign: 'baseline' }}>1</sup>Dades obligatòries per a la comunicació.</span>
                        </div>
                      </td>
                      <td style={{ height: '30px', padding: 0 }} />
                      <td style={{ height: '30px', padding: 0 }} />
                    </tr>
                  );
                }
                if (idx === lastIdx) {
                  const btnBase = {
                    ...HEAD,
                    fontFamily: 'Roboto Condensed, sans-serif',
                    fontSize: '11pt',
                    borderRadius: '3px',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                    padding: 0,
                    width: '100%',
                    height: '30px',
                    display: 'block',
                  };
                  const attachBtnStyle = {
                    ...btnBase,
                    fontWeight: 700,
                    color: '#2F61B2',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #2F61B2',
                  };
                  const sendBtnStyle = {
                    ...btnBase,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    backgroundColor: '#2F61B2',
                    border: 'none',
                  };
                  return (
                    <tr key={idx} style={{ height: '30px' }}>
                      <td style={{ height: '30px', padding: 0 }}>
                        <button style={attachBtnStyle}>ADJUNTA UN FITXER</button>
                      </td>
                      <td style={{ height: '30px', padding: 0 }}>
                        <button style={sendBtnStyle}>ENVIA EL MISSATGE</button>
                      </td>
                      <td style={{ height: '30px', padding: 0 }} />
                      <td style={{ height: '30px', padding: 0 }} />
                    </tr>
                  );
                }
                return (
                  <tr key={idx} style={{ height: '30px' }}>
                    <td style={{ height: '30px', padding: 0 }} />
                    <td style={{ height: '30px', padding: 0 }} />
                    <td style={{ height: '30px', padding: 0 }} />
                    <td style={{ height: '30px', padding: 0 }} />
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

      </>)}

      {activeTab === 'COMANDES' && (<>

      {/* 3. Taula */}
      <style>{`
        .comandes-table { box-sizing: border-box; }
        .comandes-table th, .comandes-table td {
          overflow: hidden;
          box-sizing: border-box;
        }
        .comandes-table th > *, .comandes-table td > * { min-width: 0; max-width: 100%; }
      `}</style>
      <div style={{ width: '1365.46px', marginLeft: 'auto', marginRight: 'auto', marginTop: '-0.5px', overflow: 'hidden', position: 'relative', backgroundImage: 'url("/placeholders/fons_acordio/fons-usuari-comandes.png")', backgroundRepeat: 'no-repeat', backgroundPosition: 'top left', backgroundSize: '1365.46px 100%' }}>
        <table className="comandes-table" style={{
          width: '1380.46px',
          marginLeft: '-7.5px',
          marginTop: '-2.8px',
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          borderSpacing: '7.5px 2.8px',
        }}>
        <colgroup>
          <col style={{ width: '324px' }} />
          <col style={{ width: '324.5px' }} />
          <col style={{ width: '158.5px' }} />
          <col style={{ width: '158.5px' }} />
          <col style={{ width: '324.5px' }} />
        </colgroup>
        <thead>
          <tr style={{ height: '30px' }}>
            {['COMANDA', 'ESTAT', 'DATA', 'TOT PLEGAT', 'EN DETALL'].map((h, i) => {
              const sortable = h !== 'EN DETALL';
              return (
              <th
                key={h}
                onClick={sortable ? () => toggleSort(h) : undefined}
                onMouseEnter={sortable ? (e) => { e.currentTarget.style.backgroundColor = '#EEF1F5'; } : undefined}
                onMouseLeave={sortable ? (e) => { e.currentTarget.style.backgroundColor = 'transparent'; } : undefined}
                style={{
                  ...HEAD,
                  fontSize: '11pt',
                  height: '30px',
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  textIndent: '0.4px',
                  borderBottom: '1px solid #ccc',
                  padding: 0,
                  fontWeight: 500,
                  position: 'relative',
                  cursor: sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  transition: 'background-color 120ms ease',
                }}
              >
                {h}
                {sortable && (
                  <span style={{ position: 'absolute', right: '1em', top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', alignItems: 'center', lineHeight: 1, pointerEvents: 'none' }}>
                    {sortDirs[h] === 'asc'
                      ? <ChevronDown size={16} strokeWidth={1.5} style={{ color: '#7D8895' }} />
                      : <ChevronUp size={16} strokeWidth={1.5} style={{ color: '#7D8895' }} />}
                  </span>
                )}
              </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {ORDERS.map((o, idx) => {
            const Icon = o.icon;
            const isStruck = o.status === 'CANCEL·LADA' || o.status === 'ATURADA';
            const opacity = o.active ? 1 : (isStruck ? 0.7 : 0.35);
            const rowColor = o.active ? '#2F61B2' : '#99A3B5';
            return (
              <React.Fragment key={idx}>
                <tr style={{ height: '30px', ...(rowColor ? { color: rowColor } : null) }}>
                  <td style={{ height: '30px', padding: '0 8px 0 30px', verticalAlign: 'middle', opacity }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: rowColor,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '12pt', marginLeft: '23px', letterSpacing: '1px' }}>{o.num}</span>
                    </div>
                  </td>
                  <td style={{ height: '30px', padding: '0 8px 0 123px', verticalAlign: 'middle', opacity, color: isStruck ? '#475059' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon size={21} strokeWidth={2} style={{ color: isStruck ? '#475059' : rowColor, position: 'relative', left: '-25px' }} />
                      <span style={{ fontSize: '12pt' }}>{o.status}</span>
                    </div>
                  </td>
                  <td style={{ height: '30px', padding: 0, textAlign: 'center', verticalAlign: 'middle', fontSize: '12pt', opacity }}>
                    {o.date}
                  </td>
                  <td style={{ height: '30px', padding: 0, textAlign: 'center', verticalAlign: 'middle', fontSize: '12pt', opacity, textDecoration: isStruck ? 'line-through' : 'none', textDecorationColor: isStruck ? '#475059' : undefined, textDecorationThickness: isStruck ? '1.5px' : undefined }}>
                    {o.total}
                  </td>
                  <td style={{ height: '30px', padding: 0 }} />
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
        </table>
      </div>

      {/* Espai d'una fila abans de la llegenda */}
      <div style={{ height: `${ROW_H}px` }} />

      {/* 4. Llegenda */}
      <div style={{ width: '1365.46px', marginLeft: 'auto', marginRight: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '7.5px' }}>
      <div style={{
        gridColumn: '2 / span 2',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: `${ROW_H}px`,
        width: '640px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 0,
      }}>
        {LEGEND.map(({ label, icon: Icon }) => (
          <div key={label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            ...HEAD,
            fontFamily: 'Oswald, sans-serif',
            fontSize: '7.5pt',
            fontWeight: 300,
            letterSpacing: '0em',
            color: '#475059',
            whiteSpace: 'nowrap',
          }}>
            <Icon size={12} strokeWidth={2} style={{ color: '#1E62B8' }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      </div>

      {/* 5. Botonera central (REVERTEIX / CANCEL·LA / DESA) */}
      <div style={{
        width: '1365.46px',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        columnGap: '7.5px',
      }}>
        <div style={{
          gridColumn: '2 / span 2',
          height: `${ROW_H - 2}px`,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '7.5px',
        }}>
          {['REVERTEIX', 'CANCEL·LA', 'DESA'].map((label) => (
            <button key={label} style={{
              ...HEAD,
              fontFamily: 'Roboto Condensed, sans-serif',
              fontSize: '11pt',
              fontWeight: 500,
              color: '#98A2B4',
              backgroundColor: '#F4F6F8',
              border: 'none',
              borderRadius: '3px',
              boxSizing: 'border-box',
              cursor: 'pointer',
              padding: 0,
              height: '100%',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      </>)}

      {false && activeTab === 'SEGURETAT' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/tmp/PAUTES/PAUTA-GENERAL.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '0 -1px',
          backgroundSize: '1365.46px 737.015px',
          opacity: 0.05,
          filter: 'hue-rotate(-120deg) saturate(3)',
          pointerEvents: 'none',
          zIndex: -1,
        }} />
      )}
    </div>
  );
}

export default UserComandesContent;
