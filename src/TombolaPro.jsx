import { useRef, useState } from 'react';
import ControlesGiro from './components/ControlesGiro.jsx';
import HeaderMenu from './components/HeaderMenu.jsx';
import PanelHistorial from './components/PanelHistorial.jsx';
import Wheel from './components/Wheel.jsx';
import WinnerModal from './components/WinnerModal.jsx';
import { IMAGEN_POR_DEFECTO } from './constantes.js';
import { useAtajoGiro } from './hooks/useAtajoGiro.js';
import { useFotosLocales } from './hooks/useFotosLocales.js';
import { useTombola } from './hooks/useTombola.js';
import { compartirTxt, descargarTxt, textoPendientes, textoSorteados } from './utils/exportar.js';
import './TombolaPro.css';

export default function TombolaPro() {
  // Wheel publica aquí su función de dibujo; el hook la invoca en cada cuadro.
  const dibujarRef = useRef(null);
  const [historialAbierto, setHistorialAbierto] = useState(false);

  const {
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
    cerrarModal,
  } = useTombola(dibujarRef);

  const { fotos, cargarFotos, fotoDe } = useFotosLocales();

  const alCargarFotos = (fileList) => {
    const nuevas = cargarFotos(fileList);
    const faltantes = [...new Set(
      originales
        .map((p) => p.imagen)
        .filter((img) => img !== IMAGEN_POR_DEFECTO && !nuevas.has(img.toLowerCase())),
    )];
    window.alert(
      `Se cargaron ${nuevas.size} fotos.` +
      (faltantes.length > 0 ? `\nNo se encontraron: ${faltantes.join(', ')}` : ''),
    );
  };

  const puedeGirar = restantes.length > 0 && !girando && !ganador;

  // Enter dispara el giro desde cualquier parte: el evento se opera con un solo
  // botón físico, sin tener que apuntar con el ratón en cada turno.
  useAtajoGiro(girar, puedeGirar && !historialAbierto);

  return (
    <div className="tombola-app">
      <HeaderMenu
        hayDatos={originales.length > 0}
        girando={girando}
        totalPremios={originales.length}
        premiosRestantes={restantes.length}
        totalSorteados={historial.length}
        totalFotos={fotos.size}
        onCargar={cargarArchivo}
        onCargarFotos={alCargarFotos}
        onExportarSorteados={(compartir) =>
          (compartir ? compartirTxt : descargarTxt)('sorteados.txt', textoSorteados(historial))}
        onExportarPendientes={(compartir) =>
          (compartir ? compartirTxt : descargarTxt)('pendientes.txt', textoPendientes(restantes))}
        onReiniciar={reiniciar}
        onLimpiar={limpiarTodo}
        onVerHistorial={() => setHistorialAbierto(true)}
      />

      <main className="escenario">
        <Wheel
          premios={restantes}
          anguloRef={anguloRef}
          dibujarRef={dibujarRef}
          puedeGirar={puedeGirar}
          onGirar={girar}
        />

        <ControlesGiro
          hayPremios={restantes.length > 0}
          girando={girando}
          anunciando={Boolean(ganador)}
          estatus={estatus}
          onGirar={girar}
        />
      </main>

      <PanelHistorial
        historial={historial}
        abierto={historialAbierto}
        onCerrar={() => setHistorialAbierto(false)}
      />

      {ganador && <WinnerModal ganador={ganador} fotoDe={fotoDe} onCerrar={cerrarModal} />}
    </div>
  );
}
