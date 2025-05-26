import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{
          padding: '20px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          color: '#333'
        }}>
          <h2>Oops! Something went wrong.</h2>
          <p>We are experiencing some issues. Please try again later.</p>
          {/* Optionally display error details in development */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', marginTop: '20px' }}>
              <summary>Error Details</summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 