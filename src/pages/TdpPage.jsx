import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import ProductTdpCard from '@/components/ProductTdpCard';
import EditableTextBox from '@/components/dev/EditableTextBox';
import { getSafeBelt } from '@/utils/layoutMetrics';
import { placeholderTruncate, PLACEHOLDER_PARAGRAPHS } from '@/utils/placeholderText';

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
const tdpMockDescription = placeholderTruncate(PLACEHOLDER_PARAGRAPHS[0], 160);
const tdpEditableDescription = [
  "Mereixedors són d'honor, glòria e de fama",
  'e contínua bona memòria los hòmens',
  'virtuosos, e singularment aquells qui per',
  'la república lluitaren.',
].join('\n');

const getTdpCartIconSrc = (count) => {
  if (count >= 2) return '/custom_logos/icons/v3-ple-2.svg';
  if (count === 1) return '/custom_logos/icons/v3-ple-1.svg';
  return '/custom_logos/icons/v3-buit.svg';
};

function TdpPage({ pautaEnabled = false, tableEnabled = false }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [sizeButtonTextSettings, setSizeButtonTextSettings] = useState({
    fontFamily: 'Oswald',
    fontSize: 20,
    fontWeight: 300,
    selectedFontWeight: 700,
    letterSpacing: 0,
    lineHeight: 1,
  });
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

  const pautaButtonGroupStyle = {
    gridColumn: '2 / 3',
    gridRow: '20 / 21',
    alignSelf: 'stretch',
    justifySelf: 'stretch',
    pointerEvents: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    columnGap: '5px',
    height: `calc(100% + ${PAUTA_GUTTER_Y} + ${PAUTA_GUTTER_Y})`,
    marginTop: `calc(-1 * ${PAUTA_GUTTER_Y})`,
    position: 'relative',
    overflow: 'visible',
    zIndex: 2,
  };

  const pautaPriceCartStyle = {
    gridColumn: '2 / 3',
    gridRow: '19 / 20',
    alignSelf: 'stretch',
    justifySelf: 'stretch',
    pointerEvents: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    columnGap: '5px',
    height: '100%',
    transform: 'translateY(calc(-50% - 1.5px))',
    zIndex: 3,
  };

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const root = document.documentElement;

    const apply = () => {
      const belt = getSafeBelt({ maxContent: 1400, sideMargin: 76, minContent: 320 });
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

          <EditableTextBox
            id="tdp-product-name-layout-v2"
            initialText="NOM DE PRODUCTE"
            initialSettings={{
              fontFamily: 'Oswald',
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 0.04,
              lineHeight: 1,
              textAlign: 'center',
              color: '#475059',
              textTransform: 'uppercase',
            }}
            style={{
              gridColumn: '2 / 3',
              gridRow: '12 / 14',
              alignSelf: 'center',
              justifySelf: 'center',
              zIndex: 5,
              width: '100%',
            }}
          />

          <EditableTextBox
            id="tdp-product-description-layout-v2"
            initialText={tdpEditableDescription}
            initialSettings={{
              fontFamily: 'Roboto',
              fontSize: 34,
              fontWeight: 300,
              letterSpacing: -0.03,
              lineHeight: 1.15,
              textAlign: 'left',
              color: '#111827',
            }}
            multiline
            style={{
              gridColumn: '2 / 3',
              gridRow: '13 / 18',
              zIndex: 5,
              width: '100%',
              height: '100%',
            }}
          />

          <div style={pautaPriceCartStyle}>
            <EditableTextBox
              id="tdp-price-centered-v2"
              initialText="15,50€"
              initialSettings={{
                fontFamily: 'Oswald',
                fontSize: 24,
                fontWeight: 300,
                letterSpacing: 0,
                lineHeight: 1,
                textAlign: 'center',
                color: '#475059',
              }}
              style={{
                gridColumn: '1 / 2',
                alignSelf: 'center',
                justifySelf: 'stretch',
                zIndex: 1,
                width: '100%',
                height: '100%',
              }}
            />
            <div className="col-start-5 flex items-center justify-center" style={{ zIndex: 1, transform: 'translateY(-2.5px)' }}>
              <button
                type="button"
                onClick={() => {}}
                aria-label="Afegir al cistell"
                className="relative flex items-center justify-center bg-transparent p-0 transition-transform duration-200 active:scale-95"
                style={{
                  width: '36.1984px',
                  height: '36.1984px',
                }}
              >
                <img
                  src={getTdpCartIconSrc(0)}
                  alt=""
                  aria-hidden="true"
                  draggable="false"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </button>
            </div>
          </div>

          <div style={{ ...pautaButtonGroupStyle, isolation: 'isolate' }}>
            {sizes.map((size) => (
              <div
                key={`pauta-size-${size}`}
                className="h-full overflow-visible"
              >
                <button
                  onClick={() => setSelectedSize(size)}
                  className={`relative flex h-full w-full items-center justify-center overflow-visible transition-all duration-200 active:scale-95 ${selectedSize === size ? 'bg-[#475059] text-whiteStrong' : 'bg-muted text-[#475059] hover:text-muted-foreground'}`}
                  style={{
                    borderRadius: 'clamp(2.81px, 0.8vw, 5.06px)',
                    fontFamily: `${sizeButtonTextSettings.fontFamily}, sans-serif`,
                    fontSize: `${sizeButtonTextSettings.fontSize}pt`,
                    fontWeight: selectedSize === size ? sizeButtonTextSettings.selectedFontWeight : sizeButtonTextSettings.fontWeight,
                    letterSpacing: `${sizeButtonTextSettings.letterSpacing}em`,
                    height: '100%',
                    lineHeight: sizeButtonTextSettings.lineHeight,
                  }}
                >
                  {size}
                </button>
              </div>
            ))}
            <EditableTextBox
              id="tdp-size-buttons-text-grid-v2"
              initialText="S M L XL XXL"
              columns={sizes}
              selectedColumn={selectedSize}
              onColumnSelect={setSelectedSize}
              renderText={false}
              renderHandle
              onSettingsChange={setSizeButtonTextSettings}
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const columnWidth = rect.width / sizes.length;
                const index = Math.min(sizes.length - 1, Math.max(0, Math.floor((event.clientX - rect.left) / columnWidth)));
                setSelectedSize(sizes[index]);
              }}
              onDoubleClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const columnWidth = rect.width / sizes.length;
                const index = Math.min(sizes.length - 1, Math.max(0, Math.floor((event.clientX - rect.left) / columnWidth)));
                setSelectedSize(sizes[index]);
              }}
              initialSettings={{
                fontFamily: 'Oswald',
                fontSize: 20,
                fontWeight: 300,
                selectedFontWeight: 700,
                letterSpacing: 0,
                lineHeight: 1,
                textAlign: 'center',
                color: '#475059',
              }}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            />
          </div>

          <div
            style={{
              gridColumn: '1 / 4',
              gridRow: '1 / 2',
              alignSelf: 'center',
              zIndex: 5,
              minWidth: 0,
            }}
          >
            <p className="font-roboto text-sm uppercase tracking-[0.18em] text-muted-foreground">Prova TDP</p>
          </div>

          <div
            style={{
              gridColumn: '1 / 4',
              gridRow: '2 / 5',
              alignSelf: 'center',
              zIndex: 5,
              minWidth: 0,
            }}
          >
            <h1 className="font-oswald text-4xl font-medium uppercase text-foreground sm:text-5xl">Targeta de producte</h1>
          </div>

          <div
            style={{
              gridColumn: '1 / 2',
              gridRow: '5 / 18',
              justifySelf: 'start',
              alignSelf: 'start',
              zIndex: 5,
              width: '100%',
              maxWidth: '350px',
              minWidth: 0,
            }}
          >
            <ProductTdpCard
              title="NCC-1701"
              description={tdpMockDescription}
              imageSrc="/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png"
              imageAlt="Samarreta blanca Gildan 5000"
              frameImageSrc="/placeholders/fons_acordio/una-columna.png"
              frameImageAlt="Fons una columna"
              price="15,50"
              currency="€"
              sizes={sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              onAddToCart={() => {}}
            />
          </div>

          <div
            style={{
              gridColumn: '2 / 3',
              gridRow: '1 / 12',
              justifySelf: 'center',
              alignSelf: 'stretch',
              zIndex: 5,
              width: '100%',
              height: '100%',
              minWidth: 0,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src="/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png"
              alt="Samarreta blanca Gildan 5000"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>

          <div
            style={{
              gridColumn: '1 / 2',
              gridRow: '18 / 31',
              justifySelf: 'start',
              alignSelf: 'start',
              zIndex: 5,
              width: '100%',
              maxWidth: '350px',
              minWidth: 0,
            }}
          >
            <ProductTdpCard
              title="NCC-1701"
              description={tdpMockDescription}
              imageSrc="/placeholders/apparel/t-shirt/gildan_5000/gildan-5000_t-shirt_crewneck_unisex_heavyWeight_xl_white_gpr-4-0_front.png"
              imageAlt="Samarreta blanca Gildan 5000"
              frameImageSrc="/placeholders/fons_acordio/una-columna.png"
              frameImageAlt="Fons una columna"
              frameImageStyle={{ transform: 'scaleY(-1)' }}
              price="15,50"
              currency="€"
              sizes={sizes}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              onAddToCart={() => {}}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default TdpPage;
