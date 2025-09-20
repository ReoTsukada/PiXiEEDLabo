import type { ChangeEvent } from 'react';
import type { InputMode, ToolState } from '../types/editor';

interface ToolbarProps {
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  toolState: ToolState;
  onToolStateChange: (next: ToolState) => void;
  onClear: () => void;
}

export function Toolbar({ inputMode, onInputModeChange, toolState, onToolStateChange, onClear }: ToolbarProps) {
  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    onToolStateChange({ ...toolState, color: event.target.value });
  };

  const handleBrushChange = (event: ChangeEvent<HTMLInputElement>) => {
    onToolStateChange({ ...toolState, brushSize: Number(event.target.value) });
  };

  return (
    <div className="toolbar">
      <h1 className="toolbar__title">PiXiEED Labo</h1>
      <section className="toolbar__section">
        <p className="toolbar__label">入力モード</p>
        <div className="toolbar__toggle-group">
          <button
            type="button"
            className={inputMode === 'direct' ? 'toolbar__toggle toolbar__toggle--active' : 'toolbar__toggle'}
            onClick={() => onInputModeChange('direct')}
          >
            直接描画
          </button>
          <button
            type="button"
            className={inputMode === 'virtual' ? 'toolbar__toggle toolbar__toggle--active' : 'toolbar__toggle'}
            onClick={() => onInputModeChange('virtual')}
          >
            仮想カーソル
          </button>
        </div>
      </section>

      <section className="toolbar__section">
        <label className="toolbar__label" htmlFor="color-picker">
          カラー
        </label>
        <input id="color-picker" type="color" value={toolState.color} onChange={handleColorChange} />
      </section>

      <section className="toolbar__section">
        <label className="toolbar__label" htmlFor="brush-range">
          ブラシサイズ
        </label>
        <input
          id="brush-range"
          type="range"
          min={1}
          max={8}
          step={1}
          value={toolState.brushSize}
          onChange={handleBrushChange}
        />
        <span className="toolbar__value">{toolState.brushSize}px</span>
      </section>

      <section className="toolbar__section">
        <button type="button" className="toolbar__button" onClick={onClear}>
          キャンバス初期化
        </button>
      </section>
    </div>
  );
}
