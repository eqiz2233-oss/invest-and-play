import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("FinGame Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="card-game text-center max-w-md w-full">
            <span className="text-5xl mb-4 block">😵</span>
            <h2 className="text-2xl font-black text-foreground mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              className="btn-playful bg-primary text-primary-foreground px-8 py-3 w-full"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
            >
              🔄 Restart App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
