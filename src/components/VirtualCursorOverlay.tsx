import type { CSSProperties } from 'react';
import type { VirtualCursorState } from '../types/editor';

interface VirtualCursorOverlayProps {
  zoom: number;
  cursor: VirtualCursorState;
  onDraw: () => void;
}

export function VirtualCursorOverlay({ zoom, cursor, onDraw }: VirtualCursorOverlayProps) {
  const style: CSSProperties = {
    width: zoom,
    height: zoom,
    transform: `translate(${cursor.x * zoom}px, ${cursor.y * zoom}px)`
  };

  return (
    <div className="virtual-cursor" style={style}>
      <div className="virtual-cursor__crosshair" />
      <button
        type="button"
        className="virtual-cursor__action"
        onClick={(event) => {
          event.stopPropagation();
          onDraw();
        }}
      >
        この位置に描画
      </button>
    </div>
  );
}
