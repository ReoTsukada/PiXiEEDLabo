import { useMemo, useRef } from 'react';
import type { CanvasSize } from '../types/editor';

export interface PixelBufferApi {
  data: Uint8ClampedArray;
  setPixel: (x: number, y: number, rgba: [number, number, number, number]) => void;
  getPixel: (x: number, y: number) => [number, number, number, number] | null;
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

    const getPixel = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= size.width || y >= size.height) return null;
      const offset = (y * size.width + x) * CHANNELS;
      return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
    };

    const clear = (fill: [number, number, number, number] = [0, 0, 0, 0]) => {
      for (let index = 0; index < data.length; index += CHANNELS) {
        data[index] = fill[0];
        data[index + 1] = fill[1];
        data[index + 2] = fill[2];
        data[index + 3] = fill[3];
      }
    };

    return { data, setPixel, getPixel, clear };
  }, [size.height, size.width]);
}
