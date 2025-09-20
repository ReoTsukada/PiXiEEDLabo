export type InputMode = 'direct' | 'virtual';

export interface CanvasSize {
  width: number;
  height: number;
}

export interface ToolState {
  color: string;
  brushSize: number;
}

export interface VirtualCursorState {
  x: number;
  y: number;
  visible: boolean;
}
