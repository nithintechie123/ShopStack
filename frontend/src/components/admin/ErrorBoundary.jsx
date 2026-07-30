import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // log to console for now — can be extended to external logging
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error ? this.state.error.message : 'Unexpected error';
      const stack = this.state.error && this.state.error.stack ? this.state.error.stack.split('\n').slice(0, 3).join('\n') : '';
      return (
        <div className="min-h-screen bg-bg-primary text-text-primary py-10 flex items-center justify-center">
          <div className="max-w-2xl w-full px-6 py-8 rounded-2xl border border-slate-200 bg-white shadow-sm text-center">
            <h2 className="text-xl font-bold mb-2">Something went wrong while loading this report</h2>
            <p className="text-sm text-text-muted mb-2">{msg}</p>
            {stack && <pre className="text-xs text-left text-red-600 whitespace-pre-wrap mb-4">{stack}</pre>}
            <p className="text-sm text-text-muted mb-4">Try refreshing the page or return to Reports.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-full bg-accent-primary text-white">Refresh</button>
              <a href="/admin/reports" className="px-4 py-2 rounded-full border border-slate-200 text-sm">Back to Reports</a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
