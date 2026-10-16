import { useCallback, useEffect, useState } from 'react';

/** Control de la Fullscreen API, para proyectar sin la barra del navegador. */
export function usePantallaCompleta() {
  const [activa, setActiva] = useState(false);

  useEffect(() => {
    // El usuario puede salir con Escape sin pasar por el botón.
    const alCambiar = () => setActiva(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', alCambiar);
    return () => document.removeEventListener('fullscreenchange', alCambiar);
  }, []);

  const alternar = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  }, []);

  return { activa, alternar };
}
