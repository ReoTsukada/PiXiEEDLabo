const pixelCanvas = document.getElementById('pixelCanvas');
const previewCanvas = document.getElementById('previewCanvas');
const previewWindow = document.getElementById('previewWindow');
const previewHandle = document.getElementById('previewHandle');
const canvasStage = document.getElementById('canvasStage');
let selectionOutlineCanvas = null;
let selectionOutlineCtx = null;
let selectionContentCanvas = null;
let selectionContentCtx = null;
const pixelSizeInput = document.getElementById('pixelSize');
const widthInput = document.getElementById('canvasWidth');
const heightInput = document.getElementById('canvasHeight');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeDisplay = document.getElementById('brushSizeDisplay');
const paletteContainer = document.getElementById('palette');
const palettePanel = document.getElementById('palettePanel');
const resizeCanvasButton = document.getElementById('resizeCanvas');
const clearCanvasButton = document.getElementById('clearCanvas');
const toolButtons = Array.from(document.querySelectorAll('.tool-button[data-tool]'));
const selectionToolToggle = document.querySelector('[data-toggle="selectionTools"]');
const selectionToolPanel = document.getElementById('selectionToolPanel');
const selectionToolToggleIcon = document.getElementById('selectionToolToggleIcon');
const selectionToolIds = ['selectRect', 'selectLasso', 'selectMagic'];
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
const DOCK_ORDER = ['toolDock', 'paletteDock', 'layerDock', 'canvasDock'];
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
  dragCaptureTarget: null,
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

const selectionState = {
  active: false,
  mask: null,
  bounds: null,
  mode: null,
  isDragging: false,
  pointerId: null,
  dragStart: null,
  dragCurrent: null,
  lassoPoints: [],
  captureTarget: null,
  isMoving: false,
  moveStart: null,
  moveOffsetX: 0,
  moveOffsetY: 0,
  moveCanvas: null,
  moveLayerId: null,
  moveInitialBounds: null,
};

const SELECTION_OUTLINE_THICKNESS_PX = 2;
const SELECTION_DASH_LENGTH_PX = 4;
const SELECTION_DASH_SPEED_PX = 15;
const SELECTION_COLOR_LIGHT = '#ffffff';
const SELECTION_COLOR_DARK = '#000000';
let selectionAnimationFrame = null;
let selectionAnimationLastTime = null;
let selectionDashPhasePx = 0;
let selectionToolPanelOpen = false;

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
let pinchLastFocus = null;
const panState = {
  active: false,
  pointerId: null,
  lastClientX: 0,
  lastClientY: 0,
  captureTarget: null,
};
let spaceKeyPressed = false;
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
const dockLastPositions = {
  toolDock: null,
  paletteDock: null,
  canvasDock: null,
  layerDock: null,
};
const dockMenuContainer = document.getElementById('dockMenu');
const previewDragState = {
  active: false,
  pointerId: null,
  offsetX: 0,
  offsetY: 0,
};
let previewVisible = false;

const DOCK_MENU_DRAG_THRESHOLD = 6;
const dockMenuDragState = {
  active: false,
  pointerId: null,
  identifier: null,
  sourceElement: null,
  startX: 0,
  startY: 0,
  dragging: false,
  hasGrabOffset: false,
  grabOffsetX: 0,
  grabOffsetY: 0,
  overFloatingDock: false,
};
const dockMenuPlaceholder = document.createElement('div');
dockMenuPlaceholder.className = 'mini-dock mini-dock--placeholder';
dockMenuPlaceholder.setAttribute('aria-hidden', 'true');
let dockMenuPlaceholderFor = null;
let lastMenuActivatedDock = null;
let menuAutoExpanded = false;

function setDockMenuReceiving(active) {
  const isActive = Boolean(active);
  if (dockMenuContainer) {
    dockMenuContainer.classList.toggle('dock-menu--receiving', isActive);
  }
  if (floatingDock) {
    floatingDock.classList.toggle('floating-dock--receiving', isActive);
  }
}

function updateDockMenuMargin() {
  if (!dockMenuContainer) {
    return;
  }
  const expanded = Object.entries(dockElements).some(([, element]) => element?.dataset.menuExpanded === 'true');
  dockMenuContainer.classList.toggle('dock-menu--expanded', expanded);
  dockMenuContainer.style.marginBottom = expanded ? '16px' : '';
}

function ensureDockMenuExpanded() {
  if (floatingDock && floatingDock.dataset.collapsed === 'true') {
    setDockCollapsed(false);
    menuAutoExpanded = true;
  }
}

function maybeRestoreDockMenuCollapse() {
  if (!menuAutoExpanded || !floatingDock) {
    return;
  }
  const anyExpanded = Object.entries(dockElements).some(([, element]) => element?.dataset.menuExpanded === 'true');
  if (dockMenuDragState.active || dockMenuPlaceholder.parentElement === dockMenuContainer) {
    return;
  }
  if (!anyExpanded) {
    setDockCollapsed(true);
    menuAutoExpanded = false;
  }
}

function updateDockAnchorData(dockElement) {
  if (!dockElement) {
    return;
  }
  const rect = dockElement.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return;
  }
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : rect.right;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : rect.bottom;
  const margin = 12;
  let anchorX = 'free';
  if (Math.abs(rect.left - margin) <= DOCK_SNAP_DISTANCE) {
    anchorX = 'left';
  } else if (Math.abs(viewportWidth - rect.right - margin) <= DOCK_SNAP_DISTANCE) {
    anchorX = 'right';
  }
  let anchorY = 'free';
  if (Math.abs(rect.top - margin) <= DOCK_SNAP_DISTANCE) {
    anchorY = 'top';
  } else if (Math.abs(viewportHeight - rect.bottom - margin) <= DOCK_SNAP_DISTANCE) {
    anchorY = 'bottom';
  }
  dockElement.dataset.anchorX = anchorX;
  dockElement.dataset.anchorY = anchorY;
  const identifier = getDockIdentifierFromElement(dockElement);
  if (identifier) {
    dockLastPositions[identifier] = { left: rect.left, top: rect.top };
  }
}

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
  updateSelectionCanvasSize();
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

function initSelectionOverlay() {
  if (!canvasStage) {
    return;
  }
  const displayWidth = Math.max(1, state.width * state.pixelSize);
  const displayHeight = Math.max(1, state.height * state.pixelSize);

  const ensureCanvas = (existingCanvas, className) => {
    if (existingCanvas && existingCanvas.parentElement !== canvasStage) {
      existingCanvas.remove();
      existingCanvas = null;
    }
    if (!existingCanvas) {
      const canvas = document.createElement('canvas');
      canvas.className = className;
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.pointerEvents = 'none';
      canvasStage.appendChild(canvas);
      return canvas;
    }
    return existingCanvas;
  };

  selectionContentCanvas = ensureCanvas(selectionContentCanvas, 'selection-canvas selection-canvas--content');
  selectionOutlineCanvas = ensureCanvas(selectionOutlineCanvas, 'selection-canvas selection-canvas--outline');

  const resizeCanvas = (canvas, ctxRefSetter) => {
    if (!canvas) {
      ctxRefSetter(null);
      return;
    }
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
    }
    ctxRefSetter(ctx);
  };

  resizeCanvas(selectionContentCanvas, (ctx) => {
    selectionContentCtx = ctx;
  });
  resizeCanvas(selectionOutlineCanvas, (ctx) => {
    selectionOutlineCtx = ctx;
  });

  canvasStage.appendChild(selectionContentCanvas);
  canvasStage.appendChild(selectionOutlineCanvas);

  renderSelectionOverlay();
  refreshSelectionContentPreview();
}

function updateSelectionCanvasSize() {
  initSelectionOverlay();
}

function releaseSelectionCapture() {
  if (
    selectionState.captureTarget &&
    selectionState.pointerId !== null &&
    typeof selectionState.captureTarget.releasePointerCapture === 'function'
  ) {
    try {
      selectionState.captureTarget.releasePointerCapture(selectionState.pointerId);
    } catch (_) {
      // ignore
    }
  }
  selectionState.captureTarget = null;
  selectionState.pointerId = null;
}

function clearSelection(options = {}) {
  const { silent = false } = options;
  selectionState.active = false;
  selectionState.mask = null;
  selectionState.bounds = null;
  selectionState.mode = null;
  selectionState.isDragging = false;
  selectionState.dragStart = null;
  selectionState.dragCurrent = null;
  selectionState.lassoPoints = [];
  selectionState.isMoving = false;
  selectionState.moveStart = null;
  selectionState.moveOffsetX = 0;
  selectionState.moveOffsetY = 0;
  selectionState.moveCanvas = null;
  selectionState.moveLayerId = null;
  selectionState.moveInitialBounds = null;
  releaseSelectionCapture();
  stopSelectionAnimation();
  clearSelectionContentCanvas();
  if (!silent) {
    renderSelectionOverlay();
  }
}

function setSelectionMask(mask, bounds) {
  selectionState.mask = mask;
  selectionState.bounds = bounds;
  selectionState.active = Boolean(mask && bounds);
  renderSelectionOverlay();
}

function hasActiveSelection() {
  return Boolean(
    selectionState.active &&
      selectionState.mask &&
      selectionState.bounds &&
      selectionState.bounds.minX !== undefined
  );
}

function isPixelSelected(x, y) {
  if (!hasActiveSelection()) {
    return true;
  }
  const { minX, minY, maxX, maxY } = selectionState.bounds;
  if (x < minX || x > maxX || y < minY || y > maxY) {
    return false;
  }
  const index = y * state.width + x;
  return selectionState.mask[index] === 1;
}

function drawSelectionMask() {
  if (!selectionOutlineCtx || !selectionState.mask || !selectionState.bounds) {
    return;
  }
  const { minX, minY, maxX, maxY } = selectionState.bounds;
  const mask = selectionState.mask;
  const offsetX = selectionState.isMoving ? selectionState.moveOffsetX : 0;
  const offsetY = selectionState.isMoving ? selectionState.moveOffsetY : 0;
  drawSelectionBorder(mask, minX, minY, maxX, maxY, offsetX, offsetY);
}

