import { Component } from 'react';

/** Evita que un fallo de render deje la pantalla en blanco en pleno evento. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Fallo en la tómbola:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="pantalla-error" role="alert">
        <h1>Ocurrió un error</h1>
        <p>{this.state.error.message}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Recargar la aplicación
        </button>
      </div>
    );
  }
}
