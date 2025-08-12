"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RefreshCw, AlertTriangle, Home, Bug } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report to error logging service (e.g., Sentry, LogRocket)
    this.reportError(error, errorInfo)

    // Attempt auto-recovery for chunk loading errors once per session
    const isChunkLoadError =
      error?.name === 'ChunkLoadError' || /ChunkLoadError|Loading chunk .* failed/i.test(error?.message || '')

    if (isChunkLoadError && typeof window !== 'undefined') {
      const hasAttempted = sessionStorage.getItem('attemptedChunkRecovery') === '1'
      if (!hasAttempted) {
        sessionStorage.setItem('attemptedChunkRecovery', '1')
        this.handleClearAppCache()
      }
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real application, you would send this to an error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    }

    console.error("Error Report:", errorReport)
    
    // Example: Send to error reporting service
    // errorReportingService.captureException(error, { extra: errorReport })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleClearAppCache = async () => {
    try {
      if (typeof window !== 'undefined') {
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations.map((registration) => registration.unregister()))
        }

        // Delete all caches
        if ('caches' in window) {
          const cacheKeys = await caches.keys()
          await Promise.all(cacheKeys.map((key) => caches.delete(key)))
        }

        // Clear storage
        try { localStorage.clear() } catch {}
        try { sessionStorage.clear() } catch {}

        // Give the browser a moment, then reload
        setTimeout(() => window.location.reload(), 100)
      }
    } catch (e) {
      console.error('Failed to clear app cache', e)
      window.location.reload()
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Application Error</AlertTitle>
                <AlertDescription>
                  An unexpected error occurred while running the application. 
                  The error has been logged for investigation.
                </AlertDescription>
              </Alert>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto">
                    <div className="text-destructive font-semibold mb-2">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="font-semibold mb-2">Component Stack:</div>
                        <pre className="whitespace-pre-wrap text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={this.handleReset} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} variant="default" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                <Button onClick={this.handleClearAppCache} variant="destructive" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Clear app cache & reload
                </Button>
              </div>

              {/* Contact Support */}
              <div className="text-sm text-muted-foreground pt-4 border-t">
                <p className="flex items-center gap-2 mb-2">
                  <Bug className="h-4 w-4" />
                  If this problem persists, please contact support.
                </p>
                <p className="text-xs">
                  Error ID: {Date.now().toString(36)}-{Math.random().toString(36).substr(2, 9)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Simplified Error Boundary Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error("Error caught by useErrorHandler:", error, errorInfo)
    
    // Report error
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...errorInfo,
    }
    
    console.error("Error Report:", errorReport)
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
} 