import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h2 className="text-lg font-semibold text-red-800">Error en el componente</h2>
                            <p className="text-red-700">No se pudo cargar este componente correctamente.</p>
                        </div>
                    </div>
                    
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details className="mt-4">
                            <summary className="cursor-pointer text-red-600 font-medium hover:text-red-800">
                                Ver detalles del error
                            </summary>
                            <div className="mt-2 p-4 bg-red-100 rounded border text-sm">
                                <pre className="whitespace-pre-wrap text-red-800">
                                    {this.state.error && this.state.error.toString()}
                                    <br />
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        </details>
                    )}
                    
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Recargar página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;