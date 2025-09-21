export type InputMode = 'direct' | 'virtual';

export interface CanvasSize {
  width: number;
  height: number;
}

export type ToolKind = 'pen' | 'eraser' | 'eyedropper';

export interface ToolState {
  tool: ToolKind;
  color: string;
  brushSize: number;
}

export interface VirtualCursorState {
  x: number;
  y: number;
  visible: boolean;
}
