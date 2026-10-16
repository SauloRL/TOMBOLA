import { useEffect, useRef, useState } from 'react';
import { IMAGEN_POR_DEFECTO, MS_BLOQUEO_CIERRE, rutaImagen } from '../constantes.js';
import Confeti from './Confeti.jsx';

/**
 * Anuncio del ganador. Es un diálogo modal real: atrapa el foco, se cierra con
 * Escape y devuelve el foco al elemento que lo abrió.
 */
export default function WinnerModal({ ganador, onCerrar }) {
  const cajaRef = useRef(null);
  const botonRef = useRef(null);
  const focoPrevioRef = useRef(null);
  const [aceptaCierre, setAceptaCierre] = useState(false);
  // El listener de teclado se registra una sola vez; lee el permiso por ref para
  // no tener que reinstalarse (y volver a mover el foco) al vencer el bloqueo.
  const aceptaCierreRef = useRef(false);
  aceptaCierreRef.current = aceptaCierre;

  // Con un botón físico de Enter en el escenario, el mismo pulso que lanzó el
  // giro puede repetirse por nervios: durante este instante el anuncio no se
  // cierra con el teclado, para que el premio alcance a leerse.
  useEffect(() => {
    const t = setTimeout(() => setAceptaCierre(true), MS_BLOQUEO_CIERRE);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    focoPrevioRef.current = document.activeElement;
    // Se enfoca el diálogo y no el botón de cerrar: si el botón tuviera el foco,
    // el navegador convertiría Enter en un clic y se saltaría el bloqueo inicial.
    cajaRef.current?.focus();

    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const alPulsar = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (aceptaCierreRef.current) onCerrar();
        return;
      }
      if (e.key !== 'Tab') return;

      // Solo hay un control enfocable dentro; Tab no debe escaparse del diálogo.
      const enfocables = cajaRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!enfocables || enfocables.length === 0) return;

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener('keydown', alPulsar);
    return () => {
      document.removeEventListener('keydown', alPulsar);
      document.body.style.overflow = previo;
      focoPrevioRef.current?.focus?.();
    };
  }, [onCerrar]);

  const { premio } = ganador;

  return (
    <div
      id="anuncio-ganador"
      onClick={aceptaCierre ? onCerrar : undefined}
      role="presentation"
    >
      <Confeti />
      <div
        className="card-ganador"
        ref={cajaRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-ganador"
        aria-describedby="nombre-ganador"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="titulo-anuncio" id="titulo-ganador">¡FELICIDADES!</h2>

        <div className="contenedor-img">
          <img
            src={rutaImagen(premio.imagen)}
            alt={`Premio: ${premio.nombre}`}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = rutaImagen(IMAGEN_POR_DEFECTO);
            }}
          />
        </div>

        <h3 className="nombre-premio" id="nombre-ganador">{premio.nombre}</h3>

        <button
          type="button"
          className="btn-cerrar-modal"
          ref={botonRef}
          onClick={onCerrar}
          disabled={!aceptaCierre}
        >
          Cerrar
        </button>
        <p className="instruccion">
          {aceptaCierre
            ? 'Pulsa Enter para continuar con el siguiente premio'
            : 'Un momento…'}
        </p>
      </div>
    </div>
  );
}
