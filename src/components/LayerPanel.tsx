import type { LayerMeta } from '../types/editor';

interface LayerPanelProps {
  layers: LayerMeta[];
  activeLayerId: string;
  onSelectLayer: (layerId: string) => void;
  onAddLayer: () => void;
  onToggleVisibility: (layerId: string) => void;
}

export function LayerPanel({ layers, activeLayerId, onSelectLayer, onAddLayer, onToggleVisibility }: LayerPanelProps) {
  return (
    <div className="layer-panel">
      <div className="layer-panel__header">
        <h2 className="layer-panel__title">レイヤー</h2>
        <button type="button" className="layer-panel__add" onClick={onAddLayer}>
          追加
        </button>
      </div>
      <ul className="layer-panel__list">
        {layers.map((layer) => {
          const isActive = layer.id === activeLayerId;
          return (
            <li key={layer.id} className={isActive ? 'layer-panel__item layer-panel__item--active' : 'layer-panel__item'}>
              <button
                type="button"
                className={layer.visible ? 'layer-panel__toggle layer-panel__toggle--visible' : 'layer-panel__toggle'}
                onClick={() => onToggleVisibility(layer.id)}
                aria-label={layer.visible ? `${layer.name} を非表示` : `${layer.name} を表示`}
              />
              <button
                type="button"
                className="layer-panel__label"
                onClick={() => onSelectLayer(layer.id)}
              >
                {layer.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
