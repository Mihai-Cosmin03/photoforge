import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px',
          textAlign: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            fontSize: '3rem',
            marginBottom: '8px',
            opacity: 0.4,
            fontFamily: 'var(--font-heading)',
          }}
        >
          ⚠
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.8rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          Something went wrong
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.6 }}>
          An unexpected error occurred. Try refreshing the page or go back to safety.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            className="btn-ghost"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
          <Link to="/" className="btn-primary">
            Go home
          </Link>
        </div>
        {import.meta.env.DEV && this.state.error && (
          <pre
            style={{
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '10px',
              fontSize: '0.75rem',
              color: '#f87171',
              textAlign: 'left',
              maxWidth: '600px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {this.state.error.toString()}
          </pre>
        )}
      </div>
    )
  }
}
