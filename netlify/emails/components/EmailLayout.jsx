import { Html, Head, Body, Img, Link } from '@react-email/components';

const LOGO_URL = '/custom_logos/brand/HIGGINS GRAFIC NEGRE.png';

export function EmailLayout({
  bgUrl,
  useCssGradient = false,
  statusText = "Actualització d'estat",
  labelText = 'Nombre de seguiment',
  clientName = '',
  messageText = 'La comanda que has demanat serà en repartiment ben aviat. Aquí tens el nombre de seguiment.',
  children,
}) {
  if (useCssGradient) {
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
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* Background 1: Main card (A1 to L28) */}
          <div
            style={{
              width: '520px',
              maxWidth: '100%',
              minHeight: '727px',
              margin: '0 auto',
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F2F6 100%)',
              padding: '34px 0 30px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            {/* Logo (Rows 1-4) */}
            <div style={{ textAlign: 'center', height: '36px', transform: 'translateY(1px)' }}>
              <Img
                src={LOGO_URL}
                alt="Higgins GRÀFIC"
                style={{ height: '30px', width: 'auto', display: 'inline-block', border: 0 }}
              />
            </div>

            {/* Background 2: Inner card (Grid B5 to K24 -> 10/12 width, 20/28 height) */}
            <div
              style={{
                width: '83.333%', /* Cols B to K: 10/12 */
                minHeight: '520px', /* Rows 5 to 24: 20/28 */
                margin: '34px auto 0',
                borderRadius: '10px',
                boxSizing: 'border-box',
                background: 'linear-gradient(180deg, #F0F2F6 0%, #FFFFFF 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                padding: '51px 43.3px 34px',
                flex: '1 0 auto',
              }}
            >
              {/* Header: status + label */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#141414',
                    marginBottom: '3px',
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
                    marginBottom: '6px',
                    transform: 'translateY(-5px)',
                  }}
                >
                  {labelText}
                </div>
              </div>

              {/* Message: greeting + info */}
              <div
                style={{
                  marginTop: '51px',
                  textAlign: 'left',
                  fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#141414',
                  lineHeight: '1.6',
                }}
              >
                Hola {clientName},
                <br />
                <span style={{ display: 'inline-block', transform: 'translateY(12px)' }}>
                  {messageText}
                </span>
              </div>

              {/* Template-specific content (ItemsTable + SummaryTable) */}
              <div style={{ marginTop: '72px', flex: '1 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {children}
              </div>
            </div>

            {/* Footer URL (Rows 25-28) */}
            <div
              style={{
                textAlign: 'center',
                marginTop: '34px',
                paddingBottom: '16px',
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
            </div>
          </div>
        </Body>
      </Html>
    );
  }
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
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '520px',
            maxWidth: '100%',
            minHeight: '727px',
            margin: '0 auto',
            boxSizing: 'border-box',
            backgroundImage: `url('${bgUrl}')`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            padding: '34px 48px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: 'center', height: '36px', transform: 'translateY(1px)', position: 'relative', zIndex: 1 }}>
            <Img
              src={LOGO_URL}
              alt="Higgins GRÀFIC"
              style={{ height: '30px', width: 'auto', display: 'inline-block', border: 0 }}
            />
          </div>

          {/* Header: status + label */}
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(75% - 10px)',
              left: 0,
              width: '100%',
              textAlign: 'center',
              zIndex: 3,
            }}
          >
            <div
              style={{
                fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
                fontSize: '14px',
                fontWeight: 700,
                color: '#141414',
                marginBottom: '3px',
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
                marginBottom: '6px',
                transform: 'translateY(-5px)',
              }}
            >
              {labelText}
            </div>
          </div>

          {/* Message: greeting + info */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(30% + 25px)',
              left: '16.66%',
              width: '66.68%',
              textAlign: 'left',
              fontFamily: 'Roboto,Helvetica,Arial,sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#141414',
              lineHeight: '1.6',
              zIndex: 3,
            }}
          >
            Hola {clientName},
            <br />
            <span style={{ display: 'inline-block', transform: 'translateY(12px)' }}>
              {messageText}
            </span>
          </div>

          {/* Template-specific content */}
          {children}

          {/* Footer URL */}
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(5% + 5px)',
              left: 0,
              width: '100%',
              textAlign: 'center',
              fontFamily: "'Roboto Condensed',Helvetica,Arial,sans-serif",
              fontSize: '14px',
              fontWeight: 400,
              color: '#141414',
              zIndex: 3,
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
          </div>
        </div>
      </Body>
    </Html>
  );
}
