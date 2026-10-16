import { useEffect, useRef } from 'react';
import { PALETA_COLORES } from '../constantes.js';

const NUM_PARTICULAS = 160;
const GRAVEDAD = 0.22;
const ROCE = 0.995;
const MS_VIDA = 4500;

const aleatorio = (min, max) => min + Math.random() * (max - min);

function crearParticula(ancho, alto) {
  // Salen desde las dos esquinas inferiores, como un cañón de confeti real.
  const desdeIzquierda = Math.random() < 0.5;
  const angulo = desdeIzquierda ? aleatorio(-1.3, -0.5) : aleatorio(-2.65, -1.85);
  const fuerza = aleatorio(14, 24);

  return {
    x: desdeIzquierda ? 0 : ancho,
    y: alto,
    vx: Math.cos(angulo) * fuerza,
    vy: Math.sin(angulo) * fuerza,
    ancho: aleatorio(6, 12),
    alto: aleatorio(8, 16),
    color: PALETA_COLORES[Math.floor(Math.random() * PALETA_COLORES.length)],
    giro: aleatorio(0, Math.PI * 2),
    velGiro: aleatorio(-0.2, 0.2),
  };
}

/**
 * Lluvia de confeti sobre el anuncio del ganador.
 *
 * Es un canvas propio en lugar de una librería: son pocas líneas y evita sumar
 * una dependencia al proyecto. Se desactiva si el sistema pide menos animación.
 */
export default function Confeti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let ancho = window.innerWidth;
    let alto = window.innerHeight;

    const ajustar = () => {
      ancho = window.innerWidth;
      alto = window.innerHeight;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
    };
    ajustar();
    window.addEventListener('resize', ajustar);

    const ctx = canvas.getContext('2d');
    const particulas = Array.from({ length: NUM_PARTICULAS }, () => crearParticula(ancho, alto));

    const inicio = performance.now();
    let frameId = null;

    const paso = (ahora) => {
      const transcurrido = ahora - inicio;
      if (transcurrido > MS_VIDA) return;

      // Se desvanece en el último segundo en lugar de cortarse de golpe.
      const opacidad = Math.min(1, (MS_VIDA - transcurrido) / 1000);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, ancho, alto);
      ctx.globalAlpha = opacidad;

      for (const p of particulas) {
        p.vy += GRAVEDAD;
        p.vx *= ROCE;
        p.vy *= ROCE;
        p.x += p.vx;
        p.y += p.vy;
        p.giro += p.velGiro;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.giro);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.ancho / 2, -p.alto / 2, p.ancho, p.alto);
        ctx.restore();
      }

      frameId = requestAnimationFrame(paso);
    };

    frameId = requestAnimationFrame(paso);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener('resize', ajustar);
    };
  }, []);

  return <canvas className="confeti" ref={canvasRef} aria-hidden="true" />;
}
