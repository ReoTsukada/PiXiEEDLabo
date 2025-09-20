import { useMemo, useRef } from 'react';
import type { CanvasSize } from '../types/editor';

export interface PixelBufferApi {
  data: Uint8ClampedArray;
  setPixel: (x: number, y: number, rgba: [number, number, number, number]) => void;
  clear: (fill?: [number, number, number, number]) => void;
}

const CHANNELS = 4;

export function usePixelBuffer(size: CanvasSize): PixelBufferApi {
  const bufferRef = useRef<Uint8ClampedArray>();

  if (!bufferRef.current || bufferRef.current.length !== size.width * size.height * CHANNELS) {
    bufferRef.current = new Uint8ClampedArray(size.width * size.height * CHANNELS);
  }

  return useMemo(() => {
    const data = bufferRef.current!;

    const setPixel = (x: number, y: number, rgba: [number, number, number, number]) => {
      if (x < 0 || y < 0 || x >= size.width || y >= size.height) return;
      const offset = (y * size.width + x) * CHANNELS;
      data.set(rgba, offset);
    };

    const clear = (fill: [number, number, number, number] = [0, 0, 0, 0]) => {
      for (let y = 0; y < size.height; y += 1) {
        for (let x = 0; x < size.width; x += 1) {
          const offset = (y * size.width + x) * CHANNELS;
          data.set(fill, offset);
        }
      }
    };

    return { data, setPixel, clear };
  }, [size.height, size.width]);
}
