import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Auth Error Caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.state.error?.message === "CORS_ERROR") {
        return (
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-red-500">
              Connection Error
            </h3>
            <p className="text-sm text-gray-500">
              Unable to connect to the authentication service. Please try again
              later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Retry
            </button>
          </div>
        );
      }

      return (
        this.props.fallback || (
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-red-500">
              Authentication Error
            </h3>
            <p className="text-sm text-gray-500">
              Please try logging in again.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