function drawSelectionBorder(mask, minX, minY, maxX, maxY, offsetX = 0, offsetY = 0) {
  const width = state.width;
  const height = state.height;
  const pixelSize = state.pixelSize;
  const thickness = getSelectionOutlineThickness();
  const half = thickness / 2;
  const segments = [];
  const offsetPx = offsetX * pixelSize;
  const offsetPy = offsetY * pixelSize;
  const pushSegment = (x0, y0, x1, y1) => {
    segments.push(x0 + offsetPx, y0 + offsetPy, x1 + offsetPx, y1 + offsetPy);
  };
  for (let y = minY; y <= maxY; y += 1) {
    const rowOffset = y * width;
    for (let x = minX; x <= maxX; x += 1) {
      if (!mask[rowOffset + x]) {
        continue;
      }
      const neighbors = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
      ];
      let hasEdge = false;
      for (const { dx, dy } of neighbors) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height || !mask[ny * width + nx]) {
          hasEdge = true;
          break;
        }
      }
      if (!hasEdge) {
        continue;
      }
      const leftEmpty = x === 0 || !mask[rowOffset + x - 1];
      const rightEmpty = x === width - 1 || !mask[rowOffset + x + 1];
      const upEmpty = y === 0 || !mask[(y - 1) * width + x];
      const downEmpty = y === height - 1 || !mask[(y + 1) * width + x];
      if (leftEmpty) {
        const pxX = x * pixelSize + half;
        const top = y * pixelSize + half;
        const bottom = (y + 1) * pixelSize - half;
        pushSegment(pxX, top, pxX, bottom);
      }
      if (rightEmpty) {
        const pxX = (x + 1) * pixelSize - half;
        const top = y * pixelSize + half;
        const bottom = (y + 1) * pixelSize - half;
        pushSegment(pxX, top, pxX, bottom);
      }
      if (upEmpty) {
        const pxY = y * pixelSize + half;
        const left = x * pixelSize + half;
        const right = (x + 1) * pixelSize - half;
        pushSegment(left, pxY, right, pxY);
      }
      if (downEmpty) {
        const pxY = (y + 1) * pixelSize - half;
        const left = x * pixelSize + half;
        const right = (x + 1) * pixelSize - half;
        pushSegment(left, pxY, right, pxY);
      }
    }
  }
  strokeSelectionSegments(segments);
}

function strokeSelectionSegments(segments) {
  if (!selectionOutlineCtx) {
    return;
  }
  if (!segments.length) {
    return;
  }
  strokeSelectionPath(() => {
    selectionOutlineCtx.beginPath();
    for (let index = 0; index < segments.length; index += 4) {
      selectionOutlineCtx.moveTo(segments[index], segments[index + 1]);
      selectionOutlineCtx.lineTo(segments[index + 2], segments[index + 3]);
    }
  }, 'miter', 'square');
}

function filterMaskToActiveLayer(mask, bounds) {
  const layer = getActiveLayer();
  if (!layer) {
    return null;
  }
  const { width, height } = state;
  let imageData;
  try {
    imageData = layer.ctx.getImageData(0, 0, width, height).data;
  } catch (error) {
    console.warn('レイヤー内容の抽出に失敗しました', error);
    return null;
  }
  let minX = width - 1;
  let minY = height - 1;
  let maxX = 0;
  let maxY = 0;
  let hasSelection = false;
  for (let y = bounds.minY; y <= bounds.maxY; y += 1) {
    const rowOffset = y * width;
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const index = rowOffset + x;
      if (!mask[index]) {
        continue;
      }
      const alpha = imageData[index * 4 + 3];
      if (alpha === 0) {
        mask[index] = 0;
        continue;
      }
      hasSelection = true;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (!hasSelection) {
    return null;
  }
  return {
    mask,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
    },
  };
}

function clearSelectionContentCanvas() {
  if (!selectionContentCtx || !selectionContentCanvas) {
    return;
  }
  selectionContentCtx.clearRect(0, 0, selectionContentCanvas.width, selectionContentCanvas.height);
}

function drawSelectionContentPreview(offsetX = 0, offsetY = 0) {
  if (!selectionContentCtx || !selectionState.moveCanvas || !selectionState.moveInitialBounds) {
    clearSelectionContentCanvas();
    return;
  }
  const pixelSize = state.pixelSize;
  const { minX, minY } = selectionState.moveInitialBounds;
  const destX = (minX + offsetX) * pixelSize;
  const destY = (minY + offsetY) * pixelSize;
  clearSelectionContentCanvas();
  selectionContentCtx.drawImage(
    selectionState.moveCanvas,
    destX,
    destY,
    selectionState.moveCanvas.width * pixelSize,
    selectionState.moveCanvas.height * pixelSize,
  );
}

function refreshSelectionContentPreview() {
  if (selectionState.isMoving) {
    drawSelectionContentPreview(selectionState.moveOffsetX, selectionState.moveOffsetY);
  } else {
    clearSelectionContentCanvas();
  }
}

function clampSelectionOffset(offsetX, offsetY) {
  const bounds = selectionState.moveInitialBounds || selectionState.bounds;
  if (!bounds) {
    return { x: 0, y: 0 };
  }
  const minOffsetX = -bounds.minX;
  const maxOffsetX = state.width - 1 - bounds.maxX;
  const minOffsetY = -bounds.minY;
  const maxOffsetY = state.height - 1 - bounds.maxY;
  return {
    x: clamp(offsetX, minOffsetX, maxOffsetX),
    y: clamp(offsetY, minOffsetY, maxOffsetY),
  };
}

function beginSelectionMove(x, y, pointerId, target) {
  if (!hasActiveSelection() || selectionState.isMoving) {
    return false;
  }
  const layer = getActiveLayer();
  if (!layer) {
    return false;
  }
  const { minX, minY, maxX, maxY } = selectionState.bounds || {};
  if (
    typeof minX !== 'number' ||
    typeof minY !== 'number' ||
    typeof maxX !== 'number' ||
    typeof maxY !== 'number'
  ) {
    return false;
  }
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  let imageData;
  try {
    imageData = layer.ctx.getImageData(minX, minY, width, height);
  } catch (error) {
    console.warn('選択範囲の画像取得に失敗しました', error);
    return false;
  }
  const mask = selectionState.mask;
  if (!mask) {
    return false;
  }
  const canvasWidth = state.width;
  const data = imageData.data;
  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const globalIndex = (minY + row) * canvasWidth + (minX + col);
      if (mask[globalIndex]) {
        continue;
      }
      const pixelIndex = (row * width + col) * 4;
      data[pixelIndex] = 0;
      data[pixelIndex + 1] = 0;
      data[pixelIndex + 2] = 0;
      data[pixelIndex + 3] = 0;
    }
  }

  const { canvas: moveCanvas, ctx: moveCtx } = createOffscreenCanvas(width, height);
  moveCtx.putImageData(imageData, 0, 0);

  autoCompactAllDocks();

  for (let row = minY; row <= maxY; row += 1) {
    const rowOffset = row * canvasWidth;
    for (let col = minX; col <= maxX; col += 1) {
      if (mask[rowOffset + col]) {
        layer.ctx.clearRect(col, row, 1, 1);
      }
    }
  }

  markHistoryDirty();
  compositeLayers();

  selectionState.isMoving = true;
  selectionState.moveStart = { x, y };
  selectionState.moveOffsetX = 0;
  selectionState.moveOffsetY = 0;
  selectionState.moveCanvas = moveCanvas;
  selectionState.moveLayerId = layer.id;
  selectionState.moveInitialBounds = { minX, minY, maxX, maxY };
  selectionState.pointerId = pointerId;
  selectionState.captureTarget = target;

  if (target && typeof target.setPointerCapture === 'function') {
    try {
      target.setPointerCapture(pointerId);
    } catch (_) {
      selectionState.captureTarget = null;
    }
  }

  refreshSelectionContentPreview();
  renderSelectionOverlay();
  return true;
}

function updateSelectionMove(x, y) {
  if (!selectionState.isMoving || !selectionState.moveStart) {
    return;
  }
  const rawOffsetX = x - selectionState.moveStart.x;
  const rawOffsetY = y - selectionState.moveStart.y;
  const { x: offsetX, y: offsetY } = clampSelectionOffset(rawOffsetX, rawOffsetY);
  if (offsetX === selectionState.moveOffsetX && offsetY === selectionState.moveOffsetY) {
    return;
  }
  selectionState.moveOffsetX = offsetX;
  selectionState.moveOffsetY = offsetY;
  refreshSelectionContentPreview();
  renderSelectionOverlay();
}

function finalizeSelectionMove() {
  if (!selectionState.isMoving) {
    return;
  }
  const layerId = selectionState.moveLayerId;
  let targetLayer = null;
  if (layerId) {
    const index = getLayerIndex(layerId);
    if (index !== -1) {
      targetLayer = layersState.layers[index];
    }
  }
  if (!targetLayer) {
    targetLayer = getActiveLayer();
  }
  if (!targetLayer) {
    selectionState.isMoving = false;
    selectionState.moveCanvas = null;
    refreshSelectionContentPreview();
    releaseSelectionCapture();
    return;
  }

  const offsetX = selectionState.moveOffsetX;
  const offsetY = selectionState.moveOffsetY;
  const bounds = selectionState.moveInitialBounds || selectionState.bounds;
  if (bounds && selectionState.moveCanvas) {
    const destX = bounds.minX + offsetX;
    const destY = bounds.minY + offsetY;
    targetLayer.ctx.drawImage(selectionState.moveCanvas, destX, destY);
  }

  selectionState.isMoving = false;
  selectionState.moveStart = null;
  selectionState.moveCanvas = null;
  selectionState.moveLayerId = null;

  if (bounds && (offsetX !== 0 || offsetY !== 0)) {
    const width = state.width;
    const height = state.height;
    const newMask = new Uint8Array(width * height);
    const mask = selectionState.mask;
    for (let row = bounds.minY; row <= bounds.maxY; row += 1) {
      for (let col = bounds.minX; col <= bounds.maxX; col += 1) {
        const sourceIndex = row * width + col;
        if (!mask || !mask[sourceIndex]) {
          continue;
        }
        const newX = col + offsetX;
        const newY = row + offsetY;
        if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
          continue;
        }
        newMask[newY * width + newX] = 1;
      }
    }
    selectionState.mask = newMask;
    selectionState.bounds = {
      minX: bounds.minX + offsetX,
      minY: bounds.minY + offsetY,
      maxX: bounds.maxX + offsetX,
      maxY: bounds.maxY + offsetY,
    };
  }

  selectionState.moveOffsetX = 0;
  selectionState.moveOffsetY = 0;
  selectionState.moveInitialBounds = null;

  refreshSelectionContentPreview();
  releaseSelectionCapture();
  compositeLayers();
  renderSelectionOverlay();
  finalizeHistoryEntry();
}

