import { useEffect } from 'react';

// Zonas que manejan Enter por su cuenta: dentro de ellas el atajo no interviene.
const ZONAS_PROPIAS = '.menu-content, .historial-panel, .card-ganador';

/**
 * Enter (o barra espaciadora) gira la ruleta desde cualquier parte de la página.
 *
 * Pensado para un botón físico de Enter en el escenario: la persona en turno lo
 * pulsa sin tener que apuntar con el ratón. El atajo se abstiene cuando el foco
 * ya está sobre un control que responde a Enter por sí mismo, para no disparar
 * el giro dos veces.
 */
export function useAtajoGiro(alGirar, activo) {
  useEffect(() => {
    if (!activo) return undefined;

    const alPulsar = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      // Mantener la tecla pulsada no debe encadenar giros.
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;

      const foco = document.activeElement;
      if (foco instanceof HTMLElement) {
        const etiqueta = foco.tagName;
        if (etiqueta === 'INPUT' || etiqueta === 'TEXTAREA' || etiqueta === 'SELECT') return;
        // El navegador ya convierte Enter en un clic sobre el botón enfocado.
        if (etiqueta === 'BUTTON' || foco.closest(ZONAS_PROPIAS)) return;
      }

      e.preventDefault();
      alGirar();
    };

    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [alGirar, activo]);
}
