import { Component, type ReactNode, type ErrorInfo } from 'react';
import { View, Text, type ViewStyle, type TextStyle } from 'react-native';

interface ErrorBoundaryProps {
  onError?: (error: Error) => void;
  fallback?: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches rendering errors in the HTML renderer tree and
 * displays a fallback UI instead of crashing the host app.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.error(
        '[HtmlRenderer] Render error caught by ErrorBoundary:',
        error,
        info.componentStack
      );
    }
    this.props.onError?.(error);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <View style={fallbackContainer}>
          <Text style={fallbackTitle}>Unable to render HTML content</Text>
          {__DEV__ && this.state.error && (
            <Text style={fallbackDetail}>{this.state.error.message}</Text>
          )}
        </View>
      );
    }
    return this.props.children;
  }
}

const fallbackContainer: ViewStyle = {
  padding: 16,
  backgroundColor: '#fef2f2',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#fecaca',
};

const fallbackTitle: TextStyle = {
  color: '#991b1b',
  fontSize: 14,
  fontWeight: '600',
};

const fallbackDetail: TextStyle = {
  color: '#b91c1c',
  fontSize: 12,
  marginTop: 4,
};
