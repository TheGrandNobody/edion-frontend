import React from 'react';
import SlateEditorPage from '../components/SlateEditor/SlateEditorPage';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SlateEditor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen p-8">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error in SlateEditor</h1>
          <p className="mb-4">Something went wrong in the SlateEditor component:</p>
          <pre className="bg-red-50 p-4 rounded text-sm overflow-auto">
            {this.state.error?.message || 'Unknown error'}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const SlateDemo: React.FC = () => {
  return (
    <ErrorBoundary>
      <SlateEditorPage />
    </ErrorBoundary>
  );
};

export default SlateDemo; 