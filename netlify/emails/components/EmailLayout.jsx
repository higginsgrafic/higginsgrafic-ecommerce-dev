import { Html, Head, Body, Img, Link } from '@react-email/components';

const LOGO_URL = 'https://jnuuejlxuyqhhkfucuxg.supabase.co/storage/v1/object/public/media/brand/higgins-grafic-negre.png';

export function EmailLayout({
  bgUrl,
  useCssGradient = false,
  statusText = "Actualització d'estat",
  labelText = 'Nombre de seguiment',
  clientName = '',
  messageText = 'La comanda que has demanat serà en repartiment ben aviat. Aquí tens el nombre de seguiment.',
  children,
}) {
  return (
    <Html lang="ca">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
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
          padding: '24px 8px',
          backgroundColor: '#F5F5F7',
          fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {/* Outer wrapper table for email client centering */}
        <table
          role="presentation"
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          border="0"
          style={{ width: '100%', backgroundColor: '#F5F5F7', margin: 0, padding: 0 }}
        >
          <tr>
            <td align="center">
              {/* Main Card: 520px width, linear-gradient 1 (A1 to L28) */}
              <table
                role="presentation"
                width="520"
                cellPadding="0"
                cellSpacing="0"
                border="0"
                style={{
                  width: '520px',
                  maxWidth: '520px',
                  backgroundColor: '#F0F2F6',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F2F6 100%)',
                  margin: '0 auto',
                  borderCollapse: 'collapse',
                }}
              >
                {/* Logo Row (Rows 1-4) */}
                <tr>
                  <td align="center" style={{ padding: '34px 20px 24px 20px' }}>
                    <Img
                      src={LOGO_URL}
                      alt="Higgins GRÀFIC"
                      width="150"
                      height="30"
                      style={{
                        display: 'block',
                        height: '30px',
                        width: 'auto',
                        border: 0,
                        margin: '0 auto',
                      }}
                    />
                  </td>
                </tr>

                {/* Inner Card Container (Grid B5 to K24 -> 10/12 width) */}
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
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF',
                        background: 'linear-gradient(180deg, #F0F2F6 0%, #FFFFFF 100%)',
                        borderCollapse: 'separate',
                        borderSpacing: 0,
                      }}
                    >
                      {/* Header: status + label */}
                      <tr>
                        <td align="center" style={{ padding: '40px 36px 0 36px' }}>
                          <div
                            style={{
                              fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
                              fontSize: '14px',
                              fontWeight: 700,
                              color: '#141414',
                              lineHeight: '1.2',
                              marginBottom: '4px',
                            }}
                          >
                            {statusText}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
                              fontSize: '14px',
                              fontWeight: 400,
                              letterSpacing: '0.5px',
                              color: '#141414',
                              textTransform: 'uppercase',
                              lineHeight: '1.2',
                            }}
                          >
                            {labelText}
                          </div>
                        </td>
                      </tr>

                      {/* Message: greeting + text */}
                      <tr>
                        <td
                          align="left"
                          style={{
                            padding: '32px 36px 0 36px',
                            fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
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

                      {/* Template children content (tables, codes, buttons) */}
                      <tr>
                        <td style={{ padding: '32px 36px 36px 36px' }}>
                          {children}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Footer Row (Rows 25-28) */}
                <tr>
                  <td
                    align="center"
                    style={{
                      padding: '32px 20px 24px 20px',
                      fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
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
                        fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
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
