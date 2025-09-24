const pixelCanvas = document.getElementById('pixelCanvas');
const previewCanvas = document.getElementById('previewCanvas');
const previewWindow = document.getElementById('previewWindow');
const previewHandle = document.getElementById('previewHandle');
const canvasStage = document.getElementById('canvasStage');
const pixelSizeInput = document.getElementById('pixelSize');
const widthInput = document.getElementById('canvasWidth');
const heightInput = document.getElementById('canvasHeight');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeDisplay = document.getElementById('brushSizeDisplay');
const paletteContainer = document.getElementById('palette');
const palettePanel = document.getElementById('palettePanel');
const cursorInfo = document.getElementById('cursorInfo');
const layerInfo = document.getElementById('layerInfo');
const resizeCanvasButton = document.getElementById('resizeCanvas');
const clearCanvasButton = document.getElementById('clearCanvas');
const toolButtons = Array.from(document.querySelectorAll('.tool-button[data-tool]'));
const panelOverlay = document.getElementById('panelOverlay');
const floatingPanels = Array.from(document.querySelectorAll('.floating-panel'));
const panelToggleButtons = Array.from(document.querySelectorAll('[data-panel-target]'));
const panelCloseButtons = Array.from(document.querySelectorAll('[data-panel-close]'));
const floatingDock = document.getElementById('floatingDock');
const dockHandle = document.getElementById('dockHandle');
const dockToggle = document.getElementById('dockToggle');
const toolDock = document.getElementById('toolDock');
const toolDockHandle = document.getElementById('toolDockDrag');
const paletteDock = document.getElementById('paletteDock');
const paletteDockHandle = document.getElementById('paletteDockDrag');
const canvasDock = document.getElementById('canvasDock');
const canvasDockHandle = document.getElementById('canvasDockDrag');
const dockToggleButtons = Array.from(document.querySelectorAll('[data-dock-toggle]'));
const dockStateButtons = Array.from(document.querySelectorAll('[data-dock-state]'));
const layerDock = document.getElementById('layerDock');
const layerDockHandle = document.getElementById('layerDockDrag');
const layerDockStatusText = document.getElementById('layerDockStatus');
const layerListElement = document.getElementById('layerList');
const addLayerButton = document.getElementById('addLayer');
const deleteLayerButton = document.getElementById('deleteLayer');
const togglePreviewButton = document.getElementById('togglePreview');
const undoButton = document.getElementById('undoAction');
const redoButton = document.getElementById('redoAction');
const exportPanel = document.getElementById('exportPanel');
const exportSizeSelect = document.getElementById('exportSize');
const exportHint = document.getElementById('exportHint');
const exportConfirmButton = document.getElementById('confirmExport');
const virtualCursorToggle = document.querySelector('[data-toggle="virtualCursor"]');
const toolDockStatusIcon = document.getElementById('toolDockStatus');
const paletteDockStatusSwatch = document.getElementById('paletteDockStatus');
const canvasDockStatusText = document.getElementById('canvasDockStatus');
let addPaletteButton = null;
const dockElements = {
  toolDock,
  paletteDock,
  canvasDock,
  layerDock,
};
const dockVisibilityState = {
  toolDock: Boolean(toolDock && toolDock.dataset.visible !== 'false' && !toolDock.hasAttribute('hidden')),
  paletteDock: Boolean(paletteDock && paletteDock.dataset.visible !== 'false' && !paletteDock.hasAttribute('hidden')),
  canvasDock: Boolean(canvasDock && canvasDock.dataset.visible !== 'false' && !canvasDock.hasAttribute('hidden')),
  layerDock: Boolean(layerDock && layerDock.dataset.visible !== 'false' && !layerDock.hasAttribute('hidden')),
};
const dockDisplayState = {
  toolDock: toolDock?.dataset.state || 'expanded',
  paletteDock: paletteDock?.dataset.state || 'expanded',
  canvasDock: canvasDock?.dataset.state || 'expanded',
  layerDock: layerDock?.dataset.state || 'expanded',
};
const DOCK_LAST_ACTIVE_STATE = { ...dockDisplayState };
const DOCK_LABELS = {
  toolDock: 'ツールボックス',
  paletteDock: 'カラーパレット',
  canvasDock: 'キャンバス設定',
  layerDock: 'レイヤー',
};
const ICON_LAYER_VISIBLE =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12C4.5 7 8 4 12 4s7.5 3 10 8c-2.5 5-6 8-10 8s-7.5-3-10-8Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.6" /></svg>';
const ICON_LAYER_HIDDEN =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 4L20 20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /><path d="M18.5 15.5C20.17 14.1 21.5 12.24 22 12c-2.5-5-6-8-10-8-1.27 0-2.49.23-3.66.66" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /><path d="M5.5 8.5C3.83 9.9 2.5 11.76 2 12c1.25 2.5 2.93 4.59 4.93 6.08" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /><path d="M9 9.16A3 3 0 0 1 14.84 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>';
const ICON_LAYER_HANDLE =
  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5V19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M15 5V19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const STORAGE_KEY = 'pixiedraw-layer-state-v1';
const SAVE_DEBOUNCE_MS = 600;
const IS_TOUCH_DEVICE =
  typeof navigator !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || (typeof window !== 'undefined' && 'ontouchstart' in window));
const ZOOM_LIMITS = {
  min: 0.1,
  max: 24,
  step: 0.1,
};
const ZOOM_WHEEL_FACTOR = 0.08;
const MAX_EXPORT_DIMENSION = 1024;
const FIXED_PIXEL_SIZE = 20;
const VIRTUAL_CURSOR_SENSITIVITY = 1;
const DOCK_SNAP_DISTANCE = 48;
const DOCK_BOTTOM_ANCHOR_THRESHOLD = 32;
const AUTO_HIDE_TIMEOUT_MS = 6000;
let dockAutoHideTimer = null;
let docksReady = false;

const ctx = pixelCanvas.getContext('2d', { willReadFrequently: true });
const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
ctx.imageSmoothingEnabled = false;
previewCtx.imageSmoothingEnabled = false;

const colorPicker = document.createElement('input');
colorPicker.type = 'color';
colorPicker.value = '#58c4ff';
colorPicker.className = 'sr-only';
colorPicker.tabIndex = -1;
document.body.appendChild(colorPicker);

if (pixelSizeInput) {
  pixelSizeInput.value = String(FIXED_PIXEL_SIZE);
  pixelSizeInput.min = String(FIXED_PIXEL_SIZE);
  pixelSizeInput.max = String(FIXED_PIXEL_SIZE);
  pixelSizeInput.disabled = true;
  pixelSizeInput.setAttribute('aria-disabled', 'true');
}

const state = {
  width: Number(widthInput.value) || 32,
  height: Number(heightInput.value) || 32,
  pixelSize: FIXED_PIXEL_SIZE,
  brushSize: Number(brushSizeInput.value) || 1,
  tool: 'pen',
  color: colorPicker.value,
  zoom: 1,
  minZoom: ZOOM_LIMITS.min,
  offsetX: 0,
  offsetY: 0,
};

const layersState = {
  layers: [],
  selectedId: null,
  nextId: 1,
};

const HAS_TOUCH_SUPPORT =
  typeof navigator !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches));

const virtualCursorState = {
  enabled: false,
  x: Math.floor(state.width / 2),
  y: Math.floor(state.height / 2),
  pointerId: null,
  drawActive: false,
  drawButtonPointerId: null,
  dragging: false,
  dragPointerId: null,
  dragOffsetX: 0,
  dragOffsetY: 0,
  controlLeft: null,
  controlTop: null,
  lastClientX: null,
  lastClientY: null,
  residualDX: 0,
  residualDY: 0,
  prevDrawX: null,
  prevDrawY: null,
};

let virtualCursorElement = null;
let virtualDrawControl = null;
let virtualDrawHandle = null;
let virtualDrawActionButton = null;

let activeSwatch = null;
let isDrawing = false;
let activePointerId = null;
let activePanel = null;
const dockDragState = {
  active: false,
  pointerId: null,
  offsetX: 0,
  offsetY: 0,
};
let dockCollapsed = false;
let editingSwatch = null;
let userMovedDock = false;
const zoomPointers = new Map();
let pinchStartDistance = null;
let pinchStartZoom = 1;
let userAdjustedZoom = false;
let pinchActive = false;
const layerDragState = {
  draggingId: null,
  dropBeforeId: null,
};
let saveTimer = null;
let pendingSave = false;
let isRestoringState = false;
const MAX_HISTORY_ENTRIES = 50;
const historyStack = [];
const redoStack = [];
let historyDirty = false;
const autoCompactStates = {};
const miniDockUserMoved = {
  toolDock: false,
  paletteDock: false,
  canvasDock: false,
  layerDock: false,
};
const previewDragState = {
  active: false,
  pointerId: null,
  offsetX: 0,
  offsetY: 0,
};
let previewVisible = true;

function detectLayerHasContent(layer) {
  const width = layer.canvas.width;
  const height = layer.canvas.height;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return false;
  }
  const imageData = layer.ctx.getImageData(0, 0, width, height).data;
  for (let index = 3; index < imageData.length; index += 4) {
    if (imageData[index] !== 0) {
      return true;
    }
  }
  return false;
}

function refreshLayerContentFlag(layer) {
  const hasContent = detectLayerHasContent(layer);
  if (layer.hasContent !== hasContent) {
    layer.hasContent = hasContent;
    return true;
  }
  return false;
}

function canUseLocalStorage() {
  try {
    return typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null;
  } catch (_) {
    return false;
  }
}

function serializeAppState() {
  const layers = layersState.layers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    opacity: layer.opacity,
    image: layer.canvas.toDataURL('image/png'),
  }));
  return {
    version: 1,
    canvas: {
      width: state.width,
      height: state.height,
    },
    selectedId: layersState.selectedId,
    nextId: layersState.nextId,
    layers,
  };
}

function saveProjectState() {
  if (!canUseLocalStorage()) {
    pendingSave = false;
    return;
  }
  try {
    const payload = serializeAppState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // Saving issues (e.g., quota exceeded) should not break the app.
    console.warn('ピクセルデータの保存に失敗しました', error);
  }
  pendingSave = false;
}

function queueStateSave() {
  if (isRestoringState || !canUseLocalStorage()) {
    return;
  }
  pendingSave = true;
  if (saveTimer !== null) {
    window.clearTimeout(saveTimer);
  }
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    if (pendingSave) {
      saveProjectState();
    }
  }, SAVE_DEBOUNCE_MS);
}

function loadImageFromDataURL(dataURL) {
  return new Promise((resolve, reject) => {
    if (!dataURL) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to decode layer image'));
    image.src = dataURL;
  });
}

async function restoreProjectState() {
  if (!canUseLocalStorage()) {
    return false;
  }
  let payload;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }
    payload = JSON.parse(raw);
  } catch (error) {
    console.warn('レイヤー構成の読み込みに失敗しました', error);
    return false;
  }
  if (!payload || !Array.isArray(payload.layers) || payload.layers.length === 0) {
    return false;
  }

  const width = clamp(Number(payload.canvas?.width) || state.width, Number(widthInput.min), Number(widthInput.max));
  const height = clamp(Number(payload.canvas?.height) || state.height, Number(heightInput.min), Number(heightInput.max));

  isRestoringState = true;
  try {
    layersState.layers.length = 0;
    layersState.selectedId = null;
    layersState.nextId = 1;

    pixelCanvas.width = width;
    pixelCanvas.height = height;
    ctx.imageSmoothingEnabled = false;
    state.width = width;
    state.height = height;
    widthInput.value = String(width);
    heightInput.value = String(height);
    updatePixelSize({ skipComposite: true });

    for (let index = 0; index < payload.layers.length; index += 1) {
      const layerData = payload.layers[index];
      const layer = createLayer({
        name: typeof layerData?.name === 'string' && layerData.name.trim().length > 0 ? layerData.name : `レイヤー${layersState.nextId}`,
        visible: layerData?.visible !== false,
        opacity: clamp(Number(layerData?.opacity ?? 1), 0, 1),
        insertAt: layersState.layers.length,
      });
      if (typeof layerData?.id === 'string' && layerData.id.length > 0) {
        layer.id = layerData.id;
      }
      try {
        const image = await loadImageFromDataURL(layerData?.image);
        if (image) {
          layer.ctx.clearRect(0, 0, width, height);
          layer.ctx.drawImage(image, 0, 0, width, height);
        }
      } catch (error) {
        console.warn('レイヤー画像の復元に失敗しました', error);
        layer.ctx.clearRect(0, 0, width, height);
      }
      layer.hasContent = detectLayerHasContent(layer);
      if (typeof layerData?.id === 'string') {
        const numericId = Number.parseInt(layerData.id.replace('layer-', ''), 10);
        if (Number.isFinite(numericId)) {
          layersState.nextId = Math.max(layersState.nextId, numericId + 1);
        }
      }
    }

    const desiredSelectedId = typeof payload.selectedId === 'string' ? payload.selectedId : null;
    const fallbackLayer = layersState.layers.find((layer) => layer.id === desiredSelectedId) || layersState.layers[layersState.layers.length - 1] || layersState.layers[0] || null;
    if (fallbackLayer) {
      layersState.selectedId = fallbackLayer.id;
    }

    renderLayerList();
    updateLayerDockStatus();
    updateLayerControlAvailability();
    compositeLayers({ skipContentCheck: true });
    refreshExportOptions();
    updateDotCount();
    pendingSave = false;
    return true;
  } finally {
    isRestoringState = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (pendingSave) {
      saveProjectState();
    }
  });
}

