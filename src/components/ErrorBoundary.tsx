import { Component, ErrorInfo, ReactNode } from 'react'
import { logError } from '../lib/logger'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logError(error, 'ErrorBoundary.componentDidCatch')
    // Log the error info for debugging
    logError(new Error(JSON.stringify(errorInfo)), 'ErrorBoundary.componentDidCatch.errorInfo')
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
} 