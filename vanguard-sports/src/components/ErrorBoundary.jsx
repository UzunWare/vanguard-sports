import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * Logs errors and displays a fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Store error details in state
    this.setState({
      error,
      errorInfo,
    });

    // In production, send error to error tracking service (e.g., Sentry)
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService(error, errorInfo) {
    // TODO: Implement error logging service integration
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    console.error('Production error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-600" size={40} />
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-slate-600 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
                Please try refreshing the page or return to the home page.
              </p>

              {/* Error Details (Development Only) */}
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left mb-6 bg-slate-100 p-4 rounded-lg">
                  <summary className="cursor-pointer font-bold text-slate-700 mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <div className="text-sm text-red-600 font-mono overflow-auto">
                    <p className="mb-2">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home size={18} />
                  Go to Home
                </Button>
                <Button
                  variant="primary"
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  Try Again
                </Button>
              </div>

              {/* Support Message */}
              <p className="text-sm text-slate-500 mt-6">
                If the problem persists, please contact support at{' '}
                <a
                  href="mailto:vanguardsportsacademytx@gmail.com"
                  className="text-orange-600 hover:underline font-medium"
                >
                  vanguardsportsacademytx@gmail.com
                </a>
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
