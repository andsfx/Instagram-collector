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
        <section className="grid gap-[22px] rounded-panel-lg border border-border bg-[color:color-mix(in_srgb,var(--panel)_92%,transparent)] p-7 shadow-panel-sm backdrop-blur-[16px]">
          <ErrorState title={this.props.fallbackTitle} description={this.state.message || this.props.fallbackDescription} />
          <div>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-brand-soft px-3.5 py-2.5 font-bold text-brand transition hover:-translate-y-px"
              onClick={this.props.onReset}
            >
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
    <section className="rounded-panel-lg border border-border bg-[color:color-mix(in_srgb,var(--panel)_92%,transparent)] p-7 shadow-panel-sm backdrop-blur-[16px]">
      <LoadingState title={title} description={description} />
    </section>
  )
}
