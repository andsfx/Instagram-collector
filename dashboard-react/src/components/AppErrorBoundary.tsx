import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from './ui'

interface AppErrorBoundaryProps {
  children: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
  message: string
  httpCode?: number
  resetKey: number
}

/**
 * Extract HTTP status code from error message if present.
 * Matches patterns like "(404)" or "(502)" in error messages.
 */
function extractHttpCode(message: string): number | undefined {
  const match = message.match(/\((\d{3})\)/)
  return match ? Number(match[1]) : undefined
}

/**
 * App-level error boundary that catches unhandled errors at the top level.
 * Displays a full-page ErrorState with retry capability.
 * Logs errors to console with [dashboard.error] tag.
 * Does NOT display stack traces to the user.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: '',
    httpCode: undefined,
    resetKey: 0,
  }

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    const httpCode = extractHttpCode(error.message)
    return {
      hasError: true,
      message: error.message,
      httpCode,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[dashboard.error]', error, errorInfo)
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      message: '',
      httpCode: undefined,
      resetKey: prev.resetKey + 1,
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 py-16">
          <div className="grid max-w-md gap-4 text-center">
            <ErrorState
              title="Terjadi kesalahan pada aplikasi"
              message={this.state.message || 'Terjadi kesalahan yang tidak terduga.'}
              httpCode={this.state.httpCode}
              onRetry={this.handleRetry}
            />
          </div>
        </div>
      )
    }

    return <div key={this.state.resetKey}>{this.props.children}</div>
  }
}
