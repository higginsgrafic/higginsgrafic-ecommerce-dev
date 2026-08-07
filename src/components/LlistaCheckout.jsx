import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatPrice } from '@/utils/formatters';
import { useShippingCosts } from '@/hooks/useShippingCosts';

const PAUTA_ROWS = 33;
const PAUTA_FIRST_ROW_SCALE = 0.7;
const PAUTA_FIRST_ROW_EXTRA_PX = 4;
const PAUTA_TOTAL_WEIGHT = PAUTA_FIRST_ROW_SCALE + (PAUTA_ROWS - 1);
const PAUTA_ROWS_TEMPLATE = `minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, ${PAUTA_FIRST_ROW_SCALE}fr) repeat(${PAUTA_ROWS - 1}, minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, 1fr))`;
const PAUTA_OTHER_ROW_PERCENT = (1 / PAUTA_TOTAL_WEIGHT) * 100;
const PAUTA_OTHER_ROW_COMP_PX = PAUTA_FIRST_ROW_EXTRA_PX / (PAUTA_ROWS - 1);
const PAUTA_FIRST_ROW_PERCENT = (PAUTA_FIRST_ROW_SCALE / PAUTA_TOTAL_WEIGHT) * 100;
const PAUTA_ROWS_TEMPLATE_2 = `minmax(0, calc(${PAUTA_FIRST_ROW_PERCENT}% + ${PAUTA_FIRST_ROW_EXTRA_PX}px)) repeat(${PAUTA_ROWS - 1}, minmax(0, calc(${PAUTA_OTHER_ROW_PERCENT}% - ${PAUTA_OTHER_ROW_COMP_PX}px)))`;
const CHECKOUT_PAGE_TOP_OFFSET = '32px';
const CHECKOUT_PAGE_LEFT_OFFSET = '-17px';

const PRODUCT_TABLE_MIN_ROWS = 5;
const PRODUCT_TABLE_MAX_ROWS = 20;