function captureHistorySnapshot() {
  return {
    width: state.width,
    height: state.height,
    selectedId: layersState.selectedId,
    nextId: layersState.nextId,
    layers: layersState.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      imageData: layer.ctx.getImageData(0, 0, state.width, state.height),
    })),
  };
}

function updateUndoRedoUI() {
  if (undoButton) {
    undoButton.disabled = historyStack.length <= 1;
  }
  if (redoButton) {
    redoButton.disabled = redoStack.length === 0;
  }
}

function pushHistorySnapshot() {
  if (isRestoringState) {
    return;
  }
  const snapshot = captureHistorySnapshot();
  historyStack.push(snapshot);
  if (historyStack.length > MAX_HISTORY_ENTRIES) {
    historyStack.shift();
  }
  redoStack.length = 0;
  updateUndoRedoUI();
}

function resetHistory() {
  historyStack.length = 0;
  redoStack.length = 0;
  historyDirty = false;
  pushHistorySnapshot();
}

function markHistoryDirty() {
  if (!isRestoringState) {
    historyDirty = true;
  }
}

function finalizeHistoryEntry({ force = false } = {}) {
  if (isRestoringState) {
    historyDirty = false;
    return;
  }
  if (!historyDirty && !force) {
    return;
  }
  historyDirty = false;
  pushHistorySnapshot();
  queueStateSave();
}

function applyHistorySnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.layers)) {
    return false;
  }
  const width = clamp(Number(snapshot.width) || state.width, Number(widthInput.min), Number(widthInput.max));
  const height = clamp(Number(snapshot.height) || state.height, Number(heightInput.min), Number(heightInput.max));

  isRestoringState = true;
  try {
    layersState.layers.length = 0;
    layersState.selectedId = null;
    layersState.nextId = 1;

    pixelCanvas.width = width;
    pixelCanvas.height = height;
    ctx.imageSmoothingEnabled = false;
    state.width = width;
    state.height = height;
    widthInput.value = String(width);
    heightInput.value = String(height);
    updatePixelSize({ skipComposite: true });

    snapshot.layers.forEach((layerData) => {
      const layer = createLayer({
        name: typeof layerData?.name === 'string' ? layerData.name : `レイヤー${layersState.nextId}`,
        visible: layerData?.visible !== false,
        opacity: clamp(Number(layerData?.opacity ?? 1), 0, 1),
        insertAt: layersState.layers.length,
        imageSource: layerData?.imageData || null,
      });
      if (typeof layerData?.id === 'string' && layerData.id.length > 0) {
        layer.id = layerData.id;
      }
      layer.hasContent = detectLayerHasContent(layer);
    });

    const calculatedNextId = Number(snapshot.nextId);
    if (Number.isFinite(calculatedNextId) && calculatedNextId > 0) {
      layersState.nextId = Math.max(calculatedNextId, layersState.layers.length + 1);
    } else {
      layersState.nextId = layersState.layers.length + 1;
    }

    const desiredSelectedId = typeof snapshot.selectedId === 'string' ? snapshot.selectedId : null;
    const fallbackLayer = layersState.layers.find((layer) => layer.id === desiredSelectedId) || layersState.layers[layersState.layers.length - 1] || layersState.layers[0] || null;
    if (fallbackLayer) {
      layersState.selectedId = fallbackLayer.id;
    }

    renderLayerList();
    updateLayerDockStatus();
    updateLayerControlAvailability();
    compositeLayers({ skipContentCheck: true });
    refreshExportOptions();
    updateDotCount();
  } finally {
    isRestoringState = false;
  }
  historyDirty = false;
  queueStateSave();
  updateUndoRedoUI();
  return true;
}

function performUndo() {
  if (historyStack.length <= 1) {
    return;
  }
  const current = historyStack.pop();
  redoStack.push(current);
  const snapshot = historyStack[historyStack.length - 1];
  applyHistorySnapshot(snapshot);
}

function performRedo() {
  if (redoStack.length === 0) {
    return;
  }
  const snapshot = redoStack.pop();
  historyStack.push(snapshot);
  if (historyStack.length > MAX_HISTORY_ENTRIES) {
    historyStack.shift();
  }
  applyHistorySnapshot(snapshot);
}

function createOffscreenCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Failed to create layer context');
  }
  context.imageSmoothingEnabled = false;
  return { canvas, ctx: context };
}

function createLayer({ name, insertAt = 0, imageSource = null, visible = true, opacity = 1 } = {}) {
  const { canvas, ctx: layerCtx } = createOffscreenCanvas(state.width, state.height);
  if (imageSource instanceof HTMLCanvasElement || imageSource instanceof ImageBitmap) {
    layerCtx.drawImage(imageSource, 0, 0);
  } else if (imageSource instanceof ImageData) {
    layerCtx.putImageData(imageSource, 0, 0);
  }
  const layer = {
    id: `layer-${layersState.nextId}`,
    name: name || `レイヤー${layersState.nextId}`,
    visible,
    opacity: clamp(Number(opacity) || 1, 0, 1),
    canvas,
    ctx: layerCtx,
    hasContent: false,
  };
  layersState.nextId += 1;
  layer.hasContent = detectLayerHasContent(layer);
  const clampedIndex = clamp(Math.round(insertAt), 0, layersState.layers.length);
  layersState.layers.splice(clampedIndex, 0, layer);
  if (!layersState.selectedId) {
    layersState.selectedId = layer.id;
  }
  return layer;
}

function getLayerIndex(layerId) {
  return layersState.layers.findIndex((layer) => layer.id === layerId);
}

function getActiveLayer() {
  const index = getLayerIndex(layersState.selectedId);
  if (index === -1) {
    return null;
  }
  return layersState.layers[index];
}

function selectLayer(layerId) {
  if (!layerId) {
    return;
  }
  const index = getLayerIndex(layerId);
  if (index === -1) {
    return;
  }
  const changed = layersState.selectedId !== layerId;
  layersState.selectedId = layerId;
  updateLayerSelectionUI();
  updateLayerDockStatus();
  updateLayerControlAvailability();
  if (changed) {
    queueStateSave();
  }
}

function compositeLayers({ skipUIUpdate = false, skipContentCheck = false } = {}) {
  ctx.clearRect(0, 0, state.width, state.height);
  let contentChanged = false;
  for (let index = layersState.layers.length - 1; index >= 0; index -= 1) {
    const layer = layersState.layers[index];
    if (!skipContentCheck) {
      contentChanged = refreshLayerContentFlag(layer) || contentChanged;
    }
    if (!layer.visible) {
      continue;
    }
    if (layer.opacity <= 0) {
      continue;
    }
    ctx.globalAlpha = clamp(layer.opacity, 0, 1);
    ctx.drawImage(layer.canvas, 0, 0);
  }
  ctx.globalAlpha = 1;
  if (!skipUIUpdate) {
    renderPreview();
    updateDotCount();
    if (contentChanged) {
      renderLayerList();
      queueStateSave();
    }
  }
}

function updateLayerSelectionUI() {
  if (!layerListElement) {
    return;
  }
  Array.from(layerListElement.querySelectorAll('[data-layer-id]')).forEach((item) => {
    const isActive = item.dataset.layerId === layersState.selectedId;
    item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    item.dataset.active = isActive ? 'true' : 'false';
  });
  const activeLayer = getActiveLayer();
  if (activeLayer) {
    layerListElement.setAttribute('aria-activedescendant', `layer-option-${activeLayer.id}`);
  } else {
    layerListElement.removeAttribute('aria-activedescendant');
  }
}

function updateLayerDockStatus() {
  if (!layerDockStatusText) {
    return;
  }
  const activeLayer = getActiveLayer();
  layerDockStatusText.textContent = activeLayer ? activeLayer.name : 'レイヤーなし';
}

function updateLayerControlAvailability() {
  if (deleteLayerButton) {
    deleteLayerButton.disabled = layersState.layers.length <= 1;
  }
}

function toggleLayerVisibility(layerId) {
  const layer = layersState.layers.find((item) => item.id === layerId);
  if (!layer) {
    return;
  }
  markHistoryDirty();
  layer.visible = !layer.visible;
  renderLayerList();
  compositeLayers();
  finalizeHistoryEntry();
}

function renameLayer(layerId, nextName) {
  const layer = layersState.layers.find((item) => item.id === layerId);
  if (!layer) {
    return;
  }
  const trimmed = nextName.trim().slice(0, 40);
  if (trimmed.length === 0) {
    return;
  }
  if (trimmed === layer.name) {
    return;
  }
  markHistoryDirty();
  layer.name = trimmed;
  renderLayerList();
  updateLayerDockStatus();
  finalizeHistoryEntry();
}

function addLayer() {
  const activeIndex = getLayerIndex(layersState.selectedId);
  const insertAt = activeIndex === -1 ? 0 : activeIndex;
  markHistoryDirty();
  const layer = createLayer({ insertAt, name: `レイヤー${layersState.nextId}`, visible: true, opacity: 1 });
  layersState.selectedId = layer.id;
  renderLayerList();
  updateLayerDockStatus();
  compositeLayers();
  finalizeHistoryEntry();
}

function deleteLayer(layerId) {
  if (layersState.layers.length <= 1) {
    return;
  }
  const index = getLayerIndex(layerId);
  if (index === -1) {
    return;
  }
  markHistoryDirty();
  const [removed] = layersState.layers.splice(index, 1);
  if (removed && removed.id === layersState.selectedId) {
    const fallback = layersState.layers[index] || layersState.layers[index - 1] || layersState.layers[0] || null;
    layersState.selectedId = fallback ? fallback.id : null;
  }
  renderLayerList();
  updateLayerDockStatus();
  updateLayerControlAvailability();
  compositeLayers();
  finalizeHistoryEntry();
}

function reorderLayer(layerId, newIndex) {
  const sourceIndex = getLayerIndex(layerId);
  if (sourceIndex === -1) {
    return;
  }
  let targetIndex = clamp(Math.round(newIndex), 0, layersState.layers.length);
  if (targetIndex === sourceIndex || targetIndex === sourceIndex + 1) {
    return;
  }
  markHistoryDirty();
  const [layer] = layersState.layers.splice(sourceIndex, 1);
  if (targetIndex > sourceIndex) {
    targetIndex -= 1;
  }
  targetIndex = clamp(targetIndex, 0, layersState.layers.length);
  layersState.layers.splice(targetIndex, 0, layer);
  renderLayerList();
  updateLayerDockStatus();
  compositeLayers();
  finalizeHistoryEntry();
}

function renderLayerList() {
  if (!layerListElement) {
    return;
  }
  layerListElement.innerHTML = '';

  const layersForDisplay = layersState.layers.slice();

  layersForDisplay.forEach((layer) => {
    const item = document.createElement('div');
    item.className = 'layer-item';
    item.dataset.layerId = layer.id;
    item.dataset.visible = layer.visible ? 'true' : 'false';
    item.setAttribute('role', 'option');
    item.id = `layer-option-${layer.id}`;
    item.draggable = false;

    const isActive = layer.id === layersState.selectedId;
    if (isActive) {
      item.dataset.active = 'true';
      item.setAttribute('aria-selected', 'true');
    } else {
      item.dataset.active = 'false';
      item.setAttribute('aria-selected', 'false');
    }

    const handleButton = document.createElement('button');
    handleButton.type = 'button';
    handleButton.className = 'layer-item__handle';
    handleButton.setAttribute('data-layer-control', 'drag');
    handleButton.innerHTML = ICON_LAYER_HANDLE;
    const handleLabel = `${layer.name} をドラッグで並べ替え`;
    handleButton.setAttribute('aria-label', handleLabel);
    handleButton.title = handleLabel;
    handleButton.draggable = true;
    handleButton.addEventListener('dragstart', (event) => {
      layerDragState.draggingId = layer.id;
      layerDragState.dropBeforeId = null;
      item.classList.add('layer-item--dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', layer.id);
        event.dataTransfer.setDragImage(item, 0, 0);
      }
    });
    handleButton.addEventListener('dragend', () => {
      item.classList.remove('layer-item--dragging');
      layerDragState.draggingId = null;
      layerDragState.dropBeforeId = null;
      clearLayerDragHighlights();
    });
    item.appendChild(handleButton);

    const visibilityButton = document.createElement('button');
    visibilityButton.type = 'button';
    visibilityButton.className = 'layer-item__visibility';
    visibilityButton.setAttribute('aria-pressed', layer.visible ? 'true' : 'false');
    visibilityButton.setAttribute('data-layer-control', 'visibility');
    visibilityButton.innerHTML = layer.visible ? ICON_LAYER_VISIBLE : ICON_LAYER_HIDDEN;
    const visibilityLabel = layer.visible ? 'レイヤーを非表示' : 'レイヤーを表示';
    visibilityButton.setAttribute('aria-label', visibilityLabel);
    visibilityButton.title = visibilityLabel;
    visibilityButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleLayerVisibility(layer.id);
    });
    item.appendChild(visibilityButton);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'layer-item__name';
    nameInput.value = layer.name;
    nameInput.setAttribute('data-layer-control', 'name');
    nameInput.maxLength = 40;
    nameInput.setAttribute('spellcheck', 'false');
    nameInput.addEventListener('focus', () => {
      selectLayer(layer.id);
      nameInput.select();
    });
    nameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const trimmed = nameInput.value.trim();
        if (trimmed.length === 0) {
          nameInput.value = layer.name;
        } else {
          renameLayer(layer.id, trimmed);
        }
        nameInput.blur();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        nameInput.value = layer.name;
        nameInput.blur();
      }
    });
    nameInput.addEventListener('blur', () => {
      const trimmed = nameInput.value.trim();
      if (trimmed.length === 0) {
        nameInput.value = layer.name;
        return;
      }
      if (trimmed !== layer.name) {
        renameLayer(layer.id, trimmed);
      }
    });
    item.appendChild(nameInput);

    const badge = document.createElement('span');
    badge.className = 'layer-item__badge';
    badge.dataset.filled = layer.hasContent ? 'true' : 'false';
    const badgeLabel = layer.hasContent ? '描画あり' : '空レイヤー';
    badge.setAttribute('role', 'img');
    badge.setAttribute('aria-label', badgeLabel);
    badge.title = badgeLabel;
    item.appendChild(badge);

    item.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target && target.closest('[data-layer-control]')) {
        return;
      }
      selectLayer(layer.id);
    });

    item.addEventListener('dragstart', (event) => {
      if (layerDragState.draggingId !== layer.id) {
        event.preventDefault();
        return;
      }
      item.classList.add('layer-item--dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', layer.id);
        event.dataTransfer.setDragImage(item, 0, 0);
      }
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('layer-item--dragging');
      layerDragState.draggingId = null;
      layerDragState.dropBeforeId = null;
      clearLayerDragHighlights();
    });

    layerListElement.appendChild(item);
  });

  updateLayerSelectionUI();
  updateLayerDockStatus();
  updateLayerControlAvailability();
  const activeElement = layerListElement.querySelector(`[data-layer-id="${layersState.selectedId}"]`);
  if (activeElement && typeof activeElement.scrollIntoView === 'function') {
    activeElement.scrollIntoView({ block: 'nearest' });
  }
}

