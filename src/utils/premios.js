import {
  AUDIO_POR_DEFECTO,
  IMAGEN_POR_DEFECTO,
  PALETA_COLORES,
} from '../constantes.js';

// Los nombres de archivo vienen del JSON del usuario y terminan en una URL:
// se restringen a un nombre plano con extensión conocida para que no puedan
// salir de public/assets.
const RE_AUDIO = /^[\w-]+(\.[\w-]+)*\.(mp3|ogg|wav|m4a)$/i;
const RE_IMAGEN = /^[\w-]+(\.[\w-]+)*\.(jpe?g|png|webp|gif|avif)$/i;
const RE_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const archivoSeguro = (valor, regex, porDefecto) => {
  if (typeof valor !== 'string') return porDefecto;
  const limpio = valor.trim();
  if (!limpio || limpio.includes('..') || !regex.test(limpio)) return porDefecto;
  return limpio;
};

/**
 * Convierte el JSON crudo en premios normalizados.
 * Nunca lanza: devuelve los premios válidos y la lista de problemas encontrados.
 */
export function validarPremios(datosRaw) {
  const errores = [];

  if (!Array.isArray(datosRaw)) {
    return { premios: [], errores: ['El archivo debe contener un arreglo de premios.'] };
  }
  if (datosRaw.length === 0) {
    return { premios: [], errores: ['El archivo no contiene ningún premio.'] };
  }

  const premios = [];

  datosRaw.forEach((item, index) => {
    const fila = index + 1;

    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      errores.push(`Elemento ${fila}: se esperaba un objeto.`);
      return;
    }

    const nombre = typeof item.nombre === 'string' ? item.nombre.trim() : '';
    if (!nombre) {
      errores.push(`Elemento ${fila}: falta la propiedad "nombre".`);
      return;
    }

    const colorCrudo = typeof item.color === 'string' ? item.color.trim() : '';
    const color = RE_COLOR.test(colorCrudo)
      ? colorCrudo
      : PALETA_COLORES[premios.length % PALETA_COLORES.length];
    if (colorCrudo && !RE_COLOR.test(colorCrudo)) {
      errores.push(`Elemento ${fila}: color "${colorCrudo}" inválido, se usó uno de la paleta.`);
    }

    premios.push({
      id: `${fila}-${nombre}`,
      nombre,
      color,
      audio: archivoSeguro(item.audio, RE_AUDIO, AUDIO_POR_DEFECTO),
      // El JSON original mezcla "Imagen" e "imagen".
      imagen: archivoSeguro(item.Imagen ?? item.imagen, RE_IMAGEN, IMAGEN_POR_DEFECTO),
    });
  });

  if (premios.length === 0) {
    errores.push('Ningún elemento del archivo resultó válido.');
  }

  return { premios, errores };
}

/** Entero uniforme en [0, max) usando el CSPRNG del navegador. */
export function enteroAleatorio(max) {
  if (max <= 1) return 0;
  // Se descarta la cola del rango para que el módulo no sesgue el resultado.
  const limite = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  let valor;
  do {
    crypto.getRandomValues(buffer);
    valor = buffer[0];
  } while (valor >= limite);
  return valor % max;
}

export const aleatorioEntre = (min, max) => min + Math.random() * (max - min);