function strokeSelectionPath(drawPath, lineJoin = 'miter', lineCap = 'square') {
  if (!selectionOutlineCtx) {
    return;
  }
  const thickness = getSelectionOutlineThickness();
  const dashLength = getSelectionDashLength();
  const dashPattern = [dashLength, dashLength];
  const dashPhase = selectionDashPhasePx % (dashPattern[0] + dashPattern[1]);

  selectionOutlineCtx.save();
  selectionOutlineCtx.lineWidth = thickness;
  selectionOutlineCtx.lineCap = lineCap;
  selectionOutlineCtx.lineJoin = lineJoin;
  selectionOutlineCtx.setLineDash(dashPattern);

  selectionOutlineCtx.lineDashOffset = -dashPhase;
  selectionOutlineCtx.strokeStyle = SELECTION_COLOR_LIGHT;
  drawPath();
  selectionOutlineCtx.stroke();

  selectionOutlineCtx.lineDashOffset = -(dashPhase + dashLength);
  selectionOutlineCtx.strokeStyle = SELECTION_COLOR_DARK;
  drawPath();
  selectionOutlineCtx.stroke();

  selectionOutlineCtx.setLineDash([]);
  selectionOutlineCtx.lineDashOffset = 0;
  selectionOutlineCtx.restore();
}

function getSelectionOutlineThickness() {
  return SELECTION_OUTLINE_THICKNESS_PX;
}

function getSelectionDashLength() {
  return SELECTION_DASH_LENGTH_PX;
}

function drawRectSelectionPreview() {
  if (!selectionOutlineCtx || !selectionState.dragStart || !selectionState.dragCurrent) {
    return;
  }
  const start = selectionState.dragStart;
  const current = selectionState.dragCurrent;
  const minX = Math.min(start.x, current.x);
  const maxX = Math.max(start.x, current.x);
  const minY = Math.min(start.y, current.y);
  const maxY = Math.max(start.y, current.y);
  const pixelSize = state.pixelSize;
  const thickness = getSelectionOutlineThickness();
  const half = thickness / 2;
  const left = minX * pixelSize + half;
  const right = (maxX + 1) * pixelSize - half;
  const top = minY * pixelSize + half;
  const bottom = (maxY + 1) * pixelSize - half;
  const segments = [
    left, top, right, top,
    left, bottom, right, bottom,
    left, top, left, bottom,
    right, top, right, bottom,
  ];
  strokeSelectionSegments(segments);
}

function drawLassoSelectionPreview() {
  if (!selectionOutlineCtx || selectionState.lassoPoints.length < 2) {
    return;
  }
  const points = selectionState.lassoPoints;
  const px = state.pixelSize;
  const drawOutlinePath = () => {
    selectionOutlineCtx.beginPath();
    selectionOutlineCtx.moveTo(points[0].x * px, points[0].y * px);
    for (let i = 1; i < points.length; i += 1) {
      selectionOutlineCtx.lineTo(points[i].x * px, points[i].y * px);
    }
    const lastPoint = points[points.length - 1];
    if (lastPoint.x !== points[0].x || lastPoint.y !== points[0].y) {
      selectionOutlineCtx.lineTo(points[0].x * px, points[0].y * px);
    }
  };

  strokeSelectionPath(drawOutlinePath, 'round', 'round');
}

function renderSelectionOverlay() {
  if (!selectionOutlineCtx) {
    initSelectionOverlay();
  }
  if (!selectionOutlineCtx) {
    return;
  }
  const displayWidth = state.width * state.pixelSize;
  const displayHeight = state.height * state.pixelSize;
  selectionOutlineCtx.clearRect(0, 0, displayWidth, displayHeight);
  if (selectionState.active) {
    drawSelectionMask();
  }
  if (selectionState.isDragging) {
    if (selectionState.mode === 'selectRect') {
      drawRectSelectionPreview();
    } else if (selectionState.mode === 'selectLasso') {
      drawLassoSelectionPreview();
    }
  }
  const needsAnimation = selectionState.active || selectionState.isDragging;
  if (needsAnimation) {
    ensureSelectionAnimation();
  } else {
    stopSelectionAnimation();
  }
}

function ensureSelectionAnimation() {
  if (typeof window === 'undefined') {
    return;
  }
  if (selectionAnimationFrame !== null) {
    return;
  }
  selectionAnimationLastTime = null;
  selectionAnimationFrame = window.requestAnimationFrame(animateSelectionBorder);
}

function stopSelectionAnimation() {
  if (typeof window !== 'undefined' && selectionAnimationFrame !== null) {
    window.cancelAnimationFrame(selectionAnimationFrame);
  }
  selectionAnimationFrame = null;
  selectionAnimationLastTime = null;
  selectionDashPhasePx = 0;
}

function animateSelectionBorder(timestamp) {
  if (!selectionState.active && !selectionState.isDragging) {
    selectionAnimationFrame = null;
    selectionAnimationLastTime = null;
    renderSelectionOverlay();
    return;
  }
  if (selectionAnimationLastTime !== null) {
    const deltaMs = Math.max(0, timestamp - selectionAnimationLastTime);
    const delta = (deltaMs / 1000) * SELECTION_DASH_SPEED_PX;
    selectionDashPhasePx = (selectionDashPhasePx + delta) % (SELECTION_DASH_LENGTH_PX * 2);
  }
  selectionAnimationLastTime = timestamp;
  renderSelectionOverlay();
  if (typeof window !== 'undefined') {
    selectionAnimationFrame = window.requestAnimationFrame(animateSelectionBorder);
  }
}

function clampToCanvas(value, max) {
  return clamp(value, 0, max);
}

function beginRectSelection(x, y, pointerId, target) {
  clearSelection({ silent: true });
  autoCompactAllDocks();
  selectionState.mode = 'selectRect';
  selectionState.isDragging = true;
  selectionState.dragStart = {
    x: clampToCanvas(x, state.width - 1),
    y: clampToCanvas(y, state.height - 1),
  };
  selectionState.dragCurrent = { ...selectionState.dragStart };
  selectionState.pointerId = pointerId;
  selectionState.captureTarget = target;
  if (target && typeof target.setPointerCapture === 'function') {
    try {
      target.setPointerCapture(pointerId);
    } catch (_) {
      selectionState.captureTarget = null;
    }
  }
  updateCursorInfo(selectionState.dragStart.x, selectionState.dragStart.y);
  renderSelectionOverlay();
}

function updateRectSelection(x, y) {
  if (!selectionState.isDragging || selectionState.mode !== 'selectRect') {
    return;
  }
  selectionState.dragCurrent = {
    x: clampToCanvas(x, state.width - 1),
    y: clampToCanvas(y, state.height - 1),
  };
  renderSelectionOverlay();
}

function finalizeRectSelection() {
  if (!selectionState.isDragging || selectionState.mode !== 'selectRect' || !selectionState.dragStart || !selectionState.dragCurrent) {
    clearSelection();
    return;
  }
  const start = selectionState.dragStart;
  const current = selectionState.dragCurrent;
  const minX = Math.min(start.x, current.x);
  const maxX = Math.max(start.x, current.x);
  const minY = Math.min(start.y, current.y);
  const maxY = Math.max(start.y, current.y);
  const width = state.width;
  const mask = new Uint8Array(width * state.height);
  for (let y = minY; y <= maxY; y += 1) {
    const rowOffset = y * width;
    for (let x = minX; x <= maxX; x += 1) {
      mask[rowOffset + x] = 1;
    }
  }
  selectionState.isDragging = false;
  selectionState.dragStart = null;
  selectionState.dragCurrent = null;
  selectionState.lassoPoints = [];
  releaseSelectionCapture();
  setSelectionMask(mask, { minX, minY, maxX, maxY });
  selectionState.mode = 'selectRect';
}

function beginLassoSelection(canvasX, canvasY, pointerId, target) {
  clearSelection({ silent: true });
  autoCompactAllDocks();
  selectionState.mode = 'selectLasso';
  selectionState.isDragging = true;
  const clampedX = clamp(canvasX, 0, state.width);
  const clampedY = clamp(canvasY, 0, state.height);
  selectionState.lassoPoints = [{ x: clampedX, y: clampedY }];
  selectionState.pointerId = pointerId;
  selectionState.captureTarget = target;
  if (target && typeof target.setPointerCapture === 'function') {
    try {
      target.setPointerCapture(pointerId);
    } catch (_) {
      selectionState.captureTarget = null;
    }
  }
  updateCursorInfo(Math.floor(clampedX), Math.floor(clampedY));
  renderSelectionOverlay();
}

function updateLassoSelection(canvasX, canvasY) {
  if (!selectionState.isDragging || selectionState.mode !== 'selectLasso') {
    return;
  }
  const clampedX = clamp(canvasX, 0, state.width);
  const clampedY = clamp(canvasY, 0, state.height);
  const points = selectionState.lassoPoints;
  const lastPoint = points[points.length - 1];
  const dx = clampedX - lastPoint.x;
  const dy = clampedY - lastPoint.y;
  if (Math.hypot(dx, dy) >= 0.25) {
    points.push({ x: clampedX, y: clampedY });
    renderSelectionOverlay();
  }
}

function pointInPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi || 1e-6) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