function clearLayerDragHighlights() {
  if (!layerListElement) {
    return;
  }
  Array.from(layerListElement.querySelectorAll('.layer-item--dragover')).forEach((node) => {
    node.classList.remove('layer-item--dragover');
  });
  layerListElement.classList.remove('layer-dock__list--drop-after');
}

function handleLayerDragOver(event) {
  if (!layerListElement || !layerDragState.draggingId) {
    return;
  }
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  const items = Array.from(layerListElement.querySelectorAll('.layer-item'));
  clearLayerDragHighlights();

  let dropBeforeId = null;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const layerId = item.dataset.layerId;
    if (layerId === layerDragState.draggingId) {
      continue;
    }
    const rect = item.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (event.clientY < midpoint) {
      dropBeforeId = layerId;
      item.classList.add('layer-item--dragover');
      break;
    }
  }
  if (!dropBeforeId) {
    layerListElement.classList.add('layer-dock__list--drop-after');
  } else {
    layerListElement.classList.remove('layer-dock__list--drop-after');
  }
  layerDragState.dropBeforeId = dropBeforeId;
}

function handleLayerDrop(event) {
  if (!layerDragState.draggingId) {
    return;
  }
  event.preventDefault();
  const dropBeforeId = layerDragState.dropBeforeId;
  let targetIndex;
  if (dropBeforeId) {
    const beforeIndex = getLayerIndex(dropBeforeId);
    if (beforeIndex === -1) {
      targetIndex = layersState.layers.length;
    } else {
      targetIndex = beforeIndex + 1;
    }
  } else {
    targetIndex = 0;
  }
  reorderLayer(layerDragState.draggingId, targetIndex);
  layerDragState.draggingId = null;
  layerDragState.dropBeforeId = null;
  clearLayerDragHighlights();
}

function handleLayerDragLeave(event) {
  if (!layerListElement) {
    return;
  }
  if (!(event.relatedTarget instanceof Element) || !layerListElement.contains(event.relatedTarget)) {
    layerDragState.dropBeforeId = null;
    clearLayerDragHighlights();
  }
}

function initLayers() {
  if (layersState.layers.length > 0) {
    return;
  }
  const baseLayer = createLayer({ name: 'レイヤー1', imageSource: pixelCanvas });
  layersState.selectedId = baseLayer.id;
  renderLayerList();
  updateLayerDockStatus();
  updateLayerControlAvailability();
  compositeLayers();
  queueStateSave();
}

function getWrapperMetrics() {
  if (!canvasStage) {
    return null;
  }
  const wrapper = canvasStage.parentElement;
  if (!wrapper) {
    return null;
  }
  const rect = wrapper.getBoundingClientRect();
  return {
    rect,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}

function cancelActiveDrawing() {
  if (
    activePointerId !== null &&
    typeof pixelCanvas.releasePointerCapture === 'function' &&
    typeof pixelCanvas.hasPointerCapture === 'function' &&
    pixelCanvas.hasPointerCapture(activePointerId)
  ) {
    pixelCanvas.releasePointerCapture(activePointerId);
  }
  activePointerId = null;
  isDrawing = false;
}

const defaultPalette = [
  '#58c4ff',
  '#ffffff',
  '#000000',
  '#ff6b6b',
  '#ff9f43',
  '#feca57',
  '#1dd1a1',
  '#48dbfb',
  '#54a0ff',
  '#5f27cd',
  '#576574',
  '#c8d6e5',
  '#f368e0',
  '#ffafcc',
  '#ffd166',
  '#06d6a0',
  '#118ab2',
  '#073b4c',
  '#8d99ae',
];

function applyCanvasDisplaySize() {
  const displayWidth = state.width * state.pixelSize;
  const displayHeight = state.height * state.pixelSize;
  pixelCanvas.style.width = `${displayWidth}px`;
  pixelCanvas.style.height = `${displayHeight}px`;
  if (canvasStage) {
    canvasStage.style.width = `${displayWidth}px`;
    canvasStage.style.height = `${displayHeight}px`;
    canvasStage.style.setProperty('--pixel-cell', `${state.pixelSize}px`);
  }
  clampOffsets();
  applyCanvasZoom();
  updateVirtualCursorVisualPosition();
}

function applyCanvasZoom() {
  if (!canvasStage) {
    return;
  }
  canvasStage.style.setProperty('--canvas-scale', state.zoom);
  canvasStage.style.setProperty('--canvas-offset-x', `${state.offsetX}px`);
  canvasStage.style.setProperty('--canvas-offset-y', `${state.offsetY}px`);
  updateVirtualCursorVisualPosition();
}

function getOffsetBounds(wrapperSize, scaledSize) {
  if (!Number.isFinite(wrapperSize) || !Number.isFinite(scaledSize)) {
    return { min: 0, max: 0 };
  }
  if (scaledSize <= 0 || wrapperSize <= 0) {
    return { min: 0, max: 0 };
  }
  if (scaledSize <= wrapperSize) {
    const maxOffset = wrapperSize - scaledSize;
    return {
      min: 0,
      max: maxOffset,
    };
  }
  const minOffset = wrapperSize - scaledSize;
  return {
    min: minOffset,
    max: 0,
  };
}

function setZoom(value, options = {}) {
  const { fromUser = false, focus } = options;
  const minAllowed = Math.max(state.minZoom || ZOOM_LIMITS.min, ZOOM_LIMITS.min);
  const clampedValue = clamp(value, minAllowed, ZOOM_LIMITS.max);
  if (Math.abs(clampedValue - state.zoom) < 0.0001) {
    return;
  }
  const previousZoom = state.zoom;
  state.zoom = clampedValue;
  if (fromUser) {
    userAdjustedZoom = true;
  }
  if (focus) {
    const metrics = getWrapperMetrics();
    if (metrics) {
      const localX = focus.x - metrics.rect.left;
      const localY = focus.y - metrics.rect.top;
      const worldX = (localX - state.offsetX) / previousZoom;
      const worldY = (localY - state.offsetY) / previousZoom;
      const scaledWidth = state.width * state.pixelSize * clampedValue;
      const scaledHeight = state.height * state.pixelSize * clampedValue;
      let nextOffsetX = localX - clampedValue * worldX;
      let nextOffsetY = localY - clampedValue * worldY;
      const { min: minOffsetX, max: maxOffsetX } = getOffsetBounds(metrics.rect.width, scaledWidth);
      const { min: minOffsetY, max: maxOffsetY } = getOffsetBounds(metrics.rect.height, scaledHeight);
      nextOffsetX = clamp(nextOffsetX, minOffsetX, maxOffsetX);
      nextOffsetY = clamp(nextOffsetY, minOffsetY, maxOffsetY);
      if (scaledWidth <= metrics.rect.width) {
        const centeredX = (metrics.rect.width - scaledWidth) / 2;
        state.offsetX = clamp(centeredX, minOffsetX, maxOffsetX);
      } else {
        state.offsetX = nextOffsetX;
      }
      if (scaledHeight <= metrics.rect.height) {
        const centeredY = (metrics.rect.height - scaledHeight) / 2;
        state.offsetY = clamp(centeredY, minOffsetY, maxOffsetY);
      } else {
        state.offsetY = nextOffsetY;
      }
    }
  } else if (!fromUser) {
    const metrics = getWrapperMetrics();
    if (metrics) {
      const scaledWidth = state.width * state.pixelSize * clampedValue;
      const scaledHeight = state.height * state.pixelSize * clampedValue;
      state.offsetX = (metrics.rect.width - scaledWidth) / 2;
      state.offsetY = (metrics.rect.height - scaledHeight) / 2;
    } else {
      state.offsetX = 0;
      state.offsetY = 0;
    }
  }
  clampOffsets();
  applyCanvasZoom();
}

function fitZoomToContainer() {
  if (!canvasStage || userAdjustedZoom) {
    return;
  }
  const wrapper = canvasStage.parentElement;
  if (!wrapper) {
    return;
  }
  const availableWidth = wrapper.clientWidth;
  const availableHeight = wrapper.clientHeight;
  const baseWidth = state.width * state.pixelSize;
  const baseHeight = state.height * state.pixelSize;
  if (availableWidth <= 0 || availableHeight <= 0 || baseWidth <= 0 || baseHeight <= 0) {
    return;
  }
  userAdjustedZoom = false;
  state.offsetX = 0;
  state.offsetY = 0;
  const fitZoom = Math.min(availableWidth / baseWidth, availableHeight / baseHeight, ZOOM_LIMITS.max);
  const minZoomTarget = IS_TOUCH_DEVICE
    ? clamp(fitZoom, ZOOM_LIMITS.min, ZOOM_LIMITS.max)
    : Math.max(fitZoom / 4, ZOOM_LIMITS.min);
  state.minZoom = minZoomTarget;
  setZoom(fitZoom);
}

function ensureCanvasCentered() {
  fitZoomToContainer();
  window.requestAnimationFrame(() => {
    if (!userAdjustedZoom) {
      fitZoomToContainer();
    }
  });
}

function ensureVirtualControlPosition() {
  if (!virtualDrawControl) {
    return;
  }
  const width = virtualDrawControl.offsetWidth || 160;
  const height = virtualDrawControl.offsetHeight || 56;
  const maxLeft = Math.max(12, window.innerWidth - width - 12);
  const maxTop = Math.max(12, window.innerHeight - height - 12);
  const targetLeft = virtualCursorState.controlLeft ?? maxLeft;
  const targetTop = virtualCursorState.controlTop ?? maxTop;
  setVirtualControlPosition(targetLeft, targetTop);
}

function updateVirtualCursorVisualPosition() {
  if (!virtualCursorElement || !virtualCursorState.enabled) {
    return;
  }
  const pixelOffsetX = (virtualCursorState.x + 0.5) * state.pixelSize;
  const pixelOffsetY = (virtualCursorState.y + 0.5) * state.pixelSize;
  virtualCursorElement.style.left = `${pixelOffsetX}px`;
  virtualCursorElement.style.top = `${pixelOffsetY}px`;
}

function updateVirtualCursorPosition(x, y, options = {}) {
  if (!virtualCursorState.enabled) {
    return;
  }
  const clampedX = clamp(Math.round(x), 0, Math.max(0, state.width - 1));
  const clampedY = clamp(Math.round(y), 0, Math.max(0, state.height - 1));
  virtualCursorState.x = clampedX;
  virtualCursorState.y = clampedY;
  updateVirtualCursorVisualPosition();
  if (!options.silent) {
    updateCursorInfo(clampedX, clampedY);
  }
  if (virtualCursorState.drawActive) {
    const prevX = virtualCursorState.prevDrawX;
    const prevY = virtualCursorState.prevDrawY;
    if (prevX === null || prevY === null) {
      virtualCursorState.prevDrawX = clampedX;
      virtualCursorState.prevDrawY = clampedY;
      continueVirtualDrawing();
      return;
    }
    if (state.tool === 'pen') {
      drawLine(prevX, prevY, clampedX, clampedY, true);
    } else if (state.tool === 'eraser') {
      drawLine(prevX, prevY, clampedX, clampedY, false);
    } else {
      continueVirtualDrawing();
    }
    virtualCursorState.prevDrawX = clampedX;
    virtualCursorState.prevDrawY = clampedY;
    compositeLayers();
    return;
  }
}

function setVirtualControlPosition(left, top) {
  if (!virtualDrawControl) {
    return;
  }
  const width = virtualDrawControl.offsetWidth || 0;
  const height = virtualDrawControl.offsetHeight || 0;
  const maxLeft = Math.max(12, window.innerWidth - width - 12);
  const maxTop = Math.max(12, window.innerHeight - height - 12);
  const clampedLeft = clamp(left, 12, maxLeft);
  const clampedTop = clamp(top, 12, maxTop);
  virtualDrawControl.style.left = `${clampedLeft}px`;
  virtualDrawControl.style.top = `${clampedTop}px`;
  virtualCursorState.controlLeft = clampedLeft;
  virtualCursorState.controlTop = clampedTop;
}

function endVirtualDrag() {
  if (!virtualDrawHandle) {
    return;
  }
  if (virtualCursorState.dragPointerId !== null) {
    try {
      virtualDrawHandle.releasePointerCapture(virtualCursorState.dragPointerId);
    } catch (_) {
      // noop
    }
  }
  virtualCursorState.dragging = false;
  virtualCursorState.dragPointerId = null;
  virtualDrawHandle.classList.remove('virtual-draw-control__handle--dragging');
}

function endVirtualDrawing() {
  virtualCursorState.drawActive = false;
  if (virtualDrawActionButton) {
    if (
      virtualCursorState.drawButtonPointerId !== null &&
      typeof virtualDrawActionButton.releasePointerCapture === 'function'
    ) {
      try {
        virtualDrawActionButton.releasePointerCapture(virtualCursorState.drawButtonPointerId);
      } catch (_) {
        // noop
      }
    }
    virtualDrawActionButton.classList.remove('virtual-draw-control__action--active');
  }
  virtualCursorState.drawButtonPointerId = null;
  if (isDrawing) {
    isDrawing = false;
  }
  finalizeHistoryEntry();
}

function continueVirtualDrawing() {
  if (!virtualCursorState.drawActive || !isDrawing) {
    return;
  }
  if (state.tool === 'pen') {
    drawBrush(virtualCursorState.x, virtualCursorState.y);
  } else if (state.tool === 'eraser') {
    eraseBrush(virtualCursorState.x, virtualCursorState.y);
  } else {
    return;
  }
  compositeLayers();
}

function startVirtualDrawing() {
  if (!virtualCursorState.enabled) {
    return;
  }
  const { x, y } = virtualCursorState;
  virtualCursorState.prevDrawX = x;
  virtualCursorState.prevDrawY = y;
  if (state.tool === 'pen' || state.tool === 'eraser' || state.tool === 'fill') {
    autoCompactAllDocks();
  }
  if (state.tool === 'pen') {
    isDrawing = true;
    virtualCursorState.drawActive = true;
    drawBrush(x, y);
    compositeLayers();
  } else if (state.tool === 'eraser') {
    isDrawing = true;
    virtualCursorState.drawActive = true;
    eraseBrush(x, y);
    compositeLayers();
  } else if (state.tool === 'eyedropper') {
    const sampled = getPixelColor(x, y);
    if (sampled) {
      setActiveColor(sampled);
    }
    virtualCursorState.drawActive = false;
    virtualCursorState.prevDrawX = null;
    virtualCursorState.prevDrawY = null;
  } else if (state.tool === 'fill') {
    floodFill(x, y, state.color);
    compositeLayers();
    virtualCursorState.drawActive = false;
    virtualCursorState.prevDrawX = null;
    virtualCursorState.prevDrawY = null;
  } else {
    virtualCursorState.drawActive = false;
    virtualCursorState.prevDrawX = null;
    virtualCursorState.prevDrawY = null;
  }
}

function setVirtualCursorEnabled(enabled) {
  const shouldEnable = Boolean(enabled);
  if (virtualCursorState.enabled === shouldEnable) {
    return;
  }
  virtualCursorState.enabled = shouldEnable;
  if (virtualCursorToggle) {
    virtualCursorToggle.classList.toggle('tool-button--active', shouldEnable);
    virtualCursorToggle.setAttribute('aria-pressed', shouldEnable ? 'true' : 'false');
  }
  flashDock('toolDock');
  if (!virtualCursorElement || !virtualDrawControl) {
    initVirtualCursorUI();
  }
  if (!HAS_TOUCH_SUPPORT) {
    return;
  }
  if (virtualCursorElement) {
    virtualCursorElement.dataset.visible = shouldEnable ? 'true' : 'false';
  }
  if (virtualDrawControl) {
    virtualDrawControl.dataset.visible = shouldEnable ? 'true' : 'false';
  }
  if (!shouldEnable) {
    if (
      virtualCursorState.pointerId !== null &&
      typeof pixelCanvas.releasePointerCapture === 'function' &&
      typeof pixelCanvas.hasPointerCapture === 'function' &&
      pixelCanvas.hasPointerCapture(virtualCursorState.pointerId)
    ) {
      pixelCanvas.releasePointerCapture(virtualCursorState.pointerId);
    }
    endVirtualDrawing();
    virtualCursorState.pointerId = null;
    virtualCursorState.lastClientX = null;
    virtualCursorState.lastClientY = null;
    virtualCursorState.residualDX = 0;
    virtualCursorState.residualDY = 0;
    virtualCursorState.prevDrawX = null;
    virtualCursorState.prevDrawY = null;
    updateCursorInfo();
    return;
  }
  virtualCursorState.lastClientX = null;
  virtualCursorState.lastClientY = null;
  virtualCursorState.residualDX = 0;
  virtualCursorState.residualDY = 0;
  virtualCursorState.prevDrawX = null;
  virtualCursorState.prevDrawY = null;
  updateVirtualCursorPosition(state.width / 2, state.height / 2, { silent: false });
  ensureVirtualControlPosition();
}

function initVirtualCursorUI() {
  if (!canvasStage || virtualCursorElement) {
    return;
  }
  virtualCursorElement = document.createElement('div');
  virtualCursorElement.className = 'virtual-cursor';
  virtualCursorElement.dataset.visible = 'false';
  canvasStage.appendChild(virtualCursorElement);

  virtualDrawControl = document.createElement('div');
  virtualDrawControl.className = 'virtual-draw-control';
  virtualDrawControl.dataset.visible = 'false';

  virtualDrawHandle = document.createElement('button');
  virtualDrawHandle.type = 'button';
  virtualDrawHandle.className = 'virtual-draw-control__handle';
  virtualDrawHandle.setAttribute('aria-label', '仮想カーソルボタンを移動');
  virtualDrawHandle.innerHTML = '<span aria-hidden="true">⋮⋮</span>';

  virtualDrawActionButton = document.createElement('button');
  virtualDrawActionButton.type = 'button';
  virtualDrawActionButton.className = 'virtual-draw-control__action';
  virtualDrawActionButton.textContent = '描画';

  virtualDrawControl.appendChild(virtualDrawHandle);
  virtualDrawControl.appendChild(virtualDrawActionButton);

  const host = document.querySelector('.app-stage') || document.body;
  host.appendChild(virtualDrawControl);

  virtualDrawHandle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    virtualCursorState.dragging = true;
    virtualCursorState.dragPointerId = event.pointerId;
    const rect = virtualDrawControl.getBoundingClientRect();
    virtualCursorState.dragOffsetX = event.clientX - rect.left;
    virtualCursorState.dragOffsetY = event.clientY - rect.top;
    virtualDrawHandle.classList.add('virtual-draw-control__handle--dragging');
    try {
      virtualDrawHandle.setPointerCapture(event.pointerId);
    } catch (_) {
      // noop
    }
  });

  virtualDrawHandle.addEventListener('pointermove', (event) => {
    if (!virtualCursorState.dragging || event.pointerId !== virtualCursorState.dragPointerId) {
      return;
    }
    setVirtualControlPosition(event.clientX - virtualCursorState.dragOffsetX, event.clientY - virtualCursorState.dragOffsetY);
  });

  virtualDrawHandle.addEventListener('pointerup', endVirtualDrag);
  virtualDrawHandle.addEventListener('pointercancel', endVirtualDrag);

  virtualDrawActionButton.addEventListener('pointerdown', (event) => {
    if (!virtualCursorState.enabled) {
      return;
    }
    event.preventDefault();
    virtualCursorState.drawButtonPointerId = event.pointerId;
    virtualDrawActionButton.classList.add('virtual-draw-control__action--active');
    try {
      virtualDrawActionButton.setPointerCapture(event.pointerId);
    } catch (_) {
      // noop
    }
    startVirtualDrawing();
  });

  const finishVirtualButtonPress = (event) => {
    if (virtualCursorState.drawButtonPointerId !== null && event.pointerId !== virtualCursorState.drawButtonPointerId) {
      return;
    }
    endVirtualDrawing();
  };

  virtualDrawActionButton.addEventListener('pointerup', finishVirtualButtonPress);
  virtualDrawActionButton.addEventListener('pointercancel', finishVirtualButtonPress);

  window.addEventListener('resize', () => {
    if (virtualCursorState.enabled) {
      ensureVirtualControlPosition();
    }
  });
}

