import { useState, type ChangeEvent } from 'react';
import type { InputMode, ToolKind, ToolState } from '../types/editor';

interface ToolbarProps {
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  toolState: ToolState;
  onToolStateChange: (next: ToolState) => void;
  onClear: () => void;
}

export function Toolbar({ inputMode, onInputModeChange, toolState, onToolStateChange, onClear }: ToolbarProps) {
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const toolOptions: Array<{ id: ToolKind; label: string }> = [
    { id: 'pen', label: 'ペン' },
    { id: 'eraser', label: '消しゴム' },
    { id: 'eyedropper', label: 'スポイト' }
  ];

  const swatchColors = Array.from(
    new Set(['#58c4ff', '#ffffff', '#000000', '#ff6b6b', '#ffcf56', '#91f291', '#b388ff', '#ff9de6', toolState.color])
  );

  const selectedTool = toolOptions.find((tool) => tool.id === toolState.tool) ?? toolOptions[0];

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    onToolStateChange({ ...toolState, color: event.target.value });
  };

  const handleBrushChange = (event: ChangeEvent<HTMLInputElement>) => {
    onToolStateChange({ ...toolState, brushSize: Number(event.target.value) });
  };

  const handleToolSelect = (tool: ToolKind) => {
    onToolStateChange({ ...toolState, tool });
    setToolboxOpen(false);
  };

  const handlePalettePick = (color: string) => {
    onToolStateChange({ ...toolState, color });
    setPaletteOpen(false);
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
        <button
          type="button"
          className="toolbar__box"
          onClick={() => setToolboxOpen((open) => !open)}
          aria-expanded={toolboxOpen}
        >
          ツールボックス
          <span className="toolbar__box-value">{selectedTool.label}</span>
        </button>
        {toolboxOpen && (
          <div className="toolbar__drawer">
            {toolOptions.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className={
                  toolState.tool === tool.id ? 'toolbar__tool-button toolbar__tool-button--active' : 'toolbar__tool-button'
                }
                onClick={() => handleToolSelect(tool.id)}
              >
                {tool.label}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="toolbar__section">
        <button
          type="button"
          className="toolbar__box"
          onClick={() => setPaletteOpen((open) => !open)}
          aria-expanded={paletteOpen}
        >
          カラーボックス
          <span className="toolbar__color-indicator" style={{ backgroundColor: toolState.color }} />
        </button>
        {paletteOpen && (
          <div className="toolbar__drawer toolbar__drawer--palette">
            <div className="toolbar__swatches">
              {swatchColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={color === toolState.color ? 'toolbar__swatch toolbar__swatch--active' : 'toolbar__swatch'}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePalettePick(color)}
                />
              ))}
            </div>
            <label className="toolbar__label toolbar__label--inline" htmlFor="color-picker">
              カスタム
              <input id="color-picker" type="color" value={toolState.color} onChange={handleColorChange} />
            </label>
          </div>
        )}
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
          アクティブレイヤーを初期化
        </button>
      </section>
    </div>
  );
}
