const pixelCanvas = document.getElementById('pixelCanvas');
const previewCanvas = document.getElementById('previewCanvas');
const previewWindow = document.getElementById('previewWindow');
const previewHandle = document.getElementById('previewHandle');
const canvasStage = document.getElementById('canvasStage');
let selectionOutlineCanvas = null;
let selectionOutlineCtx = null;
let selectionContentCanvas = null;
let selectionContentCtx = null;
let virtualCursorPreviewCanvas = null;
let virtualCursorPreviewCtx = null;
let shapePreviewCanvas = null;
let shapePreviewCtx = null;
let overlayDirty = false;
let overlayRafId = null;
const previewOverlayState = {
  layers: {
    virtualStroke: new Map(),
    virtualHover: new Map(),
    pointer: new Map(),
  },
};
const PREVIEW_LAYER_ORDER = ['virtualStroke', 'virtualHover', 'pointer'];
const pixelSizeInput = document.getElementById('pixelSize');
const historyLimitInput = document.getElementById('historyLimit');
const memoryUsageDisplay = document.getElementById('memoryUsage');
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
const shapeToolToggle = document.querySelector('[data-toggle="shapeTools"]');
const shapeToolPanel = document.getElementById('shapeToolPanel');
const shapeToolToggleIcon = document.getElementById('shapeToolToggleIcon');
const shapeToolIds = ['shapeLine', 'shapeCurve', 'shapeCircle', 'shapeCircleFill', 'shapeRect', 'shapeRectFill'];
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
const layerDockStatusButton = document.querySelector('[data-dock-state="layerDock"]');
const layerListElement = document.getElementById('layerList');
const addLayerButtons = Array.from(document.querySelectorAll('[data-action="addLayer"]'));
const deleteLayerButton = document.getElementById('deleteLayer');
const deleteFrameButton = document.getElementById('deleteFrame');
const togglePlaybackButton = document.getElementById('togglePlayback');
const togglePreviewButton = document.getElementById('togglePreview');
const undoButton = document.getElementById('undoAction');
const redoButton = document.getElementById('redoAction');
const exportPanel = document.getElementById('exportPanel');
const exportSizeSelect = document.getElementById('exportSize');
const exportHint = document.getElementById('exportHint');
const exportConfirmButton = document.getElementById('confirmExport');
const exportGifButton = document.getElementById('confirmExportGif');
const exportGifHint = document.getElementById('exportGifHint');
const virtualCursorToggle = document.querySelector('[data-toggle="virtualCursor"]');
const toolDockStatusIcon = document.getElementById('toolDockStatus');
const paletteDockStatusSwatch = document.getElementById('paletteDockStatus');
const canvasDockStatusText = document.getElementById('canvasDockStatus');
const canvasDockStatusButton = document.querySelector('[data-dock-state="canvasDock"]');
const canvasTabButtons = Array.from(document.querySelectorAll('[data-canvas-tab]'));
const canvasTabPanels = Array.from(document.querySelectorAll('#canvasDock .mini-tab-panel'));
const colorModeInputs = Array.from(document.querySelectorAll('input[name="colorMode"]'));
let addPaletteButton = null;
let paletteEditor = null;
let paletteEditorVisible = false;
let paletteEditorPreview = null;
let paletteEditorHexInput = null;
let paletteEditorHueInput = null;
let paletteEditorSatInput = null;
let paletteEditorLightInput = null;
let paletteEditorHueValue = null;
let paletteEditorSatValue = null;
let paletteEditorLightValue = null;
let paletteEditorAlphaInput = null;
let paletteEditorAlphaValue = null;
let paletteEditorSuppressUpdates = false;
let paletteEditorPreventSync = false;
let paletteEditorResizeListenerAttached = false;
let paletteEditorHueCanvas = null;
let paletteEditorHueCtx = null;
let paletteEditorWheelPointerId = null;
let paletteEditorHistoryContainer = null;
let paletteEditorHistorySlots = [];
let paletteEditorToolbar = null;
const PALETTE_EDITOR_HISTORY_SIZE = 5;
let paletteEditorRecentColors = [];
const indexedColorLookup = new Map();
let activeCanvasTabId = canvasTabButtons[0]?.dataset.canvasTab || 'canvasTabSize';
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

const COLOR_MODE_OPTIONS = ['rgb', 'indexed', 'cmyk'];
const COLOR_MODE_DEFAULT = 'rgb';
const COLOR_MODE_LABELS = {
  rgb: 'RGB',
  indexed: 'インデックス',
  cmyk: 'CMYK',
};

const DOCK_HELP_CONTENT = {
  dockMenu: {
    title: 'ドックの使い方',
    lines: [
      '各メニューの左側をドラッグすると個別のミニドックを外に出せます。',
      '外に出したミニドックは自由に配置でき、クリックで再びメニューに戻せます。',
      '右上のトグルでドック全体を開閉、スロットから個別にパネルを開きます。',
    ],
  },
  toolDock: {
    title: 'ツールボックスの使い方',
    lines: [
      'クリック: 描画ツールや選択ツールを切り替えます。',
      'サブツール付きのボタンはクリックでパネルが開き、詳細なツールを選択できます。',
      '左端のハンドルをドラッグするとミニドック全体を移動できます。',
    ],
  },
  paletteDock: {
    title: 'カラーパレットの使い方',
    lines: [
      'クリック: スウォッチの色を選択します。',
      'ダブルクリック: 色編集パネルを開き、色相/彩度/明度/透明度を調整します。',
      '長押し: スウォッチをドラッグして並び替えます。',
      '下部の履歴ボタンで最近確定した色を呼び出せます。',
    ],
  },
  layerDock: {
    title: 'レイヤー操作',
    lines: [
      'クリック: レイヤーを選択します。',
      'ドラッグ: レイヤーやフレームを並び替えます。',
      '「レイヤー追加」「レイヤー削除」でレイヤーを管理します。',
      'フレームの追加/削除・再生ボタンでアニメーションを制御します。',
    ],
  },
  canvasDock: {
    title: 'キャンバス設定',
    lines: [
      'ドットサイズ: 1ドットの表示倍率を変更します。',
      '横幅/縦幅: キャンバスの解像度をピクセル単位で設定します。',
      '「サイズ反映」を押すと入力した値が適用されます。',
      'メモリ使用量は履歴/レイヤーの目安で、上限を越えると自動で履歴を調整します。',
    ],
  },
};

let activeHelpPopover = null;
let activeHelpButton = null;
let helpListenersAttached = false;
const ICON_LAYER_VISIBLE =
  '<img src="assets/icons/action-visibility-on.svg" alt="" width="16" height="16" />';
const ICON_LAYER_HIDDEN =
  '<img src="assets/icons/action-visibility-off.svg" alt="" width="16" height="16" />';
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
const GIF_DEFAULT_DELAY = 8; // 100分の1秒単位（約80ms）
const PLAYBACK_DEFAULT_FPS = 6;
const PLAY_BUTTON_MARKUP = '<span aria-hidden="true">▶</span><span class="sr-only">再生</span>';
const STOP_BUTTON_MARKUP = '<span aria-hidden="true">■</span><span class="sr-only">停止</span>';
const PIXEL_SIZE_DEFAULT = 2;
const PIXEL_SIZE_MIN = 1;
const PIXEL_SIZE_MAX = 32;
const HISTORY_LIMIT_DEFAULT = 30;
const HISTORY_LIMIT_MIN = 30;
const HISTORY_LIMIT_MAX = 30;
const HISTORY_MEMORY_AUTO_LIMIT_MB = 512;
const HISTORY_MEMORY_AUTO_LIMIT_BYTES = HISTORY_MEMORY_AUTO_LIMIT_MB * 1024 * 1024;
const BYTES_PER_PIXEL = 4;
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

let pixelSizeMin = PIXEL_SIZE_MIN;
let pixelSizeMax = PIXEL_SIZE_MAX;
let initialPixelScale = PIXEL_SIZE_DEFAULT;
let historyLimitMin = HISTORY_LIMIT_MIN;
let historyLimitMax = HISTORY_LIMIT_MAX;
let initialHistoryLimit = HISTORY_LIMIT_DEFAULT;

if (pixelSizeInput) {
  const attrMin = Number(pixelSizeInput.min);
  if (Number.isFinite(attrMin) && attrMin > 0) {
    pixelSizeMin = attrMin;
  } else {
    pixelSizeInput.min = String(pixelSizeMin);
  }
  const attrMax = Number(pixelSizeInput.max);
  if (Number.isFinite(attrMax) && attrMax >= pixelSizeMin) {
    pixelSizeMax = attrMax;
  } else {
    pixelSizeMax = PIXEL_SIZE_MAX;
    pixelSizeInput.max = String(pixelSizeMax);
  }
  if (!pixelSizeInput.step) {
    pixelSizeInput.step = '1';
  }
  const rawValue = Number(pixelSizeInput.value);
  const fallback = Number.isFinite(rawValue) ? rawValue : PIXEL_SIZE_DEFAULT;
  const clamped = clamp(fallback, pixelSizeMin, pixelSizeMax);
  pixelSizeInput.value = String(clamped);
  pixelSizeInput.disabled = false;
  pixelSizeInput.removeAttribute('aria-disabled');
  initialPixelScale = clamped;
}

if (historyLimitInput) {
  const attrMin = Number(historyLimitInput.min);
  if (Number.isFinite(attrMin) && attrMin > 0) {
    historyLimitMin = attrMin;
  } else {
    historyLimitInput.min = String(historyLimitMin);
  }
  const attrMax = Number(historyLimitInput.max);
  if (Number.isFinite(attrMax) && attrMax >= historyLimitMin) {
    historyLimitMax = attrMax;
  } else {
    historyLimitMax = HISTORY_LIMIT_MAX;
    historyLimitInput.max = String(historyLimitMax);
  }
  if (!historyLimitInput.step) {
    historyLimitInput.step = '1';
  }
  const rawValue = Number(historyLimitInput.value);
  const fallback = Number.isFinite(rawValue) ? rawValue : HISTORY_LIMIT_DEFAULT;
  const clamped = clamp(fallback, historyLimitMin, historyLimitMax);
  historyLimitInput.value = String(clamped);
  initialHistoryLimit = clamped;
}

const state = {
  width: Number(widthInput.value) || 32,
  height: Number(heightInput.value) || 32,
  pixelSize: PIXEL_SIZE_DEFAULT,
  pixelScale: initialPixelScale,
  historyLimit: initialHistoryLimit,
  colorAlpha: 1,
  brushSize: Number(brushSizeInput.value) || 1,
  tool: 'pencil',
  color: colorPicker.value,
  colorMode: COLOR_MODE_DEFAULT,
  zoom: 1,
  minZoom: ZOOM_LIMITS.min,
  offsetX: 0,
  offsetY: 0,
  palette: [],
};

const layersState = {
  layers: [],
  selectedId: null,
  nextId: 1,
};

const HAS_TOUCH_SUPPORT =
  typeof navigator !== 'undefined' &&
  (navigator.maxTouchPoints > 0 || (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches));

const DEFAULT_CURSOR_ICON = 'assets/icons/tool-cursor.png';

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
  visualX: Math.floor(state.width / 2) + 0.5,
  visualY: Math.floor(state.height / 2) + 0.5,
  preferredEnabled: true,
  zoomTemporarilyDisabled: false,
};

let virtualCursorElement = null;
let virtualCursorIconElement = null;
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
  pendingClearClick: null,
  pendingClearMoved: false,
  moveIndexBuffer: null,
};

const SELECTION_OUTLINE_THICKNESS_PX = 1;
const SELECTION_DASH_LENGTH_PX = 10;
const SELECTION_DASH_SPEED_PX = 10;
const SELECTION_COLOR_LIGHT = '#ffffff';
const SELECTION_COLOR_DARK = '#000000';
const FLOOD_FILL_BATCH_SIZE = 4096;
let selectionAnimationFrame = null;
let selectionAnimationLastTime = null;
let selectionDashPhasePx = 0;
let selectionToolPanelOpen = false;
let shapeToolPanelOpen = false;

const floodFillState = {
  task: null,
};

const shapeState = {
  active: false,
  tool: null,
  pointerId: null,
  start: null,
  current: null,
  color: null,
  alpha: null,
  captureTarget: null,
  curve: null,
};

const framesState = {
  frames: [],
  activeId: null,
  nextId: 1,
};

const playbackState = {
  playing: false,
  fps: PLAYBACK_DEFAULT_FPS,
  rafId: null,
  lastTimestamp: 0,
};

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
let canvasAutoCentered = false;
const zoomPointers = new Map();
let pinchStartDistance = null;
let pinchStartZoom = 1;
let userAdjustedZoom = false;
let pinchActive = false;
let pinchLastFocus = null;
const pointerHoverState = {
  active: false,
  x: null,
  y: null,
  pointerType: null,
};
const CANVAS_CURSOR_VISIBLE = 'crosshair';
const CANVAS_CURSOR_HIDDEN = 'none';
let canvasCursorHidden = false;
let desktopVirtualCursorActive = false;
const panState = {
  active: false,
  pointerId: null,
  lastClientX: 0,
  lastClientY: 0,
  captureTarget: null,
};
const PEN_DEFAULT_ALPHA = 0.3;
let penPreferredAlpha = PEN_DEFAULT_ALPHA;
let nonPenAlphaSnapshot = null;
let spaceKeyPressed = false;
const layerDragState = {
  draggingId: null,
  dropBeforeId: null,
};
let layerTimelineScrollLeft = 0;
let layerTimelineScrollInitialized = false;
let isSyncingLayerTimelineScroll = false;
let saveTimer = null;
let pendingSave = false;
let isRestoringState = false;
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

const DOCK_MENU_DRAG_THRESHOLD = 14;
const DOCK_MENU_LONG_PRESS_MS = 250;
const dockMenuDragState = {
  active: false,
  pointerId: null,
  identifier: null,
  sourceElement: null,
  startX: 0,
  startY: 0,
  startTime: 0,
  dragging: false,
  hasGrabOffset: false,
  grabOffsetX: 0,
  grabOffsetY: 0,
  overFloatingDock: false,
  lastClientX: 0,
  lastClientY: 0,
  suppressClick: false,
  longPressTimer: null,
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

function hasImageDataContent(imageData) {
  if (!imageData || !imageData.data) {
    return false;
  }
  const data = imageData.data;
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] !== 0) {
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

function imageDataToDataURL(imageData) {
  if (!imageData) {
    return null;
  }
  const { width, height } = imageData;
  const { canvas, ctx } = createOffscreenCanvas(width, height);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

async function imageDataFromDataURL(dataURL, width, height) {
  const { canvas, ctx } = createOffscreenCanvas(width, height);
  ctx.clearRect(0, 0, width, height);
  if (dataURL) {
    const image = await loadImageFromDataURL(dataURL);
    ctx.drawImage(image, 0, 0, width, height);
  }
  return ctx.getImageData(0, 0, width, height);
}

function snapshotToSerializable(snapshot) {
  if (!snapshot) {
    return null;
  }
  return {
    width: snapshot.width,
    height: snapshot.height,
    pixelSize: snapshot.pixelSize,
    selectedId: snapshot.selectedId,
    nextId: snapshot.nextId,
    colorMode: snapshot.colorMode || COLOR_MODE_DEFAULT,
    color: normalizeHex(snapshot.color || state.color),
    colorAlpha: Number.isFinite(snapshot.colorAlpha) ? snapshot.colorAlpha : state.colorAlpha,
    palette: Array.isArray(snapshot.palette)
      ? snapshot.palette.map((entry) => ({
          color: normalizeHex(entry?.color || state.color),
          alpha: clamp(Number(entry?.alpha ?? 1), 0, 1),
          storedUint32: typeof entry?.storedUint32 === 'number' ? entry.storedUint32 : undefined,
        }))
      : state.palette.map((entry) => ({
          color: normalizeHex(entry?.color || state.color),
          alpha: clamp(Number(entry?.alpha ?? 1), 0, 1),
          storedUint32: typeof entry?.storedUint32 === 'number' ? entry.storedUint32 : undefined,
        })),
    layers: snapshot.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      image: imageDataToDataURL(layer.imageData),
      indexBuffer: layer.indexBuffer ? Array.from(layer.indexBuffer) : undefined,
    })),
  };
}

async function snapshotFromSerializable(serialized) {
  if (!serialized || !Array.isArray(serialized.layers)) {
    return null;
  }
  const width = clamp(Number(serialized.width) || state.width, Number(widthInput.min), Number(widthInput.max));
  const height = clamp(Number(serialized.height) || state.height, Number(heightInput.min), Number(heightInput.max));
  const min = Number(pixelSizeInput?.min) || pixelSizeMin;
  const max = Number(pixelSizeInput?.max) || pixelSizeMax;
  const pixelSizeRaw = Number(serialized.pixelSize);
  const pixelSize = clamp(Number.isFinite(pixelSizeRaw) ? pixelSizeRaw : state.pixelScale, min, max);
  const layers = [];
  for (const layerData of serialized.layers) {
    const imageData = await imageDataFromDataURL(layerData.image, width, height);
    layers.push({
      id: typeof layerData.id === 'string' ? layerData.id : `layer-${layersState.nextId}`,
      name: typeof layerData.name === 'string' ? layerData.name : `レイヤー${layersState.nextId}`,
      visible: layerData.visible !== false,
      opacity: clamp(Number(layerData.opacity ?? 1), 0, 1),
      imageData,
      indexBuffer: Array.isArray(layerData.indexBuffer)
        ? Uint16Array.from(layerData.indexBuffer)
        : layerData.indexBuffer instanceof Uint16Array
          ? layerData.indexBuffer.slice()
          : null,
    });
  }
  let paletteEntries = Array.isArray(serialized.palette)
    ? serialized.palette.map((entry) =>
        createPaletteEntry(
          entry?.color ?? state.color,
          typeof entry?.alpha === 'number' ? entry.alpha : 1,
          typeof entry?.storedUint32 === 'number' ? entry.storedUint32 : null,
        ),
      )
    : [];
  paletteEntries = ensurePaletteHasTransparentEntry(paletteEntries);
  const localLookup = new Map();
  seedColorLookupFromPalette(paletteEntries, localLookup);
  layers.forEach((layer) => {
    if (
      !(layer.indexBuffer instanceof Uint16Array) ||
      layer.indexBuffer.length !== width * height
    ) {
      const buffer = new Uint16Array(width * height);
      if (layer.imageData?.data) {
        const data = layer.imageData.data;
        for (let pixelIndex = 0, dataIndex = 0; pixelIndex < buffer.length; pixelIndex += 1, dataIndex += 4) {
          buffer[pixelIndex] = resolvePaletteIndexFromPixel(
            data[dataIndex],
            data[dataIndex + 1],
            data[dataIndex + 2],
            data[dataIndex + 3],
            paletteEntries.length > 0 ? paletteEntries : state.palette,
            paletteEntries.length > 0 ? localLookup : indexedColorLookup,
          );
        }
      }
      layer.indexBuffer = buffer;
    }
    redrawSnapshotLayerFromIndexBuffer(layer, paletteEntries.length > 0 ? paletteEntries : state.palette);
  });
  return {
    width,
    height,
    pixelSize,
    selectedId: typeof serialized.selectedId === 'string' ? serialized.selectedId : null,
    nextId: Number(serialized.nextId) || layers.length + 1,
    colorMode: COLOR_MODE_OPTIONS.includes(serialized.colorMode) ? serialized.colorMode : COLOR_MODE_DEFAULT,
    color: normalizeHex(typeof serialized.color === 'string' ? serialized.color : state.color),
    colorAlpha: clamp(Number(serialized.colorAlpha ?? state.colorAlpha ?? 1), 0, 1),
    palette: paletteEntries,
    layers,
  };
}

function computeFrameLayerContent(snapshot) {
  const map = new Map();
  if (!snapshot || !Array.isArray(snapshot.layers)) {
    return map;
  }
  snapshot.layers.forEach((layer) => {
    map.set(layer.id, hasImageDataContent(layer.imageData));
  });
  return map;
}

function serializeAppState() {
  initFrames();
  saveCurrentFrame();
  updatePaletteState({ skipSave: true, skipRecolor: true });
  const palette = state.palette.map((entry) => ({
    color: entry.color,
    alpha: entry.alpha,
    storedUint32: typeof entry.storedUint32 === 'number' ? entry.storedUint32 : undefined,
  }));
  const layers = layersState.layers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
    opacity: layer.opacity,
    image: layer.canvas.toDataURL('image/png'),
    indexBuffer: layer.indexBuffer ? Array.from(layer.indexBuffer) : undefined,
  }));
  const frames = framesState.frames.map((frame) => ({
    id: frame.id,
    name: frame.name,
    snapshot: frame.snapshot ? snapshotToSerializable(frame.snapshot) : null,
    layerContent: frame.layerContent ? Object.fromEntries(frame.layerContent) : undefined,
  }));
  return {
    version: 3,
    canvas: {
      width: state.width,
      height: state.height,
      pixelSize: state.pixelScale,
      colorAlpha: state.colorAlpha,
      colorMode: state.colorMode,
      color: state.color,
    },
    historyLimit: state.historyLimit,
    selectedId: layersState.selectedId,
    nextId: layersState.nextId,
    layers,
    frames,
    framesActiveId: framesState.activeId,
    framesNextId: framesState.nextId,
    palette,
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
  const savedHistoryLimit = Number(payload.historyLimit);
  const savedPixelSize = Number(payload.canvas?.pixelSize);
  const savedColorAlpha = Number(payload.canvas?.colorAlpha ?? payload.colorAlpha);
  const savedColorMode = typeof payload.canvas?.colorMode === 'string' ? payload.canvas.colorMode : payload.colorMode;
  const savedColorValue = typeof payload.canvas?.color === 'string' ? payload.canvas.color : payload.color;
  const savedPalette = Array.isArray(payload.palette) ? payload.palette : null;
  if (pixelSizeInput) {
    const min = Number(pixelSizeInput.min) || pixelSizeMin;
    const max = Number(pixelSizeInput.max) || pixelSizeMax;
    const resolved = clamp(Number.isFinite(savedPixelSize) ? savedPixelSize : state.pixelScale, min, max);
    pixelSizeInput.value = String(resolved);
    state.pixelScale = resolved;
  } else if (Number.isFinite(savedPixelSize)) {
    state.pixelScale = Math.max(PIXEL_SIZE_MIN, savedPixelSize);
  }
  const resolvedHistoryLimit = clamp(Math.floor(Number.isFinite(savedHistoryLimit) ? savedHistoryLimit : HISTORY_LIMIT_DEFAULT), HISTORY_LIMIT_MIN, HISTORY_LIMIT_MAX);
  state.historyLimit = resolvedHistoryLimit;
  if (Number.isFinite(savedColorAlpha)) {
    state.colorAlpha = clamp(savedColorAlpha, 0, 1);
  }

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
    updatePixelSizeConstraints();
    updateHistoryLimit({ skipSave: true });
    updatePixelSize({ skipComposite: true, preserveDimensions: true, skipSave: true });

    const resolvedColor = normalizeHex(savedColorValue || state.color);
    state.color = resolvedColor;
    colorPicker.value = resolvedColor;
    setColorMode(savedColorMode, { skipSave: true, force: true, rebuildPalette: false });
    if (savedPalette && savedPalette.length > 0) {
      initPalette(savedPalette, { activeColor: resolvedColor, activeAlpha: state.colorAlpha, skipSave: true });
    } else {
      setActiveColor(resolvedColor, null, { closePanel: false, alpha: state.colorAlpha });
      updatePaletteState({ skipSave: true, skipRecolor: true });
    }

    for (let index = 0; index < payload.layers.length; index += 1) {
      const layerData = payload.layers[index];
      const indexSource = Array.isArray(layerData?.indexBuffer)
        ? Uint16Array.from(layerData.indexBuffer)
        : layerData?.indexBuffer instanceof Uint16Array
          ? layerData.indexBuffer
          : null;
      const layer = createLayer({
        name: typeof layerData?.name === 'string' && layerData.name.trim().length > 0 ? layerData.name : `レイヤー${layersState.nextId}`,
        visible: layerData?.visible !== false,
        opacity: clamp(Number(layerData?.opacity ?? 1), 0, 1),
        insertAt: layersState.layers.length,
        indexSource,
      });
      if (typeof layerData?.id === 'string' && layerData.id.length > 0) {
        layer.id = layerData.id;
      }
      try {
        const image = await loadImageFromDataURL(layerData?.image);
        if (image) {
          layer.ctx.clearRect(0, 0, width, height);
          layer.ctx.drawImage(image, 0, 0, width, height);
          layer.hasContent = detectLayerHasContent(layer);
          backfillLayerIndexBuffer(layer);
          redrawLayerFromIndexBuffer(layer);
        }
      } catch (error) {
        console.warn('レイヤー画像の復元に失敗しました', error);
        layer.ctx.clearRect(0, 0, width, height);
        if (layer.indexBuffer) {
          layer.indexBuffer.fill(0);
        }
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

    const baseFrameSnapshot = captureHistorySnapshot();
    framesState.frames = [];
    framesState.activeId = null;
    framesState.nextId = Number(payload.framesNextId) > 0 ? Number(payload.framesNextId) : 1;
    const framePayload = Array.isArray(payload.frames) ? payload.frames : [];
    if (framePayload.length) {
      for (const frameData of framePayload) {
        let snapshotData = baseFrameSnapshot;
        if (frameData && frameData.snapshot) {
          try {
            const deserialized = await snapshotFromSerializable(frameData.snapshot);
            if (deserialized) {
              snapshotData = deserialized;
            }
          } catch (error) {
            console.warn('フレームの復元に失敗しました', error);
            snapshotData = baseFrameSnapshot;
          }
        }
        const providedId = typeof frameData?.id === 'string' ? frameData.id : null;
        const numericId = getFrameNumericId(providedId);
        if (Number.isFinite(numericId)) {
          framesState.nextId = Math.max(framesState.nextId, numericId + 1);
        }
        const frameId = providedId || `frame-${framesState.nextId++}`;
        const frameName = typeof frameData?.name === 'string' && frameData.name.trim().length > 0 ? frameData.name.trim() : frameId.replace('frame-', 'フレーム');
        const clonedSnapshot = cloneSnapshot(snapshotData);
        framesState.frames.push({
          id: frameId,
          name: frameName,
          snapshot: clonedSnapshot,
          layerContent: computeFrameLayerContent(clonedSnapshot),
        });
      }
      const desiredFrameId = typeof payload.framesActiveId === 'string' ? payload.framesActiveId : framesState.frames[0]?.id;
      const activeFrame = getFrameById(desiredFrameId) || framesState.frames[0] || null;
      if (activeFrame && activeFrame.snapshot) {
        framesState.activeId = activeFrame.id;
        if (activeFrame !== framesState.frames[0] || desiredFrameId !== framesState.frames[0]?.id) {
          applyHistorySnapshot(activeFrame.snapshot);
        }
      }
    }
    if (!framesState.frames.length) {
      const frame = createFrameFromSnapshot(baseFrameSnapshot);
      framesState.frames.push(frame);
      framesState.activeId = frame.id;
    }

    saveCurrentFrame();

    renderLayerList();
    updateLayerDockStatus();
    updateLayerControlAvailability();
    compositeLayers({ skipContentCheck: true });
    refreshExportOptions();
    updateDotCount();
    enforceHistoryMemoryBudget();
    updateMemoryUsageDisplay();
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
    pixelSize: state.pixelScale,
    colorMode: state.colorMode,
    color: state.color,
    colorAlpha: state.colorAlpha,
    selectedId: layersState.selectedId,
    nextId: layersState.nextId,
    layers: layersState.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      imageData: layer.ctx.getImageData(0, 0, state.width, state.height),
      indexBuffer: layer.indexBuffer ? layer.indexBuffer.slice() : null,
    })),
    palette: capturePaletteSnapshot(),
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

function getHistoryLimit() {
  const min = Math.max(1, Math.floor(historyLimitMin));
  const max = Math.max(min, Math.floor(historyLimitMax));
  const raw = Number(state.historyLimit);
  if (!Number.isFinite(raw)) {
    return HISTORY_LIMIT_DEFAULT;
  }
  const clamped = clamp(Math.floor(raw), min, max);
  return Math.max(1, clamped);
}

function trimHistoryStacks() {
  const limit = getHistoryLimit();
  while (historyStack.length > limit) {
    historyStack.shift();
  }
  while (redoStack.length > limit) {
    redoStack.shift();
  }
  enforceHistoryMemoryBudget();
}

function estimateSnapshotBytes(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.layers)) {
    return 0;
  }
  let total = 0;
  snapshot.layers.forEach((layer) => {
    if (!layer || !layer.imageData) {
      return;
    }
    const imageData = layer.imageData;
    if (imageData instanceof ImageData) {
      total += imageData.data?.length ?? imageData.width * imageData.height * BYTES_PER_PIXEL;
      return;
    }
    if (imageData && typeof imageData.data?.length === 'number') {
      total += imageData.data.length;
      return;
    }
    const width = Number(imageData.width);
    const height = Number(imageData.height);
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      total += width * height * BYTES_PER_PIXEL;
    }
  });
  return total;
}

function estimateHistoryArrayBytes(stack) {
  if (!Array.isArray(stack) || stack.length === 0) {
    return 0;
  }
  return stack.reduce((sum, snapshot) => sum + estimateSnapshotBytes(snapshot), 0);
}

function estimateLayerMemoryBytes() {
  return layersState.layers.reduce((total, layer) => {
    if (!layer || !layer.canvas) {
      return total;
    }
    const width = Math.max(1, Number(layer.canvas.width) || state.width || 1);
    const height = Math.max(1, Number(layer.canvas.height) || state.height || 1);
    return total + width * height * BYTES_PER_PIXEL;
  }, 0);
}