function clampOffsets() {
  const metrics = getWrapperMetrics();
  if (!metrics) {
    state.offsetX = 0;
    state.offsetY = 0;
    return;
  }
  const wrapperWidth = metrics.rect.width;
  const wrapperHeight = metrics.rect.height;
  const scaledWidth = state.width * state.pixelSize * state.zoom;
  const scaledHeight = state.height * state.pixelSize * state.zoom;
  if (scaledWidth <= 0 || scaledHeight <= 0) {
    state.offsetX = 0;
    state.offsetY = 0;
    return;
  }
  const { min: minOffsetX, max: maxOffsetX } = getOffsetBounds(wrapperWidth, scaledWidth);
  const { min: minOffsetY, max: maxOffsetY } = getOffsetBounds(wrapperHeight, scaledHeight);
  state.offsetX = clamp(state.offsetX, minOffsetX, maxOffsetX);
  state.offsetY = clamp(state.offsetY, minOffsetY, maxOffsetY);
}

let lastExportMultiplier = 1;

function refreshExportOptions() {
  if (!exportSizeSelect) {
    return;
  }
  const baseWidth = state.width;
  const baseHeight = state.height;
  const maxBase = Math.max(baseWidth, baseHeight);
  const maxMultiplier = Math.max(1, Math.floor(MAX_EXPORT_DIMENSION / maxBase));
  const currentSelection = Number(exportSizeSelect.value) || lastExportMultiplier || 1;
  exportSizeSelect.innerHTML = '';
  for (let multiplier = 1; multiplier <= maxMultiplier; multiplier += 1) {
    const option = document.createElement('option');
    option.value = String(multiplier);
    option.textContent = `${multiplier} × (${baseWidth * multiplier} × ${baseHeight * multiplier}px)`;
    exportSizeSelect.appendChild(option);
  }
  const selected = Math.min(Math.max(currentSelection, 1), maxMultiplier);
  exportSizeSelect.value = String(selected);
  lastExportMultiplier = selected;
  if (exportHint) {
    exportHint.textContent = `最大解像度は ${MAX_EXPORT_DIMENSION}px までです。`;
  }
}

