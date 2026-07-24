import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Oups ! Une erreur inattendue s'est produite.</h2>
            <p className="text-sm text-gray-600 mb-6">
              Veuillez recharger l'application ou retourner à l'accueil.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} variant="default">
                Recharger
              </Button>
              <Button onClick={() => window.location.replace('/')} variant="outline">
                Accueil
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs overflow-auto max-h-40">
                <p className="font-mono text-red-500">{this.state.error?.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
