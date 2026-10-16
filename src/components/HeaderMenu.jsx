import { useEffect, useRef, useState } from 'react';
import { usePantallaCompleta } from '../hooks/usePantallaCompleta.js';

/** Barra superior: título, contador de avance y menú de opciones. */
export default function HeaderMenu({
  hayDatos,
  girando,
  totalPremios,
  premiosRestantes,
  totalSorteados,
  onCargar,
  onReiniciar,
  onLimpiar,
  onVerHistorial,
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);
  const inputRef = useRef(null);
  const botonRef = useRef(null);
  const { activa: enPantallaCompleta, alternar: alternarPantallaCompleta } = usePantallaCompleta();

  useEffect(() => {
    if (!abierto) return;

    const alClicFuera = (e) => {
      if (!contenedorRef.current?.contains(e.target)) setAbierto(false);
    };
    const alPulsar = (e) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        botonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', alClicFuera);
    document.addEventListener('keydown', alPulsar);
    return () => {
      document.removeEventListener('mousedown', alClicFuera);
      document.removeEventListener('keydown', alPulsar);
    };
  }, [abierto]);

  const ejecutar = (accion) => {
    setAbierto(false);
    accion();
  };

  const confirmarReinicio = () => {
    if (window.confirm('¿Reiniciar la rifa? Se restaurarán todos los premios y se borrará el historial.')) {
      onReiniciar();
    }
  };

  const confirmarLimpieza = () => {
    if (window.confirm('¿Descargar los premios y borrar el avance guardado? Esta acción no se puede deshacer.')) {
      onLimpiar();
    }
  };

  return (
    <header className="main-header">
      <h1 id="tituloHeader">RULETA DE REGALOS 2026</h1>

      <div className="header-derecha">
        {hayDatos && (
          <p className="contador-avance" aria-live="polite">
            <strong>{premiosRestantes}</strong>
            <span className="contador-sep">de</span>
            <strong>{totalPremios}</strong>
            <span className="contador-etiqueta">por sortear</span>
          </p>
        )}

        <button
          type="button"
          className="btn-icon"
          onClick={alternarPantallaCompleta}
          aria-label={enPantallaCompleta ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
          title={enPantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {enPantallaCompleta ? '⤡' : '⛶'}
        </button>

        <div className="menu-desplegable" ref={contenedorRef}>
          <button
            type="button"
            className="btn-icon"
            ref={botonRef}
            onClick={() => setAbierto((v) => !v)}
            aria-label="Abrir menú de opciones"
            aria-expanded={abierto}
            aria-haspopup="menu"
          >
            ☰
          </button>

          <div className={`menu-content ${abierto ? 'show' : ''}`} role="menu">
            <button type="button" role="menuitem" onClick={() => ejecutar(() => inputRef.current?.click())}>
              📂 Cargar JSON
            </button>

            {totalSorteados > 0 && (
              <button type="button" role="menuitem" onClick={() => ejecutar(onVerHistorial)}>
                🏆 Ver sorteados ({totalSorteados})
              </button>
            )}

            {hayDatos && (
              <>
                <button
                  type="button"
                  role="menuitem"
                  disabled={girando}
                  onClick={() => ejecutar(confirmarReinicio)}
                >
                  🔄 Reiniciar rifa
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={girando}
                  onClick={() => ejecutar(confirmarLimpieza)}
                >
                  🗑️ Descargar premios
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={inputRef}
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          onCargar(e.target.files?.[0]);
          // Permite volver a elegir el mismo archivo después de corregirlo.
          e.target.value = '';
        }}
      />
    </header>
  );
}
