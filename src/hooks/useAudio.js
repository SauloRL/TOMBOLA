import { useCallback, useEffect, useRef } from 'react';
import { AUDIO_TICK, MS_ENTRE_TICKS, rutaAudio, rutaImagen } from '../constantes.js';

const TAMANO_POOL = 6;

/**
 * Sonido de la tómbola.
 *
 * El tick se reproduce decenas de veces por giro: se rota sobre un pool fijo de
 * instancias ya precargadas en vez de construir un Audio nuevo en cada sector,
 * que era lo que generaba cientos de descargas y objetos sin liberar.
 */
export function useAudio() {
  const pool = useRef(null);
  const siguiente = useRef(0);
  const ultimoTick = useRef(0);
  const sonidoPremio = useRef(null);

  const obtenerPool = useCallback(() => {
    if (pool.current === null) {
      pool.current = Array.from({ length: TAMANO_POOL }, () => {
        const audio = new Audio(rutaAudio(AUDIO_TICK));
        audio.preload = 'auto';
        audio.volume = 0.2;
        return audio;
      });
    }
    return pool.current;
  }, []);

  const reproducirTick = useCallback(() => {
    const ahora = performance.now();
    if (ahora - ultimoTick.current < MS_ENTRE_TICKS) return;
    ultimoTick.current = ahora;

    const instancias = obtenerPool();
    const audio = instancias[siguiente.current];
    siguiente.current = (siguiente.current + 1) % instancias.length;

    audio.currentTime = 0;
    // preservesPitch no existe en todos los navegadores; sin él el tick suena más grave.
    if ('preservesPitch' in audio) audio.preservesPitch = false;
    audio.playbackRate = 5.0;
    audio.play().catch(() => {});
  }, [obtenerPool]);

  const detenerPremio = useCallback(() => {
    const audio = sonidoPremio.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    sonidoPremio.current = null;
  }, []);

  const reproducirPremio = useCallback((archivo) => {
    detenerPremio();
    const audio = new Audio(rutaAudio(archivo));
    audio.volume = 0.4;
    sonidoPremio.current = audio;
    audio.play().catch(() => {});
  }, [detenerPremio]);

  /** Deja el pool listo tras el primer gesto del usuario (política de autoplay). */
  const prepararAudio = useCallback(() => {
    obtenerPool().forEach((audio) => audio.load());
  }, [obtenerPool]);

  useEffect(() => () => {
    detenerPremio();
    pool.current?.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    pool.current = null;
  }, [detenerPremio]);

  return { reproducirTick, reproducirPremio, detenerPremio, prepararAudio };
}

/**
 * Descarga las imágenes de los premios por adelantado para que el modal del
 * ganador no aparezca con el hueco en blanco mientras carga.
 */
export function usePrecargaImagenes(premios) {
  useEffect(() => {
    const unicas = [...new Set(premios.map((p) => p.imagen))];
    const imagenes = unicas.map((archivo) => {
      const img = new Image();
      img.src = rutaImagen(archivo);
      return img;
    });
    return () => imagenes.forEach((img) => { img.src = ''; });
  }, [premios]);
}
