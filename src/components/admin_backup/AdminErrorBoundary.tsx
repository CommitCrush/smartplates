import React from "react";

interface AdminErrorBoundaryProps {
  children: React.ReactNode;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends React.Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optional: Logging an externen Service senden
    // logger.log(error, errorInfo);
    console.error("AdminErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-destructive">
          <h2 className="text-2xl font-bold mb-2">Ein Fehler ist aufgetreten</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
