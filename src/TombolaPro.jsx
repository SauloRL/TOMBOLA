import { useRef, useState } from 'react';
import ControlesGiro from './components/ControlesGiro.jsx';
import HeaderMenu from './components/HeaderMenu.jsx';
import PanelHistorial from './components/PanelHistorial.jsx';
import Wheel from './components/Wheel.jsx';
import WinnerModal from './components/WinnerModal.jsx';
import { useAtajoGiro } from './hooks/useAtajoGiro.js';
import { useTombola } from './hooks/useTombola.js';
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
    detenerGiro,
    cerrarModal,
  } = useTombola(dibujarRef);

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
        onCargar={cargarArchivo}
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
          onDetener={detenerGiro}
        />
      </main>

      <PanelHistorial
        historial={historial}
        abierto={historialAbierto}
        onCerrar={() => setHistorialAbierto(false)}
      />

      {ganador && <WinnerModal ganador={ganador} onCerrar={cerrarModal} />}
    </div>
  );
}
