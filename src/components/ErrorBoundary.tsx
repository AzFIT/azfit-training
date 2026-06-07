import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary — Catches React rendering errors and shows a graceful fallback.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
  }

  handleReset = () => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />
    }

    return this.props.children
  }
}

/* ── Default Fallback UI ─────────────────────────────────────────── */

function ErrorFallback({
  error,
  onReset,
}: {
  error: Error | null
  onReset: () => void
}) {
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-danger" />
        </div>

        <h1 className="font-playfair text-2xl font-bold text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-[#A0A0A0] text-sm mb-6 leading-relaxed">
          We&apos;re sorry — an unexpected error occurred. Try refreshing the page or go back to the dashboard.
        </p>

        {error && (
          <div className="bg-[#141414] border border-dark-border rounded-xl p-4 mb-6 text-left overflow-hidden">
            <p className="text-danger text-xs font-mono mb-1">Error:</p>
            <p className="text-[#A0A0A0] text-xs font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 bg-cyan hover:bg-cyan-dark text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] text-sm"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-[#A0A0A0] hover:text-white font-medium px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm"
          >
            <Home size={16} />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
