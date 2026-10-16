import { useCallback, useEffect, useState } from 'react';
import { rutaImagen } from '../constantes.js';

const RE_IMAGEN = /\.(jpe?g|png|webp|gif|avif)$/i;

/**
 * Fotos elegidas desde una carpeta del equipo. Se leen en el navegador y nunca
 * se suben: así las fotos reales no quedan en el repo ni en el sitio público.
 * Solo viven mientras la página está abierta; tras recargar hay que elegirlas de nuevo.
 */
export function useFotosLocales() {
  const [fotos, setFotos] = useState(() => new Map());

  // Cada object URL retiene el archivo en memoria hasta que se revoca.
  useEffect(() => () => fotos.forEach((url) => URL.revokeObjectURL(url)), [fotos]);

  const cargarFotos = useCallback((fileList) => {
    const nuevas = new Map();
    for (const archivo of fileList ?? []) {
      if (RE_IMAGEN.test(archivo.name)) {
        nuevas.set(archivo.name.toLowerCase(), URL.createObjectURL(archivo));
      }
    }
    setFotos(nuevas);
    return nuevas;
  }, []);

  const fotoDe = useCallback(
    (archivo) => fotos.get(archivo.toLowerCase()) ?? rutaImagen(archivo),
    [fotos],
  );

  return { fotos, cargarFotos, fotoDe };
}
