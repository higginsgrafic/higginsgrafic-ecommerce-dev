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
    };
    this.carouselTimer = null;
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
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.hasError && !prevState.hasError) {
      this.startCarousel();
    }
  }

  componentWillUnmount() {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
    }
  }

  startCarousel = () => {
    if (this.carouselTimer) clearInterval(this.carouselTimer);
    this.carouselTimer = setInterval(() => {
      this.setState((prev) => ({
        carouselIndex: (prev.carouselIndex + 1) % 2,
      }));
    }, 4000);
  }

  render() {
    if (this.state.hasError) {
      const phrases = [
        "L'operació ha finalitzat amb errors.",
        "Si et plau, torna-ho a provar.",
      ];
      const { carouselIndex } = this.state;

      return (
        <div style={{
          position: 'relative',
          minHeight: '100vh',
          background: '#090912',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          overflow: 'hidden',
          fontFamily: "'Roboto', sans-serif",
        }}>
          <div style={{ textAlign: 'center', maxWidth: '600px', position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: '44px',
              fontWeight: 600,
              color: '#f4f4f5',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
              margin: '0 0 16px 0',
            }}>
              Alguna cosa no va alhora
            </h2>

            <div style={{
              color: '#a1a1aa',
              marginBottom: '28px',
              fontSize: '24px',
              fontWeight: 300,
              height: '32px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              {phrases.map((phrase, i) => {
                let transform = 'translateX(-100%)';
                let opacity = 0;
                if (i === carouselIndex) {
                  transform = 'translateX(0)';
                  opacity = 1;
                } else if (i === (carouselIndex + 1) % 2) {
                  transform = 'translateX(100%)';
                  opacity = 1;
                }
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      opacity,
                      transform,
                      transition: 'transform 0.5s ease',
                    }}
                  >
                    {phrase}
                  </div>
                );
              })}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{ marginBottom: '24px' }}>
                <details style={{
                  textAlign: 'left',
                  background: '#18181b',
                  padding: '16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  maxHeight: '40vh',
                  overflow: 'auto',
                  color: '#a1a1aa',
                  border: '1px solid #27272a',
                }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 500, marginBottom: '8px', color: '#f4f4f5' }}>
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
                    padding: '10px 16px',
                    background: '#18181b',
                    color: '#f4f4f5',
                    border: '1px solid #27272a',
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

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 24px',
                  borderRadius: '4px',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  background: '#f4f4f5',
                  color: '#09090b',
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
                  padding: '10px 24px',
                  borderRadius: '4px',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  boxShadow: '0 0 0 0.75px #a1a1aa',
                  color: '#a1a1aa',
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
