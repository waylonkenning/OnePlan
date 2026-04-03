import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          data-testid="error-boundary-ui"
          className="min-h-screen flex items-center justify-center bg-slate-50 p-8"
        >
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-6">
              An unexpected error occurred. Your data is safe — reloading the page should fix this.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ModalErrorBoundaryProps {
  children: React.ReactNode;
  onDismiss?: () => void;
  title?: string;
}

export class ModalErrorBoundary extends React.Component<ModalErrorBoundaryProps, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  handleDismiss = () => {
    this.setState({ hasError: false, message: '' });
    this.props.onDismiss?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          data-testid="modal-error-boundary"
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200]"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-lg font-semibold">Something went wrong</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              This dialog couldn't load properly. You can close it and continue working.
            </p>
            <p className="text-xs text-slate-400 mb-4 font-mono truncate" title={this.state.message}>
              {this.state.message}
            </p>
            <button
              onClick={this.handleDismiss}
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Test hook: renders a component that throws if the localStorage flag is set
export function TestErrorThrower() {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('scenia-test-throw') === 'true') {
    throw new Error('Test-induced render error');
  }
  return null;
}