function finalizeLassoSelection() {
  if (!selectionState.isDragging || selectionState.mode !== 'selectLasso' || selectionState.lassoPoints.length < 3) {
    clearSelection();
    return;
  }
  const polygon = [...selectionState.lassoPoints];
  const firstPoint = polygon[0];
  const lastPoint = polygon[polygon.length - 1];
  if (Math.hypot(firstPoint.x - lastPoint.x, firstPoint.y - lastPoint.y) > 0.1) {
    polygon.push({ ...firstPoint });
  }
  const width = state.width;
  const height = state.height;
  const mask = new Uint8Array(width * height);
  let minX = width - 1;
  let minY = height - 1;
  let maxX = 0;
  let maxY = 0;
  let hasSelection = false;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const centerX = x + 0.5;
      const centerY = y + 0.5;
      if (pointInPolygon(centerX, centerY, polygon)) {
        const idx = y * width + x;
        mask[idx] = 1;
        hasSelection = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  selectionState.isDragging = false;
  releaseSelectionCapture();
  if (!hasSelection) {
    clearSelection();
    return;
  }
  const filtered = filterMaskToActiveLayer(mask, { minX, minY, maxX, maxY });
  if (!filtered) {
    clearSelection();
    return;
  }
  selectionState.lassoPoints = polygon;
  setSelectionMask(filtered.mask, filtered.bounds);
  selectionState.mode = 'selectLasso';
}

function finalizeSelectionDrag() {
  if (!selectionState.isDragging) {
    return false;
  }
  if (selectionState.mode === 'selectRect') {
    finalizeRectSelection();
  } else if (selectionState.mode === 'selectLasso') {
    finalizeLassoSelection();
  } else {
    selectionState.isDragging = false;
    releaseSelectionCapture();
  }
  return true;
}

function performMagicSelection(x, y) {
  const width = state.width;
  const height = state.height;
  if (x < 0 || x >= width || y < 0 || y >= height) {
    clearSelection();
    return;
  }
  const layer = getActiveLayer();
  if (!layer) {
    clearSelection();
    return;
  }
  let data;
  try {
    data = layer.ctx.getImageData(0, 0, width, height).data;
  } catch (error) {
    console.warn('レイヤー内容の取得に失敗しました', error);
    clearSelection();
    return;
  }
  clearSelection({ silent: true });
  autoCompactAllDocks();
  const pixels = new Uint32Array(data.buffer);
  const targetIndex = y * width + x;
  if (data[targetIndex * 4 + 3] === 0) {
    clearSelection();
    return;
  }
  const targetColor = pixels[targetIndex];
  const mask = new Uint8Array(width * height);
  const stack = [[x, y]];
  let minX = width - 1;
  let minY = height - 1;
  let maxX = 0;
  let maxY = 0;
  let hasSelection = false;
  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
      continue;
    }
    const index = cy * width + cx;
    if (mask[index] || pixels[index] !== targetColor || data[index * 4 + 3] === 0) {
      continue;
    }
    mask[index] = 1;
    hasSelection = true;
    if (cx < minX) minX = cx;
    if (cy < minY) minY = cy;
    if (cx > maxX) maxX = cx;
    if (cy > maxY) maxY = cy;
    stack.push([cx + 1, cy]);
    stack.push([cx - 1, cy]);
    stack.push([cx, cy + 1]);
    stack.push([cx, cy - 1]);
  }
  if (!hasSelection) {
    clearSelection();
    return;
  }
  selectionState.mode = 'selectMagic';
  selectionState.isDragging = false;
  selectionState.lassoPoints = [];
  selectionState.dragStart = null;
  selectionState.dragCurrent = null;
  const filtered = filterMaskToActiveLayer(mask, { minX, minY, maxX, maxY });
  if (!filtered) {
    clearSelection();
    return;
  }
  setSelectionMask(filtered.mask, filtered.bounds);
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

function endVirtualDrag(event) {
  if (!virtualDrawControl || !virtualCursorState.dragging) {
    return;
  }
  if (event && virtualCursorState.dragPointerId !== null && event.pointerId !== virtualCursorState.dragPointerId) {
    return;
  }
  const captureTarget = virtualCursorState.dragCaptureTarget;
  if (virtualCursorState.dragPointerId !== null && captureTarget && typeof captureTarget.releasePointerCapture === 'function') {
    try {
      captureTarget.releasePointerCapture(virtualCursorState.dragPointerId);
    } catch (_) {
      // noop
    }
  }
  virtualCursorState.dragging = false;
  virtualCursorState.dragPointerId = null;
  virtualCursorState.dragCaptureTarget = null;
  virtualDrawHandle?.classList.remove('virtual-draw-control__handle--dragging');
  virtualDrawControl.classList.remove('virtual-draw-control--dragging');
  virtualDrawControl.style.zIndex = '';
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
  virtualDrawHandle.innerHTML = '<span class="mini-dock__drag-line" aria-hidden="true"></span>';

  virtualDrawActionButton = document.createElement('button');
  virtualDrawActionButton.type = 'button';
  virtualDrawActionButton.className = 'virtual-draw-control__action';
  virtualDrawActionButton.textContent = '描画';

  virtualDrawControl.appendChild(virtualDrawHandle);
  virtualDrawControl.appendChild(virtualDrawActionButton);

  const host = document.querySelector('.app-stage') || document.body;
  host.appendChild(virtualDrawControl);

  const handleVirtualControlPointerMove = (event) => {
    if (!virtualCursorState.dragging || event.pointerId !== virtualCursorState.dragPointerId) {
      return;
    }
    event.preventDefault();
    setVirtualControlPosition(event.clientX - virtualCursorState.dragOffsetX, event.clientY - virtualCursorState.dragOffsetY);
  };

  const beginVirtualControlDrag = (event, captureTarget = virtualDrawHandle) => {
    if (virtualCursorState.dragging) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.preventDefault();
    const rect = virtualDrawControl.getBoundingClientRect();
    virtualCursorState.dragging = true;
    virtualCursorState.dragPointerId = event.pointerId;
    virtualCursorState.dragOffsetX = event.clientX - rect.left;
    virtualCursorState.dragOffsetY = event.clientY - rect.top;
    virtualCursorState.dragCaptureTarget = captureTarget || virtualDrawHandle;
    virtualDrawHandle.classList.add('virtual-draw-control__handle--dragging');
    virtualDrawControl.classList.add('virtual-draw-control--dragging');
    virtualDrawControl.style.zIndex = '260';
    try {
      if (virtualCursorState.dragCaptureTarget && typeof virtualCursorState.dragCaptureTarget.setPointerCapture === 'function') {
        virtualCursorState.dragCaptureTarget.setPointerCapture(event.pointerId);
      }
    } catch (_) {
      // noop
    }
  };

  const handleVirtualPointerDown = (event) => {
    if (virtualDrawActionButton && virtualDrawActionButton.contains(event.target)) {
      return;
    }
    beginVirtualControlDrag(event, event.currentTarget);
  };

  virtualDrawHandle.addEventListener('pointerdown', handleVirtualPointerDown);
  virtualDrawHandle.addEventListener('pointermove', handleVirtualControlPointerMove);
  virtualDrawHandle.addEventListener('pointerup', endVirtualDrag);
  virtualDrawHandle.addEventListener('pointercancel', endVirtualDrag);

  virtualDrawControl.addEventListener('pointermove', handleVirtualControlPointerMove);
  virtualDrawControl.addEventListener('pointerup', endVirtualDrag);
  virtualDrawControl.addEventListener('pointercancel', endVirtualDrag);

  virtualDrawControl.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (event.pointerType === 'mouse') {
      return;
    }
    if (virtualDrawActionButton && virtualDrawActionButton.contains(event.target)) {
      return;
    }
    if (virtualDrawHandle.contains(event.target)) {
      return;
    }
    beginVirtualControlDrag(event, virtualDrawControl);
  });

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

function updatePanCursorState() {
  if (!canvasStage) {
    return;
  }
  const panReady = state.tool === 'pan' || spaceKeyPressed;
  if (panState.active || pinchActive) {
    canvasStage.classList.add('canvas-stage--panning');
    canvasStage.classList.remove('canvas-stage--pan-ready');
    if (pixelCanvas) {
      pixelCanvas.style.cursor = 'grabbing';
    }
  } else {
    canvasStage.classList.remove('canvas-stage--panning');
    if (panReady) {
      canvasStage.classList.add('canvas-stage--pan-ready');
      if (pixelCanvas) {
        pixelCanvas.style.cursor = 'grab';
      }
    } else {
      canvasStage.classList.remove('canvas-stage--pan-ready');
      if (pixelCanvas) {
        pixelCanvas.style.cursor = 'crosshair';
      }
    }
  }
}

function panCanvasBy(deltaX, deltaY) {
  if (!canvasStage) {
    return;
  }
  if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) {
    return;
  }
  if (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01) {
    return;
  }
  state.offsetX += deltaX;
  state.offsetY += deltaY;
  clampOffsets();
  applyCanvasZoom();
}

function shouldStartCanvasPan(event) {
  if (!canvasStage) {
    return false;
  }
  if (pinchActive || zoomPointers.size >= 2) {
    return false;
  }
  if (state.tool === 'pan') {
    if (event.pointerType === 'mouse') {
      return event.button === 0;
    }
    if (event.pointerType === 'touch') {
      return true;
    }
    if (event.pointerType === 'pen') {
      return true;
    }
  }
  if (event.pointerType === 'mouse') {
    if (event.button === 1) {
      return true;
    }
    if (event.button === 0 && spaceKeyPressed) {
      return true;
    }
  }
  if (event.pointerType === 'pen' && spaceKeyPressed) {
    return true;
  }
  return false;
}

function beginCanvasPan(event) {
  if (panState.active) {
    return;
  }
  cancelActiveDrawing();
  autoCompactAllDocks();
  panState.active = true;
  panState.pointerId = event.pointerId;
  panState.lastClientX = event.clientX;
  panState.lastClientY = event.clientY;
  panState.captureTarget =
    event.currentTarget && typeof event.currentTarget.setPointerCapture === 'function'
      ? event.currentTarget
      : null;
  if (panState.captureTarget) {
    try {
      panState.captureTarget.setPointerCapture(event.pointerId);
    } catch (_) {
      panState.captureTarget = null;
    }
  }
  activePointerId = null;
  updatePanCursorState();
}

function updateCanvasPan(event) {
  if (!panState.active || event.pointerId !== panState.pointerId) {
    return;
  }
  event.preventDefault();
  const deltaX = event.clientX - panState.lastClientX;
  const deltaY = event.clientY - panState.lastClientY;
  panState.lastClientX = event.clientX;
  panState.lastClientY = event.clientY;
  panCanvasBy(deltaX, deltaY);
}

function endCanvasPan(event = null, { force = false } = {}) {
  if (!panState.active) {
    return false;
  }
  if (!force && event && event.pointerId !== panState.pointerId) {
    return false;
  }
  if (panState.captureTarget && panState.pointerId !== null) {
    try {
      panState.captureTarget.releasePointerCapture(panState.pointerId);
    } catch (_) {
      // noop
    }
  }
  panState.active = false;
  panState.pointerId = null;
  panState.captureTarget = null;
  updatePanCursorState();
  return true;
}

function isTypingTarget(element) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  if (element.isContentEditable) {
    return true;
  }
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }
  if (element instanceof HTMLInputElement) {
    const type = element.type;
    const blocked = ['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'reset', 'submit'];
    return !blocked.includes(type);
  }
  return false;
}

function handleCanvasPanKeyDown(event) {
  const isSpace = event.code === 'Space' || event.key === ' ';
  if (!isSpace) {
    return;
  }
  if (isTypingTarget(event.target)) {
    return;
  }
  if (!spaceKeyPressed) {
    spaceKeyPressed = true;
    updatePanCursorState();
  }
  const activeElement = document.activeElement;
  if (
    activeElement &&
    activeElement !== document.body &&
    activeElement !== document.documentElement &&
    !isTypingTarget(activeElement)
  ) {
    if (typeof activeElement.blur === 'function') {
      activeElement.blur();
    }
  }
  event.preventDefault();
  event.stopPropagation();
}

