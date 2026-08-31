import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import TdpConstructorProduct from '@/components/tdp/TdpConstructorProduct';
import { getSafeBelt } from '@/utils/layoutMetrics';

const PAUTA_ROWS = 33;
const PAUTA_COLS = 3;
const PAUTA_GUTTER_X = '22.5px';
const PAUTA_GUTTER_Y = '3px';
const PAUTA_FIRST_ROW_SCALE = 0.7;
const PAUTA_FIRST_ROW_EXTRA_PX = 4;
const PAUTA_ROWS_TEMPLATE = `minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, ${PAUTA_FIRST_ROW_SCALE}fr) repeat(${PAUTA_ROWS - 1}, minmax(${PAUTA_FIRST_ROW_EXTRA_PX}px, 1fr))`;
const PAUTA_COLUMNS_TEMPLATE = 'repeat(3, minmax(0, calc((100% - 45px) / 3)))';
const TDP_PAGE_TOP_OFFSET = '33px';
const TDP_PAGE_LEFT_OFFSET = '0px';
const tdpEditableDescription = [
  "Mereixedors són d'honor, glòria e de fama e contínua bona memòria los ",
  'hòmens virtuosos, e singularment aquells qui per la república lluitaren.',
].join('\n');

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    const belt = getSafeBelt({ maxContent: 1350, sideMargin: 16, minContent: 320 });
    document.documentElement.style.setProperty('--hg-tdp-xL', `${belt.left}px`);
    document.documentElement.style.setProperty('--hg-tdp-xR', `${belt.right}px`);
  } catch (_) {}
}


