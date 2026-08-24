import { Html, Head, Body, Img, Link } from '@react-email/components';

const LOGO_URL = 'https://raw.githubusercontent.com/higginsgrafic/higginsgrafic-ecommerce-dev/main/public/custom_logos/brand/HIGGINS%20GRAFIC%20NEGRE.png';

export function EmailLayout({
  statusText = "Actualització d'estat",
  labelText = 'DETALL DE LA COMANDA',
  clientName = '',
  messageContent = null,
  ctaText = 'Torna a la botiga >',
  ctaUrl = 'https://higginsgrafic.com',
  showCta = true,
  children,
}) {
  return (
    <Html lang="ca">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>{labelText}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Condensed:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#FFFFFF',
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          border="0"
          style={{ width: '100%', margin: 0, padding: 0 }}
        >
          <tr>
            <td align="center" style={{ padding: 0 }}>
              {/* Primer fons (Outer card: 520px wide, White to Grey gradient) */}
              <table
                role="presentation"
                width="520"
                cellPadding="0"
                cellSpacing="0"
                border="0"
                style={{
                  width: '520px',
                  maxWidth: '520px',
                  backgroundColor: '#FFFFFF',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F2F6 100%)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  margin: '0 auto',
                }}
              >
                {/* Logo Row: Rows 1 to 5 (Top padding + Logo + spacing = ~130px total) */}
                <tr>
                  <td align="center" style={{ height: '130px', padding: '22px 0 18px 0', verticalAlign: 'middle' }}>
                    <Img
                      src={LOGO_URL}
                      alt="Higgins GRÀFIC"
                      width="237"
                      style={{
                        display: 'block',
                        width: '237px',
                        height: 'auto',
                        margin: '0 auto',
                        border: 0,
                      }}
                    />
                  </td>
                </tr>

                {/* Segon fons (Inner card: (C, 6) to (V, 25), Grey to White gradient) */}
                <tr>
                  <td align="center" style={{ padding: '0 43.33px' }}>
                    <table
                      role="presentation"
                      width="100%"
                      cellPadding="0"
                      cellSpacing="0"
                      border="0"
                      style={{
                        width: '100%',
                        minHeight: '520px',
                        backgroundColor: '#F0F2F6',
                        background: 'linear-gradient(180deg, #F0F2F6 0%, #FFFFFF 100%)',
                        borderRadius: '10px',
                        boxSizing: 'border-box',
                      }}
                    >
                      <tr>
                        {/* Content Area: (E, 8) to (T, 24) -> 2 cols padding left/right (43.3px), 2 rows top (52px), 1 row bottom (26px) */}
                        <td style={{ padding: showCta ? '52px 43.33px 0 43.33px' : '52px 43.33px 26px 43.33px', verticalAlign: 'top' }}>
                          {/* Upper Text Area: Rows 8 to 15 (Height 208px) so slot below starts exactly at Row 16 */}
                          <div style={{ height: '208px', boxSizing: 'border-box' }}>
                            {/* Header: Status + Label */}
                            <div style={{ textAlign: 'center', margin: '0 0 32px 0', padding: 0 }}>
                              <div
                                style={{
                                  fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                                  fontSize: '12pt',
                                  fontWeight: 700,
                                  lineHeight: '1',
                                  color: '#141414',
                                  margin: '0 0 4px 0',
                                  padding: 0,
                                }}
                              >
                                {statusText}
                              </div>
                              <div
                                style={{
                                  fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                                  fontSize: '13.5pt',
                                  fontWeight: 400,
                                  lineHeight: '1.2',
                                  letterSpacing: '0.5px',
                                  color: '#141414',
                                  textTransform: 'uppercase',
                                  margin: 0,
                                  padding: 0,
                                }}
                              >
                                {labelText}
                              </div>
                            </div>

                            {/* Greeting & Message */}
                            <div
                              style={{
                                fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                                fontSize: '10.05pt',
                                fontWeight: 400,
                                color: '#141414',
                                lineHeight: '1.28',
                                textAlign: 'left',
                              }}
                            >
                              {clientName && (
                                <div style={{ marginBottom: '8px' }}>
                                  Hola {clientName},
                                </div>
                              )}
                              {messageContent}
                            </div>
                          </div>

                          {/* Specific card body / children starting at Row 16 */}
                          <div>{children}</div>
                        </td>
                      </tr>

                      {/* Bottom CTA Link centered on Line 24 */}
                      {showCta && (
                        <tr>
                          <td
                            align="center"
                            style={{
                              height: '42px',
                              paddingBottom: '27px',
                              verticalAlign: 'middle',
                              textAlign: 'center',
                            }}
                          >
                            <Link
                              href={ctaUrl}
                              style={{
                                color: '#141414',
                                textDecoration: 'none',
                                fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                                fontSize: '10.05pt',
                                fontWeight: 500,
                                lineHeight: '1',
                              }}
                            >
                              {ctaText}
                            </Link>
                          </td>
                        </tr>
                      )}
                    </table>
                  </td>
                </tr>

                {/* Footer outside card: Rows 26 to 28 (~78px height) */}
                <tr>
                  <td
                    align="center"
                    style={{
                      height: '78px',
                      padding: '24px 0 28px 0',
                      verticalAlign: 'middle',
                      fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                      fontSize: '13px',
                      fontWeight: 400,
                      color: '#141414',
                    }}
                  >
                    <Link
                      href="https://higginsgrafic.com"
                      style={{
                        color: '#141414',
                        textDecoration: 'none',
                        fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                        fontSize: '13px',
                        fontWeight: 400,
                      }}
                    >
                      higginsgrafic.com
                    </Link>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </Body>
    </Html>
  );
}