function getZoomPointerDistance() {
  if (zoomPointers.size < 2) {
    return 0;
  }
  const pointers = Array.from(zoomPointers.values());
  const [a, b] = pointers;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function getZoomPointerFocus() {
  if (zoomPointers.size === 0) {
    return null;
  }
  let sumX = 0;
  let sumY = 0;
  zoomPointers.forEach((pointer) => {
    sumX += pointer.x;
    sumY += pointer.y;
  });
  const avgX = sumX / zoomPointers.size;
  const avgY = sumY / zoomPointers.size;
  return { x: avgX, y: avgY };
}

function handleWheelZoom(event) {
  if (!canvasStage) {
    return;
  }
  event.preventDefault();
  const direction = event.deltaY < 0 ? 1 : -1;
  const factor = direction > 0 ? 1 + ZOOM_WHEEL_FACTOR : 1 / (1 + ZOOM_WHEEL_FACTOR);
  setZoom(state.zoom * factor, { fromUser: true, focus: { x: event.clientX, y: event.clientY } });
}

function handleZoomPointerDown(event) {
  if (event.pointerType !== 'touch' || virtualCursorState.enabled) {
    return;
  }
  zoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (zoomPointers.size === 2) {
    pinchActive = true;
    cancelActiveDrawing();
    pinchStartDistance = getZoomPointerDistance();
    pinchStartZoom = state.zoom;
    applyCanvasZoom();
  }
}

function handleZoomPointerMove(event) {
  if (event.pointerType !== 'touch' || virtualCursorState.enabled || !zoomPointers.has(event.pointerId)) {
    return;
  }
  zoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (zoomPointers.size === 2 && pinchStartDistance) {
    event.preventDefault();
    const newDistance = getZoomPointerDistance();
    if (newDistance > 0 && pinchStartDistance > 0) {
      const ratio = newDistance / pinchStartDistance;
      const focusWorld = getZoomPointerFocus();
      setZoom(pinchStartZoom * ratio, { fromUser: true, focus: focusWorld });
    }
  }
}

function handleZoomPointerUp(event) {
  if (virtualCursorState.enabled) {
    zoomPointers.clear();
    pinchStartDistance = null;
    pinchActive = false;
    clampOffsets();
    applyCanvasZoom();
    return;
  }
  if (zoomPointers.has(event.pointerId)) {
    zoomPointers.delete(event.pointerId);
  }
  if (zoomPointers.size < 2) {
    pinchStartDistance = null;
    if (pinchActive) {
      pinchActive = false;
      clampOffsets();
      applyCanvasZoom();
    }
  }
}

function initZoomControls() {
  if (!canvasStage) {
    return;
  }
  canvasStage.addEventListener('wheel', handleWheelZoom, { passive: false });
  canvasStage.addEventListener('pointerdown', handleZoomPointerDown, { capture: true });
  canvasStage.addEventListener('pointermove', handleZoomPointerMove, { passive: false });
  canvasStage.addEventListener('pointerup', handleZoomPointerUp);
  canvasStage.addEventListener('pointercancel', handleZoomPointerUp);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex) {
  if (typeof hex !== 'string' || hex.length === 0) {
    return state.color;
  }
  let value = hex.trim();
  if (value.startsWith('#')) {
    value = value.slice(1);
  }
  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (value.length < 6) {
    value = value.padEnd(6, value[value.length - 1] || '0');
  }
  return `#${value.slice(0, 6).toLowerCase()}`;
}

function setActiveTool(tool) {
  state.tool = tool;
  toolButtons.forEach((button) => {
    const isActive = button.dataset.tool === tool;
    button.classList.toggle('tool-button--active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
  updateToolDockStatus();
  flashDock('toolDock');
  scheduleDockAutoHide();
}

function setActiveColor(color, swatch = null, options = {}) {
  const { closePanel = true } = options;
  const normalized = normalizeHex(color);
  if (!swatch) {
    const match = Array.from(paletteContainer.children).find(
      (element) => element.dataset.color === normalized,
    );
    if (match) {
      swatch = match;
    }
  }
  if (activeSwatch && activeSwatch !== swatch) {
    activeSwatch.classList.remove('swatch--active');
  }
  if (swatch) {
    swatch.classList.add('swatch--active');
    activeSwatch = swatch;
    swatch.dataset.color = normalized;
    swatch.style.backgroundColor = normalized;
  } else {
    activeSwatch = null;
  }
  colorPicker.value = normalized;
  state.color = normalized;
  if (swatch && closePanel) {
    window.setTimeout(() => closePanelIfActive('palettePanel'), 0);
  }
  updatePaletteDockStatus();
  flashDock('paletteDock');
  scheduleDockAutoHide();
}

function hidePanel(panel) {
  if (!panel) return;
  panel.hidden = true;
  panel.setAttribute('aria-hidden', 'true');
}

function showPanel(panel) {
  if (!panel) return;
  panel.hidden = false;
  panel.setAttribute('aria-hidden', 'false');
  if (!panel.hasAttribute('tabindex')) {
    panel.setAttribute('tabindex', '-1');
  }
  if (typeof panel.focus === 'function') {
    panel.focus();
  }
}

function closePanelIfActive(panelId) {
  if (activePanel && activePanel.id === panelId) {
    closeActivePanel();
  }
}

const SWATCH_LONG_PRESS_MS = 600;
const SWATCH_DRAG_THRESHOLD = 6;

function openSwatchEditor(button) {
  editingSwatch = button;
  const currentColor = normalizeHex(button.dataset.color || state.color);
  colorPicker.value = currentColor;
  colorPicker.click();
}

function findPaletteSwatchAtPoint(clientX, clientY, source = null) {
  if (typeof document === 'undefined') {
    return null;
  }
  const element = document.elementFromPoint(clientX, clientY);
  if (!(element instanceof HTMLElement)) {
    return null;
  }
  const swatch = element.classList.contains('swatch') ? element : element.closest('.swatch');
  if (!(swatch instanceof HTMLElement)) {
    return null;
  }
  if (!paletteContainer?.contains(swatch) || swatch === source || swatch.classList.contains('swatch--add')) {
    return null;
  }
  return swatch;
}

function swapSwatchColors(source, target) {
  if (!source || !target || source === target) {
    return;
  }
  const sourceColor = normalizeHex(source.dataset.color || source.style.backgroundColor);
  const targetColor = normalizeHex(target.dataset.color || target.style.backgroundColor);
  if (sourceColor === targetColor) {
    return;
  }
  source.dataset.color = targetColor;
  source.style.backgroundColor = targetColor;
  target.dataset.color = sourceColor;
  target.style.backgroundColor = sourceColor;
  if (activeSwatch === source) {
    setActiveColor(targetColor, source, { closePanel: false });
  } else if (activeSwatch === target) {
    setActiveColor(sourceColor, target, { closePanel: false });
  }
}

function setupSwatchInteractions(button) {
  let longPressTimer = null;
  let longPressTriggered = false;
  const dragState = {
    pointerId: null,
    dragging: false,
    startX: 0,
    startY: 0,
    dropTarget: null,
    suppressClick: false,
  };

  const clearTimer = () => {
    if (longPressTimer !== null) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  const cancelLongPress = () => {
    clearTimer();
  };

  const clearDropTarget = () => {
    if (dragState.dropTarget) {
      dragState.dropTarget.classList.remove('swatch--drop-target');
      dragState.dropTarget = null;
    }
  };

  const endDrag = () => {
    if (dragState.dragging) {
      button.classList.remove('swatch--dragging');
    }
    clearDropTarget();
    dragState.pointerId = null;
    dragState.dragging = false;
  };

  button.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }
    longPressTriggered = false;
    dragState.suppressClick = false;
    dragState.pointerId = event.pointerId;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.dragging = false;
    clearDropTarget();
    button.dataset.longPressActive = 'false';
    if (typeof button.setPointerCapture === 'function') {
      try {
        button.setPointerCapture(event.pointerId);
      } catch (error) {
        // ignore pointer capture failures
      }
    }
    longPressTimer = window.setTimeout(() => {
      longPressTriggered = true;
      button.dataset.longPressActive = 'true';
      openSwatchEditor(button);
    }, SWATCH_LONG_PRESS_MS);
  });

  button.addEventListener('pointermove', (event) => {
    if (dragState.pointerId !== event.pointerId) {
      return;
    }
    if (!dragState.dragging) {
      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;
      if (Math.hypot(dx, dy) < SWATCH_DRAG_THRESHOLD) {
        return;
      }
      dragState.dragging = true;
      cancelLongPress();
      button.dataset.longPressActive = 'false';
      button.classList.add('swatch--dragging');
    }
    event.preventDefault();
    const target = findPaletteSwatchAtPoint(event.clientX, event.clientY, button);
    if (target !== dragState.dropTarget) {
      clearDropTarget();
      if (target) {
        target.classList.add('swatch--drop-target');
        dragState.dropTarget = target;
      }
    }
  });

  button.addEventListener('pointerup', (event) => {
    if (dragState.pointerId !== event.pointerId) {
      cancelLongPress();
      if (longPressTriggered) {
        window.setTimeout(() => {
          button.dataset.longPressActive = 'false';
        }, 0);
      }
      return;
    }
    cancelLongPress();
    if (
      typeof button.releasePointerCapture === 'function' &&
      typeof button.hasPointerCapture === 'function' &&
      button.hasPointerCapture(event.pointerId)
    ) {
      try {
        button.releasePointerCapture(event.pointerId);
      } catch (error) {
        // ignore release failures
      }
    }
    const wasDragging = dragState.dragging;
    const dropTarget = dragState.dropTarget;
    endDrag();
    if (wasDragging) {
      dragState.suppressClick = true;
      if (dropTarget) {
        swapSwatchColors(button, dropTarget);
      }
    }
    if (longPressTriggered) {
      window.setTimeout(() => {
        button.dataset.longPressActive = 'false';
      }, 0);
    }
  });

  button.addEventListener('pointerleave', cancelLongPress);

  button.addEventListener('pointercancel', (event) => {
    cancelLongPress();
    if (
      dragState.pointerId === event.pointerId &&
      typeof button.releasePointerCapture === 'function' &&
      typeof button.hasPointerCapture === 'function' &&
      button.hasPointerCapture(event.pointerId)
    ) {
      try {
        button.releasePointerCapture(event.pointerId);
      } catch (error) {
        // ignore release failures
      }
    }
    const wasDragging = dragState.dragging;
    endDrag();
    if (wasDragging) {
      dragState.suppressClick = true;
    }
  });

  button.addEventListener('click', (event) => {
    if (dragState.suppressClick) {
      event.preventDefault();
      event.stopImmediatePropagation();
      dragState.suppressClick = false;
      return;
    }
    if (button.dataset.longPressActive === 'true') {
      event.preventDefault();
      event.stopImmediatePropagation();
      button.dataset.longPressActive = 'false';
      return;
    }
    const color = button.dataset.color || button.style.backgroundColor;
    setActiveColor(color, button, { closePanel: true });
  });
}

colorPicker.addEventListener('change', () => {
  const selected = normalizeHex(colorPicker.value);
  if (editingSwatch) {
    editingSwatch.dataset.longPressActive = 'false';
    setActiveColor(selected, editingSwatch, { closePanel: true });
    editingSwatch = null;
  } else {
    setActiveColor(selected, null, { closePanel: true });
  }
});

colorPicker.addEventListener('blur', () => {
  editingSwatch = null;
});

colorPicker.addEventListener('input', () => {
  const selected = normalizeHex(colorPicker.value);
  if (editingSwatch) {
    editingSwatch.dataset.longPressActive = 'false';
    setActiveColor(selected, editingSwatch, { closePanel: false });
  } else {
    setActiveColor(selected, null, { closePanel: false });
  }
});

function closeActivePanel() {
  floatingPanels.forEach((panel) => {
    hidePanel(panel);
  });
  if (panelOverlay) {
    panelOverlay.hidden = true;
    panelOverlay.setAttribute('aria-hidden', 'true');
  }
  activePanel = null;
  panelToggleButtons.forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
  });
}

function openPanel(panelId) {
  const target = floatingPanels.find((panel) => panel.id === panelId);
  if (!target) {
    return;
  }
  floatingPanels.forEach((panel) => {
    if (panel === target) {
      showPanel(panel);
    } else {
      hidePanel(panel);
    }
  });
  if (panelId === 'exportPanel') {
    refreshExportOptions();
  }
  if (panelOverlay) {
    panelOverlay.hidden = false;
    panelOverlay.setAttribute('aria-hidden', 'false');
  }
  activePanel = target;
  panelToggleButtons.forEach((button) => {
    const expanded = button.dataset.panelTarget === panelId;
    button.setAttribute('aria-expanded', String(expanded));
  });
}

function setDockPosition(x, y) {
  if (!floatingDock) {
    return;
  }
  const width = floatingDock.offsetWidth;
  const height = floatingDock.offsetHeight;
  const maxX = window.innerWidth - width - 12;
  const maxY = window.innerHeight - height - 12;
  const clampedX = clamp(x, 12, Math.max(12, maxX));
  const clampedY = clamp(y, 12, Math.max(12, maxY));
  floatingDock.style.left = `${clampedX}px`;
  floatingDock.style.top = `${clampedY}px`;
}

function makeDockDraggable(dockElement, handleElement) {
  if (!dockElement || !handleElement) {
    return;
  }
  const dragState = {
    active: false,
    pointerId: null,
    offsetX: 0,
    offsetY: 0,
  };

  const clampPosition = (left, top) => {
    const width = dockElement.offsetWidth;
    const height = dockElement.offsetHeight;
    const maxLeft = Math.max(12, window.innerWidth - width - 12);
    const maxTop = Math.max(12, window.innerHeight - height - 12);
    const clampedLeft = clamp(left, 12, maxLeft);
    const clampedTop = clamp(top, 12, maxTop);
    dockElement.style.left = `${clampedLeft}px`;
    dockElement.style.top = `${clampedTop}px`;
    dockElement.style.right = 'auto';
    dockElement.style.bottom = 'auto';
  };

  const ensureWithinBounds = () => {
    if (dockElement.dataset.visible === 'false' || dockElement.hasAttribute('hidden')) {
      return;
    }
    const rect = dockElement.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return;
    }
    dockElement.style.left = `${rect.left}px`;
    dockElement.style.top = `${rect.top}px`;
    dockElement.style.right = 'auto';
    dockElement.style.bottom = 'auto';
    clampPosition(rect.left, rect.top);
  };

  dockElement.__ensureWithinBounds = ensureWithinBounds;

  const handleDockPointerMove = (event) => {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }
    event.preventDefault();
    clampPosition(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
  };

  const endDrag = (event) => {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }
    dragState.active = false;
    dragState.pointerId = null;
    handleElement.classList.remove('mini-dock__drag--dragging');
    try {
      handleElement.releasePointerCapture(event.pointerId);
    } catch (_) {
      // noop
    }
    snapDockToEdges(dockElement);
    window.removeEventListener('pointermove', handleDockPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    scheduleDockAutoHide();
  };

  handleElement.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    ensureWithinBounds();
    const rect = dockElement.getBoundingClientRect();
    dragState.active = true;
    dragState.pointerId = event.pointerId;
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;
    handleElement.classList.add('mini-dock__drag--dragging');
    const identifier = getDockIdentifierFromElement(dockElement);
    if (identifier) {
      clearDockFade(identifier);
      if (Object.prototype.hasOwnProperty.call(miniDockUserMoved, identifier)) {
        miniDockUserMoved[identifier] = true;
      }
    }
    clearDockAutoHideTimer();
    try {
      handleElement.setPointerCapture(event.pointerId);
    } catch (_) {
      // noop
    }
    window.addEventListener('pointermove', handleDockPointerMove, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });

  handleElement.addEventListener('pointerup', endDrag);
  handleElement.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', ensureWithinBounds);
  ensureWithinBounds();
}

