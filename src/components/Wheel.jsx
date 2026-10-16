import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TAU, arcoDe } from '../utils/geometria.js';

const RADIO_CUBO = 20;

const tamanoFuente = (numSecciones) => {
  if (numSecciones > 50) return 12;
  if (numSecciones > 30) return 14;
  if (numSecciones > 15) return 16;
  return 18;
};

/** Recorta el nombre con puntos suspensivos si no cabe en el sector. */
function textoQueCabe(ctx, texto, anchoMax) {
  if (ctx.measureText(texto).width <= anchoMax) return texto;

  let corte = texto.length;
  while (corte > 1 && ctx.measureText(`${texto.slice(0, corte)}…`).width > anchoMax) {
    corte -= 1;
  }
  return `${texto.slice(0, corte)}…`;
}

function dibujarEstadoVacio(ctx, lado) {
  const centro = lado / 2;
  ctx.clearRect(0, 0, lado, lado);
  ctx.beginPath();
  ctx.fillStyle = '#f1c40f';
  ctx.arc(centro, centro, centro - 15, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.fillStyle = '#000';
  ctx.font = `bold ${Math.max(14, lado * 0.042)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ESPERANDO DATOS...', centro, centro);
}

/**
 * Rueda de la tómbola.
 *
 * Los sectores se rasterizan una sola vez en un canvas fuera de pantalla; cada
 * cuadro de la animación solo rota esa imagen, en lugar de volver a trazar N
 * arcos y N textos 60 veces por segundo. Estando quieta se redibuja de forma
 * vectorial para que el texto quede nítido.
 */
export default function Wheel({ premios, anguloRef, dibujarRef, puedeGirar, onGirar }) {
  const contenedorRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const [lado, setLado] = useState(0);

  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;

  // Sigue el tamaño real del contenedor para que el buffer coincida con los
  // píxeles físicos y la rueda no se vea borrosa en pantallas HiDPI.
  useLayoutEffect(() => {
    const nodo = contenedorRef.current;
    if (!nodo) return;

    const observer = new ResizeObserver(([entrada]) => {
      const { width, height } = entrada.contentRect;
      const medida = Math.floor(Math.min(width, height));
      if (medida > 0) setLado(medida);
    });

    observer.observe(nodo);
    return () => observer.disconnect();
  }, []);

  /** Traza los sectores en el contexto dado, sin rotación. */
  const trazarSectores = useCallback((ctx, medida) => {
    const centro = medida / 2;
    const radio = centro - 5;
    ctx.clearRect(0, 0, medida, medida);

    if (premios.length === 1) {
      const premio = premios[0];
      ctx.beginPath();
      ctx.fillStyle = premio.color;
      ctx.arc(centro, centro, radio, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.font = `bold ${Math.max(16, medida * 0.048)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(textoQueCabe(ctx, premio.nombre, radio * 1.6), centro, centro);
      return;
    }

    const numSecciones = premios.length;
    const arco = arcoDe(numSecciones);
    const fuente = Math.max(9, tamanoFuente(numSecciones) * (medida / 630));

    premios.forEach((premio, i) => {
      const desde = i * arco;

      ctx.beginPath();
      ctx.fillStyle = premio.color;
      ctx.moveTo(centro, centro);
      ctx.arc(centro, centro, radio, desde, desde + arco);
      ctx.lineTo(centro, centro);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.save();
      ctx.translate(centro, centro);
      ctx.rotate(desde + arco / 2);
      ctx.fillStyle = '#000';
      ctx.font = `bold ${fuente}px Arial`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        textoQueCabe(ctx, premio.nombre, radio - RADIO_CUBO - 20),
        radio - 10,
        0,
      );
      ctx.restore();
    });
  }, [premios]);

  const dibujarCubo = useCallback((ctx, medida) => {
    if (premios.length < 2) return;
    const centro = medida / 2;
    ctx.beginPath();
    ctx.fillStyle = '#fff534';
    ctx.arc(centro, centro, RADIO_CUBO * (medida / 630), 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [premios.length]);

  // Rasteriza la rueda cada vez que cambian los premios o el tamaño.
  useEffect(() => {
    if (lado === 0 || premios.length === 0) {
      offscreenRef.current = null;
      return;
    }

    const buffer = document.createElement('canvas');
    buffer.width = Math.round(lado * dpr);
    buffer.height = Math.round(lado * dpr);

    const ctx = buffer.getContext('2d');
    ctx.scale(dpr, dpr);
    trazarSectores(ctx, lado);

    offscreenRef.current = buffer;
  }, [premios, lado, dpr, trazarSectores]);

  /**
   * @param angulo rotación actual de la rueda en radianes.
   * @param rapido usa la imagen pre-rasterizada (giro); si es falso, traza vectorial.
   */
  const dibujar = useCallback((angulo, rapido = false) => {
    const canvas = canvasRef.current;
    if (!canvas || lado === 0) return;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (premios.length === 0) {
      dibujarEstadoVacio(ctx, lado);
      return;
    }

    const centro = lado / 2;
    ctx.clearRect(0, 0, lado, lado);

    const buffer = offscreenRef.current;
    if (rapido && buffer) {
      ctx.save();
      ctx.translate(centro, centro);
      ctx.rotate(angulo);
      ctx.translate(-centro, -centro);
      ctx.drawImage(buffer, 0, 0, lado, lado);
      ctx.restore();
    } else {
      ctx.save();
      ctx.translate(centro, centro);
      ctx.rotate(angulo);
      ctx.translate(-centro, -centro);
      trazarSectores(ctx, lado);
      ctx.restore();
    }

    dibujarCubo(ctx, lado);
  }, [lado, dpr, premios.length, trazarSectores, dibujarCubo]);

  // Publica la función de dibujo hacia el hook que controla la animación.
  useEffect(() => {
    dibujarRef.current = dibujar;
    return () => { dibujarRef.current = null; };
  }, [dibujar, dibujarRef]);

  // Redibuja ante cualquier cambio de datos, tamaño o resolución.
  useEffect(() => {
    dibujar(anguloRef.current);
  }, [dibujar, anguloRef, premios, lado]);

  return (
    <div
      className={`contenedor-tombola ${puedeGirar ? 'clicable' : ''}`}
      ref={contenedorRef}
      // Con decenas de personas pasando al frente, dar un manotazo a la rueda es
      // más natural que buscar el botón. El botón sigue ahí para teclado y
      // lectores de pantalla, así que esta zona no necesita rol propio.
      onClick={puedeGirar ? onGirar : undefined}
      title={puedeGirar ? 'Toca la ruleta para girar' : undefined}
    >
      <div className="flecha" aria-hidden="true" />
      <canvas
        id="tombola"
        ref={canvasRef}
        width={Math.max(1, Math.round(lado * dpr))}
        height={Math.max(1, Math.round(lado * dpr))}
        style={{ width: lado || '100%', height: lado || '100%' }}
        role="img"
        aria-label={
          premios.length === 0
            ? 'Ruleta sin premios cargados'
            : `Ruleta con ${premios.length} premios: ${premios.map((p) => p.nombre).join(', ')}`
        }
      />
    </div>
  );
}