function handleCanvasPanKeyUp(event) {
  const isSpace = event.code === 'Space' || event.key === ' ';
  if (!isSpace) {
    return;
  }
  spaceKeyPressed = false;
  updatePanCursorState();
}

function resetCanvasPanKeyState() {
  spaceKeyPressed = false;
  endCanvasPan(null, { force: true });
  updatePanCursorState();
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
    if (panState.active) {
      endCanvasPan(null, { force: true });
    }
    pinchActive = true;
    cancelActiveDrawing();
    pinchStartDistance = getZoomPointerDistance();
    pinchStartZoom = state.zoom;
    pinchLastFocus = getZoomPointerFocus();
    updatePanCursorState();
    applyCanvasZoom();
  } else if (zoomPointers.size > 0 && !pinchActive) {
    pinchLastFocus = getZoomPointerFocus();
  }
}

function handleZoomPointerMove(event) {
  if (event.pointerType !== 'touch' || virtualCursorState.enabled || !zoomPointers.has(event.pointerId)) {
    return;
  }
  zoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  const focusWorld = getZoomPointerFocus();
  if (zoomPointers.size >= 2) {
    event.preventDefault();
    if (focusWorld) {
      if (pinchLastFocus) {
        panCanvasBy(focusWorld.x - pinchLastFocus.x, focusWorld.y - pinchLastFocus.y);
      }
      pinchLastFocus = focusWorld;
    }
    const newDistance = getZoomPointerDistance();
    if (!pinchStartDistance && newDistance > 0) {
      pinchStartDistance = newDistance;
      pinchStartZoom = state.zoom;
    }
    if (newDistance > 0 && pinchStartDistance > 0) {
      const ratio = newDistance / pinchStartDistance;
      setZoom(pinchStartZoom * ratio, { fromUser: true, focus: focusWorld });
    }
  } else if (zoomPointers.size === 1) {
    pinchLastFocus = focusWorld;
  }
}

