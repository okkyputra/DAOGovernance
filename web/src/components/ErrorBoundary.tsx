"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-5 text-sm text-red-400">
          Something went wrong rendering this section.
          {this.state.message && <p className="mt-1 text-xs opacity-70">{this.state.message}</p>}
        </div>
      );
    }
    return this.props.children;
  }
}
