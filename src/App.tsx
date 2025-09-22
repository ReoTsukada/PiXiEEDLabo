import { useRef, useState } from 'react';
import { EditorShell } from './components/EditorShell';
import { LayerPanel } from './components/LayerPanel';
import { PixelCanvas, type PixelCanvasHandle } from './components/PixelCanvas';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import type { CanvasSize, InputMode, LayerMeta, ToolState, VirtualCursorState } from './types/editor';
import './styles/editor.css';

const DEFAULT_CANVAS: CanvasSize = { width: 96, height: 96 };

let layerCounter = 0;

function createLayer(): LayerMeta {
  layerCounter += 1;
  return {
    id: `layer-${layerCounter}`,
    name: `レイヤー ${layerCounter}`,
    visible: true
  };
}

export default function App() {
  const canvasRef = useRef<PixelCanvasHandle | null>(null);
  const initialLayerRef = useRef<LayerMeta | null>(null);
  if (!initialLayerRef.current) {
    initialLayerRef.current = createLayer();
  }

  const [canvasSize] = useState<CanvasSize>(DEFAULT_CANVAS);
  const [zoom, setZoom] = useState(8);
  const [inputMode, setInputMode] = useState<InputMode>('direct');
  const [toolState, setToolState] = useState<ToolState>({ tool: 'pen', color: '#58c4ff', brushSize: 1 });
  const [virtualCursor, setVirtualCursor] = useState<VirtualCursorState>({ x: 0, y: 0, visible: false });
  const [layers, setLayers] = useState<LayerMeta[]>(() => [initialLayerRef.current!]);
  const [activeLayerId, setActiveLayerId] = useState<string>(() => initialLayerRef.current!.id);

  const handleClear = () => {
    canvasRef.current?.clear();
  };

  const handleColorSampled = (hex: string) => {
    setToolState((prev) => ({ ...prev, color: hex }));
  };

  const handleAddLayer = () => {
    const newLayer = createLayer();
    setLayers((prev) => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
  };

  const handleSelectLayer = (layerId: string) => {
    setActiveLayerId(layerId);
  };

  const handleToggleLayerVisibility = (layerId: string) => {
    setLayers((prev) =>
      prev.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer))
    );
  };

  const activeLayerName = layers.find((layer) => layer.id === activeLayerId)?.name ?? '---';

  return (
    <EditorShell
      toolbar={
        <div className="sidebar">
          <Toolbar
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            toolState={toolState}
            onToolStateChange={setToolState}
            onClear={handleClear}
          />
          <LayerPanel
            layers={layers}
            activeLayerId={activeLayerId}
            onSelectLayer={handleSelectLayer}
            onAddLayer={handleAddLayer}
            onToggleVisibility={handleToggleLayerVisibility}
          />
        </div>
      }
      viewport={
        <div className="viewport">
          <div className="viewport__controls">
            <label className="viewport__label" htmlFor="zoom-range">
              ズーム
            </label>
            <input
              id="zoom-range"
              type="range"
              min={4}
              max={20}
              step={1}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <span className="viewport__value">×{zoom}</span>
          </div>
          <div className="viewport__stage">
            <PixelCanvas
              ref={canvasRef}
              size={canvasSize}
              zoom={zoom}
              inputMode={inputMode}
              toolState={toolState}
              layers={layers}
              activeLayerId={activeLayerId}
              virtualCursor={virtualCursor}
              onVirtualCursorChange={setVirtualCursor}
              onColorSampled={handleColorSampled}
            />
          </div>
          {inputMode === 'virtual' && (
            <p className="viewport__hint">
              仮想カーソルを移動し、「この位置に描画」をタップしてピクセルを確定します。
            </p>
          )}
        </div>
      }
      statusBar={
        <StatusBar
          size={canvasSize}
          zoom={zoom}
          inputMode={inputMode}
          virtualCursor={virtualCursor}
          activeLayerName={activeLayerName}
        />
      }
    />
  );
}