function handleZoomPointerUp(event) {
  if (virtualCursorState.enabled) {
    zoomPointers.clear();
    pinchStartDistance = null;
    pinchActive = false;
    pinchLastFocus = null;
    clampOffsets();
    applyCanvasZoom();
    updatePanCursorState();
    return;
  }
  if (zoomPointers.has(event.pointerId)) {
    zoomPointers.delete(event.pointerId);
  }
  if (zoomPointers.size >= 2) {
    pinchStartDistance = getZoomPointerDistance();
    pinchStartZoom = state.zoom;
    pinchLastFocus = getZoomPointerFocus();
    pinchActive = true;
    updatePanCursorState();
  } else {
    pinchStartDistance = null;
    pinchLastFocus = zoomPointers.size === 1 ? getZoomPointerFocus() : null;
    if (pinchActive) {
      pinchActive = false;
      clampOffsets();
      applyCanvasZoom();
      updatePanCursorState();
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

function isSelectionTool(tool) {
  return selectionToolIds.includes(tool);
}

function getSelectionToolButton(tool) {
  return toolButtons.find((button) => button.dataset.tool === tool);
}

function getSelectionToggleMeta(tool) {
  const defaultLabel = selectionToolToggle?.dataset.defaultLabel || '範囲選択ツール';
  const defaultIcon = selectionToolToggle?.dataset.defaultIcon || selectionToolToggleIcon?.src || '';
  if (!isSelectionTool(tool)) {
    return { icon: defaultIcon, label: defaultLabel };
  }
  const button = getSelectionToolButton(tool);
  if (!button) {
    return { icon: defaultIcon, label: defaultLabel };
  }
  const icon = button.dataset.icon || button.querySelector('img')?.src || defaultIcon;
  const label =
    button.getAttribute('aria-label') || button.querySelector('img')?.getAttribute('alt') || defaultLabel;
  return { icon, label };
}

function updateSelectionToolToggleState() {
  if (!selectionToolToggle) {
    return;
  }
  const selectionActive = isSelectionTool(state.tool);
  const displayTool = selectionActive
    ? state.tool
    : selectionToolToggle?.dataset.defaultTool || selectionToolIds[0];
  const meta = getSelectionToggleMeta(displayTool);
  if (selectionToolToggleIcon && meta.icon) {
    selectionToolToggleIcon.src = meta.icon;
  }
  if (selectionToolToggleIcon && meta.label) {
    selectionToolToggleIcon.alt = meta.label;
  }
  const toggleLabel = meta.label || selectionToolToggle?.dataset.defaultLabel || '範囲選択ツール';
  selectionToolToggle.setAttribute('aria-label', toggleLabel);
  selectionToolToggle.setAttribute('aria-pressed', selectionActive ? 'true' : 'false');
  selectionToolToggle.setAttribute('aria-expanded', selectionToolPanelOpen ? 'true' : 'false');
  selectionToolToggle.classList.toggle('tool-button--active', selectionActive || selectionToolPanelOpen);
}

function openSelectionToolPanel() {
  if (!selectionToolPanel || selectionToolPanelOpen) {
    return;
  }
  selectionToolPanel.hidden = false;
  selectionToolPanel.setAttribute('aria-hidden', 'false');
  selectionToolPanelOpen = true;
  updateSelectionToolToggleState();
}

function closeSelectionToolPanel() {
  if (!selectionToolPanelOpen) {
    return;
  }
  if (selectionToolPanel) {
    selectionToolPanel.hidden = true;
    selectionToolPanel.setAttribute('aria-hidden', 'true');
  }
  selectionToolPanelOpen = false;
  updateSelectionToolToggleState();
}

function toggleSelectionToolPanel() {
  if (selectionToolPanelOpen) {
    closeSelectionToolPanel();
  } else {
    openSelectionToolPanel();
  }
}

function handleSelectionToolDocumentClick(event) {
  if (!selectionToolPanelOpen) {
    return;
  }
  const target = event.target;
  if (!(target instanceof Node)) {
    closeSelectionToolPanel();
    return;
  }
  if (
    (selectionToolPanel && selectionToolPanel.contains(target)) ||
    (selectionToolToggle && selectionToolToggle.contains(target))
  ) {
    return;
  }
  closeSelectionToolPanel();
}

function setActiveTool(tool) {
  if (tool !== 'pan') {
    endCanvasPan(null, { force: true });
  }
  state.tool = tool;
  toolButtons.forEach((button) => {
    const isActive = button.dataset.tool === tool;
    button.classList.toggle('tool-button--active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
  if (!isSelectionTool(tool)) {
    closeSelectionToolPanel();
  }
  updateSelectionToolToggleState();
  updateToolDockStatus();
  updatePanCursorState();
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
    identifier: null,
    overFloatingDock: false,
    captureTarget: null,
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
    const overMenu = updateDockMenuPlaceholderPosition(dragState.identifier, event.clientX, event.clientY);
    dragState.overFloatingDock = overMenu;
    setFloatingDockReceiving(overMenu);
  };

  const startDrag = (event, captureTarget = handleElement) => {
    if (dragState.active) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.preventDefault();
    ensureWithinBounds();
    const rect = dockElement.getBoundingClientRect();
    dragState.active = true;
    dragState.pointerId = event.pointerId;
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;
    dragState.captureTarget = captureTarget || handleElement;
    handleElement.classList.add('mini-dock__drag--dragging');
    dockElement.classList.add('mini-dock--dragging');
    const identifier = getDockIdentifierFromElement(dockElement);
    dragState.identifier = identifier;
    if (identifier) {
      clearDockFade(identifier);
      if (Object.prototype.hasOwnProperty.call(miniDockUserMoved, identifier)) {
        miniDockUserMoved[identifier] = true;
      }
      delete dockElement.dataset.menuExpanded;
      updateDockMenuMargin();
      updateDockStateControls(identifier);
    }
    dockElement.style.zIndex = '260';
    hideDockMenuPlaceholder();
    clearDockAutoHideTimer();
    const target = dragState.captureTarget;
    if (target && typeof target.setPointerCapture === 'function') {
      try {
        target.setPointerCapture(event.pointerId);
      } catch (_) {
        // noop
      }
    }
    window.addEventListener('pointermove', handleDockPointerMove, { passive: false });
    window.addEventListener('pointerup', endDrag, { once: false });
    window.addEventListener('pointercancel', endDrag, { once: false });
  };

  const endDrag = (event) => {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }
    dragState.active = false;
    dragState.pointerId = null;
    handleElement.classList.remove('mini-dock__drag--dragging');
    dockElement.classList.remove('mini-dock--dragging');
    try {
      const target = dragState.captureTarget;
      if (target && typeof target.releasePointerCapture === 'function') {
        target.releasePointerCapture(event.pointerId);
      }
    } catch (_) {
      // noop
    }
    dragState.captureTarget = null;
    const identifier = dragState.identifier || getDockIdentifierFromElement(dockElement);
    if (dragState.overFloatingDock && identifier) {
      setDockVisibility(identifier, false);
      if (Object.prototype.hasOwnProperty.call(miniDockUserMoved, identifier)) {
        miniDockUserMoved[identifier] = false;
      }
    } else {
      snapDockToEdges(dockElement);
      const rect = dockElement.getBoundingClientRect();
      if (identifier) {
        dockLastPositions[identifier] = { left: rect.left, top: rect.top };
      }
      scheduleDockAutoHide();
    }
    setFloatingDockReceiving(false);
    hideDockMenuPlaceholder();
    dockElement.style.zIndex = '';
    dragState.identifier = null;
    window.removeEventListener('pointermove', handleDockPointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
    dragState.overFloatingDock = false;
    maybeRestoreDockMenuCollapse();
  };

  handleElement.addEventListener('pointerdown', (event) => {
    if (dockElement.dataset.visible !== 'true') {
      return;
    }
    startDrag(event, handleElement);
  });

  handleElement.addEventListener('pointerup', endDrag);
  handleElement.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', ensureWithinBounds);
  ensureWithinBounds();

  dockElement.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') {
      return;
    }
    if (dockElement.dataset.visible !== 'true') {
      return;
    }
    if (event.target.closest('.mini-dock__body')) {
      return;
    }
    if (event.target.closest('.mini-dock__drag')) {
      return;
    }
    startDrag(event, dockElement);
  });
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
  const finalLeft = clamp(left, 12, maxLeft);
  const finalTop = clamp(top, 12, maxTop);
  dockElement.style.left = `${finalLeft}px`;
  dockElement.style.top = `${finalTop}px`;
  dockElement.style.right = 'auto';
  dockElement.style.bottom = 'auto';
  dockElement.style.zIndex = '';
  dockElement.classList.remove('mini-dock--dragging');
  const identifier = getDockIdentifierFromElement(dockElement);
  if (identifier) {
    clearDockFade(identifier);
    dockLastPositions[identifier] = { left: finalLeft, top: finalTop };
  }
  updateDockAnchorData(dockElement);
}

function updateDockToggleState(identifier) {
  const button = dockToggleButtons.find((item) => item.dataset.dockToggle === identifier);
  if (!button) {
    return;
  }
  const visible = Boolean(dockVisibilityState[identifier]);
  button.setAttribute('aria-pressed', visible ? 'true' : 'false');
}

function collapseMenuDock(identifier) {
  const dockElement = dockElements[identifier];
  if (!dockElement) {
    return;
  }
  if (dockElement.dataset.menuExpanded === 'true') {
    delete dockElement.dataset.menuExpanded;
    dockElement.dataset.state = 'compact';
    dockDisplayState[identifier] = 'compact';
    DOCK_LAST_ACTIVE_STATE[identifier] = 'compact';
    updateDockStateControls(identifier);
    if (lastMenuActivatedDock === identifier) {
      lastMenuActivatedDock = null;
    }
    updateDockMenuMargin();
  }
}

function openDockFromMenu(identifier) {
  if (!(identifier in dockElements)) {
    return;
  }
  const dockElement = dockElements[identifier];
  if (!dockElement) {
    return;
  }
  if (dockVisibilityState[identifier]) {
    setDockVisibility(identifier, false);
  }
  if (dockElement.dataset.menuExpanded === 'true') {
    collapseMenuDock(identifier);
    if (lastMenuActivatedDock === identifier) {
      lastMenuActivatedDock = null;
    }
    updateDockMenuMargin();
    return;
  }
  if (lastMenuActivatedDock && lastMenuActivatedDock !== identifier) {
    collapseMenuDock(lastMenuActivatedDock);
  }
  dockElement.dataset.menuExpanded = 'true';
  dockElement.dataset.state = 'expanded';
  dockDisplayState[identifier] = 'expanded';
  DOCK_LAST_ACTIVE_STATE[identifier] = 'expanded';
  lastMenuActivatedDock = identifier;
  if (dockMenuContainer && dockElement.parentElement === dockMenuContainer) {
    dockMenuContainer.appendChild(dockElement);
  }
  updateDockStateControls(identifier);
  updateDockMenuMargin();
  dockElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
    const nextLabel = state === 'compact' ? `${baseLabel}を展開` : `${baseLabel}をコンパクト表示`;
    stateButton.setAttribute('aria-label', nextLabel);
    stateButton.setAttribute('title', nextLabel);
    const floating = Boolean(dockVisibilityState[identifier]);
    const menuExpanded = dockElements[identifier]?.dataset.menuExpanded === 'true';
    stateButton.setAttribute('aria-expanded', menuExpanded || (floating && state === 'expanded') ? 'true' : 'false');
  }
}

function applyDockDisplayState(identifier) {
  const dockElement = dockElements[identifier];
  if (!dockElement) {
    return;
  }
  if (!dockVisibilityState[identifier]) {
    dockElement.dataset.state = 'compact';
    updateDockStateControls(identifier);
    return;
  }
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  const previousRect = dockElement.getBoundingClientRect();
  const rawBottomGap = viewportHeight > 0 ? viewportHeight - previousRect.bottom : Infinity;
  const anchoredToBottom = Math.abs(rawBottomGap) <= DOCK_BOTTOM_ANCHOR_THRESHOLD;
  const state = dockDisplayState[identifier] || 'expanded';
  dockElement.dataset.state = state;
  updateDockStateControls(identifier);
  const margin = 12;
  const width = dockElement.offsetWidth || previousRect.width;
  const height = dockElement.offsetHeight || previousRect.height;
  const anchorX = dockElement.dataset.anchorX || 'free';
  const anchorY = dockElement.dataset.anchorY || 'free';
  if (anchorX === 'left') {
    dockElement.style.left = `${margin}px`;
    dockElement.style.right = 'auto';
  } else if (anchorX === 'right' && viewportWidth > 0 && width > 0) {
    const left = Math.max(margin, viewportWidth - width - margin);
    dockElement.style.left = `${left}px`;
    dockElement.style.right = 'auto';
  }
  if (anchorY === 'top') {
    dockElement.style.top = `${margin}px`;
    dockElement.style.bottom = 'auto';
  } else if (anchorY === 'bottom' && viewportHeight > 0 && height > 0) {
    const top = Math.max(margin, viewportHeight - height - margin);
    dockElement.style.top = `${top}px`;
    dockElement.style.bottom = 'auto';
  } else if (anchoredToBottom && viewportHeight > 0) {
    const nextRect = dockElement.getBoundingClientRect();
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
  updateDockAnchorData(dockElement);
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
  const shouldFloat = Boolean(visible);
  const alreadyFloating = Boolean(dockVisibilityState[identifier]);
  if (!shouldFloat) {
    DOCK_LAST_ACTIVE_STATE[identifier] = dockDisplayState[identifier] || 'expanded';
  }
  if (alreadyFloating === shouldFloat) {
    if (shouldFloat) {
      ensureDockFloatingPlacement(identifier, alreadyFloating);
    } else {
      ensureDockMenuPlacement(identifier, alreadyFloating);
    }
    return;
  }
  dockVisibilityState[identifier] = shouldFloat;
  delete autoCompactStates[identifier];
  if (shouldFloat) {
    ensureDockFloatingPlacement(identifier, alreadyFloating);
    const restoreState = DOCK_LAST_ACTIVE_STATE[identifier] || dockDisplayState[identifier] || 'expanded';
    dockDisplayState[identifier] = restoreState;
    applyDockDisplayState(identifier);
    flashDock(identifier);
  } else {
    ensureDockMenuPlacement(identifier, alreadyFloating);
    if (lastMenuActivatedDock === identifier) {
      lastMenuActivatedDock = null;
    }
  }
  updateDockToggleState(identifier);
  scheduleDockAutoHide();
  updateDockMenuMargin();
}

function toggleDockVisibility(identifier) {
  if (!(identifier in dockElements)) {
    return;
  }
  const current = Boolean(dockVisibilityState[identifier]);
  setDockVisibility(identifier, !current);
}

function ensureDockMenuPlacement(identifier, wasFloating) {
  const dockElement = dockElements[identifier];
  if (!dockElement) {
    return;
  }
  ensureDockMenuExpanded();
  dockElement.style.position = '';
  dockElement.style.left = '';
  dockElement.style.top = '';
  collapseMenuDock(identifier);
  if (wasFloating) {
    const rect = dockElement.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      dockLastPositions[identifier] = {
        left: rect.left,
        top: rect.top,
      };
    }
  }
  dockElement.dataset.visible = 'false';
  dockElement.removeAttribute('hidden');
  dockElement.style.right = '';
  dockElement.style.bottom = '';
  dockElement.style.width = '';
  dockElement.style.height = '';
  dockElement.style.zIndex = '';
  dockElement.classList.remove('mini-dock--dragging');
  delete dockElement.dataset.anchorX;
  delete dockElement.dataset.anchorY;
  if (dockMenuContainer) {
    if (dockMenuPlaceholderFor === identifier && dockMenuPlaceholder.parentElement === dockMenuContainer) {
      dockMenuContainer.insertBefore(dockElement, dockMenuPlaceholder);
    } else {
      const nextSibling = getNextMenuSibling(identifier);
      if (dockElement.parentElement !== dockMenuContainer) {
        if (nextSibling) {
          dockMenuContainer.insertBefore(dockElement, nextSibling);
        } else {
          dockMenuContainer.appendChild(dockElement);
        }
      } else if (nextSibling && dockElement.nextElementSibling !== nextSibling) {
        dockMenuContainer.insertBefore(dockElement, nextSibling);
      }
    }
  }
  hideDockMenuPlaceholder();
  setFloatingDockReceiving(false);
  dockElement.dataset.state = 'compact';
  updateDockMenuMargin();
  updateDockStateControls(identifier);
  maybeRestoreDockMenuCollapse();
}

function ensureDockFloatingPlacement(identifier, wasFloating) {
  const dockElement = dockElements[identifier];
  if (!dockElement) {
    return;
  }
  delete dockElement.dataset.menuExpanded;
  dockElement.dataset.visible = 'true';
  dockElement.removeAttribute('hidden');
  if (dockElement.parentElement !== document.body) {
    document.body.appendChild(dockElement);
  }
  dockElement.style.position = 'fixed';
  const width = dockElement.offsetWidth || 220;
  const height = dockElement.offsetHeight || 200;
  const fallback = getDockDefaultPosition(identifier, width, height);
  const last = dockLastPositions[identifier] || fallback;
  const margin = 12;
  const maxLeft = Math.max(margin, window.innerWidth - width - margin);
  const maxTop = Math.max(margin, window.innerHeight - height - margin);
  const anchorX = dockElement.dataset.anchorX || 'free';
  const anchorY = dockElement.dataset.anchorY || 'free';
  let clampedLeft = clamp(last.left ?? fallback.left, margin, maxLeft);
  let clampedTop = clamp(last.top ?? fallback.top, margin, maxTop);
  if (anchorX === 'left') {
    clampedLeft = margin;
  } else if (anchorX === 'right') {
    clampedLeft = Math.max(margin, window.innerWidth - width - margin);
  }
  if (anchorY === 'top') {
    clampedTop = margin;
  } else if (anchorY === 'bottom') {
    clampedTop = Math.max(margin, window.innerHeight - height - margin);
  }
  dockElement.style.left = `${clampedLeft}px`;
  dockElement.style.top = `${clampedTop}px`;
  dockElement.style.right = 'auto';
  dockElement.style.bottom = 'auto';
  dockElement.style.zIndex = '';
  if (!wasFloating) {
    dockLastPositions[identifier] = { left: clampedLeft, top: clampedTop };
  }
  hideDockMenuPlaceholder();
  updateDockAnchorData(dockElement);
}

function getDockDefaultPosition(identifier, width, height) {
  const margin = 24;
  const viewportWidth = window.innerWidth || 1280;
  const viewportHeight = window.innerHeight || 720;
  const safeLeft = Math.max(margin, viewportWidth - width - margin);
  const safeTop = Math.max(margin, viewportHeight - height - margin);
  switch (identifier) {
    case 'toolDock':
      return { left: margin, top: margin };
    case 'paletteDock':
      return { left: safeLeft, top: margin };
    case 'layerDock':
      return { left: margin, top: safeTop };
    case 'canvasDock':
      return { left: safeLeft, top: safeTop };
    default:
      return { left: margin, top: margin };
  }
}

function isPointInsideFloatingDock(x, y, margin = 0) {
  if (!floatingDock) {
    return false;
  }
  const rect = floatingDock.getBoundingClientRect();
  return (
    x >= rect.left - margin &&
    x <= rect.right + margin &&
    y >= rect.top - margin &&
    y <= rect.bottom + margin
  );
}

function setFloatingDockReceiving(active) {
  if (!floatingDock) {
    return;
  }
  floatingDock.classList.toggle('floating-dock--receiving', Boolean(active));
}

function isPointInsideDockMenu(x, y, margin = 0) {
  if (dockMenuContainer) {
    const rect = dockMenuContainer.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return (
        x >= rect.left - margin &&
        x <= rect.right + margin &&
        y >= rect.top - margin &&
        y <= rect.bottom + margin
      );
    }
  }
  if (floatingDock) {
    const dockRect = floatingDock.getBoundingClientRect();
    return (
      x >= dockRect.left - margin &&
      x <= dockRect.right + margin &&
      y >= dockRect.top - margin &&
      y <= dockRect.bottom + margin
    );
  }
  return false;
}

