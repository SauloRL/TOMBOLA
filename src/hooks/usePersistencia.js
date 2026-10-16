import { useEffect, useState } from 'react';
import { CLAVE_ALMACENAMIENTO } from '../constantes.js';

const ESTADO_VACIO = { originales: [], restantes: [], historial: [] };

const esArregloDePremios = (valor) =>
  Array.isArray(valor) && valor.every((p) => p && typeof p.nombre === 'string');

/** Lee el estado guardado. Cualquier dato corrupto se descarta en silencio. */
export function leerEstadoGuardado() {
  try {
    const crudo = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!crudo) return ESTADO_VACIO;

    const datos = JSON.parse(crudo);
    if (
      !esArregloDePremios(datos?.originales) ||
      !esArregloDePremios(datos?.restantes) ||
      !esArregloDePremios(datos?.historial)
    ) {
      return ESTADO_VACIO;
    }
    return datos;
  } catch {
    return ESTADO_VACIO;
  }
}

export function borrarEstadoGuardado() {
  try {
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
  } catch {
    // Modo privado o almacenamiento bloqueado: la app sigue funcionando sin persistir.
  }
}

/** Guarda el estado cada vez que cambia, sin romper si localStorage no está disponible. */
export function usePersistencia(estado) {
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    if (!disponible) return;
    if (estado.originales.length === 0 && estado.historial.length === 0) return;

    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(estado));
    } catch {
      setDisponible(false);
    }
  }, [estado, disponible]);
}