function calculateMemoryUsage() {
  const layersBytes = estimateLayerMemoryBytes();
  const historyBytes = estimateHistoryArrayBytes(historyStack);
  const redoBytes = estimateHistoryArrayBytes(redoStack);
  return {
    layersBytes,
    historyBytes,
    redoBytes,
    historyTotalBytes: historyBytes + redoBytes,
    totalBytes: layersBytes + historyBytes + redoBytes,
  };
}

function formatMemoryValue(bytes) {
  if (!Number.isFinite(bytes)) {
    return '--';
  }
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
}

function updateMemoryUsageDisplay() {
  if (!memoryUsageDisplay) {
    return;
  }
  const usage = calculateMemoryUsage();
  const historyLimitBytes = HISTORY_MEMORY_AUTO_LIMIT_BYTES;
  const text = `履歴 ${formatMemoryValue(usage.historyTotalBytes)} / ${HISTORY_MEMORY_AUTO_LIMIT_MB} MB (Undo ${formatMemoryValue(usage.historyBytes)}, Redo ${formatMemoryValue(usage.redoBytes)}, Layers ${formatMemoryValue(usage.layersBytes)})`;
  memoryUsageDisplay.textContent = text;
  memoryUsageDisplay.dataset.overBudget = usage.historyTotalBytes > historyLimitBytes ? 'true' : 'false';
}

function enforceHistoryMemoryBudget() {
  const limitBytes = HISTORY_MEMORY_AUTO_LIMIT_BYTES;
  if (!Number.isFinite(limitBytes) || limitBytes <= 0) {
    updateMemoryUsageDisplay();
    return;
  }

  let { historyTotalBytes } = calculateMemoryUsage();

  const removeFromRedo = () => {
    if (redoStack.length === 0) {
      return false;
    }
    const removed = redoStack.pop();
    historyTotalBytes = Math.max(0, historyTotalBytes - estimateSnapshotBytes(removed));
    return true;
  };

  const removeFromHistory = () => {
    if (historyStack.length <= 1) {
      return false;
    }
    const removed = historyStack.shift();
    historyTotalBytes = Math.max(0, historyTotalBytes - estimateSnapshotBytes(removed));
    return true;
  };

  while (historyTotalBytes > limitBytes && removeFromRedo()) {
    // continue trimming redo stack
  }
  while (historyTotalBytes > limitBytes && removeFromHistory()) {
    // continue trimming oldest history snapshots
  }

  updateUndoRedoUI();
  updateMemoryUsageDisplay();
}

function pushHistorySnapshot(snapshotOverride = null) {
  if (isRestoringState) {
    return snapshotOverride;
  }
  const snapshot = snapshotOverride || captureHistorySnapshot();
  historyStack.push(snapshot);
  redoStack.length = 0;
  trimHistoryStacks();
  updateUndoRedoUI();
  updateMemoryUsageDisplay();
  return snapshot;
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
  const snapshot = pushHistorySnapshot();
  saveCurrentFrame(snapshot);
  queueStateSave();
}

function applyHistorySnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.layers)) {
    return false;
  }
  const width = clamp(Number(snapshot.width) || state.width, Number(widthInput.min), Number(widthInput.max));
  const height = clamp(Number(snapshot.height) || state.height, Number(heightInput.min), Number(heightInput.max));
  if (pixelSizeInput) {
    const min = Number(pixelSizeInput.min) || pixelSizeMin;
    const max = Number(pixelSizeInput.max) || pixelSizeMax;
    const rawPixelSize = Number(snapshot.pixelSize);
    const resolved = clamp(Number.isFinite(rawPixelSize) ? rawPixelSize : state.pixelScale, min, max);
    pixelSizeInput.value = String(resolved);
    state.pixelScale = resolved;
  } else if (Number.isFinite(snapshot.pixelSize)) {
    state.pixelScale = Math.max(PIXEL_SIZE_MIN, snapshot.pixelSize);
  }

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
    updatePixelSizeConstraints();
    updatePixelSize({ skipComposite: true, preserveDimensions: true, skipSave: true });

    const snapshotColor = normalizeHex(snapshot.color || state.color);
    const snapshotAlpha = clamp(Number(snapshot.colorAlpha ?? state.colorAlpha ?? 1), 0, 1);
    state.colorAlpha = snapshotAlpha;
    state.color = snapshotColor;
    colorPicker.value = snapshotColor;
    setColorMode(snapshot.colorMode, { skipSave: true, force: true, rebuildPalette: false });
    if (Array.isArray(snapshot.palette) && snapshot.palette.length > 0) {
      initPalette(snapshot.palette, { activeColor: snapshotColor, activeAlpha: snapshotAlpha, skipSave: true });
    } else {
      setActiveColor(snapshotColor, null, { closePanel: false, alpha: snapshotAlpha });
      updatePaletteState({ skipSave: true, skipRecolor: true });
    }

    snapshot.layers.forEach((layerData) => {
      const layer = createLayer({
        name: typeof layerData?.name === 'string' ? layerData.name : `レイヤー${layersState.nextId}`,
        visible: layerData?.visible !== false,
        opacity: clamp(Number(layerData?.opacity ?? 1), 0, 1),
        insertAt: layersState.layers.length,
        imageSource: layerData?.imageData || null,
        indexSource:
          layerData?.indexBuffer instanceof Uint16Array
            ? layerData.indexBuffer
            : Array.isArray(layerData?.indexBuffer)
              ? Uint16Array.from(layerData.indexBuffer)
              : null,
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
  enforceHistoryMemoryBudget();
  updateMemoryUsageDisplay();
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
  updateMemoryUsageDisplay();
}

function performRedo() {
  if (redoStack.length === 0) {
    return;
  }
  const snapshot = redoStack.pop();
  historyStack.push(snapshot);
  trimHistoryStacks();
  applyHistorySnapshot(snapshot);
  updateMemoryUsageDisplay();
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

function createIndexBuffer(width, height, { source = null, fill = 0 } = {}) {
  const length = Math.max(0, Math.floor(width) * Math.floor(height));
  if (length <= 0) {
    return new Uint16Array(0);
  }
  if (source instanceof Uint16Array && source.length === length) {
    return source.slice();
  }
  if (Array.isArray(source) && source.length === length) {
    return Uint16Array.from(source);
  }
  const buffer = new Uint16Array(length);
  if (typeof fill === 'number' && fill !== 0) {
    buffer.fill(fill);
  }
  return buffer;
}

function createLayer({
  name,
  insertAt = 0,
  imageSource = null,
  indexSource = null,
  visible = true,
  opacity = 1,
} = {}) {
  const { canvas, ctx: layerCtx } = createOffscreenCanvas(state.width, state.height);
  if (imageSource instanceof HTMLCanvasElement || imageSource instanceof ImageBitmap) {
    layerCtx.drawImage(imageSource, 0, 0);
  } else if (imageSource instanceof ImageData) {
    layerCtx.putImageData(imageSource, 0, 0);
  }
  const indexBuffer = createIndexBuffer(state.width, state.height, { source: indexSource });
  const layer = {
    id: `layer-${layersState.nextId}`,
    name: name || `レイヤー${layersState.nextId}`,
    visible,
    opacity: clamp(Number(opacity) || 1, 0, 1),
    canvas,
    ctx: layerCtx,
    indexBuffer,
    hasContent: false,
  };
  layersState.nextId += 1;
  layer.hasContent = detectLayerHasContent(layer);
  if (layer.hasContent) {
    backfillLayerIndexBuffer(layer);
    redrawLayerFromIndexBuffer(layer);
  }
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
  syncFrameSnapshotsWithCurrentLayers();
  if (changed) {
    queueStateSave();
  }
}

function compositeLayers({ skipUIUpdate = false, skipContentCheck = false } = {}) {
  if (typeof window !== 'undefined' && compositeFrameId !== null) {
    window.cancelAnimationFrame(compositeFrameId);
  }
  compositeFrameId = null;
  compositeQueueOptions = null;
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

let compositeFrameId = null;
let compositeQueueOptions = null;

function queueCompositeLayers(options = {}) {
  const { skipUIUpdate = false, skipContentCheck = false } = options;
  if (!compositeQueueOptions) {
    compositeQueueOptions = { skipUIUpdate, skipContentCheck };
  } else {
    compositeQueueOptions.skipUIUpdate = compositeQueueOptions.skipUIUpdate && skipUIUpdate;
    compositeQueueOptions.skipContentCheck = compositeQueueOptions.skipContentCheck && skipContentCheck;
  }
  if (typeof window === 'undefined') {
    const opts = compositeQueueOptions || {};
    compositeQueueOptions = null;
    compositeLayers(opts);
    return;
  }
  if (compositeFrameId !== null) {
    return;
  }
  compositeFrameId = window.requestAnimationFrame(() => {
    const opts = compositeQueueOptions || {};
    compositeQueueOptions = null;
    compositeFrameId = null;
    compositeLayers(opts);
  });
}

function cancelActiveFloodFill() {
  if (!floodFillState.task) {
    return;
  }
  const { raf } = floodFillState.task;
  if (typeof window !== 'undefined' && raf !== null) {
    window.cancelAnimationFrame(raf);
  }
  floodFillState.task = null;
}

function processFloodFillChunk() {
  const task = floodFillState.task;
  if (!task) {
    return;
  }
  task.raf = null;
  const {
    stack,
    pixels,
    data,
    targetColor,
    fillColor,
    width,
    height,
    indexBuffer,
    paletteIndex,
  } = task;
  let iterations = 0;
  while (stack.length > 0 && iterations < FLOOD_FILL_BATCH_SIZE) {
    const cy = stack.pop();
    const cx = stack.pop();
    if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
      continue;
    }
    if (!isPixelSelected(cx, cy)) {
      continue;
    }
    const index = cy * width + cx;
    if (pixels[index] !== targetColor) {
      continue;
    }
    pixels[index] = fillColor;
    if (indexBuffer && paletteIndex !== undefined) {
      indexBuffer[index] = paletteIndex;
    }
    iterations += 1;
    if (!task.changed) {
      markHistoryDirty();
      task.changed = true;
    }
    stack.push(cx + 1, cy);
    stack.push(cx - 1, cy);
    stack.push(cx, cy + 1);
    stack.push(cx, cy - 1);
  }

  if (stack.length > 0) {
    if (typeof window !== 'undefined') {
      task.raf = window.requestAnimationFrame(processFloodFillChunk);
    } else {
      processFloodFillChunk();
    }
    return;
  }

  floodFillState.task = null;
  try {
    if (task.changed) {
      task.layerCtx.putImageData(task.imageData, 0, 0);
      queueCompositeLayers();
      finalizeHistoryEntry();
    }
  } catch (error) {
    console.warn('塗りつぶし結果の適用に失敗しました', error);
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
  initFrames();
  const activeLayer = getActiveLayer();
  const activeFrame = getFrameById(framesState.activeId);
  const layerName = activeLayer ? activeLayer.name : 'レイヤーなし';
  const statusText = activeFrame ? `${activeFrame.name} · ${layerName}` : layerName;
  layerDockStatusText.textContent = statusText;
  if (layerDockStatusButton) {
    layerDockStatusButton.title = statusText;
  }
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
  saveCurrentFrame();
  syncFrameSnapshotsWithCurrentLayers();
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
  syncFrameSnapshotsWithCurrentLayers();
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
  syncFrameSnapshotsWithCurrentLayers();
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
  syncFrameSnapshotsWithCurrentLayers();
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
  syncFrameSnapshotsWithCurrentLayers();
  renderLayerList();
  updateLayerDockStatus();
  compositeLayers();
  finalizeHistoryEntry();
}

function renderLayerList() {
  if (!layerListElement) {
    return;
  }
  initFrames();
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
      event.preventDefault();
      event.stopPropagation();
      toggleLayerVisibility(layer.id);
    });
    visibilityButton.addEventListener('contextmenu', (event) => {
      event.preventDefault();
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

    const timeline = document.createElement('div');
    timeline.className = 'layer-item__timeline';
    timeline.setAttribute('role', 'group');
    timeline.addEventListener('scroll', handleLayerTimelineScroll);
    framesState.frames.forEach((frame, index) => {
      const frameButton = document.createElement('button');
      frameButton.type = 'button';
      frameButton.className = 'layer-item__frame';
      frameButton.dataset.frameId = frame.id;
      frameButton.textContent = String(index + 1);
      if (frame.id === framesState.activeId) {
        frameButton.dataset.active = 'true';
      }
      const filled = frame.layerContent?.get(layer.id) || false;
      frameButton.dataset.filled = filled ? 'true' : 'false';
      frameButton.title = frame.name;
      timeline.appendChild(frameButton);
    });
    const timelineAddButton = document.createElement('button');
    timelineAddButton.type = 'button';
    timelineAddButton.className = 'layer-item__frame layer-item__frame--add';
    timelineAddButton.dataset.action = 'add';
    timelineAddButton.textContent = '+';
    timelineAddButton.title = 'フレームを追加 (Shift+クリックで空のフレーム)';
    timeline.appendChild(timelineAddButton);
    timeline.addEventListener('click', (event) => {
      const target = event.target instanceof HTMLElement ? event.target.closest('.layer-item__frame') : null;
      if (!target) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (target.dataset.action === 'add') {
        addFrame({ duplicate: !event.shiftKey });
        return;
      }
      const frameId = target.dataset.frameId;
      if (!frameId) {
        return;
      }
      selectLayer(layer.id);
      selectFrame(frameId);
    });
    if (!layerTimelineScrollInitialized && layer === layersForDisplay[0]) {
      window.requestAnimationFrame(() => {
        const activeFrameButton = timeline.querySelector('[data-frame-id][data-active="true"]');
        if (activeFrameButton && timeline instanceof HTMLElement) {
          const targetLeft = activeFrameButton.offsetLeft - timeline.clientWidth / 2 + activeFrameButton.offsetWidth / 2;
          layerTimelineScrollLeft = Math.max(0, targetLeft);
        } else {
          layerTimelineScrollLeft = timeline.scrollLeft;
        }
        layerTimelineScrollInitialized = true;
        syncLayerTimelineScroll();
      });
    } else if (layerTimelineScrollInitialized) {
      timeline.scrollLeft = layerTimelineScrollLeft;
    }
    item.appendChild(timeline);

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
  updatePlaybackUI();
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

function syncLayerTimelineScroll(source = null) {
  if (!layerListElement) {
    return;
  }
  isSyncingLayerTimelineScroll = true;
  const timelines = layerListElement.querySelectorAll('.layer-item__timeline');
  timelines.forEach((timeline) => {
    if (!(timeline instanceof HTMLElement)) {
      return;
    }
    if (source && timeline === source) {
      return;
    }
    timeline.scrollLeft = layerTimelineScrollLeft;
  });
  isSyncingLayerTimelineScroll = false;
}

function handleLayerTimelineScroll(event) {
  if (!layerListElement) {
    return;
  }
  if (isSyncingLayerTimelineScroll) {
    return;
  }
  const target = event.currentTarget;
  if (!(target instanceof HTMLElement)) {
    return;
  }
  layerTimelineScrollLeft = target.scrollLeft;
  layerTimelineScrollInitialized = true;
  syncLayerTimelineScroll(target);
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

  const availableItems = items.filter((item) => item.dataset.layerId !== layerDragState.draggingId);
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
  if (!dropBeforeId && availableItems.length > 0) {
    const firstItem = availableItems[0];
    if (firstItem) {
      const firstRect = firstItem.getBoundingClientRect();
      if (event.clientY < firstRect.top) {
        dropBeforeId = firstItem.dataset.layerId || null;
        if (dropBeforeId) {
          firstItem.classList.add('layer-item--dragover');
          layerListElement.classList.remove('layer-dock__list--drop-after');
          layerDragState.dropBeforeId = dropBeforeId;
          return;
        }
      }
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
    targetIndex = beforeIndex === -1 ? layersState.layers.length : beforeIndex;
  } else {
    targetIndex = layersState.layers.length;
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
  if (shapeState.active) {
    cancelShapeDrawing();
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
  cancelActiveFloodFill();
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

const MAX_PALETTE_COLORS = 256;
const TRANSPARENT_COLOR_HEX = '#000000';

function isTransparentPaletteEntry(entry) {
  if (!entry) {
    return false;
  }
  const alphaByte = typeof entry.storedAlphaByte === 'number' ? entry.storedAlphaByte : Math.round((entry.alpha ?? 0) * 255);
  return alphaByte <= 0;
}

function getExistingTransparentEntry(paletteEntries = state.palette) {
  if (!Array.isArray(paletteEntries)) {
    return null;
  }
  const found = paletteEntries.find(isTransparentPaletteEntry);
  return found ? { ...found } : null;
}

function createTransparentPaletteEntry() {
  const existing = getExistingTransparentEntry();
  if (existing) {
    return existing;
  }
  return {
    color: TRANSPARENT_COLOR_HEX,
    alpha: 0,
    storedUint32: 0,
    storedAlphaByte: 0,
  };
}

function applyCanvasDisplaySize() {
  const displayWidth = state.width * state.pixelSize;
  const displayHeight = state.height * state.pixelSize;
  pixelCanvas.style.width = `${displayWidth}px`;
  pixelCanvas.style.height = `${displayHeight}px`;
  if (canvasStage) {
    canvasStage.style.width = `${displayWidth}px`;
    canvasStage.style.height = `${displayHeight}px`;
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
  const cursorCompensation = state.zoom > 0 ? 1 / state.zoom : 1;
  canvasStage.style.setProperty('--cursor-compensation', String(cursorCompensation));
  updateVirtualCursorVisualPosition();
  renderSelectionOverlay();
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

  virtualCursorPreviewCanvas = ensureCanvas(virtualCursorPreviewCanvas, 'selection-canvas selection-canvas--preview');
  shapePreviewCanvas = ensureCanvas(shapePreviewCanvas, 'selection-canvas selection-canvas--shape');
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

  resizeCanvas(virtualCursorPreviewCanvas, (ctx) => {
    virtualCursorPreviewCtx = ctx;
  });
  resizeCanvas(shapePreviewCanvas, (ctx) => {
    shapePreviewCtx = ctx;
  });
  resizeCanvas(selectionContentCanvas, (ctx) => {
    selectionContentCtx = ctx;
  });
  resizeCanvas(selectionOutlineCanvas, (ctx) => {
    selectionOutlineCtx = ctx;
  });

  canvasStage.appendChild(virtualCursorPreviewCanvas);
  canvasStage.appendChild(shapePreviewCanvas);
  canvasStage.appendChild(selectionContentCanvas);
  canvasStage.appendChild(selectionOutlineCanvas);

  renderSelectionOverlay();
  refreshSelectionContentPreview();
  refreshVirtualCursorPreview();
  renderShapePreview();
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
  selectionState.moveIndexBuffer = null;
  selectionState.moveLayerId = null;
  selectionState.moveInitialBounds = null;
  selectionState.pendingClearClick = null;
  selectionState.pendingClearMoved = false;
  releaseSelectionCapture();
  stopSelectionAnimation();
  clearSelectionContentCanvas();
  if (!silent) {
    renderSelectionOverlay();
  }
  refreshHoverPreviews();
}

function setSelectionMask(mask, bounds) {
  selectionState.mask = mask;
  selectionState.bounds = bounds;
  selectionState.active = Boolean(mask && bounds);
  renderSelectionOverlay();
  refreshHoverPreviews();
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
  const pushHorizontalRun = (row, startX, endX, isTopEdge) => {
    const baseY = isTopEdge ? row * pixelSize + half : (row + 1) * pixelSize - half;
    const left = startX * pixelSize + half;
    const right = (endX + 1) * pixelSize - half;
    pushSegment(left, baseY, right, baseY);
  };
  const pushVerticalRun = (column, startY, endY, isLeftEdge) => {
    const baseX = isLeftEdge ? column * pixelSize + half : (column + 1) * pixelSize - half;
    const top = startY * pixelSize + half;
    const bottom = (endY + 1) * pixelSize - half;
    pushSegment(baseX, top, baseX, bottom);
  };
  for (let y = minY; y <= maxY; y += 1) {
    let x = minX;
    while (x <= maxX) {
      const index = y * width + x;
      if (!mask[index]) {
        x += 1;
        continue;
      }
      const upEmpty = y === 0 || !mask[index - width];
      if (!upEmpty) {
        x += 1;
        continue;
      }
      let runEnd = x;
      while (runEnd + 1 <= maxX) {
        const nextIndex = y * width + runEnd + 1;
        if (!mask[nextIndex]) {
          break;
        }
        const nextUpEmpty = y === 0 || !mask[nextIndex - width];
        if (!nextUpEmpty) {
          break;
        }
        runEnd += 1;
      }
      pushHorizontalRun(y, x, runEnd, true);
      x = runEnd + 1;
    }
  }
  for (let y = minY; y <= maxY; y += 1) {
    let x = minX;
    while (x <= maxX) {
      const index = y * width + x;
      if (!mask[index]) {
        x += 1;
        continue;
      }
      const downEmpty = y === height - 1 || !mask[index + width];
      if (!downEmpty) {
        x += 1;
        continue;
      }
      let runEnd = x;
      while (runEnd + 1 <= maxX) {
        const nextIndex = y * width + runEnd + 1;
        if (!mask[nextIndex]) {
          break;
        }
        const nextDownEmpty = y === height - 1 || !mask[nextIndex + width];
        if (!nextDownEmpty) {
          break;
        }
        runEnd += 1;
      }
      pushHorizontalRun(y, x, runEnd, false);
      x = runEnd + 1;
    }
  }
  for (let x = minX; x <= maxX; x += 1) {
    let y = minY;
    while (y <= maxY) {
      const index = y * width + x;
      if (!mask[index]) {
        y += 1;
        continue;
      }
      const leftEmpty = x === 0 || !mask[index - 1];
      if (!leftEmpty) {
        y += 1;
        continue;
      }
      let runEnd = y;
      while (runEnd + 1 <= maxY) {
        const nextIndex = (runEnd + 1) * width + x;
        if (!mask[nextIndex]) {
          break;
        }
        const nextLeftEmpty = x === 0 || !mask[nextIndex - 1];
        if (!nextLeftEmpty) {
          break;
        }
        runEnd += 1;
      }
      pushVerticalRun(x, y, runEnd, true);
      y = runEnd + 1;
    }
  }
  for (let x = minX; x <= maxX; x += 1) {
    let y = minY;
    while (y <= maxY) {
      const index = y * width + x;
      if (!mask[index]) {
        y += 1;
        continue;
      }
      const rightEmpty = x === width - 1 || !mask[index + 1];
      if (!rightEmpty) {
        y += 1;
        continue;
      }
      let runEnd = y;
      while (runEnd + 1 <= maxY) {
        const nextIndex = (runEnd + 1) * width + x;
        if (!mask[nextIndex]) {
          break;
        }
        const nextRightEmpty = x === width - 1 || !mask[nextIndex + 1];
        if (!nextRightEmpty) {
          break;
        }
        runEnd += 1;
      }
      pushVerticalRun(x, y, runEnd, false);
      y = runEnd + 1;
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

function getPreviewLayerMap(layerName) {
  if (!previewOverlayState.layers[layerName]) {
    previewOverlayState.layers[layerName] = new Map();
  }
  return previewOverlayState.layers[layerName];
}

function drawPreviewLayer(layerName) {
  if (!virtualCursorPreviewCtx || !virtualCursorPreviewCanvas) {
    return;
  }
  const layer = getPreviewLayerMap(layerName);
  if (!layer || layer.size === 0) {
    return;
  }
  const pixelSize = state.pixelSize;
  for (const [key, color] of layer.entries()) {
    const [pxStr, pyStr] = key.split(',');
    const px = Number(pxStr);
    const py = Number(pyStr);
    if (!Number.isFinite(px) || !Number.isFinite(py)) {
      continue;
    }
    virtualCursorPreviewCtx.fillStyle = color;
    virtualCursorPreviewCtx.fillRect(px * pixelSize, py * pixelSize, pixelSize, pixelSize);
  }
}

function renderPreviewOverlay() {
  if (!virtualCursorPreviewCtx || !virtualCursorPreviewCanvas) {
    initSelectionOverlay();
  }
  if (!virtualCursorPreviewCtx || !virtualCursorPreviewCanvas) {
    return;
  }
  virtualCursorPreviewCtx.clearRect(0, 0, virtualCursorPreviewCanvas.width, virtualCursorPreviewCanvas.height);
  for (const layerName of PREVIEW_LAYER_ORDER) {
    drawPreviewLayer(layerName);
  }
}

function reapplyHoverAndPointerPreviews() {
  if (!virtualCursorPreviewCtx || !virtualCursorPreviewCanvas) {
    return;
  }
  drawPreviewLayer('virtualHover');
  drawPreviewLayer('pointer');
}

function clearVirtualCursorPreview(options = {}) {
  const { includeHover = true, includePointer = false } = options;
  const strokeLayer = getPreviewLayerMap('virtualStroke');
  if (strokeLayer.size > 0) {
    strokeLayer.clear();
  }
  if (includeHover) {
    const hoverLayer = getPreviewLayerMap('virtualHover');
    if (hoverLayer.size > 0) {
      hoverLayer.clear();
    }
  }
  if (includePointer) {
    const pointerLayer = getPreviewLayerMap('pointer');
    if (pointerLayer.size > 0) {
      pointerLayer.clear();
    }
  }
  renderPreviewOverlay();
}

function refreshVirtualCursorPreview() {
  renderPreviewOverlay();
}

function addVirtualCursorPreviewPixel(px, py, color, options = {}) {
  if (!virtualCursorPreviewCtx || !virtualCursorPreviewCanvas) {
    initSelectionOverlay();
  }
  if (!virtualCursorPreviewCtx || !virtualCursorPreviewCanvas) {
    return false;
  }
  const { deferOverlayUpdate = false } = options;
  const layer = getPreviewLayerMap('virtualStroke');
  const key = `${px},${py}`;
  if (layer.has(key)) {
    return false;
  }
  layer.set(key, color);
  const pixelSize = state.pixelSize;
  virtualCursorPreviewCtx.fillStyle = color;
  virtualCursorPreviewCtx.fillRect(px * pixelSize, py * pixelSize, pixelSize, pixelSize);
  if (!deferOverlayUpdate) {
    reapplyHoverAndPointerPreviews();
  }
  return true;
}

function drawBrushPreview(x, y) {
  if (!virtualCursorPreviewCtx) {
    initSelectionOverlay();
  }
  if (!virtualCursorPreviewCtx) {
    return;
  }
  const color = colorToCss(state.color, state.colorAlpha);
  let applied = false;
  applyBrush(x, y, (px, py) => {
    const added = addVirtualCursorPreviewPixel(px, py, color, { deferOverlayUpdate: true });
    applied = added || applied;
  });
  if (applied) {
    reapplyHoverAndPointerPreviews();
  }
}

function beginVirtualCursorPreviewStroke(x, y) {
  const strokeLayer = getPreviewLayerMap('virtualStroke');
  if (strokeLayer.size > 0) {
    strokeLayer.clear();
  }
  const hoverLayer = getPreviewLayerMap('virtualHover');
  if (hoverLayer.size > 0) {
    hoverLayer.clear();
  }
  renderPreviewOverlay();
  drawBrushPreview(x, y);
}

function extendVirtualCursorPreviewPoint(x, y) {
  drawBrushPreview(x, y);
}

function drawVirtualCursorPreviewLine(x0, y0, x1, y1) {
  drawLinePixels(x0, y0, x1, y1, (px, py) => {
    drawBrushPreview(px, py);
  });
}

function clearPointerPreview() {
  const pointerLayer = getPreviewLayerMap('pointer');
  if (pointerLayer.size === 0) {
    return;
  }
  pointerLayer.clear();
  renderPreviewOverlay();
}

function applyPointerHoverPreview() {
  if (!pointerHoverState.active || !isBrushTool(state.tool)) {
    clearPointerPreview();
    return;
  }
  if (!virtualCursorPreviewCtx || !virtualCursorPreviewCanvas) {
    initSelectionOverlay();
  }
  const pointerLayer = getPreviewLayerMap('pointer');
  pointerLayer.clear();
  const color = colorToCss(state.color, state.colorAlpha);
  applyBrush(pointerHoverState.x, pointerHoverState.y, (px, py) => {
    pointerLayer.set(`${px},${py}`, color);
  });
  renderPreviewOverlay();
}

function updatePointerHoverPreviewFromState() {
  if (!pointerHoverState.active) {
    clearPointerPreview();
    return;
  }
  applyPointerHoverPreview();
}

function updatePointerHoverPreviewFromEvent(event, position = null) {
  const pointerLayer = getPreviewLayerMap('pointer');
  const pointerType = event.pointerType;
  const isMouseLike = pointerType === 'mouse' || pointerType === 'pen';
  if (!isMouseLike) {
    if (pointerHoverState.active || pointerLayer.size > 0) {
      pointerHoverState.active = false;
      pointerHoverState.x = null;
      pointerHoverState.y = null;
      pointerHoverState.pointerType = null;
      clearPointerPreview();
    }
    return;
  }
  if (!isBrushTool(state.tool) || panState.active || shapeState.active || selectionState.isMoving || selectionState.isDragging) {
    if (pointerHoverState.active || pointerLayer.size > 0) {
      pointerHoverState.active = false;
      pointerHoverState.x = null;
      pointerHoverState.y = null;
      pointerHoverState.pointerType = null;
      clearPointerPreview();
    }
    return;
  }
  if (isDrawing) {
    if (pointerHoverState.active || pointerLayer.size > 0) {
      pointerHoverState.active = false;
      pointerHoverState.x = null;
      pointerHoverState.y = null;
      pointerHoverState.pointerType = null;
      clearPointerPreview();
    }
    return;
  }
  const buttons = typeof event.buttons === 'number' ? event.buttons : 0;
  if (buttons !== 0) {
    if (pointerHoverState.active || pointerLayer.size > 0) {
      pointerHoverState.active = false;
      pointerHoverState.x = null;
      pointerHoverState.y = null;
      pointerHoverState.pointerType = null;
      clearPointerPreview();
    }
    return;
  }
  const pos = position || getPointerPosition(event);
  if (!pos.inBounds) {
    if (pointerHoverState.active || pointerLayer.size > 0) {
      pointerHoverState.active = false;
      pointerHoverState.x = null;
      pointerHoverState.y = null;
      pointerHoverState.pointerType = null;
      clearPointerPreview();
    }
    return;
  }
  pointerHoverState.active = true;
  pointerHoverState.x = pos.x;
  pointerHoverState.y = pos.y;
  pointerHoverState.pointerType = pointerType;
  applyPointerHoverPreview();
}

function updateVirtualCursorHoverPreview() {
  const hoverLayer = getPreviewLayerMap('virtualHover');
  if (!virtualCursorState.enabled || virtualCursorState.drawActive || isDrawing || !isBrushTool(state.tool)) {
    if (hoverLayer.size > 0) {
      hoverLayer.clear();
      renderPreviewOverlay();
    }
    return;
  }
  const { x, y } = virtualCursorState;
  hoverLayer.clear();
  const color = colorToCss(state.color, state.colorAlpha);
  applyBrush(x, y, (px, py) => {
    hoverLayer.set(`${px},${py}`, color);
  });
  renderPreviewOverlay();
}

function refreshHoverPreviews() {
  updatePointerHoverPreviewFromState();
  updateVirtualCursorHoverPreview();
}

function hideCanvasCursor() {
  if (!pixelCanvas || HAS_TOUCH_SUPPORT) {
    return;
  }
  if (canvasCursorHidden) {
    return;
  }
  pixelCanvas.style.cursor = CANVAS_CURSOR_HIDDEN;
  canvasCursorHidden = true;
}

function showCanvasCursor() {
  if (!pixelCanvas || HAS_TOUCH_SUPPORT) {
    return;
  }
  pixelCanvas.style.cursor = CANVAS_CURSOR_VISIBLE;
  canvasCursorHidden = false;
}

function setDesktopVirtualCursorActive(active) {
  if (HAS_TOUCH_SUPPORT) {
    return;
  }
  const nextActive = Boolean(active);
  if (desktopVirtualCursorActive === nextActive) {
    return;
  }
  desktopVirtualCursorActive = nextActive;
  if (virtualCursorElement) {
    const shouldShow = virtualCursorState.enabled && desktopVirtualCursorActive;
    virtualCursorElement.dataset.visible = shouldShow ? 'true' : 'false';
  }
}

function setVirtualCursorVisualCoordinates(canvasX, canvasY) {
  if (!virtualCursorState.enabled) {
    return;
  }
  const visualX = Number.isFinite(canvasX) ? clamp(canvasX, 0, state.width) : virtualCursorState.x + 0.5;
  const visualY = Number.isFinite(canvasY) ? clamp(canvasY, 0, state.height) : virtualCursorState.y + 0.5;
  virtualCursorState.visualX = visualX;
  virtualCursorState.visualY = visualY;
  updateVirtualCursorVisualPosition();
}

function resolveToolIcon(tool) {
  const button = toolButtons.find((entry) => entry.dataset.tool === tool);
  if (button) {
    const icon = button.dataset.icon || button.querySelector('img')?.getAttribute('src');
    if (icon) {
      return icon;
    }
  }
  return DEFAULT_CURSOR_ICON;
}

function updateVirtualCursorIcon(tool = state.tool) {
  if (!virtualCursorIconElement) {
    return;
  }
  const iconSrc = resolveToolIcon(tool);
  if (!iconSrc) {
    return;
  }
  if (virtualCursorIconElement.src !== iconSrc) {
    virtualCursorIconElement.src = iconSrc;
  }
}

function temporarilyDisableVirtualCursorForZoom() {
  if (!HAS_TOUCH_SUPPORT) {
    return;
  }
  if (!virtualCursorState.enabled || virtualCursorState.zoomTemporarilyDisabled) {
    return;
  }
  virtualCursorState.zoomTemporarilyDisabled = true;
  setVirtualCursorEnabled(false, { temporary: true });
}

function restoreVirtualCursorAfterZoom() {
  if (!HAS_TOUCH_SUPPORT) {
    return;
  }
  if (!virtualCursorState.zoomTemporarilyDisabled) {
    return;
  }
  virtualCursorState.zoomTemporarilyDisabled = false;
  if (virtualCursorState.preferredEnabled) {
    setVirtualCursorEnabled(true, { temporary: true });
  }
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

function clearShapePreview() {
  if (!shapePreviewCtx || !shapePreviewCanvas) {
    return;
  }
  shapePreviewCtx.clearRect(0, 0, shapePreviewCanvas.width, shapePreviewCanvas.height);
}

function renderShapePreview() {
  if (!shapePreviewCtx) {
    initSelectionOverlay();
  }
  if (!shapePreviewCtx || !shapeState.active) {
    clearShapePreview();
    return;
  }
  if (shapeState.tool === 'shapeCurve') {
    renderCurvePreview();
    return;
  }
  if (!shapeState.start || !shapeState.current) {
    clearShapePreview();
    return;
  }
  const pixels = collectShapePixels(shapeState.tool, shapeState.start, shapeState.current);
  clearShapePreview();
  if (!pixels || pixels.size === 0) {
    return;
  }
  const pixelSize = state.pixelSize;
  const baseColor = shapeState.color || state.color;
  const alpha = shapeState.alpha ?? state.colorAlpha;
  const color = colorToCss(baseColor, alpha);
  shapePreviewCtx.save();
  shapePreviewCtx.globalAlpha = 0.85;
  shapePreviewCtx.fillStyle = color;
  for (const key of pixels) {
    const [pxStr, pyStr] = key.split(',');
    const px = Number(pxStr);
    const py = Number(pyStr);
    if (!Number.isFinite(px) || !Number.isFinite(py)) {
      continue;
    }
    shapePreviewCtx.fillRect(px * pixelSize, py * pixelSize, pixelSize, pixelSize);
  }
  shapePreviewCtx.restore();
}

function renderCurvePreview() {
  if (!shapePreviewCtx) {
    return;
  }
  const curve = shapeState.curve;
  if (!curve || !curve.lineStart || !curve.lineEnd) {
    clearShapePreview();
    return;
  }
  const pixels = collectCurvePixelsForPreview(curve, { usePreviewControls: true });
  clearShapePreview();
  if (!pixels || pixels.size === 0) {
    return;
  }
  const pixelSize = state.pixelSize;
  const baseColor = shapeState.color || state.color;
  const alpha = shapeState.alpha ?? state.colorAlpha;
  const color = colorToCss(baseColor, alpha);
  shapePreviewCtx.save();
  shapePreviewCtx.globalAlpha = 0.85;
  shapePreviewCtx.fillStyle = color;
  for (const key of pixels) {
    const [pxStr, pyStr] = key.split(',');
    const px = Number(pxStr);
    const py = Number(pyStr);
    if (!Number.isFinite(px) || !Number.isFinite(py)) {
      continue;
    }
    shapePreviewCtx.fillRect(px * pixelSize, py * pixelSize, pixelSize, pixelSize);
  }
  shapePreviewCtx.restore();
}

function releaseShapeCapture() {
  if (
    shapeState.captureTarget &&
    shapeState.pointerId !== null &&
    typeof shapeState.captureTarget.releasePointerCapture === 'function'
  ) {
    try {
      shapeState.captureTarget.releasePointerCapture(shapeState.pointerId);
    } catch (_) {
      // ignore
    }
  }
  shapeState.captureTarget = null;
  shapeState.pointerId = null;
}

function resetShapeState() {
  shapeState.active = false;
  shapeState.tool = null;
  shapeState.pointerId = null;
  shapeState.start = null;
  shapeState.current = null;
  shapeState.color = null;
  shapeState.alpha = null;
  shapeState.captureTarget = null;
  shapeState.curve = null;
}

function beginShapeDrawing(x, y, pointerId, target) {
  if (!isShapeTool(state.tool)) {
    return false;
  }
  if (state.tool === 'shapeCurve' && shapeState.active && shapeState.curve) {
    return beginCurveControlStage(x, y, pointerId, target);
  }
  const maxX = Math.max(0, state.width - 1);
  const maxY = Math.max(0, state.height - 1);
  const clampedX = clamp(x, 0, maxX);
  const clampedY = clamp(y, 0, maxY);
  shapeState.active = true;
  shapeState.tool = state.tool;
  shapeState.pointerId = pointerId;
  shapeState.start = { x: clampedX, y: clampedY };
  shapeState.current = { x: clampedX, y: clampedY };
  shapeState.color = state.color;
  shapeState.alpha = state.colorAlpha;
  shapeState.captureTarget = target;
  if (state.tool === 'shapeCurve') {
    shapeState.curve = {
      stage: 'lineDrawing',
      lineStart: { x: clampedX, y: clampedY },
      lineEnd: { x: clampedX, y: clampedY },
      control1: null,
      control2: null,
      previewControl1: null,
      previewControl2: null,
    };
  } else {
    shapeState.curve = null;
  }
  if (target && typeof target.setPointerCapture === 'function') {
    try {
      target.setPointerCapture(pointerId);
    } catch (_) {
      shapeState.captureTarget = null;
    }
  }
  renderShapePreview();
  return true;
}

function beginCurveControlStage(x, y, pointerId, target) {
  const curve = shapeState.curve;
  if (!curve) {
    resetShapeState();
    return beginShapeDrawing(x, y, pointerId, target);
  }
  const maxX = Math.max(0, state.width - 1);
  const maxY = Math.max(0, state.height - 1);
  const clampedX = clamp(x, 0, maxX);
  const clampedY = clamp(y, 0, maxY);
  if (curve.stage === 'control1Pending') {
    shapeState.pointerId = pointerId;
    shapeState.captureTarget = target;
    shapeState.start = { ...curve.lineStart };
    shapeState.current = { x: clampedX, y: clampedY };
    curve.stage = 'control1Active';
    curve.previewControl1 = { x: clampedX, y: clampedY };
    curve.previewControl2 = { x: clampedX, y: clampedY };
  } else if (curve.stage === 'control2Pending') {
    shapeState.pointerId = pointerId;
    shapeState.captureTarget = target;
    shapeState.start = { ...curve.lineStart };
    shapeState.current = { x: clampedX, y: clampedY };
    curve.stage = 'control2Active';
    curve.previewControl1 = curve.control1 ? { ...curve.control1 } : curve.previewControl1;
    curve.previewControl2 = { x: clampedX, y: clampedY };
  } else {
    resetShapeState();
    return beginShapeDrawing(x, y, pointerId, target);
  }
  if (target && typeof target.setPointerCapture === 'function') {
    try {
      target.setPointerCapture(pointerId);
    } catch (_) {
      shapeState.captureTarget = null;
    }
  }
  renderShapePreview();
  return true;
}

function updateShapeDrawing(x, y) {
  if (!shapeState.active || shapeState.pointerId === null) {
    return;
  }
  const maxX = Math.max(0, state.width - 1);
  const maxY = Math.max(0, state.height - 1);
  const clampedX = clamp(x, 0, maxX);
  const clampedY = clamp(y, 0, maxY);
  if (shapeState.tool === 'shapeCurve' && shapeState.curve) {
    updateCurveDrawing(clampedX, clampedY);
    return;
  }
  if (shapeState.current && shapeState.current.x === clampedX && shapeState.current.y === clampedY) {
    return;
  }
  shapeState.current = { x: clampedX, y: clampedY };
  renderShapePreview();
}

function updateCurveDrawing(x, y) {
  const curve = shapeState.curve;
  if (!curve) {
    return;
  }
  if (curve.stage === 'lineDrawing') {
    if (curve.lineEnd && curve.lineEnd.x === x && curve.lineEnd.y === y) {
      return;
    }
    shapeState.current = { x, y };
    curve.lineEnd = { x, y };
    curve.previewControl1 = null;
    curve.previewControl2 = null;
  } else if (curve.stage === 'control1Active') {
    if (shapeState.current && shapeState.current.x === x && shapeState.current.y === y) {
      return;
    }
    shapeState.current = { x, y };
    curve.previewControl1 = { x, y };
    curve.previewControl2 = { x, y };
  } else if (curve.stage === 'control2Active') {
    if (shapeState.current && shapeState.current.x === x && shapeState.current.y === y) {
      return;
    }
    shapeState.current = { x, y };
    curve.previewControl2 = { x, y };
  } else {
    if (shapeState.current && shapeState.current.x === x && shapeState.current.y === y) {
      return;
    }
    shapeState.current = { x, y };
  }
  renderShapePreview();
}

function finalizeShapeDrawing() {
  if (!shapeState.active) {
    cancelShapeDrawing();
    return false;
  }
  if (shapeState.tool === 'shapeCurve') {
    return finalizeCurveDrawing();
  }
  if (!shapeState.start || !shapeState.current) {
    cancelShapeDrawing();
    return false;
  }
  const pixels = collectShapePixels(shapeState.tool, shapeState.start, shapeState.current);
  clearShapePreview();
  releaseShapeCapture();
  const baseColor = shapeState.color || state.color;
  const alpha = shapeState.alpha ?? state.colorAlpha;
  const colorCss = colorToCss(baseColor, alpha);
  resetShapeState();
  if (!pixels || pixels.size === 0) {
    return false;
  }
  const applied = applyShapePixelsToLayer(pixels, colorCss);
  if (!applied) {
    return false;
  }
  markHistoryDirty();
  queueCompositeLayers();
  finalizeHistoryEntry();
  return true;
}

function cancelShapeDrawing() {
  if (!shapeState.active) {
    return;
  }
  clearShapePreview();
  releaseShapeCapture();
  resetShapeState();
  renderShapePreview();
}

function finalizeCurveDrawing() {
  const curve = shapeState.curve;
  if (!curve || !curve.lineStart || !curve.lineEnd) {
    cancelShapeDrawing();
    return false;
  }
  if (curve.stage === 'lineDrawing') {
    curve.lineStart = { ...shapeState.start };
    curve.lineEnd = { ...shapeState.current };
    curve.previewControl1 = null;
    curve.previewControl2 = null;
    curve.stage = 'control1Pending';
    releaseShapeCapture();
    shapeState.pointerId = null;
    shapeState.captureTarget = null;
    shapeState.start = { ...curve.lineStart };
    shapeState.current = { ...curve.lineEnd };
    renderShapePreview();
    return false;
  }
  if (curve.stage === 'control1Active') {
    const controlPoint = shapeState.current
      ? { ...shapeState.current }
      : curve.previewControl1 || curve.control1 || { ...curve.lineStart };
    curve.control1 = { ...controlPoint };
    curve.previewControl1 = { ...controlPoint };
    if (!curve.control2) {
      curve.control2 = { ...controlPoint };
    }
    if (!curve.previewControl2) {
      curve.previewControl2 = { ...curve.control2 };
    }
    curve.stage = 'control2Pending';
    releaseShapeCapture();
    shapeState.pointerId = null;
    shapeState.captureTarget = null;
    renderShapePreview();
    return false;
  }
  if (curve.stage === 'control2Active') {
    const controlPoint = shapeState.current
      ? { ...shapeState.current }
      : curve.previewControl2 || curve.control2 || curve.control1 || { ...curve.lineEnd };
    curve.control2 = { ...controlPoint };
    curve.previewControl2 = { ...controlPoint };
    releaseShapeCapture();
    const pixels = collectCurvePixelsForPreview(curve, { usePreviewControls: false });
    clearShapePreview();
    const baseColor = shapeState.color || state.color;
    const alpha = shapeState.alpha ?? state.colorAlpha;
    const colorCss = colorToCss(baseColor, alpha);
    resetShapeState();
    if (!pixels || pixels.size === 0) {
      return false;
    }
    const applied = applyShapePixelsToLayer(pixels, colorCss);
    if (!applied) {
      return false;
    }
    markHistoryDirty();
    queueCompositeLayers();
    finalizeHistoryEntry();
    return true;
  }
  if (curve.stage === 'control1Pending' || curve.stage === 'control2Pending') {
    // No active pointer; nothing to finalize yet.
    return false;
  }
  cancelShapeDrawing();
  return false;
}

function addShapePixel(pixels, x, y) {
  const ix = Math.round(x);
  const iy = Math.round(y);
  if (!Number.isFinite(ix) || !Number.isFinite(iy)) {
    return;
  }
  if (ix < 0 || ix >= state.width || iy < 0 || iy >= state.height) {
    return;
  }
  pixels.add(`${ix},${iy}`);
}

function plotCirclePoints(cx, cy, x, y, add) {
  add(cx + x, cy + y);
  add(cx - x, cy + y);
  add(cx + x, cy - y);
  add(cx - x, cy - y);
  add(cx + y, cy + x);
  add(cx - y, cy + x);
  add(cx + y, cy - x);
  add(cx - y, cy - x);
}

function collectCircleOutlinePixels(cx, cy, radius, add) {
  if (radius <= 0) {
    add(cx, cy);
    return;
  }
  let x = radius;
  let y = 0;
  let decision = 1 - radius;
  while (y <= x) {
    plotCirclePoints(cx, cy, x, y, add);
    y += 1;
    if (decision <= 0) {
      decision += 2 * y + 1;
    } else {
      x -= 1;
      decision += 2 * (y - x) + 1;
    }
  }
}

function collectCircleFillPixels(cx, cy, radius, add) {
  if (radius <= 0) {
    add(cx, cy);
    return;
  }
  collectCircleOutlinePixels(cx, cy, radius, add);
  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    const rowY = cy + offsetY;
    const span = Math.round(Math.sqrt(Math.max(0, radius * radius - offsetY * offsetY)));
    for (let offsetX = -span; offsetX <= span; offsetX += 1) {
      add(cx + offsetX, rowY);
    }
  }
}

function resolveCurveControls(curve, usePreviewControls) {
  if (!curve) {
    return { control1: null, control2: null };
  }
  let control1 = usePreviewControls ? curve.previewControl1 ?? curve.control1 : curve.control1;
  let control2 = usePreviewControls ? curve.previewControl2 ?? curve.control2 : curve.control2;
  if (!control1 && control2) {
    control1 = control2;
  }
  if (!control2 && control1) {
    control2 = control1;
  }
  return { control1, control2 };
}

function evaluateCubicBezierPoint(p0, p1, p2, p3, t) {
  const inv = 1 - t;
  const inv2 = inv * inv;
  const t2 = t * t;
  return {
    x: inv2 * inv * p0.x + 3 * inv2 * t * p1.x + 3 * inv * t2 * p2.x + t2 * t * p3.x,
    y: inv2 * inv * p0.y + 3 * inv2 * t * p1.y + 3 * inv * t2 * p2.y + t2 * t * p3.y,
  };
}

function evaluateCubicBezierTangent(p0, p1, p2, p3, t) {
  const inv = 1 - t;
  const a = 3 * inv * inv;
  const b = 6 * inv * t;
  const c = 3 * t * t;
  return {
    x: a * (p1.x - p0.x) + b * (p2.x - p1.x) + c * (p3.x - p2.x),
    y: a * (p1.y - p0.y) + b * (p2.y - p1.y) + c * (p3.y - p2.y),
  };
}

function sampleCubicBezier({ p0, p1, p2, p3 }, add) {
  const TARGET_PIXEL_DISTANCE = 0.6;
  const MIN_STEP = 0.01;
  const MAX_STEP = 0.25;
  const MIN_SPEED = 0.001;

  let t = 0;
  let prevPixelX = Math.round(p0.x);
  let prevPixelY = Math.round(p0.y);
  add(prevPixelX, prevPixelY);

  while (t < 1) {
    const tangent = evaluateCubicBezierTangent(p0, p1, p2, p3, t);
    const speed = Math.max(MIN_SPEED, Math.hypot(tangent.x, tangent.y));
    let step = TARGET_PIXEL_DISTANCE / speed;
    step = clamp(step, MIN_STEP, MAX_STEP);
    if (t + step > 1) {
      step = 1 - t;
    }
    if (step <= 0) {
      break;
    }
    t += step;
    const point = evaluateCubicBezierPoint(p0, p1, p2, p3, t);
    const pixelX = Math.round(point.x);
    const pixelY = Math.round(point.y);
    const dx = Math.abs(pixelX - prevPixelX);
    const dy = Math.abs(pixelY - prevPixelY);
    if (dx === 0 && dy === 0) {
      prevPoint = point;
      continue;
    }
    if (dx > 1 || dy > 1) {
      drawLinePixels(prevPixelX, prevPixelY, pixelX, pixelY, (x, y) => add(x, y));
    } else {
      add(pixelX, pixelY);
    }
    prevPixelX = pixelX;
    prevPixelY = pixelY;
  }

  const finalPixelX = Math.round(p3.x);
  const finalPixelY = Math.round(p3.y);
  if (finalPixelX !== prevPixelX || finalPixelY !== prevPixelY) {
    drawLinePixels(prevPixelX, prevPixelY, finalPixelX, finalPixelY, (x, y) => add(x, y));
  }
}

function collectCurvePixelsForPreview(curve, { usePreviewControls = false } = {}) {
  const pixels = new Set();
  if (!curve || !curve.lineStart || !curve.lineEnd) {
    return pixels;
  }
  const start = curve.lineStart;
  const end = curve.lineEnd;
  const { control1, control2 } = resolveCurveControls(curve, usePreviewControls);
  const add = (x, y) => addShapePixel(pixels, x, y);
  if (!control1 || !control2) {
    drawLinePixels(start.x, start.y, end.x, end.y, (x, y) => add(x, y));
  } else {
    sampleCubicBezier({ p0: start, p1: control1, p2: control2, p3: end }, add);
  }
  if (!pixels.size) {
    add(start.x, start.y);
    add(end.x, end.y);
  }
  return pixels;
}

function collectShapePixels(tool, start, current) {
  const pixels = new Set();
  if (!start || !current) {
    return pixels;
  }
  const add = (x, y) => addShapePixel(pixels, x, y);
  switch (tool) {
    case 'shapeLine': {
      drawLinePixels(start.x, start.y, current.x, current.y, (x, y) => add(x, y));
      break;
    }
    case 'shapeCurve': {
      if (shapeState.curve) {
        const curvePixels = collectCurvePixelsForPreview(shapeState.curve, { usePreviewControls: true });
        for (const key of curvePixels) {
          pixels.add(key);
        }
      } else {
        drawLinePixels(start.x, start.y, current.x, current.y, (x, y) => add(x, y));
      }
      break;
    }
    case 'shapeCircle': {
      const radius = Math.round(Math.hypot(current.x - start.x, current.y - start.y));
      collectCircleOutlinePixels(start.x, start.y, radius, add);
      break;
    }
    case 'shapeCircleFill': {
      const radius = Math.round(Math.hypot(current.x - start.x, current.y - start.y));
      collectCircleFillPixels(start.x, start.y, radius, add);
      break;
    }
    case 'shapeRect': {
      const minX = Math.min(start.x, current.x);
      const maxX = Math.max(start.x, current.x);
      const minY = Math.min(start.y, current.y);
      const maxY = Math.max(start.y, current.y);
      for (let x = minX; x <= maxX; x += 1) {
        add(x, minY);
        add(x, maxY);
      }
      for (let y = minY + 1; y < maxY; y += 1) {
        add(minX, y);
        add(maxX, y);
      }
      break;
    }
    case 'shapeRectFill': {
      const minX = Math.min(start.x, current.x);
      const maxX = Math.max(start.x, current.x);
      const minY = Math.min(start.y, current.y);
      const maxY = Math.max(start.y, current.y);
      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          add(x, y);
        }
      }
      break;
    }
    default: {
      drawLinePixels(start.x, start.y, current.x, current.y, (x, y) => add(x, y));
      break;
    }
  }
  if (!pixels.size) {
    add(start.x, start.y);
  }
  return pixels;
}

function applyShapePixelsToLayer(pixels, color) {
  const layer = getActiveLayer();
  if (!layer || !pixels || pixels.size === 0) {
    return false;
  }
  const ctx = layer.ctx;
  ctx.fillStyle = color;
  const indexBuffer = layer.indexBuffer;
  const width = state.width;
  const paletteIndex = getPaletteIndexForColor(state.color, state.colorAlpha);
  let applied = false;
  for (const key of pixels) {
    const [pxStr, pyStr] = key.split(',');
    const px = Number(pxStr);
    const py = Number(pyStr);
    if (!Number.isFinite(px) || !Number.isFinite(py)) {
      continue;
    }
    if (!isPixelSelected(px, py)) {
      continue;
    }
    ctx.fillRect(px, py, 1, 1);
    if (indexBuffer && px >= 0 && px < width && py >= 0 && py < state.height) {
      indexBuffer[py * width + px] = paletteIndex;
    }
    applied = true;
  }
  return applied;
}

function cloneImageData(imageData) {
  if (!imageData || !imageData.data) {
    return null;
  }
  try {
    return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  } catch (error) {
    const { canvas, ctx } = createOffscreenCanvas(imageData.width, imageData.height);
    ctx.putImageData(imageData, 0, 0);
    return ctx.getImageData(0, 0, imageData.width, imageData.height);
  }
}

function cloneSnapshot(snapshot) {
  if (!snapshot) {
    return null;
  }
  return {
    width: snapshot.width,
    height: snapshot.height,
    pixelSize: snapshot.pixelSize,
    colorMode: snapshot.colorMode || COLOR_MODE_DEFAULT,
    color: snapshot.color || state.color,
    colorAlpha: Number.isFinite(snapshot.colorAlpha) ? snapshot.colorAlpha : state.colorAlpha,
    selectedId: snapshot.selectedId,
    nextId: snapshot.nextId,
    layers: snapshot.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      imageData: cloneImageData(layer.imageData),
      indexBuffer: layer.indexBuffer ? layer.indexBuffer.slice() : null,
    })),
    palette: Array.isArray(snapshot.palette) ? snapshot.palette.map((entry) => ({ ...entry })) : [],
  };
}

function createBlankSnapshotFrom(snapshot) {
  if (!snapshot) {
    return null;
  }
  const blank = cloneSnapshot(snapshot);
  if (!blank) {
    return null;
  }
  blank.layers.forEach((layer) => {
    if (layer.imageData) {
      layer.imageData.data.fill(0);
    }
    if (layer.indexBuffer) {
      layer.indexBuffer.fill(0);
    }
  });
  return blank;
}

function createBlankImageData(width, height) {
  const clampedWidth = Math.max(1, Math.floor(Number(width) || 0));
  const clampedHeight = Math.max(1, Math.floor(Number(height) || 0));
  try {
    return new ImageData(clampedWidth, clampedHeight);
  } catch (error) {
    const { ctx: offscreenCtx } = createOffscreenCanvas(clampedWidth, clampedHeight);
    return offscreenCtx.getImageData(0, 0, clampedWidth, clampedHeight);
  }
}

function resizeSnapshot(snapshot, nextWidth, nextHeight, options = {}) {
  const { resample = false } = options;
  if (!snapshot || !Array.isArray(snapshot.layers)) {
    return;
  }
  const width = Math.max(1, Math.floor(Number(nextWidth) || 0));
  const height = Math.max(1, Math.floor(Number(nextHeight) || 0));
  if (width === snapshot.width && height === snapshot.height) {
    return;
  }
  const originalWidth = snapshot.width;
  const originalHeight = snapshot.height;
  snapshot.width = width;
  snapshot.height = height;
  snapshot.pixelSize = state.pixelScale;
  snapshot.layers.forEach((layer) => {
    if (!layer) {
      return;
    }
    const hasImageData = layer.imageData instanceof ImageData;
    const oldIndexBuffer = layer.indexBuffer;
    const newIndexBuffer = createIndexBuffer(width, height);
    const { canvas: sourceCanvas, ctx: sourceCtx } = createOffscreenCanvas(originalWidth, originalHeight);
    if (hasImageData) {
      sourceCtx.putImageData(layer.imageData, 0, 0);
    }
    const { canvas, ctx: resizeCtx } = createOffscreenCanvas(width, height);
    resizeCtx.imageSmoothingEnabled = false;
    if (resample && hasImageData) {
      resizeCtx.drawImage(sourceCanvas, 0, 0, originalWidth, originalHeight, 0, 0, width, height);
      if (oldIndexBuffer?.length === originalWidth * originalHeight) {
        const scaleX = originalWidth / width;
        const scaleY = originalHeight / height;
        for (let y = 0; y < height; y += 1) {
          const srcY = Math.min(originalHeight - 1, Math.floor(y * scaleY));
          for (let x = 0; x < width; x += 1) {
            const srcX = Math.min(originalWidth - 1, Math.floor(x * scaleX));
            newIndexBuffer[y * width + x] = oldIndexBuffer[srcY * originalWidth + srcX];
          }
        }
      }
    } else if (hasImageData) {
      const copyWidth = Math.min(width, originalWidth);
      const copyHeight = Math.min(height, originalHeight);
      resizeCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
      if (oldIndexBuffer?.length === originalWidth * originalHeight) {
        for (let y = 0; y < copyHeight; y += 1) {
          const srcOffset = y * originalWidth;
          const destOffset = y * width;
          for (let x = 0; x < copyWidth; x += 1) {
            newIndexBuffer[destOffset + x] = oldIndexBuffer[srcOffset + x];
          }
        }
      }
    } else {
      resizeCtx.clearRect(0, 0, width, height);
    }
    layer.imageData = resizeCtx.getImageData(0, 0, width, height);
    layer.indexBuffer = newIndexBuffer;
  });
}

function syncFrameSnapshotsWithCurrentLayers() {
  if (isRestoringState) {
    return;
  }
  const orderedLayers = layersState.layers.slice();
  framesState.frames.forEach((frame) => {
    const snapshot = frame.snapshot;
    if (!snapshot || !Array.isArray(snapshot.layers)) {
      return;
    }
    const width = Math.max(1, Math.floor(Number(snapshot.width) || state.width));
    const height = Math.max(1, Math.floor(Number(snapshot.height) || state.height));
    const existing = new Map(snapshot.layers.map((layer) => [layer.id, layer]));
    const updated = [];
    orderedLayers.forEach((layer) => {
      let layerSnapshot = existing.get(layer.id);
      if (!layerSnapshot) {
        layerSnapshot = {
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          imageData: createBlankImageData(width, height),
          indexBuffer: createIndexBuffer(width, height),
        };
      } else {
        layerSnapshot.name = layer.name;
        layerSnapshot.visible = layer.visible;
        layerSnapshot.opacity = layer.opacity;
        if (!(layerSnapshot.indexBuffer instanceof Uint16Array) || layerSnapshot.indexBuffer.length !== width * height) {
          layerSnapshot.indexBuffer = createIndexBuffer(width, height);
        }
      }
      updated.push(layerSnapshot);
    });
    snapshot.layers = updated;
    const selectedExists = updated.some((layer) => layer.id === layersState.selectedId);
    snapshot.selectedId = selectedExists ? layersState.selectedId : updated[0]?.id || null;
    snapshot.nextId = Math.max(layersState.nextId, updated.length + 1);
    frame.layerContent = computeFrameLayerContent(snapshot);
  });
}

function createFrameFromSnapshot(snapshot, name = null) {
  const idNumber = framesState.nextId;
  framesState.nextId += 1;
  const cloned = cloneSnapshot(snapshot);
  return {
    id: `frame-${idNumber}`,
    name: name || `フレーム${idNumber}`,
    snapshot: cloned,
    layerContent: computeFrameLayerContent(cloned),
  };
}

function getFrameById(frameId) {
  return framesState.frames.find((frame) => frame.id === frameId) || null;
}

function getFrameNumericId(frameId) {
  if (typeof frameId !== 'string') {
    return NaN;
  }
  const match = frameId.match(/frame-(\d+)/);
  return match ? Number(match[1]) : NaN;
}

function initFrames() {
  framesState.frames.forEach((frame) => {
    if (!frame.layerContent) {
      frame.layerContent = computeFrameLayerContent(frame.snapshot);
    }
  });
  if (framesState.frames.length === 0) {
    const snapshot = captureHistorySnapshot();
    const frame = createFrameFromSnapshot(snapshot);
    framesState.frames.push(frame);
    framesState.activeId = frame.id;
  } else if (!framesState.activeId) {
    framesState.activeId = framesState.frames[0].id;
  }
}

function saveCurrentFrame(snapshotOverride = null) {
  if (!framesState.activeId) {
    return;
  }
  const frame = getFrameById(framesState.activeId);
  if (!frame) {
    return;
  }
  const snapshot = snapshotOverride || captureHistorySnapshot();
  frame.snapshot = cloneSnapshot(snapshot);
  frame.layerContent = computeFrameLayerContent(frame.snapshot);
}

function updatePlaybackUI() {
  if (!togglePlaybackButton) {
    if (deleteFrameButton) {
      deleteFrameButton.disabled = framesState.frames.length <= 1;
    }
    return;
  }
  const canPlay = framesState.frames.length > 1;
  togglePlaybackButton.disabled = !canPlay;
  if (deleteFrameButton) {
    deleteFrameButton.disabled = framesState.frames.length <= 1;
  }
  if (!canPlay && playbackState.playing) {
    stopFramePlayback({ updateUI: false });
  }
  togglePlaybackButton.setAttribute('aria-pressed', playbackState.playing ? 'true' : 'false');
  togglePlaybackButton.innerHTML = playbackState.playing ? STOP_BUTTON_MARKUP : PLAY_BUTTON_MARKUP;
  togglePlaybackButton.title = playbackState.playing ? '再生を停止' : 'フレームを再生';
}

function stopFramePlayback({ updateUI = true } = {}) {
  playbackState.playing = false;
  playbackState.lastTimestamp = 0;
  if (playbackState.rafId !== null && typeof window !== 'undefined') {
    window.cancelAnimationFrame(playbackState.rafId);
  }
  playbackState.rafId = null;
  if (updateUI) {
    updatePlaybackUI();
  }
}

function advanceFramePlayback() {
  if (!playbackState.playing) {
    return;
  }
  const frames = framesState.frames;
  if (!Array.isArray(frames) || frames.length <= 1) {
    stopFramePlayback();
    return;
  }
  const currentIndex = frames.findIndex((frame) => frame.id === framesState.activeId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % frames.length;
  const nextFrame = frames[nextIndex];
  if (!nextFrame) {
    stopFramePlayback();
    return;
  }
  selectFrame(nextFrame.id, { fromPlayback: true });
}

function deleteActiveFrame() {
  initFrames();
  const frames = framesState.frames;
  if (!Array.isArray(frames) || frames.length <= 1) {
    updatePlaybackUI();
    return;
  }
  if (playbackState.playing) {
    stopFramePlayback();
  }
  saveCurrentFrame();
  const currentIndex = frames.findIndex((frame) => frame.id === framesState.activeId);
  const index = currentIndex === -1 ? 0 : currentIndex;
  frames.splice(index, 1);
  const nextFrame = frames[index] || frames[index - 1] || frames[0] || null;
  if (nextFrame) {
    framesState.activeId = nextFrame.id;
    applyHistorySnapshot(nextFrame.snapshot);
    resetHistory();
    saveCurrentFrame();
  } else {
    framesState.activeId = null;
  }
  renderLayerList();
  updateLayerDockStatus();
  updatePlaybackUI();
  queueStateSave();
}

function playbackTick(timestamp) {
  if (!playbackState.playing) {
    playbackState.rafId = null;
    return;
  }
  const interval = 1000 / Math.max(1, playbackState.fps);
  if (playbackState.lastTimestamp === 0) {
    playbackState.lastTimestamp = timestamp;
  }
  const elapsed = timestamp - playbackState.lastTimestamp;
  if (elapsed >= interval) {
    const remainder = elapsed % interval;
    playbackState.lastTimestamp = timestamp - remainder;
    advanceFramePlayback();
  }
  if (playbackState.playing && typeof window !== 'undefined') {
    playbackState.rafId = window.requestAnimationFrame(playbackTick);
  } else {
    playbackState.rafId = null;
  }
}

function startFramePlayback() {
  if (playbackState.playing) {
    return;
  }
  initFrames();
  if (framesState.frames.length <= 1) {
    updatePlaybackUI();
    return;
  }
  saveCurrentFrame();
  playbackState.playing = true;
  playbackState.lastTimestamp = 0;
  if (typeof window !== 'undefined') {
    playbackState.rafId = window.requestAnimationFrame(playbackTick);
  }
  updatePlaybackUI();
}

function toggleFramePlayback() {
  if (playbackState.playing) {
    stopFramePlayback();
  } else {
    startFramePlayback();
  }
}

function addFrame(options = {}) {
  if (playbackState.playing) {
    stopFramePlayback();
  }
  initFrames();
  const { duplicate = true } = options;
  saveCurrentFrame();
  const currentSnapshot = captureHistorySnapshot();
  const baseSnapshot = duplicate ? currentSnapshot : createBlankSnapshotFrom(currentSnapshot);
  const frame = createFrameFromSnapshot(baseSnapshot);
  framesState.frames.push(frame);
  framesState.activeId = frame.id;
  applyHistorySnapshot(frame.snapshot);
  resetHistory();
  saveCurrentFrame();
  renderLayerList();
  updateLayerDockStatus();
  flashDock('toolDock');
  scheduleDockAutoHide();
}

function selectFrame(frameId, options = {}) {
  const { fromPlayback = false } = options;
  if (!frameId || frameId === framesState.activeId) {
    return;
  }
  if (playbackState.playing && !fromPlayback) {
    stopFramePlayback();
  }
  initFrames();
  if (!fromPlayback) {
    saveCurrentFrame();
  }
  const frame = getFrameById(frameId);
  if (!frame || !frame.snapshot) {
    return;
  }
  framesState.activeId = frameId;
  applyHistorySnapshot(frame.snapshot);
  resetHistory();
  if (!fromPlayback) {
    saveCurrentFrame();
  }
  renderLayerList();
  updateLayerDockStatus();
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
  const layerIndexBuffer = layer.indexBuffer;
  const moveIndexBuffer = new Uint16Array(width * height);
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
      const pixelIndex = (row * width + col) * 4;
      if (mask[globalIndex]) {
        if (layerIndexBuffer && layerIndexBuffer.length === state.width * state.height) {
          moveIndexBuffer[row * width + col] = layerIndexBuffer[globalIndex];
        }
        continue;
      }
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
        if (layerIndexBuffer && layerIndexBuffer.length === state.width * state.height) {
          layerIndexBuffer[rowOffset + col] = 0;
        }
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
  selectionState.moveIndexBuffer = moveIndexBuffer;
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
    selectionState.moveIndexBuffer = null;
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
    if (selectionState.moveIndexBuffer && targetLayer.indexBuffer) {
      const indexBuffer = targetLayer.indexBuffer;
      const selectionWidth = selectionState.moveCanvas.width;
      const selectionHeight = selectionState.moveCanvas.height;
      const canvasWidth = state.width;
      for (let row = 0; row < selectionHeight; row += 1) {
        const destRow = destY + row;
        if (destRow < 0 || destRow >= state.height) {
          continue;
        }
        const srcOffset = row * selectionWidth;
        const destOffset = destRow * canvasWidth;
        for (let col = 0; col < selectionWidth; col += 1) {
          const destCol = destX + col;
          if (destCol < 0 || destCol >= state.width) {
            continue;
          }
          indexBuffer[destOffset + destCol] = selectionState.moveIndexBuffer[srcOffset + col];
        }
      }
    }
  }

  selectionState.isMoving = false;
  selectionState.moveStart = null;
  selectionState.moveCanvas = null;
  selectionState.moveLayerId = null;
  selectionState.moveIndexBuffer = null;

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
  const zoom = Math.max(state.zoom || 1, 0.01);
  const base = SELECTION_OUTLINE_THICKNESS_PX / zoom;
  return Math.max(base, 1);
}

function getSelectionDashLength() {
  const zoom = Math.max(state.zoom || 1, 0.01);
  const base = SELECTION_DASH_LENGTH_PX / zoom;
  return Math.max(base, 2);
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

function renderSelectionOverlayImmediate() {
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
  overlayDirty = false;
}

function renderSelectionOverlay() {
  overlayDirty = true;
  if (typeof window === 'undefined') {
    renderSelectionOverlayImmediate();
    return;
  }
  if (overlayRafId === null) {
    overlayRafId = window.requestAnimationFrame(() => {
      overlayRafId = null;
      if (!overlayDirty) {
        return;
      }
      overlayDirty = false;
      renderSelectionOverlayImmediate();
    });
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
    renderSelectionOverlayImmediate();
    return;
  }
  if (selectionAnimationLastTime !== null) {
    const deltaMs = Math.max(0, timestamp - selectionAnimationLastTime);
    const delta = (deltaMs / 1000) * SELECTION_DASH_SPEED_PX;
    selectionDashPhasePx = (selectionDashPhasePx + delta) % (SELECTION_DASH_LENGTH_PX * 2);
  }
  selectionAnimationLastTime = timestamp;
  renderSelectionOverlayImmediate();
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
  if (
    selectionState.pendingClearClick !== null &&
    selectionState.pendingClearClick === selectionState.pointerId &&
    selectionState.dragStart &&
    (selectionState.dragStart.x !== selectionState.dragCurrent.x ||
      selectionState.dragStart.y !== selectionState.dragCurrent.y)
  ) {
    selectionState.pendingClearMoved = true;
  }
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
    if (
      selectionState.pendingClearClick !== null &&
      selectionState.pendingClearClick === selectionState.pointerId
    ) {
      selectionState.pendingClearMoved = true;
    }
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
  const targetZoom = clamp(value, minAllowed, ZOOM_LIMITS.max);
  const previousZoom = state.zoom;
  const zoomChanged = Math.abs(targetZoom - previousZoom) >= 0.0001;

  if (zoomChanged) {
    state.zoom = targetZoom;
    if (fromUser) {
      userAdjustedZoom = true;
    }
  } else if (fromUser) {
    userAdjustedZoom = true;
  }
  if (focus) {
    const metrics = getWrapperMetrics();
    if (metrics) {
      const localX = focus.x - metrics.rect.left;
      const localY = focus.y - metrics.rect.top;
      const worldX = (localX - state.offsetX) / previousZoom;
      const worldY = (localY - state.offsetY) / previousZoom;
      const scaledWidth = state.width * state.pixelSize * state.zoom;
      const scaledHeight = state.height * state.pixelSize * state.zoom;
      let nextOffsetX = localX - state.zoom * worldX;
      let nextOffsetY = localY - state.zoom * worldY;
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
      const scaledWidth = state.width * state.pixelSize * state.zoom;
      const scaledHeight = state.height * state.pixelSize * state.zoom;
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

function ensureCanvasCentered(options = {}) {
  const { force = false } = options;
  if (force) {
    canvasAutoCentered = false;
  }
  if (canvasAutoCentered) {
    clampOffsets();
    applyCanvasZoom();
    return;
  }
  fitZoomToContainer();
  window.requestAnimationFrame(() => {
    if (!userAdjustedZoom) {
      fitZoomToContainer();
    }
    centerCanvasInWrapper();
    canvasAutoCentered = true;
  });
}

function centerCanvasInWrapper() {
  if (!canvasStage) {
    return;
  }
  const wrapper = canvasStage.parentElement;
  if (!wrapper) {
    return;
  }
  const wrapperRect = wrapper.getBoundingClientRect();
  const scaledWidth = state.width * state.pixelSize * state.zoom;
  const scaledHeight = state.height * state.pixelSize * state.zoom;
  const centerX = (wrapperRect.width - scaledWidth) / 2;
  const centerY = (wrapperRect.height - scaledHeight) / 2;
  state.offsetX = centerX;
  state.offsetY = centerY;
  clampOffsets();
  applyCanvasZoom();
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
  const fallbackX = virtualCursorState.x + 0.5;
  const fallbackY = virtualCursorState.y + 0.5;
  const visualX = Number.isFinite(virtualCursorState.visualX) ? virtualCursorState.visualX : fallbackX;
  const visualY = Number.isFinite(virtualCursorState.visualY) ? virtualCursorState.visualY : fallbackY;
  const clampedVisualX = clamp(visualX, 0, state.width);
  const clampedVisualY = clamp(visualY, 0, state.height);
  const pixelOffsetX = clampedVisualX * state.pixelSize;
  const pixelOffsetY = clampedVisualY * state.pixelSize;
  virtualCursorElement.style.left = `${pixelOffsetX}px`;
  virtualCursorElement.style.top = `${pixelOffsetY}px`;
}

function updateVirtualCursorPosition(x, y, options = {}) {
  const { silent = false, preserveVisual = false } = options;
  if (!virtualCursorState.enabled) {
    return;
  }
  const clampedX = clamp(Math.round(x), 0, Math.max(0, state.width - 1));
  const clampedY = clamp(Math.round(y), 0, Math.max(0, state.height - 1));
  virtualCursorState.x = clampedX;
  virtualCursorState.y = clampedY;
  if (!preserveVisual) {
    virtualCursorState.visualX = clampedX + 0.5;
    virtualCursorState.visualY = clampedY + 0.5;
  }
  updateVirtualCursorVisualPosition();
  if (!silent) {
    updateCursorInfo(clampedX, clampedY);
  }
  if (!virtualCursorState.drawActive) {
    updateVirtualCursorHoverPreview();
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
    if (isBrushTool(state.tool)) {
      drawLine(prevX, prevY, clampedX, clampedY, true);
      drawVirtualCursorPreviewLine(prevX, prevY, clampedX, clampedY);
    } else if (state.tool === 'eraser') {
      drawLine(prevX, prevY, clampedX, clampedY, false);
    } else {
      continueVirtualDrawing();
    }
    virtualCursorState.prevDrawX = clampedX;
    virtualCursorState.prevDrawY = clampedY;
    queueCompositeLayers({ skipUIUpdate: true, skipContentCheck: true });
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
  clearVirtualCursorPreview();
  finalizeHistoryEntry();
  updateVirtualCursorHoverPreview();
}

function continueVirtualDrawing() {
  if (!virtualCursorState.drawActive || !isDrawing) {
    return;
  }
  if (isBrushTool(state.tool)) {
    drawBrush(virtualCursorState.x, virtualCursorState.y);
    extendVirtualCursorPreviewPoint(virtualCursorState.x, virtualCursorState.y);
  } else if (state.tool === 'eraser') {
    eraseBrush(virtualCursorState.x, virtualCursorState.y);
  } else {
    return;
  }
  queueCompositeLayers({ skipUIUpdate: true, skipContentCheck: true });
}

function startVirtualDrawing() {
  if (!virtualCursorState.enabled) {
    return;
  }
  const { x, y } = virtualCursorState;
  clearVirtualCursorPreview();
  virtualCursorState.prevDrawX = x;
  virtualCursorState.prevDrawY = y;
  if (isBrushTool(state.tool) || state.tool === 'eraser' || state.tool === 'fill') {
    autoCompactAllDocks();
  }
  if (isBrushTool(state.tool)) {
    isDrawing = true;
    virtualCursorState.drawActive = true;
    beginVirtualCursorPreviewStroke(x, y);
    drawBrush(x, y);
    queueCompositeLayers({ skipUIUpdate: true, skipContentCheck: true });
  } else if (state.tool === 'eraser') {
    isDrawing = true;
    virtualCursorState.drawActive = true;
    eraseBrush(x, y);
    queueCompositeLayers({ skipUIUpdate: true, skipContentCheck: true });
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
    queueCompositeLayers();
    virtualCursorState.drawActive = false;
    virtualCursorState.prevDrawX = null;
    virtualCursorState.prevDrawY = null;
  } else {
    virtualCursorState.drawActive = false;
    virtualCursorState.prevDrawX = null;
    virtualCursorState.prevDrawY = null;
  }
}

function setVirtualCursorEnabled(enabled, options = {}) {
  const { temporary = false } = options;
  const shouldEnable = Boolean(enabled);
  if (!temporary) {
    virtualCursorState.preferredEnabled = shouldEnable;
    virtualCursorState.zoomTemporarilyDisabled = false;
  }
  if (virtualCursorState.enabled === shouldEnable) {
    return;
  }
  virtualCursorState.enabled = shouldEnable;
  if (!virtualCursorElement || !virtualDrawControl) {
    initVirtualCursorUI();
  }
  if (virtualCursorToggle && !temporary) {
    virtualCursorToggle.classList.toggle('tool-button--active', shouldEnable);
    virtualCursorToggle.setAttribute('aria-pressed', shouldEnable ? 'true' : 'false');
  }
  if (virtualCursorElement) {
    if (HAS_TOUCH_SUPPORT) {
      virtualCursorElement.dataset.visible = shouldEnable ? 'true' : 'false';
    } else {
      const shouldShowDesktop = shouldEnable && desktopVirtualCursorActive;
      virtualCursorElement.dataset.visible = shouldShowDesktop ? 'true' : 'false';
    }
  }
  if (virtualDrawControl) {
    const shouldShowControl = shouldEnable && HAS_TOUCH_SUPPORT;
    virtualDrawControl.dataset.visible = shouldShowControl ? 'true' : 'false';
  }
  if (shouldEnable) {
    updateVirtualCursorHoverPreview();
  } else {
    clearVirtualCursorPreview({ includeHover: true });
  }
  if (!temporary) {
    flashDock('toolDock');
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
    clearVirtualCursorPreview();
    virtualCursorState.pointerId = null;
    virtualCursorState.lastClientX = null;
    virtualCursorState.lastClientY = null;
    virtualCursorState.residualDX = 0;
    virtualCursorState.residualDY = 0;
    virtualCursorState.prevDrawX = null;
    virtualCursorState.prevDrawY = null;
    updateCursorInfo();
    if (!HAS_TOUCH_SUPPORT) {
      setDesktopVirtualCursorActive(false);
      showCanvasCursor();
    }
    return;
  }
  virtualCursorState.lastClientX = null;
  virtualCursorState.lastClientY = null;
  virtualCursorState.residualDX = 0;
  virtualCursorState.residualDY = 0;
  virtualCursorState.prevDrawX = null;
  virtualCursorState.prevDrawY = null;
  if (!temporary) {
    updateVirtualCursorPosition(state.width / 2, state.height / 2, { silent: HAS_TOUCH_SUPPORT ? false : true });
    ensureVirtualControlPosition();
  } else {
    updateVirtualCursorVisualPosition();
  }
  updateVirtualCursorIcon();
  if (!HAS_TOUCH_SUPPORT) {
    setDesktopVirtualCursorActive(false);
    showCanvasCursor();
  }
}

function initVirtualCursorUI() {
  if (!canvasStage || virtualCursorElement) {
    return;
  }
  virtualCursorElement = document.createElement('div');
  virtualCursorElement.className = 'virtual-cursor';
  virtualCursorElement.dataset.visible = 'false';
  virtualCursorIconElement = document.createElement('img');
  virtualCursorIconElement.className = 'virtual-cursor__icon';
  virtualCursorIconElement.alt = '';
  virtualCursorIconElement.setAttribute('aria-hidden', 'true');
  virtualCursorIconElement.draggable = false;
  virtualCursorIconElement.decoding = 'async';
  virtualCursorIconElement.loading = 'lazy';
  virtualCursorElement.appendChild(virtualCursorIconElement);
  canvasStage.appendChild(virtualCursorElement);
  updateVirtualCursorIcon(state.tool);

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
  updateExportGifState();
}

function updateExportGifState() {
  if (!exportGifButton) {
    return;
  }
  initFrames();
  const frameCount = framesState.frames.length;
  const hasMultipleFrames = frameCount > 1;
  exportGifButton.hidden = !hasMultipleFrames;
  exportGifButton.disabled = !hasMultipleFrames;
  if (exportGifHint) {
    exportGifHint.hidden = !hasMultipleFrames;
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
  if (event.pointerType !== 'touch') {
    return;
  }
  zoomPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (virtualCursorState.enabled) {
    if (zoomPointers.size >= 2) {
      temporarilyDisableVirtualCursorForZoom();
    } else {
      return;
    }
  }
  if (virtualCursorState.enabled) {
    return;
  }
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
  if (zoomPointers.size === 0) {
    restoreVirtualCursorAfterZoom();
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
  if (value.length === 3 || value.length === 4) {
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

function hexToRgb(hex) {
  const normalized = normalizeHex(hex).slice(1);
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 0xff;
  const g = (value >> 8) & 0xff;
  const b = value & 0xff;
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  const toHex = (component) => clamp(Math.round(component), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbaToCss(r, g, b, a) {
  return `rgba(${clamp(Math.round(r), 0, 255)}, ${clamp(Math.round(g), 0, 255)}, ${clamp(Math.round(b), 0, 255)}, ${clamp(a, 0, 1)})`;
}

function colorToCss(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return rgbaToCss(r, g, b, alpha);
}

function rgbaToUint32(r, g, b, a) {
  const alphaByte = clamp(Math.round(a * 255), 0, 255);
  return (alphaByte << 24) | (b << 16) | (g << 8) | r;
}

function packColorBytes(r, g, b, a) {
  return ((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);
}

function premultiplyHexColor(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const alphaByte = clamp(Math.round(alpha * 255), 0, 255);
  if (alphaByte === 0) {
    return { r: 0, g: 0, b: 0, a: 0, uint32: 0 };
  }
  const factor = alphaByte / 255;
  const premultipliedR = clamp(Math.round(r * factor), 0, 255);
  const premultipliedG = clamp(Math.round(g * factor), 0, 255);
  const premultipliedB = clamp(Math.round(b * factor), 0, 255);
  return {
    r: premultipliedR,
    g: premultipliedG,
    b: premultipliedB,
    a: alphaByte,
    uint32: packColorBytes(premultipliedR, premultipliedG, premultipliedB, alphaByte),
  };
}

function premultiplyComponents(r, g, b, alphaByte) {
  if (alphaByte <= 0) {
    return 0;
  }
  const factor = alphaByte / 255;
  const premultipliedR = clamp(Math.round(r * factor), 0, 255);
  const premultipliedG = clamp(Math.round(g * factor), 0, 255);
  const premultipliedB = clamp(Math.round(b * factor), 0, 255);
  return packColorBytes(premultipliedR, premultipliedG, premultipliedB, alphaByte);
}

function getPaletteEntryByIndex(index, paletteEntries = state.palette) {
  if (!Array.isArray(paletteEntries) || paletteEntries.length === 0) {
    return createTransparentPaletteEntry();
  }
  const clamped = clamp(index, 0, paletteEntries.length - 1);
  return paletteEntries[clamped] || createTransparentPaletteEntry();
}

function redrawLayerFromIndexBuffer(layer, paletteEntries = state.palette) {
  if (!layer || !layer.ctx || !(layer.indexBuffer instanceof Uint16Array)) {
    return;
  }
  const width = layer.canvas?.width ?? state.width;
  const height = layer.canvas?.height ?? state.height;
  if (layer.indexBuffer.length !== width * height) {
    return;
  }
  let imageData;
  try {
    imageData = layer.ctx.getImageData(0, 0, width, height);
  } catch (error) {
    return;
  }
  const data = imageData.data;
  for (let pixelIndex = 0, dataIndex = 0; pixelIndex < layer.indexBuffer.length; pixelIndex += 1, dataIndex += 4) {
    const entry = getPaletteEntryByIndex(layer.indexBuffer[pixelIndex], paletteEntries);
    if (!entry) {
      data[dataIndex] = 0;
      data[dataIndex + 1] = 0;
      data[dataIndex + 2] = 0;
      data[dataIndex + 3] = 0;
      continue;
    }
    const { r, g, b } = hexToRgb(entry.color);
    const alphaByte = entry.storedAlphaByte ?? clamp(Math.round(entry.alpha * 255), 0, 255);
    data[dataIndex] = r;
    data[dataIndex + 1] = g;
    data[dataIndex + 2] = b;
    data[dataIndex + 3] = alphaByte;
  }
  layer.ctx.putImageData(imageData, 0, 0);
  layer.hasContent = detectLayerHasContent(layer);
}

function redrawSnapshotLayerFromIndexBuffer(layer, paletteEntries = state.palette) {
  if (!layer || !(layer.indexBuffer instanceof Uint16Array) || !(layer.imageData instanceof ImageData)) {
    return;
  }
  const width = layer.imageData.width;
  const height = layer.imageData.height;
  if (layer.indexBuffer.length !== width * height) {
    return;
  }
  const data = layer.imageData.data;
  for (let pixelIndex = 0, dataIndex = 0; pixelIndex < layer.indexBuffer.length; pixelIndex += 1, dataIndex += 4) {
    const entry = getPaletteEntryByIndex(layer.indexBuffer[pixelIndex], paletteEntries);
    if (!entry) {
      data[dataIndex] = 0;
      data[dataIndex + 1] = 0;
      data[dataIndex + 2] = 0;
      data[dataIndex + 3] = 0;
      continue;
    }
    const { r, g, b } = hexToRgb(entry.color);
    const alphaByte = entry.storedAlphaByte ?? clamp(Math.round(entry.alpha * 255), 0, 255);
    data[dataIndex] = r;
    data[dataIndex + 1] = g;
    data[dataIndex + 2] = b;
    data[dataIndex + 3] = alphaByte;
  }
}

function redrawAllLayersFromIndices(paletteEntries = state.palette) {
  layersState.layers.forEach((layer) => {
    redrawLayerFromIndexBuffer(layer, paletteEntries);
  });
  framesState.frames.forEach((frame) => {
    if (!frame?.snapshot || !Array.isArray(frame.snapshot.layers)) {
      return;
    }
    frame.snapshot.layers.forEach((layer) => {
      redrawSnapshotLayerFromIndexBuffer(layer, paletteEntries);
    });
    frame.layerContent = computeFrameLayerContent(frame.snapshot);
  });
  if (selectionState.moveCanvas && selectionState.moveIndexBuffer instanceof Uint16Array) {
    const width = selectionState.moveCanvas.width;
    const height = selectionState.moveCanvas.height;
    if (selectionState.moveIndexBuffer.length === width * height) {
      const moveCtx = selectionState.moveCanvas.getContext('2d');
      if (moveCtx) {
        redrawLayerFromIndexBuffer(
          {
            ctx: moveCtx,
            canvas: selectionState.moveCanvas,
            indexBuffer: selectionState.moveIndexBuffer,
          },
          paletteEntries,
        );
      }
    }
  }
}

function unpackUint32Color(value) {
  const r = value & 0xff;
  const g = (value >> 8) & 0xff;
  const b = (value >> 16) & 0xff;
  const a = (value >> 24) & 0xff;
  return { r, g, b, a };
}

function unpremultiplyColor(r, g, b, alphaByte) {
  if (alphaByte <= 0) {
    return { r: 0, g: 0, b: 0 };
  }
  const factor = 255 / alphaByte;
  return {
    r: clamp(Math.round(r * factor), 0, 255),
    g: clamp(Math.round(g * factor), 0, 255),
    b: clamp(Math.round(b * factor), 0, 255),
  };
}

function createPaletteEntry(color, alpha = 1, storedUint32 = null) {
  const normalized = normalizeHex(color);
  if (typeof storedUint32 === 'number') {
    const storedAlphaByte = (storedUint32 >>> 24) & 0xff;
    const actualAlpha = clamp(storedAlphaByte / 255, 0, 1);
    return {
      color: normalized,
      alpha: actualAlpha,
      storedUint32,
      storedAlphaByte,
    };
  }
  const clampedAlpha = clamp(Number(alpha ?? 1), 0, 1);
  if (clampedAlpha === 0) {
    return createTransparentPaletteEntry();
  }
  const premult = premultiplyHexColor(normalized, clampedAlpha);
  return {
    color: normalized,
    alpha: clampedAlpha,
    storedUint32: premult.uint32,
    storedAlphaByte: premult.a,
  };
}

function findPaletteEntry(color, alpha = 1) {
  const normalized = normalizeHex(color);
  const clampedAlpha = clamp(Number(alpha ?? 1), 0, 1);
  return state.palette.find(
    (entry) => entry?.color === normalized && Math.abs((entry.alpha ?? 0) - clampedAlpha) <= 0.0005,
  );
}

function ensurePaletteHasTransparentEntry(entries) {
  const list = Array.isArray(entries) ? entries.slice() : [];
  if (list.length === 0) {
    list.push(createTransparentPaletteEntry());
    return list;
  }
  let transparentIndex = -1;
  for (let i = 0; i < list.length; i += 1) {
    if (isTransparentPaletteEntry(list[i])) {
      transparentIndex = i;
      break;
    }
  }
  if (transparentIndex === 0) {
    return list;
  }
  const transparentEntry = transparentIndex >= 0 ? { ...list[transparentIndex] } : createTransparentPaletteEntry();
  if (transparentIndex >= 0) {
    list.splice(transparentIndex, 1);
  }
  list.unshift(transparentEntry);
  return list;
}

function getPaletteIndexForColor(color, alpha = 1) {
  const clampedAlpha = clamp(alpha, 0, 1);
  if (clampedAlpha <= 0) {
    return 0;
  }
  const normalized = normalizeHex(color);
  for (let index = 0; index < state.palette.length; index += 1) {
    const entry = state.palette[index];
    if (!entry) {
      continue;
    }
    if (entry.color === normalized && Math.abs((entry.alpha ?? 0) - clampedAlpha) <= 0.0005) {
      return index;
    }
  }
  return 0;
}

function seedColorLookupFromPalette(paletteEntries, lookup) {
  if (!lookup) {
    return;
  }
  if (!Array.isArray(paletteEntries)) {
    return;
  }
  if (lookup.size > 0) {
    return;
  }
  for (let index = 0; index < paletteEntries.length; index += 1) {
    const entry = paletteEntries[index];
    if (!entry || typeof entry.storedUint32 !== 'number') {
      continue;
    }
    lookup.set(entry.storedUint32, index);
  }
}

function resolvePaletteIndexFromPixel(r, g, b, alphaByte, paletteEntries = state.palette, lookup = indexedColorLookup) {
  if (alphaByte <= 0) {
    return 0;
  }
  if (!Array.isArray(paletteEntries) || paletteEntries.length === 0) {
    return 0;
  }
  if (lookup === indexedColorLookup) {
    if (lookup.size === 0) {
      rebuildIndexedColorLookup();
    }
  } else {
    seedColorLookupFromPalette(paletteEntries, lookup);
  }
  const stored = premultiplyComponents(r, g, b, alphaByte);
  const cached = lookup?.get ? lookup.get(stored) : undefined;
  if (typeof cached === 'number') {
    return cached;
  }
  let bestIndex = 0;
  let bestDistance = Infinity;
  for (let index = 0; index < paletteEntries.length; index += 1) {
    const entry = paletteEntries[index];
    if (!entry) {
      continue;
    }
    const entryStored = typeof entry.storedUint32 === 'number' ? entry.storedUint32 : null;
    if (entryStored !== null && entryStored === stored) {
      if (lookup && typeof lookup.set === 'function') {
        lookup.set(stored, index);
      }
      return index;
    }
    const entryColor = hexToRgb(entry.color);
    const entryAlphaByte = entry.storedAlphaByte ?? clamp(Math.round(entry.alpha * 255), 0, 255);
    const dr = entryColor.r - r;
    const dg = entryColor.g - g;
    const db = entryColor.b - b;
    const da = entryAlphaByte - alphaByte;
    const distance = dr * dr + dg * dg + db * db + da * da;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
      if (distance === 0) {
        break;
      }
    }
  }
  if (lookup && typeof lookup.set === 'function') {
    lookup.set(stored, bestIndex);
  }
  return bestIndex;
}

function backfillLayerIndexBuffer(layer, paletteEntries = state.palette, lookup = indexedColorLookup) {
  if (!layer || !layer.ctx) {
    return;
  }
  if (!Array.isArray(paletteEntries) || paletteEntries.length === 0) {
    return;
  }
  const canvasWidth = layer.canvas?.width ?? state.width;
  const canvasHeight = layer.canvas?.height ?? state.height;
  if (canvasWidth <= 0 || canvasHeight <= 0) {
    return;
  }
  if (!(layer.indexBuffer instanceof Uint16Array) || layer.indexBuffer.length !== canvasWidth * canvasHeight) {
    layer.indexBuffer = createIndexBuffer(canvasWidth, canvasHeight);
  }
  if (lookup === indexedColorLookup) {
    rebuildIndexedColorLookup();
  } else {
    seedColorLookupFromPalette(paletteEntries, lookup);
  }
  let imageData;
  try {
    imageData = layer.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  } catch (error) {
    return;
  }
  const data = imageData.data;
  const buffer = layer.indexBuffer;
  for (let pixelIndex = 0, dataIndex = 0; pixelIndex < buffer.length; pixelIndex += 1, dataIndex += 4) {
    buffer[pixelIndex] = resolvePaletteIndexFromPixel(
      data[dataIndex],
      data[dataIndex + 1],
      data[dataIndex + 2],
      data[dataIndex + 3],
      paletteEntries,
      lookup,
    );
  }
}

function colorWithAlphaToHex8(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  const alphaByte = clamp(Math.round(alpha * 255), 0, 255).toString(16).padStart(2, '0');
  return `${normalizeHex(hex)}${alphaByte}`;
}

function rgbToHsl(r, g, b) {
  const rn = clamp(r, 0, 255) / 255;
  const gn = clamp(g, 0, 255) / 255;
  const bn = clamp(b, 0, 255) / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const delta = max - min;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60;
        break;
      case gn:
        h = ((bn - rn) / delta + 2) * 60;
        break;
      default:
        h = ((rn - gn) / delta + 4) * 60;
        break;
    }
  }
  return {
    h: Math.round((Number.isFinite(h) ? h : 0) % 360),
    s: Math.round(clamp(s * 100, 0, 100)),
    l: Math.round(clamp(l * 100, 0, 100)),
  };
}

function hslToRgb(h, s, l) {
  const hue = (((Number(h) % 360) + 360) % 360) / 360;
  const sat = clamp(Number(s) / 100, 0, 1);
  const light = clamp(Number(l) / 100, 0, 1);
  if (sat === 0) {
    const value = Math.round(light * 255);
    return { r: value, g: value, b: value };
  }
  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
  const p = 2 * light - q;
  const hueToRgb = (t) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };
  const r = hueToRgb(hue + 1 / 3);
  const g = hueToRgb(hue);
  const b = hueToRgb(hue - 1 / 3);
  return {
    r: Math.round(clamp(r * 255, 0, 255)),
    g: Math.round(clamp(g * 255, 0, 255)),
    b: Math.round(clamp(b * 255, 0, 255)),
  };
}

function isSelectionTool(tool) {
  return selectionToolIds.includes(tool);
}

function isBrushTool(tool) {
  return tool === 'pen' || tool === 'pencil';
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

function isShapeTool(tool) {
  return shapeToolIds.includes(tool);
}

function getShapeToolButton(tool) {
  return toolButtons.find((button) => button.dataset.tool === tool);
}

function getShapeToggleMeta(tool) {
  const defaultLabel = shapeToolToggle?.dataset.defaultLabel || '図形ツール';
  const defaultIcon = shapeToolToggle?.dataset.defaultIcon || shapeToolToggleIcon?.src || '';
  if (!isShapeTool(tool)) {
    return { icon: defaultIcon, label: defaultLabel };
  }
  const button = getShapeToolButton(tool);
  if (!button) {
    return { icon: defaultIcon, label: defaultLabel };
  }
  const icon = button.dataset.icon || button.querySelector('img')?.src || defaultIcon;
  const label = button.getAttribute('aria-label') || button.querySelector('img')?.getAttribute('alt') || defaultLabel;
  return { icon, label };
}

function updateShapeToolToggleState() {
  if (!shapeToolToggle) {
    return;
  }
  const shapeActive = isShapeTool(state.tool);
  const displayTool = shapeActive ? state.tool : shapeToolToggle?.dataset.defaultTool || shapeToolIds[0];
  const meta = getShapeToggleMeta(displayTool);
  if (shapeToolToggleIcon && meta.icon) {
    shapeToolToggleIcon.src = meta.icon;
  }
  if (shapeToolToggleIcon && meta.label) {
    shapeToolToggleIcon.alt = meta.label;
  }
  const toggleLabel = meta.label || shapeToolToggle?.dataset.defaultLabel || '図形ツール';
  shapeToolToggle.setAttribute('aria-label', toggleLabel);
  shapeToolToggle.setAttribute('aria-pressed', shapeActive ? 'true' : 'false');
  shapeToolToggle.setAttribute('aria-expanded', shapeToolPanelOpen ? 'true' : 'false');
  shapeToolToggle.classList.toggle('tool-button--active', shapeActive || shapeToolPanelOpen);
}

function openShapeToolPanel() {
  if (!shapeToolPanel || shapeToolPanelOpen) {
    return;
  }
  shapeToolPanel.hidden = false;
  shapeToolPanel.setAttribute('aria-hidden', 'false');
  shapeToolPanelOpen = true;
  updateShapeToolToggleState();
}

function closeShapeToolPanel() {
  if (!shapeToolPanelOpen) {
    return;
  }
  if (shapeToolPanel) {
    shapeToolPanel.hidden = true;
    shapeToolPanel.setAttribute('aria-hidden', 'true');
  }
  shapeToolPanelOpen = false;
  updateShapeToolToggleState();
}

function toggleShapeToolPanel() {
  if (shapeToolPanelOpen) {
    closeShapeToolPanel();
  } else {
    openShapeToolPanel();
  }
}

function handleShapeToolDocumentClick(event) {
  if (!shapeToolPanelOpen) {
    return;
  }
  const target = event.target;
  if (!(target instanceof Node)) {
    closeShapeToolPanel();
    return;
  }
  if ((shapeToolPanel && shapeToolPanel.contains(target)) || (shapeToolToggle && shapeToolToggle.contains(target))) {
    return;
  }
  closeShapeToolPanel();
}

function setActiveTool(tool) {
  const previousTool = state.tool;
  if (tool !== 'pan') {
    endCanvasPan(null, { force: true });
  }
  cancelShapeDrawing();
  state.tool = tool;
  toolButtons.forEach((button) => {
    const isActive = button.dataset.tool === tool;
    button.classList.toggle('tool-button--active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
  if (!isSelectionTool(tool)) {
    closeSelectionToolPanel();
  }
  if (!isShapeTool(tool)) {
    closeShapeToolPanel();
  }
  updateSelectionToolToggleState();
  updateShapeToolToggleState();
  updateToolDockStatus();
  updatePanCursorState();
  flashDock('toolDock');
  scheduleDockAutoHide();
  applyToolAlphaOverrides(previousTool, tool);
  updateVirtualCursorIcon(tool);
  refreshHoverPreviews();
}

function applyToolAlphaOverrides(previousTool, nextTool) {
  if (previousTool === nextTool) {
    return;
  }
  if (nextTool === 'pen' && previousTool !== 'pen') {
    nonPenAlphaSnapshot = state.colorAlpha;
    const targetAlpha = Number.isFinite(penPreferredAlpha) ? clamp(penPreferredAlpha, 0, 1) : PEN_DEFAULT_ALPHA;
    if (!Number.isFinite(nonPenAlphaSnapshot)) {
      nonPenAlphaSnapshot = 1;
    }
    if (Math.abs(state.colorAlpha - targetAlpha) > 0.0001) {
      setActiveColor(state.color, null, { closePanel: false, alpha: targetAlpha });
    }
  } else if (previousTool === 'pen' && nextTool !== 'pen') {
    penPreferredAlpha = clamp(state.colorAlpha, 0, 1);
    const restoreAlpha = Number.isFinite(nonPenAlphaSnapshot) ? nonPenAlphaSnapshot : 1;
    nonPenAlphaSnapshot = null;
    if (Math.abs(state.colorAlpha - restoreAlpha) > 0.0001) {
      setActiveColor(state.color, null, { closePanel: false, alpha: restoreAlpha });
    }
  }
}

function setActiveColor(color, swatch = null, options = {}) {
  const { closePanel = true, alpha = null } = options;
  const normalized = normalizeHex(color);
  const candidateAlpha = alpha !== null ? clamp(Number(alpha), 0, 1) : null;
  const previousStateAlpha = state.colorAlpha;
  const previousSwatchColor = swatch ? normalizeHex(swatch.dataset.color || normalized) : null;
  const previousSwatchAlpha = swatch ? Number(swatch.dataset.alpha ?? state.colorAlpha ?? 1) : null;
  if (!swatch) {
    const match = Array.from(paletteContainer.children).find((element) => {
      if (element.dataset.color !== normalized) {
        return false;
      }
      if (candidateAlpha === null) {
        return true;
      }
      const elementAlpha = Number(element.dataset.alpha ?? 1);
      return Math.abs(elementAlpha - candidateAlpha) < 0.005;
    });
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
    if (alpha !== null) {
      swatch.dataset.alpha = String(alpha);
    }
    const swatchAlpha = Number(swatch.dataset.alpha ?? state.colorAlpha ?? 1);
    const cssColor = colorToCss(normalized, swatchAlpha);
    swatch.style.setProperty('--swatch-color', cssColor);
    swatch.style.backgroundColor = 'transparent';
  } else {
    activeSwatch = null;
  }
  colorPicker.value = normalized;
  state.color = normalized;
  const resolvedAlpha = candidateAlpha !== null ? candidateAlpha : Number(swatch?.dataset.alpha ?? state.colorAlpha ?? 1);
  state.colorAlpha = clamp(Number.isFinite(resolvedAlpha) ? resolvedAlpha : 1, 0, 1);
  if (swatch) {
    swatch.dataset.alpha = String(state.colorAlpha);
    const cssColor = colorToCss(normalized, state.colorAlpha);
    swatch.style.setProperty('--swatch-color', cssColor);
  }
  const newSwatchColor = swatch ? normalizeHex(swatch.dataset.color || normalized) : null;
  const newSwatchAlpha = swatch ? Number(swatch.dataset.alpha ?? state.colorAlpha ?? 1) : null;
  if (paletteEditorVisible && !paletteEditorPreventSync) {
    updatePaletteEditorControls(normalized, state.colorAlpha);
  }
  if (swatch && closePanel) {
    window.setTimeout(() => closePanelIfActive('palettePanel'), 0);
  }
  updatePaletteDockStatus();
  flashDock('paletteDock');
  scheduleDockAutoHide();
  const swatchMutated = swatch
    ? previousSwatchColor !== newSwatchColor || Math.abs((previousSwatchAlpha ?? 0) - (newSwatchAlpha ?? 0)) > 0.0005
    : false;
  if (swatchMutated) {
    const shouldRecolor = state.colorMode === 'indexed' && previousSwatchColor && newSwatchColor;
    updatePaletteState({ skipRecolor: !shouldRecolor });
  }
  refreshHoverPreviews();
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
  const currentAlpha = clamp(Number(button.dataset.alpha ?? state.colorAlpha), 0, 1);
  ensurePaletteEditor();
  updatePaletteEditorControls(currentColor, currentAlpha);
  showPaletteEditor(button);
}

function ensurePaletteEditor() {
  if (paletteEditor) {
    return;
  }
  const editor = document.createElement('div');
  editor.id = 'paletteEditor';
  editor.className = 'palette-editor';
  editor.hidden = true;
  editor.setAttribute('role', 'dialog');
  editor.setAttribute('aria-modal', 'true');
  editor.setAttribute('tabindex', '-1');

  const preview = document.createElement('div');
  preview.className = 'palette-editor__preview';
  paletteEditorPreview = preview;
  preview.addEventListener('click', () => {
    colorPicker.value = paletteEditorHexInput?.value || state.color;
    colorPicker.click();
  });
  editor.appendChild(preview);

  const hexField = document.createElement('label');
  hexField.className = 'palette-editor__field';
  const hexLabel = document.createElement('span');
  hexLabel.textContent = 'HEX';
  paletteEditorHexInput = document.createElement('input');
  paletteEditorHexInput.type = 'text';
  paletteEditorHexInput.inputMode = 'text';
  paletteEditorHexInput.autocomplete = 'off';
  paletteEditorHexInput.spellcheck = false;
  paletteEditorHexInput.maxLength = 7;
  paletteEditorHexInput.placeholder = '#58c4ff';
  hexField.append(hexLabel, paletteEditorHexInput);
  editor.appendChild(hexField);

  const sliders = document.createElement('div');
  sliders.className = 'palette-editor__sliders';

  const createSlider = (labelText, min, max, step, suffix) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'palette-editor__field palette-editor__field--slider';
    const label = document.createElement('span');
    label.textContent = labelText;
    const value = document.createElement('span');
    value.className = 'palette-editor__value';
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.className = 'palette-editor__slider';
    wrapper.append(label, input, value);
    sliders.appendChild(wrapper);
    return { input, value, suffix };
  };

  const hueSlider = createSlider('色相', 0, 360, 1, '°');
  const satSlider = createSlider('彩度', 0, 100, 1, '%');
  const lightSlider = createSlider('明度', 0, 100, 1, '%');
  const alphaSlider = createSlider('透明度', 0, 100, 1, '%');

  paletteEditorHueInput = hueSlider.input;
  paletteEditorHueValue = hueSlider.value;
  paletteEditorSatInput = satSlider.input;
  paletteEditorSatValue = satSlider.value;
  paletteEditorLightInput = lightSlider.input;
  paletteEditorLightValue = lightSlider.value;
  paletteEditorAlphaInput = alphaSlider.input;
  paletteEditorAlphaValue = alphaSlider.value;

  editor.appendChild(sliders);

  const hueWheelWrapper = document.createElement('div');
  hueWheelWrapper.className = 'palette-editor__wheel-wrapper';
  const hueWheelCanvas = document.createElement('canvas');
  hueWheelCanvas.width = 160;
  hueWheelCanvas.height = 160;
  hueWheelCanvas.className = 'palette-editor__wheel';
  hueWheelCanvas.dataset.role = 'hueWheel';
  hueWheelWrapper.appendChild(hueWheelCanvas);
  editor.appendChild(hueWheelWrapper);
  paletteEditorHueCanvas = hueWheelCanvas;
  paletteEditorHueCtx = hueWheelCanvas.getContext('2d');
  hueWheelCanvas.addEventListener('pointerdown', handlePaletteEditorWheelPointerDown);
  hueWheelCanvas.addEventListener('pointermove', handlePaletteEditorWheelPointerMove);
  hueWheelCanvas.addEventListener('pointerup', handlePaletteEditorWheelPointerUp);
  hueWheelCanvas.addEventListener('pointercancel', handlePaletteEditorWheelPointerUp);

  paletteEditorHistoryContainer = document.createElement('div');
  paletteEditorHistoryContainer.className = 'palette-editor__history';
  paletteEditorHistoryContainer.addEventListener('click', handlePaletteEditorHistoryClick);
  paletteEditorHistorySlots = [];
  for (let index = 0; index < PALETTE_EDITOR_HISTORY_SIZE; index += 1) {
    const slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'palette-editor__history-swatch';
    slot.dataset.index = String(index);
    slot.dataset.color = '';
    slot.dataset.alpha = '1';
    paletteEditorHistorySlots.push(slot);
    paletteEditorHistoryContainer.appendChild(slot);
  }
  editor.appendChild(paletteEditorHistoryContainer);

  paletteEditorToolbar = document.createElement('div');
  paletteEditorToolbar.className = 'palette-editor__toolbar';
  const createToolbarButton = (action, label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = action;
    button.textContent = label;
    return button;
  };
  const toolbarButtons = [
    createToolbarButton('copy', 'HEXコピー'),
    createToolbarButton('system', 'システム色'),
    createToolbarButton('close', '閉じる'),
  ];
  toolbarButtons.forEach((button) => paletteEditorToolbar.appendChild(button));
  paletteEditorToolbar.addEventListener('click', handlePaletteEditorToolbarClick);
  editor.appendChild(paletteEditorToolbar);

  paletteEditorHexInput.addEventListener('input', handlePaletteEditorHexInput);
  paletteEditorHexInput.addEventListener('change', () => commitPaletteEditorHistory());
  paletteEditorHexInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      commitPaletteEditorHistory();
    }
  });
  paletteEditorHueInput.addEventListener('input', handlePaletteEditorSliderInput);
  paletteEditorHueInput.addEventListener('change', () => commitPaletteEditorHistory());
  paletteEditorSatInput.addEventListener('input', handlePaletteEditorSliderInput);
  paletteEditorSatInput.addEventListener('change', () => commitPaletteEditorHistory());
  paletteEditorLightInput.addEventListener('input', handlePaletteEditorSliderInput);
  paletteEditorLightInput.addEventListener('change', () => commitPaletteEditorHistory());
  paletteEditorAlphaInput.addEventListener('input', handlePaletteEditorAlphaInput);
  paletteEditorAlphaInput.addEventListener('change', () => commitPaletteEditorHistory());

  document.body.appendChild(editor);
  paletteEditor = editor;

  if (!paletteEditorResizeListenerAttached) {
    window.addEventListener('resize', () => {
      if (paletteEditorVisible) {
        positionPaletteEditor(editingSwatch);
      }
    });
    paletteEditorResizeListenerAttached = true;
  }
  drawPaletteEditorHueWheel();
  if (paletteEditorRecentColors.length === 0) {
    paletteEditorRecentColors.push({ color: normalizeHex(state.color), alpha: state.colorAlpha });
  }
  updatePaletteEditorHistoryUI();
  const initialCssColor = colorToCss(state.color, state.colorAlpha);
  paletteEditorPreview.style.setProperty('--swatch-color', initialCssColor);
}

function positionPaletteEditor(anchor) {
  if (!paletteEditor) {
    return;
  }
  const margin = 16;
  const editorRect = paletteEditor.getBoundingClientRect();
  const editorWidth = editorRect.width || 280;
  const editorHeight = editorRect.height || 220;
  let left = (window.innerWidth - editorWidth) / 2;
  let top = (window.innerHeight - editorHeight) / 2;
  if (anchor && typeof anchor.getBoundingClientRect === 'function') {
    const rect = anchor.getBoundingClientRect();
    let preferredLeft = rect.right + margin;
    if (preferredLeft + editorWidth > window.innerWidth - margin) {
      preferredLeft = rect.left - editorWidth - margin;
    }
    left = preferredLeft;
    top = rect.top;
  }
  left = clamp(left, margin, Math.max(margin, window.innerWidth - editorWidth - margin));
  top = clamp(top, margin, Math.max(margin, window.innerHeight - editorHeight - margin));
  paletteEditor.style.left = `${left}px`;
  paletteEditor.style.top = `${top}px`;
}

function drawPaletteEditorHueWheel() {
  if (!paletteEditorHueCanvas || !paletteEditorHueCtx) {
    return;
  }
  const { width, height } = paletteEditorHueCanvas;
  const radius = Math.min(width, height) / 2 - 2;
  const centerX = width / 2;
  const centerY = height / 2;
  paletteEditorHueCtx.clearRect(0, 0, width, height);
  paletteEditorHueCtx.save();
  paletteEditorHueCtx.translate(centerX, centerY);
  for (let angle = 0; angle < 360; angle += 1) {
    const startRad = ((angle - 0.5) * Math.PI) / 180;
    const endRad = ((angle + 0.5) * Math.PI) / 180;
    paletteEditorHueCtx.beginPath();
    paletteEditorHueCtx.moveTo(0, 0);
    paletteEditorHueCtx.arc(0, 0, radius, startRad, endRad, false);
    paletteEditorHueCtx.closePath();
    paletteEditorHueCtx.fillStyle = `hsl(${angle}, 100%, 50%)`;
    paletteEditorHueCtx.fill();
  }
  paletteEditorHueCtx.restore();
  paletteEditorHueCtx.beginPath();
  paletteEditorHueCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  paletteEditorHueCtx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  paletteEditorHueCtx.lineWidth = 2;
  paletteEditorHueCtx.stroke();

  paletteEditorHueCtx.save();
  paletteEditorHueCtx.translate(centerX, centerY);
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const inner = radius - 10;
    const outer = radius + 2;
    paletteEditorHueCtx.beginPath();
    paletteEditorHueCtx.moveTo(Math.cos(rad) * inner, Math.sin(rad) * inner);
    paletteEditorHueCtx.lineTo(Math.cos(rad) * outer, Math.sin(rad) * outer);
    paletteEditorHueCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    paletteEditorHueCtx.lineWidth = angle % 90 === 0 ? 2 : 1;
    paletteEditorHueCtx.stroke();
  }
  paletteEditorHueCtx.restore();
}

function renderPaletteEditorHueIndicator(
  hue,
  sat = Number(paletteEditorSatInput?.value) || 0,
  light = Number(paletteEditorLightInput?.value) || 0,
  alphaPercent = Number(paletteEditorAlphaInput?.value ?? state.colorAlpha * 100) || state.colorAlpha * 100,
) {
  if (!paletteEditorHueCanvas || !paletteEditorHueCtx) {
    return;
  }
  drawPaletteEditorHueWheel();
  const { width, height } = paletteEditorHueCanvas;
  const radius = Math.min(width, height) / 2 - 4;
  const centerX = width / 2;
  const centerY = height / 2;
  const rad = (Number(hue) * Math.PI) / 180;
  const indicatorX = centerX + Math.cos(rad) * radius;
  const indicatorY = centerY + Math.sin(rad) * radius;
  const satRadius = radius * clamp(Number(sat) / 100, 0, 1);
  const satX = centerX + Math.cos(rad) * satRadius;
  const satY = centerY + Math.sin(rad) * satRadius;
  const clampedAlphaPercent = clamp(alphaPercent, 0, 100);

  paletteEditorHueCtx.beginPath();
  paletteEditorHueCtx.moveTo(centerX, centerY);
  paletteEditorHueCtx.lineTo(indicatorX, indicatorY);
  paletteEditorHueCtx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  paletteEditorHueCtx.lineWidth = 3;
  paletteEditorHueCtx.stroke();

  paletteEditorHueCtx.beginPath();
  paletteEditorHueCtx.moveTo(centerX, centerY);
  paletteEditorHueCtx.lineTo(satX, satY);
  paletteEditorHueCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  paletteEditorHueCtx.lineWidth = 2;
  paletteEditorHueCtx.stroke();

  paletteEditorHueCtx.beginPath();
  paletteEditorHueCtx.arc(indicatorX, indicatorY, 6, 0, Math.PI * 2);
  paletteEditorHueCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  paletteEditorHueCtx.fill();
  paletteEditorHueCtx.beginPath();
  paletteEditorHueCtx.arc(indicatorX, indicatorY, 4.2, 0, Math.PI * 2);
  paletteEditorHueCtx.strokeStyle = '#ffffff';
  paletteEditorHueCtx.lineWidth = 2;
  paletteEditorHueCtx.stroke();

  paletteEditorHueCtx.beginPath();
  paletteEditorHueCtx.arc(satX, satY, 4, 0, Math.PI * 2);
  paletteEditorHueCtx.fillStyle = '#ffffff';
  paletteEditorHueCtx.fill();
  paletteEditorHueCtx.beginPath();
  paletteEditorHueCtx.arc(satX, satY, 2.6, 0, Math.PI * 2);
  paletteEditorHueCtx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  paletteEditorHueCtx.fill();

  const innerRadius = radius * 0.42;
  paletteEditorHueCtx.beginPath();
  paletteEditorHueCtx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  const { r, g, b } = hslToRgb(hue, sat, light);
  const alpha = clampedAlphaPercent / 100;
  paletteEditorHueCtx.fillStyle = rgbaToCss(r, g, b, alpha || 1);
  paletteEditorHueCtx.fill();
  paletteEditorHueCtx.beginPath();
  paletteEditorHueCtx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  paletteEditorHueCtx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  paletteEditorHueCtx.lineWidth = 2;
  paletteEditorHueCtx.stroke();

  paletteEditorHueCtx.fillStyle = '#ffffff';
  paletteEditorHueCtx.font = '600 13px "Inter", sans-serif';
  paletteEditorHueCtx.textAlign = 'center';
  paletteEditorHueCtx.textBaseline = 'middle';
  paletteEditorHueCtx.fillText(`${Math.round(hue)}°`, centerX, centerY - 6);
  paletteEditorHueCtx.font = '500 11px "Inter", sans-serif';
  paletteEditorHueCtx.fillText(`${Math.round(sat)}% / ${Math.round(light)}%`, centerX, centerY + 8);
  paletteEditorHueCtx.font = '500 10px "Inter", sans-serif';
  paletteEditorHueCtx.fillText(`A ${Math.round(clampedAlphaPercent)}%`, centerX, centerY + 20);
}

function updateHueFromWheelEvent(event) {
  if (!paletteEditorHueCanvas) {
    return;
  }
  const rect = paletteEditorHueCanvas.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const radius = Math.min(rect.width, rect.height) / 2;
  const distance = Math.hypot(dx, dy);
  if (distance > radius + 8) {
    return;
  }
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const hue = Math.round((angle + 360) % 360);
  if (paletteEditorHueInput) {
    paletteEditorHueInput.value = String(hue);
  }
  if (paletteEditorHueValue) {
    paletteEditorHueValue.textContent = `${hue}°`;
  }
  handlePaletteEditorSliderInput();
}

function handlePaletteEditorWheelPointerDown(event) {
  if (!paletteEditorHueCanvas) {
    return;
  }
  paletteEditorHueCanvas.setPointerCapture(event.pointerId);
  paletteEditorWheelPointerId = event.pointerId;
  updateHueFromWheelEvent(event);
}

function handlePaletteEditorWheelPointerMove(event) {
  if (paletteEditorWheelPointerId !== event.pointerId) {
    return;
  }
  updateHueFromWheelEvent(event);
}

function handlePaletteEditorWheelPointerUp(event) {
  if (paletteEditorWheelPointerId !== event.pointerId) {
    return;
  }
  if (paletteEditorHueCanvas && paletteEditorHueCanvas.hasPointerCapture(event.pointerId)) {
    paletteEditorHueCanvas.releasePointerCapture(event.pointerId);
  }
  paletteEditorWheelPointerId = null;
  commitPaletteEditorHistory();
}

function addColorToPaletteHistory(hex, alpha = state.colorAlpha) {
  const normalized = normalizeHex(hex);
  const clampedAlpha = clamp(alpha, 0, 1);
  const existingIndex = paletteEditorRecentColors.findIndex((item) => item.color === normalized && Math.abs(item.alpha - clampedAlpha) < 0.001);
  if (existingIndex !== -1) {
    paletteEditorRecentColors.splice(existingIndex, 1);
  }
  paletteEditorRecentColors.unshift({ color: normalized, alpha: clampedAlpha });
  if (paletteEditorRecentColors.length > PALETTE_EDITOR_HISTORY_SIZE) {
    paletteEditorRecentColors.length = PALETTE_EDITOR_HISTORY_SIZE;
  }
  updatePaletteEditorHistoryUI();
}

function updatePaletteEditorHistoryUI() {
  if (!paletteEditorHistoryContainer) {
    return;
  }
  paletteEditorHistorySlots.forEach((slot, index) => {
    const entry = paletteEditorRecentColors[index];
    if (!entry) {
      slot.dataset.color = '';
      slot.dataset.alpha = '1';
    }
    const color = entry ? entry.color : '#000000';
    const alpha = entry ? entry.alpha : 0;
    const cssColor = colorToCss(color, alpha);
    slot.style.setProperty('--swatch-color', cssColor);
    slot.style.backgroundColor = 'transparent';
    slot.dataset.color = entry ? color : '';
    slot.dataset.alpha = String(alpha);
    slot.title = entry ? `${color}  (α ${Math.round(alpha * 100)}%)` : '履歴なし';
    slot.dataset.empty = entry ? 'false' : 'true';
  });
}

function handlePaletteEditorHistoryClick(event) {
  const swatch = event.target instanceof HTMLElement ? event.target.closest('button') : null;
  if (!swatch || swatch.dataset.empty === 'true' || !swatch.dataset.color) {
    return;
  }
  const hex = normalizeHex(swatch.dataset.color);
  const alpha = clamp(Number(swatch.dataset.alpha ?? state.colorAlpha), 0, 1);
  paletteEditorSuppressUpdates = true;
  paletteEditorHexInput.value = hex;
  paletteEditorSuppressUpdates = false;
  updatePaletteEditorControls(hex, alpha);
  applyPaletteEditorColor(hex, alpha);
  commitPaletteEditorHistory();
}

function handlePaletteEditorToolbarClick(event) {
  const button = event.target instanceof HTMLElement ? event.target.closest('button') : null;
  if (!button) {
    return;
  }
  const action = button.dataset.action;
  const hex = normalizeHex(paletteEditorHexInput?.value || state.color);
  const alpha = clamp((Number(paletteEditorAlphaInput?.value) || state.colorAlpha * 100) / 100, 0, 1);
  switch (action) {
    case 'copy': {
      if (!/^#[0-9a-fA-F]{6}$/.test(hex)) {
        break;
      }
      const hex8 = colorWithAlphaToHex8(hex, alpha);
      const text = `${hex8}`;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      const original = button.textContent;
      button.textContent = 'コピー済';
      window.setTimeout(() => {
        button.textContent = original || 'HEXコピー';
      }, 1200);
      break;
    }
    case 'system':
      colorPicker.value = hex;
      colorPicker.click();
      break;
    case 'close':
      closePaletteEditor();
      break;
    default:
      break;
  }
}

function showPaletteEditor(anchor) {
  if (!paletteEditor) {
    return;
  }
  paletteEditor.hidden = false;
  paletteEditor.classList.add('palette-editor--visible');
  paletteEditorVisible = true;
  paletteEditorSuppressUpdates = true;
  paletteEditorHexInput.focus({ preventScroll: true });
  paletteEditorHexInput.select();
  paletteEditorSuppressUpdates = false;
  requestAnimationFrame(() => {
    positionPaletteEditor(anchor);
    const currentHue = Number(paletteEditorHueInput?.value) || 0;
    const currentSat = Number(paletteEditorSatInput?.value) || 0;
    const currentLight = Number(paletteEditorLightInput?.value) || 0;
    renderPaletteEditorHueIndicator(currentHue, currentSat, currentLight);
  });
  document.addEventListener('pointerdown', handlePaletteEditorPointerDown, true);
  document.addEventListener('keydown', handlePaletteEditorKeyDown, true);
}

function closePaletteEditor() {
  if (!paletteEditorVisible || !paletteEditor) {
    editingSwatch = null;
    return;
  }
  paletteEditorVisible = false;
  paletteEditor.classList.remove('palette-editor--visible');
  paletteEditor.hidden = true;
  paletteEditorPreventSync = false;
  paletteEditorSuppressUpdates = false;
  paletteEditorWheelPointerId = null;
  commitPaletteEditorHistory();
  document.removeEventListener('pointerdown', handlePaletteEditorPointerDown, true);
  document.removeEventListener('keydown', handlePaletteEditorKeyDown, true);
  if (editingSwatch) {
    editingSwatch.dataset.longPressActive = 'false';
  }
  editingSwatch = null;
}

function handlePaletteEditorPointerDown(event) {
  if (!paletteEditorVisible || !paletteEditor) {
    return;
  }
  const target = event.target;
  if (paletteEditor.contains(target) || (editingSwatch && editingSwatch.contains(target))) {
    return;
  }
  closePaletteEditor();
}

function handlePaletteEditorKeyDown(event) {
  if (!paletteEditorVisible) {
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    closePaletteEditor();
  }
}

function updatePaletteEditorControls(hex, alpha = state.colorAlpha) {
  if (!paletteEditor || paletteEditorSuppressUpdates) {
    return;
  }
  const normalized = normalizeHex(hex);
  const { r, g, b } = hexToRgb(normalized);
  const { h, s, l } = rgbToHsl(r, g, b);
  paletteEditorSuppressUpdates = true;
  const cssColor = colorToCss(normalized, alpha);
  paletteEditorPreview.style.setProperty('--swatch-color', cssColor);
  paletteEditorPreview.style.backgroundColor = 'transparent';
  paletteEditorHexInput.value = normalized;
  if (paletteEditorHueInput) {
    paletteEditorHueInput.value = String(h);
  }
  if (paletteEditorSatInput) {
    paletteEditorSatInput.value = String(s);
  }
  if (paletteEditorLightInput) {
    paletteEditorLightInput.value = String(l);
  }
  const alphaPercent = clamp(Math.round(alpha * 100), 0, 100);
  if (paletteEditorAlphaInput) {
    paletteEditorAlphaInput.value = String(alphaPercent);
  }
  if (paletteEditorHueValue) {
    paletteEditorHueValue.textContent = `${h}°`;
  }
  if (paletteEditorSatValue) {
    paletteEditorSatValue.textContent = `${s}%`;
  }
  if (paletteEditorLightValue) {
    paletteEditorLightValue.textContent = `${l}%`;
  }
  if (paletteEditorAlphaValue) {
    paletteEditorAlphaValue.textContent = `${alphaPercent}%`;
  }
  paletteEditorSuppressUpdates = false;
  renderPaletteEditorHueIndicator(h, s, l, alpha * 100);
}

function applyPaletteEditorColor(hex, alpha = state.colorAlpha) {
  const normalized = normalizeHex(hex);
  paletteEditorPreventSync = true;
  setActiveColor(normalized, editingSwatch, { closePanel: false, alpha });
  paletteEditorPreventSync = false;
}

function commitPaletteEditorHistory() {
  if (!paletteEditorVisible) {
    return;
  }
  const hex = normalizeHex(paletteEditorHexInput?.value || state.color);
  const alphaPercent = Number(paletteEditorAlphaInput?.value ?? state.colorAlpha * 100);
  const alpha = clamp(alphaPercent / 100, 0, 1);
  addColorToPaletteHistory(hex, alpha);
}

function handlePaletteEditorHexInput() {
  if (paletteEditorSuppressUpdates) {
    return;
  }
  let value = paletteEditorHexInput.value.trim();
  if (!value.startsWith('#')) {
    value = `#${value}`;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    const alphaPercent = Number(paletteEditorAlphaInput?.value) || Math.round(state.colorAlpha * 100);
    const alpha = clamp(alphaPercent / 100, 0, 1);
    updatePaletteEditorControls(value, alpha);
    applyPaletteEditorColor(value, alpha);
  }
}

function handlePaletteEditorSliderInput() {
  if (paletteEditorSuppressUpdates) {
    return;
  }
  const h = Number(paletteEditorHueInput?.value) || 0;
  const s = Number(paletteEditorSatInput?.value) || 0;
  const l = Number(paletteEditorLightInput?.value) || 0;
  const a = Number(paletteEditorAlphaInput?.value) || Math.round(state.colorAlpha * 100);
  if (paletteEditorHueValue) {
    paletteEditorHueValue.textContent = `${Math.round(h)}°`;
  }
  if (paletteEditorSatValue) {
    paletteEditorSatValue.textContent = `${Math.round(s)}%`;
  }
  if (paletteEditorLightValue) {
    paletteEditorLightValue.textContent = `${Math.round(l)}%`;
  }
  if (paletteEditorAlphaValue) {
    paletteEditorAlphaValue.textContent = `${Math.round(a)}%`;
  }
  const { r, g, b } = hslToRgb(h, s, l);
  const hex = rgbToHex(r, g, b);
  paletteEditorSuppressUpdates = true;
  const cssColor = colorToCss(hex, clamp(a / 100, 0, 1));
  paletteEditorPreview.style.setProperty('--swatch-color', cssColor);
  paletteEditorPreview.style.backgroundColor = 'transparent';
  paletteEditorHexInput.value = hex;
  paletteEditorSuppressUpdates = false;
  applyPaletteEditorColor(hex, clamp(a / 100, 0, 1));
  renderPaletteEditorHueIndicator(h, s, l, a);
}

function handlePaletteEditorAlphaInput() {
  if (paletteEditorSuppressUpdates) {
    return;
  }
  const h = Number(paletteEditorHueInput?.value) || 0;
  const s = Number(paletteEditorSatInput?.value) || 0;
  const l = Number(paletteEditorLightInput?.value) || 0;
  const a = clamp(Number(paletteEditorAlphaInput?.value) || 0, 0, 100);
  if (paletteEditorAlphaValue) {
    paletteEditorAlphaValue.textContent = `${Math.round(a)}%`;
  }
  const { r, g, b } = hslToRgb(h, s, l);
  const hex = rgbToHex(r, g, b);
  paletteEditorSuppressUpdates = true;
  const cssColor = colorToCss(hex, a / 100);
  paletteEditorPreview.style.setProperty('--swatch-color', cssColor);
  paletteEditorPreview.style.backgroundColor = 'transparent';
  paletteEditorHexInput.value = hex;
  paletteEditorSuppressUpdates = false;
  applyPaletteEditorColor(hex, a / 100);
  renderPaletteEditorHueIndicator(h, s, l, a);
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
  updatePaletteState();
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
      dragState.dragging = true;
      button.dataset.longPressActive = 'true';
      button.classList.add('swatch--dragging');
      dragState.suppressClick = true;
      longPressTimer = null;
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
      button.dataset.longPressActive = 'false';
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
    const alpha = Number(button.dataset.alpha ?? state.colorAlpha ?? 1);
    setActiveColor(color, button, { closePanel: true, alpha });
  });

  button.addEventListener('dblclick', (event) => {
    event.preventDefault();
    event.stopPropagation();
    clearTimer();
    endDrag();
    button.dataset.longPressActive = 'false';
    openSwatchEditor(button);
  });
}

colorPicker.addEventListener('change', () => {
  const selected = normalizeHex(colorPicker.value);
  if (editingSwatch) {
    editingSwatch.dataset.longPressActive = 'false';
    setActiveColor(selected, editingSwatch, { closePanel: true, alpha: state.colorAlpha });
    if (paletteEditorVisible) {
      updatePaletteEditorControls(selected, state.colorAlpha);
      commitPaletteEditorHistory();
    }
    if (!paletteEditorVisible) {
      editingSwatch = null;
    }
  } else {
    setActiveColor(selected, null, { closePanel: true, alpha: state.colorAlpha });
    if (paletteEditorVisible) {
      updatePaletteEditorControls(selected, state.colorAlpha);
      commitPaletteEditorHistory();
    }
  }
});

colorPicker.addEventListener('blur', () => {
  if (!paletteEditorVisible) {
    editingSwatch = null;
  }
});

colorPicker.addEventListener('input', () => {
  const selected = normalizeHex(colorPicker.value);
  if (editingSwatch) {
    editingSwatch.dataset.longPressActive = 'false';
    setActiveColor(selected, editingSwatch, { closePanel: false, alpha: state.colorAlpha });
  } else {
    setActiveColor(selected, null, { closePanel: false, alpha: state.colorAlpha });
  }
  if (paletteEditorVisible) {
    updatePaletteEditorControls(selected, state.colorAlpha);
  }
});

function closeActivePanel() {
  closePaletteEditor();
  hideHelpPopover();
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

  const DRAG_THRESHOLD_MOUSE = 6;
  const DRAG_THRESHOLD_TOUCH = 12;
  const DRAG_LONG_PRESS_MS = 250;

  const dragState = {
    active: false,
    dragging: false,
    pointerId: null,
    offsetX: 0,
    offsetY: 0,
    identifier: null,
    overFloatingDock: false,
    captureTarget: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    suppressClick: false,
    longPressTimer: null,
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

  const clearLongPressTimer = () => {
    if (dragState.longPressTimer !== null) {
      window.clearTimeout(dragState.longPressTimer);
      dragState.longPressTimer = null;
    }
  };

  const beginDragInteraction = (event) => {
    if (!dragState.active || dragState.dragging) {
      return;
    }
    dragState.dragging = true;
    dragState.suppressClick = true;
    clearLongPressTimer();

    handleElement.classList.add('mini-dock__drag--dragging');
    dockElement.classList.add('mini-dock--dragging');

    const identifier = dragState.identifier || getDockIdentifierFromElement(dockElement);
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

  };

  const handleDockPointerMove = (event) => {
    if (!dragState.active || event.pointerId !== dragState.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    const distance = Math.hypot(deltaX, deltaY);
    const elapsed = performance.now() - dragState.startTime;

    if (!dragState.dragging) {
      const threshold = event.pointerType === 'touch' ? DRAG_THRESHOLD_TOUCH : DRAG_THRESHOLD_MOUSE;
      if (event.pointerType === 'touch') {
        if (dragState.longPressTimer === null && distance < threshold && elapsed < DRAG_LONG_PRESS_MS) {
          return;
        }
        if (dragState.longPressTimer !== null && elapsed >= DRAG_LONG_PRESS_MS) {
          clearLongPressTimer();
        }
      }
      if (distance >= threshold || event.pointerType !== 'touch' || dragState.longPressTimer === null) {
        beginDragInteraction(event);
      } else {
        return;
      }
    }

    event.preventDefault();
    clampPosition(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
    const overMenu = updateDockMenuPlaceholderPosition(dragState.identifier, event.clientX, event.clientY);
    dragState.overFloatingDock = overMenu;
    setFloatingDockReceiving(overMenu);
  };

  const finishDrag = (event) => {
    if (dragState.pointerId === null || event.pointerId !== dragState.pointerId) {
      return;
    }

    clearLongPressTimer();

    const wasDragging = dragState.dragging;

    if (dragState.captureTarget && typeof dragState.captureTarget.releasePointerCapture === 'function') {
      try {
        dragState.captureTarget.releasePointerCapture(event.pointerId);
      } catch (_) {
        // noop
      }
    }

    if (wasDragging) {
      handleElement.classList.remove('mini-dock__drag--dragging');
      dockElement.classList.remove('mini-dock--dragging');
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
      maybeRestoreDockMenuCollapse();
    }

    setFloatingDockReceiving(false);
    hideDockMenuPlaceholder();
    dockElement.style.zIndex = '';
    window.removeEventListener('pointermove', handleDockPointerMove);
    window.removeEventListener('pointerup', finishDrag);
    window.removeEventListener('pointercancel', finishDrag);

    dragState.active = false;
    dragState.dragging = false;
    dragState.pointerId = null;
    dragState.captureTarget = null;
    dragState.identifier = null;
    dragState.overFloatingDock = false;
    dragState.suppressClick = wasDragging;
  };

  const startDrag = (event, captureTarget = handleElement) => {
    if (dragState.active || dragState.suppressClick) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    if (dockElement.dataset.visible !== 'true') {
      return;
    }

    event.preventDefault();
    ensureWithinBounds();

    const rect = dockElement.getBoundingClientRect();
    dragState.active = true;
    dragState.dragging = false;
    dragState.pointerId = event.pointerId;
    dragState.captureTarget = captureTarget || handleElement;
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;
    dragState.startX = event.clientX;
    dragState.startY = event.clientY;
    dragState.startTime = performance.now();
    dragState.identifier = getDockIdentifierFromElement(dockElement);
    dragState.overFloatingDock = false;
    dragState.suppressClick = false;

    clearLongPressTimer();
    window.addEventListener('pointermove', handleDockPointerMove, { passive: false });
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    if (event.pointerType === 'touch') {
      dragState.longPressTimer = window.setTimeout(() => {
        dragState.longPressTimer = null;
        if (dragState.active && !dragState.dragging) {
          beginDragInteraction({ pointerId: dragState.pointerId });
        }
      }, DRAG_LONG_PRESS_MS);
    } else {
      beginDragInteraction(event);
    }
  };

  handleElement.addEventListener('pointerdown', (event) => {
    startDrag(event, handleElement);
  });

  handleElement.addEventListener('pointerup', finishDrag);
  handleElement.addEventListener('pointercancel', finishDrag);
  handleElement.addEventListener('click', (event) => {
    if (dragState.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      dragState.suppressClick = false;
    }
  });

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

  dockElement.addEventListener('pointerup', finishDrag);
  dockElement.addEventListener('pointercancel', finishDrag);
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
    return;
  }
  Object.entries(dockElements).forEach(([otherIdentifier]) => {
    if (otherIdentifier !== identifier && dockVisibilityState[otherIdentifier]) {
      setDockVisibility(otherIdentifier, false);
    }
  });

  if (lastMenuActivatedDock && lastMenuActivatedDock !== identifier) {
    collapseMenuDock(lastMenuActivatedDock);
    lastMenuActivatedDock = null;
  }

  delete dockElement.dataset.menuExpanded;
  dockElement.dataset.state = 'expanded';
  dockDisplayState[identifier] = 'expanded';
  DOCK_LAST_ACTIVE_STATE[identifier] = 'expanded';
  lastMenuActivatedDock = identifier;
  setDockVisibility(identifier, true);
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
  const cssColor = colorToCss(state.color, state.colorAlpha);
  paletteDockStatusSwatch.style.setProperty('--swatch-color', cssColor);
  paletteDockStatusSwatch.style.backgroundColor = 'transparent';
  paletteDockStatusSwatch.dataset.color = state.color;
  paletteDockStatusSwatch.dataset.alpha = String(state.colorAlpha);
}

function getColorModeLabel(mode) {
  return COLOR_MODE_LABELS[mode] || COLOR_MODE_LABELS[COLOR_MODE_DEFAULT] || 'RGB';
}

function updateColorModeInputs(mode) {
  if (!colorModeInputs.length) {
    return;
  }
  colorModeInputs.forEach((input) => {
    const isMatch = input.value === mode;
    input.checked = isMatch;
    input.setAttribute('aria-checked', isMatch ? 'true' : 'false');
    const parent = input.closest('.mini-radio');
    if (parent) {
      parent.classList.toggle('mini-radio--active', isMatch);
    }
  });
}

function setColorMode(mode, options = {}) {
  const { skipSave = false, force = false, rebuildPalette = true } = options;
  const normalized = COLOR_MODE_OPTIONS.includes(mode) ? mode : COLOR_MODE_DEFAULT;
  if (!force && state.colorMode === normalized) {
    updateColorModeInputs(normalized);
    return;
  }
  state.colorMode = normalized;
  updateColorModeInputs(normalized);
  updateCanvasDockStatus();
  if (rebuildPalette && !skipSave && !isRestoringState && normalized === 'indexed') {
    rebuildPaletteFromCanvas({ skipSave });
  }
  if (!skipSave && !isRestoringState) {
    queueStateSave();
  }
}

function setCanvasConfigTab(tabId, options = {}) {
  const { force = false, skipFocus = false } = options;
  if (!tabId) {
    return;
  }
  if (!force && tabId === activeCanvasTabId) {
    return;
  }
  const targetButton = canvasTabButtons.find((button) => button.dataset.canvasTab === tabId);
  const targetPanel = canvasTabPanels.find((panel) => panel.id === tabId);
  if (!targetButton || !targetPanel) {
    return;
  }
  activeCanvasTabId = tabId;
  canvasTabButtons.forEach((button) => {
    const isActive = button === targetButton;
    button.classList.toggle('mini-tabs__tab--active', isActive);
    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    button.tabIndex = isActive ? 0 : -1;
  });
  canvasTabPanels.forEach((panel) => {
    const isActive = panel === targetPanel;
    panel.classList.toggle('mini-tab-panel--active', isActive);
    if (isActive) {
      panel.hidden = false;
    } else {
      panel.hidden = true;
    }
  });
  if (!skipFocus && typeof targetButton.focus === 'function') {
    targetButton.focus();
  }
}

function updateCanvasDockStatus() {
  if (!canvasDockStatusText) {
    return;
  }
  const sizeLabel = `${state.width}×${state.height}`;
  const { width: baseWidth, height: baseHeight } = getBaseCanvasDimensions();
  const baseLabel = `${baseWidth}×${baseHeight}`;
  const pixelLabel = `${state.pixelScale}x`;
  let statusText = sizeLabel;
  if (state.pixelScale > 1) {
    statusText = `${baseLabel} → ${sizeLabel} (${pixelLabel})`;
  }
  const modeLabel = getColorModeLabel(state.colorMode);
  if (modeLabel) {
    statusText = `${statusText} · ${modeLabel}`;
  }
  canvasDockStatusText.textContent = statusText;
  if (canvasDockStatusButton) {
    canvasDockStatusButton.title = `${DOCK_LABELS.canvasDock} · ${statusText}`;
  }
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

function getDockBoundingRects(excludeElement) {
  const rects = [];
  if (floatingDock && floatingDock !== excludeElement) {
    const rect = floatingDock.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      rects.push(rect);
    }
  }
  Object.entries(dockElements).forEach(([, element]) => {
    if (!element || element === excludeElement) {
      return;
    }
    if (element.dataset.visible === 'true' && !element.hasAttribute('hidden')) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        rects.push(rect);
      }
    }
  });
  return rects;
}

function rectanglesOverlap(a, b, margin = 0) {
  return (
    a.left < b.right + margin &&
    a.right > b.left - margin &&
    a.top < b.bottom + margin &&
    a.bottom > b.top - margin
  );
}

function adjustDockForOverlap(dockElement) {
  if (!dockElement) {
    return null;
  }
  const margin = 12;
  const maxIterations = 8;
  const obstacles = getDockBoundingRects(dockElement);
  if (obstacles.length === 0) {
    return null;
  }

  const parsePosition = (value, fallback) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  let rect = dockElement.getBoundingClientRect();
  let left = parsePosition(dockElement.style.left, rect.left);
  let top = parsePosition(dockElement.style.top, rect.top);
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

  const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    rect = dockElement.getBoundingClientRect();
    const conflicting = obstacles.find((obstacle) => rectanglesOverlap(rect, obstacle, 4));
    if (!conflicting) {
      break;
    }

    const width = rect.width;
    const height = rect.height;
    const minLeft = margin;
    const minTop = margin;
    const maxLeft = Math.max(margin, viewportWidth - width - margin);
    const maxTop = Math.max(margin, viewportHeight - height - margin);

    let moved = false;

    if (conflicting.right + margin + width <= viewportWidth - margin + 0.5) {
      left = clampValue(conflicting.right + margin, minLeft, maxLeft);
      dockElement.style.left = `${left}px`;
      moved = true;
    } else if (conflicting.bottom + margin + height <= viewportHeight - margin + 0.5) {
      top = clampValue(conflicting.bottom + margin, minTop, maxTop);
      dockElement.style.top = `${top}px`;
      moved = true;
    } else if (conflicting.left - margin - width >= margin - 0.5) {
      left = clampValue(conflicting.left - margin - width, minLeft, maxLeft);
      dockElement.style.left = `${left}px`;
      moved = true;
    } else if (conflicting.top - margin - height >= margin - 0.5) {
      top = clampValue(conflicting.top - margin - height, minTop, maxTop);
      dockElement.style.top = `${top}px`;
      moved = true;
    }

    if (!moved) {
      break;
    }
  }

  rect = dockElement.getBoundingClientRect();
  left = parsePosition(dockElement.style.left, rect.left);
  top = parsePosition(dockElement.style.top, rect.top);
  return { left, top };
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
  const adjustedPosition = adjustDockForOverlap(dockElement);
  if (adjustedPosition) {
    clampedLeft = adjustedPosition.left;
    clampedTop = adjustedPosition.top;
    dockElement.style.left = `${clampedLeft}px`;
    dockElement.style.top = `${clampedTop}px`;
  }
  dockLastPositions[identifier] = { left: clampedLeft, top: clampedTop };
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
  if (dockMenuDragState.longPressTimer !== null) {
    window.clearTimeout(dockMenuDragState.longPressTimer);
    dockMenuDragState.longPressTimer = null;
  }
  dockMenuDragState.active = false;
  dockMenuDragState.dragging = false;
  dockMenuDragState.pointerId = null;
  dockMenuDragState.identifier = null;
  dockMenuDragState.sourceElement = null;
  dockMenuDragState.startX = 0;
  dockMenuDragState.startY = 0;
  dockMenuDragState.startTime = 0;
  dockMenuDragState.hasGrabOffset = false;
  dockMenuDragState.grabOffsetX = 0;
  dockMenuDragState.grabOffsetY = 0;
  dockMenuDragState.overFloatingDock = false;
  dockMenuDragState.lastClientX = 0;
  dockMenuDragState.lastClientY = 0;
  dockMenuDragState.suppressClick = false;
  hideDockMenuPlaceholder();
  setFloatingDockReceiving(false);
  window.removeEventListener('pointermove', handleDockMenuPointerMove);
  window.removeEventListener('pointerup', handleDockMenuPointerUp);
  window.removeEventListener('pointercancel', handleDockMenuPointerUp);
}

function startMenuDockDrag(event) {
  const { identifier, sourceElement } = dockMenuDragState;
  if (!identifier || !sourceElement || dockMenuDragState.dragging) {
    return;
  }
  dockMenuDragState.dragging = true;
  dockMenuDragState.suppressClick = true;
  if (dockMenuDragState.longPressTimer !== null) {
    window.clearTimeout(dockMenuDragState.longPressTimer);
    dockMenuDragState.longPressTimer = null;
  }
  collapseMenuDock(identifier);
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

  try {
    sourceElement.setPointerCapture(dockMenuDragState.pointerId);
  } catch (_) {
    // noop
  }

  const clientX = event?.clientX ?? dockMenuDragState.lastClientX;
  const clientY = event?.clientY ?? dockMenuDragState.lastClientY;
  dockMenuDragState.lastClientX = clientX;
  dockMenuDragState.lastClientY = clientY;
  updateMenuDockDragPosition({ clientX, clientY });
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
  const dockElement = dockElements[identifier];
  if (!dockElement || dockElement.dataset.visible === 'true') {
    return;
  }
  event.preventDefault();

  resetDockMenuDragState();

  dockMenuDragState.active = true;
  dockMenuDragState.pointerId = event.pointerId;
  dockMenuDragState.identifier = identifier;
  dockMenuDragState.sourceElement = dockElement;
  dockMenuDragState.startX = event.clientX;
  dockMenuDragState.startY = event.clientY;
  dockMenuDragState.startTime = performance.now();
  dockMenuDragState.dragging = false;
  const rect = dockElement.getBoundingClientRect();
  const offsetX = event.clientX - rect.left;
  const offsetY = event.clientY - rect.top;
  dockMenuDragState.grabOffsetX = Number.isFinite(offsetX) ? offsetX : rect.width / 2;
  dockMenuDragState.grabOffsetY = Number.isFinite(offsetY) ? offsetY : rect.height / 2;
  dockMenuDragState.hasGrabOffset = true;
  dockMenuDragState.overFloatingDock = false;
  dockMenuDragState.lastClientX = event.clientX;
  dockMenuDragState.lastClientY = event.clientY;
  dockMenuDragState.suppressClick = false;

  window.addEventListener('pointermove', handleDockMenuPointerMove, { passive: false });
  window.addEventListener('pointerup', handleDockMenuPointerUp);
  window.addEventListener('pointercancel', handleDockMenuPointerUp);

  if (event.pointerType === 'touch') {
    dockMenuDragState.longPressTimer = window.setTimeout(() => {
      dockMenuDragState.longPressTimer = null;
      if (dockMenuDragState.active && !dockMenuDragState.dragging) {
        startMenuDockDrag({
          clientX: dockMenuDragState.lastClientX,
          clientY: dockMenuDragState.lastClientY,
          pointerId: dockMenuDragState.pointerId,
        });
      }
    }, DOCK_MENU_LONG_PRESS_MS);
  } else {
    startMenuDockDrag(event);
  }
}

function handleDockMenuPointerMove(event) {
  if (!dockMenuDragState.active || event.pointerId !== dockMenuDragState.pointerId) {
    return;
  }

  dockMenuDragState.lastClientX = event.clientX;
  dockMenuDragState.lastClientY = event.clientY;

  const deltaX = event.clientX - dockMenuDragState.startX;
  const deltaY = event.clientY - dockMenuDragState.startY;
  const distance = Math.hypot(deltaX, deltaY);
  const elapsed = performance.now() - dockMenuDragState.startTime;

  if (!dockMenuDragState.dragging) {
    if (event.pointerType === 'touch') {
      if (dockMenuDragState.longPressTimer === null && distance < DOCK_MENU_DRAG_THRESHOLD && elapsed < DOCK_MENU_LONG_PRESS_MS) {
        return;
      }
      if (dockMenuDragState.longPressTimer !== null && elapsed >= DOCK_MENU_LONG_PRESS_MS) {
        window.clearTimeout(dockMenuDragState.longPressTimer);
        dockMenuDragState.longPressTimer = null;
      }
    }
    if (distance < DOCK_MENU_DRAG_THRESHOLD && event.pointerType !== 'touch') {
      return;
    }
    startMenuDockDrag(event);
  }

  if (!dockMenuDragState.dragging) {
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

  const sourceElement = dockMenuDragState.sourceElement;
  if (dockMenuDragState.dragging) {
    if (sourceElement) {
      try {
        sourceElement.releasePointerCapture(event.pointerId);
      } catch (_) {
        // ignore
      }
    }
    event.preventDefault();
    finishMenuDockDrag(event);
    return;
  }

  if (sourceElement) {
    try {
      sourceElement.releasePointerCapture(event.pointerId);
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

function initHelpButtons() {
  const buttons = document.querySelectorAll('.mini-dock__help[data-help-id], .floating-dock__help[data-help-id]');
  buttons.forEach((button) => {
    if (!button.hasAttribute('aria-pressed')) {
      button.setAttribute('aria-pressed', 'false');
    }
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleHelpPopover(button);
    });
  });
}

function toggleHelpPopover(button) {
  if (activeHelpButton === button) {
    hideHelpPopover();
    return;
  }
  showHelpPopover(button);
}

function showHelpPopover(button) {
  const helpId = button.dataset.helpId;
  if (!helpId || !(helpId in DOCK_HELP_CONTENT)) {
    return;
  }
  hideHelpPopover();
  const config = DOCK_HELP_CONTENT[helpId];
  const popover = document.createElement('div');
  popover.className = 'help-popover';
  popover.setAttribute('role', 'dialog');
  popover.setAttribute('aria-modal', 'false');

  const title = document.createElement('div');
  title.className = 'help-popover__title';
  title.textContent = config.title;
  popover.appendChild(title);

  if (Array.isArray(config.lines) && config.lines.length > 0) {
    const list = document.createElement('ul');
    list.className = 'help-popover__list';
    config.lines.forEach((line) => {
      const item = document.createElement('li');
      item.textContent = line;
      list.appendChild(item);
    });
    popover.appendChild(list);
  }

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'help-popover__close';
  closeButton.textContent = '閉じる';
  closeButton.addEventListener('click', () => {
    hideHelpPopover();
  });
  popover.appendChild(closeButton);

  document.body.appendChild(popover);
  positionHelpPopover(button, popover);
  activeHelpPopover = popover;
  activeHelpButton = button;
  button.setAttribute('aria-pressed', 'true');
  attachHelpGlobalListeners();
}

function positionHelpPopover(button, popover) {
  const margin = 16;
  const buttonRect = button.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  let left = buttonRect.right - popoverRect.width;
  let top = buttonRect.bottom + 10;
  if (left < margin) {
    left = margin;
  }
  if (top + popoverRect.height > window.innerHeight - margin) {
    top = buttonRect.top - popoverRect.height - 10;
  }
  if (top < margin) {
    top = Math.min(window.innerHeight - popoverRect.height - margin, Math.max(margin, buttonRect.bottom + 10));
  }
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function hideHelpPopover() {
  if (activeHelpButton) {
    activeHelpButton.setAttribute('aria-pressed', 'false');
    activeHelpButton = null;
  }
  if (activeHelpPopover) {
    if (activeHelpPopover.parentElement) {
      activeHelpPopover.parentElement.removeChild(activeHelpPopover);
    }
    activeHelpPopover = null;
  }
  detachHelpGlobalListeners();
}

function attachHelpGlobalListeners() {
  if (helpListenersAttached) {
    return;
  }
  document.addEventListener('pointerdown', handleHelpDocumentPointerDown, true);
  document.addEventListener('keydown', handleHelpKeydown, true);
  window.addEventListener('resize', hideHelpPopover);
  window.addEventListener('scroll', hideHelpPopover, true);
  helpListenersAttached = true;
}

function detachHelpGlobalListeners() {
  if (!helpListenersAttached) {
    return;
  }
  document.removeEventListener('pointerdown', handleHelpDocumentPointerDown, true);
  document.removeEventListener('keydown', handleHelpKeydown, true);
  window.removeEventListener('resize', hideHelpPopover);
  window.removeEventListener('scroll', hideHelpPopover, true);
  helpListenersAttached = false;
}

function handleHelpDocumentPointerDown(event) {
  if (!activeHelpPopover) {
    return;
  }
  if (activeHelpPopover.contains(event.target)) {
    return;
  }
  if (activeHelpButton && activeHelpButton.contains(event.target)) {
    return;
  }
  hideHelpPopover();
}

function handleHelpKeydown(event) {
  if (event.key === 'Escape') {
    hideHelpPopover();
  }
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
  ensureCanvasCentered();
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

  const MOVE_THRESHOLD_PX = 6;
  let toggleDragCandidate = null;
  let suppressToggleClick = false;
  let windowListenersAttached = false;

  const addDraggingClass = (target) => {
    floatingDock.classList.add('floating-dock--dragging');
    if (target === dockHandle) {
      dockHandle.classList.add('floating-dock__handle--dragging');
    } else if (target === dockToggle) {
      dockToggle.classList.add('floating-dock__toggle--dragging');
    }
  };

  const removeDraggingClass = () => {
    floatingDock.classList.remove('floating-dock--dragging');
    dockHandle.classList.remove('floating-dock__handle--dragging');
    dockToggle?.classList.remove('floating-dock__toggle--dragging');
  };

  const attachWindowListeners = () => {
    if (windowListenersAttached) {
      return;
    }
    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
    windowListenersAttached = true;
  };

  const detachWindowListeners = () => {
    if (!windowListenersAttached) {
      return;
    }
    window.removeEventListener('pointermove', handleWindowPointerMove);
    window.removeEventListener('pointerup', handleWindowPointerUp);
    window.removeEventListener('pointercancel', handleWindowPointerUp);
    windowListenersAttached = false;
  };

  const beginDockDrag = (event, captureTarget) => {
    if (dockDragState.active) {
      return;
    }
    const rect = floatingDock.getBoundingClientRect();
    dockDragState.active = true;
    dockDragState.pointerId = event.pointerId;
    dockDragState.offsetX = event.clientX - rect.left;
    dockDragState.offsetY = event.clientY - rect.top;
    dockDragState.captureTarget = captureTarget || dockHandle;
    addDraggingClass(dockDragState.captureTarget);
    userMovedDock = true;
    if (
      dockDragState.captureTarget &&
      typeof dockDragState.captureTarget.setPointerCapture === 'function'
    ) {
      try {
        dockDragState.captureTarget.setPointerCapture(event.pointerId);
      } catch (_) {
        // noop
      }
    }
    setDockPosition(event.clientX - dockDragState.offsetX, event.clientY - dockDragState.offsetY);
  };

  const finishDockDrag = (event) => {
    if (!dockDragState.active || event.pointerId !== dockDragState.pointerId) {
      return;
    }
    try {
      const target = dockDragState.captureTarget;
      if (target && typeof target.releasePointerCapture === 'function') {
        target.releasePointerCapture(event.pointerId);
      }
    } catch (_) {
      // noop
    }
    removeDraggingClass();
    dockDragState.active = false;
    dockDragState.pointerId = null;
    dockDragState.captureTarget = null;
  };

  const handleWindowPointerMove = (event) => {
    if (dockDragState.active && event.pointerId === dockDragState.pointerId) {
      event.preventDefault();
      setDockPosition(event.clientX - dockDragState.offsetX, event.clientY - dockDragState.offsetY);
      return;
    }
    if (toggleDragCandidate && event.pointerId === toggleDragCandidate.pointerId) {
      const dx = event.clientX - toggleDragCandidate.startX;
      const dy = event.clientY - toggleDragCandidate.startY;
      if (Math.hypot(dx, dy) > MOVE_THRESHOLD_PX) {
        suppressToggleClick = true;
        beginDockDrag(event, dockToggle);
        toggleDragCandidate = null;
        event.preventDefault();
      }
    }
  };

  const handleWindowPointerUp = (event) => {
    if (dockDragState.active && event.pointerId === dockDragState.pointerId) {
      setDockPosition(event.clientX - dockDragState.offsetX, event.clientY - dockDragState.offsetY);
      finishDockDrag(event);
    }
    if (toggleDragCandidate && event.pointerId === toggleDragCandidate.pointerId) {
      toggleDragCandidate = null;
    }
    detachWindowListeners();
    if (suppressToggleClick) {
      window.setTimeout(() => {
        suppressToggleClick = false;
      }, 0);
    }
  };

  dockHandle.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.preventDefault();
    attachWindowListeners();
    beginDockDrag(event, dockHandle);
  });

  dockHandle.addEventListener('pointerup', (event) => {
    if (dockDragState.active && event.pointerId === dockDragState.pointerId) {
      handleWindowPointerUp(event);
    }
  });

  dockHandle.addEventListener('pointercancel', (event) => {
    if (dockDragState.active && event.pointerId === dockDragState.pointerId) {
      handleWindowPointerUp(event);
    }
  });

  if (dockToggle) {
    dockToggle.addEventListener('pointerdown', (event) => {
      if (floatingDock.dataset.collapsed !== 'true') {
        toggleDragCandidate = null;
        suppressToggleClick = false;
        return;
      }
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }
      toggleDragCandidate = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
      };
      suppressToggleClick = false;
      attachWindowListeners();
    });

    dockToggle.addEventListener('click', (event) => {
      if (suppressToggleClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

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
  refreshHoverPreviews();
}

function getBaseCanvasDimensions() {
  const currentPixelScale = Math.max(1, state.pixelScale || 1);
  const baseWidth = Math.max(1, Math.round(state.width / currentPixelScale));
  const baseHeight = Math.max(1, Math.round(state.height / currentPixelScale));
  return { width: baseWidth, height: baseHeight };
}

function updatePixelSizeConstraints() {
  if (!pixelSizeInput) {
    return;
  }
  const { width: baseWidth, height: baseHeight } = getBaseCanvasDimensions();
  const maxWidth = Math.max(baseWidth, Number(widthInput?.max) || baseWidth);
  const maxHeight = Math.max(baseHeight, Number(heightInput?.max) || baseHeight);
  const maxMultiplier = Math.max(
    1,
    Math.min(
      Math.floor(maxWidth / baseWidth) || 1,
      Math.floor(maxHeight / baseHeight) || 1,
      Number(pixelSizeMax) || PIXEL_SIZE_MAX,
    ),
  );
  const resolvedMax = Math.max(pixelSizeMin, maxMultiplier);
  pixelSizeInput.max = String(resolvedMax);
  pixelSizeMax = resolvedMax;
  const currentValue = Number(pixelSizeInput.value);
  if (Number.isFinite(currentValue) && currentValue > resolvedMax) {
    pixelSizeInput.value = String(resolvedMax);
  }
}

function resetCanvasViewState() {
  userAdjustedZoom = false;
  canvasAutoCentered = false;
  state.offsetX = 0;
  state.offsetY = 0;
}

function updatePixelSize(options = {}) {
  const { skipComposite = false, preserveDimensions = false, skipSave = false, resetView = false } = options;
  const min = Number(pixelSizeInput?.min) || pixelSizeMin;
  const { width: baseWidth, height: baseHeight } = getBaseCanvasDimensions();
  updatePixelSizeConstraints();
  const maxFromInput = Number(pixelSizeInput?.max) || pixelSizeMax;
  const rawValue = Number(pixelSizeInput?.value);
  const candidate = Number.isFinite(rawValue) ? rawValue : state.pixelScale || PIXEL_SIZE_DEFAULT;
  const clamped = clamp(candidate, min, Math.max(min, maxFromInput));
  if (pixelSizeInput && clamped !== rawValue) {
    pixelSizeInput.value = String(clamped);
  }

  const previousPixelSize = Math.max(1, state.pixelScale || 1);
  const pixelSizeChanged = previousPixelSize !== clamped;
  if (!pixelSizeChanged) {
    if (resetView) {
      resetCanvasViewState();
    }
    applyCanvasDisplaySize();
    if (!userAdjustedZoom) {
      fitZoomToContainer();
    } else {
      applyCanvasZoom();
    }
    if (resetView) {
      ensureCanvasCentered({ force: true });
    }
    updateCanvasDockStatus();
    return;
  }

  state.pixelScale = clamped;

  if (!preserveDimensions) {
    const baseWidthRaw = Math.max(1, state.width / previousPixelSize);
    const baseHeightRaw = Math.max(1, state.height / previousPixelSize);
    const targetWidth = Math.max(1, Math.round(baseWidthRaw * clamped));
    const targetHeight = Math.max(1, Math.round(baseHeightRaw * clamped));
    resizeCanvas(targetWidth, targetHeight, {
      resample: true,
      skipComposite,
      resetView,
    });
  } else {
    if (resetView) {
      resetCanvasViewState();
    }
    applyCanvasDisplaySize();
    if (!userAdjustedZoom) {
      fitZoomToContainer();
    } else {
      applyCanvasZoom();
    }
    if (!skipComposite) {
      compositeLayers();
    }
    updateCanvasDockStatus();
    const paletteSnapshot = capturePaletteSnapshot();
    framesState.frames.forEach((frame) => {
      if (frame && frame.snapshot) {
        frame.snapshot.pixelSize = clamped;
        frame.snapshot.colorMode = state.colorMode;
        frame.snapshot.color = state.color;
        frame.snapshot.colorAlpha = state.colorAlpha;
        frame.snapshot.palette = paletteSnapshot.map((entry) => ({ ...entry }));
      }
    });
    enforceHistoryMemoryBudget();
    if (resetView) {
      ensureCanvasCentered({ force: true });
    }
  }

  if (!skipSave && preserveDimensions) {
    queueStateSave();
  }
}

function updateHistoryLimit(options = {}) {
  const { skipSave = false } = options;
  const min = Number(historyLimitInput?.min) || historyLimitMin;
  const max = Number(historyLimitInput?.max) || historyLimitMax;
  const rawValue = Number(historyLimitInput?.value);
  const candidate = Number.isFinite(rawValue) ? rawValue : state.historyLimit || HISTORY_LIMIT_DEFAULT;
  const clampedValue = clamp(Math.floor(candidate), min, max);
  const resolved = Math.max(1, clampedValue);
  if (historyLimitInput && resolved !== rawValue) {
    historyLimitInput.value = String(resolved);
  }
  const historyLimitChanged = state.historyLimit !== resolved;
  state.historyLimit = resolved;
  trimHistoryStacks();
  updateUndoRedoUI();
  if (historyLimitChanged && !skipSave) {
    queueStateSave();
  }
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

function capturePaletteSnapshot() {
  const snapshot = [];
  const transparent = createTransparentPaletteEntry();
  snapshot.push(transparent);
  if (!paletteContainer) {
    const existing = Array.isArray(state.palette) ? state.palette : [];
    existing.forEach((entry) => {
      if (!entry || isTransparentPaletteEntry(entry)) {
        return;
      }
      snapshot.push({ ...entry });
    });
    return ensurePaletteHasTransparentEntry(snapshot);
  }
  const swatches = Array.from(paletteContainer.querySelectorAll('.swatch:not(.swatch--add)'));
  swatches.forEach((swatch) => {
    const color = normalizeHex(swatch.dataset.color || state.color);
    const alpha = clamp(Number(swatch.dataset.alpha ?? 1), 0, 1);
    const existing = findPaletteEntry(color, alpha);
    const storedUint32 = existing?.storedUint32 ?? null;
    const entry = createPaletteEntry(color, alpha, storedUint32);
    if (!isTransparentPaletteEntry(entry)) {
      snapshot.push(entry);
    }
  });
  return ensurePaletteHasTransparentEntry(snapshot);
}

function palettesApproximatelyEqual(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index += 1) {
    const lhs = a[index];
    const rhs = b[index];
    if (!lhs || !rhs) {
      return false;
    }
    if (lhs.color !== rhs.color) {
      return false;
    }
    if (Math.abs((lhs.alpha ?? 0) - (rhs.alpha ?? 0)) > 0.0005) {
      return false;
    }
  }
  return true;
}

function updatePaletteState(options = {}) {
  const { skipSave = false, skipRecolor = false } = options;
  const previousPalette = state.palette.map((entry) => ({ ...entry }));
  const snapshot = capturePaletteSnapshot();
  state.palette = ensurePaletteHasTransparentEntry(snapshot.map((entry) => ({ ...entry })));
  rebuildIndexedColorLookup();

  if (
    !skipRecolor &&
    !isRestoringState &&
    state.colorMode === 'indexed' &&
    previousPalette.length > 0 &&
    !palettesApproximatelyEqual(previousPalette, state.palette)
  ) {
    const length = Math.min(previousPalette.length, state.palette.length);
    for (let index = 0; index < length; index += 1) {
      const prev = previousPalette[index];
      const next = state.palette[index];
      if (!prev || !next) {
        continue;
      }
      const alphaChanged = Math.abs((prev.alpha ?? 0) - (next.alpha ?? 0)) > 0.0005;
      if (prev.color !== next.color || alphaChanged) {
        applyIndexedPaletteRecolor(prev.color, prev.alpha, next.color, next.alpha, prev.storedUint32, next.storedUint32);
      }
    }
  }

  if (!skipSave && !isRestoringState) {
    queueStateSave();
  }
}

function initPalette(paletteEntries = null, options = {}) {
  const { activeColor = null, activeAlpha = null, skipSave = false } = options;
  const hasPaletteData = Array.isArray(paletteEntries) && paletteEntries.length > 0;
  const sourceEntries = hasPaletteData
    ? paletteEntries
    : defaultPalette.map((hex) => ({ color: hex, alpha: 1 }));
  let entries = sourceEntries.map((entry) =>
    createPaletteEntry(
      entry?.color ?? state.color ?? defaultPalette[0],
      entry?.alpha ?? 1,
      typeof entry?.storedUint32 === 'number' ? entry.storedUint32 : null,
    ),
  );

  entries = ensurePaletteHasTransparentEntry(entries);

  state.palette = entries.map((entry) => ({ ...entry }));
  rebuildIndexedColorLookup();

  if (!paletteContainer) {
    return;
  }

  paletteContainer.innerHTML = '';
  addPaletteButton = null;
  entries.forEach((entry) => {
    if (isTransparentPaletteEntry(entry)) {
      return;
    }
    const button = createPaletteSwatch(entry.color, entry.alpha);
    paletteContainer.appendChild(button);
  });
  ensurePaletteAddButton();

  const desiredColor = activeColor ? normalizeHex(activeColor) : normalizeHex(state.color || entries[0]?.color || defaultPalette[0]);
  const matchingEntry = entries.find((entry) => entry.color === desiredColor) || entries[0] || null;
  const resolvedAlpha = clamp(
    Number.isFinite(activeAlpha) ? Number(activeAlpha) : matchingEntry?.alpha ?? state.colorAlpha ?? 1,
    0,
    1,
  );

  setActiveColor(desiredColor, null, { closePanel: false, alpha: resolvedAlpha });
  updatePaletteDockStatus();
  updatePaletteAddButtonState();
  updatePaletteState({ skipSave: skipSave || isRestoringState, skipRecolor: true });
}

function replaceColorInImageData(imageData, fromUint32, toUint32, toAlphaByte = 255) {
  if (!imageData || !imageData.data || imageData.data.length === 0) {
    return { changed: false, hasContent: false };
  }
  const pixels = new Uint32Array(imageData.data.buffer);
  let changed = false;
  let hasContent = false;
  for (let index = 0; index < pixels.length; index += 1) {
    const current = pixels[index];
    if (current === fromUint32) {
      pixels[index] = toUint32;
      changed = true;
    }
    if (!hasContent && (pixels[index] >>> 24) !== 0) {
      hasContent = true;
    }
  }
  if (!hasContent && changed && toAlphaByte !== 0) {
    hasContent = true;
  }
  return { changed, hasContent };
}

function replaceColorInContext(ctx, width, height, fromUint32, toUint32, toAlphaByte = 255) {
  if (!ctx || width <= 0 || height <= 0) {
    return false;
  }
  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, width, height);
  } catch (error) {
    return false;
  }
  const { changed } = replaceColorInImageData(imageData, fromUint32, toUint32, toAlphaByte);
  if (!changed) {
    return false;
  }
  ctx.putImageData(imageData, 0, 0);
  return true;
}

function applyIndexedPaletteRecolor(fromHex, fromAlpha, toHex, toAlpha, fromStoredUint32 = null, toStoredUint32 = null) {
  if (state.colorMode !== 'indexed') {
    return;
  }
  if (!fromHex || !toHex) {
    return;
  }
  redrawAllLayersFromIndices();
  markHistoryDirty();
  compositeLayers({ skipContentCheck: true });
  refreshSelectionContentPreview();
  renderSelectionOverlay();
  finalizeHistoryEntry({ force: true });
}

function rebuildPaletteFromCanvas(options = {}) {
  const { skipSave = false } = options;
  if (!pixelCanvas || state.width <= 0 || state.height <= 0) {
    return;
  }

  compositeLayers({ skipUIUpdate: true, skipContentCheck: true });
  let imageData;
  try {
    imageData = ctx.getImageData(0, 0, state.width, state.height);
  } catch (error) {
    return;
  }

  const { data } = imageData;
  const colorUsage = new Map();
  for (let index = 0; index < data.length; index += 4) {
    const alphaByte = data[index + 3];
    if (alphaByte === 0) {
      continue;
    }
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const key = `${r},${g},${b},${alphaByte}`;
    const entry = colorUsage.get(key);
    if (entry) {
      entry.count += 1;
    } else {
      colorUsage.set(key, {
        r,
        g,
        b,
        alphaByte,
        count: 1,
      });
    }
  }

  if (colorUsage.size === 0) {
    return;
  }

  const sorted = Array.from(colorUsage.values()).sort((a, b) => b.count - a.count);
  const paletteEntries = [];
  const seenKeys = new Set();
  const limit = Math.min(MAX_PALETTE_COLORS, sorted.length);
  for (let i = 0; i < limit && paletteEntries.length < MAX_PALETTE_COLORS; i += 1) {
    const { r, g, b, alphaByte } = sorted[i];
    const alpha = clamp(alphaByte / 255, 0, 1);
    const unpremultiplied = unpremultiplyColor(r, g, b, alphaByte);
    const hex = normalizeHex(rgbToHex(unpremultiplied.r, unpremultiplied.g, unpremultiplied.b));
    const storedUint32 = packColorBytes(r, g, b, alphaByte);
    const key = storedUint32;
    if (seenKeys.has(key)) {
      continue;
    }
    seenKeys.add(key);
    const entry = createPaletteEntry(hex, alpha, storedUint32);
    paletteEntries.push(entry);
  }

  const normalizedCurrentColor = normalizeHex(state.color);
  const currentAlpha = clamp(Math.round(state.colorAlpha * 1000) / 1000, 0, 1);
  const hasCurrentColor = paletteEntries.some(
    (entry) => entry.color === normalizedCurrentColor && Math.abs(entry.alpha - currentAlpha) <= 0.0005,
  );
  if (!hasCurrentColor) {
    const entry = createPaletteEntry(normalizedCurrentColor, currentAlpha);
    paletteEntries.unshift(entry);
    if (paletteEntries.length > MAX_PALETTE_COLORS) {
      paletteEntries.length = MAX_PALETTE_COLORS;
    }
  }

  const ensuredPalette = ensurePaletteHasTransparentEntry(paletteEntries);
  initPalette(paletteEntries, {
    activeColor: normalizedCurrentColor,
    activeAlpha: currentAlpha,
    skipSave,
  });
  return ensuredPalette;
}

function createPaletteSwatch(hex, alpha = 1) {
  const normalized = normalizeHex(hex);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'swatch';
  const clampedAlpha = clamp(alpha, 0, 1);
  const cssColor = colorToCss(normalized, clampedAlpha);
  button.style.setProperty('--swatch-color', cssColor);
  button.style.backgroundColor = 'transparent';
  button.dataset.color = normalized;
  button.dataset.alpha = String(clampedAlpha);
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
  paletteContainer.insertBefore(addPaletteButton, paletteContainer.firstChild);
  updatePaletteAddButtonState();
}

function addPaletteColor() {
  if (!paletteContainer) {
    return;
  }
  if (getPaletteColorCount() >= MAX_PALETTE_COLORS) {
    updatePaletteAddButtonState();
    flashDock('paletteDock');
    return;
  }
  const newColor = state.color || '#ffffff';
  const normalized = normalizeHex(newColor);
  const button = createPaletteSwatch(normalized, state.colorAlpha);
  if (addPaletteButton && addPaletteButton.parentElement === paletteContainer) {
    const next = addPaletteButton.nextSibling;
    if (next) {
      paletteContainer.insertBefore(button, next);
    } else {
      paletteContainer.appendChild(button);
    }
  } else {
    paletteContainer.appendChild(button);
    ensurePaletteAddButton();
  }
  setActiveColor(normalized, button, { closePanel: false, alpha: state.colorAlpha });
  updatePaletteAddButtonState();
  updatePaletteState();
}

function getPaletteColorCount() {
  if (!paletteContainer) {
    return 0;
  }
  return paletteContainer.querySelectorAll('.swatch:not(.swatch--add)').length;
}

function updatePaletteAddButtonState() {
  if (!addPaletteButton) {
    return;
  }
  const canAdd = getPaletteColorCount() < MAX_PALETTE_COLORS;
  addPaletteButton.disabled = !canAdd;
  addPaletteButton.setAttribute('aria-disabled', canAdd ? 'false' : 'true');
}

function rebuildIndexedColorLookup() {
  indexedColorLookup.clear();
  state.palette.forEach((entry, index) => {
    if (!entry || typeof entry.storedUint32 !== 'number') {
      return;
    }
    indexedColorLookup.set(entry.storedUint32, index);
  });
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

function drawBrush(x, y, targetCtx = null, targetLayer = null) {
  const layer = targetLayer || (targetCtx ? getActiveLayer() : getActiveLayer());
  const context = targetCtx || layer?.ctx;
  if (!context) {
    return;
  }
  const indexBuffer = layer?.indexBuffer;
  const width = state.width;
  const paletteIndex = getPaletteIndexForColor(state.color, state.colorAlpha);
  context.fillStyle = colorToCss(state.color, state.colorAlpha);
  const applied = applyBrush(x, y, (px, py) => {
    context.fillRect(px, py, 1, 1);
    if (indexBuffer && px >= 0 && px < width && py >= 0 && py < state.height) {
      indexBuffer[py * width + px] = paletteIndex;
    }
  });
  const shouldMarkHistory = !targetCtx || targetLayer === layer;
  if (applied && shouldMarkHistory) {
    markHistoryDirty();
  }
}

function drawLinePixels(x0, y0, x1, y1, handler) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currentX = x0;
  let currentY = y0;

  while (true) {
    handler(currentX, currentY);
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

function drawLine(x0, y0, x1, y1, usePen = true) {
  const activeLayer = getActiveLayer();
  if (!activeLayer) {
    return;
  }
  const layerCtx = activeLayer.ctx;
  drawLinePixels(x0, y0, x1, y1, (currentX, currentY) => {
    if (usePen) {
      drawBrush(currentX, currentY, layerCtx, activeLayer);
    } else {
      eraseBrush(currentX, currentY, layerCtx, activeLayer);
    }
  });
}

function eraseBrush(x, y, targetCtx = null, targetLayer = null) {
  const layer = targetLayer || (targetCtx ? getActiveLayer() : getActiveLayer());
  const context = targetCtx || layer?.ctx;
  if (!context) {
    return;
  }
  const indexBuffer = layer?.indexBuffer;
  const width = state.width;
  const applied = applyBrush(x, y, (px, py) => {
    context.clearRect(px, py, 1, 1);
    if (indexBuffer && px >= 0 && px < width && py >= 0 && py < state.height) {
      indexBuffer[py * width + px] = 0;
    }
  });
  const shouldMarkHistory = !targetCtx || targetLayer === layer;
  if (applied && shouldMarkHistory) {
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
  return rgbaToUint32(r, g, b, 1);
}

function colorToUint32(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return rgbaToUint32(r, g, b, alpha);
}

function floodFill(x, y, hexColor) {
  cancelActiveFloodFill();
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
  const fillColor = colorToUint32(hexColor, state.colorAlpha);
  if (targetColor === fillColor) {
    return;
  }
  const paletteIndex = getPaletteIndexForColor(hexColor, state.colorAlpha);
  const stack = [x, y];
  floodFillState.task = {
    layerCtx,
    imageData,
    pixels,
    data: imageData.data,
    stack,
    targetColor,
    fillColor,
    width,
    height,
    changed: false,
    raf: null,
    indexBuffer: activeLayer.indexBuffer,
    paletteIndex,
  };
  processFloodFillChunk();
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

function resizeCanvas(newWidth, newHeight, options = {}) {
  const { resample = false, skipComposite = false, skipHistory = false, resetView = false } = options;
  const clampedWidth = clamp(newWidth, Number(widthInput.min), Number(widthInput.max));
  const clampedHeight = clamp(newHeight, Number(heightInput.min), Number(heightInput.max));
  const oldWidth = state.width;
  const oldHeight = state.height;

  if (clampedWidth === oldWidth && clampedHeight === oldHeight) {
    return;
  }

  if (!skipHistory) {
    markHistoryDirty();
  }

  layersState.layers.forEach((layer) => {
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = oldWidth;
    sourceCanvas.height = oldHeight;
    const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (sourceCtx) {
      sourceCtx.imageSmoothingEnabled = false;
      sourceCtx.drawImage(layer.canvas, 0, 0);
    }
    layer.canvas.width = clampedWidth;
    layer.canvas.height = clampedHeight;
    layer.ctx.imageSmoothingEnabled = false;
    const oldIndexBuffer = layer.indexBuffer;
    const newIndexBuffer = createIndexBuffer(clampedWidth, clampedHeight);
    if (sourceCtx) {
      if (resample) {
        layer.ctx.drawImage(sourceCanvas, 0, 0, oldWidth, oldHeight, 0, 0, clampedWidth, clampedHeight);
        if (oldIndexBuffer?.length === oldWidth * oldHeight) {
          const scaleX = oldWidth / clampedWidth;
          const scaleY = oldHeight / clampedHeight;
          for (let y = 0; y < clampedHeight; y += 1) {
            const srcY = Math.min(oldHeight - 1, Math.floor(y * scaleY));
            for (let x = 0; x < clampedWidth; x += 1) {
              const srcX = Math.min(oldWidth - 1, Math.floor(x * scaleX));
              newIndexBuffer[y * clampedWidth + x] = oldIndexBuffer[srcY * oldWidth + srcX];
            }
          }
        }
      } else {
        const copyWidth = Math.min(clampedWidth, oldWidth);
        const copyHeight = Math.min(clampedHeight, oldHeight);
        layer.ctx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
        if (oldIndexBuffer?.length === oldWidth * oldHeight) {
          for (let y = 0; y < copyHeight; y += 1) {
            const srcOffset = y * oldWidth;
            const destOffset = y * clampedWidth;
            for (let x = 0; x < copyWidth; x += 1) {
              newIndexBuffer[destOffset + x] = oldIndexBuffer[srcOffset + x];
            }
          }
        }
      }
    }
    layer.indexBuffer = newIndexBuffer;
    layer.hasContent = detectLayerHasContent(layer);
  });

  pixelCanvas.width = clampedWidth;
  pixelCanvas.height = clampedHeight;
  ctx.imageSmoothingEnabled = false;

  state.width = clampedWidth;
  state.height = clampedHeight;
  widthInput.value = String(clampedWidth);
  heightInput.value = String(clampedHeight);
  clearSelection({ silent: true });
  if (resetView) {
    resetCanvasViewState();
  }
  applyCanvasDisplaySize();
  if (!userAdjustedZoom) {
    fitZoomToContainer();
  } else {
    applyCanvasZoom();
  }
  updatePixelSizeConstraints();

  if (!skipComposite) {
    compositeLayers();
  }
  refreshExportOptions();
  const paletteSnapshot = capturePaletteSnapshot();
  framesState.frames.forEach((frame) => {
    if (frame && frame.snapshot) {
      resizeSnapshot(frame.snapshot, clampedWidth, clampedHeight, { resample });
      frame.snapshot.pixelSize = state.pixelScale;
      frame.snapshot.colorMode = state.colorMode;
      frame.snapshot.color = state.color;
      frame.snapshot.colorAlpha = state.colorAlpha;
      frame.snapshot.palette = paletteSnapshot.map((entry) => ({ ...entry }));
      frame.layerContent = computeFrameLayerContent(frame.snapshot);
    }
  });
  renderLayerList();
  if (virtualCursorState.enabled) {
    updateVirtualCursorPosition(virtualCursorState.x, virtualCursorState.y);
  }
  updateCanvasDockStatus();
  flashDock('canvasDock');
  scheduleDockAutoHide();
  canvasAutoCentered = false;
  ensureCanvasCentered({ force: true });
  enforceHistoryMemoryBudget();
  updateMemoryUsageDisplay();
  if (!skipHistory) {
    finalizeHistoryEntry();
  }
}

function clearCanvas() {
  const hasContent = layersState.layers.some((layer) => layer.hasContent);
  if (!hasContent) {
    return;
  }
  markHistoryDirty();
  layersState.layers.forEach((layer) => {
    layer.ctx.clearRect(0, 0, state.width, state.height);
    if (layer.indexBuffer) {
      layer.indexBuffer.fill(0);
    }
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

function compositeSnapshotToContext(snapshot, targetCtx) {
  if (!targetCtx) {
    return;
  }
  const destWidth = targetCtx.canvas.width;
  const destHeight = targetCtx.canvas.height;
  targetCtx.clearRect(0, 0, destWidth, destHeight);
  if (!snapshot || !Array.isArray(snapshot.layers)) {
    return;
  }
  for (let index = snapshot.layers.length - 1; index >= 0; index -= 1) {
    const layer = snapshot.layers[index];
    if (!layer || layer.visible === false) {
      continue;
    }
    const opacity = clamp(Number(layer.opacity) || 1, 0, 1);
    if (opacity <= 0) {
      continue;
    }
    const imageData = layer.imageData;
    if (!(imageData instanceof ImageData)) {
      continue;
    }
    const { canvas: layerCanvas, ctx: layerCtx } = createOffscreenCanvas(imageData.width, imageData.height);
    try {
      layerCtx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.warn('レイヤーの合成に失敗しました', error);
      continue;
    }
    targetCtx.globalAlpha = opacity;
    targetCtx.drawImage(layerCanvas, 0, 0, imageData.width, imageData.height, 0, 0, destWidth, destHeight);
  }
  targetCtx.globalAlpha = 1;
}

function prepareGifFrames(imageDataList) {
  const colorUsage = new Map();
  let hasTransparency = false;
  imageDataList.forEach((imageData) => {
    const { data } = imageData;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 128) {
        hasTransparency = true;
        continue;
      }
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = (r << 16) | (g << 8) | b;
      const entry = colorUsage.get(key);
      if (entry) {
        entry.count += 1;
      } else {
        colorUsage.set(key, { r, g, b, count: 1 });
      }
    }
  });

  const palette = [];
  let transparentIndex = null;
  if (hasTransparency) {
    transparentIndex = palette.length;
    palette.push({ r: 0, g: 0, b: 0 });
  }

  const sortedColors = Array.from(colorUsage.values()).sort((a, b) => b.count - a.count);
  const maxColors = hasTransparency ? 255 : 256;
  for (let i = 0; i < sortedColors.length && palette.length < maxColors; i += 1) {
    palette.push({ r: sortedColors[i].r, g: sortedColors[i].g, b: sortedColors[i].b });
  }

  if (palette.length < 2) {
    palette.push({ r: 0, g: 0, b: 0 });
  }

  const directMap = new Map();
  for (let index = 0; index < palette.length; index += 1) {
    if (index === transparentIndex) {
      continue;
    }
    const color = palette[index];
    directMap.set((color.r << 16) | (color.g << 8) | color.b, index);
  }

  const nearestCache = new Map();
  const resolveIndex = (r, g, b) => {
    const key = (r << 16) | (g << 8) | b;
    const direct = directMap.get(key);
    if (typeof direct === 'number') {
      return direct;
    }
    const cached = nearestCache.get(key);
    if (typeof cached === 'number') {
      return cached;
    }
    let bestIndex = transparentIndex === 0 && palette.length > 1 ? 1 : 0;
    let bestDistance = Infinity;
    for (let i = 0; i < palette.length; i += 1) {
      if (i === transparentIndex) {
        continue;
      }
      const color = palette[i];
      const dr = color.r - r;
      const dg = color.g - g;
      const db = color.b - b;
      const distance = dr * dr + dg * dg + db * db;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
        if (distance === 0) {
          break;
        }
      }
    }
    nearestCache.set(key, bestIndex);
    return bestIndex;
  };

  const indexedFrames = imageDataList.map((imageData) => {
    const { data } = imageData;
    const pixels = new Uint8Array(data.length / 4);
    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      const alpha = data[i + 3];
      if (alpha < 128) {
        pixels[p] = transparentIndex !== null ? transparentIndex : 0;
        continue;
      }
      pixels[p] = resolveIndex(data[i], data[i + 1], data[i + 2]);
    }
    return pixels;
  });

  let colorTableSize = 1;
  while (colorTableSize < palette.length) {
    colorTableSize <<= 1;
  }
  if (colorTableSize < 2) {
    colorTableSize = 2;
  }
  const minCodeSize = Math.max(2, Math.ceil(Math.log2(colorTableSize)));
  return { palette, colorTableSize, minCodeSize, transparentIndex, indexedFrames };
}

function lzwEncode(indices, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = endCode + 1;
  const dictionary = new Map();

  const resetDictionary = () => {
    dictionary.clear();
    for (let i = 0; i < clearCode; i += 1) {
      dictionary.set(String(i), i);
    }
    nextCode = endCode + 1;
    codeSize = minCodeSize + 1;
  };

  resetDictionary();

  const output = [];
  let bitBuffer = 0;
  let bitLength = 0;

  const writeCode = (code) => {
    bitBuffer |= code << bitLength;
    bitLength += codeSize;
    while (bitLength >= 8) {
      output.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitLength -= 8;
    }
  };

  writeCode(clearCode);

  if (!indices || indices.length === 0) {
    writeCode(endCode);
    if (bitLength > 0) {
      output.push(bitBuffer & 0xff);
    }
    return Uint8Array.from(output);
  }

  let prefix = String(indices[0]);

  for (let i = 1; i < indices.length; i += 1) {
    const value = indices[i];
    const key = `${prefix},${value}`;
    if (dictionary.has(key)) {
      prefix = key;
      continue;
    }
    const prefixCode = dictionary.get(prefix);
    writeCode(prefixCode);
    if (nextCode < 4096) {
      dictionary.set(key, nextCode);
      nextCode += 1;
      if (nextCode === (1 << codeSize) && codeSize < 12) {
        codeSize += 1;
      }
    } else {
      writeCode(clearCode);
      resetDictionary();
    }
    prefix = String(value);
  }

  if (dictionary.has(prefix)) {
    writeCode(dictionary.get(prefix));
  }

  writeCode(endCode);
  if (bitLength > 0) {
    output.push(bitBuffer & 0xff);
  }
  return Uint8Array.from(output);
}

function encodeGifFromFrames(imageDataList, { width, height, delay = GIF_DEFAULT_DELAY } = {}) {
  if (!Array.isArray(imageDataList) || imageDataList.length === 0) {
    return null;
  }

  const { palette, colorTableSize, minCodeSize, transparentIndex, indexedFrames } = prepareGifFrames(imageDataList);
  if (!indexedFrames.length) {
    return null;
  }

  const paddedPalette = palette.slice();
  while (paddedPalette.length < colorTableSize) {
    paddedPalette.push({ r: 0, g: 0, b: 0 });
  }

  const delayValue = Math.max(2, Math.round(Number(delay) || GIF_DEFAULT_DELAY));
  const gctSizeCode = Math.max(0, Math.log2(colorTableSize) - 1);
  const colorResolution = Math.max(0, Math.ceil(Math.log2(Math.max(palette.length, 1))) - 1);
  const backgroundIndex = transparentIndex !== null ? transparentIndex : 0;

  const bytes = [];
  const writeByte = (value) => {
    bytes.push(value & 0xff);
  };
  const writeWord = (value) => {
    writeByte(value & 0xff);
    writeByte((value >> 8) & 0xff);
  };
  const writeString = (value) => {
    for (let i = 0; i < value.length; i += 1) {
      writeByte(value.charCodeAt(i));
    }
  };

  writeString('GIF89a');
  writeWord(width);
  writeWord(height);
  writeByte(0x80 | ((colorResolution & 0x07) << 4) | (gctSizeCode & 0x07));
  writeByte(backgroundIndex);
  writeByte(0);

  paddedPalette.forEach((color) => {
    writeByte(color.r);
    writeByte(color.g);
    writeByte(color.b);
  });

  writeByte(0x21);
  writeByte(0xff);
  writeByte(11);
  writeString('NETSCAPE2.0');
  writeByte(3);
  writeByte(1);
  writeWord(0);
  writeByte(0);

  indexedFrames.forEach((indices) => {
    writeByte(0x21);
    writeByte(0xf9);
    writeByte(4);
    const packed = transparentIndex !== null ? 0x01 : 0x00;
    writeByte(packed);
    writeWord(delayValue);
    writeByte(transparentIndex !== null ? transparentIndex : 0);
    writeByte(0);

    writeByte(0x2c);
    writeWord(0);
    writeWord(0);
    writeWord(width);
    writeWord(height);
    writeByte(0x00);
    writeByte(minCodeSize);

    const compressed = lzwEncode(indices, minCodeSize);
    let offset = 0;
    while (offset < compressed.length) {
      const blockSize = Math.min(255, compressed.length - offset);
      writeByte(blockSize);
      for (let i = 0; i < blockSize; i += 1) {
        writeByte(compressed[offset + i]);
      }
      offset += blockSize;
    }
    writeByte(0);
  });

  writeByte(0x3b);
  return new Uint8Array(bytes);
}

function exportGif(multiplier = 1) {
  initFrames();
  saveCurrentFrame();
  const frames = framesState.frames.filter((frame) => frame && frame.snapshot);
  if (frames.length <= 1) {
    exportImage(multiplier);
    return;
  }

  const baseWidth = Math.max(1, state.width);
  const baseHeight = Math.max(1, state.height);
  const clampedMultiplier = Math.max(
    1,
    Math.min(multiplier, Math.floor(MAX_EXPORT_DIMENSION / Math.max(baseWidth, baseHeight)) || 1),
  );

  const exportWidth = baseWidth * clampedMultiplier;
  const exportHeight = baseHeight * clampedMultiplier;
  const frameImageData = [];

  frames.forEach((frame) => {
    const snapshot = frame.snapshot;
    if (!snapshot) {
      return;
    }
    const { canvas: compositeCanvas, ctx: compositeCtx } = createOffscreenCanvas(baseWidth, baseHeight);
    compositeSnapshotToContext(snapshot, compositeCtx);
    let imageData = compositeCtx.getImageData(0, 0, baseWidth, baseHeight);
    if (clampedMultiplier !== 1) {
      const { canvas: scaledCanvas, ctx: scaledCtx } = createOffscreenCanvas(exportWidth, exportHeight);
      scaledCtx.scale(clampedMultiplier, clampedMultiplier);
      scaledCtx.drawImage(compositeCanvas, 0, 0);
      imageData = scaledCtx.getImageData(0, 0, exportWidth, exportHeight);
    }
    frameImageData.push(imageData);
  });

  if (!frameImageData.length) {
    return;
  }

  const gifData = encodeGifFromFrames(frameImageData, {
    width: frameImageData[0].width,
    height: frameImageData[0].height,
    delay: GIF_DEFAULT_DELAY,
  });
  if (!gifData) {
    return;
  }

  const blob = new Blob([gifData], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `pixiedraw-${exportWidth}x${exportHeight}-${Date.now()}.gif`;
  link.href = url;
  link.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

let previousPointer = { x: 0, y: 0, inBounds: false };

function handleCanvasPointerEnter(event) {
  if (!event || (event.pointerType !== 'mouse' && event.pointerType !== 'pen')) {
    return;
  }
  if (!virtualCursorState.enabled) {
    return;
  }
  hideCanvasCursor();
  const position = getPointerPosition(event);
  if (position.inBounds) {
    setDesktopVirtualCursorActive(true);
    setVirtualCursorVisualCoordinates(position.canvasX, position.canvasY);
    updatePointerHoverPreviewFromEvent(event, position);
  } else {
    setVirtualCursorVisualCoordinates(position.canvasX, position.canvasY);
    updatePointerHoverPreviewFromEvent(event, position);
  }
}

function handlePointerDown(event) {
  if (playbackState.playing) {
    stopFramePlayback();
  }
  if (event.pointerType === 'touch' && virtualCursorState.zoomTemporarilyDisabled) {
    return;
  }
  event.preventDefault();
  pointerHoverState.active = false;
  pointerHoverState.x = null;
  pointerHoverState.y = null;
  pointerHoverState.pointerType = null;
  clearPointerPreview();
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
  if (virtualCursorState.enabled && (event.pointerType === 'mouse' || event.pointerType === 'pen')) {
    if (inBounds) {
      hideCanvasCursor();
      setDesktopVirtualCursorActive(true);
      setVirtualCursorVisualCoordinates(canvasX, canvasY);
      updateVirtualCursorPosition(x, y, { silent: true, preserveVisual: true });
    } else {
      showCanvasCursor();
      setDesktopVirtualCursorActive(false);
    }
  }
  if (isShapeTool(state.tool)) {
    if (inBounds) {
      const started = beginShapeDrawing(x, y, event.pointerId, pixelCanvas);
      if (started) {
        autoCompactAllDocks();
        updateCursorInfo(x, y);
      }
    } else {
      cancelShapeDrawing();
    }
    return;
  }
  if (isSelectionTool(state.tool)) {
    if (hasActiveSelection() && !selectionState.isDragging && !selectionState.isMoving) {
      if (!inBounds) {
        clearSelection();
        return;
      }
      if (!isPixelSelected(x, y)) {
        clearSelection();
        selectionState.pendingClearClick = event.pointerId;
        selectionState.pendingClearMoved = false;
        if (state.tool === 'selectMagic') {
          return;
        }
      } else {
        selectionState.pendingClearClick = null;
        selectionState.pendingClearMoved = false;
      }
    } else {
      selectionState.pendingClearClick = null;
      selectionState.pendingClearMoved = false;
    }
  } else {
    selectionState.pendingClearClick = null;
    selectionState.pendingClearMoved = false;
  }

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
      const pendingPointerId = selectionState.pendingClearClick;
      beginRectSelection(x, y, event.pointerId, pixelCanvas);
      if (
        pendingPointerId !== null &&
        event.pointerId === pendingPointerId
      ) {
        selectionState.pendingClearClick = pendingPointerId;
        selectionState.pendingClearMoved = false;
      }
    } else {
      clearSelection();
    }
    return;
  }
  if (state.tool === 'selectLasso') {
    if (inBounds) {
      const pendingPointerId = selectionState.pendingClearClick;
      beginLassoSelection(canvasX, canvasY, event.pointerId, pixelCanvas);
      if (
        pendingPointerId !== null &&
        event.pointerId === pendingPointerId
      ) {
        selectionState.pendingClearClick = pendingPointerId;
        selectionState.pendingClearMoved = false;
      }
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

  if (isBrushTool(state.tool)) {
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
    if (isBrushTool(state.tool) || state.tool === 'eraser') {
      queueCompositeLayers({ skipUIUpdate: true, skipContentCheck: true });
    } else {
      queueCompositeLayers();
    }
  }
}

function handlePointerMove(event) {
  if (event.pointerType === 'touch' && virtualCursorState.zoomTemporarilyDisabled) {
    return;
  }
  let sharedPointerPosition = null;
  if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
    sharedPointerPosition = getPointerPosition(event);
    setVirtualCursorVisualCoordinates(sharedPointerPosition.canvasX, sharedPointerPosition.canvasY);
    updatePointerHoverPreviewFromEvent(event, sharedPointerPosition);
  } else {
    updatePointerHoverPreviewFromEvent(event);
  }
  if (panState.active && event.pointerId === panState.pointerId) {
    updateCanvasPan(event);
    return;
  }
  if (shapeState.active && event.pointerId === shapeState.pointerId) {
    const position = sharedPointerPosition || getPointerPosition(event);
    updateShapeDrawing(position.x, position.y);
    if (position.inBounds) {
      updateCursorInfo(position.x, position.y);
    }
    return;
  }
  if (selectionState.isMoving && event.pointerId === selectionState.pointerId) {
    const position = sharedPointerPosition || getPointerPosition(event);
    updateSelectionMove(position.x, position.y);
    if (position.inBounds) {
      updateCursorInfo(position.x, position.y);
    }
    return;
  }
  if (selectionState.isDragging && event.pointerId === selectionState.pointerId) {
    const position = sharedPointerPosition || getPointerPosition(event);
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
  const { x, y, inBounds } = sharedPointerPosition || getPointerPosition(event);
  if (virtualCursorState.enabled && (event.pointerType === 'mouse' || event.pointerType === 'pen')) {
    if (inBounds) {
      hideCanvasCursor();
      setDesktopVirtualCursorActive(true);
      updateVirtualCursorPosition(x, y, { silent: true, preserveVisual: true });
    } else {
      showCanvasCursor();
      setDesktopVirtualCursorActive(false);
    }
  }
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
    if (isBrushTool(state.tool)) {
      drawBrush(x, y);
    } else if (state.tool === 'eraser') {
      eraseBrush(x, y);
    }
    queueCompositeLayers({ skipUIUpdate: true, skipContentCheck: true });
    return;
  }

  if (isBrushTool(state.tool)) {
    drawLine(previousPointer.x, previousPointer.y, x, y, true);
  } else if (state.tool === 'eraser') {
    drawLine(previousPointer.x, previousPointer.y, x, y, false);
  }
  previousPointer = { x, y, inBounds: true };
  queueCompositeLayers({ skipUIUpdate: true, skipContentCheck: true });
}

function handlePointerUp(event) {
  if (event && event.pointerType === 'touch' && virtualCursorState.zoomTemporarilyDisabled) {
    return;
  }
  let handledShape = false;
  if (event && shapeState.active && event.pointerId === shapeState.pointerId) {
    finalizeShapeDrawing();
    handledShape = true;
  }
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
  if (handledShape) {
    return;
  }
  if (handledSelection) {
    if (
      event &&
      selectionState.pendingClearClick !== null &&
      event.pointerId === selectionState.pendingClearClick
    ) {
      if (!selectionState.pendingClearMoved) {
        clearSelection();
      } else {
        selectionState.pendingClearClick = null;
        selectionState.pendingClearMoved = false;
      }
    }
    return;
  }
  if (
    event &&
    selectionState.pendingClearClick !== null &&
    event.pointerId === selectionState.pendingClearClick
  ) {
    if (!selectionState.pendingClearMoved) {
      clearSelection();
      return;
    }
    selectionState.pendingClearClick = null;
    selectionState.pendingClearMoved = false;
  }
  if (panEnded) {
    return;
  }
  const wasDrawing = isDrawing;
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
  if (wasDrawing) {
    queueCompositeLayers({ skipUIUpdate: false, skipContentCheck: false });
  }
  finalizeHistoryEntry();
  if (event) {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      const position = getPointerPosition(event);
      if (virtualCursorState.enabled) {
        if (position.inBounds) {
          hideCanvasCursor();
          setDesktopVirtualCursorActive(true);
    updateVirtualCursorPosition(position.x, position.y, { silent: true, preserveVisual: true });
        } else {
          showCanvasCursor();
          setDesktopVirtualCursorActive(false);
        }
      }
      updatePointerHoverPreviewFromEvent(event, position);
    } else {
      updatePointerHoverPreviewFromEvent(event);
    }
  } else {
    updatePointerHoverPreviewFromState();
  }
}

function initEvents() {
  pixelCanvas.addEventListener('pointerdown', handlePointerDown);
  pixelCanvas.addEventListener('pointermove', handlePointerMove);
  pixelCanvas.addEventListener('pointerup', handlePointerUp);
  pixelCanvas.addEventListener('pointerenter', handleCanvasPointerEnter);
  pixelCanvas.addEventListener('pointerleave', (event) => {
    if (!isDrawing) {
      updateCursorInfo();
    }
    if (event && (event.pointerType === 'mouse' || event.pointerType === 'pen')) {
      showCanvasCursor();
      setDesktopVirtualCursorActive(false);
    }
    pointerHoverState.active = false;
    pointerHoverState.x = null;
    pointerHoverState.y = null;
    pointerHoverState.pointerType = null;
    clearPointerPreview();
  });
  pixelCanvas.addEventListener('pointercancel', handlePointerUp);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('keydown', handleCanvasPanKeyDown, { capture: true });
  window.addEventListener('keyup', handleCanvasPanKeyUp, { capture: true });
  window.addEventListener('blur', resetCanvasPanKeyState);
  window.addEventListener('blur', () => {
    if (playbackState.playing) {
      stopFramePlayback();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playbackState.playing) {
      stopFramePlayback();
    }
  });

  if (pixelSizeInput) {
    pixelSizeInput.addEventListener('input', () => updatePixelSize({ resetView: true }));
    pixelSizeInput.addEventListener('change', () => updatePixelSize({ resetView: true }));
  }

  if (canvasTabButtons.length) {
    canvasTabButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        setCanvasConfigTab(button.dataset.canvasTab);
      });
      button.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
          return;
        }
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const nextIndex = (index + delta + canvasTabButtons.length) % canvasTabButtons.length;
        const nextButton = canvasTabButtons[nextIndex];
        if (nextButton) {
          setCanvasConfigTab(nextButton.dataset.canvasTab, { skipFocus: true });
          nextButton.focus();
        }
      });
    });
    setCanvasConfigTab(activeCanvasTabId, { force: true, skipFocus: true });
  }

  if (colorModeInputs.length) {
    colorModeInputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked) {
          setColorMode(input.value);
        }
      });
    });
    setColorMode(state.colorMode, { skipSave: true, force: true, rebuildPalette: false });
  }

  if (historyLimitInput) {
    historyLimitInput.addEventListener('input', () => updateHistoryLimit());
    historyLimitInput.addEventListener('change', () => updateHistoryLimit());
  }

  brushSizeInput.addEventListener('input', (event) => updateBrushSize((event.target).value));
  brushSizeInput.addEventListener('change', (event) => updateBrushSize((event.target).value));

  resizeCanvasButton.addEventListener('click', () => {
    const newWidth = Number(widthInput.value) || state.width;
    const newHeight = Number(heightInput.value) || state.height;
    resizeCanvas(newWidth, newHeight, { resetView: true });
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
      if (isShapeTool(targetTool)) {
        closeShapeToolPanel();
      }
    });
  });

  if (selectionToolToggle) {
    selectionToolToggle.addEventListener('click', () => {
      toggleSelectionToolPanel();
    });
  }

  if (shapeToolToggle) {
    shapeToolToggle.addEventListener('click', () => {
      toggleShapeToolPanel();
    });
  }

  document.addEventListener('click', handleSelectionToolDocumentClick);
  document.addEventListener('click', handleShapeToolDocumentClick);

  if (exportConfirmButton) {
    exportConfirmButton.addEventListener('click', () => {
      const multiplier = Number(exportSizeSelect && exportSizeSelect.value) || 1;
      lastExportMultiplier = multiplier;
      exportImage(multiplier);
      closeActivePanel();
    });
  }

  if (exportGifButton) {
    exportGifButton.addEventListener('click', () => {
      const multiplier = Number(exportSizeSelect && exportSizeSelect.value) || 1;
      lastExportMultiplier = multiplier;
      exportGif(multiplier);
      closeActivePanel();
    });
  }

  if (togglePlaybackButton) {
    togglePlaybackButton.addEventListener('click', () => {
      toggleFramePlayback();
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
      if (shapeToolPanelOpen) {
        closeShapeToolPanel();
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
}

async function init() {
  pixelCanvas.style.cursor = CANVAS_CURSOR_VISIBLE;
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
  initFrames();
  saveCurrentFrame();
  renderLayerList();
  updateLayerDockStatus();
  setActiveTool(state.tool);
  applyToolAlphaOverrides(null, state.tool);
  if (virtualCursorToggle) {
    if (HAS_TOUCH_SUPPORT) {
      virtualCursorToggle.disabled = false;
      virtualCursorToggle.removeAttribute('hidden');
      virtualCursorToggle.removeAttribute('aria-hidden');
      virtualCursorToggle.removeAttribute('tabindex');
      virtualCursorToggle.classList.remove('tool-button--disabled');
      virtualCursorToggle.addEventListener('click', () => {
        setVirtualCursorEnabled(!virtualCursorState.enabled);
      });
    } else {
      virtualCursorToggle.disabled = true;
      virtualCursorToggle.setAttribute('aria-hidden', 'true');
      virtualCursorToggle.setAttribute('hidden', 'true');
      virtualCursorToggle.setAttribute('tabindex', '-1');
      virtualCursorToggle.classList.add('tool-button--disabled');
    }
  }
  setVirtualCursorEnabled(true);
  if (deleteFrameButton) {
    deleteFrameButton.addEventListener('click', () => {
      deleteActiveFrame();
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
  addLayerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      addLayer();
    });
  });
  updateBrushSize(state.brushSize);
  updateHistoryLimit({ skipSave: true });
  updatePixelSizeConstraints();
  updatePixelSize();
  updateMemoryUsageDisplay();
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
  initHelpButtons();
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

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    ensureCanvasCentered();
  });
}

init();