function snapDockToEdges(dockElement) {
  if (!dockElement) {
    return;
  }
  const rect = dockElement.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  if (width === 0 && height === 0) {
    return;
  }
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let left = rect.left;
  let top = rect.top;
  const rightGap = viewportWidth - rect.right;
  const bottomGap = viewportHeight - rect.bottom;

  if (Math.abs(rect.left - 12) <= DOCK_SNAP_DISTANCE) {
    left = 12;
  } else if (Math.abs(rightGap - 12) <= DOCK_SNAP_DISTANCE) {
    left = viewportWidth - width - 12;
  }

  if (Math.abs(rect.top - 12) <= DOCK_SNAP_DISTANCE) {
    top = 12;
  } else if (Math.abs(bottomGap - 12) <= DOCK_SNAP_DISTANCE) {
    top = viewportHeight - height - 12;
  }

  const centerLeft = (viewportWidth - width) / 2;
  if (Math.abs(rect.left - centerLeft) <= DOCK_SNAP_DISTANCE) {
    left = centerLeft;
  }
  const centerTop = (viewportHeight - height) / 2;
  if (Math.abs(rect.top - centerTop) <= DOCK_SNAP_DISTANCE) {
    top = centerTop;
  }

  const maxLeft = Math.max(12, viewportWidth - width - 12);
  const maxTop = Math.max(12, viewportHeight - height - 12);
  dockElement.style.left = `${clamp(left, 12, maxLeft)}px`;
  dockElement.style.top = `${clamp(top, 12, maxTop)}px`;
  dockElement.style.right = 'auto';
  const identifier = getDockIdentifierFromElement(dockElement);
  if (identifier) {
    clearDockFade(identifier);
  }
}

function updateDockToggleState(identifier) {
  const button = dockToggleButtons.find((item) => item.dataset.dockToggle === identifier);
  if (!button) {
    return;
  }
  const visible = Boolean(dockVisibilityState[identifier]);
  button.setAttribute('aria-pressed', visible ? 'true' : 'false');
}

function updateToolDockStatus() {
  if (!toolDockStatusIcon) {
    return;
  }
  const activeButton = toolButtons.find((button) => button.dataset.tool === state.tool);
  if (activeButton) {
    const iconPath = activeButton.dataset.icon || activeButton.querySelector('img')?.src;
    if (iconPath) {
      toolDockStatusIcon.src = iconPath;
    }
    const label = activeButton.getAttribute('aria-label') || '選択中のツール';
    toolDockStatusIcon.alt = label;
  } else {
    toolDockStatusIcon.src = '';
    toolDockStatusIcon.alt = '';
  }
}

function updatePaletteDockStatus() {
  if (!paletteDockStatusSwatch) {
    return;
  }
  paletteDockStatusSwatch.style.backgroundColor = state.color;
  paletteDockStatusSwatch.dataset.color = state.color;
}

function updateCanvasDockStatus() {
  if (!canvasDockStatusText) {
    return;
  }
  canvasDockStatusText.textContent = `${state.width}×${state.height}`;
}

function updateDockStateControls(identifier) {
  const stateButton = dockStateButtons.find((item) => item.dataset.dockState === identifier);
  const state = dockDisplayState[identifier] || 'expanded';
  if (stateButton) {
    const baseLabel = DOCK_LABELS[identifier] || 'ドック';
    stateButton.setAttribute('aria-label', state === 'compact' ? `${baseLabel}を展開` : `${baseLabel}をコンパクト表示`);
    stateButton.setAttribute('aria-expanded', state === 'expanded' ? 'true' : 'false');
  }
}

function applyDockDisplayState(identifier) {
  const dockElement = dockElements[identifier];
  if (!dockElement) {
    return;
  }
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const previousRect = dockElement.getBoundingClientRect();
  const rawBottomGap = viewportHeight > 0 ? viewportHeight - previousRect.bottom : Infinity;
  const anchoredToBottom = Math.abs(rawBottomGap) <= DOCK_BOTTOM_ANCHOR_THRESHOLD;
  const state = dockDisplayState[identifier] || 'expanded';
  dockElement.dataset.state = state;
  updateDockStateControls(identifier);
  if (anchoredToBottom && viewportHeight > 0) {
    const nextRect = dockElement.getBoundingClientRect();
    const margin = 12;
    const preservedGap = Math.max(0, rawBottomGap);
    const maxTop = Math.max(margin, viewportHeight - nextRect.height - margin);
    const targetTop = viewportHeight - preservedGap - nextRect.height;
    const clampedTop = clamp(targetTop, margin, maxTop);
    dockElement.style.top = `${clampedTop}px`;
    dockElement.style.bottom = 'auto';
  }
  if (typeof dockElement.__ensureWithinBounds === 'function') {
    dockElement.__ensureWithinBounds();
  }
}

function setDockDisplayState(identifier, state) {
  if (!(identifier in dockElements)) {
    return;
  }
  const targetState = state === 'compact' ? 'compact' : 'expanded';
  const wasState = dockDisplayState[identifier];
  delete autoCompactStates[identifier];
  dockDisplayState[identifier] = targetState;
  if (targetState !== 'hidden') {
    DOCK_LAST_ACTIVE_STATE[identifier] = targetState;
  }
  if (!dockVisibilityState[identifier]) {
    return;
  }
  if (wasState === targetState) {
    updateDockStateControls(identifier);
    return;
  }
  applyDockDisplayState(identifier);
  flashDock(identifier);
  scheduleDockAutoHide();
}

function toggleDockDisplayState(identifier) {
  const current = dockDisplayState[identifier] || 'expanded';
  setDockDisplayState(identifier, current === 'compact' ? 'expanded' : 'compact');
}

function setDockVisibility(identifier, visible) {
  const dockElement = dockElements[identifier];
  if (!dockElement) {
    return;
  }
  const shouldShow = Boolean(visible);
  if (dockVisibilityState[identifier] === shouldShow) {
    updateDockToggleState(identifier);
    return;
  }
  if (!shouldShow) {
    DOCK_LAST_ACTIVE_STATE[identifier] = dockDisplayState[identifier] || 'expanded';
  }
  dockVisibilityState[identifier] = shouldShow;
  delete autoCompactStates[identifier];
  if (shouldShow) {
    dockElement.dataset.visible = 'true';
    dockElement.removeAttribute('hidden');
    const restoreState = DOCK_LAST_ACTIVE_STATE[identifier] || dockDisplayState[identifier] || 'expanded';
    dockDisplayState[identifier] = restoreState;
    applyDockDisplayState(identifier);
    flashDock(identifier);
  } else {
    dockElement.dataset.visible = 'false';
    dockElement.setAttribute('hidden', '');
  }
  updateDockToggleState(identifier);
  scheduleDockAutoHide();
}

function toggleDockVisibility(identifier) {
  if (!(identifier in dockElements)) {
    return;
  }
  const current = Boolean(dockVisibilityState[identifier]);
  setDockVisibility(identifier, !current);
}

function getDockIdentifierFromElement(element) {
  const entry = Object.entries(dockElements).find(([, value]) => value === element);
  return entry ? entry[0] : null;
}

function clearDockFade(identifier) {
  const dockElement = dockElements[identifier];
  if (!dockElement) {
    return;
  }
  dockElement.classList.remove('mini-dock--flash');
  restoreDockDisplay(identifier);
}

function restoreDockDisplay(identifier) {
  if (!dockVisibilityState[identifier]) {
    delete autoCompactStates[identifier];
    return;
  }
  const previousState = autoCompactStates[identifier];
  if (!previousState) {
    return;
  }
  delete autoCompactStates[identifier];
  dockDisplayState[identifier] = previousState;
  applyDockDisplayState(identifier);
}

function autoCompactDock(identifier) {
  if (!dockVisibilityState[identifier]) {
    return;
  }
  if (dockDisplayState[identifier] === 'compact') {
    return;
  }
  if (autoCompactStates[identifier]) {
    return;
  }
  autoCompactStates[identifier] = dockDisplayState[identifier] || 'expanded';
  dockDisplayState[identifier] = 'compact';
  applyDockDisplayState(identifier);
}

function autoCompactAllDocks() {
  Object.keys(dockElements).forEach((identifier) => {
    if (!dockElements[identifier]) {
      return;
    }
    autoCompactDock(identifier);
  });
}

function setPreviewVisible(visible) {
  previewVisible = Boolean(visible);
  if (previewWindow) {
    previewWindow.hidden = !previewVisible;
    if (previewVisible) {
      ensurePreviewWithinBounds();
    }
  }
  if (togglePreviewButton) {
    togglePreviewButton.setAttribute('aria-pressed', previewVisible ? 'true' : 'false');
  }
}

function ensurePreviewWithinBounds() {
  if (!previewWindow || previewWindow.hidden) {
    return;
  }
  const rect = previewWindow.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return;
  }
  const margin = 12;
  const maxLeft = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxTop = Math.max(margin, window.innerHeight - rect.height - margin);
  const currentLeft = rect.left;
  const currentTop = rect.top;
  const clampedLeft = clamp(currentLeft, margin, maxLeft);
  const clampedTop = clamp(currentTop, margin, maxTop);
  previewWindow.style.left = `${clampedLeft}px`;
  previewWindow.style.top = `${clampedTop}px`;
  previewWindow.style.right = 'auto';
  previewWindow.style.bottom = 'auto';
}

function initPreviewWindow() {
  if (!previewWindow || !previewHandle) {
    return;
  }

  const handlePointerMove = (event) => {
    if (!previewDragState.active || event.pointerId !== previewDragState.pointerId) {
      return;
    }
    event.preventDefault();
    const margin = 12;
    const rect = previewWindow.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const maxTop = Math.max(margin, window.innerHeight - height - margin);
    let nextLeft = event.clientX - previewDragState.offsetX;
    let nextTop = event.clientY - previewDragState.offsetY;
    nextLeft = clamp(nextLeft, margin, maxLeft);
    nextTop = clamp(nextTop, margin, maxTop);
    previewWindow.style.left = `${nextLeft}px`;
    previewWindow.style.top = `${nextTop}px`;
    previewWindow.style.right = 'auto';
    previewWindow.style.bottom = 'auto';
  };

  const endDrag = (event) => {
    if (!previewDragState.active || event.pointerId !== previewDragState.pointerId) {
      return;
    }
    previewDragState.active = false;
    previewDragState.pointerId = null;
    try {
      previewHandle.releasePointerCapture(event.pointerId);
    } catch (_) {
      // noop
    }
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    ensurePreviewWithinBounds();
  };

  previewHandle.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }
    event.preventDefault();
    const rect = previewWindow.getBoundingClientRect();
    previewDragState.active = true;
    previewDragState.pointerId = event.pointerId;
    previewDragState.offsetX = event.clientX - rect.left;
    previewDragState.offsetY = event.clientY - rect.top;
    previewWindow.style.left = `${rect.left}px`;
    previewWindow.style.top = `${rect.top}px`;
    previewWindow.style.right = 'auto';
    previewWindow.style.bottom = 'auto';
    try {
      previewHandle.setPointerCapture(event.pointerId);
    } catch (_) {
      // noop
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  });

  window.addEventListener('resize', () => {
    if (!previewWindow || previewWindow.hidden) {
      return;
    }
    ensurePreviewWithinBounds();
  });

  ensurePreviewWithinBounds();
}

function clearDockAutoHideTimer() {
  if (dockAutoHideTimer !== null) {
    window.clearTimeout(dockAutoHideTimer);
    dockAutoHideTimer = null;
  }
}

function scheduleDockAutoHide() {
  clearDockAutoHideTimer();
  if (AUTO_HIDE_TIMEOUT_MS <= 0) {
    return;
  }
  dockAutoHideTimer = window.setTimeout(() => {
    Object.entries(dockElements).forEach(([identifier, element]) => {
      if (!element) {
        return;
      }
      if (!dockVisibilityState[identifier]) {
        return;
      }
      if (element.contains(document.activeElement)) {
        return;
      }
      autoCompactDock(identifier);
    });
  }, AUTO_HIDE_TIMEOUT_MS);
}

function flashDock(identifier) {
  const dockElement = dockElements[identifier];
  if (!dockElement || !dockVisibilityState[identifier]) {
    return;
  }
  restoreDockDisplay(identifier);
  clearDockAutoHideTimer();
  if (!docksReady) {
    return;
  }
  dockElement.classList.remove('mini-dock--flash');
  void dockElement.offsetWidth; // force reflow
  dockElement.classList.add('mini-dock--flash');
  window.setTimeout(() => {
    dockElement.classList.remove('mini-dock--flash');
  }, 500);
  scheduleDockAutoHide();
}

function handleDockPointerEnter(event) {
  const identifier = getDockIdentifierFromElement(event.currentTarget);
  if (!identifier) {
    return;
  }
  restoreDockDisplay(identifier);
  clearDockAutoHideTimer();
}

function handleDockPointerLeave() {
  scheduleDockAutoHide();
}

function handleDockPointerDown(event) {
  const identifier = getDockIdentifierFromElement(event.currentTarget);
  if (!identifier) {
    return;
  }
  restoreDockDisplay(identifier);
  clearDockAutoHideTimer();
}

function handleDockFocusIn(event) {
  const identifier = getDockIdentifierFromElement(event.currentTarget);
  if (!identifier) {
    return;
  }
  restoreDockDisplay(identifier);
  clearDockAutoHideTimer();
}

function handleDockFocusOut() {
  scheduleDockAutoHide();
}

function handleGlobalInteraction() {
  scheduleDockAutoHide();
}

function setupDockAutoHide() {
  Object.entries(dockElements).forEach(([identifier, element]) => {
    if (!element) {
      return;
    }
    element.addEventListener('pointerenter', handleDockPointerEnter);
    element.addEventListener('pointerleave', handleDockPointerLeave);
    element.addEventListener('pointerdown', handleDockPointerDown);
    element.addEventListener('pointercancel', handleDockPointerDown);
    element.addEventListener('focusin', handleDockFocusIn);
    element.addEventListener('focusout', handleDockFocusOut);
  });
  ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach((type) => {
    window.addEventListener(type, handleGlobalInteraction, { passive: true });
  });
  docksReady = true;
  scheduleDockAutoHide();
}

