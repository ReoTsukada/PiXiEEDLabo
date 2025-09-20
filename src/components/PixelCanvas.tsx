import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { usePixelBuffer } from '../hooks/usePixelBuffer';
import type { CanvasSize, InputMode, ToolState, VirtualCursorState } from '../types/editor';
import { VirtualCursorOverlay } from './VirtualCursorOverlay';

export interface PixelCanvasHandle {
  clear: () => void;
}

interface PixelCanvasProps {
  size: CanvasSize;
  zoom: number;
  inputMode: InputMode;
  toolState: ToolState;
  virtualCursor: VirtualCursorState;
  onVirtualCursorChange: (cursor: VirtualCursorState) => void;
}

export const PixelCanvas = forwardRef<PixelCanvasHandle, PixelCanvasProps>(
  ({ size, zoom, inputMode, toolState, virtualCursor, onVirtualCursorChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { data, setPixel, clear } = usePixelBuffer(size);
    const imageDataRef = useRef<ImageData>();
    const [isPointerDown, setIsPointerDown] = useState(false);

    const rgbaColor = useMemo(() => {
      const hex = toolState.color.replace('#', '');
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return [r, g, b, 255] as [number, number, number, number];
    }, [toolState.color]);

    const ensureCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d', { willReadFrequently: false });
      return ctx;
    }, []);

    const refreshImageData = useCallback(() => {
      const ctx = ensureCanvas();
      if (!ctx) return;
      if (!imageDataRef.current || imageDataRef.current.width !== size.width || imageDataRef.current.height !== size.height) {
        imageDataRef.current = new ImageData(data, size.width, size.height);
      }
      ctx.putImageData(imageDataRef.current, 0, 0);
    }, [data, ensureCanvas, size.height, size.width]);

    const drawAt = useCallback(
      (x: number, y: number) => {
        const radius = Math.max(0, Math.floor((toolState.brushSize - 1) / 2));
        for (let py = y - radius; py <= y + radius; py += 1) {
          for (let px = x - radius; px <= x + radius; px += 1) {
            setPixel(px, py, rgbaColor);
          }
        }
        refreshImageData();
      },
      [rgbaColor, refreshImageData, setPixel, toolState.brushSize]
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
      event.currentTarget.setPointerCapture(event.pointerId);
      const point = pointerToPixel(event.clientX, event.clientY);
      if (!point) return;
      setIsPointerDown(true);

      if (inputMode === 'direct') {
        drawAt(point.x, point.y);
      } else {
        onVirtualCursorChange({ x: point.x, y: point.y, visible: true });
      }
    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      const point = pointerToPixel(event.clientX, event.clientY);
      if (!point) return;

      if (inputMode === 'direct') {
        if (isPointerDown) {
          drawAt(point.x, point.y);
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

    const commitVirtualDraw = useCallback(() => {
      if (!virtualCursor.visible) return;
      drawAt(virtualCursor.x, virtualCursor.y);
    }, [drawAt, virtualCursor]);

    useImperativeHandle(
      ref,
      () => ({
        clear: () => {
          clear();
          refreshImageData();
        }
      }),
      [clear, refreshImageData]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = size.width;
      canvas.height = size.height;
      refreshImageData();
    }, [refreshImageData, size.height, size.width]);

    useEffect(() => {
      if (inputMode === 'virtual') return;
      if (!virtualCursor.visible) return;
      onVirtualCursorChange({ ...virtualCursor, visible: false });
    }, [inputMode, onVirtualCursorChange, virtualCursor]);

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
          <VirtualCursorOverlay zoom={zoom} cursor={virtualCursor} onDraw={commitVirtualDraw} />
        )}
      </div>
    );
  }
);

PixelCanvas.displayName = 'PixelCanvas';
