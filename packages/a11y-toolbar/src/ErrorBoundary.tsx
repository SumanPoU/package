"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Optional label for the fallback message. */
  label?: string;
};

type State = { hasError: boolean };

/**
 * Isolates panel UI failures so the host page and launcher stay usable.
 */
export class A11yPanelErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[@itzsa/a11y-toolbar] panel error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="itzsa-a11y-panel-error" role="alert">
          {this.props.label ??
            "Something went wrong loading this control. Try closing and reopening the panel."}
        </div>
      );
    }
    return this.props.children;
  }
}
