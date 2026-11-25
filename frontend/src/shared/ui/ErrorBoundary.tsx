import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Ocean Detective UI]', error.name, info.componentStack);
  }
  render() {
    return this.state.failed ? (
      <main className="od-panel" role="alert">
        <h1>Something went wrong</h1>
        <p>The interface could not be displayed.</p>
        <button className="od-button" onClick={() => window.location.reload()}>
          Reload application
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
