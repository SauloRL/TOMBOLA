import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AUDIO_POR_DEFECTO,
  MS_ANUNCIO_CON_AUDIO_PROPIO,
  MS_ANUNCIO_ESTANDAR,
  MS_GIRO_MAX,
  MS_GIRO_MIN,
  VUELTAS_MAX,
  VUELTAS_MIN,
} from '../constantes.js';
import {
  TAU,
  anguloParaIndice,
  easeOutQuart,
  indiceBajoFlecha,
  normalizar,
} from '../utils/geometria.js';
import { aleatorioEntre, enteroAleatorio, validarPremios } from '../utils/premios.js';
import { useAudio, usePrecargaImagenes } from './useAudio.js';
import {
  borrarEstadoGuardado,
  leerEstadoGuardado,
  usePersistencia,
} from './usePersistencia.js';

/**
 * Estado y mecánica de la tómbola.
 *
 * El ganador se sortea con `crypto.getRandomValues` ANTES de animar y la rueda
 * se lleva hasta ese sector con una interpolación. Así el resultado no depende
 * de la física del giro ni de cuándo se detenga la animación.
 *
 * @param dibujarRef ref cuyo `.current` es la función de dibujo del canvas.
 */
export function useTombola(dibujarRef) {
  const guardado = useRef(null);
  if (guardado.current === null) guardado.current = leerEstadoGuardado();

  const [originales, setOriginales] = useState(guardado.current.originales);
  const [restantes, setRestantes] = useState(guardado.current.restantes);
  const [historial, setHistorial] = useState(guardado.current.historial);
  const [girando, setGirando] = useState(false);
  const [ganador, setGanador] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const anguloRef = useRef(0);
  const animacionRef = useRef(null);
  const detenerRef = useRef(false);
  const ultimoSectorRef = useRef(-1);

  const { reproducirTick, reproducirPremio, detenerPremio, prepararAudio } = useAudio();

  usePrecargaImagenes(restantes);
  usePersistencia(useMemo(
    () => ({ originales, restantes, historial }),
    [originales, restantes, historial],
  ));

  // `rapido` activa el trazo desde la imagen pre-rasterizada (solo durante el giro).
  const dibujar = useCallback((angulo, rapido = false) => {
    anguloRef.current = angulo;
    dibujarRef.current?.(angulo, rapido);
  }, [dibujarRef]);

  // Un giro en curso debe morir con el componente.
  useEffect(() => () => {
    if (animacionRef.current !== null) cancelAnimationFrame(animacionRef.current);
  }, []);

  // ---------------------------------------------------------------- CARGA

  const cargarArchivo = useCallback((file) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onerror = () =>
      setMensaje({ tipo: 'error', texto: 'No se pudo leer el archivo.' });

    reader.onload = (event) => {
      let datosRaw;
      try {
        datosRaw = JSON.parse(event.target.result);
      } catch {
        setMensaje({ tipo: 'error', texto: 'El archivo no es un JSON válido.' });
        return;
      }

      const { premios, errores } = validarPremios(datosRaw);

      if (premios.length === 0) {
        setMensaje({ tipo: 'error', texto: errores.join(' ') });
        return;
      }

      anguloRef.current = 0;
      setOriginales(premios);
      setRestantes(premios);
      setHistorial([]);
      setGanador(null);
      setMensaje(
        errores.length > 0
          ? { tipo: 'aviso', texto: `Se cargaron ${premios.length} premios. ${errores.join(' ')}` }
          : null,
      );
      prepararAudio();
    };

    reader.readAsText(file);
  }, [prepararAudio]);

  const reiniciar = useCallback(() => {
    if (originales.length === 0 || girando) return;
    anguloRef.current = 0;
    setRestantes(originales);
    setHistorial([]);
    setGanador(null);
    setMensaje(null);
    dibujar(0);
  }, [originales, girando, dibujar]);

  const limpiarTodo = useCallback(() => {
    if (girando) return;
    if (animacionRef.current !== null) cancelAnimationFrame(animacionRef.current);
    borrarEstadoGuardado();
    anguloRef.current = 0;
    setOriginales([]);
    setRestantes([]);
    setHistorial([]);
    setGanador(null);
    setMensaje(null);
    dibujar(0);
  }, [girando, dibujar]);

  // ----------------------------------------------------------------- GIRO

  const finalizar = useCallback((indice) => {
    const total = restantes.length;
    const premio = restantes[indice];
    if (!premio) {
      setGirando(false);
      return;
    }

    dibujar(anguloParaIndice(indice, total));
    setGirando(false);
    detenerRef.current = false;

    reproducirPremio(premio.audio);
    setHistorial((prev) => [...prev, { ...premio, ganadoEn: new Date().toISOString() }]);
    setGanador({
      premio,
      indice,
      tieneAudioPropio: premio.audio !== AUDIO_POR_DEFECTO,
    });
  }, [restantes, dibujar, reproducirPremio]);

  const girar = useCallback(() => {
    const total = restantes.length;
    if (girando || total === 0 || ganador) return;

    prepararAudio();

    if (total === 1) {
      finalizar(0);
      return;
    }

    const indiceGanador = enteroAleatorio(total);
    const anguloInicial = normalizar(anguloRef.current);
    const vueltas = Math.round(aleatorioEntre(VUELTAS_MIN, VUELTAS_MAX));
    const destino = anguloParaIndice(indiceGanador, total);
    const delta = normalizar(destino - anguloInicial) + vueltas * TAU;
    const duracion = aleatorioEntre(MS_GIRO_MIN, MS_GIRO_MAX);
    const inicio = performance.now();

    detenerRef.current = false;
    ultimoSectorRef.current = -1;
    setGirando(true);

    const paso = (ahora) => {
      const t = detenerRef.current
        ? 1
        : Math.min((ahora - inicio) / duracion, 1);

      const angulo = anguloInicial + delta * easeOutQuart(t);
      dibujar(angulo, true);

      const sector = indiceBajoFlecha(angulo, total);
      if (sector !== ultimoSectorRef.current) {
        reproducirTick();
        ultimoSectorRef.current = sector;
      }

      if (t < 1) {
        animacionRef.current = requestAnimationFrame(paso);
      } else {
        animacionRef.current = null;
        finalizar(indiceGanador);
      }
    };

    animacionRef.current = requestAnimationFrame(paso);
  }, [restantes, girando, ganador, prepararAudio, finalizar, dibujar, reproducirTick]);

  /** Lleva el giro a su final de inmediato; el ganador ya estaba decidido. */
  const detenerGiro = useCallback(() => {
    if (girando) detenerRef.current = true;
  }, [girando]);

  // ---------------------------------------------------------------- MODAL

  const cerrarModal = useCallback(() => {
    if (!ganador) return;
    detenerPremio();
    // El premio se retira al cerrar, no al ganar: así la rueda no se
    // reacomoda debajo del modal mientras se anuncia al ganador.
    const { indice } = ganador;
    setRestantes((prev) => prev.filter((_, i) => i !== indice));
    setGanador(null);
  }, [ganador, detenerPremio]);

  useEffect(() => {
    if (!ganador) return;
    const ms = ganador.tieneAudioPropio ? MS_ANUNCIO_CON_AUDIO_PROPIO : MS_ANUNCIO_ESTANDAR;
    const timer = setTimeout(cerrarModal, ms);
    return () => clearTimeout(timer);
  }, [ganador, cerrarModal]);

  // -------------------------------------------------------------- ESTATUS

  const estatus = useMemo(() => {
    if (mensaje) return mensaje;
    if (originales.length === 0) return { tipo: 'info', texto: 'Esperando archivo...' };
    if (restantes.length === 0) return { tipo: 'exito', texto: '¡RIFA FINALIZADA!' };
    if (girando) return { tipo: 'info', texto: 'Girando...' };
    return { tipo: 'info', texto: `Premios restantes: ${restantes.length}` };
  }, [mensaje, originales.length, restantes.length, girando]);

  return {
    originales,
    restantes,
    historial,
    girando,
    ganador,
    estatus,
    anguloRef,
    cargarArchivo,
    reiniciar,
    limpiarTodo,
    girar,
    detenerGiro,
    cerrarModal,
  };
}
