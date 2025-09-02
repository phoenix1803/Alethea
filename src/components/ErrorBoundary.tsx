'use client';

import React from 'react';
import { ErrorBoundary as ErrorBoundaryHandler } from '@/lib/errorHandler';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        ErrorBoundaryHandler.handleComponentError(error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
            }

            return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
        }

        return this.props.children;
    }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="max-w-md mx-auto text-center p-8">
                <div className="w-16 h-16 bg-red-900 border border-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-red-200 font-bold">!</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
                <p className="text-gray-400 mb-6">
                    An unexpected error occurred. Please try again or contact support if the problem persists.
                </p>
                {process.env.NODE_ENV === 'development' && (
                    <details className="mb-6 text-left">
                        <summary className="cursor-pointer text-gray-300 hover:text-white">
                            Error Details (Development)
                        </summary>
                        <pre className="mt-2 p-4 bg-gray-900 border border-gray-800 rounded text-xs text-red-300 overflow-auto">
                            {error.stack}
                        </pre>
                    </details>
                )}
                <div className="space-x-4">
                    <button
                        onClick={resetError}
                        className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
}