function computeDockMenuInsertion(clientX, clientY, identifier) {
  if (!dockMenuContainer) {
    return { inside: false, beforeElement: null };
  }
  const inside = isPointInsideDockMenu(clientX, clientY, 12);
  if (!inside) {
    return { inside: false, beforeElement: null };
  }
  const children = Array.from(dockMenuContainer.children).filter((child) => {
    if (child === dockMenuPlaceholder) {
      return false;
    }
    const childId = getDockIdentifierFromElement(child);
    return childId !== identifier;
  });
  let beforeElement = null;
  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    const rect = child.getBoundingClientRect();
    const rowTop = rect.top - 12;
    const rowBottom = rect.bottom + 12;
    if (clientY < rowTop) {
      beforeElement = child;
      break;
    }
    if (clientY <= rowBottom) {
      const midX = rect.left + rect.width / 2;
      if (clientX < midX) {
        beforeElement = child;
        break;
      }
    }
  }
  return { inside: true, beforeElement };
}

function showDockMenuPlaceholder(identifier, beforeElement) {
  if (!dockMenuContainer) {
    return;
  }
  dockMenuPlaceholderFor = identifier;
  dockMenuPlaceholder.dataset.target = identifier;
  if (beforeElement) {
    if (dockMenuPlaceholder.parentElement !== dockMenuContainer || dockMenuPlaceholder.nextElementSibling !== beforeElement) {
      dockMenuContainer.insertBefore(dockMenuPlaceholder, beforeElement);
    }
  } else if (dockMenuPlaceholder.parentElement !== dockMenuContainer || dockMenuPlaceholder.nextElementSibling !== null) {
    dockMenuContainer.appendChild(dockMenuPlaceholder);
  }
}

function hideDockMenuPlaceholder() {
  dockMenuPlaceholderFor = null;
  dockMenuPlaceholder.remove();
  setDockMenuReceiving(false);
}

function updateDockMenuPlaceholderPosition(identifier, clientX, clientY) {
  const { inside, beforeElement } = computeDockMenuInsertion(clientX, clientY, identifier);
  if (!inside) {
    hideDockMenuPlaceholder();
    return false;
  }
  ensureDockMenuExpanded();
  showDockMenuPlaceholder(identifier, beforeElement);
  setDockMenuReceiving(true);
  return true;
}

function getNextMenuSibling(identifier) {
  if (!dockMenuContainer) {
    return null;
  }
  const placeholderIndex = dockMenuPlaceholder.parentElement === dockMenuContainer
    ? Array.from(dockMenuContainer.children).indexOf(dockMenuPlaceholder)
    : -1;
  const currentIndex = DOCK_ORDER.indexOf(identifier);
  if (currentIndex === -1) {
    return null;
  }
  for (let index = currentIndex + 1; index < DOCK_ORDER.length; index += 1) {
    const nextId = DOCK_ORDER[index];
    const candidate = dockElements[nextId];
    if (candidate && candidate.parentElement === dockMenuContainer) {
      const candidateIndex = Array.from(dockMenuContainer.children).indexOf(candidate);
      if (placeholderIndex === -1 || candidateIndex > placeholderIndex) {
        return candidate;
      }
    }
  }
  return null;
}

function resetDockMenuDragState() {
  dockMenuDragState.active = false;
  dockMenuDragState.pointerId = null;
  dockMenuDragState.identifier = null;
  dockMenuDragState.sourceElement = null;
  dockMenuDragState.startX = 0;
  dockMenuDragState.startY = 0;
  dockMenuDragState.dragging = false;
  dockMenuDragState.hasGrabOffset = false;
  dockMenuDragState.grabOffsetX = 0;
  dockMenuDragState.grabOffsetY = 0;
  dockMenuDragState.overFloatingDock = false;
  hideDockMenuPlaceholder();
}

function startMenuDockDrag(event) {
  const { identifier, sourceElement } = dockMenuDragState;
  if (!identifier || !sourceElement) {
    return;
  }
  collapseMenuDock(identifier);
  dockMenuDragState.dragging = true;
  dockMenuDragState.overFloatingDock = false;
  setDockVisibility(identifier, true);
  if (Object.prototype.hasOwnProperty.call(miniDockUserMoved, identifier)) {
    miniDockUserMoved[identifier] = true;
  }
  clearDockAutoHideTimer();
  const dockElement = dockElements[identifier];
  if (dockElement) {
    const width = dockElement.offsetWidth || 220;
    const height = dockElement.offsetHeight || 200;
    dockMenuDragState.grabOffsetX = clamp(dockMenuDragState.grabOffsetX, 12, Math.max(12, width - 12));
    dockMenuDragState.grabOffsetY = clamp(dockMenuDragState.grabOffsetY, 12, Math.max(12, height - 12));
    dockElement.classList.add('mini-dock--dragging');
    dockElement.style.zIndex = '260';
  }
  hideDockMenuPlaceholder();
  updateMenuDockDragPosition(event);
}

function updateMenuDockDragPosition(event) {
  const { identifier } = dockMenuDragState;
  if (!identifier) {
    return;
  }
  const dockElement = dockElements[identifier];
  if (!dockElement) {
    return;
  }
  const width = dockElement.offsetWidth || 220;
  const height = dockElement.offsetHeight || 200;
  let offsetX = dockMenuDragState.grabOffsetX;
  let offsetY = dockMenuDragState.grabOffsetY;
  if (!dockMenuDragState.hasGrabOffset) {
    offsetX = width / 2;
    offsetY = height / 2;
    dockMenuDragState.hasGrabOffset = true;
  }
  offsetX = clamp(offsetX, 12, width - 12);
  offsetY = clamp(offsetY, 12, height - 12);
  dockMenuDragState.grabOffsetX = offsetX;
  dockMenuDragState.grabOffsetY = offsetY;
  const targetLeft = event.clientX - offsetX;
  const targetTop = event.clientY - offsetY;
  const margin = 12;
  const maxLeft = Math.max(margin, window.innerWidth - width - margin);
  const maxTop = Math.max(margin, window.innerHeight - height - margin);
  const clampedLeft = clamp(targetLeft, margin, maxLeft);
  const clampedTop = clamp(targetTop, margin, maxTop);
  dockElement.style.left = `${clampedLeft}px`;
  dockElement.style.top = `${clampedTop}px`;
  dockElement.style.right = 'auto';
  dockElement.style.bottom = 'auto';
  const overMenu = updateDockMenuPlaceholderPosition(identifier, event.clientX, event.clientY);
  dockMenuDragState.overFloatingDock = overMenu;
  setFloatingDockReceiving(overMenu);
}

function finishMenuDockDrag(event) {
  const { identifier, sourceElement, pointerId, dragging, overFloatingDock } = dockMenuDragState;
  if (sourceElement) {
    try {
      sourceElement.releasePointerCapture(pointerId);
    } catch (_) {
      // ignore
    }
  }
  if (identifier && dragging) {
    if (overFloatingDock) {
      setDockVisibility(identifier, false);
      if (Object.prototype.hasOwnProperty.call(miniDockUserMoved, identifier)) {
        miniDockUserMoved[identifier] = false;
      }
    } else {
      const dockElement = dockElements[identifier];
      if (dockElement) {
        const rect = dockElement.getBoundingClientRect();
        dockLastPositions[identifier] = { left: rect.left, top: rect.top };
        snapDockToEdges(dockElement);
        dockElement.classList.remove('mini-dock--dragging');
      }
      scheduleDockAutoHide();
    }
  }
  setFloatingDockReceiving(false);
  hideDockMenuPlaceholder();
  if (identifier) {
    const dockElement = dockElements[identifier];
    if (dockElement) {
      dockElement.classList.remove('mini-dock--dragging');
      dockElement.style.zIndex = '';
    }
  }
  resetDockMenuDragState();
  maybeRestoreDockMenuCollapse();
}

function handleDockMenuPointerDown(event, identifier) {
  if (event.button !== undefined && event.button !== 0) {
    return;
  }
  event.preventDefault();
  const dockElement = dockElements[identifier];
  if (!dockElement || dockElement.dataset.visible === 'true') {
    return;
  }
  dockMenuDragState.active = true;
  dockMenuDragState.pointerId = event.pointerId;
  dockMenuDragState.identifier = identifier;
  dockMenuDragState.sourceElement = dockElement;
  dockMenuDragState.startX = event.clientX;
  dockMenuDragState.startY = event.clientY;
  dockMenuDragState.dragging = false;
  const rect = dockElement.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  dockMenuDragState.grabOffsetX = isFinite(offsetX) ? offsetX : rect.width / 2;
  dockMenuDragState.grabOffsetY = isFinite(offsetY) ? offsetY : rect.height / 2;
  dockMenuDragState.hasGrabOffset = true;
  dockMenuDragState.overFloatingDock = false;
  try {
    dockElement.setPointerCapture(event.pointerId);
  } catch (_) {
    // ignore
  }
  window.addEventListener('pointermove', handleDockMenuPointerMove, { passive: false });
  window.addEventListener('pointerup', handleDockMenuPointerUp);
  window.addEventListener('pointercancel', handleDockMenuPointerUp);
}

