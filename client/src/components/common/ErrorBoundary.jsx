/**
 * @file src/components/common/ErrorBoundary.jsx
 * @description Class-based React Error Boundary to catch and handle unhandled runtime errors gracefully.
 */

import { Component } from 'react';
import { HiOutlineExclamationCircle, HiOutlineRefresh, HiOutlineHome } from 'react-icons/hi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Unhandled Application Error in ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl space-y-6 text-center animate-scale-up">
            {/* Error Icon */}
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <HiOutlineExclamationCircle className="w-9 h-9" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                An unexpected interface error occurred. You can retry loading this view or return to
                the main dashboard.
              </p>
            </div>

            {/* Collapsible Error Diagnostics (for dev/debugging) */}
            {this.state.error && (
              <details className="text-left bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-xs font-mono text-slate-700">
                <summary className="font-bold cursor-pointer text-slate-600 select-none">
                  View Technical Diagnostics
                </summary>
                <div className="mt-3 overflow-x-auto max-h-40 whitespace-pre-wrap text-[11px] text-rose-700 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            )}

            {/* Recovery Actions */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all"
              >
                <HiOutlineRefresh className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
              >
                <HiOutlineHome className="w-4 h-4" />
                <span>Return to Dashboard</span>
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