const LlistaCheckout = ({ items, onBreadcrumbClick }) => {
  const productTableRef = useRef(null);
  const scrollViewportRef = useRef(null);
  const [scrollRow, setScrollRow] = useState(0);
  const [productTableHeight, setProductTableHeight] = useState(0);

  const checkoutRenderItems = useMemo(() => items, [items]);
  const visibleProductRows = Math.min(Math.max(checkoutRenderItems.length, PRODUCT_TABLE_MIN_ROWS), PRODUCT_TABLE_MAX_ROWS);

  useEffect(() => {
    const el = scrollViewportRef.current;
    if (!el) return;
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const dir = e.deltaY > 0 ? 1 : -1;
      setScrollRow(prev => {
        const maxRow = Math.max(0, checkoutRenderItems.length - visibleProductRows);
        return Math.max(0, Math.min(maxRow, prev + dir));
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [checkoutRenderItems.length, visibleProductRows]);

  const productTableStartRow = 4;
  const totalsStartRow = productTableStartRow + visibleProductRows - 1;
  const productTableEndRow = totalsStartRow;

  useLayoutEffect(() => {
    if (productTableRef.current) {
      const h = productTableRef.current.clientHeight;
      setProductTableHeight(h);
    }
  }, [visibleProductRows, checkoutRenderItems.length]);

  const { getCost, zoneInfo } = useShippingCosts('es_peninsula');
  const subtotal = checkoutRenderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = getCost(subtotal);
  const total = subtotal + shipping;
  const ivaAmount = subtotal * 0.21;
  const displayPrice = (value) => formatPrice(value).replace(/\u00a0/g, ' ').replace(/\s+/g, '').replace(/\s*€\s*$/, '€');

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `calc(var(--belt2-xL, 0px) + ${CHECKOUT_PAGE_LEFT_OFFSET})`,
          top: CHECKOUT_PAGE_TOP_OFFSET,
          width: 'calc(var(--belt2-xR, 100vw) - var(--belt2-xL, 0px))',
          transform: 'translateX(40px)',
          zIndex: 5,
          pointerEvents: 'auto',
        }}
      >
        <Breadcrumbs items={[{ label: 'Cistell', onClick: onBreadcrumbClick }, { label: 'Checkout' }]} />
      </div>

      <div
        aria-hidden="true"
        style={{
          display: 'none',
          position: 'absolute',
          left: `calc(var(--belt2-xL, 0px) + ${CHECKOUT_PAGE_LEFT_OFFSET})`,
          top: CHECKOUT_PAGE_TOP_OFFSET,
          width: 'calc(var(--belt2-xR, 100vw) - var(--belt2-xL, 0px))',
          height: 'calc(var(--belt2-yB, 100vh) - var(--belt2-yT, 0px))',
          backgroundImage: 'url(/tmp/CHECKOUT-V1.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
          backgroundSize: '100% 100%',
          opacity: 0.4,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: `calc(var(--belt2-xL, 0px) + ${CHECKOUT_PAGE_LEFT_OFFSET})`,
          top: CHECKOUT_PAGE_TOP_OFFSET,
          width: 'calc(var(--belt2-xR, 100vw) - var(--belt2-xL, 0px))',
          height: 'calc(var(--belt2-yB, 100vh) - var(--belt2-yT, 0px))',
          display: 'grid',
          position: 'absolute',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: PAUTA_ROWS_TEMPLATE,
          columnGap: '45px',
          rowGap: '3px',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 'calc((100% - 45px) / 2 + 22.5px)',
            backgroundColor: '#fff',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'grid',
            gridTemplateColumns: 'calc(50% - 3.75px) repeat(3, minmax(0, 1fr))',
            gridTemplateRows: PAUTA_ROWS_TEMPLATE_2,
            columnGap: '7.5px',
            rowGap: '3px',
            width: 'calc((100% - 45px) / 2 + 22.5px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'none',
              gridTemplateColumns: 'calc(50% - 3.75px) repeat(3, minmax(0, 1fr))',
              gridTemplateRows: PAUTA_ROWS_TEMPLATE_2,
              columnGap: '7.5px',
              rowGap: '3px',
              zIndex: 0,
            }}
          >
            {Array.from({ length: 33 }).flatMap((_, rowIndex) => {
              const rowNumber = rowIndex + 1;
              if (rowNumber === 5) return [];
              if (rowNumber === 7) return [];
              if (rowNumber === 29) {
                return (
                  <div
                    key="empty-table-bg-cell-29-full"
                    style={{
                      gridColumn: '1 / 5',
                      gridRow: '29 / 30',
                      backgroundColor: 'rgba(0, 166, 81, 0.18)',
                      boxSizing: 'border-box',
                    }}
                  />
                );
              }
              if (rowNumber === 3) {
                return (
                  <div
                    key="empty-table-bg-cell-3-full"
                    style={{
                      gridColumn: '1 / 5',
                      gridRow: '3 / 4',
                      backgroundColor: 'rgba(0, 166, 81, 0.18)',
                      boxSizing: 'border-box',
                    }}
                  />
                );
              }
              return Array.from({ length: 4 }).map((__, colIndex) => (
                rowNumber >= 30 && (colIndex === 1 || colIndex === 2) ? null : (
                  <div
                    key={`empty-table-bg-cell-${rowNumber}-${colIndex + 1}`}
                    style={{
                      gridColumn: rowNumber >= 30 && colIndex === 0 ? '1 / 4' : `${colIndex + 1} / ${colIndex + 2}`,
                      gridRow: rowNumber === 4 ? '4 / 6' : rowNumber === 6 ? '6 / 8' : `${rowNumber} / ${rowNumber + 1}`,
                      backgroundColor: 'rgba(0, 166, 81, 0.18)',
                      boxSizing: 'border-box',
                    }}
                  />
                )
              ));
            })}
          </div>
          <div
            aria-hidden="true"
            style={{
              display: 'none',
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: '#00a651',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <div
            style={{
              gridColumn: '1 / 2',
              gridRow: '3 / 4',
              display: 'flex',
              alignItems: 'center',
              color: '#495058',
              fontFamily: 'Oswald, sans-serif',
              fontSize: '16pt',
              fontWeight: 300,
              textTransform: 'uppercase',
              transform: 'translateY(0px) translateX(40px)',
              zIndex: 2,
            }}
          >
            PRODUCTES
          </div>
          {['TALLATGE', 'QUANTITAT', 'IMPORT'].map((label, index) => (
            <div
              key={`product-table-heading-${label}`}
              style={{
                gridColumn: `${2 + index} / ${3 + index}`,
                gridRow: '3 / 4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateY(0px)${label === 'IMPORT' ? ' translateX(5px)' : label === 'QUANTITAT' ? ' translateX(4px)' : ''}`,
                color: '#495058',
                fontFamily: 'Oswald, sans-serif',
                fontSize: '16pt',
                fontWeight: 300,
                textTransform: 'uppercase',
                zIndex: 2,
              }}
            >
              {label}
            </div>
          ))}
          <div
            ref={productTableRef}
            data-checkout-table="true"
            style={{
              gridColumn: '1 / 5',
              gridRow: `${productTableStartRow} / ${productTableEndRow}`,
              position: 'relative',
              marginTop: '0px',
              marginLeft: '38.5px',
              marginRight: '4px',
              overflow: 'hidden',
              pointerEvents: 'auto',
              zIndex: 2,
            }}
          >
            <div
              ref={scrollViewportRef}
              style={{
                position: 'relative',
                height: `calc(${visibleProductRows} * 35.1px + ${visibleProductRows - 1} * 3px)`,
                overflow: 'hidden',
              }}
            >
              {/* Fons fixe: grid no scrollable */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  display: 'grid',
                  gridTemplateColumns: 'calc(50% - 3.75px) repeat(3, minmax(0, 1fr))',
                  gridAutoRows: '35.1px',
                  columnGap: '7.5px',
                  rowGap: '3px',
                  zIndex: 0,
                }}
              >
                {Array.from({ length: visibleProductRows }).map((_, rowIndex) => (
                  <div
                    key={`product-table-row-bg-${rowIndex + 1}`}
                    style={{
                      gridColumn: '1 / 5',
                      gridRow: `${rowIndex + 1} / ${rowIndex + 2}`,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'url(/placeholders/fons_acordio/fons-una-fila.png)',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center center',
                        backgroundSize: '100% 100%',
                        transform: (rowIndex + 1) % 2 === 0 ? 'scaleX(-1)' : 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* Text: renderitza només les files visibles segons scrollRow */}
              <div
                style={{
                  position: 'relative',
                  height: '100%',
                  overflow: 'hidden',
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'calc(50% - 3.75px) repeat(3, minmax(0, 1fr))',
                    gridAutoRows: '35.1px',
                    columnGap: '7.5px',
                    rowGap: '3px',
                  }}
                >
            {checkoutRenderItems.slice(scrollRow, scrollRow + visibleProductRows).flatMap((item, visualRowIndex) => (
              [
                <div
                  key={`product-table-row-spacer-${scrollRow + visualRowIndex + 1}`}
                  style={{
                    gridColumn: '1 / 5',
                    gridRow: `${visualRowIndex + 1} / ${visualRowIndex + 2}`,
                  }}
                />,
                ...[
                  item.name,
                  item.size || '—',
                  String(item.quantity || 1),
                  displayPrice((item.price || 0) * (item.quantity || 1)),
                ].map((label, index) => (
                  <div
                    key={`product-table-row-${scrollRow + visualRowIndex + 1}-${index}`}
                    style={{
                      gridColumn: `${index + 1} / ${index + 2}`,
                      gridRow: `${visualRowIndex + 1} / ${visualRowIndex + 2}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: index === 0 ? 'flex-start' : 'center',
                      transform: index === 2 ? 'translateX(4px)' : 'none',
                      color: '#4A5057',
                      fontFamily: 'Roboto Condensed, sans-serif',
                      fontSize: '14pt',
                      fontWeight: index === 3 ? 200 : 300,
                      textTransform: 'uppercase',
                    }}
                  >
                    {index === 3 ? (
                      <span
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto auto',
                          width: '54px',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ textAlign: 'right' }}>{label.replace('€', '').split(',')[0]}</span>
                        <span>,</span>
                        <span>{label.replace('€', '').split(',')[1]}€</span>
                      </span>
                    ) : index === 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '28px',
                              height: '28px',
                              objectFit: 'cover',
                              borderRadius: '2px',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span>{label}</span>
                      </div>
                    ) : label}
                  </div>
                ))
              ]
            ))}
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            style={{
              gridColumn: '1 / 5',
              gridRow: '3 / 4',
              alignSelf: 'end',
              height: '2px',
              width: 'calc(100% - 45px)',
              backgroundColor: '#DEDFE1',
              transform: 'translateY(0px) translateX(40px)',
              zIndex: 3,
            }}
          />
          <div
            style={{
              gridColumn: '1 / 5',
              gridRow: `${totalsStartRow} / ${totalsStartRow + 5}`,
              position: 'relative',
              transform: 'translateX(-5px) translateY(6px)',
              zIndex: 3,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '40px',
                right: 0,
                top: 0,
                height: '2px',
                backgroundColor: '#DEDFE1',
                zIndex: 3,
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundImage: 'url(/placeholders/fons_acordio/fons-una-fila.png)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundSize: '100% 100%',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'calc(50% - 3.75px) repeat(3, minmax(0, 1fr))',
                gridAutoRows: '35.1px',
                columnGap: '7.5px',
                rowGap: '3px',
                width: '100%',
                height: '100%',
                zIndex: 2,
              }}
            >
              <div style={{ gridColumn: '1 / 5', gridRow: '1 / 2' }} />
              {[
                ['SUBTOTAL', displayPrice(subtotal), false],
                ['TRANSPORT', displayPrice(zoneInfo.cost), true],
                ['IVA 21%', displayPrice(ivaAmount), false],
                ['TOT PLEGAT FA', displayPrice(total), false],
              ].flatMap(([label, amount, strikeAmount], index) => ([
                <div
                  key={`totals-label-${index}`}
                  style={{
                    gridColumn: '2 / 4',
                    gridRow: `${index + 2} / ${index + 3}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    paddingRight: 'calc(12% + 3.75px)',
                    color: '#4A5057',
                    fontFamily: 'Roboto Condensed, sans-serif',
                    fontSize: '16pt',
                    fontWeight: label === 'TOT PLEGAT FA' ? 400 : 300,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </div>,
                <div
                  key={`totals-amount-${index}`}
                  style={{
                    gridColumn: '4 / 5',
                    gridRow: `${index + 2} / ${index + 3}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    transform: 'translateX(-4px)',
                    color: '#4A5057',
                    fontFamily: 'Roboto Condensed, sans-serif',
                    fontSize: '16pt',
                    fontWeight: label === 'TOT PLEGAT FA' ? 400 : 300,
                    textTransform: 'uppercase',
                    textDecoration: strikeAmount ? 'line-through' : 'none',
                  }}
                >
                  <span
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      width: '88px',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    <span style={{ textAlign: 'right' }}>{amount.replace('€', '').split(',')[0]}</span>
                    <span>,</span>
                    <span>{amount.replace('€', '').split(',')[1]}€</span>
                  </span>
                </div>,
              ]))}
            </div>
          </div>
        </div>
        {Array.from({ length: PAUTA_ROWS * 2 }).map((_, idx) => (
          <div
            key={`pauta-grid-${idx}`}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              boxSizing: 'border-box',
            }}
          />
        ))}
      </div>
    </>
  );
};

export default LlistaCheckout;
