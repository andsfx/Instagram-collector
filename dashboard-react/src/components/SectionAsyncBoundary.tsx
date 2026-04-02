import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState, LoadingState } from './ui'

class AsyncErrorBoundary extends Component<
  {
    onReset: () => void
    fallbackTitle: string
    fallbackDescription: string
    children: ReactNode
  },
  { hasError: boolean; message: string }
> {
  state = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message,
    }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  render() {
    if (this.state.hasError) {
      return (
        <section className="panel panel-section section-card">
          <ErrorState title={this.props.fallbackTitle} description={this.state.message || this.props.fallbackDescription} />
          <div>
            <button type="button" className="retry-button" onClick={this.props.onReset}>
              Coba muat ulang section
            </button>
          </div>
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
