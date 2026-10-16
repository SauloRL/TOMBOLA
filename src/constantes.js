// Ruta base servida por Vite; contempla despliegues bajo un subdirectorio.
export const BASE = import.meta.env.BASE_URL;

export const rutaAudio = (archivo) => `${BASE}assets/audio/${archivo}`;
export const rutaImagen = (archivo) => `${BASE}assets/img/${archivo}`;

export const AUDIO_TICK = 'tick.mp3';
export const AUDIO_POR_DEFECTO = 'aplausos.mp3';
export const IMAGEN_POR_DEFECTO = 'default.jpeg';

// Duración del modal del ganador: más tiempo si el premio trae su propio audio.
export const MS_ANUNCIO_CON_AUDIO_PROPIO = 10000;
export const MS_ANUNCIO_ESTANDAR = 5000;

// El anuncio ignora el teclado un instante: con un botón físico de Enter en el
// escenario, un segundo pulso nervioso cerraría el premio antes de poder leerlo.
export const MS_BLOQUEO_CIERRE = 1500;

// Parámetros del giro dirigido (el ganador ya está elegido antes de animar).
export const MS_GIRO_MIN = 6000;
export const MS_GIRO_MAX = 8500;
export const VUELTAS_MIN = 5;
export const VUELTAS_MAX = 8;
export const MS_ENTRE_TICKS = 40;

export const CLAVE_ALMACENAMIENTO = 'tombola-estado-v1';

export const PALETA_COLORES = [
  '#FF5252', '#FFEB3B', '#2196F3', '#4CAF50',
  '#FF9800', '#E91E63', '#00BCD4', '#9C27B0',
];
