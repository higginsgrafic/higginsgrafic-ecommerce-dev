import React from 'react';
import { Link } from 'react-router-dom';
import { loadTexts } from '@/data/siteTexts';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, copied: false };
    this.texts = loadTexts();
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

    // Aquí podries enviar l'error a un servei de logging
    console.error('Error captat per Error Boundary:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      toString: typeof error?.toString === 'function' ? error.toString() : undefined,
      raw: error
    }, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-6xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold font-oswald mb-4" style={{ color: '#141414' }}>
              {this.texts.errorBoundary.title}
            </h1>

            <p className="text-gray-600 mb-6 font-roboto">
              {this.texts.errorBoundary.message}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6">
                <details className="text-left bg-gray-100 p-4 rounded text-sm" style={{ maxHeight: '70vh', overflow: 'auto' }}>
                  <summary className="cursor-pointer font-medium mb-2">{this.texts.errorBoundary.detailsTitle}</summary>
                  <pre className="text-xs whitespace-pre-wrap break-words" style={{ maxHeight: '60vh', overflow: 'auto' }}>
                    {this.formatError(this.state.error)}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
                <button
                  onClick={this.copyErrorToClipboard}
                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors font-roboto text-sm font-medium"
                >
                  {this.state.copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copiat!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copiar codi d'error</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex gap-4">
              <Link
                to="/"
                className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-oswald"
                onClick={() => this.setState({ hasError: false })}
              >
                {this.texts.errorBoundary.backHome}
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-oswald"
              >
                {this.texts.errorBoundary.refresh}
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
