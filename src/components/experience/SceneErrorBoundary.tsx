import { Component, type ErrorInfo, type ReactNode } from 'react';

export class SceneErrorBoundary extends Component<
  { children: ReactNode; onFailure: (message: string) => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV)
      console.error('Taquería scene failed', error, info.componentStack);
    this.props.onFailure(
      'The interactive stand could not load. You can still explore the portfolio.',
    );
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