function alignDockForViewport() {
  if (!floatingDock) {
    return;
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = floatingDock.offsetWidth;
  const height = floatingDock.offsetHeight;
  const margin = 24;
  let targetTop = margin;
  if (vh <= 620) {
    targetTop = Math.max(margin, vh - height - margin);
  }
  setDockPosition(margin, targetTop);
}

function setDockAbsolutePosition(dockElement, left, top) {
  if (!dockElement) {
    return;
  }
  const width = dockElement.offsetWidth;
  const height = dockElement.offsetHeight;
  if (width === 0 && height === 0) {
    return;
  }
  const maxLeft = Math.max(12, window.innerWidth - width - 12);
  const maxTop = Math.max(12, window.innerHeight - height - 12);
  const clampedLeft = clamp(left, 12, maxLeft);
  const clampedTop = clamp(top, 12, maxTop);
  dockElement.style.left = `${clampedLeft}px`;
  dockElement.style.top = `${clampedTop}px`;
  dockElement.style.right = 'auto';
  dockElement.style.bottom = 'auto';
  if (typeof dockElement.__ensureWithinBounds === 'function') {
    dockElement.__ensureWithinBounds();
  }
}

function positionDefaultMiniDocks() {
  const margin = 24;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (toolDock && !miniDockUserMoved.toolDock) {
    setDockAbsolutePosition(toolDock, margin, margin);
  }

  if (paletteDock && !miniDockUserMoved.paletteDock) {
    const width = paletteDock.offsetWidth;
    const left = viewportWidth - width - margin;
    setDockAbsolutePosition(paletteDock, left, margin);
  }

  if (canvasDock && !miniDockUserMoved.canvasDock) {
    const width = canvasDock.offsetWidth;
    const height = canvasDock.offsetHeight;
    const left = viewportWidth - width - margin;
    const top = viewportHeight - height - margin;
    setDockAbsolutePosition(canvasDock, left, top);
  }

  if (layerDock && !miniDockUserMoved.layerDock) {
    const height = layerDock.offsetHeight;
    const top = viewportHeight - height - margin;
    setDockAbsolutePosition(layerDock, margin, top);
  }
}

function handleMiniDockResize() {
  positionDefaultMiniDocks();
}

function setDockCollapsed(collapsed) {
  if (!floatingDock || !dockToggle) {
    return;
  }
  dockCollapsed = Boolean(collapsed);
  floatingDock.setAttribute('data-collapsed', dockCollapsed ? 'true' : 'false');
  dockToggle.setAttribute('aria-expanded', dockCollapsed ? 'false' : 'true');
  dockToggle.setAttribute('aria-label', dockCollapsed ? 'ドックを展開' : 'ドックを折りたたむ');
  if (userMovedDock) {
    const rect = floatingDock.getBoundingClientRect();
    setDockPosition(rect.left, rect.top);
  } else {
    alignDockForViewport();
  }
}

function initDockDrag() {
  if (!floatingDock || !dockHandle) {
    return;
  }

  const endDrag = () => {
    if (dockDragState.pointerId !== null && dockHandle.hasPointerCapture(dockDragState.pointerId)) {
      dockHandle.releasePointerCapture(dockDragState.pointerId);
    }
    dockDragState.active = false;
    dockDragState.pointerId = null;
    dockHandle.classList.remove('floating-dock__handle--dragging');
  };

  dockHandle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    dockDragState.active = true;
    dockDragState.pointerId = event.pointerId;
    const rect = floatingDock.getBoundingClientRect();
    dockDragState.offsetX = event.clientX - rect.left;
    dockDragState.offsetY = event.clientY - rect.top;
    dockHandle.classList.add('floating-dock__handle--dragging');
    dockHandle.setPointerCapture(event.pointerId);
    userMovedDock = true;
  });

  dockHandle.addEventListener('pointermove', (event) => {
    if (!dockDragState.active) {
      return;
    }
    setDockPosition(event.clientX - dockDragState.offsetX, event.clientY - dockDragState.offsetY);
  });

  dockHandle.addEventListener('pointerup', endDrag);
  dockHandle.addEventListener('pointercancel', endDrag);

  window.addEventListener('resize', () => {
    if (!floatingDock) {
      return;
    }
    if (userMovedDock) {
      const rect = floatingDock.getBoundingClientRect();
      setDockPosition(rect.left, rect.top);
    } else {
      alignDockForViewport();
    }
    if (!userAdjustedZoom) {
      fitZoomToContainer();
    } else {
      applyCanvasZoom();
    }
  });
}

function updateBrushSize(value) {
  const size = clamp(Number(value) || 1, Number(brushSizeInput.min), Number(brushSizeInput.max));
  state.brushSize = size;
  brushSizeInput.value = String(size);
  brushSizeDisplay.textContent = String(size);
  flashDock('toolDock');
  scheduleDockAutoHide();
}

function updatePixelSize(options = {}) {
  const { skipComposite = false } = options;
  state.pixelSize = FIXED_PIXEL_SIZE;
  if (pixelSizeInput) {
    pixelSizeInput.value = String(FIXED_PIXEL_SIZE);
  }
  applyCanvasDisplaySize();
  if (!userAdjustedZoom) {
    fitZoomToContainer();
  } else {
    applyCanvasZoom();
  }
  if (!skipComposite) {
    compositeLayers();
    flashDock('canvasDock');
    scheduleDockAutoHide();
  }
  updateCanvasDockStatus();
}

function updatePreviewSize() {
  const maxDim = Math.max(state.width, state.height);
  const baseSize = 96;
  const scale = Math.max(1, Math.floor(baseSize / maxDim));
  if (previewCanvas.width !== state.width) {
    previewCanvas.width = state.width;
  }
  if (previewCanvas.height !== state.height) {
    previewCanvas.height = state.height;
  }
  const displayWidth = `${state.width * scale}px`;
  const displayHeight = `${state.height * scale}px`;
  if (previewCanvas.style.width !== displayWidth) {
    previewCanvas.style.width = displayWidth;
  }
  if (previewCanvas.style.height !== displayHeight) {
    previewCanvas.style.height = displayHeight;
  }
}

function initPalette() {
  paletteContainer.innerHTML = '';
  addPaletteButton = null;
  defaultPalette.forEach((hex) => {
    const button = createPaletteSwatch(hex);
    paletteContainer.appendChild(button);
  });
  ensurePaletteAddButton();
  setActiveColor(state.color || defaultPalette[0], null, { closePanel: false });
  updatePaletteDockStatus();
}

function createPaletteSwatch(hex) {
  const normalized = normalizeHex(hex);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'swatch';
  button.style.backgroundColor = normalized;
  button.dataset.color = normalized;
  button.setAttribute('aria-label', `カラー ${normalized}`);
  setupSwatchInteractions(button);
  return button;
}

function ensurePaletteAddButton() {
  if (!paletteContainer) {
    return;
  }
  if (addPaletteButton && addPaletteButton.parentElement === paletteContainer) {
    paletteContainer.removeChild(addPaletteButton);
  }
  addPaletteButton = document.createElement('button');
  addPaletteButton.type = 'button';
  addPaletteButton.className = 'swatch swatch--add';
  addPaletteButton.setAttribute('aria-label', '色を追加');
  addPaletteButton.addEventListener('click', () => {
    addPaletteColor();
  });
  paletteContainer.appendChild(addPaletteButton);
}

function addPaletteColor() {
  const newColor = state.color || '#ffffff';
  const normalized = normalizeHex(newColor);
  const button = createPaletteSwatch(normalized);
  if (addPaletteButton && addPaletteButton.parentElement === paletteContainer) {
    paletteContainer.insertBefore(button, addPaletteButton);
  } else {
    paletteContainer.appendChild(button);
    ensurePaletteAddButton();
  }
  setActiveColor(normalized, button, { closePanel: false });
}

function getPointerPosition(event) {
  const rect = pixelCanvas.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * state.width);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * state.height);
  const inBounds = x >= 0 && x < state.width && y >= 0 && y < state.height;
  return { x, y, inBounds };
}

function applyBrush(x, y, handler) {
  const offset = Math.floor(state.brushSize / 2);
  for (let by = 0; by < state.brushSize; by += 1) {
    for (let bx = 0; bx < state.brushSize; bx += 1) {
      const px = x - offset + bx;
      const py = y - offset + by;
      if (px >= 0 && px < state.width && py >= 0 && py < state.height) {
        handler(px, py);
      }
    }
  }
}

function drawBrush(x, y, targetCtx = null) {
  const activeLayer = targetCtx ? null : getActiveLayer();
  const context = targetCtx || activeLayer?.ctx;
  if (!context) {
    return;
  }
  markHistoryDirty();
  context.fillStyle = state.color;
  applyBrush(x, y, (px, py) => {
    context.fillRect(px, py, 1, 1);
  });
}

function drawLine(x0, y0, x1, y1, usePen = true) {
  const activeLayer = getActiveLayer();
  if (!activeLayer) {
    return;
  }
  const layerCtx = activeLayer.ctx;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currentX = x0;
  let currentY = y0;

  while (true) {
    if (usePen) {
      drawBrush(currentX, currentY, layerCtx);
    } else {
      eraseBrush(currentX, currentY, layerCtx);
    }
    if (currentX === x1 && currentY === y1) {
      break;
    }
    const e2 = err * 2;
    if (e2 > -dy) {
      err -= dy;
      currentX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currentY += sy;
    }
  }
}

function eraseBrush(x, y, targetCtx = null) {
  const activeLayer = targetCtx ? null : getActiveLayer();
  const context = targetCtx || activeLayer?.ctx;
  if (!context) {
    return;
  }
  markHistoryDirty();
  applyBrush(x, y, (px, py) => {
    context.clearRect(px, py, 1, 1);
  });
}

