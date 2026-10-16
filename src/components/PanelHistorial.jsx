import { useEffect, useRef } from 'react';

const formatoHora = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const horaDe = (iso) => {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '' : formatoHora.format(fecha);
};

/** Cajón lateral con los premios ya entregados. Se abre desde el menú ☰. */
export default function PanelHistorial({ historial, abierto, onCerrar }) {
  const panelRef = useRef(null);
  const focoPrevioRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;

    focoPrevioRef.current = document.activeElement;
    panelRef.current?.focus();

    const alPulsar = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPulsar);

    return () => {
      document.removeEventListener('keydown', alPulsar);
      focoPrevioRef.current?.focus?.();
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <>
      <div className="historial-fondo" onClick={onCerrar} role="presentation" />

      <aside
        className="historial-panel"
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="historial-titulo"
      >
        <div className="historial-encabezado">
          <h2 id="historial-titulo">Ya sorteados ({historial.length})</h2>
          <button type="button" className="btn-icon" onClick={onCerrar} aria-label="Cerrar historial">
            ✕
          </button>
        </div>

        {historial.length === 0 ? (
          <p className="historial-vacio">Todavía no se ha sorteado ningún premio.</p>
        ) : (
          <ol className="historial-lista">
            {historial.map((premio, i) => (
              <li key={`${premio.id ?? premio.nombre}-${i}`}>
                <span className="historial-orden">{i + 1}</span>
                <span
                  className="historial-punto"
                  style={{ backgroundColor: premio.color }}
                  aria-hidden="true"
                />
                <span className="historial-nombre">{premio.nombre}</span>
                <span className="historial-hora">{horaDe(premio.ganadoEn)}</span>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </>
  );
}
