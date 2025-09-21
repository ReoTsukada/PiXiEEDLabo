import { useRef, useState } from 'react';
import { EditorShell } from './components/EditorShell';
import { PixelCanvas, type PixelCanvasHandle } from './components/PixelCanvas';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import type { CanvasSize, InputMode, ToolState, VirtualCursorState } from './types/editor';
import './styles/editor.css';

const DEFAULT_CANVAS: CanvasSize = { width: 96, height: 96 };

export default function App() {
  const canvasRef = useRef<PixelCanvasHandle | null>(null);
  const [canvasSize] = useState<CanvasSize>(DEFAULT_CANVAS);
  const [zoom, setZoom] = useState(8);
  const [inputMode, setInputMode] = useState<InputMode>('direct');
  const [toolState, setToolState] = useState<ToolState>({ tool: 'pen', color: '#58c4ff', brushSize: 1 });
  const [virtualCursor, setVirtualCursor] = useState<VirtualCursorState>({ x: 0, y: 0, visible: false });

  const handleClear = () => {
    canvasRef.current?.clear();
  };

  const handleColorSampled = (hex: string) => {
    setToolState((prev) => ({ ...prev, color: hex }));
  };

  return (
    <EditorShell
      toolbar={
        <Toolbar
          inputMode={inputMode}
          onInputModeChange={setInputMode}
          toolState={toolState}
          onToolStateChange={setToolState}
          onClear={handleClear}
        />
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
      statusBar={<StatusBar size={canvasSize} zoom={zoom} inputMode={inputMode} virtualCursor={virtualCursor} />}
    />
  );
}
