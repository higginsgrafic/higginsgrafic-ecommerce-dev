import { Html, Head, Body, Img, Link } from '@react-email/components';

const LOGO_URL = 'https://raw.githubusercontent.com/higginsgrafic/higginsgrafic-ecommerce-dev/main/public/custom_logos/brand/HIGGINS%20GRAFIC%20NEGRE.png';

export function EmailLayout({
  statusText = "Actualització d'estat",
  labelText = 'Detall de la comanda',
  clientName = '',
  messageText = '',
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
          padding: '32px 10px',
          backgroundColor: '#F5F5F7',
          fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* Outer container */}
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          border="0"
          style={{ width: '100%', margin: 0, padding: 0 }}
        >
          <tr>
            <td align="center">
              {/* Card 1: Outer card (linear-gradient White to #F0F2F6) */}
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
                  border: '1px solid #E5E7EB',
                }}
              >
                {/* Logo Row */}
                <tr>
                  <td align="center" style={{ padding: '34px 20px 24px 20px' }}>
                    <Img
                      src={LOGO_URL}
                      alt="Higgins GRÀFIC"
                      width="120"
                      style={{
                        display: 'block',
                        width: '120px',
                        height: 'auto',
                        margin: '0 auto',
                        border: 0,
                      }}
                    />
                  </td>
                </tr>

                {/* Card 2: Inner card container (10/12 width = 83.333%) */}
                <tr>
                  <td align="center" style={{ padding: '0 43px' }}>
                    <table
                      role="presentation"
                      width="100%"
                      cellPadding="0"
                      cellSpacing="0"
                      border="0"
                      style={{
                        width: '100%',
                        backgroundColor: '#F0F2F6',
                        background: 'linear-gradient(180deg, #F0F2F6 0%, #FFFFFF 100%)',
                        borderRadius: '10px',
                        border: '1px solid #E2E4E9',
                      }}
                    >
                      {/* Header: Status + Label */}
                      <tr>
                        <td align="center" style={{ padding: '42px 36px 0 36px' }}>
                          <div
                            style={{
                              fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                              fontSize: '14px',
                              fontWeight: 700,
                              color: '#141414',
                              marginBottom: '3px',
                              textAlign: 'center',
                            }}
                          >
                            {statusText}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                              fontSize: '14px',
                              fontWeight: 400,
                              letterSpacing: '0.5px',
                              color: '#141414',
                              textTransform: 'uppercase',
                              textAlign: 'center',
                            }}
                          >
                            {labelText}
                          </div>
                        </td>
                      </tr>

                      {/* Greeting + Message */}
                      <tr>
                        <td
                          align="left"
                          style={{
                            padding: '36px 36px 0 36px',
                            fontFamily: "'Roboto', Helvetica, Arial, sans-serif",
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#141414',
                            lineHeight: '1.6',
                          }}
                        >
                          Hola {clientName},
                          <br />
                          <br />
                          {messageText}
                        </td>
                      </tr>

                      {/* Specific template children */}
                      <tr>
                        <td style={{ padding: '36px 36px 42px 36px' }}>
                          {children}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Footer link */}
                <tr>
                  <td
                    align="center"
                    style={{
                      padding: '30px 20px 28px 20px',
                      fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#141414',
                    }}
                  >
                    <Link
                      href="https://higginsgrafic.com"
                      style={{
                        color: '#141414',
                        textDecoration: 'none',
                        fontFamily: "'Roboto Condensed', 'Roboto', Helvetica, Arial, sans-serif",
                        fontSize: '14px',
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


