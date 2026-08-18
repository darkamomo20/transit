import React, {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UBICAL Runtime Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0B1120', color: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '500px', backgroundColor: '#1E293B', padding: '32px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#60A5FA' }}>UBICAL Transit</h1>
            <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '20px' }}>
              Se produjo un error al iniciar la aplicación.
            </p>
            <pre style={{ backgroundColor: '#0F172A', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#F87171', overflowX: 'auto', textAlign: 'left', marginBottom: '20px' }}>
              {this.state.error?.message || 'Error desconocido'}
            </pre>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ backgroundColor: '#2563EB', color: '#FFFFFF', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
            >
              Reiniciar aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

