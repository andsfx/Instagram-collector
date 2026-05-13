import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState, LoadingState } from './ui'

/**
 * Extract HTTP status code from error message if present.
 * Matches patterns like "(404)" or "(502)" in error messages.
 */
function extractHttpCode(message: string): number | undefined {
  const match = message.match(/\((\d{3})\)/)
  return match ? Number(match[1]) : undefined
}

class AsyncErrorBoundary extends Component<
  {
    onReset: () => void
    fallbackTitle: string
    fallbackDescription: string
    children: ReactNode
  },
  { hasError: boolean; message: string; httpCode?: number }
> {
  state: { hasError: boolean; message: string; httpCode?: number } = {
    hasError: false,
    message: '',
    httpCode: undefined,
  }

  static getDerivedStateFromError(error: Error) {
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

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel panel-section section-card">
          <ErrorState
            title={this.props.fallbackTitle}
            message={this.state.message || this.props.fallbackDescription}
            httpCode={this.state.httpCode}
            onRetry={this.props.onReset}
          />
        </section>
      )
    }

    return this.props.children
  }
}

export function SectionAsyncBoundary({
  children,
  loadingTitle,
  loadingDescription,
  errorTitle,
  errorDescription,
  resetKey,
  onReset,
}: {
  children: ReactNode
  loadingTitle: string
  loadingDescription: string
  errorTitle: string
  errorDescription: string
  resetKey: number
  onReset: () => void
}) {
  return (
    <AsyncErrorBoundary
      key={resetKey}
      onReset={onReset}
      fallbackTitle={errorTitle}
      fallbackDescription={errorDescription}
    >
      {children}
    </AsyncErrorBoundary>
  )
}

export function SectionLoadingFallback({ title, description }: { title: string; description: string }) {
  return (
    <section className="panel panel-section">
      <LoadingState title={title} description={description} />
    </section>
  )
}