function getPixelColor(x, y) {
  const data = ctx.getImageData(x, y, 1, 1).data;
  if (data[3] === 0) {
    return null;
  }
  return `#${[data[0], data[1], data[2]]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function hexToUint32(hex) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (255 << 24) | (b << 16) | (g << 8) | r;
}

function floodFill(x, y, hexColor) {
  const activeLayer = getActiveLayer();
  if (!activeLayer) {
    return;
  }
  const layerCtx = activeLayer.ctx;
  const imageData = layerCtx.getImageData(0, 0, state.width, state.height);
  const pixels = new Uint32Array(imageData.data.buffer);
  const targetIndex = y * state.width + x;
  const targetColor = pixels[targetIndex];
  const fillColor = hexToUint32(hexColor);
  if (targetColor === fillColor) {
    return;
  }

  const stack = [[x, y]];
  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    const index = cy * state.width + cx;
    if (pixels[index] !== targetColor) {
      continue;
    }
    pixels[index] = fillColor;

    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < state.width - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < state.height - 1) stack.push([cx, cy + 1]);
  }

  layerCtx.putImageData(imageData, 0, 0);
  markHistoryDirty();
}

function updateCursorInfo(x = null, y = null) {
  if (x === null || y === null) {
    cursorInfo.textContent = 'カーソル: -- , --';
    return;
  }
  cursorInfo.textContent = `カーソル: ${x + 1} , ${y + 1}`;
}

function updateDotCount() {
  const data = ctx.getImageData(0, 0, state.width, state.height).data;
  let count = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) {
      count += 1;
    }
  }
  layerInfo.textContent = `ドット数: ${count}`;
}

function renderPreview() {
  updatePreviewSize();
  previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  previewCtx.drawImage(pixelCanvas, 0, 0);
}

function resizeCanvas(newWidth, newHeight) {
  const clampedWidth = clamp(newWidth, Number(widthInput.min), Number(widthInput.max));
  const clampedHeight = clamp(newHeight, Number(heightInput.min), Number(heightInput.max));
  const oldWidth = state.width;
  const oldHeight = state.height;
  const copyWidth = Math.min(clampedWidth, oldWidth);
  const copyHeight = Math.min(clampedHeight, oldHeight);

  if (clampedWidth === oldWidth && clampedHeight === oldHeight) {
    return;
  }

  markHistoryDirty();

  layersState.layers.forEach((layer) => {
    const snapshot = layer.ctx.getImageData(0, 0, copyWidth, copyHeight);
    layer.canvas.width = clampedWidth;
    layer.canvas.height = clampedHeight;
    layer.ctx.imageSmoothingEnabled = false;
    layer.ctx.putImageData(snapshot, 0, 0);
  });

  pixelCanvas.width = clampedWidth;
  pixelCanvas.height = clampedHeight;
  ctx.imageSmoothingEnabled = false;

  state.width = clampedWidth;
  state.height = clampedHeight;
  widthInput.value = String(clampedWidth);
  heightInput.value = String(clampedHeight);
  updatePixelSize({ skipComposite: true });
  compositeLayers();
  refreshExportOptions();
  if (virtualCursorState.enabled) {
    updateVirtualCursorPosition(virtualCursorState.x, virtualCursorState.y);
  }
  updateCanvasDockStatus();
  flashDock('canvasDock');
  scheduleDockAutoHide();
  finalizeHistoryEntry();
}

function clearCanvas() {
  const hasContent = layersState.layers.some((layer) => layer.hasContent);
  if (!hasContent) {
    return;
  }
  markHistoryDirty();
  layersState.layers.forEach((layer) => {
    layer.ctx.clearRect(0, 0, state.width, state.height);
  });
  compositeLayers();
  finalizeHistoryEntry();
}

function exportImage(multiplier = 1) {
  const clampedMultiplier = Math.max(1, Math.min(multiplier, Math.floor(MAX_EXPORT_DIMENSION / Math.max(state.width, state.height)) || 1));
  compositeLayers({ skipUIUpdate: true, skipContentCheck: true });
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = state.width * clampedMultiplier;
  exportCanvas.height = state.height * clampedMultiplier;
  const exportCtx = exportCanvas.getContext('2d');
  if (!exportCtx) {
    return;
  }
  exportCtx.imageSmoothingEnabled = false;
  const scaleX = exportCanvas.width / state.width;
  const scaleY = exportCanvas.height / state.height;
  exportCtx.scale(scaleX, scaleY);
  exportCtx.drawImage(pixelCanvas, 0, 0);

  const link = document.createElement('a');
  link.download = `pixiedraw-${state.width * clampedMultiplier}x${state.height * clampedMultiplier}-${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

let previousPointer = { x: 0, y: 0, inBounds: false };

function handlePointerDown(event) {
  event.preventDefault();
  if (virtualCursorState.enabled && event.pointerType === 'touch') {
    if (zoomPointers.size >= 2) {
      return;
    }
    const position = getPointerPosition(event);
    if (!position.inBounds) {
      return;
    }
    virtualCursorState.pointerId = event.pointerId;
    virtualCursorState.lastClientX = event.clientX;
    virtualCursorState.lastClientY = event.clientY;
    virtualCursorState.residualDX = 0;
    virtualCursorState.residualDY = 0;
    updateCursorInfo(virtualCursorState.x, virtualCursorState.y);
    if (typeof pixelCanvas.setPointerCapture === 'function') {
      try {
        pixelCanvas.setPointerCapture(event.pointerId);
      } catch (_) {
        // noop
      }
    }
    return;
  }
  if (event.pointerType === 'touch' && zoomPointers.size >= 2) {
    return;
  }
  const { x, y, inBounds } = getPointerPosition(event);
  if (!inBounds) {
    return;
  }
  previousPointer = { x, y, inBounds: true };
  if (typeof pixelCanvas.setPointerCapture === 'function') {
    try {
      pixelCanvas.setPointerCapture(event.pointerId);
      activePointerId = event.pointerId;
    } catch (_) {
      activePointerId = null;
    }
  }

  autoCompactAllDocks();

  if (state.tool === 'pen') {
    isDrawing = true;
    drawBrush(x, y);
  } else if (state.tool === 'eraser') {
    isDrawing = true;
    eraseBrush(x, y);
  } else if (state.tool === 'eyedropper') {
    const sampled = getPixelColor(x, y);
    if (sampled) {
      setActiveColor(sampled);
    }
  } else if (state.tool === 'fill') {
    floodFill(x, y, state.color);
  }

  updateCursorInfo(x, y);
  if (state.tool !== 'eyedropper') {
    compositeLayers();
  }
}

function handlePointerMove(event) {
  if (virtualCursorState.enabled && event.pointerType === 'touch') {
    if (event.pointerId === virtualCursorState.pointerId) {
      const position = getPointerPosition(event);
      if (!position.inBounds) {
        virtualCursorState.lastClientX = event.clientX;
        virtualCursorState.lastClientY = event.clientY;
        return;
      }
      if (virtualCursorState.lastClientX === null || virtualCursorState.lastClientY === null) {
        virtualCursorState.lastClientX = event.clientX;
        virtualCursorState.lastClientY = event.clientY;
        return;
      }
      event.preventDefault();
      const deltaClientX = event.clientX - virtualCursorState.lastClientX;
      const deltaClientY = event.clientY - virtualCursorState.lastClientY;
      virtualCursorState.lastClientX = event.clientX;
      virtualCursorState.lastClientY = event.clientY;
      const scaleFactor = state.pixelSize * state.zoom;
      if (scaleFactor <= 0) {
        return;
      }
      const scaledDeltaX = (deltaClientX / scaleFactor) * VIRTUAL_CURSOR_SENSITIVITY;
      const scaledDeltaY = (deltaClientY / scaleFactor) * VIRTUAL_CURSOR_SENSITIVITY;
      const totalDeltaX = virtualCursorState.residualDX + scaledDeltaX;
      const totalDeltaY = virtualCursorState.residualDY + scaledDeltaY;
      const stepX = totalDeltaX >= 0 ? Math.floor(totalDeltaX) : Math.ceil(totalDeltaX);
      const stepY = totalDeltaY >= 0 ? Math.floor(totalDeltaY) : Math.ceil(totalDeltaY);
      virtualCursorState.residualDX = totalDeltaX - stepX;
      virtualCursorState.residualDY = totalDeltaY - stepY;
      if (stepX !== 0 || stepY !== 0) {
        updateVirtualCursorPosition(virtualCursorState.x + stepX, virtualCursorState.y + stepY);
      } else {
        updateCursorInfo(virtualCursorState.x, virtualCursorState.y);
      }
    }
    return;
  }
  if (event.pointerType === 'touch' && zoomPointers.size >= 2) {
    return;
  }
  const { x, y, inBounds } = getPointerPosition(event);
  if (inBounds) {
    updateCursorInfo(x, y);
  } else if (!isDrawing) {
    updateCursorInfo();
  }

  if (!isDrawing || !inBounds) {
    return;
  }

  if (!previousPointer.inBounds) {
    previousPointer = { x, y, inBounds: true };
    if (state.tool === 'pen') {
      drawBrush(x, y);
    } else if (state.tool === 'eraser') {
      eraseBrush(x, y);
    }
    compositeLayers();
    return;
  }

  if (state.tool === 'pen') {
    drawLine(previousPointer.x, previousPointer.y, x, y, true);
  } else if (state.tool === 'eraser') {
    drawLine(previousPointer.x, previousPointer.y, x, y, false);
  }
  previousPointer = { x, y, inBounds: true };
  compositeLayers();
}

function handlePointerUp(event) {
  if (event && event.pointerType === 'touch') {
    handleZoomPointerUp(event);
  }
  if (
    virtualCursorState.enabled &&
    event &&
    event.pointerId === virtualCursorState.pointerId &&
    typeof pixelCanvas.releasePointerCapture === 'function' &&
    typeof pixelCanvas.hasPointerCapture === 'function'
  ) {
    if (pixelCanvas.hasPointerCapture(event.pointerId)) {
      pixelCanvas.releasePointerCapture(event.pointerId);
    }
    virtualCursorState.pointerId = null;
    virtualCursorState.lastClientX = null;
    virtualCursorState.lastClientY = null;
    virtualCursorState.residualDX = 0;
    virtualCursorState.residualDY = 0;
    virtualCursorState.prevDrawX = null;
    virtualCursorState.prevDrawY = null;
    return;
  }
  if (
    activePointerId !== null &&
    typeof pixelCanvas.releasePointerCapture === 'function' &&
    typeof pixelCanvas.hasPointerCapture === 'function' &&
    pixelCanvas.hasPointerCapture(activePointerId)
  ) {
    pixelCanvas.releasePointerCapture(activePointerId);
  }
  activePointerId = null;
  isDrawing = false;
  previousPointer = { x: 0, y: 0, inBounds: false };
  finalizeHistoryEntry();
}

function initEvents() {
  pixelCanvas.addEventListener('pointerdown', handlePointerDown);
  pixelCanvas.addEventListener('pointermove', handlePointerMove);
  pixelCanvas.addEventListener('pointerup', handlePointerUp);
  pixelCanvas.addEventListener('pointerleave', () => {
    if (!isDrawing) {
      updateCursorInfo();
    }
  });
  pixelCanvas.addEventListener('pointercancel', handlePointerUp);
  window.addEventListener('pointerup', handlePointerUp);

  pixelSizeInput.addEventListener('input', () => updatePixelSize());
  pixelSizeInput.addEventListener('change', () => updatePixelSize());

  brushSizeInput.addEventListener('input', (event) => updateBrushSize((event.target).value));
  brushSizeInput.addEventListener('change', (event) => updateBrushSize((event.target).value));

  resizeCanvasButton.addEventListener('click', () => {
    const newWidth = Number(widthInput.value) || state.width;
    const newHeight = Number(heightInput.value) || state.height;
    resizeCanvas(newWidth, newHeight);
  });

  clearCanvasButton.addEventListener('click', () => {
    clearCanvas();
  });

  toolButtons.forEach((button) => {
    button.addEventListener('click', () => setActiveTool(button.dataset.tool || 'pen'));
  });

  if (exportConfirmButton) {
    exportConfirmButton.addEventListener('click', () => {
      const multiplier = Number(exportSizeSelect && exportSizeSelect.value) || 1;
      lastExportMultiplier = multiplier;
      exportImage(multiplier);
      closeActivePanel();
    });
  }

  panelToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.panelTarget;
      if (!targetId) {
        return;
      }
      if (activePanel && activePanel.id === targetId) {
        closeActivePanel();
      } else {
        openPanel(targetId);
      }
    });
  });

  panelCloseButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const parentPanel = button.closest('.floating-panel');
      if (parentPanel) {
        hidePanel(parentPanel);
        if (activePanel && activePanel === parentPanel) {
          closeActivePanel();
        }
      } else {
        closeActivePanel();
      }
    });
  });

  if (panelOverlay) {
    panelOverlay.addEventListener('click', () => {
      if (activePanel) {
        closeActivePanel();
      }
    });
  }

  if (palettePanel) {
    palettePanel.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        const target = event.target;
        if (target instanceof HTMLElement && target.classList.contains('swatch')) {
          window.setTimeout(() => closePanelIfActive('palettePanel'), 0);
        }
      }
    });
  }

  window.addEventListener('keydown', (event) => {
    const targetElement = event.target instanceof HTMLElement ? event.target : null;
    const tagName = targetElement ? targetElement.tagName : '';
    const isTextField = targetElement && (targetElement.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA');
    if (event.key === 'Escape' && activePanel) {
      closeActivePanel();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !isTextField) {
      const key = event.key.toLowerCase();
      if (key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          performRedo();
        } else {
          performUndo();
        }
      } else if (key === 'y') {
        event.preventDefault();
        performRedo();
      }
    }
  });

  if (dockToggle) {
    dockToggle.addEventListener('click', () => {
      setDockCollapsed(!dockCollapsed);
    });
  }

  if (virtualCursorToggle) {
    virtualCursorToggle.addEventListener('click', () => {
      setVirtualCursorEnabled(!virtualCursorState.enabled);
    });
  }
}

async function init() {
  pixelCanvas.style.cursor = 'crosshair';
  pixelCanvas.style.touchAction = 'none';
  initPalette();
  initVirtualCursorUI();
  let restored = false;
  try {
    restored = await restoreProjectState();
  } catch (error) {
    console.warn('レイヤー構成の復元処理でエラーが発生しました', error);
    restored = false;
  }
  if (!restored) {
    initLayers();
  }
  setActiveTool(state.tool);
  if (virtualCursorToggle) {
    virtualCursorToggle.setAttribute('aria-pressed', 'false');
  }
  if (addLayerButton) {
    addLayerButton.addEventListener('click', () => {
      addLayer();
    });
  }
  if (deleteLayerButton) {
    deleteLayerButton.addEventListener('click', () => {
      const activeLayer = getActiveLayer();
      if (activeLayer) {
        deleteLayer(activeLayer.id);
      }
    });
  }
  if (togglePreviewButton) {
    togglePreviewButton.addEventListener('click', () => {
      setPreviewVisible(!previewVisible);
    });
  }
  if (undoButton) {
    undoButton.addEventListener('click', () => {
      performUndo();
    });
  }
  if (redoButton) {
    redoButton.addEventListener('click', () => {
      performRedo();
    });
  }
  if (layerListElement) {
    layerListElement.addEventListener('dragover', handleLayerDragOver);
    layerListElement.addEventListener('drop', handleLayerDrop);
    layerListElement.addEventListener('dragleave', handleLayerDragLeave);
  }
  updateBrushSize(state.brushSize);
  updatePixelSize();
  closeActivePanel();
  const initialCollapsed = floatingDock?.dataset.collapsed === 'true';
  setDockCollapsed(initialCollapsed);
  if (!userMovedDock) {
    alignDockForViewport();
  }
  makeDockDraggable(toolDock, toolDockHandle);
  makeDockDraggable(paletteDock, paletteDockHandle);
  makeDockDraggable(canvasDock, canvasDockHandle);
  makeDockDraggable(layerDock, layerDockHandle);
  positionDefaultMiniDocks();
  window.addEventListener('resize', handleMiniDockResize);
  Object.keys(dockElements).forEach((identifier) => {
    if (!dockElements[identifier]) {
      return;
    }
    applyDockDisplayState(identifier);
    updateDockToggleState(identifier);
  });
  dockToggleButtons.forEach((button) => {
    const target = button.dataset.dockToggle;
    button.addEventListener('click', () => {
      toggleDockVisibility(target);
    });
  });
  dockStateButtons.forEach((button) => {
    const target = button.dataset.dockState;
    button.addEventListener('click', () => {
      toggleDockDisplayState(target);
    });
    updateDockStateControls(target);
  });
  ensureCanvasCentered();
  refreshExportOptions();
  initDockDrag();
  initZoomControls();
  initPreviewWindow();
  initEvents();
  updateToolDockStatus();
  updatePaletteDockStatus();
  updateCanvasDockStatus();
  setupDockAutoHide();
  setPreviewVisible(true);
  resetHistory();
  queueStateSave();
}

init();
