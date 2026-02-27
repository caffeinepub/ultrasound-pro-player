import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  sectionName: string;
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

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel p-6 flex flex-col items-center justify-center gap-4 min-h-[120px]">
          <div className="text-red-400 text-sm font-orbitron font-bold uppercase tracking-wider">
            ⚠ {this.props.sectionName} Error
          </div>
          <div className="text-gray-400 text-xs text-center max-w-xs">
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-md text-xs font-orbitron font-bold uppercase tracking-wider"
            style={{
              background: 'rgba(255,215,0,0.15)',
              border: '1px solid rgba(255,215,0,0.4)',
              color: '#FFD700',
              cursor: 'pointer'
            }}
          >
            ↺ Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
