import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      carouselIndex: 0,
      exitIndex: null,
      bgColorIndex: 0,
    };
    this.carouselTimer = null;
    this.exitTimer = null;
    this.bgColorTimer = null;
  }

  legacyCopyViaTextarea = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = String(text || '');
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand && document.execCommand('copy');
    document.body.removeChild(textarea);
    return Boolean(ok);
  }

  copyTextToClipboard = async (txt) => {
    const text = String(txt || '');
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // fallthrough
    }
    try {
      return this.legacyCopyViaTextarea(text);
    } catch {
      return false;
    }
  }

  formatError = (err) => {
    if (!err) return '';
    const name = err?.name ? String(err.name) : '';
    const message = err?.message ? String(err.message) : '';
    const stack = err?.stack ? String(err.stack) : '';
    const toStringValue = typeof err?.toString === 'function' ? String(err.toString()) : '';
    return [name && message ? `${name}: ${message}` : (message || name), toStringValue, stack]
      .filter(Boolean)
      .join('\n');
  }

  copyErrorToClipboard = () => {
    const errorText = `${this.formatError(this.state.error) || ''}\n${this.state.errorInfo?.componentStack || ''}`;
    this.copyTextToClipboard(errorText).then((ok) => {
      if (!ok) return;
      this.setState({ copied: true });
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
    });
  }

  carouselPhrases = [
    "L'operació ha finalitzat amb errors.",
    "Si et plau, torna-ho a provar.",
  ];

  bgColors = [
    'rgba(255,0,0,0.25)',
    'rgba(0,0,0,0.25)',
    'rgba(0,50,0,0.25)',
    'rgba(0,0,128,0.25)',
    'rgba(255,165,0,0.25)',
    'rgba(128,0,128,0.25)',
    'rgba(100,100,0,0.25)',
    'rgba(0,255,255,0.25)',
    'rgba(255,0,255,0.25)',
    'rgba(0,128,128,0.25)',
    'rgba(128,128,0,0.25)',
    'rgba(255,192,203,0.25)',
    'rgba(139,69,19,0.25)',
    'rgba(0,50,0,0.25)',
    'rgba(75,0,130,0.25)',
    'rgba(255,69,0,0.25)',
    'rgba(0,250,154,0.25)',
    'rgba(220,20,60,0.25)',
    'rgba(70,130,180,0.25)',
    'rgba(218,165,32,0.25)',
  ];

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    console.error('Error captat per Error Boundary:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      toString: typeof error?.toString === 'function' ? error.toString() : undefined,
      raw: error
    }, errorInfo);
  }

  componentDidMount() {
    if (this.state.hasError) {
      this.startCarousel();
      this.startBgColorCycle();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.hasError && this.state.hasError) {
      this.startCarousel();
      this.startBgColorCycle();
    }
  }

  componentWillUnmount() {
    if (this.carouselTimer) clearInterval(this.carouselTimer);
    if (this.exitTimer) clearTimeout(this.exitTimer);
    if (this.bgColorTimer) clearInterval(this.bgColorTimer);
  }

  startCarousel = () => {
    this.carouselTimer = setInterval(() => {
      const prev = this.state.carouselIndex;
      const next = (prev + 1) % this.carouselPhrases.length;
      this.setState({ carouselIndex: next, exitIndex: prev });
      this.exitTimer = setTimeout(() => {
        this.setState({ exitIndex: null });
      }, 500);
    }, 4000);
  }

  startBgColorCycle = () => {
    this.bgColorTimer = setInterval(() => {
      this.setState((prev) => ({
        bgColorIndex: (prev.bgColorIndex + 1) % this.bgColors.length,
      }));
    }, 3000);
  }

  getCarouselItemStyle = (index) => {
    const isActive = index === this.state.carouselIndex;
    const isExit = index === this.state.exitIndex;
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      opacity: isActive ? 1 : 0,
      transform: isActive ? 'translateX(0)' : (isExit ? 'translateX(100%)' : 'translateX(-100%)'),
      transition: 'transform 0.5s ease, opacity 0.5s ease',
      whiteSpace: 'nowrap',
    };
  }

  render() {
    if (this.state.hasError) {
      const bgStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: "url('/placeholders/tots_els_fons/fons_error/fons-error-6.png')",
        backgroundColor: this.bgColors[this.state.bgColorIndex],
        backgroundSize: '150% 150%',
        backgroundPosition: 'center',
        opacity: 0.5,
        transition: 'opacity 3s ease, background-color 3s ease',
        zIndex: -1,
      };

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          fontFamily: "'Roboto', sans-serif",
          position: 'relative',
          overflow: 'hidden',
        }}>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;500;600;700&display=swap');`}</style>
          <div style={bgStyle} />
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <h2 style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: '32.8125px',
              fontWeight: 500,
              color: '#475059',
              margin: '0 0 8px 0',
            }}>
              Alguna cosa no va alhora
            </h2>

            <div style={{
              width: '100%',
              textAlign: 'center',
              color: '#98A2B4',
              fontSize: '20.78125px',
              fontWeight: 400,
              margin: '0 0 24px 0',
              height: '28.5px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {this.carouselPhrases.map((text, i) => (
                  <div key={i} style={this.getCarouselItemStyle(i)}>{text}</div>
                ))}
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{ marginBottom: '24px' }}>
                <details style={{
                  textAlign: 'left',
                  background: '#F4F6F8',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  maxHeight: '40vh',
                  overflow: 'auto',
                  color: '#475059',
                  border: '1px solid #E6E8EC',
                }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 500, marginBottom: '8px', color: '#475059' }}>
                    Detalls de l'error
                  </summary>
                  <pre style={{
                    fontSize: '11px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '30vh',
                    overflow: 'auto',
                    margin: 0,
                  }}>
                    {this.formatError(this.state.error)}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
                <button
                  onClick={this.copyErrorToClipboard}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: '#FFFFFF',
                    color: '#475059',
                    border: '1px solid #E6E8EC',
                    borderRadius: '4px',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {this.state.copied ? 'Copiat!' : "Copiar codi d'error"}
                </button>
              </div>
            )}

            <div style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 20px',
                  borderRadius: '4px',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  fontSize: '13px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  background: '#475059',
                  color: '#FFFFFF',
                  border: 'none',
                }}
              >
                INICI
              </Link>
              <button
                onClick={() => window.location.reload()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 20px',
                  borderRadius: '4px',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  fontSize: '13px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  background: '#FFFFFF',
                  border: '1px solid #475059',
                  color: '#475059',
                }}
              >
                REFRESCA
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
