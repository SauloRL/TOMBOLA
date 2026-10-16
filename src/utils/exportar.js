const formatoFecha = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' });
const formatoHora = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const horaDe = (iso) => {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '' : ` (${formatoHora.format(fecha)})`;
};

export function textoSorteados(historial) {
  const lineas = historial.map((p, i) => `${i + 1}. ${p.nombre}${horaDe(p.ganadoEn)}`);
  return [`SORTEADOS (${historial.length}) - ${formatoFecha.format(new Date())}`, '', ...lineas].join('\n');
}

export function textoPendientes(restantes) {
  const lineas = restantes.map((p) => `- ${p.nombre}`);
  return [`PENDIENTES (${restantes.length}) - ${formatoFecha.format(new Date())}`, '', ...lineas].join('\n');
}

/**
 * En tablet o celular abre el menú de compartir del sistema (WhatsApp incluido);
 * donde no existe, descarga el .txt.
 */
export async function compartirTxt(nombreArchivo, texto) {
  const archivo = new File([texto], nombreArchivo, { type: 'text/plain' });

  if (navigator.canShare?.({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: nombreArchivo });
      return;
    } catch (error) {
      // Cancelar el menú de compartir no debe terminar en una descarga.
      if (error?.name === 'AbortError') return;
    }
  }

  descargarTxt(nombreArchivo, texto);
}

export function descargarTxt(nombreArchivo, texto) {
  const archivo = new File([texto], nombreArchivo, { type: 'text/plain' });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}