function handleDockMenuPointerMove(event) {
  if (!dockMenuDragState.active || event.pointerId !== dockMenuDragState.pointerId) {
    return;
  }
  const deltaX = event.clientX - dockMenuDragState.startX;
  const deltaY = event.clientY - dockMenuDragState.startY;
  if (!dockMenuDragState.dragging) {
    if (Math.hypot(deltaX, deltaY) >= DOCK_MENU_DRAG_THRESHOLD) {
      startMenuDockDrag(event);
    }
    return;
  }
  event.preventDefault();
  updateMenuDockDragPosition(event);
}

function handleDockMenuPointerUp(event) {
  if (!dockMenuDragState.active || event.pointerId !== dockMenuDragState.pointerId) {
    return;
  }
  window.removeEventListener('pointermove', handleDockMenuPointerMove);
  window.removeEventListener('pointerup', handleDockMenuPointerUp);
  window.removeEventListener('pointercancel', handleDockMenuPointerUp);
  if (dockMenuDragState.dragging) {
    event.preventDefault();
    finishMenuDockDrag(event);
  } else {
    if (dockMenuDragState.sourceElement) {
      try {
        dockMenuDragState.sourceElement.releasePointerCapture(event.pointerId);
      } catch (_) {
        // ignore
      }
    }
    const identifier = dockMenuDragState.identifier;
    if (identifier) {
      openDockFromMenu(identifier);
    }
    resetDockMenuDragState();
  }
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
  const identifier = getDockIdentifierFromElement(dockElement);
  if (identifier) {
    dockLastPositions[identifier] = { left: clampedLeft, top: clampedTop };
  }
  updateDockAnchorData(dockElement);
}

function positionDefaultMiniDocks() {
  const margin = 24;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (toolDock && dockVisibilityState.toolDock && !miniDockUserMoved.toolDock) {
    setDockAbsolutePosition(toolDock, margin, margin);
  }

  if (paletteDock && dockVisibilityState.paletteDock && !miniDockUserMoved.paletteDock) {
    const width = paletteDock.offsetWidth;
    const left = viewportWidth - width - margin;
    setDockAbsolutePosition(paletteDock, left, margin);
  }

  if (canvasDock && dockVisibilityState.canvasDock && !miniDockUserMoved.canvasDock) {
    const width = canvasDock.offsetWidth;
    const height = canvasDock.offsetHeight;
    const left = viewportWidth - width - margin;
    const top = viewportHeight - height - margin;
    setDockAbsolutePosition(canvasDock, left, top);
  }

  if (layerDock && dockVisibilityState.layerDock && !miniDockUserMoved.layerDock) {
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
  const relativeX = rect.width > 0 ? (event.clientX - rect.left) / rect.width : -1;
  const relativeY = rect.height > 0 ? (event.clientY - rect.top) / rect.height : -1;
  const canvasX = relativeX * state.width;
  const canvasY = relativeY * state.height;
  const x = Math.floor(canvasX);
  const y = Math.floor(canvasY);
  const inBounds = relativeX >= 0 && relativeX < 1 && relativeY >= 0 && relativeY < 1;
  return { x, y, inBounds, canvasX, canvasY };
}

function applyBrush(x, y, handler) {
  const offset = Math.floor(state.brushSize / 2);
  let applied = false;
  for (let by = 0; by < state.brushSize; by += 1) {
    for (let bx = 0; bx < state.brushSize; bx += 1) {
      const px = x - offset + bx;
      const py = y - offset + by;
      if (px >= 0 && px < state.width && py >= 0 && py < state.height && isPixelSelected(px, py)) {
        handler(px, py);
        applied = true;
      }
    }
  }
  return applied;
}

function drawBrush(x, y, targetCtx = null) {
  const activeLayer = targetCtx ? null : getActiveLayer();
  const context = targetCtx || activeLayer?.ctx;
  if (!context) {
    return;
  }
  context.fillStyle = state.color;
  const applied = applyBrush(x, y, (px, py) => {
    context.fillRect(px, py, 1, 1);
  });
  if (applied) {
    markHistoryDirty();
  }
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
  const applied = applyBrush(x, y, (px, py) => {
    context.clearRect(px, py, 1, 1);
  });
  if (applied) {
    markHistoryDirty();
  }
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
  if (!isPixelSelected(x, y)) {
    return;
  }
  const layerCtx = activeLayer.ctx;
  const { width, height } = state;
  const imageData = layerCtx.getImageData(0, 0, width, height);
  const pixels = new Uint32Array(imageData.data.buffer);
  const targetIndex = y * width + x;
  const targetColor = pixels[targetIndex];
  const fillColor = hexToUint32(hexColor);
  if (targetColor === fillColor) {
    return;
  }

  const stack = [[x, y]];
  let filled = false;
  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    if (!isPixelSelected(cx, cy)) {
      continue;
    }
    const index = cy * width + cx;
    if (pixels[index] !== targetColor) {
      continue;
    }
    pixels[index] = fillColor;
    filled = true;

    if (cx > 0) stack.push([cx - 1, cy]);
    if (cx < width - 1) stack.push([cx + 1, cy]);
    if (cy > 0) stack.push([cx, cy - 1]);
    if (cy < height - 1) stack.push([cx, cy + 1]);
  }

  if (!filled) {
    return;
  }

  layerCtx.putImageData(imageData, 0, 0);
  markHistoryDirty();
}

function updateCursorInfo(x = null, y = null) {
  if (typeof window === 'undefined') {
    return;
  }
  if (x === null || y === null) {
    document.body.dataset.cursorPosition = '';
    return;
  }
  document.body.dataset.cursorPosition = `${x + 1},${y + 1}`;
}

function updateDotCount() {
  const data = ctx.getImageData(0, 0, state.width, state.height).data;
  let count = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 0) {
      count += 1;
    }
  }
  document.body.dataset.dotCount = String(count);
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
  clearSelection({ silent: true });
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
  if (shouldStartCanvasPan(event)) {
    beginCanvasPan(event);
    return;
  }
  if (event.pointerType === 'touch' && zoomPointers.size >= 2) {
    return;
  }
  const position = getPointerPosition(event);
  const { x, y, inBounds, canvasX, canvasY } = position;
  if (
    inBounds &&
    isSelectionTool(state.tool) &&
    hasActiveSelection() &&
    !selectionState.isDragging &&
    !selectionState.isMoving &&
    isPixelSelected(x, y)
  ) {
    const moved = beginSelectionMove(x, y, event.pointerId, pixelCanvas);
    if (moved) {
      updateCursorInfo(x, y);
      return;
    }
  }
  if (state.tool === 'selectRect') {
    if (inBounds) {
      beginRectSelection(x, y, event.pointerId, pixelCanvas);
    } else {
      clearSelection();
    }
    return;
  }
  if (state.tool === 'selectLasso') {
    if (inBounds) {
      beginLassoSelection(canvasX, canvasY, event.pointerId, pixelCanvas);
    } else {
      clearSelection();
    }
    return;
  }
  if (state.tool === 'selectMagic') {
  if (inBounds) {
      performMagicSelection(x, y);
      updateCursorInfo(x, y);
    } else {
      clearSelection();
    }
    return;
  }
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
  if (panState.active && event.pointerId === panState.pointerId) {
    updateCanvasPan(event);
    return;
  }
  if (selectionState.isMoving && event.pointerId === selectionState.pointerId) {
    const position = getPointerPosition(event);
    updateSelectionMove(position.x, position.y);
    if (position.inBounds) {
      updateCursorInfo(position.x, position.y);
    }
    return;
  }
  if (selectionState.isDragging && event.pointerId === selectionState.pointerId) {
    const position = getPointerPosition(event);
    if (selectionState.mode === 'selectRect') {
      updateRectSelection(position.x, position.y);
    } else if (selectionState.mode === 'selectLasso') {
      updateLassoSelection(position.canvasX, position.canvasY);
    }
    if (position.inBounds) {
      updateCursorInfo(position.x, position.y);
    }
    return;
  }
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
  let handledSelection = false;
  if (event && selectionState.isMoving && event.pointerId === selectionState.pointerId) {
    finalizeSelectionMove();
    handledSelection = true;
  }
  if (event && selectionState.isDragging && event.pointerId === selectionState.pointerId) {
    finalizeSelectionDrag();
    handledSelection = true;
  }
  const panEnded = endCanvasPan(event);
  if (event && event.pointerType === 'touch') {
    handleZoomPointerUp(event);
  }
  if (handledSelection) {
    return;
  }
  if (panEnded) {
    return;
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
  window.addEventListener('keydown', handleCanvasPanKeyDown, { capture: true });
  window.addEventListener('keyup', handleCanvasPanKeyUp, { capture: true });
  window.addEventListener('blur', resetCanvasPanKeyState);

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
    button.addEventListener('click', () => {
      const targetTool = button.dataset.tool || 'pen';
      setActiveTool(targetTool);
      if (isSelectionTool(targetTool)) {
        closeSelectionToolPanel();
      }
    });
  });

  if (selectionToolToggle) {
    selectionToolToggle.addEventListener('click', () => {
      toggleSelectionToolPanel();
    });
  }

  document.addEventListener('click', handleSelectionToolDocumentClick);

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
    if (event.key === 'Escape') {
      let handled = false;
      if (selectionToolPanelOpen) {
        closeSelectionToolPanel();
        handled = true;
      }
      if (activePanel) {
        closeActivePanel();
        return;
      }
      if (handled) {
        return;
      }
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
  initSelectionOverlay();
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
  Object.entries(dockElements).forEach(([identifier, element]) => {
    if (!element) {
      return;
    }
    applyDockDisplayState(identifier);
    updateDockToggleState(identifier);
    element.addEventListener('pointerdown', (event) => {
      if (element.dataset.visible === 'false' && element.dataset.menuExpanded !== 'true') {
        handleDockMenuPointerDown(event, identifier);
      }
    });
  });
  dockStateButtons.forEach((button) => {
    const target = button.dataset.dockState;
    button.addEventListener('click', (event) => {
      if (!dockVisibilityState[target]) {
        event.preventDefault();
        openDockFromMenu(target);
        return;
      }
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
  updatePanCursorState();
  updateToolDockStatus();
  updatePaletteDockStatus();
  updateCanvasDockStatus();
  setupDockAutoHide();
  setPreviewVisible(previewVisible);
  resetHistory();
  queueStateSave();
}

init();
