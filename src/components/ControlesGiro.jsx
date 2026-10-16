/**
 * Controles flotantes bajo la rueda. El botón de girar desaparece mientras la
 * rueda se mueve y mientras se anuncia al ganador; reaparece al cerrar el
 * anuncio, que es la señal de que le toca a la siguiente persona.
 */
export default function ControlesGiro({ hayPremios, girando, anunciando, estatus, onGirar, onDetener }) {
  const mostrarGirar = hayPremios && !girando && !anunciando;

  return (
    <div className="controles-flotantes">
      {mostrarGirar && (
        <button type="button" id="btnGirar" onClick={onGirar}>
          ¡GIRAR RUEDA!
          <span className="btnGirar-atajo">o presiona Enter</span>
        </button>
      )}

      {girando && (
        <button type="button" className="btn-detener" onClick={onDetener}>
          Detener ahora
        </button>
      )}

      <p id="statusInfo" className={`estatus estatus--${estatus.tipo}`} role="status" aria-live="polite">
        {estatus.texto}
      </p>
    </div>
  );
}
