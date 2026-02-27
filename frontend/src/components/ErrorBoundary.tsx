import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error in section:', this.props.section, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-6 rounded-xl border border-red-500/40 text-center">
          <div className="text-red-400 text-4xl mb-3">⚠️</div>
          <h3 className="text-red-400 font-orbitron font-bold text-lg mb-2">
            {this.props.section ? `Error in ${this.props.section}` : 'Something went wrong'}
          </h3>
          <p className="text-red-300/80 text-sm mb-4 font-mono break-all">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors font-rajdhani font-semibold"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
