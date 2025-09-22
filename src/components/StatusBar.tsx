import type { CanvasSize, InputMode, VirtualCursorState } from '../types/editor';

interface StatusBarProps {
  size: CanvasSize;
  zoom: number;
  inputMode: InputMode;
  virtualCursor: VirtualCursorState;
  activeLayerName: string;
}

export function StatusBar({ size, zoom, inputMode, virtualCursor, activeLayerName }: StatusBarProps) {
  return (
    <div className="status-bar">
      <span>キャンバス: {size.width}×{size.height}</span>
      <span>ズーム: {zoom}倍</span>
      <span>レイヤー: {activeLayerName}</span>
      <span>モード: {inputMode === 'direct' ? '直接描画' : '仮想カーソル'}</span>
      {inputMode === 'virtual' && virtualCursor.visible && (
        <span>
          仮想カーソル: ({virtualCursor.x}, {virtualCursor.y})
        </span>
      )}
    </div>
  );
}
