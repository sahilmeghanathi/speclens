import React, { type ReactNode } from 'react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
}

/**
 * Error Boundary component to catch render errors gracefully.
 * Prevents one component's error from crashing the entire spec editor.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Preview Error:', error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            padding: '24px',
            background: '#1a0000',
            borderRadius: '4px',
            color: '#ff6b6b',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '1.5',
            maxHeight: '100%',
            overflow: 'auto',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            ⚠️ Component render failed
          </div>
          <div style={{ marginBottom: '12px' }}>{this.state.error.message}</div>
          <div
            style={{
              background: '#0d0d0d',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '12px',
              maxHeight: '200px',
              overflow: 'auto',
              fontSize: '11px',
              color: '#ff8888',
            }}
          >
            {this.state.error.stack}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            type="button"
            style={{
              padding: '8px 12px',
              background: '#ff6b6b',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Reset
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
