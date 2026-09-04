import React, { Component } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  readonly props: Props;
  state: State = { errorInfo: null };

  static getDerivedStateFromError(error: unknown) {
    return {
      errorInfo: error instanceof Error
        ? `${error.message}\n\n${error.stack || 'No stack trace'}`
        : String(error),
    };
  }

  componentDidCatch(error: unknown) {
    console.error('APP_ERROR', error);
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-[#0f1722] border border-red-200 rounded-xl p-6 max-w-lg w-full">
            <h2 className="text-lg font-bold text-red-800">App Error</h2>
            <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap">{this.state.errorInfo}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
