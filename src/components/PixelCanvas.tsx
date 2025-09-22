import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { CanvasSize, InputMode, LayerMeta, ToolState, VirtualCursorState } from '../types/editor';
import { VirtualCursorOverlay } from './VirtualCursorOverlay';

const CHANNELS = 4;
const FULL_ALPHA = 255;

export interface PixelCanvasHandle {
  clear: () => void;
  clearAll: () => void;
}

interface PixelCanvasProps {
  size: CanvasSize;
  zoom: number;
  inputMode: InputMode;
  toolState: ToolState;
  layers: LayerMeta[];
  activeLayerId: string;
  virtualCursor: VirtualCursorState;
  onVirtualCursorChange: (cursor: VirtualCursorState) => void;
  onColorSampled: (hex: string) => void;
}

export const PixelCanvas = forwardRef<PixelCanvasHandle, PixelCanvasProps>(
  (
    {
      size,
      zoom,
      inputMode,
      toolState,
      layers,
      activeLayerId,
      virtualCursor,
      onVirtualCursorChange,
      onColorSampled
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const buffersRef = useRef<Map<string, Uint8ClampedArray>>(new Map());
    const compositeRef = useRef<Uint8ClampedArray>();
    const imageDataRef = useRef<ImageData>();
    const [isPointerDown, setIsPointerDown] = useState(false);

    const rgbaColor = useMemo(() => {
      const hex = toolState.color.replace('#', '');
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b, FULL_ALPHA] as [number, number, number, number];
    }, [toolState.color]);

    const eraserColor = useMemo(() => [0, 0, 0, 0] as [number, number, number, number], []);

    const rgbaToHex = useCallback(
      (rgba: [number, number, number, number]) =>
        `#${[rgba[0], rgba[1], rgba[2]].map((value) => value.toString(16).padStart(2, '0')).join('')}`,
      []
    );

    const ensureCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.getContext('2d', { willReadFrequently: false });
    }, []);

    const ensureBuffers = useCallback(() => {
      const targetLength = size.width * size.height * CHANNELS;
      if (!compositeRef.current || compositeRef.current.length !== targetLength) {
        compositeRef.current = new Uint8ClampedArray(targetLength);
      }

      const knownIds = new Set<string>();
      layers.forEach((layer) => {
        knownIds.add(layer.id);
        const existing = buffersRef.current.get(layer.id);
        if (!existing || existing.length !== targetLength) {
          buffersRef.current.set(layer.id, new Uint8ClampedArray(targetLength));
        }
      });

      Array.from(buffersRef.current.keys()).forEach((key) => {
        if (!knownIds.has(key)) {
          buffersRef.current.delete(key);
        }
      });
    }, [layers, size.height, size.width]);

    const compositeLayers = useCallback(() => {
      ensureBuffers();
      const composite = compositeRef.current;
      if (!composite) return;
      composite.fill(0);

      for (let index = layers.length - 1; index >= 0; index -= 1) {
        const layer = layers[index];
        if (!layer.visible) continue;
        const buffer = buffersRef.current.get(layer.id);
        if (!buffer) continue;

        for (let offset = 0; offset < buffer.length; offset += CHANNELS) {
          const srcAlpha = buffer[offset + 3];
          if (srcAlpha === 0) continue;
          const destAlpha = composite[offset + 3];

          if (srcAlpha === FULL_ALPHA || destAlpha === 0) {
            composite[offset] = buffer[offset];
            composite[offset + 1] = buffer[offset + 1];
            composite[offset + 2] = buffer[offset + 2];
            composite[offset + 3] = srcAlpha;
            continue;
          }

          const srcAlphaNorm = srcAlpha / FULL_ALPHA;
          const destAlphaNorm = destAlpha / FULL_ALPHA;
          const outAlphaNorm = srcAlphaNorm + destAlphaNorm * (1 - srcAlphaNorm);
          if (outAlphaNorm <= 0) {
            composite[offset + 3] = 0;
            continue;
          }

          composite[offset] = Math.round(
            (buffer[offset] * srcAlphaNorm + composite[offset] * destAlphaNorm * (1 - srcAlphaNorm)) / outAlphaNorm
          );
          composite[offset + 1] = Math.round(
            (buffer[offset + 1] * srcAlphaNorm + composite[offset + 1] * destAlphaNorm * (1 - srcAlphaNorm)) / outAlphaNorm
          );
          composite[offset + 2] = Math.round(
            (buffer[offset + 2] * srcAlphaNorm + composite[offset + 2] * destAlphaNorm * (1 - srcAlphaNorm)) / outAlphaNorm
          );
          composite[offset + 3] = Math.round(outAlphaNorm * FULL_ALPHA);
        }
      }
    }, [ensureBuffers, layers]);

    const refreshImageData = useCallback(() => {
      const ctx = ensureCanvas();
      if (!ctx) return;
      compositeLayers();

      if (!imageDataRef.current || imageDataRef.current.width !== size.width || imageDataRef.current.height !== size.height) {
        imageDataRef.current = new ImageData(size.width, size.height);
      }

      if (compositeRef.current) {
        imageDataRef.current.data.set(compositeRef.current);
        ctx.putImageData(imageDataRef.current, 0, 0);
      }
    }, [compositeLayers, ensureCanvas, size.height, size.width]);

    const writePixel = useCallback(
      (buffer: Uint8ClampedArray, x: number, y: number, rgba: [number, number, number, number]) => {
        if (x < 0 || y < 0 || x >= size.width || y >= size.height) return;
        const offset = (y * size.width + x) * CHANNELS;
        buffer[offset] = rgba[0];
        buffer[offset + 1] = rgba[1];
        buffer[offset + 2] = rgba[2];
        buffer[offset + 3] = rgba[3];
      },
      [size.height, size.width]
    );

    const drawBrush = useCallback(
      (x: number, y: number, rgba: [number, number, number, number]) => {
        ensureBuffers();
        const buffer = buffersRef.current.get(activeLayerId);
        if (!buffer) return;
        const activeLayer = layers.find((layer) => layer.id === activeLayerId);
        if (!activeLayer || !activeLayer.visible) return;

        const radius = Math.max(0, Math.floor((toolState.brushSize - 1) / 2));
        for (let py = y - radius; py <= y + radius; py += 1) {
          for (let px = x - radius; px <= x + radius; px += 1) {
            writePixel(buffer, px, py, rgba);
          }
        }
        refreshImageData();
      },
      [activeLayerId, ensureBuffers, layers, refreshImageData, toolState.brushSize, writePixel]
    );

    const sampleColorAt = useCallback(
      (x: number, y: number) => {
        if (x < 0 || y < 0 || x >= size.width || y >= size.height) return null;
        for (const layer of layers) {
          if (!layer.visible) continue;
          const buffer = buffersRef.current.get(layer.id);
          if (!buffer) continue;
          const offset = (y * size.width + x) * CHANNELS;
          const alpha = buffer[offset + 3];
          if (alpha === 0) continue;
          return [buffer[offset], buffer[offset + 1], buffer[offset + 2], alpha] as [number, number, number, number];
        }
        return null;
      },
      [layers, size.height, size.width]
    );

    const applyToolAt = useCallback(
      (x: number, y: number) => {
        if (toolState.tool === 'eyedropper') {
          const sampled = sampleColorAt(x, y);
          if (sampled) {
            onColorSampled(rgbaToHex(sampled));
          }
          return;
        }

        if (toolState.tool === 'pen') {
          drawBrush(x, y, rgbaColor);
          return;
        }

        if (toolState.tool === 'eraser') {
          drawBrush(x, y, eraserColor);
        }
      },
      [drawBrush, eraserColor, onColorSampled, rgbaColor, rgbaToHex, sampleColorAt, toolState.tool]
    );

    const pointerToPixel = useCallback(
      (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / size.width;
        const scaleY = rect.height / size.height;
        const x = Math.floor((clientX - rect.left) / scaleX);
        const y = Math.floor((clientY - rect.top) / scaleY);
        if (Number.isNaN(x) || Number.isNaN(y)) {
          return null;
        }
        return { x, y };
      },
      [size.height, size.width]
    );

    const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      const point = pointerToPixel(event.clientX, event.clientY);
      if (!point) return;

      if (toolState.tool !== 'eyedropper') {
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsPointerDown(true);
      }

      if (inputMode === 'direct') {
        applyToolAt(point.x, point.y);
      } else {
        onVirtualCursorChange({ x: point.x, y: point.y, visible: true });
      }
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      const point = pointerToPixel(event.clientX, event.clientY);
      if (!point) return;

      if (inputMode === 'direct') {
        if (isPointerDown && toolState.tool !== 'eyedropper') {
          applyToolAt(point.x, point.y);
        }
      } else {
        onVirtualCursorChange({ x: point.x, y: point.y, visible: true });
      }
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setIsPointerDown(false);
    };

    const handlePointerLeave = () => {
      setIsPointerDown(false);
      if (inputMode === 'virtual') {
        onVirtualCursorChange({ ...virtualCursor, visible: false });
      }
    };

    const commitVirtualAction = useCallback(() => {
      if (!virtualCursor.visible) return;
      applyToolAt(virtualCursor.x, virtualCursor.y);
    }, [applyToolAt, virtualCursor]);

    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          ensureBuffers();
          const buffer = buffersRef.current.get(activeLayerId);
          if (!buffer) return;
          buffer.fill(0);
          refreshImageData();
        },
        clearAll: () => {
          ensureBuffers();
          buffersRef.current.forEach((buffer) => buffer.fill(0));
          refreshImageData();
        }
      }),
      [activeLayerId, ensureBuffers, refreshImageData]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = size.width;
      canvas.height = size.height;
      ensureBuffers();
      refreshImageData();
    }, [ensureBuffers, refreshImageData, size.height, size.width]);

    useEffect(() => {
      if (inputMode === 'virtual') return;
      if (!virtualCursor.visible) return;
      onVirtualCursorChange({ ...virtualCursor, visible: false });
    }, [inputMode, onVirtualCursorChange, virtualCursor]);

    useEffect(() => {
      refreshImageData();
    }, [layers, refreshImageData]);

    return (
      <div className="pixel-canvas" style={{ width: size.width * zoom, height: size.height * zoom }}>
        <canvas
          ref={canvasRef}
          className="pixel-canvas__element"
          style={{ width: size.width * zoom, height: size.height * zoom }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />
        {inputMode === 'virtual' && virtualCursor.visible && (
          <VirtualCursorOverlay zoom={zoom} cursor={virtualCursor} onDraw={commitVirtualAction} />
        )}
      </div>
    );
  }
);

PixelCanvas.displayName = 'PixelCanvas';
