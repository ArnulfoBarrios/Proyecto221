import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#0F0720',
          color: 'white',
          padding: '2rem',
          fontFamily: 'monospace',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#FF006E' }}>⚠️ Application Error</h1>
          <pre style={{
            background: '#1a1a2e',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {this.state.error && this.state.error.toString()}
            {'\n\n'}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#6A0DAD',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
