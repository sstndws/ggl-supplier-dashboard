import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Dashboard render error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#f7f1f1',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: '100%',
            background: '#fff',
            border: '1px solid rgba(139,26,26,0.14)',
            borderRadius: 16,
            padding: '28px 26px',
            boxShadow: '0 10px 30px rgba(74,28,28,0.08)',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#8B1A1A', marginBottom: 8 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 13, color: '#6b5555', marginBottom: 20, lineHeight: 1.5 }}>
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              background: '#8B1A1A',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