function TdpPage({ pautaEnabled = false, tableEnabled = false }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const pautaRows = useMemo(
    () => Array.from({ length: PAUTA_ROWS }, (_, index) => index + 1),
    []
  );
  const pautaCells = useMemo(
    () => Array.from({ length: PAUTA_ROWS * PAUTA_COLS }, (_, index) => ({
      row: Math.floor(index / PAUTA_COLS) + 1,
      col: (index % PAUTA_COLS) + 1,
    })),
    []
  );

  const pautaFrameStyle = {
    position: 'absolute',
    left: '50%',
    top: TDP_PAGE_TOP_OFFSET,
    bottom: 0,
    width: 'calc(var(--belt2-xR, var(--hg-tdp-xR, 100vw)) - var(--belt2-xL, var(--hg-tdp-xL, 0px)))',
    transform: `translateX(calc(-50% + ${TDP_PAGE_LEFT_OFFSET}))`,
  };

  const pautaGridStyle = {
    position: 'relative',
    display: 'grid',
    height: '100%',
    gridTemplateColumns: PAUTA_COLUMNS_TEMPLATE,
    gridTemplateRows: PAUTA_ROWS_TEMPLATE,
    columnGap: PAUTA_GUTTER_X,
    rowGap: PAUTA_GUTTER_Y,
  };

  const pautaRowTrackStyle = {
    position: 'absolute',
    left: 'calc((100% - 45px) / 3 + 11.25px - 12px)',
    top: 0,
    bottom: 0,
    width: '24px',
    display: 'grid',
    gridTemplateRows: PAUTA_ROWS_TEMPLATE,
    rowGap: PAUTA_GUTTER_Y,
    zIndex: 4,
  };


  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const root = document.documentElement;

    const apply = () => {
      const belt = getSafeBelt({ maxContent: 1350, sideMargin: 16, minContent: 320 });
      root.style.setProperty('--hg-tdp-xL', `${belt.left}px`);
      root.style.setProperty('--hg-tdp-xR', `${belt.right}px`);
    };

    apply();

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
      root.style.removeProperty('--hg-tdp-xL');
      root.style.removeProperty('--hg-tdp-xR');
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-background">
      <Helmet>
        <title>TDP | Higgins Gràfic</title>
        <meta name="description" content="Pàgina de prova per visualitzar una Targeta de Producte." />
      </Helmet>

      <div
        style={{
          position: 'relative',
          left: '50%',
          width: 'calc(var(--belt2-xR, var(--hg-tdp-xR, 100vw)) - var(--belt2-xL, var(--hg-tdp-xL, 0px)))',
          transform: `translateX(calc(-50% + ${TDP_PAGE_LEFT_OFFSET}))`,
          paddingTop: TDP_PAGE_TOP_OFFSET,
          paddingBottom: '64px',
        }}
      >
        {pautaEnabled ? (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 'calc((100% - 45px) / 3 + 11.25px - 12px)',
              top: TDP_PAGE_TOP_OFFSET,
              bottom: '64px',
              width: '24px',
              display: 'grid',
              gridTemplateRows: PAUTA_ROWS_TEMPLATE,
              rowGap: PAUTA_GUTTER_Y,
              zIndex: 4,
              pointerEvents: 'none',
            }}
          >
            {pautaRows.map((rowNumber) => (
              <div
                key={`tdp-pauta-row-${rowNumber}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(71, 80, 89, 0.58)',
                  fontFamily: 'Roboto Condensed, sans-serif',
                  fontSize: '10px',
                  lineHeight: 1,
                }}
              >
                {rowNumber}
              </div>
            ))}
          </div>
        ) : null}

        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: PAUTA_COLUMNS_TEMPLATE,
            gridTemplateRows: PAUTA_ROWS_TEMPLATE,
            columnGap: PAUTA_GUTTER_X,
            rowGap: PAUTA_GUTTER_Y,
          }}
        >
          {tableEnabled ? (
            <>
              {['COL 1', 'COL 2', 'COL 3'].map((label, index) => (
                <div
                  key={label}
                  style={{
                    gridColumn: `${index + 1} / ${index + 2}`,
                    gridRow: '1 / -1',
                    position: 'relative',
                    backgroundColor: index === 0 ? 'rgba(249, 115, 22, 0.045)' : index === 1 ? 'rgba(14, 165, 233, 0.045)' : 'rgba(16, 185, 129, 0.045)',
                    borderLeft: '1px solid rgba(71, 80, 89, 0.14)',
                    borderRight: '1px solid rgba(71, 80, 89, 0.14)',
                    zIndex: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '-22px',
                      left: 0,
                      padding: '2px 6px',
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      border: '1px solid rgba(71, 80, 89, 0.18)',
                      color: '#475059',
                      fontFamily: 'Roboto Condensed, sans-serif',
                      fontSize: '11px',
                      lineHeight: 1,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
              {pautaCells.map(({ row, col }) => (
                <div
                  key={`tdp-pauta-${col}-${row}`}
                  style={{
                    gridColumn: `${col} / ${col + 1}`,
                    gridRow: `${row} / ${row + 1}`,
                    border: '1px solid rgba(31, 124, 255, 0.35)',
                    backgroundColor: 'rgba(31, 124, 255, 0.06)',
                    boxSizing: 'border-box',
                    zIndex: 1,
                  }}
                />
              ))}
            </>
          ) : null}

          <TdpConstructorProduct
            gridColumn="1 / 2"
            productName="NOM DE PRODUCTE"
            description={tdpEditableDescription}
            price="15,50€"
            imageSrc="/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png"
            imageAlt="Samarreta blanca Gildan 64000"
            sizes={sizes}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            cartCount={0}
            onAddToCart={() => {}}
            gutterY={PAUTA_GUTTER_Y}
            editableIdPrefix="tdp-copy-col1"
            copyMode
            variant="v4"
          />

          <TdpConstructorProduct
            gridColumn="2 / 3"
            productName="NOM DE PRODUCTE"
            description={tdpEditableDescription}
            price="15,50€"
            imageSrc="/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png"
            imageAlt="Samarreta blanca Gildan 64000"
            sizes={sizes}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            cartCount={0}
            onAddToCart={() => {}}
            gutterY={PAUTA_GUTTER_Y}
            editableIdPrefix="tdp"
          />

          <TdpConstructorProduct
            gridColumn="3 / 4"
            productName="NOM DE PRODUCTE"
            description={tdpEditableDescription}
            price="15,50€"
            imageSrc="/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png"
            imageAlt="Samarreta blanca Gildan 64000"
            sizes={sizes}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
            cartCount={0}
            onAddToCart={() => {}}
            gutterY={PAUTA_GUTTER_Y}
            editableIdPrefix="tdp-copy-col3"
            copyMode
            variant="v4"
          />

        </div>
      </div>
    </main>
  );
}

export default TdpPage;
