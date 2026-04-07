import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-dark border border-border-dark rounded-3xl p-8 text-center flex flex-col items-center gap-6">
          <div className="bg-red-500/10 rounded-full p-4">
            <span className="material-symbols-outlined text-red-400 text-5xl">error</span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-white text-2xl font-bold">Algo salió mal</h1>
            <p className="text-[#9da8b9] text-sm">
              Ocurrió un error inesperado. Intentá recargar la página.
            </p>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <div className="w-full bg-[#111418] border border-border-dark rounded-xl p-4 text-left">
              <code className="text-red-400 text-xs break-all whitespace-pre-wrap">
                {this.state.error.message}
              </code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 h-12 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              Recargar página
            </button>
            <a
              href="/"
              className="flex-1 h-12 bg-[#111418] border border-border-dark hover:border-primary/50 text-[#9da8b9] hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">home</span>
              Volver al inicio
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
