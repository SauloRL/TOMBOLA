# Ruleta de Regalos (tómbola)

Ruleta de premios para sorteos de eventos. Se carga un archivo JSON con los
premios, se gira la rueda y cada ganador se retira automáticamente de la lista.

## Ejecutar

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # compilación de producción
npm run preview  # previsualizar la compilación
npm run lint     # oxlint
```

## Formato del archivo JSON

Un arreglo de objetos. Solo `nombre` es obligatorio.

```json
[
  { "nombre": "Televisión 55\"", "imagen": "tv.jpeg", "audio": "aplausos.mp3", "color": "#2196F3" },
  { "nombre": "Celular", "imagen": "celular1.jpeg" },
  { "nombre": "Bocina Bluetooth" }
]
```

| Campo    | Obligatorio | Valor por defecto            | Notas |
|----------|-------------|------------------------------|-------|
| `nombre` | Sí          | —                            | Texto que se dibuja en el sector. |
| `color`  | No          | Color rotativo de la paleta  | Hexadecimal (`#RGB` o `#RRGGBB`). |
| `imagen` | No          | `default.jpeg`               | Nombre de archivo dentro de `public/assets/img/`. También se acepta `Imagen`. |
| `audio`  | No          | `aplausos.mp3`               | Nombre de archivo dentro de `public/assets/audio/`. |

Las rutas se validan: solo se aceptan nombres de archivo planos con extensión
conocida, nunca rutas relativas. Un premio inválido se descarta y se informa en
pantalla; el resto del archivo se carga igual.

Hay un ejemplo listo para usar en [`ejemplo-premios.json`](./ejemplo-premios.json).

## Cómo se elige al ganador

El ganador se sortea con `crypto.getRandomValues` **antes** de que la rueda
empiece a moverse, y después la animación se dirige hasta ese sector. El
resultado no depende de la física del giro ni del momento en que se pulse
«Detener ahora», por lo que el sorteo es uniforme entre los premios restantes.

## Controles

- **¡GIRAR RUEDA!** — inicia el sorteo.
- **Detener ahora** — adelanta la animación hasta el final (no altera el ganador).
- **Menú ☰** — cargar JSON, reiniciar la rifa, descargar los premios.
- El anuncio del ganador se cierra con clic fuera, con el botón, o con `Escape`.

## Persistencia

Los premios restantes y el historial de ganadores se guardan en `localStorage`,
así que recargar la página en medio del evento no pierde el avance. La opción
«Descargar premios» borra ese estado.

## Estructura

```
src/
  constantes.js              rutas de assets, tiempos y paleta
  TombolaPro.jsx             composición de la pantalla
  components/
    HeaderMenu.jsx           encabezado y menú
    Wheel.jsx                canvas de la rueda
    PanelLateral.jsx         botones, estatus e historial
    WinnerModal.jsx          anuncio del ganador
    ErrorBoundary.jsx        pantalla de respaldo ante fallos
  hooks/
    useTombola.js            estado y mecánica del sorteo
    useAudio.js              pool de sonidos y precarga de imágenes
    usePersistencia.js       lectura y escritura en localStorage
  utils/
    premios.js               validación del JSON y aleatorio criptográfico
    geometria.js             conversión entre ángulo y sector
```
