import React from "react";
import Center from "./Center";
import { Typography } from "@mui/material";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Center>
          <Typography variant="h4">Error</Typography>
          {this.state.error.message}
        </Center>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
