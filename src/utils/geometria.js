export const TAU = Math.PI * 2;

export const normalizar = (angulo) => ((angulo % TAU) + TAU) % TAU;

export const arcoDe = (numSecciones) => TAU / numSecciones;

/**
 * Sector que queda bajo la flecha (fija en el ángulo 0, al costado derecho).
 * La rueda se dibuja con el sector i entre i*arco y (i+1)*arco, y luego se rota
 * `angulo`, por eso el índice se obtiene invirtiendo esa rotación.
 */
export function indiceBajoFlecha(angulo, numSecciones) {
  if (numSecciones <= 0) return -1;
  const arco = arcoDe(numSecciones);
  const indice = Math.floor((numSecciones - normalizar(angulo) / arco) % numSecciones);
  // Protege contra el borde exacto donde el módulo devuelve numSecciones.
  return ((indice % numSecciones) + numSecciones) % numSecciones;
}

/** Ángulo (normalizado) que deja el centro del sector `indice` bajo la flecha. */
export function anguloParaIndice(indice, numSecciones) {
  const arco = arcoDe(numSecciones);
  return normalizar(TAU - (indice + 0.5) * arco);
}

/** Desaceleración de la rueda: rápida al inicio, asentamiento largo al final. */
export const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
