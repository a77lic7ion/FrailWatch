import React, { Component } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  readonly props: Props;
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown) {
    console.error('APP_ERROR', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white border border-red-200 rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold text-red-800">App Error</h2>
            <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">{this.state.error}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
