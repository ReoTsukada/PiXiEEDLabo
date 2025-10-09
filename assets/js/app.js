(() => {
  if (typeof window === 'undefined' || !window.document) {
    return;
  }

  const dom = {
    appRoot: document.getElementById('appRoot'),
    layout: document.getElementById('appLayout'),
    leftRail: document.getElementById('leftRail'),
    rightRail: document.getElementById('rightRail'),
    leftTabsBar: document.getElementById('leftRailTabs'),
    leftTabButtons: Array.from(document.querySelectorAll('[data-left-tab]')),
    leftTabPanes: document.getElementById('leftRailPanes'),
    rightTabsBar: document.getElementById('rightRailTabs'),
    rightTabButtons: Array.from(document.querySelectorAll('[data-right-tab]')),
    rightTabPanes: document.getElementById('rightRailPanes'),
    mobileDrawer: document.getElementById('mobileDrawer'),
    mobileTabs: Array.from(document.querySelectorAll('.mobile-tab')),
    colorTabSwatch: document.getElementById('colorTabSwatch'),
    mobileColorTabSwatch: document.getElementById('mobileColorTabSwatch'),
    toolTabIcon: document.getElementById('toolTabIcon'),
    mobileToolTabIcon: document.getElementById('mobileToolTabIcon'),
    mobilePanels: {
      tools: document.getElementById('mobilePanelTools'),
      color: document.getElementById('mobilePanelColor'),
      frames: document.getElementById('mobilePanelFrames'),
      settings: document.getElementById('mobilePanelSettings'),
    },
    sections: {
      tools: document.getElementById('panelTools'),
      color: document.getElementById('panelColor'),
      frames: document.getElementById('panelFrames'),
      settings: document.getElementById('panelSettings'),
    },
    canvases: {
      stack: document.getElementById('canvasStack'),
      drawing: /** @type {HTMLCanvasElement} */ (document.getElementById('drawingCanvas')),
      overlay: /** @type {HTMLCanvasElement} */ (document.getElementById('overlayCanvas')),
      selection: /** @type {HTMLCanvasElement} */ (document.getElementById('selectionCanvas')),
    },
    toggles: {
      left: document.getElementById('openLeftRail'),
      right: document.getElementById('openRightRail'),
    },
    toolGroupButtons: Array.from(document.querySelectorAll('.tool-group-button[data-tool-group]')),
    toolGrid: document.getElementById('toolGrid'),
    controls: {
      toggleGrid: document.getElementById('toggleGrid'),
      toggleMajorGrid: document.getElementById('toggleMajorGrid'),
      toggleBackgroundMode: document.getElementById('toggleBackgroundMode'),
      undoAction: document.getElementById('undoAction'),
      redoAction: document.getElementById('redoAction'),
      zoomOut: document.getElementById('zoomOut'),
      zoomIn: document.getElementById('zoomIn'),
      zoomLevel: document.getElementById('zoomLevel'),
      zoomSlider: document.getElementById('zoomSlider'),
      brushSize: document.getElementById('brushSize'),
      brushSizeValue: document.getElementById('brushSizeValue'),
      brushOpacity: document.getElementById('brushOpacity'),
      brushOpacityValue: document.getElementById('brushOpacityValue'),
      colorMode: Array.from(document.querySelectorAll('input[name="colorMode"]')),
      paletteList: document.getElementById('paletteList'),
      addPaletteColor: document.getElementById('addPaletteColor'),
      paletteIndex: document.getElementById('paletteIndex'),
      paletteHue: document.getElementById('paletteHue'),
      paletteSaturation: document.getElementById('paletteSaturation'),
      paletteValue: document.getElementById('paletteValue'),
      paletteAlphaSlider: document.getElementById('paletteAlphaSlider'),
      paletteAlphaValue: document.getElementById('paletteAlphaValue'),
      paletteWheel: /** @type {HTMLCanvasElement|null} */ (document.getElementById('paletteColorWheel')),
      paletteWheelCursor: document.getElementById('paletteWheelCursor'),
      palettePreview: document.getElementById('palettePreview'),
      timelineMatrix: document.getElementById('timelineMatrix'),
      addLayer: document.getElementById('addLayer'),
      removeLayer: document.getElementById('removeLayer'),
      addFrame: document.getElementById('addFrame'),
      removeFrame: document.getElementById('removeFrame'),
      playAnimation: document.getElementById('playAnimation'),
      stopAnimation: document.getElementById('stopAnimation'),
      rewindAnimation: document.getElementById('rewindAnimation'),
      forwardAnimation: document.getElementById('forwardAnimation'),
      animationFps: document.getElementById('animationFps'),
      animationFpsMs: document.getElementById('animationFpsMs'),
      applyFpsAll: document.getElementById('applyFpsAll'),
      canvasWidth: document.getElementById('canvasWidth'),
      canvasHeight: document.getElementById('canvasHeight'),
      toggleChecker: document.getElementById('toggleChecker'),
      togglePixelPreview: document.getElementById('togglePixelPreview'),
      openDocument: document.getElementById('openDocument'),
      exportProject: document.getElementById('exportProject'),
      clearCanvas: document.getElementById('clearCanvas'),
      enableAutosave: document.getElementById('enableAutosave'),
      autosaveStatus: document.getElementById('autosaveStatus'),
      memoryUsage: document.getElementById('memoryUsage'),
      memoryClear: document.getElementById('memoryClear'),
    },
    newProject: {
      button: document.getElementById('newProject'),
      dialog: /** @type {HTMLDialogElement|null} */ (document.getElementById('newProjectDialog')),
      form: document.getElementById('newProjectForm'),
      nameInput: document.getElementById('newProjectName'),
      widthInput: document.getElementById('newProjectWidth'),
      heightInput: document.getElementById('newProjectHeight'),
      cancel: document.getElementById('cancelNewProject'),
      confirm: document.getElementById('confirmNewProject'),
    },
    exportDialog: {
      dialog: /** @type {HTMLDialogElement|null} */ (document.getElementById('exportDialog')),
      form: document.getElementById('exportDialogForm'),
      confirmPng: document.getElementById('confirmExportPng'),
      confirmGif: document.getElementById('confirmExportGif'),
      cancel: document.getElementById('cancelExport'),
    },
  };

  const LEFT_TAB_KEYS = ['tools', 'color'];
  const RIGHT_TAB_KEYS = ['frames', 'settings'];
  const TOOL_GROUPS = {
    selection: { label: '範囲選択', tools: ['selectRect', 'selectLasso', 'selectSame'] },
    pen: { label: 'ペン', tools: ['pen', 'eyedropper'] },
    eraser: { label: '消しゴム', tools: ['eraser'] },
    shape: { label: '図形', tools: ['line', 'curve', 'rect', 'rectFill', 'ellipse', 'ellipseFill'] },
    fill: { label: '塗りつぶし', tools: ['fill'] },
  };
  const DEFAULT_GROUP_TOOL = {
    selection: 'selectRect',
    pen: 'pen',
    eraser: 'eraser',
    shape: 'line',
    fill: 'fill',
  };
  const TOOL_TO_GROUP = Object.keys(TOOL_GROUPS).reduce((acc, key) => {
    TOOL_GROUPS[key].tools.forEach(tool => {
      acc[tool] = key;
    });
    return acc;
  }, {});

  const ZOOM_STEPS = Object.freeze([
    0.3333333333333,
    0.5,
    0.75,
    1,
    1.25,
    1.5,
    2,
    2.5,
    3,
    4.5,
    5,
    6,
    7,
    8,
    9,
    10,
    12,
    14,
    16,
    18,
    20,
    25,
    30,
    35,
    40,
  ]);
  const MIN_ZOOM_SCALE = ZOOM_STEPS[0];
  const ZOOM_EPSILON = 1e-6;

  const DEFAULT_DOCUMENT_NAME = '新規ドキュメント';
  const MIN_CANVAS_SIZE = 1;
  const MAX_CANVAS_SIZE = 256;

  const layoutMap = {
    tools: { desktop: dom.leftTabPanes || dom.leftRail, mobile: dom.mobilePanels.tools },
    color: { desktop: dom.leftTabPanes || dom.leftRail, mobile: dom.mobilePanels.color },
    frames: { desktop: dom.rightTabPanes || dom.rightRail, mobile: dom.mobilePanels.frames },
    settings: { desktop: dom.rightTabPanes || dom.rightRail, mobile: dom.mobilePanels.settings },
  };

  const ctx = {
    drawing: dom.canvases.drawing?.getContext('2d', { willReadFrequently: true }) || null,
    overlay: dom.canvases.overlay?.getContext('2d', { willReadFrequently: true }) || null,
    selection: dom.canvases.selection?.getContext('2d', { willReadFrequently: true }) || null,
  };

  if (ctx.drawing) {
    ctx.drawing.imageSmoothingEnabled = false;
  }
  if (ctx.overlay) {
    ctx.overlay.imageSmoothingEnabled = false;
  }
  if (ctx.selection) {
    ctx.selection.imageSmoothingEnabled = false;
  }

  const SESSION_STORAGE_KEY = 'pixieedraw:sessionState';
  const canUseSessionStorage = (() => {
    try {
      return typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null;
    } catch (error) {
      return false;
    }
  })();
  let sessionPersistHandle = null;
  const AUTOSAVE_SUPPORTED = typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'indexedDB' in window;
  const AUTOSAVE_DB_NAME = 'pixieedraw-autosave';
  const AUTOSAVE_DB_VERSION = 1;
  const AUTOSAVE_STORE_NAME = 'handles';
  const AUTOSAVE_HANDLE_KEY = 'document';
  const AUTOSAVE_WRITE_DELAY = 1000;
  const DOCUMENT_FILE_VERSION = 1;
  let autosaveHandle = null;
  let pendingAutosaveHandle = null;
  let autosavePermissionListener = null;
  let autosaveWriteTimer = null;
  let autosaveRestoring = false;
  let autosaveDirty = false;
  const brushOffsetCache = new Map();

  const rails = { leftCollapsed: false, rightCollapsed: window.innerWidth <= 900 };
  const BACKGROUND_TILE_COLORS = Object.freeze({
    dark: [
      { r: 52, g: 56, b: 68, a: 255 },
      { r: 28, g: 31, b: 39, a: 255 },
    ],
    light: [
      { r: 255, g: 255, b: 255, a: 255 },
      { r: 236, g: 236, b: 240, a: 255 },
    ],
    pink: [
      { r: 255, g: 238, b: 245, a: 255 },
      { r: 255, g: 213, b: 230, a: 255 },
    ],
  });
  const TRANSPARENT_TILE_SIZE = 8;
  const BRUSH_TOOLS = new Set(['pen', 'eraser']);
  const FILL_TOOLS = new Set(['fill']);
  const SHAPE_TOOLS = new Set(['line', 'curve', 'rect', 'rectFill', 'ellipse', 'ellipseFill']);
  const SELECTION_TOOLS = new Set(['selectRect', 'selectLasso', 'selectSame']);
  const TOOL_ICON_FALLBACK = {
    selectRect: '□',
    selectLasso: '⌁',
    selectSame: '★',
    line: '／',
    curve: '∿',
    rect: '▢',
    rectFill: '▣',
    ellipse: '◯',
    ellipseFill: '⬤',
  };
  const state = createInitialState();
  restoreSessionState();
  state.colorMode = 'index';
  updateGridDecorations();
  const pointerState = createPointerState();
  if (canUseSessionStorage) {
    window.addEventListener('beforeunload', persistSessionState);
  }
  let hoverPixel = null;
  let overlayNeedsRedraw = true;
  const SELECTION_DASH_SPEED = 40;
  let selectionDashScreenOffset = 0;
  let lastSelectionDashTime = 0;
  const history = { past: [], future: [], pending: null, limit: 20 };
  let historyTrimmedRecently = false;
  let historyTrimmedAt = 0;
  const fillPreviewCache = { key: null, pixels: null };
  const HISTORY_DRAW_TOOLS = new Set(['pen', 'eraser', 'line', 'curve', 'rect', 'rectFill', 'ellipse', 'ellipseFill', 'fill']);
  const MEMORY_MONITOR_INTERVAL = 2000;
  const MEMORY_WARNING_DEFAULT = 250 * 1024 * 1024;
  const TIMELINE_CELL_SIZE = 32;
  const TIMELINE_CELL_VARIANTS = {
    corner: { fill: 'rgba(16, 22, 32, 0.94)', border: 'rgba(210, 220, 240, 0.45)' },
    frameHeader: { fill: 'rgba(18, 26, 38, 0.9)', border: 'rgba(160, 172, 190, 0.45)' },
    frameHeaderActive: { fill: 'rgba(88, 196, 255, 0.3)', border: 'rgba(88, 196, 255, 0.7)' },
    layer: { fill: 'rgba(18, 26, 38, 0.9)', border: 'rgba(160, 172, 190, 0.45)' },
    layerActive: { fill: 'rgba(88, 196, 255, 0.26)', border: 'rgba(88, 196, 255, 0.68)' },
    layerPlaceholder: { fill: 'rgba(12, 16, 24, 0.6)', border: 'rgba(130, 142, 162, 0.45)' },
    layerHidden: { fill: 'rgba(26, 32, 44, 0.7)', border: 'rgba(118, 128, 148, 0.45)' },
    layerActiveHidden: { fill: 'rgba(70, 100, 132, 0.6)', border: 'rgba(118, 128, 148, 0.6)' },
    body: { fill: 'rgba(12, 16, 24, 0.7)', border: 'rgba(96, 108, 128, 0.42)' },
    bodyActiveRow: { fill: 'rgba(88, 196, 255, 0.18)', border: 'rgba(88, 196, 255, 0.55)' },
    bodyActiveColumn: { fill: 'rgba(88, 196, 255, 0.16)', border: 'rgba(88, 196, 255, 0.5)' },
    bodyActiveCell: { fill: 'rgba(88, 196, 255, 0.32)', border: 'rgba(88, 196, 255, 0.75)' },
    bodyEmpty: { fill: 'rgba(9, 13, 19, 0.55)', border: 'rgba(112, 124, 146, 0.42)' },
    bodyHidden: { fill: 'rgba(20, 26, 36, 0.62)', border: 'rgba(112, 124, 146, 0.46)' },
  };
  const TIMELINE_SLOT_VARIANTS = {
    default: { fill: 'rgba(16, 22, 30, 0.78)', border: 'rgba(136, 148, 168, 0.55)' },
    active: { fill: 'rgba(88, 196, 255, 0.38)', border: 'rgba(88, 196, 255, 0.75)' },
    hidden: { fill: 'rgba(14, 18, 26, 0.55)', border: 'rgba(120, 130, 150, 0.45)' },
    disabled: { fill: 'rgba(9, 13, 19, 0.48)', border: 'rgba(96, 108, 128, 0.4)' },
  };
  const TIMELINE_BUTTON_VARIANTS = {
    add: { fill: 'rgba(88, 196, 255, 0.3)', border: 'rgba(88, 196, 255, 0.7)' },
    remove: { fill: 'rgba(255, 107, 107, 0.32)', border: 'rgba(255, 130, 130, 0.68)' },
    playback: { fill: 'rgba(120, 150, 190, 0.28)', border: 'rgba(184, 200, 224, 0.6)' },
    playbackActive: { fill: 'rgba(88, 196, 255, 0.36)', border: 'rgba(88, 196, 255, 0.78)' },
    stop: { fill: 'rgba(255, 156, 126, 0.32)', border: 'rgba(255, 181, 152, 0.72)' },
  };
  let memoryMonitorHandle = null;
  let toolButtons = [];
  let renderScheduled = false;
  let layoutMode = null;
  let playbackHandle = null;
  let lastFrameTime = 0;
  let curveBuilder = null;
  let paletteWheelCtx = null;
  let canvasWheelListenerBound = false;
  const paletteEditorState = {
    hsv: { h: 0, s: 0, v: 1, a: 255 },
    wheelPointer: { active: false, pointerId: null, upHandler: null },
  };
  let dirtyRegion = null;

  function createInitialState(options = {}) {
    const {
      width: requestedWidth = 128,
      height: requestedHeight = 128,
      name: requestedName = DEFAULT_DOCUMENT_NAME,
    } = options || {};
    const width = clamp(Math.round(Number(requestedWidth) || 128), MIN_CANVAS_SIZE, MAX_CANVAS_SIZE);
    const height = clamp(Math.round(Number(requestedHeight) || 128), MIN_CANVAS_SIZE, MAX_CANVAS_SIZE);
    const palette = [
      { r: 0, g: 0, b: 0, a: 0 },
      { r: 20, g: 20, b: 20, a: 255 },
      { r: 88, g: 196, b: 255, a: 255 },
      { r: 255, g: 255, b: 255, a: 255 },
      { r: 255, g: 96, b: 96, a: 255 },
    ];
    const layers = [createLayer('レイヤー 1', width, height)];
    const frames = [createFrame('フレーム 1', layers, width, height)];

    return {
      width,
      height,
      scale: normalizeZoomScale(8, 8),
      pan: { x: 0, y: 0 },
      tool: 'pen',
      brushSize: 1,
      brushOpacity: 1,
      showGrid: true,
      showPixelGuides: true,
      showMajorGrid: false,
      gridScreenStep: 8,
      majorGridSpacing: 16,
      backgroundMode: 'dark',
      activeToolGroup: 'pen',
      lastGroupTool: { ...DEFAULT_GROUP_TOOL },
      activeLeftTab: 'tools',
      activeRightTab: 'frames',
      showChecker: true,
      colorMode: 'index',
      palette,
      activePaletteIndex: 2,
      activeRgb: { r: 88, g: 196, b: 255, a: 255 },
      frames,
      activeFrame: 0,
      activeLayer: frames[0].layers[0].id,
      selectionMask: null,
      selectionBounds: null,
      playback: { isPlaying: false, lastFrame: 0 },
      documentName: normalizeDocumentName(requestedName),
    };
  }

  function createLayer(name, width, height) {
    const size = width * height;
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `layer-${Math.random().toString(36).slice(2)}`,
      name,
      visible: true,
      opacity: 1,
      indices: new Int16Array(size).fill(-1),
      direct: null,
    };
  }

  function ensureLayerDirect(layer, width = state.width, height = state.height) {
    const length = Math.max(0, Math.floor(width) || 0) * Math.max(0, Math.floor(height) || 0) * 4;
    if (!(layer.direct instanceof Uint8ClampedArray) || layer.direct.length !== length) {
      layer.direct = new Uint8ClampedArray(length);
    }
    return layer.direct;
  }

  function cloneLayer(baseLayer, width, height) {
    const size = width * height;
    const layer = {
      id: crypto.randomUUID ? crypto.randomUUID() : `layer-${Math.random().toString(36).slice(2)}`,
      name: baseLayer.name,
      visible: baseLayer.visible,
      opacity: baseLayer.opacity,
      indices: new Int16Array(size),
      direct: null,
    };
    layer.indices.set(baseLayer.indices);
    if (baseLayer.direct instanceof Uint8ClampedArray) {
      const direct = ensureLayerDirect(layer, width, height);
      direct.set(baseLayer.direct);
    }
    return layer;
  }

  function createFrame(name, layers, width, height) {
    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `frame-${Math.random().toString(36).slice(2)}`,
      name,
      duration: 1000 / 12,
      layers: layers.map(layer => cloneLayer(layer, width ?? state.width, height ?? state.height)),
    };
  }

  function createPointerState() {
    return {
      active: false,
      pointerId: null,
      tool: null,
      start: null,
      current: null,
      last: null,
      path: [],
      preview: null,
      selectionPreview: null,
      selectionMove: null,
      selectionClearedOnDown: false,
      startClient: null,
      panOrigin: { x: 0, y: 0 },
      panMode: null,
      touchPanStart: null,
      curveHandle: null,
    };
  }

  const TOUCH_PAN_MIN_POINTERS = 2;
  const activeTouchPointers = new Map();

  function makeHistorySnapshot({ includeUiState = true, includeSelection = true, clonePixelData = true } = {}) {
    const snapshot = {
      width: state.width,
      height: state.height,
      scale: state.scale,
      pan: { x: state.pan.x, y: state.pan.y },
      palette: state.palette.map(color => ({ ...color })),
      activePaletteIndex: state.activePaletteIndex,
      activeRgb: { ...state.activeRgb },
      frames: state.frames.map(frame => ({
        id: frame.id,
        name: frame.name,
        duration: frame.duration,
          layers: frame.layers.map(layer => ({
            id: layer.id,
            name: layer.name,
            visible: layer.visible,
            opacity: layer.opacity,
            indices: clonePixelData ? new Int16Array(layer.indices) : layer.indices,
            direct: layer.direct instanceof Uint8ClampedArray
              ? (clonePixelData ? new Uint8ClampedArray(layer.direct) : layer.direct)
              : null,
          })),
        })),
      showGrid: state.showGrid,
      showMajorGrid: state.showMajorGrid,
      gridScreenStep: state.gridScreenStep,
      majorGridSpacing: state.majorGridSpacing,
      backgroundMode: state.backgroundMode,
      showPixelGuides: state.showPixelGuides,
      showChecker: state.showChecker,
      documentName: state.documentName,
    };

    if (includeSelection) {
      snapshot.activeFrame = state.activeFrame;
      snapshot.activeLayer = state.activeLayer;
      if (state.selectionMask) {
        snapshot.selectionMask = new Uint8Array(state.selectionMask);
      }
      if (state.selectionBounds) {
        snapshot.selectionBounds = { ...state.selectionBounds };
      }
    }

    if (includeUiState) {
      snapshot.tool = state.tool;
      snapshot.brushSize = state.brushSize;
      snapshot.brushOpacity = state.brushOpacity;
      snapshot.colorMode = state.colorMode;
      snapshot.activeToolGroup = state.activeToolGroup;
      snapshot.lastGroupTool = { ...(state.lastGroupTool || DEFAULT_GROUP_TOOL) };
      snapshot.activeLeftTab = state.activeLeftTab;
      snapshot.activeRightTab = state.activeRightTab;
      snapshot.playback = { ...state.playback };
    }

    return snapshot;
  }

  function encodeInt16Rle(view) {
    const length = view.length;
    if (length === 0) {
      return { type: 'int16-rle', length: 0, values: new Int16Array(0), counts: new Uint32Array(0) };
    }
    const values = [];
    const counts = [];
    let current = view[0];
    let count = 1;
    for (let i = 1; i < length; i += 1) {
      const value = view[i];
      if (value === current) {
        count += 1;
      } else {
        values.push(current);
        counts.push(count);
        current = value;
        count = 1;
      }
    }
    values.push(current);
    counts.push(count);
    const valueArray = new Int16Array(values.length);
    for (let i = 0; i < values.length; i += 1) {
      valueArray[i] = values[i];
    }
    const countArray = new Uint32Array(counts.length);
    for (let i = 0; i < counts.length; i += 1) {
      countArray[i] = counts[i];
    }
    return { type: 'int16-rle', length, values: valueArray, counts: countArray };
  }

  function decodeInt16Data(source) {
    if (!source) {
      return new Int16Array(0);
    }
    if (source instanceof Int16Array) {
      return new Int16Array(source);
    }
    if (ArrayBuffer.isView(source) && source.BYTES_PER_ELEMENT === 2) {
      return new Int16Array(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
    }
    if (typeof source === 'object' && source.type === 'int16-rle') {
      const { length, values, counts } = source;
      const output = new Int16Array(length);
      let offset = 0;
      for (let i = 0; i < values.length; i += 1) {
        const runValue = values[i];
        const runLength = counts[i];
        output.fill(runValue, offset, offset + runLength);
        offset += runLength;
      }
      return output;
    }
    throw new Error('Unsupported Int16 encoding');
  }

  function encodeUint8Rle(view) {
    const length = view.length;
    if (length === 0) {
      return { type: 'uint8-rle', length: 0, values: new Uint8Array(0), counts: new Uint32Array(0) };
    }
    const values = [];
    const counts = [];
    let current = view[0];
    let count = 1;
    for (let i = 1; i < length; i += 1) {
      const value = view[i];
      if (value === current) {
        count += 1;
      } else {
        values.push(current);
        counts.push(count);
        current = value;
        count = 1;
      }
    }
    values.push(current);
    counts.push(count);
    const valueArray = new Uint8Array(values.length);
    for (let i = 0; i < values.length; i += 1) {
      valueArray[i] = values[i];
    }
    const countArray = new Uint32Array(counts.length);
    for (let i = 0; i < counts.length; i += 1) {
      countArray[i] = counts[i];
    }
    return { type: 'uint8-rle', length, values: valueArray, counts: countArray };
  }

  function decodeUint8Data(source, { clamped = false } = {}) {
    if (!source) {
      return clamped ? new Uint8ClampedArray(0) : new Uint8Array(0);
    }
    if (ArrayBuffer.isView(source) && source.BYTES_PER_ELEMENT === 1 && source.constructor !== Uint32Array) {
      const buffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
      return clamped ? new Uint8ClampedArray(buffer) : new Uint8Array(buffer);
    }
    if (typeof source === 'object' && source.type === 'uint8-rle') {
      const { length, values, counts } = source;
      const shouldClamp = Object.prototype.hasOwnProperty.call(source, 'clamped') ? Boolean(source.clamped) : clamped;
      const output = shouldClamp ? new Uint8ClampedArray(length) : new Uint8Array(length);
      let offset = 0;
      for (let i = 0; i < values.length; i += 1) {
        const runValue = values[i];
        const runLength = counts[i];
        output.fill(runValue, offset, offset + runLength);
        offset += runLength;
      }
      return output;
    }
    throw new Error('Unsupported Uint8 encoding');
  }

  function compressInt16Array(view) {
    if (!view) {
      return new Int16Array(0);
    }
    if (!(view instanceof Int16Array)) {
      view = new Int16Array(view);
    }
    const encoded = encodeInt16Rle(view);
    const encodedBytes = encoded.values.byteLength + encoded.counts.byteLength;
    if (encodedBytes >= view.byteLength) {
      return view.slice();
    }
    return encoded;
  }

  function compressUint8Array(view, { clamped = false } = {}) {
    if (!view) {
      return clamped ? new Uint8ClampedArray(0) : new Uint8Array(0);
    }
    const source = clamped && view instanceof Uint8ClampedArray ? view : new Uint8Array(view);
    const encoded = encodeUint8Rle(source);
    const encodedBytes = encoded.values.byteLength + encoded.counts.byteLength;
    const originalBytes = source.byteLength;
    if (encodedBytes >= originalBytes) {
      if (clamped) {
        return view instanceof Uint8ClampedArray ? view.slice() : new Uint8ClampedArray(source);
      }
      return source.slice ? source.slice() : new Uint8Array(source);
    }
    return { ...encoded, clamped: Boolean(clamped) };
  }

  function estimateEncodedByteLength(data, elementSize) {
    if (!data) return 0;
    if (ArrayBuffer.isView(data)) {
      return data.byteLength;
    }
    if (typeof data === 'object') {
      if (data.type === 'int16-rle' || data.type === 'uint8-rle') {
        const valuesBytes = data.values?.byteLength || 0;
        const countsBytes = data.counts?.byteLength || 0;
        return valuesBytes + countsBytes;
      }
      if (typeof data.length === 'number' && data.BYTES_PER_ELEMENT) {
        return data.length * data.BYTES_PER_ELEMENT;
      }
    }
    if (typeof data.length === 'number' && Number.isFinite(elementSize)) {
      return data.length * elementSize;
    }
    if (typeof data === 'string') {
      return data.length;
    }
    return 0;
  }

  function compressHistorySnapshot(snapshot) {
    if (!snapshot) return snapshot;
    const compressed = {
      width: snapshot.width,
      height: snapshot.height,
      scale: snapshot.scale,
      pan: { x: snapshot.pan.x, y: snapshot.pan.y },
      palette: snapshot.palette.map(color => ({ ...color })),
      activePaletteIndex: snapshot.activePaletteIndex,
      activeRgb: { ...snapshot.activeRgb },
      frames: snapshot.frames.map(frame => ({
        id: frame.id,
        name: frame.name,
        duration: frame.duration,
        layers: frame.layers.map(layer => ({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          indices: compressInt16Array(layer.indices),
          direct: layer.direct ? compressUint8Array(layer.direct, { clamped: true }) : null,
        })),
      })),
      showGrid: snapshot.showGrid,
      showMajorGrid: snapshot.showMajorGrid,
      gridScreenStep: snapshot.gridScreenStep,
      majorGridSpacing: snapshot.majorGridSpacing,
      backgroundMode: snapshot.backgroundMode,
      showPixelGuides: snapshot.showPixelGuides,
      showChecker: snapshot.showChecker,
      documentName: snapshot.documentName,
    };
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeFrame')) {
      compressed.activeFrame = snapshot.activeFrame;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeLayer')) {
      compressed.activeLayer = snapshot.activeLayer;
    }
    if (snapshot.selectionMask) {
      compressed.selectionMask = compressUint8Array(snapshot.selectionMask, { clamped: false });
    }
    if (snapshot.selectionBounds) {
      compressed.selectionBounds = { ...snapshot.selectionBounds };
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'tool')) {
      compressed.tool = snapshot.tool;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'brushSize')) {
      compressed.brushSize = snapshot.brushSize;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'brushOpacity')) {
      compressed.brushOpacity = snapshot.brushOpacity;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'colorMode')) {
      compressed.colorMode = snapshot.colorMode;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeToolGroup')) {
      compressed.activeToolGroup = snapshot.activeToolGroup;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'lastGroupTool')) {
      compressed.lastGroupTool = { ...snapshot.lastGroupTool };
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeLeftTab')) {
      compressed.activeLeftTab = snapshot.activeLeftTab;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeRightTab')) {
      compressed.activeRightTab = snapshot.activeRightTab;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'playback')) {
      compressed.playback = { ...snapshot.playback };
    }
    return compressed;
  }

  function decompressHistorySnapshot(snapshot) {
    if (!snapshot) return snapshot;
    const decompressed = {
      width: snapshot.width,
      height: snapshot.height,
      scale: snapshot.scale,
      pan: { x: snapshot.pan.x, y: snapshot.pan.y },
      palette: snapshot.palette.map(color => ({ ...color })),
      activePaletteIndex: snapshot.activePaletteIndex,
      activeRgb: { ...snapshot.activeRgb },
      frames: snapshot.frames.map(frame => ({
        id: frame.id,
        name: frame.name,
        duration: frame.duration,
        layers: frame.layers.map(layer => ({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          indices: decodeInt16Data(layer.indices),
          direct: layer.direct ? decodeUint8Data(layer.direct, { clamped: true }) : null,
        })),
      })),
      showGrid: snapshot.showGrid,
      showMajorGrid: snapshot.showMajorGrid,
      gridScreenStep: snapshot.gridScreenStep,
      majorGridSpacing: snapshot.majorGridSpacing,
      backgroundMode: snapshot.backgroundMode,
      showPixelGuides: snapshot.showPixelGuides,
      showChecker: snapshot.showChecker,
      documentName: snapshot.documentName,
    };
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeFrame')) {
      decompressed.activeFrame = snapshot.activeFrame;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeLayer')) {
      decompressed.activeLayer = snapshot.activeLayer;
    }
    if (snapshot.selectionMask) {
      decompressed.selectionMask = decodeUint8Data(snapshot.selectionMask, { clamped: false });
    }
    if (snapshot.selectionBounds) {
      decompressed.selectionBounds = { ...snapshot.selectionBounds };
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'tool')) {
      decompressed.tool = snapshot.tool;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'brushSize')) {
      decompressed.brushSize = snapshot.brushSize;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'brushOpacity')) {
      decompressed.brushOpacity = snapshot.brushOpacity;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'colorMode')) {
      decompressed.colorMode = snapshot.colorMode;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeToolGroup')) {
      decompressed.activeToolGroup = snapshot.activeToolGroup;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'lastGroupTool')) {
      decompressed.lastGroupTool = { ...snapshot.lastGroupTool };
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeLeftTab')) {
      decompressed.activeLeftTab = snapshot.activeLeftTab;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeRightTab')) {
      decompressed.activeRightTab = snapshot.activeRightTab;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'playback')) {
      decompressed.playback = { ...snapshot.playback };
    }
    return decompressed;
  }

  function bytesForLayer(layer) {
    if (!layer) return 0;
    const indices = layer.indices;
    const direct = layer.direct;
    const indicesBytes = estimateEncodedByteLength(indices, 2);
    const directBytes = estimateEncodedByteLength(direct, 1);
    return indicesBytes + directBytes;
  }

  function estimateStateBytes() {
    let total = 0;
    state.frames.forEach(frame => {
      frame.layers.forEach(layer => {
        total += bytesForLayer(layer);
      });
    });
    if (state.selectionMask) {
      total += state.selectionMask.length;
    }
    total += state.palette.length * 16;
    return total;
  }

  function estimateSnapshotBytes(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return 0;
    let total = 0;
    if (Array.isArray(snapshot.frames)) {
      snapshot.frames.forEach(frame => {
        if (!frame || !Array.isArray(frame.layers)) return;
        frame.layers.forEach(layer => {
          total += bytesForLayer(layer);
        });
      });
    }
    if (snapshot.selectionMask) {
      total += estimateEncodedByteLength(snapshot.selectionMask, 1);
    }
    if (Array.isArray(snapshot.palette)) {
      total += snapshot.palette.length * 16;
    }
    return total;
  }

  function estimateHistoryBytes(list) {
    if (!Array.isArray(list)) return 0;
    return list.reduce((sum, snapshot) => sum + estimateSnapshotBytes(snapshot), 0);
  }

  function getMemoryUsageBreakdown() {
    const current = estimateStateBytes();
    const past = estimateHistoryBytes(history.past);
    const future = estimateHistoryBytes(history.future);
    const pending = history.pending && history.pending.before ? estimateSnapshotBytes(history.pending.before) : 0;
    return { current, past, future, pending, total: current + past + future + pending };
  }

  function trimHistoryForMemoryIfNeeded(breakdown) {
    if (!memoryThresholds || !Number.isFinite(memoryThresholds.warningBytes)) {
      return breakdown || getMemoryUsageBreakdown();
    }
    let usage = breakdown || getMemoryUsageBreakdown();
    if (usage.total <= memoryThresholds.warningBytes) {
      return usage;
    }
    let total = usage.total;
    const warning = memoryThresholds.warningBytes;
    let trimmed = false;
    while (total > warning && (history.past.length || history.future.length)) {
      let removed;
      if (history.future.length && history.future.length >= history.past.length) {
        removed = history.future.shift();
      } else {
        removed = history.past.shift();
      }
      total -= estimateSnapshotBytes(removed);
      trimmed = true;
    }
    if (trimmed) {
      updateHistoryButtons();
      autosaveDirty = true;
      scheduleAutosaveSnapshot();
      usage = getMemoryUsageBreakdown();
      history.limit = Math.max(5, Math.min(history.limit, Math.ceil(history.limit * 0.75)));
      while (history.past.length > history.limit) {
        history.past.shift();
      }
      while (history.future.length > history.limit) {
        history.future.shift();
      }
      historyTrimmedRecently = true;
      historyTrimmedAt = performance && typeof performance.now === 'function' ? performance.now() : Date.now();
    }
    return usage;
  }

  function computeMemoryThresholds() {
    let maxBytes = null;
    if (performance && performance.memory && Number.isFinite(performance.memory.jsHeapSizeLimit)) {
      maxBytes = performance.memory.jsHeapSizeLimit;
    } else if (navigator && Number.isFinite(navigator.deviceMemory)) {
      maxBytes = navigator.deviceMemory * 1024 * 1024 * 1024;
    }
    const warningBytes = maxBytes ? Math.floor(maxBytes * 0.7) : MEMORY_WARNING_DEFAULT;
    return { maxBytes, warningBytes };
  }

  const memoryThresholds = computeMemoryThresholds();

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;
    if (bytes >= GB) return `${(bytes / GB).toFixed(1)} GB`;
    if (bytes >= MB) return `${(bytes / MB).toFixed(1)} MB`;
    if (bytes >= KB) return `${(bytes / KB).toFixed(1)} KB`;
    return `${bytes} B`;
  }

  function updateMemoryStatus() {
    const usageNode = dom.controls.memoryUsage || document.getElementById('memoryUsage');
    if (!usageNode) return;
    let usage = getMemoryUsageBreakdown();
    usage = trimHistoryForMemoryIfNeeded(usage);
    let text = `メモリ: ${formatBytes(usage.total)}`;
    if (memoryThresholds.maxBytes) {
      text += ` | 警告 ${formatBytes(memoryThresholds.warningBytes)} | 上限目安 ${formatBytes(memoryThresholds.maxBytes)}`;
    } else {
      text += ` | 警告 ${formatBytes(memoryThresholds.warningBytes)}`;
    }
    text += ` | ヒストリー ${history.past.length}/${history.limit}`;
    const now = performance && typeof performance.now === 'function' ? performance.now() : Date.now();
    if (historyTrimmedRecently) {
      if (now - historyTrimmedAt <= 6000) {
        text += ' | ヒストリー自動整理';
      } else {
        historyTrimmedRecently = false;
      }
    }
    usageNode.textContent = text;
    usageNode.style.color = usage.total >= memoryThresholds.warningBytes ? '#ff5c5c' : '';
  }

  function clearMemoryUsage() {
    history.past = [];
    history.future = [];
    history.pending = null;
    fillPreviewCache.key = null;
    fillPreviewCache.pixels = null;
    updateHistoryButtons();
    autosaveDirty = true;
    updateMemoryStatus();
    scheduleAutosaveSnapshot();
  }

  function initMemoryMonitor() {
    if (!dom.controls.memoryUsage) {
      dom.controls.memoryUsage = document.getElementById('memoryUsage');
    }
    if (!dom.controls.memoryClear) {
      dom.controls.memoryClear = document.getElementById('memoryClear');
    }
    const usageNode = dom.controls.memoryUsage;
    if (!usageNode) return;
    updateMemoryStatus();
    if (memoryMonitorHandle !== null) {
      window.clearInterval(memoryMonitorHandle);
    }
    memoryMonitorHandle = window.setInterval(updateMemoryStatus, MEMORY_MONITOR_INTERVAL);
    const clearButtons = document.querySelectorAll('#memoryClear');
    clearButtons.forEach(button => {
      if (button.dataset.memoryBound) return;
      button.dataset.memoryBound = 'true';
      button.addEventListener('click', () => {
        clearMemoryUsage();
        updateMemoryStatus();
      });
    });
  }

  function applyHistorySnapshot(snapshot) {
    state.width = snapshot.width;
    state.height = snapshot.height;
    state.scale = normalizeZoomScale(snapshot.scale, state.scale || MIN_ZOOM_SCALE);
    state.pan = { x: snapshot.pan.x, y: snapshot.pan.y };
    if (Object.prototype.hasOwnProperty.call(snapshot, 'tool')) {
      state.tool = snapshot.tool;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'brushSize')) {
      state.brushSize = snapshot.brushSize;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'brushOpacity')) {
      state.brushOpacity = snapshot.brushOpacity;
    }
    state.colorMode = 'index';
    state.palette = snapshot.palette.map(color => ({ ...color }));
    state.activePaletteIndex = snapshot.activePaletteIndex;
    state.activeRgb = { ...snapshot.activeRgb };
    state.frames = snapshot.frames.map(frame => ({
      id: frame.id,
      name: frame.name,
      duration: frame.duration,
      layers: frame.layers.map(layer => {
        const clonedLayer = {
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          indices: new Int16Array(layer.indices),
          direct: null,
        };
        if (layer.direct instanceof Uint8ClampedArray) {
          clonedLayer.direct = new Uint8ClampedArray(layer.direct);
        } else if (ArrayBuffer.isView(layer.direct)) {
          clonedLayer.direct = new Uint8ClampedArray(layer.direct.buffer.slice(0));
        }
        return clonedLayer;
      }),
    }));
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeFrame')) {
      state.activeFrame = snapshot.activeFrame;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeLayer')) {
      state.activeLayer = snapshot.activeLayer;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'selectionMask')) {
      state.selectionMask = snapshot.selectionMask ? new Uint8Array(snapshot.selectionMask) : null;
    } else {
      state.selectionMask = null;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'selectionBounds')) {
      state.selectionBounds = snapshot.selectionBounds ? { ...snapshot.selectionBounds } : null;
    } else {
      state.selectionBounds = null;
    }
    state.showGrid = snapshot.showGrid;
    state.showMajorGrid = snapshot.showMajorGrid ?? false;
    state.gridScreenStep = snapshot.gridScreenStep ?? state.gridScreenStep ?? 16;
    state.majorGridSpacing = snapshot.majorGridSpacing ?? state.majorGridSpacing ?? 16;
    state.backgroundMode = snapshot.backgroundMode ?? 'dark';
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeToolGroup')) {
      state.activeToolGroup = snapshot.activeToolGroup ?? state.activeToolGroup ?? TOOL_TO_GROUP[state.tool] ?? 'pen';
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'lastGroupTool')) {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL, ...(snapshot.lastGroupTool || {}) };
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeLeftTab')) {
      state.activeLeftTab = snapshot.activeLeftTab ?? state.activeLeftTab ?? 'tools';
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'activeRightTab')) {
      state.activeRightTab = snapshot.activeRightTab ?? state.activeRightTab ?? 'frames';
    }
    state.showPixelGuides = snapshot.showPixelGuides;
    state.showChecker = snapshot.showChecker;
    if (Object.prototype.hasOwnProperty.call(snapshot, 'playback')) {
      state.playback = { ...snapshot.playback };
    }
    state.documentName = normalizeDocumentName(snapshot.documentName);

    pointerState.active = false;
    pointerState.preview = null;
    pointerState.selectionPreview = null;
    pointerState.path = [];
    pointerState.startClient = null;
    pointerState.panOrigin = { x: 0, y: 0 };
    hoverPixel = null;

    resizeCanvases();
    renderFrameList();
    renderLayerList();
    renderPalette();
    syncPaletteInputs();
    syncControlsWithState();
    applyViewportTransform();
    invalidateFillPreviewCache();
    requestRender();
    requestOverlayRender();
    updateHistoryButtons();
    updateDocumentMetadata();
    scheduleSessionPersist();
    updateMemoryStatus();
  }

  function normalizeDocumentName(value) {
    if (typeof value !== 'string') {
      return DEFAULT_DOCUMENT_NAME;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return DEFAULT_DOCUMENT_NAME;
    }
    return trimmed.slice(0, 120);
  }

  function updateDocumentMetadata() {
    const name = normalizeDocumentName(state.documentName);
    if (state.documentName !== name) {
      state.documentName = name;
    }
    const baseTitle = 'PiXiEEDraw';
    document.title = `${name} • ${baseTitle}`;
  }

  function createAutosaveFileName(name = state.documentName) {
    const normalized = normalizeDocumentName(name);
    const sanitized = normalized.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();
    let base = sanitized || DEFAULT_DOCUMENT_NAME;
    const ext = '.pixieedraw';
    if (base.toLowerCase().endsWith(ext)) {
      return base;
    }
    return `${base}${ext}`;
  }

  function createExportFileName(extension, suffix = '') {
    const normalized = normalizeDocumentName(state.documentName);
    const sanitized = normalized.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    const safeBase = sanitized || DEFAULT_DOCUMENT_NAME.replace(/\s+/g, '_');
    const safeSuffix = suffix ? `_${suffix}` : '';
    const normalizedExt = extension ? extension.replace(/^\.+/, '') : '';
    return normalizedExt ? `${safeBase}${safeSuffix}.${normalizedExt}` : `${safeBase}${safeSuffix}`;
  }

  function beginHistory(label) {
    if (history.pending) return;
    history.pending = {
      before: compressHistorySnapshot(makeHistorySnapshot()),
      dirty: false,
      label,
    };
  }

  function invalidateFillPreviewCache() {
    fillPreviewCache.key = null;
    fillPreviewCache.pixels = null;
  }

  function markHistoryDirty() {
    invalidateFillPreviewCache();
    autosaveDirty = true;
    if (history.pending) {
      history.pending.dirty = true;
    }
  }

  function commitHistory() {
    if (!history.pending) return;
    if (history.pending.dirty) {
      history.past.push(history.pending.before);
      if (history.past.length > history.limit) {
        history.past.shift();
      }
      history.future.length = 0;
      scheduleAutosaveSnapshot();
    }
    history.pending = null;
    updateHistoryButtons();
    scheduleSessionPersist();
    updateMemoryStatus();
  }

  function undo() {
    commitHistory();
    if (!history.past.length) return;
    const snapshot = compressHistorySnapshot(makeHistorySnapshot());
    history.future.push(snapshot);
    if (history.future.length > history.limit) {
      history.future.shift();
    }
    const previous = history.past.pop();
    applyHistorySnapshot(decompressHistorySnapshot(previous));
    updateHistoryButtons();
    autosaveDirty = true;
    scheduleAutosaveSnapshot();
  }

  function redo() {
    commitHistory();
    if (!history.future.length) return;
    const snapshot = compressHistorySnapshot(makeHistorySnapshot());
    history.past.push(snapshot);
    if (history.past.length > history.limit) {
      history.past.shift();
    }
    const next = history.future.pop();
    applyHistorySnapshot(decompressHistorySnapshot(next));
    updateHistoryButtons();
    autosaveDirty = true;
    scheduleAutosaveSnapshot();
  }

  function updateHistoryButtons() {
    if (dom.controls.undoAction) {
      dom.controls.undoAction.disabled = history.past.length === 0;
    }
    if (dom.controls.redoAction) {
      dom.controls.redoAction.disabled = history.future.length === 0;
    }
  }

  function setupLeftTabs() {
    dom.leftTabButtons = Array.from(document.querySelectorAll('[data-left-tab]'));
    if (!dom.leftTabButtons || !dom.leftTabButtons.length) return;
    dom.leftTabButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (layoutMode === 'mobilePortrait') return;
        const target = button.dataset.leftTab;
        if (!target) return;
        setLeftTab(target);
      });
    });
    updateLeftTabUI();
  }

  function setLeftTab(tab) {
    if (!LEFT_TAB_KEYS.includes(tab)) return;
    if (state.activeLeftTab === tab) return;
    state.activeLeftTab = tab;
    updateLeftTabUI();
    updateLeftTabVisibility();
    scheduleSessionPersist();
  }

  function updateLeftTabUI() {
    if (!dom.leftTabButtons) return;
    dom.leftTabButtons.forEach(button => {
      const tab = button.dataset.leftTab;
      const isActive = tab === state.activeLeftTab;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  function updateLeftTabVisibility() {
    const isMobile = layoutMode === 'mobilePortrait';
    if (dom.leftTabsBar) {
      dom.leftTabsBar.toggleAttribute('hidden', isMobile);
    }
    if (isMobile) {
      LEFT_TAB_KEYS.forEach(key => {
        const section = dom.sections[key];
        if (!section) return;
        section.hidden = false;
        section.setAttribute('aria-hidden', 'false');
        section.classList.add('is-active');
      });
      return;
    }
    LEFT_TAB_KEYS.forEach(key => {
      const section = dom.sections[key];
      if (!section) return;
      const isActive = state.activeLeftTab === key;
      section.hidden = !isActive;
      section.setAttribute('aria-hidden', String(!isActive));
      section.classList.toggle('is-active', isActive);
    });
  }

  function setupRightTabs() {
    dom.rightTabButtons = Array.from(document.querySelectorAll('[data-right-tab]'));
    if (!RIGHT_TAB_KEYS.includes(state.activeRightTab)) {
      state.activeRightTab = 'frames';
    }
    if (!dom.rightTabButtons || !dom.rightTabButtons.length) return;
    dom.rightTabButtons.forEach(button => {
      if (button.dataset.bound === 'true') return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => {
        if (layoutMode === 'mobilePortrait') return;
        const target = button.dataset.rightTab;
        if (!target) return;
        setRightTab(target);
      });
    });
    updateRightTabUI();
    updateRightTabVisibility();
  }

  function setRightTab(tab) {
    if (!RIGHT_TAB_KEYS.includes(tab)) return;
    if (state.activeRightTab === tab) return;
    state.activeRightTab = tab;
    updateRightTabUI();
    updateRightTabVisibility();
    scheduleSessionPersist();
  }

  function updateRightTabUI() {
    if (!dom.rightTabButtons) return;
    dom.rightTabButtons.forEach(button => {
      const tab = button.dataset.rightTab;
      const isActive = tab === state.activeRightTab;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  function updateRightTabVisibility() {
    const isMobile = layoutMode === 'mobilePortrait';
    if (dom.rightTabsBar) {
      dom.rightTabsBar.toggleAttribute('hidden', isMobile);
    }
    if (isMobile) {
      RIGHT_TAB_KEYS.forEach(key => {
        const section = dom.sections[key];
        if (!section) return;
        section.hidden = false;
        section.setAttribute('aria-hidden', 'false');
        section.classList.add('is-active');
      });
      return;
    }
    RIGHT_TAB_KEYS.forEach(key => {
      const section = dom.sections[key];
      if (!section) return;
      const isActive = state.activeRightTab === key;
      section.hidden = !isActive;
      section.setAttribute('aria-hidden', String(!isActive));
      section.classList.toggle('is-active', isActive);
    });
  }

  function resetCurveBuilder() {
    if (!curveBuilder) return;
    curveBuilder = null;
    pointerState.curveHandle = null;
    hoverPixel = null;
    pointerState.preview = null;
    pointerState.tool = null;
    if (history.pending && history.pending.label === 'curve' && !history.pending.dirty) {
      history.pending = null;
    }
    requestOverlayRender();
  }

  function setupToolGroups() {
    dom.toolGroupButtons = Array.from(document.querySelectorAll('.tool-group-button[data-tool-group]'));
    if (!state.lastGroupTool) {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL };
    }
    if (!TOOL_GROUPS[state.activeToolGroup]) {
      state.activeToolGroup = TOOL_TO_GROUP[state.tool] || 'pen';
    }
    if (dom.toolGroupButtons && dom.toolGroupButtons.length) {
      dom.toolGroupButtons.forEach(button => {
        button.addEventListener('click', () => {
          const target = button.dataset.toolGroup;
          if (!target) return;
          setToolGroup(target);
        });
      });
    }
    updateToolGroupButtons();
    updateToolVisibility();
    const activeGroupTools = TOOL_GROUPS[state.activeToolGroup]?.tools || [];
    if (activeGroupTools.length && !activeGroupTools.includes(state.tool)) {
      const fallback = state.lastGroupTool[state.activeToolGroup] && activeGroupTools.includes(state.lastGroupTool[state.activeToolGroup])
        ? state.lastGroupTool[state.activeToolGroup]
        : activeGroupTools[0];
      setActiveTool(fallback, toolButtons, { persist: false, skipGroupUpdate: true });
    } else if (activeGroupTools.includes(state.tool)) {
      state.lastGroupTool[state.activeToolGroup] = state.tool;
    }
  }

  function setToolGroup(group, { persist = true } = {}) {
    if (!TOOL_GROUPS[group]) return;
    if (!state.lastGroupTool) {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL };
    }
    if (!state.lastGroupTool[group]) {
      state.lastGroupTool[group] = DEFAULT_GROUP_TOOL[group] || TOOL_GROUPS[group].tools[0];
    }
    state.activeToolGroup = group;
    updateToolGroupButtons();
    updateToolVisibility();
    const tools = TOOL_GROUPS[group].tools;
    const desired = state.lastGroupTool[group] && tools.includes(state.lastGroupTool[group])
      ? state.lastGroupTool[group]
      : tools[0];
    if (!tools.includes(state.tool)) {
      setActiveTool(desired, toolButtons, { persist, skipGroupUpdate: true });
    } else {
      state.lastGroupTool[group] = state.tool;
      if (persist) scheduleSessionPersist();
    }
  }

  function updateToolGroupButtons() {
    if (!dom.toolGroupButtons) return;
    dom.toolGroupButtons.forEach(button => {
      const group = button.dataset.toolGroup;
      const isActive = group === state.activeToolGroup;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
      button.setAttribute('aria-selected', String(isActive));
      button.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  function updateToolVisibility() {
    if (!toolButtons || !toolButtons.length) return;
    const isMobile = layoutMode === 'mobilePortrait';
    const activeGroup = isMobile ? null : (state.activeToolGroup || TOOL_TO_GROUP[state.tool] || 'pen');
    toolButtons.forEach(button => {
      const group = button.dataset.toolGroup || TOOL_TO_GROUP[button.dataset.tool];
      const show = !activeGroup || !group || group === activeGroup;
      if (isMobile) {
        button.hidden = false;
        button.setAttribute('aria-hidden', 'false');
      } else {
        button.hidden = !show;
        button.setAttribute('aria-hidden', String(!show));
      }
    });
    if (dom.toolGrid) {
      if (activeGroup) {
        dom.toolGrid.dataset.activeGroup = activeGroup;
      } else {
        dom.toolGrid.removeAttribute('data-active-group');
      }
    }
  }

  function handleCurvePointerDown(event, position, layer) {
    if (!position || !layer) {
      pointerState.active = false;
      return;
    }
    hoverPixel = null;
    requestOverlayRender();

    if (!curveBuilder) {
      beginHistory('curve');
      curveBuilder = {
        stage: 'line',
        start: position,
        end: position,
        control1: null,
        control2: null,
        awaitingEndPoint: true,
      };
    }

    if (curveBuilder.stage === 'line') {
      pointerState.active = true;
      pointerState.pointerId = event.pointerId;
      pointerState.tool = 'curve';
      pointerState.start = curveBuilder.start || position;
      pointerState.current = position;
      pointerState.last = position;
      pointerState.path = [position];
      pointerState.curveHandle = null;
      curveBuilder.end = position;
      pointerState.preview = { start: pointerState.start, end: position };
      dom.canvases.drawing.setPointerCapture(event.pointerId);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      requestOverlayRender();
      return;
    }

    if (curveBuilder.stage === 'control1' || curveBuilder.stage === 'control2') {
      pointerState.active = true;
      pointerState.pointerId = event.pointerId;
      pointerState.tool = 'curve';
      pointerState.curveHandle = curveBuilder.stage;
      pointerState.start = position;
      pointerState.current = position;
      pointerState.last = position;
      pointerState.path = [position];
      pointerState.preview = null;
      dom.canvases.drawing.setPointerCapture(event.pointerId);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      if (curveBuilder.stage === 'control1') {
        curveBuilder.control1 = position;
      } else {
        curveBuilder.control2 = position;
      }
      requestOverlayRender();
      return;
    }

    resetCurveBuilder();
  }

  function handleCurvePointerMove(event) {
    const position = getPointerPosition(event);
    if (!position || !curveBuilder) return;
    pointerState.current = position;
    if (curveBuilder.stage === 'line') {
      curveBuilder.end = position;
      pointerState.path.push(position);
      const lineStart = curveBuilder.start || pointerState.start || position;
      pointerState.preview = { start: lineStart, end: position };
    } else if (pointerState.curveHandle === 'control1') {
      curveBuilder.control1 = position;
    } else if (pointerState.curveHandle === 'control2') {
      curveBuilder.control2 = position;
    }
    requestOverlayRender();
  }

  function handleCurvePointerUp(event) {
    if (!curveBuilder) {
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      return;
    }
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    const position = getPointerPosition(event) || pointerState.current || curveBuilder.end;
    if (curveBuilder.stage === 'line') {
      const start = curveBuilder.start;
      curveBuilder.end = position;
      const moved = start && position && (start.x !== position.x || start.y !== position.y);
      pointerState.active = false;
      pointerState.pointerId = null;
      pointerState.path = [];
      pointerState.curveHandle = null;
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      if (!moved) {
        curveBuilder.awaitingEndPoint = true;
        pointerState.preview = null;
        pointerState.tool = null;
        requestOverlayRender();
        return;
      }

      curveBuilder.awaitingEndPoint = false;
      if (!curveBuilder.control1) curveBuilder.control1 = { ...curveBuilder.start };
      if (!curveBuilder.control2) curveBuilder.control2 = { ...curveBuilder.end };
      curveBuilder.stage = 'control1';
      pointerState.preview = null;
      pointerState.tool = null;
      requestOverlayRender();
      return;
    }

    if (pointerState.curveHandle === 'control1') {
      curveBuilder.control1 = position;
      curveBuilder.stage = 'control2';
      pointerState.curveHandle = null;
      pointerState.active = false;
      pointerState.pointerId = null;
      pointerState.path = [];
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      requestOverlayRender();
      scheduleSessionPersist();
      return;
    }

    if (pointerState.curveHandle === 'control2') {
      curveBuilder.control2 = position;
      pointerState.curveHandle = null;
      pointerState.active = false;
      pointerState.pointerId = null;
      pointerState.path = [];
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
      finalizeCurve();
      return;
    }
  }

  function finalizeCurve() {
    if (!curveBuilder) return;
    const layer = getActiveLayer();
    if (!layer) {
      resetCurveBuilder();
      return;
    }
    const { start, end } = curveBuilder;
    let { control1, control2 } = curveBuilder;
    control1 = control1 || { ...start };
    control2 = control2 || { ...end };
    const points = sampleCubicBezierPoints(start, control1, control2, end);
    forEachCurveStrokePixel(points, (x, y) => stampBrush(layer, x, y));
    requestRender();
    commitHistory();
    scheduleSessionPersist();
    resetCurveBuilder();
  }

  function drawCurveGuides(builder) {
    if (!builder || !builder.start || !builder.end) return;
    const { start, end, control1, control2 } = builder;
    ctx.overlay.save();
    ctx.overlay.lineWidth = 0.5;
    ctx.overlay.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.overlay.setLineDash([1, 1]);
    ctx.overlay.beginPath();
    ctx.overlay.moveTo(start.x + 0.5, start.y + 0.5);
    ctx.overlay.lineTo(end.x + 0.5, end.y + 0.5);
    ctx.overlay.stroke();

    const handleColor = 'rgba(255,200,120,0.8)';
    if (control1) {
      ctx.overlay.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.overlay.beginPath();
      ctx.overlay.moveTo(start.x + 0.5, start.y + 0.5);
      ctx.overlay.lineTo(control1.x + 0.5, control1.y + 0.5);
      ctx.overlay.stroke();
      drawHandle(control1, pointerState.curveHandle === 'control1', handleColor);
    }
    if (control2) {
      ctx.overlay.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.overlay.beginPath();
      ctx.overlay.moveTo(end.x + 0.5, end.y + 0.5);
      ctx.overlay.lineTo(control2.x + 0.5, control2.y + 0.5);
      ctx.overlay.stroke();
      drawHandle(control2, pointerState.curveHandle === 'control2', handleColor);
    }

    if (builder.stage !== 'line') {
      const previewControl1 = control1 || { ...start };
      const previewControl2 = control2 || { ...end };
      const curvePoints = sampleCubicBezierPoints(start, previewControl1, previewControl2, end);
      const color = rgbaToCss(getActiveDrawColor());
      const width = state.width;
      const height = state.height;
      const selectionMask = state.selectionMask;
      ctx.overlay.fillStyle = color;
      const stamp = (x, y) => {
        if (x < 0 || y < 0 || x >= width || y >= height) return;
        if (selectionMask && selectionMask[y * width + x] !== 1) return;
        forEachBrushOffset((dx, dy) => {
          const px = x + dx;
          const py = y + dy;
          if (px < 0 || py < 0 || px >= width || py >= height) return;
          if (selectionMask && selectionMask[py * width + px] !== 1) return;
          ctx.overlay.fillRect(px, py, 1, 1);
        });
      };
      forEachCurveStrokePixel(curvePoints, stamp);
    }
    ctx.overlay.restore();
  }

  function drawHandle(point, isActive, color) {
    ctx.overlay.save();
    ctx.overlay.fillStyle = color;
    ctx.overlay.strokeStyle = isActive ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.6)';
    ctx.overlay.lineWidth = 0.5;
    const size = isActive ? 3 : 2;
    const offset = (size - 1) / 2;
    ctx.overlay.fillRect(point.x - offset, point.y - offset, size, size);
    ctx.overlay.strokeRect(point.x - offset, point.y - offset, size, size);
    ctx.overlay.restore();
  }

  function sampleCubicBezierPoints(p0, p1, p2, p3) {
    const tolerance = Math.max(0.1, Math.min(0.5, (state.brushSize || 1) * 0.2));
    const stack = [{ p0, p1, p2, p3, depth: 0 }];
    const seen = new Set();
    const points = [];

    const pushPoint = point => {
      const px = Math.round(point.x);
      const py = Math.round(point.y);
      const key = `${px},${py}`;
      if (seen.has(key)) return;
      seen.add(key);
      points.push({ x: px, y: py });
    };

    pushPoint(p0);

    while (stack.length) {
      const segment = stack.pop();
      const { p0: s0, p1: s1, p2: s2, p3: s3, depth } = segment;
      if (depth > 18 || cubicBezierFlatEnough(s0, s1, s2, s3, tolerance)) {
        pushPoint(s3);
        continue;
      }
      const [left, right] = subdivideCubicBezier(s0, s1, s2, s3);
      stack.push({ ...right, depth: depth + 1 });
      stack.push({ ...left, depth: depth + 1 });
    }

    return points;
  }

  function cubicBezierComponent(a, b, c, d, t) {
    const mt = 1 - t;
    return (mt ** 3) * a + 3 * (mt ** 2) * t * b + 3 * mt * (t ** 2) * c + (t ** 3) * d;
  }

  function cubicBezierFlatEnough(p0, p1, p2, p3, tolerance) {
    const d1 = distancePointToSegment(p1, p0, p3);
    const d2 = distancePointToSegment(p2, p0, p3);
    return d1 <= tolerance && d2 <= tolerance;
  }

  function subdivideCubicBezier(p0, p1, p2, p3) {
    const p01 = midpoint(p0, p1);
    const p12 = midpoint(p1, p2);
    const p23 = midpoint(p2, p3);
    const p012 = midpoint(p01, p12);
    const p123 = midpoint(p12, p23);
    const p0123 = midpoint(p012, p123);
    return [
      { p0, p1: p01, p2: p012, p3: p0123 },
      { p0: p0123, p1: p123, p2: p23, p3 },
    ];
  }

  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function distancePointToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (dx === 0 && dy === 0) {
      return Math.hypot(point.x - a.x, point.y - a.y);
    }
    const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy);
    const clamped = Math.max(0, Math.min(1, t));
    const px = a.x + clamped * dx;
    const py = a.y + clamped * dy;
    return Math.hypot(point.x - px, point.y - py);
  }

  function forEachCurveStrokePixel(points, callback) {
    if (!points || points.length === 0) return;
    let previous = points[0];
    callback(previous.x, previous.y);
    for (let i = 1; i < points.length; i += 1) {
      const current = points[i];
      if (current.x === previous.x && current.y === previous.y) {
        continue;
      }
      const segment = bresenhamLine(previous.x, previous.y, current.x, current.y);
      for (let j = 1; j < segment.length; j += 1) {
        callback(segment[j].x, segment[j].y);
      }
      previous = current;
    }
  }

  function updateGridDecorations() {
    const stack = dom.canvases.stack;
    if (!stack) return;
    const scale = Math.max(Number(state.scale) || MIN_ZOOM_SCALE, MIN_ZOOM_SCALE);
    const tileScreenSize = 16 * scale;
    const minorStep = scale;
    const majorMultiplier = Math.max(Number(state.majorGridSpacing) || 16, 1);
    const majorStep = Math.max(minorStep, majorMultiplier * minorStep);
    state.gridScreenStep = minorStep;
    stack.dataset.grid = state.showGrid ? 'true' : 'false';
    stack.dataset.majorGrid = state.showMajorGrid ? 'true' : 'false';
    stack.style.setProperty('--grid-screen-step', `${minorStep}px`);
    stack.style.setProperty('--grid-major-step', `${majorStep}px`);
    stack.style.setProperty('--grid-offset-x', '0px');
    stack.style.setProperty('--grid-offset-y', '0px');
    stack.style.setProperty('--grid-major-offset-x', '0px');
    stack.style.setProperty('--grid-major-offset-y', '0px');
    stack.style.setProperty('--tile-screen-size', `${tileScreenSize}px`);
    stack.style.setProperty('--tile-offset-x', '0px');
    stack.style.setProperty('--tile-offset-y', '0px');
    stack.dataset.background = state.backgroundMode;
  }

  function syncControlsWithState() {
    if (dom.controls.brushSize) {
      dom.controls.brushSize.value = String(state.brushSize);
    }
    if (dom.controls.brushSizeValue) {
      dom.controls.brushSizeValue.textContent = `${state.brushSize}px`;
    }
    if (dom.controls.brushOpacity) {
      dom.controls.brushOpacity.value = String(Math.round(state.brushOpacity * 100));
    }
    if (dom.controls.brushOpacityValue) {
      dom.controls.brushOpacityValue.textContent = `${Math.round(state.brushOpacity * 100)}%`;
    }
    if (dom.controls.canvasWidth) {
      dom.controls.canvasWidth.value = String(state.width);
    }
    if (dom.controls.canvasHeight) {
      dom.controls.canvasHeight.value = String(state.height);
    }
    if (dom.controls.toggleGrid instanceof HTMLInputElement) {
      dom.controls.toggleGrid.checked = state.showGrid;
    }
    if (dom.controls.toggleMajorGrid instanceof HTMLInputElement) {
      dom.controls.toggleMajorGrid.checked = state.showMajorGrid;
    }
    if (dom.controls.toggleBackgroundMode) {
      const labelMap = {
        dark: '背景:黒',
        light: '背景:白',
        pink: '背景:桃',
      };
      dom.controls.toggleBackgroundMode.setAttribute('aria-pressed', String(state.backgroundMode !== 'dark'));
      dom.controls.toggleBackgroundMode.textContent = labelMap[state.backgroundMode] || '背景';
    }
    if (dom.controls.toggleChecker) {
      dom.controls.toggleChecker.checked = state.showChecker;
    }
    if (dom.canvases.stack) {
      dom.canvases.stack.classList.toggle('is-flat', !state.showChecker);
    }
    if (dom.controls.togglePixelPreview) {
      dom.controls.togglePixelPreview.checked = state.showPixelGuides;
    }
    if (dom.controls.zoomSlider) {
      dom.controls.zoomSlider.value = String(getZoomStepIndex(state.scale));
    }
    if (dom.controls.zoomLevel) {
      dom.controls.zoomLevel.textContent = formatZoomLabel(state.scale);
    }
    if (toolButtons.length) {
      setActiveTool(state.tool, toolButtons, { persist: false });
    }
    updateColorTabSwatch();
    updateLeftTabUI();
    updateLeftTabVisibility();
    updateRightTabUI();
    updateRightTabVisibility();
    updateGridDecorations();
    updateHistoryButtons();
  }

  // -------------------------------------------------------------------------
  // Autosave & File System Access support
  // -------------------------------------------------------------------------

  function updateAutosaveStatus(message, tone = 'info') {
    const statusNode = dom.controls.autosaveStatus;
    if (!statusNode) return;
    statusNode.textContent = message;
    statusNode.dataset.tone = tone;
  }

  function setupAutosaveControls() {
    const button = dom.controls.enableAutosave;
    if (!button) return;
    if (!AUTOSAVE_SUPPORTED) {
      button.disabled = true;
      updateAutosaveStatus('自動保存: このブラウザでは利用できません', 'warn');
      return;
    }
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', async () => {
      if (pendingAutosaveHandle && !autosaveHandle) {
        const reauthorized = await attemptAutosaveReauthorization();
        if (reauthorized) {
          return;
        }
      }
      requestAutosaveBinding({ suggestedName: createAutosaveFileName() });
    });
  }

  async function initializeAutosave() {
    setupAutosaveControls();
    const button = dom.controls.enableAutosave;
    if (!AUTOSAVE_SUPPORTED) {
      return;
    }

    updateAutosaveStatus('自動保存: 初期化中…');

    try {
      const handle = await loadStoredAutosaveHandle();
      if (!handle) {
        updateAutosaveStatus('自動保存: 未設定');
        return;
      }
      const granted = await ensureHandlePermission(handle, { request: false });
      if (granted) {
        autosaveHandle = handle;
        if (button) {
          button.textContent = '保存先を変更';
        }
        const restored = await restoreAutosaveDocument(handle);
        if (restored) {
          updateAutosaveStatus('自動保存: 有効');
        }
      } else {
        schedulePendingAutosavePermission(handle);
      }
    } catch (error) {
      console.warn('Autosave initialisation failed', error);
      updateAutosaveStatus('自動保存: 初期化でエラーが発生しました', 'error');
    }
  }

  function scheduleAutosaveSnapshot() {
    if (!AUTOSAVE_SUPPORTED) return;
    if (!autosaveHandle) return;
    if (autosaveRestoring) return;
    if (!autosaveDirty) return;
    if (autosaveWriteTimer !== null) {
      window.clearTimeout(autosaveWriteTimer);
    }
    autosaveWriteTimer = window.setTimeout(() => {
      autosaveWriteTimer = null;
      writeAutosaveSnapshot().catch(error => {
        console.warn('Autosave failed', error);
        updateAutosaveStatus('自動保存: 保存に失敗しました', 'error');
      });
    }, AUTOSAVE_WRITE_DELAY);
  }

  async function writeAutosaveSnapshot(force = false) {
    if (!AUTOSAVE_SUPPORTED) return;
    if (!autosaveHandle) return;
    if (!force && !autosaveDirty) return;
    const granted = await ensureHandlePermission(autosaveHandle, { request: false });
    if (!granted) {
      schedulePendingAutosavePermission(autosaveHandle);
      autosaveHandle = null;
      return;
    }
    try {
      updateAutosaveStatus('自動保存: 保存中…');
      const snapshot = makeHistorySnapshot();
      const payload = serializeDocumentSnapshot(snapshot);
      const json = JSON.stringify({ version: DOCUMENT_FILE_VERSION, document: payload, updatedAt: new Date().toISOString() });
      const writable = await autosaveHandle.createWritable();
      await writable.write(json);
      await writable.close();
      autosaveDirty = false;
      updateAutosaveStatus('自動保存: 保存済み', 'success');
    } catch (error) {
      throw error;
    }
  }

  async function restoreAutosaveDocument(handle) {
    try {
      const file = await handle.getFile();
      if (!file) {
        return false;
      }
      const text = await file.text();
      if (!text) {
        updateAutosaveStatus('自動保存: 新しいファイルに保存します');
        return false;
      }
      const parsed = JSON.parse(text);
      const payload = parsed && typeof parsed === 'object' && parsed.document ? parsed.document : parsed;
      const snapshot = deserializeDocumentPayload(payload);
      autosaveRestoring = true;
      applyHistorySnapshot(snapshot);
      history.past = [];
      history.future = [];
      history.pending = null;
      autosaveRestoring = false;
      autosaveDirty = false;
      updateMemoryStatus();
      return true;
    } catch (error) {
      autosaveRestoring = false;
      console.warn('Failed to restore autosave document', error);
      updateAutosaveStatus('自動保存: ファイルを読み込めませんでした', 'error');
      return false;
    }
  }

  async function requestAutosaveBinding(options = {}) {
    if (!AUTOSAVE_SUPPORTED) return;
    try {
      const suggestedNameOption = typeof options.suggestedName === 'string' ? options.suggestedName.trim() : '';
      const suggestedName = suggestedNameOption || createAutosaveFileName();
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'PiXiEEDraw ドキュメント',
            accept: {
              'application/json': ['.json', '.pxdraw', '.pixieedraw'],
              'application/x-pixieedraw': ['.pixieedraw'],
            },
          },
        ],
      });
      const granted = await ensureHandlePermission(handle, { request: true });
      if (!granted) {
        updateAutosaveStatus('自動保存: 権限が必要です', 'warn');
        return;
      }
      autosaveHandle = handle;
      pendingAutosaveHandle = null;
      clearPendingPermissionListener();
      await storeAutosaveHandle(handle);
      if (dom.controls.enableAutosave) {
        dom.controls.enableAutosave.textContent = '保存先を変更';
      }
      updateAutosaveStatus('自動保存: 保存中…');
      autosaveDirty = true;
      await writeAutosaveSnapshot(true);
    } catch (error) {
      if (error && error.name === 'AbortError') {
        updateAutosaveStatus('自動保存: キャンセルしました', 'warn');
        return;
      }
      console.warn('Autosave binding failed', error);
      updateAutosaveStatus('自動保存: ファイルを選択できませんでした', 'error');
    }
  }

  async function ensureHandlePermission(handle, { request = false } = {}) {
    if (!handle) return false;
    const opts = { mode: 'readwrite' };
    const canQuery = typeof handle.queryPermission === 'function';
    const canRequest = typeof handle.requestPermission === 'function';

    if (!canQuery) {
      if (!request || !canRequest) {
        return false;
      }
      const outcome = await handle.requestPermission(opts);
      return outcome === 'granted';
    }

    let permission = await handle.queryPermission(opts);
    if (permission === 'granted') {
      return true;
    }
    if (!request || !canRequest) {
      return false;
    }
    permission = await handle.requestPermission(opts);
    return permission === 'granted';
  }

  function schedulePendingAutosavePermission(handle) {
    pendingAutosaveHandle = handle;
    autosaveHandle = null;
    clearPendingPermissionListener();
    updateAutosaveStatus('自動保存: 権限が必要です。キャンバスをクリックして再許可してください', 'warn');
    if (dom.controls.enableAutosave) {
      dom.controls.enableAutosave.textContent = '自動保存を再許可';
    }
    const listener = () => {
      attemptAutosaveReauthorization().catch(error => {
        console.warn('Autosave reauthorization failed', error);
        updateAutosaveStatus('自動保存: 権限を付与できませんでした', 'error');
      });
    };
    autosavePermissionListener = listener;
    window.addEventListener('pointerdown', listener, { once: true });
  }

  function clearPendingPermissionListener() {
    if (!autosavePermissionListener) return;
    window.removeEventListener('pointerdown', autosavePermissionListener);
    autosavePermissionListener = null;
  }

  async function attemptAutosaveReauthorization() {
    if (!pendingAutosaveHandle) {
      return false;
    }
    const handle = pendingAutosaveHandle;
    clearPendingPermissionListener();
    const granted = await ensureHandlePermission(handle, { request: true });
    if (!granted) {
      updateAutosaveStatus('自動保存: 権限が必要です。右のボタンから再許可してください', 'warn');
      schedulePendingAutosavePermission(handle);
      return false;
    }
    pendingAutosaveHandle = null;
    autosaveHandle = handle;
    if (dom.controls.enableAutosave) {
      dom.controls.enableAutosave.textContent = '保存先を変更';
    }
    try {
      const restored = await restoreAutosaveDocument(handle);
      if (restored) {
        updateAutosaveStatus('自動保存: 有効', 'success');
      } else {
        updateAutosaveStatus('自動保存: 保存中…', 'info');
      }
    } catch (error) {
      console.warn('Autosave restore after reauthorization failed', error);
      updateAutosaveStatus('自動保存: 復元に失敗しました', 'error');
    }
    return true;
  }

  async function openDocumentDialog() {
    if (typeof window.showOpenFilePicker === 'function') {
      try {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: 'PiXiEEDraw ドキュメント',
              accept: {
                'application/json': ['.json', '.pxdraw', '.pixieedraw'],
                'application/x-pixieedraw': ['.pixieedraw'],
              },
            },
          ],
        });
        if (!handle) return;
        await loadDocumentFromHandle(handle);
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') {
          return;
        }
        console.warn('Document open failed', error);
        updateAutosaveStatus('ドキュメントを開けませんでした', 'error');
        return;
      }
    }
    openDocumentViaInput();
  }

  function openDocumentViaInput() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.pxdraw,.pixieedraw,application/json,application/x-pixieedraw';
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) {
        input.remove();
        return;
      }
      try {
        const text = await file.text();
        await loadDocumentFromText(text, null);
      } catch (error) {
        console.warn('Document load failed', error);
        updateAutosaveStatus('ドキュメントを開けませんでした', 'error');
      } finally {
        input.value = '';
        input.remove();
      }
    });
    input.addEventListener('click', () => {
      input.value = '';
    });
    input.click();
  }

  function openExportDialog() {
    const config = dom.exportDialog;
    if (!config) {
      exportProjectWithFallback();
      return;
    }
    const dialog = config.dialog;
    if (dialog && typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      exportProjectWithFallback();
    }
  }

  function closeExportDialog() {
    const dialog = dom.exportDialog?.dialog;
    if (dialog && dialog.open) {
      dialog.close();
    }
  }

  function exportProjectWithFallback() {
    const choice = window.prompt('書き出し形式を入力してください (png / gif)', 'png');
    if (!choice) {
      return;
    }
    const normalized = choice.trim().toLowerCase();
    if (normalized === 'png') {
      exportProjectAsPng();
    } else if (normalized === 'gif') {
      exportProjectAsGif();
    } else {
      window.alert('png か gif を入力してください。');
    }
  }

  function normalizeFpsValue(value) {
    return clamp(Math.round(Number(value) || 0), 1, 60);
  }

  function getDurationFromFps(fps) {
    if (!Number.isFinite(fps) || fps <= 0) {
      return 1000 / 12;
    }
    return 1000 / fps;
  }

  function updateAnimationFpsDisplay(fps, durationMs) {
    if (dom.controls.animationFps) {
      dom.controls.animationFps.value = String(fps);
    }
    if (dom.controls.animationFpsMs) {
      const rounded = Math.max(1, Math.round(Number(durationMs) || 0));
      dom.controls.animationFpsMs.textContent = `${rounded}ms`;
    }
  }

  function syncAnimationFpsDisplayFromState() {
    const frame = getActiveFrame();
    const duration = frame && Number.isFinite(frame.duration) && frame.duration > 0
      ? frame.duration
      : 1000 / 12;
    const fps = normalizeFpsValue(Math.round(1000 / duration));
    updateAnimationFpsDisplay(fps, duration);
  }

  function applyFpsToAllFrames(fpsValue) {
    const frames = state.frames;
    if (!Array.isArray(frames) || !frames.length) {
      return;
    }
    const clampedFps = normalizeFpsValue(fpsValue);
    const nextDuration = getDurationFromFps(clampedFps);
    const hasChange = frames.some(frame => Math.abs(frame.duration - nextDuration) > 0.001);
    if (!hasChange) {
      updateAnimationFpsDisplay(clampedFps, nextDuration);
      return;
    }
    beginHistory('setAllFrameFps');
    frames.forEach(frame => {
      frame.duration = nextDuration;
    });
    markHistoryDirty();
    commitHistory();
    scheduleSessionPersist();
    renderTimelineMatrix();
    updateAnimationFpsDisplay(clampedFps, nextDuration);
  }

  function setActiveFrameIndex(nextIndex, { wrap = false, persist = true, render = true } = {}) {
    const frames = state.frames;
    if (!Array.isArray(frames) || !frames.length) {
      return null;
    }
    const length = frames.length;
    const normalizedIndex = wrap
      ? ((Math.round(nextIndex) % length) + length) % length
      : clamp(Math.round(nextIndex), 0, length - 1);
    const previousIndex = state.activeFrame;
    state.activeFrame = normalizedIndex;
    const frame = frames[normalizedIndex];
    if (frame && (!frame.layers.some(layer => layer.id === state.activeLayer) || !state.activeLayer)) {
      const lastLayer = frame.layers[frame.layers.length - 1];
      if (lastLayer) {
        state.activeLayer = lastLayer.id;
      }
    }
    if (persist) {
      scheduleSessionPersist();
    }
    if (render) {
      if (previousIndex !== normalizedIndex) {
        renderFrameList();
        renderLayerList();
        requestRender();
        requestOverlayRender();
      } else {
        syncAnimationFpsDisplayFromState();
      }
    }
    return frame;
  }

  function stepActiveFrame(offset, options = {}) {
    const frames = state.frames;
    if (!Array.isArray(frames) || !frames.length) {
      return;
    }
    const wrap = options.wrap !== false;
    const persist = options.persist !== false;
    const render = options.render !== false;
    const nextIndex = state.activeFrame + Number(offset || 0);
    setActiveFrameIndex(nextIndex, { wrap, persist, render });
  }

  function openNewProjectDialog() {
    const config = dom.newProject;
    if (!config) {
      promptNewProjectFallback();
      return;
    }
    const dialog = config.dialog;
    if (dialog && typeof dialog.showModal === 'function') {
      if (config.nameInput) {
        config.nameInput.value = state.documentName || DEFAULT_DOCUMENT_NAME;
      }
      if (config.widthInput) {
        config.widthInput.value = String(state.width);
      }
      if (config.heightInput) {
        config.heightInput.value = String(state.height);
      }
      dialog.showModal();
      window.requestAnimationFrame(() => {
        config.nameInput?.focus();
        config.nameInput?.select?.();
      });
      return;
    }
    promptNewProjectFallback();
  }

  function setupExportDialog() {
    const config = dom.exportDialog;
    if (!config) {
      return;
    }
    const dialog = config.dialog;
    const supportsDialog = dialog && typeof dialog.showModal === 'function';
    const bind = (element, handler) => {
      if (element) {
        element.addEventListener('click', handler);
      }
    };
    bind(config.confirmPng, () => {
      exportProjectAsPng();
      closeExportDialog();
    });
    bind(config.confirmGif, () => {
      exportProjectAsGif();
      closeExportDialog();
    });
    bind(config.cancel, () => {
      closeExportDialog();
    });
    if (supportsDialog && dialog) {
      dialog.addEventListener('cancel', event => {
        event.preventDefault();
        closeExportDialog();
      });
    } else if (dialog) {
      dialog.hidden = true;
    }
  }

  function closeNewProjectDialog() {
    const dialog = dom.newProject?.dialog;
    if (dialog && dialog.open) {
      dialog.close();
    }
  }

  function handleNewProjectSubmit() {
    const config = dom.newProject;
    if (config?.form && typeof config.form.reportValidity === 'function') {
      if (!config.form.reportValidity()) {
        return;
      }
    }
    const name = config?.nameInput?.value ?? state.documentName;
    const widthValue = config?.widthInput?.value;
    const heightValue = config?.heightInput?.value;
    const width = Number(widthValue);
    const height = Number(heightValue);
    const created = createNewProject({ name, width, height });
    if (created) {
      closeNewProjectDialog();
    } else {
      window.alert(`キャンバスサイズは${MIN_CANVAS_SIZE}〜${MAX_CANVAS_SIZE}の数値で入力してください。`);
    }
  }

  function promptNewProjectFallback() {
    const name = window.prompt('ファイル名を入力してください', state.documentName || DEFAULT_DOCUMENT_NAME);
    if (name === null) return;
    const widthRaw = window.prompt(`キャンバスの横幅 (${MIN_CANVAS_SIZE}〜${MAX_CANVAS_SIZE})`, String(state.width));
    if (widthRaw === null) return;
    const heightRaw = window.prompt(`キャンバスの縦幅 (${MIN_CANVAS_SIZE}〜${MAX_CANVAS_SIZE})`, String(state.height));
    if (heightRaw === null) return;
    const width = Number(widthRaw);
    const height = Number(heightRaw);
    if (!createNewProject({ name, width, height })) {
      window.alert(`キャンバスサイズは${MIN_CANVAS_SIZE}〜${MAX_CANVAS_SIZE}の数値で入力してください。`);
    }
  }

  function createNewProject({ name, width, height }) {
    const widthNumber = Number(width);
    const heightNumber = Number(height);
    if (!Number.isFinite(widthNumber) || !Number.isFinite(heightNumber)) {
      return false;
    }
    const clampedWidth = clamp(Math.round(widthNumber), MIN_CANVAS_SIZE, MAX_CANVAS_SIZE);
    const clampedHeight = clamp(Math.round(heightNumber), MIN_CANVAS_SIZE, MAX_CANVAS_SIZE);
    const snapshot = createInitialState({
      width: clampedWidth,
      height: clampedHeight,
      name,
    });

    applyHistorySnapshot(snapshot);
    history.past = [];
    history.future = [];
    history.pending = null;
    updateHistoryButtons();

    if (AUTOSAVE_SUPPORTED) {
      autosaveHandle = null;
      pendingAutosaveHandle = null;
      clearPendingPermissionListener();
      clearStoredAutosaveHandle().catch(error => {
        console.warn('Failed to forget previous autosave handle', error);
      });
      const suggestedName = createAutosaveFileName(name);
      if (dom.controls.enableAutosave) {
        dom.controls.enableAutosave.textContent = '保存先を変更';
      }
      updateAutosaveStatus('自動保存: 保存先を選択してください', 'info');
      requestAutosaveBinding({ suggestedName }).catch(error => {
        console.warn('Autosave binding after new project failed', error);
        updateAutosaveStatus('自動保存: 保存先を設定できませんでした', 'error');
      });
    } else {
      updateAutosaveStatus('新しいプロジェクトを作成しました', 'info');
    }
    scheduleSessionPersist();
    return true;
  }

  async function loadDocumentFromHandle(handle) {
    try {
      const file = await handle.getFile();
      const text = await file.text();
      await loadDocumentFromText(text, handle);
    } catch (error) {
      console.warn('Document handle load failed', error);
      updateAutosaveStatus('ドキュメントを開けませんでした', 'error');
    }
  }

  async function loadDocumentFromText(text, handle) {
    let snapshot;
    try {
      snapshot = snapshotFromDocumentText(text);
    } catch (error) {
      console.warn('Failed to parse document', error);
      updateAutosaveStatus('ドキュメントの読み込みに失敗しました', 'error');
      return;
    }

    autosaveRestoring = true;
    applyHistorySnapshot(snapshot);
    history.past = [];
    history.future = [];
    history.pending = null;
    autosaveRestoring = false;

    if (handle) {
      const granted = await ensureHandlePermission(handle, { request: true });
      if (granted) {
        autosaveHandle = handle;
        pendingAutosaveHandle = null;
        clearPendingPermissionListener();
        await storeAutosaveHandle(handle);
        if (dom.controls.enableAutosave) {
          dom.controls.enableAutosave.textContent = '保存先を変更';
        }
        updateAutosaveStatus('自動保存: 有効', 'success');
      } else {
        schedulePendingAutosavePermission(handle);
      }
    } else {
      autosaveHandle = null;
      pendingAutosaveHandle = null;
      clearPendingPermissionListener();
      if (AUTOSAVE_SUPPORTED) {
        updateAutosaveStatus('自動保存: 読み込み済み。保存先を設定してください', 'warn');
      }
    }

    scheduleSessionPersist();
    scheduleAutosaveSnapshot();
  }

  function snapshotFromDocumentText(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Document text is empty');
    }
    const parsed = JSON.parse(text);
    const payload = parsed && typeof parsed === 'object' && parsed.document ? parsed.document : parsed;
    return deserializeDocumentPayload(payload);
  }

  async function storeAutosaveHandle(handle) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(AUTOSAVE_DB_NAME, AUTOSAVE_DB_VERSION);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(AUTOSAVE_STORE_NAME)) {
          db.createObjectStore(AUTOSAVE_STORE_NAME);
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(AUTOSAVE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(AUTOSAVE_STORE_NAME);
        const putRequest = store.put(handle, AUTOSAVE_HANDLE_KEY);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          const { error } = tx;
          db.close();
          if (error) reject(error);
        };
      };
    });
  }

  async function loadStoredAutosaveHandle() {
    if (!AUTOSAVE_SUPPORTED) return null;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(AUTOSAVE_DB_NAME, AUTOSAVE_DB_VERSION);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(AUTOSAVE_STORE_NAME)) {
          db.createObjectStore(AUTOSAVE_STORE_NAME);
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(AUTOSAVE_STORE_NAME, 'readonly');
        const store = tx.objectStore(AUTOSAVE_STORE_NAME);
        const getRequest = store.get(AUTOSAVE_HANDLE_KEY);
        getRequest.onsuccess = () => {
          resolve(getRequest.result || null);
        };
        getRequest.onerror = () => reject(getRequest.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          const { error } = tx;
          db.close();
          if (error) reject(error);
        };
      };
    }).catch(error => {
      console.warn('Autosave handle load failed', error);
      return null;
    });
  }

  async function clearStoredAutosaveHandle() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(AUTOSAVE_DB_NAME, AUTOSAVE_DB_VERSION);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(AUTOSAVE_STORE_NAME)) {
          db.createObjectStore(AUTOSAVE_STORE_NAME);
        }
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(AUTOSAVE_STORE_NAME, 'readwrite');
        const store = tx.objectStore(AUTOSAVE_STORE_NAME);
        const deleteRequest = store.delete(AUTOSAVE_HANDLE_KEY);
        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () => reject(deleteRequest.error);
        tx.oncomplete = () => db.close();
        tx.onerror = () => {
          const { error } = tx;
          db.close();
          if (error) reject(error);
        };
      };
    });
  }

  function serializeDocumentSnapshot(snapshot) {
    const palette = snapshot.palette.map(color => normalizeColorValue(color));
    return {
      version: DOCUMENT_FILE_VERSION,
      width: snapshot.width,
      height: snapshot.height,
      scale: snapshot.scale,
      pan: { ...snapshot.pan },
      palette,
      activePaletteIndex: snapshot.activePaletteIndex,
      activeRgb: normalizeColorValue(snapshot.activeRgb),
      frames: snapshot.frames.map(frame => ({
        id: frame.id,
        name: frame.name,
        duration: frame.duration,
        layers: frame.layers.map(layer => ({
          id: layer.id,
          name: layer.name,
          visible: layer.visible,
          opacity: layer.opacity,
          indices: encodeTypedArray(layer.indices),
          direct: encodeTypedArray(layer.direct),
        })),
      })),
      showGrid: snapshot.showGrid,
      showMajorGrid: snapshot.showMajorGrid,
      gridScreenStep: snapshot.gridScreenStep,
      majorGridSpacing: snapshot.majorGridSpacing,
      backgroundMode: snapshot.backgroundMode,
      documentName: normalizeDocumentName(snapshot.documentName),
      showPixelGuides: snapshot.showPixelGuides,
      showChecker: snapshot.showChecker,
    };
  }

  function deserializeDocumentPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid document payload');
    }
    const width = clamp(Math.round(Number(payload.width) || state.width || 128), 1, 4096);
    const height = clamp(Math.round(Number(payload.height) || state.height || 128), 1, 4096);
    const pixelCount = width * height;
    const paletteSource = Array.isArray(payload.palette) ? payload.palette : [];
    const palette = paletteSource.length ? paletteSource.map(color => normalizeColorValue(color)) : state.palette.map(color => ({ ...color }));

    const framesSource = Array.isArray(payload.frames) ? payload.frames : [];
    if (!framesSource.length) {
      throw new Error('Document has no frames');
    }

    const frames = framesSource.map((frame, frameIndex) => {
      if (!frame || !Array.isArray(frame.layers) || !frame.layers.length) {
        throw new Error(`Frame ${frameIndex} has no layers`);
      }
      const layers = frame.layers.map((layer, layerIndex) => {
        if (!layer || typeof layer.indices !== 'string') {
          throw new Error(`Layer ${layerIndex} is missing index data`);
        }
        const indicesBytes = decodeBase64(layer.indices);
        if (indicesBytes.length !== pixelCount * 2) {
          throw new Error('Layer pixel data mismatch');
        }
        const indicesView = new Int16Array(indicesBytes.buffer, indicesBytes.byteOffset, indicesBytes.byteLength / 2);
        const indices = new Int16Array(indicesView.length);
        indices.set(indicesView);
        let direct = null;
        if (typeof layer.direct === 'string' && layer.direct.length > 0) {
          const directBytes = decodeBase64(layer.direct);
          if (directBytes.length !== pixelCount * 4) {
            throw new Error('Layer direct pixel data mismatch');
          }
          direct = new Uint8ClampedArray(directBytes.length);
          direct.set(directBytes);
        }
        return {
          id: typeof layer.id === 'string' ? layer.id : `layer-${frameIndex}-${layerIndex}`,
          name: typeof layer.name === 'string' ? layer.name : `レイヤー ${layerIndex + 1}`,
          visible: layer.visible !== false,
          opacity: clamp(Number(layer.opacity) ?? 1, 0, 1),
          indices,
          direct,
        };
      });
      return {
        id: typeof frame.id === 'string' ? frame.id : `frame-${frameIndex + 1}`,
        name: typeof frame.name === 'string' ? frame.name : `フレーム ${frameIndex + 1}`,
        duration: clamp(Number(frame.duration) || 1000 / 12, 16, 2000),
        layers,
      };
    });

    const activeFrameIndex = clamp(Math.round(Number(payload.activeFrame) || 0), 0, frames.length - 1);
    const activeFrame = frames[activeFrameIndex];
    let activeLayerId = typeof payload.activeLayer === 'string' ? payload.activeLayer : activeFrame.layers[activeFrame.layers.length - 1].id;
    if (!activeFrame.layers.some(layer => layer.id === activeLayerId)) {
      activeLayerId = activeFrame.layers[activeFrame.layers.length - 1].id;
    }

    let selectionMask = null;
    if (typeof payload.selectionMask === 'string') {
      const maskBytes = decodeBase64(payload.selectionMask);
      if (maskBytes.length === pixelCount) {
        selectionMask = new Uint8Array(maskBytes.length);
        selectionMask.set(maskBytes);
      }
    }

    const selectionBounds = validateBoundsObject(payload.selectionBounds);
    const activeTool = typeof payload.tool === 'string' ? payload.tool : state.tool;
    const activeRgb = normalizeColorValue(payload.activeRgb || state.activeRgb);
    const colorMode = 'index';
    const activePaletteIndex = clamp(Math.round(Number(payload.activePaletteIndex) || 0), 0, palette.length - 1);
    const backgroundMode = payload.backgroundMode === 'light' || payload.backgroundMode === 'pink' ? payload.backgroundMode : 'dark';
    const activeToolGroup = TOOL_GROUPS[payload.activeToolGroup] ? payload.activeToolGroup : (TOOL_TO_GROUP[activeTool] || state.activeToolGroup);
    const lastGroupTool = normalizeLastGroupTool(payload.lastGroupTool);
    const activeLeftTab = LEFT_TAB_KEYS.includes(payload.activeLeftTab) ? payload.activeLeftTab : state.activeLeftTab;
    const activeRightTab = RIGHT_TAB_KEYS.includes(payload.activeRightTab) ? payload.activeRightTab : state.activeRightTab;
    const documentName = normalizeDocumentName(
      typeof payload.documentName === 'string' ? payload.documentName : (typeof payload.name === 'string' ? payload.name : state.documentName),
    );

    return {
      width,
      height,
      scale: normalizeZoomScale(payload.scale, state.scale || MIN_ZOOM_SCALE),
      pan: {
        x: Math.round(Number(payload.pan?.x) || 0),
        y: Math.round(Number(payload.pan?.y) || 0),
      },
      tool: activeTool,
      brushSize: clamp(Math.round(Number(payload.brushSize) || state.brushSize || 1), 1, 64),
      brushOpacity: clamp(Number(payload.brushOpacity ?? state.brushOpacity ?? 1), 0, 1),
      colorMode,
      palette,
      activePaletteIndex,
      activeRgb,
      frames,
      activeFrame: activeFrameIndex,
      activeLayer: activeLayerId,
      selectionMask,
      selectionBounds,
      showGrid: Boolean(payload.showGrid ?? state.showGrid),
      showMajorGrid: Boolean(payload.showMajorGrid ?? state.showMajorGrid),
      gridScreenStep: clamp(Math.round(Number(payload.gridScreenStep) || state.gridScreenStep || 8), 1, 256),
      majorGridSpacing: clamp(Math.round(Number(payload.majorGridSpacing) || state.majorGridSpacing || 16), 2, 512),
      backgroundMode,
      activeToolGroup,
      lastGroupTool,
      activeLeftTab,
      activeRightTab,
      showPixelGuides: Boolean(payload.showPixelGuides ?? state.showPixelGuides),
      showChecker: Boolean(payload.showChecker ?? state.showChecker),
      playback: typeof payload.playback === 'object' && payload.playback
        ? {
          isPlaying: Boolean(payload.playback.isPlaying),
          lastFrame: Number(payload.playback.lastFrame) || 0,
        }
        : { isPlaying: false, lastFrame: 0 },
      documentName,
    };
  }

  // -------------------------------------------------------------------------
  // Export helpers
  // -------------------------------------------------------------------------

  async function exportProjectAsPng() {
    const frameCount = state.frames.length;
    if (!frameCount) {
      updateAutosaveStatus('PNGを書き出すフレームがありません', 'warn');
      return;
    }
    try {
      const { width, height } = state;
      const framePixels = compositeDocumentFrames(state.frames, width, height, state.palette);
      const { canvas, columns, rows } = createSpriteSheetCanvas(framePixels, width, height);
      const blob = await canvasToBlob(canvas, 'image/png');
      if (!blob) {
        throw new Error('Failed to create PNG blob');
      }
      const suffix = frameCount > 1
        ? `sheet_${columns}x${rows}`
        : `frame_${String(state.activeFrame + 1).padStart(2, '0')}`;
      const filename = createExportFileName('png', suffix);
      triggerDownloadFromBlob(blob, filename);
      updateAutosaveStatus('PNGを書き出しました', 'success');
    } catch (error) {
      console.error('PNG export failed', error);
      updateAutosaveStatus('PNGの書き出しに失敗しました', 'error');
    }
  }

  async function exportProjectAsGif() {
    const frameCount = state.frames.length;
    if (!frameCount) {
      updateAutosaveStatus('GIFを書き出すフレームがありません', 'warn');
      return;
    }
    try {
      const { width, height } = state;
      const framePixels = compositeDocumentFrames(state.frames, width, height, state.palette);
      const frameDurations = state.frames.map(frame => clamp(Math.round(Number(frame.duration) || 0), 16, 2000));
      const gifBytes = buildGifFromPixels(framePixels, frameDurations, width, height);
      const blob = new Blob([gifBytes], { type: 'image/gif' });
      const filename = createExportFileName('gif', 'animation');
      triggerDownloadFromBlob(blob, filename);
      updateAutosaveStatus('GIFを書き出しました', 'success');
    } catch (error) {
      console.error('GIF export failed', error);
      updateAutosaveStatus('GIFの書き出しに失敗しました', 'error');
    }
  }

  function compositeDocumentFrames(frames, width, height, palette) {
    return frames.map(frame => compositeFramePixels(frame, width, height, palette));
  }

  function compositeFramePixels(frame, width, height, palette) {
    const pixelCount = width * height;
    const output = new Uint8ClampedArray(pixelCount * 4);
    if (!frame || !Array.isArray(frame.layers)) {
      return output;
    }
    frame.layers.forEach(layer => {
      if (!layer || !layer.visible || layer.opacity <= 0) {
        return;
      }
      const layerOpacity = clamp(Number(layer.opacity) || 0, 0, 1);
      if (layerOpacity <= 0) {
        return;
      }
      const indices = layer.indices instanceof Int16Array && layer.indices.length >= pixelCount ? layer.indices : null;
      const direct = layer.direct instanceof Uint8ClampedArray && layer.direct.length >= pixelCount * 4 ? layer.direct : null;
      for (let i = 0; i < pixelCount; i += 1) {
        const paletteIndex = indices ? indices[i] : -1;
        let srcR;
        let srcG;
        let srcB;
        let srcA;
        if (paletteIndex >= 0 && palette && palette[paletteIndex]) {
          const color = palette[paletteIndex];
          srcR = color.r;
          srcG = color.g;
          srcB = color.b;
          srcA = color.a;
        } else if (direct) {
          const base = i * 4;
          srcR = direct[base];
          srcG = direct[base + 1];
          srcB = direct[base + 2];
          srcA = direct[base + 3];
        } else {
          continue;
        }
        if (!Number.isFinite(srcA) || srcA <= 0) {
          continue;
        }
        const alpha = (srcA / 255) * layerOpacity;
        if (alpha <= 0) {
          continue;
        }
        const destIndex = i * 4;
        const dstA = output[destIndex + 3] / 255;
        const outA = alpha + dstA * (1 - alpha);
        if (outA <= 0) {
          continue;
        }
        const srcFactor = alpha / outA;
        const dstFactor = (dstA * (1 - alpha)) / outA;
        output[destIndex] = Math.round(srcR * srcFactor + output[destIndex] * dstFactor);
        output[destIndex + 1] = Math.round(srcG * srcFactor + output[destIndex + 1] * dstFactor);
        output[destIndex + 2] = Math.round(srcB * srcFactor + output[destIndex + 2] * dstFactor);
        output[destIndex + 3] = Math.round(outA * 255);
      }
    });
    return output;
  }

  function createSpriteSheetCanvas(framePixelsList, width, height) {
    const frameCount = framePixelsList.length;
    const columns = Math.max(1, Math.ceil(Math.sqrt(frameCount)));
    const rows = Math.max(1, Math.ceil(frameCount / columns));
    const canvas = document.createElement('canvas');
    canvas.width = columns * width;
    canvas.height = rows * height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvasのコンテキストを取得できませんでした');
    }
    framePixelsList.forEach((pixels, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      ctx.putImageData(new ImageData(pixels, width, height), col * width, row * height);
    });
    return { canvas, columns, rows };
  }

  function canvasToBlob(canvas, mimeType) {
    return new Promise((resolve, reject) => {
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob returned null'));
          }
        }, mimeType);
        return;
      }
      try {
        const dataUrl = canvas.toDataURL(mimeType);
        const blob = dataUrlToBlob(dataUrl, mimeType);
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  }

  function dataUrlToBlob(dataUrl, mimeType) {
    const parts = dataUrl.split(',');
    if (parts.length < 2) {
      throw new Error('Invalid data URL');
    }
    const byteString = window.atob(parts[1]);
    const length = byteString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) {
      bytes[i] = byteString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  }

  function triggerDownloadFromBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function buildGifFromPixels(framePixels, frameDurations, width, height) {
    const { palette, indexedFrames, transparentIndex } = buildIndexedFramesForGif(framePixels, width, height);
    const gifPalette = ensureGifPalette(palette);
    const writerBaseOptions = { loop: 0, palette: gifPalette };
    const estimatedSize = Math.max(width * height * indexedFrames.length * 4 + gifPalette.length * 6 + 2048, 4096);
    let bufferSize = estimatedSize;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const buffer = new Uint8Array(bufferSize);
      try {
        const writer = new GifWriter(buffer, width, height, writerBaseOptions);
        indexedFrames.forEach((indexedPixels, index) => {
          const durationMs = clamp(Math.round(Number(frameDurations[index]) || 0), 16, 2000);
          const delayHundredths = clamp(Math.round(durationMs / 10), 2, 65535);
          const hasTransparency = transparentIndex !== null;
          const frameOptions = {
            delay: delayHundredths,
            disposal: hasTransparency ? 2 : 0,
          };
          if (hasTransparency) {
            frameOptions.transparent = transparentIndex;
          }
          writer.addFrame(0, 0, width, height, indexedPixels, frameOptions);
        });
        const size = writer.end();
        return buffer.slice(0, size);
      } catch (error) {
        if (attempt === 3) {
          throw error;
        }
        bufferSize *= 2;
      }
    }
    throw new Error('Unable to encode GIF');
  }

  function buildIndexedFramesForGif(framePixels, width, height) {
    const pixelCount = width * height;
    const colorCounts = new Map();
    let hasTransparency = false;
    framePixels.forEach(pixels => {
      for (let i = 0; i < pixelCount; i += 1) {
        const base = i * 4;
        const alpha = pixels[base + 3];
        if (!alpha) {
          hasTransparency = true;
          continue;
        }
        const key = encodeColorKey(pixels[base], pixels[base + 1], pixels[base + 2]);
        colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
      }
    });
    const maxOpaqueColors = hasTransparency ? 255 : 256;
    const opaqueEntries = [];
    colorCounts.forEach((count, key) => {
      const decoded = decodeColorKey(key);
      opaqueEntries.push({ r: decoded.r, g: decoded.g, b: decoded.b, count });
    });
    const paletteColors = quantizeOpaqueColors(opaqueEntries, maxOpaqueColors);
    if (!paletteColors.length) {
      paletteColors.push({ r: 0, g: 0, b: 0 });
    }
    const palette = [];
    let transparentIndex = null;
    if (hasTransparency) {
      palette.push(0);
      transparentIndex = 0;
    }
    paletteColors.forEach(color => {
      const rgb = (color.r << 16) | (color.g << 8) | color.b;
      palette.push(rgb);
    });
    const paletteRgb = palette.map(rgb => ({
      r: (rgb >> 16) & 0xff,
      g: (rgb >> 8) & 0xff,
      b: rgb & 0xff,
    }));
    const colorIndexMap = new Map();
    const indexedFrames = framePixels.map(pixels => {
      const frameIndices = new Uint8Array(pixelCount);
      for (let i = 0; i < pixelCount; i += 1) {
        const base = i * 4;
        const alpha = pixels[base + 3];
        if (!alpha) {
          frameIndices[i] = transparentIndex ?? 0;
          continue;
        }
        const key = encodeColorKey(pixels[base], pixels[base + 1], pixels[base + 2]);
        let paletteIndex = colorIndexMap.get(key);
        if (paletteIndex === undefined) {
          paletteIndex = findNearestPaletteIndex(pixels[base], pixels[base + 1], pixels[base + 2], paletteRgb, transparentIndex);
          colorIndexMap.set(key, paletteIndex);
        }
        frameIndices[i] = paletteIndex;
      }
      return frameIndices;
    });
    return { palette, indexedFrames, transparentIndex };
  }

  function ensureGifPalette(palette) {
    const padded = palette.slice();
    if (padded.length < 2) {
      padded.push(padded[0] ?? 0);
    }
    let size = 1;
    while (size < padded.length && size < 256) {
      size <<= 1;
    }
    if (size > 256) {
      size = 256;
    }
    while (padded.length < size) {
      padded.push(padded[padded.length - 1]);
    }
    return padded;
  }

  function findNearestPaletteIndex(r, g, b, paletteRgb, transparentIndex) {
    let bestIndex = transparentIndex === 0 ? 1 : 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < paletteRgb.length; i += 1) {
      if (i === transparentIndex) {
        continue;
      }
      const color = paletteRgb[i];
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
    if (bestDistance === Number.POSITIVE_INFINITY) {
      return transparentIndex ?? 0;
    }
    return bestIndex;
  }

  function quantizeOpaqueColors(colors, maxColors) {
    if (!colors.length) {
      return [];
    }
    if (colors.length <= maxColors) {
      return colors.map(color => ({ r: color.r, g: color.g, b: color.b }));
    }
    const boxes = [createColorBox(colors)];
    while (boxes.length < maxColors) {
      boxes.sort((a, b) => {
        if (b.range === a.range) {
          return b.totalCount - a.totalCount;
        }
        return b.range - a.range;
      });
      const box = boxes.shift();
      if (!box || box.colors.length <= 1) {
        if (box) {
          boxes.push(box);
        }
        break;
      }
      const split = splitColorBox(box);
      if (!split) {
        boxes.push(box);
        break;
      }
      boxes.push(split[0], split[1]);
    }
    return boxes.map(box => averageColorFromBox(box.colors));
  }

  function createColorBox(colors) {
    let rMin = 255;
    let rMax = 0;
    let gMin = 255;
    let gMax = 0;
    let bMin = 255;
    let bMax = 0;
    let totalCount = 0;
    colors.forEach(color => {
      rMin = Math.min(rMin, color.r);
      rMax = Math.max(rMax, color.r);
      gMin = Math.min(gMin, color.g);
      gMax = Math.max(gMax, color.g);
      bMin = Math.min(bMin, color.b);
      bMax = Math.max(bMax, color.b);
      totalCount += color.count || 1;
    });
    const range = Math.max(rMax - rMin, gMax - gMin, bMax - bMin);
    return {
      colors: colors.slice(),
      rMin,
      rMax,
      gMin,
      gMax,
      bMin,
      bMax,
      range,
      totalCount,
    };
  }

  function splitColorBox(box) {
    const channel = selectSplitChannel(box);
    const sorted = box.colors.slice().sort((a, b) => a[channel] - b[channel]);
    if (!sorted.length) {
      return null;
    }
    const total = sorted.reduce((sum, color) => sum + (color.count || 1), 0);
    const target = total / 2;
    let run = 0;
    let pivot = 0;
    for (; pivot < sorted.length - 1; pivot += 1) {
      run += sorted[pivot].count || 1;
      if (run >= target) {
        break;
      }
    }
    const left = sorted.slice(0, pivot + 1);
    const right = sorted.slice(pivot + 1);
    if (!left.length || !right.length) {
      return null;
    }
    return [createColorBox(left), createColorBox(right)];
  }

  function selectSplitChannel(box) {
    const rRange = box.rMax - box.rMin;
    const gRange = box.gMax - box.gMin;
    const bRange = box.bMax - box.bMin;
    if (rRange >= gRange && rRange >= bRange) {
      return 'r';
    }
    if (gRange >= rRange && gRange >= bRange) {
      return 'g';
    }
    return 'b';
  }

  function averageColorFromBox(colors) {
    let total = 0;
    let rTotal = 0;
    let gTotal = 0;
    let bTotal = 0;
    colors.forEach(color => {
      const weight = color.count || 1;
      total += weight;
      rTotal += color.r * weight;
      gTotal += color.g * weight;
      bTotal += color.b * weight;
    });
    if (!total) {
      return { r: 0, g: 0, b: 0 };
    }
    return {
      r: Math.round(rTotal / total),
      g: Math.round(gTotal / total),
      b: Math.round(bTotal / total),
    };
  }

  function encodeColorKey(r, g, b) {
    return (r << 16) | (g << 8) | b;
  }

  function decodeColorKey(key) {
    return {
      r: (key >> 16) & 0xff,
      g: (key >> 8) & 0xff,
      b: key & 0xff,
    };
  }

  // GifWriter implementation adapted from https://github.com/deanm/omggif (MIT License).
  function GifWriter(buf, width, height, gopts) {
    let p = 0;

    gopts = gopts === undefined ? {} : gopts;
    const loop_count = gopts.loop === undefined ? null : gopts.loop;
    const global_palette = gopts.palette === undefined ? null : gopts.palette;

    if (width <= 0 || height <= 0 || width > 65535 || height > 65535) {
      throw new Error('Width/Height invalid.');
    }

    function check_palette_and_num_colors(palette) {
      let num_colors = palette.length;
      if (num_colors < 2 || num_colors > 256 || (num_colors & (num_colors - 1))) {
        throw new Error('Invalid code/color length, must be power of 2 and 2 .. 256.');
      }
      return num_colors;
    }

    buf[p++] = 0x47; buf[p++] = 0x49; buf[p++] = 0x46;
    buf[p++] = 0x38; buf[p++] = 0x39; buf[p++] = 0x61;

    let gp_num_colors_pow2 = 0;
    let background = 0;
    if (global_palette !== null) {
      let gp_num_colors = check_palette_and_num_colors(global_palette);
      while (gp_num_colors >>= 1) gp_num_colors_pow2 += 1;
      gp_num_colors = 1 << gp_num_colors_pow2;
      gp_num_colors_pow2 -= 1;
      if (gopts.background !== undefined) {
        background = gopts.background;
        if (background >= gp_num_colors) {
          throw new Error('Background index out of range.');
        }
        if (background === 0) {
          throw new Error('Background index explicitly passed as 0.');
        }
      }
    }

    buf[p++] = width & 0xff; buf[p++] = (width >> 8) & 0xff;
    buf[p++] = height & 0xff; buf[p++] = (height >> 8) & 0xff;
    buf[p++] = (global_palette !== null ? 0x80 : 0) | gp_num_colors_pow2;
    buf[p++] = background;
    buf[p++] = 0;

    if (global_palette !== null) {
      for (let i = 0, il = global_palette.length; i < il; ++i) {
        const rgb = global_palette[i];
        buf[p++] = (rgb >> 16) & 0xff;
        buf[p++] = (rgb >> 8) & 0xff;
        buf[p++] = rgb & 0xff;
      }
    }

    if (loop_count !== null) {
      if (loop_count < 0 || loop_count > 65535) {
        throw new Error('Loop count invalid.');
      }
      buf[p++] = 0x21; buf[p++] = 0xff; buf[p++] = 0x0b;
      buf[p++] = 0x4e; buf[p++] = 0x45; buf[p++] = 0x54; buf[p++] = 0x53;
      buf[p++] = 0x43; buf[p++] = 0x41; buf[p++] = 0x50; buf[p++] = 0x45;
      buf[p++] = 0x32; buf[p++] = 0x2e; buf[p++] = 0x30;
      buf[p++] = 0x03; buf[p++] = 0x01;
      buf[p++] = loop_count & 0xff; buf[p++] = (loop_count >> 8) & 0xff;
      buf[p++] = 0x00;
    }

    let ended = false;

    this.addFrame = function addFrame(x, y, w, h, indexed_pixels, opts) {
      if (ended === true) {
        p -= 1;
        ended = false;
      }

      opts = opts === undefined ? {} : opts;

      if (x < 0 || y < 0 || x > 65535 || y > 65535) {
        throw new Error('x/y invalid.');
      }
      if (w <= 0 || h <= 0 || w > 65535 || h > 65535) {
        throw new Error('Width/Height invalid.');
      }
      if (indexed_pixels.length < w * h) {
        throw new Error('Not enough pixels for the frame size.');
      }

      let using_local_palette = true;
      let palette = opts.palette;
      if (palette === undefined || palette === null) {
        using_local_palette = false;
        palette = global_palette;
      }
      if (palette === undefined || palette === null) {
        throw new Error('Must supply either a local or global palette.');
      }

      let num_colors = check_palette_and_num_colors(palette);
      let min_code_size = 0;
      while (num_colors >>= 1) min_code_size += 1;
      num_colors = 1 << min_code_size;

      const delay = opts.delay === undefined ? 0 : opts.delay;
      const disposal = opts.disposal === undefined ? 0 : opts.disposal;
      if (disposal < 0 || disposal > 3) {
        throw new Error('Disposal out of range.');
      }

      let use_transparency = false;
      let transparent_index = 0;
      if (opts.transparent !== undefined && opts.transparent !== null) {
        use_transparency = true;
        transparent_index = opts.transparent;
        if (transparent_index < 0 || transparent_index >= num_colors) {
          throw new Error('Transparent color index.');
        }
      }

      if (disposal !== 0 || use_transparency || delay !== 0) {
        buf[p++] = 0x21; buf[p++] = 0xf9;
        buf[p++] = 4;
        buf[p++] = (disposal << 2) | (use_transparency === true ? 1 : 0);
        buf[p++] = delay & 0xff; buf[p++] = (delay >> 8) & 0xff;
        buf[p++] = transparent_index;
        buf[p++] = 0;
      }

      buf[p++] = 0x2c;
      buf[p++] = x & 0xff; buf[p++] = (x >> 8) & 0xff;
      buf[p++] = y & 0xff; buf[p++] = (y >> 8) & 0xff;
      buf[p++] = w & 0xff; buf[p++] = (w >> 8) & 0xff;
      buf[p++] = h & 0xff; buf[p++] = (h >> 8) & 0xff;
      buf[p++] = using_local_palette === true ? (0x80 | (min_code_size - 1)) : 0;

      if (using_local_palette === true) {
        for (let i = 0, il = palette.length; i < il; ++i) {
          const rgb = palette[i];
          buf[p++] = (rgb >> 16) & 0xff;
          buf[p++] = (rgb >> 8) & 0xff;
          buf[p++] = rgb & 0xff;
        }
      }

      p = GifWriterOutputLZWCodeStream(buf, p, min_code_size < 2 ? 2 : min_code_size, indexed_pixels);
      return p;
    };

    this.end = function end() {
      if (ended === false) {
        buf[p++] = 0x3b;
        ended = true;
      }
      return p;
    };

    this.getOutputBuffer = function getOutputBuffer() { return buf; };
    this.setOutputBuffer = function setOutputBuffer(v) { buf = v; };
    this.getOutputBufferPosition = function getOutputBufferPosition() { return p; };
    this.setOutputBufferPosition = function setOutputBufferPosition(v) { p = v; };
  }

  function GifWriterOutputLZWCodeStream(buf, p, min_code_size, index_stream) {
    buf[p++] = min_code_size;
    let cur_subblock = p++;

    const clear_code = 1 << min_code_size;
    const code_mask = clear_code - 1;
    const eoi_code = clear_code + 1;
    let next_code = eoi_code + 1;

    let cur_code_size = min_code_size + 1;
    let cur_shift = 0;
    let cur = 0;

    function emit_bytes_to_buffer(bit_block_size) {
      while (cur_shift >= bit_block_size) {
        buf[p++] = cur & 0xff;
        cur >>= 8;
        cur_shift -= 8;
        if (p === cur_subblock + 256) {
          buf[cur_subblock] = 255;
          cur_subblock = p++;
        }
      }
    }

    function emit_code(c) {
      cur |= c << cur_shift;
      cur_shift += cur_code_size;
      emit_bytes_to_buffer(8);
    }

    let ib_code = index_stream[0] & code_mask;
    let code_table = {};

    emit_code(clear_code);

    for (let i = 1, il = index_stream.length; i < il; ++i) {
      const k = index_stream[i] & code_mask;
      const cur_key = (ib_code << 8) | k;
      const cur_code = code_table[cur_key];

      if (cur_code === undefined) {
        cur |= ib_code << cur_shift;
        cur_shift += cur_code_size;
        while (cur_shift >= 8) {
          buf[p++] = cur & 0xff;
          cur >>= 8;
          cur_shift -= 8;
          if (p === cur_subblock + 256) {
            buf[cur_subblock] = 255;
            cur_subblock = p++;
          }
        }

        if (next_code === 4096) {
          emit_code(clear_code);
          next_code = eoi_code + 1;
          cur_code_size = min_code_size + 1;
          code_table = {};
        } else {
          if (next_code >= (1 << cur_code_size)) {
            cur_code_size += 1;
          }
          code_table[cur_key] = next_code++;
        }

        ib_code = k;
      } else {
        ib_code = cur_code;
      }
    }

    emit_code(ib_code);
    emit_code(eoi_code);
    emit_bytes_to_buffer(1);

    if (cur_subblock + 1 === p) {
      buf[cur_subblock] = 0;
    } else {
      buf[cur_subblock] = p - cur_subblock - 1;
      buf[p++] = 0;
    }
    return p;
  }

  function encodeTypedArray(view) {
    if (!view) return '';
    const bytes = view instanceof Uint8Array
      ? view
      : new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return window.btoa(binary);
  }

  function decodeBase64(value) {
    if (typeof value !== 'string' || value.length === 0) {
      return new Uint8Array(0);
    }
    try {
      const binary = window.atob(value);
      const length = binary.length;
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      return new Uint8Array(0);
    }
  }

  function normalizeColorValue(input) {
    if (!input || typeof input !== 'object') {
      return { r: 0, g: 0, b: 0, a: 255 };
    }
    return {
      r: clamp(Math.round(Number(input.r) ?? 0), 0, 255),
      g: clamp(Math.round(Number(input.g) ?? 0), 0, 255),
      b: clamp(Math.round(Number(input.b) ?? 0), 0, 255),
      a: clamp(Math.round(Number(input.a) ?? 255), 0, 255),
    };
  }

  function normalizeLastGroupTool(value) {
    const fallback = { ...DEFAULT_GROUP_TOOL };
    if (!value || typeof value !== 'object') {
      return fallback;
    }
    const result = { ...fallback };
    Object.keys(TOOL_GROUPS).forEach(group => {
      const candidate = value[group];
      if (typeof candidate === 'string' && TOOL_GROUPS[group].tools.includes(candidate)) {
        result[group] = candidate;
      }
    });
    return result;
  }

  function validateBoundsObject(bounds) {
    if (!bounds || typeof bounds !== 'object') {
      return null;
    }
    const x0 = Number(bounds.x0);
    const y0 = Number(bounds.y0);
    const x1 = Number(bounds.x1);
    const y1 = Number(bounds.y1);
    if ([x0, y0, x1, y1].some(value => !Number.isFinite(value))) {
      return null;
    }
    return {
      x0: Math.floor(x0),
      y0: Math.floor(y0),
      x1: Math.floor(x1),
      y1: Math.floor(y1),
    };
  }

  function applyViewportTransform() {
    if (!dom.canvases.stack) return;
    const panX = Math.round(Number(state.pan.x) || 0);
    const panY = Math.round(Number(state.pan.y) || 0);
    if (panX !== state.pan.x) {
      state.pan.x = panX;
    }
    if (panY !== state.pan.y) {
      state.pan.y = panY;
    }
    dom.canvases.stack.style.transform = `translate(${panX}px, ${panY}px)`;
    updateGridDecorations();
  }

  async function init() {
    await initializeAutosave();
    setupLeftTabs();
    setupRightTabs();
    setupLayout();
    setupControls();
    setupExportDialog();
    setupTools();
    setupToolGroups();
    setupPaletteEditor();
    setupFramesAndLayers();
    setupCanvas();
    setupKeyboard();
    initMemoryMonitor();
    updateDocumentMetadata();
    renderEverything();
  }

  function getActiveTool() {
    return pointerState.tool || state.tool;
  }

  function setupLayout() {
    window.addEventListener('resize', debounce(updateLayoutMode, 150));
    updateLayoutMode();

    dom.mobileTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.mobileTab;
        if (!target) return;
        dom.mobileTabs.forEach(btn => {
          const panel = dom.mobilePanels[btn.dataset.mobileTab];
          if (!panel) return;
          const isActive = btn === tab;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-selected', String(isActive));
          if (isActive) {
            btn.removeAttribute('tabindex');
          } else {
            btn.setAttribute('tabindex', '-1');
          }
          panel.classList.toggle('is-active', isActive);
          panel.toggleAttribute('hidden', !isActive);
        });
      });
    });

    dom.toggles.left?.addEventListener('click', () => {
      if (layoutMode === 'mobilePortrait') {
        return;
      }
      toggleRailCollapsed('left');
    });

    dom.toggles.right?.addEventListener('click', () => {
      if (layoutMode === 'mobilePortrait') {
        return;
      }
      toggleRailCollapsed('right');
    });

    updateRailToggleVisibility();
  }

  function setRailCollapsed(side, collapsed) {
    const isLeft = side === 'left';
    const railNode = isLeft ? dom.leftRail : dom.rightRail;
    if (!railNode) return;
    if (isLeft) {
      rails.leftCollapsed = collapsed;
    } else {
      rails.rightCollapsed = collapsed;
    }
    railNode.dataset.collapsed = collapsed ? 'true' : 'false';
  }

  function toggleRailCollapsed(side) {
    const isLeft = side === 'left';
    const railNode = isLeft ? dom.leftRail : dom.rightRail;
    if (!railNode) return;
    const collapsed = railNode.dataset.collapsed === 'true';
    setRailCollapsed(side, !collapsed);
    updateRailToggleVisibility();
  }

  function updateRailMetrics() {
    const layoutNode = dom.layout;
    if (!layoutNode) return;
    const isMobile = layoutMode === 'mobilePortrait';
    const leftCollapsed = isMobile || dom.leftRail?.dataset.collapsed === 'true';
    const rightCollapsed = isMobile || dom.rightRail?.dataset.collapsed === 'true';
    const leftWidth = !leftCollapsed && dom.leftRail ? dom.leftRail.offsetWidth : 0;
    const rightWidth = !rightCollapsed && dom.rightRail ? dom.rightRail.offsetWidth : 0;
    const toggleMargin = 12;
    layoutNode.style.setProperty('--left-toggle-offset', `${leftWidth ? leftWidth + toggleMargin : toggleMargin}px`);
    layoutNode.style.setProperty('--right-toggle-offset', `${rightWidth ? rightWidth + toggleMargin : toggleMargin}px`);
  }

  function updateLayoutMode() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const portrait = height >= width;
    let nextMode = 'desktop';

    if (width <= 900 && portrait) {
      nextMode = 'mobilePortrait';
    } else if (width <= 900) {
      nextMode = 'narrow';
    }

    if (layoutMode === nextMode) {
      updateRailToggleVisibility();
      return;
    }

    layoutMode = nextMode;
    applyLayoutMode();
  }

  function applyLayoutMode() {
    const isMobile = layoutMode === 'mobilePortrait';
    dom.mobileDrawer.hidden = !isMobile;
    if (isMobile) {
      dom.leftRail.dataset.collapsed = 'true';
      dom.rightRail.dataset.collapsed = 'true';
    } else {
      dom.leftRail.dataset.collapsed = rails.leftCollapsed ? 'true' : 'false';
      dom.rightRail.dataset.collapsed = rails.rightCollapsed ? 'true' : 'false';
    }

    Object.entries(layoutMap).forEach(([key, placement]) => {
      const section = dom.sections[key];
      if (!section) return;
      const target = isMobile ? placement.mobile : placement.desktop;
      if (!target) return;
      target.appendChild(section);
      section.classList.add('panel-section');
      section.classList.toggle('panel-section--mobile', isMobile);
    });

    updateLeftTabUI();
    updateLeftTabVisibility();
    updateRightTabUI();
    updateRightTabVisibility();

    if (isMobile) {
      dom.mobileTabs[0]?.click();
    }

    updateRailToggleVisibility();
    updateToolVisibility();
    applyViewportTransform();
  }

  function updateRailToggleVisibility() {
    const isMobile = layoutMode === 'mobilePortrait';
    const leftCollapsed = dom.leftRail?.dataset.collapsed === 'true';
    const rightCollapsed = dom.rightRail?.dataset.collapsed === 'true';
    updateRailMetrics();
    if (dom.toggles.left) {
      const showToggle = !isMobile;
      dom.toggles.left.classList.toggle('is-visible', showToggle);
      dom.toggles.left.textContent = leftCollapsed ? '⟨' : '⟩';
      dom.toggles.left.setAttribute('aria-label', leftCollapsed ? '左パネルを表示' : '左パネルを隠す');
      dom.toggles.left.setAttribute('aria-pressed', leftCollapsed ? 'false' : 'true');
    }
    if (dom.toggles.right) {
      const showToggle = !isMobile;
      dom.toggles.right.classList.toggle('is-visible', showToggle);
      dom.toggles.right.textContent = rightCollapsed ? '⟩' : '⟨';
      dom.toggles.right.setAttribute('aria-label', rightCollapsed ? '右パネルを表示' : '右パネルを隠す');
      dom.toggles.right.setAttribute('aria-pressed', rightCollapsed ? 'false' : 'true');
    }
  }

  function setupControls() {
    if (dom.controls.toggleGrid instanceof HTMLInputElement) {
      dom.controls.toggleGrid.addEventListener('change', () => {
        state.showGrid = dom.controls.toggleGrid.checked;
        updateGridDecorations();
        requestOverlayRender();
        scheduleSessionPersist();
      });
    }

    if (dom.controls.toggleMajorGrid instanceof HTMLInputElement) {
      dom.controls.toggleMajorGrid.addEventListener('change', () => {
        state.showMajorGrid = dom.controls.toggleMajorGrid.checked;
        updateGridDecorations();
        requestOverlayRender();
        scheduleSessionPersist();
      });
    }

    dom.controls.toggleBackgroundMode?.addEventListener('click', () => {
      const modes = ['dark', 'light', 'pink'];
      const nextIndex = (modes.indexOf(state.backgroundMode) + 1) % modes.length;
      state.backgroundMode = modes[nextIndex];
      updateGridDecorations();
      syncControlsWithState();
      scheduleSessionPersist();
    });

    const zoomSlider = dom.controls.zoomSlider;
    dom.controls.zoomOut?.addEventListener('click', () => adjustZoomBySteps(-1));
    dom.controls.zoomIn?.addEventListener('click', () => adjustZoomBySteps(1));

    if (zoomSlider) {
      zoomSlider.min = '0';
      zoomSlider.max = String(ZOOM_STEPS.length - 1);
      zoomSlider.step = '1';
      zoomSlider.value = String(getZoomStepIndex(state.scale));
      zoomSlider.addEventListener('input', event => {
        const index = Number(event.target.value);
        setZoom(getZoomScaleAtIndex(index));
      });
    }

    dom.controls.brushSize?.addEventListener('input', event => {
      state.brushSize = clamp(Math.round(Number(event.target.value)), 1, 32);
      if (dom.controls.brushSizeValue) {
        dom.controls.brushSizeValue.textContent = `${state.brushSize}px`;
      }
      scheduleSessionPersist();
    });

    dom.controls.brushOpacity?.addEventListener('input', event => {
      const value = clamp(Number(event.target.value), 0, 100);
      state.brushOpacity = value / 100;
      if (dom.controls.brushOpacityValue) {
        dom.controls.brushOpacityValue.textContent = `${value}%`;
      }
      scheduleSessionPersist();
    });

    dom.controls.toggleChecker?.addEventListener('change', event => {
      state.showChecker = Boolean(event.target.checked);
      dom.canvases.stack.classList.toggle('is-flat', !state.showChecker);
      scheduleSessionPersist();
    });

    dom.controls.togglePixelPreview?.addEventListener('change', event => {
      state.showPixelGuides = Boolean(event.target.checked);
      requestOverlayRender();
      scheduleSessionPersist();
    });

    dom.controls.openDocument?.addEventListener('click', () => {
      openDocumentDialog();
    });

    dom.controls.exportProject?.addEventListener('click', () => {
      openExportDialog();
    });

    if (dom.newProject?.button) {
      dom.newProject.button.addEventListener('click', () => {
        openNewProjectDialog();
      });
    }
    if (dom.newProject?.form) {
      dom.newProject.form.addEventListener('submit', event => {
        event.preventDefault();
        handleNewProjectSubmit();
      });
    }
    if (dom.newProject?.cancel) {
      dom.newProject.cancel.addEventListener('click', () => {
        closeNewProjectDialog();
      });
    }
    if (dom.newProject?.dialog) {
      dom.newProject.dialog.addEventListener('cancel', event => {
        event.preventDefault();
        closeNewProjectDialog();
      });
    }

    dom.controls.canvasWidth?.addEventListener('change', handleCanvasResizeRequest);
    dom.controls.canvasHeight?.addEventListener('change', handleCanvasResizeRequest);

    dom.controls.clearCanvas?.addEventListener('click', () => {
      if (!confirm('すべてのフレームをクリアしますか？')) {
        return;
      }
      beginHistory('clearCanvas');
      state.frames.forEach(frame => {
        frame.layers.forEach(layer => {
          layer.indices.fill(-1);
          if (layer.direct instanceof Uint8ClampedArray) {
            layer.direct.fill(0);
            layer.direct = null;
          }
        });
      });
      markHistoryDirty();
      requestRender();
      requestOverlayRender();
      commitHistory();
      scheduleSessionPersist();
    });

    dom.controls.undoAction?.addEventListener('click', () => undo());
    dom.controls.redoAction?.addEventListener('click', () => redo());

    syncControlsWithState();
  }

  function handleCanvasResizeRequest() {
    const width = clamp(Number(dom.controls.canvasWidth.value), MIN_CANVAS_SIZE, MAX_CANVAS_SIZE) || state.width;
    const height = clamp(Number(dom.controls.canvasHeight.value), MIN_CANVAS_SIZE, MAX_CANVAS_SIZE) || state.height;
    if (width === state.width && height === state.height) {
      dom.controls.canvasWidth.value = String(state.width);
      dom.controls.canvasHeight.value = String(state.height);
      return;
    }

    beginHistory('resizeCanvas');
    resizeAllLayers(width, height);
    state.width = width;
    state.height = height;
    dom.controls.canvasWidth.value = String(width);
    dom.controls.canvasHeight.value = String(height);
    markHistoryDirty();
    resizeCanvases();
    clearSelection();
    requestRender();
    requestOverlayRender();
    commitHistory();
    scheduleSessionPersist();
  }

  function resizeAllLayers(width, height) {
    state.frames.forEach(frame => {
      frame.layers = frame.layers.map(layer => {
        const resized = createLayer(layer.name, width, height);
        const minW = Math.min(width, state.width);
        const minH = Math.min(height, state.height);
        const sourceDirect = layer.direct instanceof Uint8ClampedArray ? layer.direct : null;
        const targetDirect = sourceDirect ? ensureLayerDirect(resized, width, height) : null;
        for (let y = 0; y < minH; y += 1) {
          for (let x = 0; x < minW; x += 1) {
            const srcIdx = y * state.width + x;
            const dstIdx = y * width + x;
            resized.indices[dstIdx] = layer.indices[srcIdx];
            if (sourceDirect && targetDirect) {
              const baseSrc = srcIdx * 4;
              const baseDst = dstIdx * 4;
              targetDirect[baseDst] = sourceDirect[baseSrc];
              targetDirect[baseDst + 1] = sourceDirect[baseSrc + 1];
              targetDirect[baseDst + 2] = sourceDirect[baseSrc + 2];
              targetDirect[baseDst + 3] = sourceDirect[baseSrc + 3];
            }
          }
        }
        resized.visible = layer.visible;
        resized.opacity = layer.opacity;
        return resized;
      });
    });
  }

  function setupTools() {
    toolButtons = Array.from(document.querySelectorAll('.tool-button[data-tool]'));
    toolButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tool = button.dataset.tool;
        if (!tool) return;
        setActiveTool(tool);
      });
    });
    setActiveTool(state.tool, toolButtons, { persist: false });

    dom.canvases.drawing.addEventListener('pointerdown', handlePointerDown);
    dom.canvases.drawing.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('pointercancel', handlePointerCancel);
    dom.canvases.drawing.addEventListener('pointermove', event => {
      if (pointerState.active) return;
      const awaitingLineEnd = curveBuilder && curveBuilder.stage === 'line' && curveBuilder.awaitingEndPoint && curveBuilder.start;
      const position = getPointerPosition(event);

      if (awaitingLineEnd) {
        let needsRender = false;
        const start = curveBuilder.start;
        if (start && position) {
          const prev = pointerState.preview;
          if (!prev || prev.end?.x !== position.x || prev.end?.y !== position.y) {
            pointerState.preview = { start, end: position };
            needsRender = true;
          }
          if (pointerState.tool !== 'curve') {
            pointerState.tool = 'curve';
            needsRender = true;
          }
          if (hoverPixel) {
            hoverPixel = null;
            needsRender = true;
          }
        } else {
          if (pointerState.preview) {
            pointerState.preview = null;
            needsRender = true;
          }
          if (pointerState.tool === 'curve') {
            pointerState.tool = null;
            needsRender = true;
          }
          if (hoverPixel) {
            hoverPixel = null;
            needsRender = true;
          }
        }
        if (needsRender) {
          requestOverlayRender();
        }
        return;
      }

      if (pointerState.preview && pointerState.tool === 'curve') {
        pointerState.preview = null;
        pointerState.tool = null;
        requestOverlayRender();
      }

      if (!position) {
        if (hoverPixel) {
          hoverPixel = null;
          requestOverlayRender();
        }
        return;
      }
      if (!hoverPixel || hoverPixel.x !== position.x || hoverPixel.y !== position.y) {
        hoverPixel = position;
        requestOverlayRender();
      }
    });
    dom.canvases.drawing.addEventListener('pointerleave', () => {
      let needsRender = false;
      if (hoverPixel) {
        hoverPixel = null;
        needsRender = true;
      }
      if (curveBuilder && curveBuilder.stage === 'line' && curveBuilder.awaitingEndPoint && pointerState.preview) {
        pointerState.preview = null;
        pointerState.tool = null;
        needsRender = true;
      }
      if (needsRender) {
        requestOverlayRender();
      }
    });
    dom.canvases.drawing.addEventListener('contextmenu', event => event.preventDefault());
  }

  function setActiveTool(tool, buttons = toolButtons, options = {}) {
    const { persist = true, skipGroupUpdate = false } = options;
    if (!tool) return;
    state.tool = tool;
    buttons.forEach(btn => {
      const isActive = btn.dataset.tool === tool;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    if (!state.lastGroupTool) {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL };
    }
    const group = TOOL_TO_GROUP[tool];
    if (group) {
      if (!state.lastGroupTool[group]) {
        state.lastGroupTool[group] = DEFAULT_GROUP_TOOL[group] || TOOL_GROUPS[group]?.tools?.[0] || tool;
      }
      state.lastGroupTool[group] = tool;
      if (!skipGroupUpdate) {
        state.activeToolGroup = group;
        updateToolGroupButtons();
        updateToolVisibility();
      }
    } else if (!skipGroupUpdate) {
      updateToolGroupButtons();
      updateToolVisibility();
    }
    if (tool !== 'curve') {
      resetCurveBuilder();
    }
    if (!pointerState.active) {
      const toolChanged = pointerState.tool !== tool;
      const hadPreview = Boolean(pointerState.preview || pointerState.selectionPreview || pointerState.selectionMove);
      pointerState.tool = tool;
      if (hadPreview) {
        pointerState.preview = null;
        pointerState.selectionPreview = null;
        pointerState.selectionMove = null;
      }
      if (toolChanged || hadPreview) {
        requestOverlayRender();
      }
    }
    updateToolTabIcon();
    if (persist) {
      scheduleSessionPersist();
    }
  }

  function setupPaletteEditor() {
    dom.controls.addPaletteColor?.addEventListener('click', () => {
      beginHistory('paletteAdd');
      const nextIndex = state.palette.length;
      const last = state.palette[state.palette.length - 1] || { r: 88, g: 196, b: 255, a: 255 };
      state.palette.push({ ...last });
      setActivePaletteIndex(nextIndex);
      applyPaletteChange();
      commitHistory();
    });

    dom.controls.paletteIndex?.addEventListener('change', () => {
      const target = clamp(Number(dom.controls.paletteIndex.value), 0, state.palette.length - 1);
      if (Number.isNaN(target)) return;
      reorderPalette(state.activePaletteIndex, target);
    });

    dom.controls.paletteHue?.addEventListener('input', () => {
      handlePaletteSliderInput({ source: 'hue' });
    });

    if (dom.controls.paletteHue) {
      dom.controls.paletteHue.style.background = 'linear-gradient(90deg, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)';
    }

    dom.controls.paletteSaturation?.addEventListener('input', () => {
      handlePaletteSliderInput({ source: 'saturation' });
    });

    dom.controls.paletteValue?.addEventListener('input', () => {
      handlePaletteSliderInput({ source: 'value' });
    });

    dom.controls.paletteAlphaSlider?.addEventListener('input', () => {
      handlePaletteSliderInput({ source: 'alpha' });
    });

    const wheel = dom.controls.paletteWheel;
    if (wheel && typeof wheel.getContext === 'function') {
      paletteWheelCtx = wheel.getContext('2d', { willReadFrequently: true }) || null;
      wheel.addEventListener('pointerdown', handlePaletteWheelPointerDown);
      wheel.addEventListener('pointercancel', handlePaletteWheelPointerUp);
      window.addEventListener('resize', debounce(() => {
        drawPaletteWheel();
        updatePaletteWheelCursor();
      }, 160));
    }

    renderPalette();
    syncPaletteInputs();
    updateToolTabIcon();
  }

  function reorderPalette(currentIndex, targetIndex) {
    if (currentIndex === targetIndex) return;
    beginHistory('paletteReorder');
    const previousOrder = state.palette.slice();
    const color = state.palette.splice(currentIndex, 1)[0];
    state.palette.splice(targetIndex, 0, color);
    const mapping = previousOrder.map(entry => state.palette.indexOf(entry));
    remapPaletteIndices(mapping);
    const newIndex = state.palette.indexOf(color);
    setActivePaletteIndex(newIndex);
    applyPaletteChange();
    commitHistory();
  }

  function setActivePaletteIndex(index) {
    state.activePaletteIndex = clamp(index, 0, state.palette.length - 1);
    syncPaletteInputs();
    renderPalette();
    scheduleSessionPersist();
  }

  function syncPaletteInputs() {
    const color = state.palette[state.activePaletteIndex];
    if (!color) return;
    dom.controls.paletteIndex.value = String(state.activePaletteIndex);
    const hsv = rgbaToHsv(color);
    paletteEditorState.hsv = {
      h: hsv.h,
      s: hsv.s,
      v: hsv.v,
      a: color.a,
    };
    if (dom.controls.paletteHue) {
      dom.controls.paletteHue.value = String(Math.round(hsv.h));
    }
    if (dom.controls.paletteSaturation) {
      dom.controls.paletteSaturation.value = String(Math.round(hsv.s * 100));
    }
    if (dom.controls.paletteValue) {
      dom.controls.paletteValue.value = String(Math.round(hsv.v * 100));
    }
    if (dom.controls.paletteAlphaSlider) {
      dom.controls.paletteAlphaSlider.value = String(color.a);
    }
    updatePaletteAlphaOutput();
    updatePalettePreview();
    drawPaletteWheel();
    updatePaletteWheelCursor();
    updateColorTabSwatch();
  }

  function renderPalette() {
    const container = dom.controls.paletteList;
    if (!container) return;
    container.innerHTML = '';
    state.palette.forEach((color, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'palette-swatch pixel-frame';
      button.dataset.index = String(index);
      button.setAttribute('aria-label', `インデックス ${index}`);
      button.title = `${index}: ${rgbaToHex(color)}`;
      button.classList.toggle('is-active', index === state.activePaletteIndex);
      applyPixelFrameBackground(button, color);
      button.addEventListener('click', () => setActivePaletteIndex(index));
      button.addEventListener('contextmenu', event => {
        event.preventDefault();
        if (state.palette.length <= 1) return;
        removePaletteColor(index);
      });
      container.appendChild(button);
    });
    updateColorTabSwatch();
  }

  function removePaletteColor(index) {
    beginHistory('paletteRemove');
    const previousOrder = state.palette.slice();
    state.palette.splice(index, 1);
    const mapping = previousOrder.map(entry => state.palette.indexOf(entry));
    remapPaletteIndices(mapping);
    if (state.activePaletteIndex >= state.palette.length) {
      state.activePaletteIndex = Math.max(0, state.palette.length - 1);
    }
    renderPalette();
    syncPaletteInputs();
    applyPaletteChange();
    commitHistory();
  }

  function remapPaletteIndices(mapping) {
    if (!mapping) return;
    state.frames.forEach(frame => {
      frame.layers.forEach(layer => {
        const length = layer.indices.length;
        for (let i = 0; i < length; i += 1) {
          const oldIndex = layer.indices[i];
          if (oldIndex < 0) continue;
          const next = mapping[oldIndex];
          layer.indices[i] = typeof next === 'number' && next >= 0 ? next : -1;
        }
      });
    });
  }

  function applyPaletteChange() {
    markHistoryDirty();
    requestRender();
    requestOverlayRender();
    scheduleSessionPersist();
    updateColorTabSwatch();
  }

  function handlePaletteSliderInput({ source = 'unknown' } = {}) {
    const active = state.palette[state.activePaletteIndex];
    if (!active) return;
    const hueValue = clamp(Number(dom.controls.paletteHue?.value ?? paletteEditorState.hsv.h), 0, 360);
    const saturationValue = clamp(Number(dom.controls.paletteSaturation?.value ?? paletteEditorState.hsv.s * 100), 0, 100) / 100;
    const valueValue = clamp(Number(dom.controls.paletteValue?.value ?? paletteEditorState.hsv.v * 100), 0, 100) / 100;
    const alphaValue = clamp(Number(dom.controls.paletteAlphaSlider?.value ?? paletteEditorState.hsv.a), 0, 255);
    paletteEditorState.hsv.h = hueValue;
    paletteEditorState.hsv.s = saturationValue;
    paletteEditorState.hsv.v = valueValue;
    paletteEditorState.hsv.a = alphaValue;
    if (source === 'value') {
      drawPaletteWheel();
    }
    updatePaletteWheelCursor();
    updatePalettePreview();
    updatePaletteAlphaOutput();
    writePaletteColorFromHsv();
  }

  function updatePaletteAlphaOutput() {
    if (dom.controls.paletteAlphaValue) {
      dom.controls.paletteAlphaValue.textContent = String(Math.round(paletteEditorState.hsv.a));
    }
    const alphaSlider = dom.controls.paletteAlphaSlider;
    if (alphaSlider) {
      const opaqueColor = hsvToRgba(paletteEditorState.hsv.h, paletteEditorState.hsv.s, paletteEditorState.hsv.v);
      alphaSlider.style.background = `linear-gradient(90deg, rgba(${opaqueColor.r}, ${opaqueColor.g}, ${opaqueColor.b}, 0) 0%, rgba(${opaqueColor.r}, ${opaqueColor.g}, ${opaqueColor.b}, 1) 100%)`;
    }
  }

  function updatePalettePreview() {
    const preview = dom.controls.palettePreview;
    if (!preview) return;
    const rgba = hsvToRgba(paletteEditorState.hsv.h, paletteEditorState.hsv.s, paletteEditorState.hsv.v);
    const alpha = clamp(paletteEditorState.hsv.a, 0, 255) / 255;
    preview.style.setProperty('--palette-preview-color', `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${alpha.toFixed(3)})`);
    preview.classList.toggle('is-filled', paletteEditorState.hsv.a > 0);
    const saturationSlider = dom.controls.paletteSaturation;
    if (saturationSlider) {
      const startColor = hsvToRgba(paletteEditorState.hsv.h, 0, paletteEditorState.hsv.v);
      const endColor = hsvToRgba(paletteEditorState.hsv.h, 1, paletteEditorState.hsv.v);
      saturationSlider.style.background = `linear-gradient(90deg, ${rgbaToCss(startColor)} 0%, ${rgbaToCss(endColor)} 100%)`;
    }
    const valueSlider = dom.controls.paletteValue;
    if (valueSlider) {
      const lowColor = hsvToRgba(paletteEditorState.hsv.h, paletteEditorState.hsv.s, 0);
      const highColor = hsvToRgba(paletteEditorState.hsv.h, paletteEditorState.hsv.s, 1);
      valueSlider.style.background = `linear-gradient(90deg, ${rgbaToCss(lowColor)} 0%, ${rgbaToCss(highColor)} 100%)`;
    }
    updateColorTabSwatch();
  }

  function configurePaletteWheelCanvas() {
    const canvas = dom.controls.paletteWheel;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    const size = Math.round(Math.max(rect.width, rect.height) * dpr);
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
    }
  }

  function drawPaletteWheel() {
    const canvas = dom.controls.paletteWheel;
    if (!canvas || !paletteWheelCtx) return;
    configurePaletteWheelCanvas();
    const size = canvas.width;
    if (!size) return;
    const value = clamp(paletteEditorState.hsv.v, 0, 1);
    const imageData = paletteWheelCtx.createImageData(size, size);
    const data = imageData.data;
    const radius = size / 2;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = x + 0.5 - radius;
        const dy = y + 0.5 - radius;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const index = (y * size + x) * 4;
        if (distance > radius) {
          data[index + 3] = 0;
          continue;
        }
        const saturation = clamp(distance / radius, 0, 1);
        let hue = Math.atan2(dy, dx) * (180 / Math.PI);
        if (hue < 0) hue += 360;
        const rgba = hsvToRgba(hue, saturation, value);
        data[index] = rgba.r;
        data[index + 1] = rgba.g;
        data[index + 2] = rgba.b;
        data[index + 3] = 255;
      }
    }
    paletteWheelCtx.putImageData(imageData, 0, 0);
  }

  function updatePaletteWheelCursor() {
    const cursor = dom.controls.paletteWheelCursor;
    const canvas = dom.controls.paletteWheel;
    if (!cursor || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const radius = rect.width / 2;
    const angle = (paletteEditorState.hsv.h * Math.PI) / 180;
    const distance = clamp(paletteEditorState.hsv.s, 0, 1) * radius;
    const x = radius + Math.cos(angle) * distance;
    const y = radius + Math.sin(angle) * distance;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }

  function writePaletteColorFromHsv() {
    const active = state.palette[state.activePaletteIndex];
    if (!active) return;
    beginHistory('paletteColor');
    const rgba = hsvToRgba(paletteEditorState.hsv.h, paletteEditorState.hsv.s, paletteEditorState.hsv.v);
    rgba.a = Math.round(paletteEditorState.hsv.a);
    Object.assign(active, rgba);
    applyPaletteChange();
    commitHistory();
    renderPalette();
  }

  function handlePaletteWheelPointerDown(event) {
    const wheel = dom.controls.paletteWheel;
    if (!wheel) return;
    event.preventDefault();
    if (paletteEditorState.wheelPointer.upHandler) {
      window.removeEventListener('pointerup', paletteEditorState.wheelPointer.upHandler);
      paletteEditorState.wheelPointer.upHandler = null;
    }
    paletteEditorState.wheelPointer.active = true;
    paletteEditorState.wheelPointer.pointerId = event.pointerId;
    wheel.setPointerCapture?.(event.pointerId);
    updatePaletteFromWheelEvent(event);
    window.addEventListener('pointermove', handlePaletteWheelPointerMove);
    const pointerUpHandler = evt => handlePaletteWheelPointerUp(evt);
    paletteEditorState.wheelPointer.upHandler = pointerUpHandler;
    window.addEventListener('pointerup', pointerUpHandler);
  }

  function handlePaletteWheelPointerMove(event) {
    if (!paletteEditorState.wheelPointer.active || event.pointerId !== paletteEditorState.wheelPointer.pointerId) {
      return;
    }
    updatePaletteFromWheelEvent(event);
  }

  function handlePaletteWheelPointerUp(event) {
    const wheel = dom.controls.paletteWheel;
    if (!paletteEditorState.wheelPointer.active || (paletteEditorState.wheelPointer.pointerId !== null && event.pointerId !== paletteEditorState.wheelPointer.pointerId)) {
      return;
    }
    if (wheel && wheel.hasPointerCapture?.(event.pointerId)) {
      wheel.releasePointerCapture(event.pointerId);
    }
    paletteEditorState.wheelPointer.active = false;
    paletteEditorState.wheelPointer.pointerId = null;
    if (paletteEditorState.wheelPointer.upHandler) {
      window.removeEventListener('pointerup', paletteEditorState.wheelPointer.upHandler);
      paletteEditorState.wheelPointer.upHandler = null;
    }
    window.removeEventListener('pointermove', handlePaletteWheelPointerMove);
  }

  function updatePaletteFromWheelEvent(event) {
    const wheel = dom.controls.paletteWheel;
    if (!wheel) return;
    const rect = wheel.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const scale = wheel.width / rect.width;
    const x = (event.clientX - rect.left) * scale;
    const y = (event.clientY - rect.top) * scale;
    const radius = wheel.width / 2;
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = radius;
    const clampedDistance = Math.min(distance, maxRadius);
    let hue = Math.atan2(dy, dx) * (180 / Math.PI);
    if (hue < 0) hue += 360;
    const saturation = clamp(clampedDistance / maxRadius, 0, 1);
    paletteEditorState.hsv.h = hue;
    paletteEditorState.hsv.s = saturation;
    if (dom.controls.paletteHue) {
      dom.controls.paletteHue.value = String(Math.round(hue));
    }
    if (dom.controls.paletteSaturation) {
      dom.controls.paletteSaturation.value = String(Math.round(saturation * 100));
    }
    updatePaletteWheelCursor();
    updatePalettePreview();
    updatePaletteAlphaOutput();
    writePaletteColorFromHsv();
  }

  function setupFramesAndLayers() {
    dom.controls.addLayer?.addEventListener('click', () => {
      const activeFrame = getActiveFrame();
      if (!activeFrame) return;
      beginHistory('addLayer');
      const insertIndex = clamp(getActiveLayerIndex() + 1, 0, Number.MAX_SAFE_INTEGER);
      state.frames.forEach((frame, frameIndex) => {
        const targetIndex = Math.min(insertIndex, frame.layers.length);
        const name = `レイヤー ${frame.layers.length + 1}`;
        const newLayer = createLayer(name, state.width, state.height);
        frame.layers.splice(targetIndex, 0, newLayer);
        if (frameIndex === state.activeFrame) {
          state.activeLayer = newLayer.id;
        }
      });
      markHistoryDirty();
      scheduleSessionPersist();
      renderFrameList();
      renderLayerList();
      requestRender();
      requestOverlayRender();
      commitHistory();
    });

    dom.controls.removeLayer?.addEventListener('click', () => {
      if (!state.frames.every(frame => frame.layers.length > 1)) {
        return;
      }
      beginHistory('removeLayer');
      const removeIndex = clamp(getActiveLayerIndex(), 0, Number.MAX_SAFE_INTEGER);
      state.frames.forEach(frame => {
        const targetIndex = Math.min(removeIndex, frame.layers.length - 1);
        frame.layers.splice(targetIndex, 1);
      });
      const activeFrame = getActiveFrame();
      const nextIndex = clamp(removeIndex - 1, 0, activeFrame.layers.length - 1);
      state.activeLayer = activeFrame.layers[nextIndex].id;
      markHistoryDirty();
      scheduleSessionPersist();
      renderFrameList();
      renderLayerList();
      requestRender();
      requestOverlayRender();
      commitHistory();
    });

    dom.controls.addFrame?.addEventListener('click', () => {
      const baseFrame = getActiveFrame();
      if (!baseFrame) return;
      beginHistory('addFrame');
      const newFrame = createFrame(`フレーム ${state.frames.length + 1}`, baseFrame.layers, state.width, state.height);
      state.frames.splice(state.activeFrame + 1, 0, newFrame);
      state.activeFrame += 1;
      state.activeLayer = newFrame.layers[newFrame.layers.length - 1].id;
      markHistoryDirty();
      scheduleSessionPersist();
      renderFrameList();
      renderLayerList();
      requestRender();
      requestOverlayRender();
      commitHistory();
    });

    dom.controls.removeFrame?.addEventListener('click', () => {
      if (state.frames.length <= 1) return;
      beginHistory('removeFrame');
      state.frames.splice(state.activeFrame, 1);
      state.activeFrame = clamp(state.activeFrame, 0, state.frames.length - 1);
      const frame = getActiveFrame();
      state.activeLayer = frame.layers[frame.layers.length - 1].id;
      markHistoryDirty();
      scheduleSessionPersist();
      renderFrameList();
      renderLayerList();
      requestRender();
      requestOverlayRender();
      commitHistory();
    });

    dom.controls.playAnimation?.addEventListener('click', () => {
      if (!state.playback.isPlaying) {
        startPlayback();
      }
    });
    dom.controls.stopAnimation?.addEventListener('click', () => {
      stopPlayback();
    });
    dom.controls.rewindAnimation?.addEventListener('click', () => {
      stopPlayback();
      setActiveFrameIndex(0, { wrap: false });
    });
    dom.controls.forwardAnimation?.addEventListener('click', () => {
      stopPlayback();
      stepActiveFrame(1, { wrap: true });
    });
    dom.controls.animationFps?.addEventListener('change', () => {
      const frame = getActiveFrame();
      const fps = normalizeFpsValue(dom.controls.animationFps.value);
      const nextDuration = getDurationFromFps(fps);
      if (frame) {
        frame.duration = nextDuration;
        markHistoryDirty();
      }
      updateAnimationFpsDisplay(fps, nextDuration);
    });

    dom.controls.applyFpsAll?.addEventListener('click', () => {
      const fpsInput = dom.controls.animationFps;
      const fpsValue = fpsInput ? Number(fpsInput.value) : 12;
      applyFpsToAllFrames(fpsValue);
    });

    syncAnimationFpsDisplayFromState();
    updatePlaybackButtons();

    renderFrameList();
    renderLayerList();
    applyTimelineToolbarFrames();
  }

  function startPlayback() {
    if (state.playback.isPlaying) return;
    if (!Array.isArray(state.frames) || !state.frames.length) {
      return;
    }
    state.playback.isPlaying = true;
    lastFrameTime = performance.now();
    updatePlaybackButtons();
    playbackHandle = requestAnimationFrame(stepPlayback);
  }

  function stopPlayback() {
    state.playback.isPlaying = false;
    if (playbackHandle != null) {
      cancelAnimationFrame(playbackHandle);
      playbackHandle = null;
    }
    updatePlaybackButtons();
  }

  function stepPlayback(timestamp) {
    if (!state.playback.isPlaying) return;
    const frame = getActiveFrame();
    const duration = frame && Number.isFinite(frame.duration) && frame.duration > 0 ? frame.duration : 1000 / 12;
    const elapsed = timestamp - lastFrameTime;
    if (elapsed >= duration) {
      stepActiveFrame(1, { wrap: true, persist: false });
      lastFrameTime = timestamp;
    }
    playbackHandle = requestAnimationFrame(stepPlayback);
  }

  function updatePlaybackButtons() {
    const isPlaying = state.playback.isPlaying;
    if (dom.controls.playAnimation) {
      dom.controls.playAnimation.classList.toggle('is-active', isPlaying);
      dom.controls.playAnimation.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    }
    if (dom.controls.stopAnimation) {
      dom.controls.stopAnimation.disabled = !isPlaying;
    }
    applyTimelineToolbarFrames();
  }

  function applyTimelineToolbarFrames() {
    const configs = [
      { element: dom.controls.addLayer, variant: 'add' },
      { element: dom.controls.removeLayer, variant: 'remove' },
      { element: dom.controls.addFrame, variant: 'add' },
      { element: dom.controls.removeFrame, variant: 'remove' },
      { element: dom.controls.rewindAnimation, variant: 'playback' },
      { element: dom.controls.playAnimation, variant: state.playback.isPlaying ? 'playbackActive' : 'playback' },
      { element: dom.controls.stopAnimation, variant: state.playback.isPlaying ? 'stop' : 'stop' },
      { element: dom.controls.forwardAnimation, variant: 'playback' },
    ];
    configs.forEach(({ element, variant }) => {
      if (!element) return;
      const colors = TIMELINE_BUTTON_VARIANTS[variant] || TIMELINE_BUTTON_VARIANTS.playback;
      applyPixelFrameBackground(element, colors.fill, { borderColor: colors.border });
    });
  }

  function getTimelineBodyVariant({ isEmpty, isActiveLayerRow, isActiveFrameColumn, isActiveCell, isHidden }) {
    if (isEmpty) {
      return 'bodyEmpty';
    }
    if (isActiveCell) {
      return 'bodyActiveCell';
    }
    if (isHidden) {
      return 'bodyHidden';
    }
    if (isActiveLayerRow && isActiveFrameColumn) {
      return 'bodyActiveCell';
    }
    if (isActiveLayerRow) {
      return 'bodyActiveRow';
    }
    if (isActiveFrameColumn) {
      return 'bodyActiveColumn';
    }
    return 'body';
  }

  function applyTimelineCellFrame(element, variant) {
    if (!element) return;
    element.classList.add('pixel-frame');
    const colors = TIMELINE_CELL_VARIANTS[variant] || TIMELINE_CELL_VARIANTS.body;
    applyPixelFrameBackground(element, colors.fill, { borderColor: colors.border });
  }

  function applyTimelineSlotFrame(element, variant) {
    if (!element) return;
    element.classList.add('pixel-frame');
    const colors = TIMELINE_SLOT_VARIANTS[variant] || TIMELINE_SLOT_VARIANTS.default;
    applyPixelFrameBackground(element, colors.fill, { borderColor: colors.border });
  }

  function getLayerVisibilityForRow(rowIndex) {
    for (let frameIndex = 0; frameIndex < state.frames.length; frameIndex += 1) {
      const frame = state.frames[frameIndex];
      const layerIndex = frame.layers.length - 1 - rowIndex;
      if (layerIndex >= 0 && layerIndex < frame.layers.length) {
        return Boolean(frame.layers[layerIndex]?.visible);
      }
    }
    return true;
  }

  function setLayerVisibilityForRow(rowIndex, visible) {
    let needsChange = false;
    state.frames.forEach(frame => {
      const layerIndex = frame.layers.length - 1 - rowIndex;
      if (layerIndex >= 0 && layerIndex < frame.layers.length) {
        const targetLayer = frame.layers[layerIndex];
        if (targetLayer && targetLayer.visible !== visible) {
          needsChange = true;
        }
      }
    });
    if (!needsChange) {
      return;
    }
    beginHistory('layerVisibilityRow');
    state.frames.forEach(frame => {
      const layerIndex = frame.layers.length - 1 - rowIndex;
      if (layerIndex >= 0 && layerIndex < frame.layers.length) {
        const targetLayer = frame.layers[layerIndex];
        if (targetLayer && targetLayer.visible !== visible) {
          targetLayer.visible = visible;
        }
      }
    });
    markHistoryDirty();
    scheduleSessionPersist();
    renderTimelineMatrix();
    requestRender();
    requestOverlayRender();
    commitHistory();
  }

  function toggleLayerVisibilityForRow(rowIndex) {
    const current = getLayerVisibilityForRow(rowIndex);
    setLayerVisibilityForRow(rowIndex, !current);
  }

  function renderTimelineMatrix() {
    const container = dom.controls.timelineMatrix;
    if (!container) return;

    const frames = state.frames;
    const frameCount = frames.length;
    if (!frameCount) {
      container.innerHTML = '';
      return;
    }

    const activeFrameIndex = clamp(state.activeFrame, 0, frameCount - 1);
    state.activeFrame = activeFrameIndex;

    const reversedLayersByFrame = frames.map(frame => frame.layers.slice().reverse());
    const activeLayers = reversedLayersByFrame[activeFrameIndex];
    const layerNames = activeLayers.map((layer, idx) => {
      const parts = String(layer.name).match(/(\d+)/);
      if (parts && parts[1]) {
        return parts[1];
      }
      return String(activeLayers.length - idx);
    });
    const maxLayerCount = reversedLayersByFrame.reduce((max, layers) => Math.max(max, layers.length), 0);
    const layerCount = Math.max(maxLayerCount, 1);

    let activeLayerRow = activeLayers.findIndex(layer => layer.id === state.activeLayer);
    if (activeLayerRow === -1 && activeLayers.length) {
      state.activeLayer = activeLayers[0].id;
      activeLayerRow = 0;
    }

    container.innerHTML = '';
    const cellSizePx = `${TIMELINE_CELL_SIZE}px`;
    container.style.setProperty('--timeline-cell-size', cellSizePx);
    const columnCount = frameCount + 1;
    const rowCount = layerCount + 1;
    container.style.gridTemplateColumns = `repeat(${columnCount}, ${cellSizePx})`;
    container.style.gridTemplateRows = `repeat(${rowCount}, ${cellSizePx})`;

    const fragment = document.createDocumentFragment();

    const corner = document.createElement('div');
    corner.className = 'timeline-cell timeline-cell--corner';
    corner.classList.add('pixel-frame');
    corner.style.gridColumn = '1';
    corner.style.gridRow = '1';
    corner.setAttribute('role', 'columnheader');
    corner.setAttribute('aria-label', 'タイムライン');
    applyTimelineCellFrame(corner, 'corner');
    fragment.appendChild(corner);

    frames.forEach((frame, frameIndex) => {
      const col = frameIndex + 2;
      const header = document.createElement('div');
      header.className = 'timeline-cell timeline-cell--frame-header';
      header.classList.add('pixel-frame');
      header.style.gridColumn = String(col);
      header.style.gridRow = '1';
      header.setAttribute('role', 'columnheader');
      if (frameIndex === activeFrameIndex) {
        header.classList.add('is-active-frame');
      }
      const headerVariant = frameIndex === activeFrameIndex ? 'frameHeaderActive' : 'frameHeader';
      applyTimelineCellFrame(header, headerVariant);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'timeline-frame-button pixel-frame';
      const frameNumberMatch = String(frame.name).match(/(\d+)/);
      button.textContent = frameNumberMatch && frameNumberMatch[1] ? frameNumberMatch[1] : String(frameIndex + 1);
      button.addEventListener('click', () => {
        state.activeFrame = frameIndex;
        const candidateLayers = reversedLayersByFrame[frameIndex];
        const nextLayer = candidateLayers[activeLayerRow] || candidateLayers[candidateLayers.length - 1] || candidateLayers[0];
        if (nextLayer) {
          state.activeLayer = nextLayer.id;
        }
        scheduleSessionPersist();
        renderTimelineMatrix();
        requestRender();
        requestOverlayRender();
      });

      header.appendChild(button);
      applyTimelineSlotFrame(button, frameIndex === activeFrameIndex ? 'active' : 'default');
      fragment.appendChild(header);
    });

    for (let rowIndex = 0; rowIndex < layerCount; rowIndex += 1) {
      const row = rowIndex + 2;
      const layer = activeLayers[rowIndex];
      const labelName = layerNames[rowIndex] || String(layerCount - rowIndex);
      const rowHeader = document.createElement('div');
      rowHeader.className = 'timeline-cell timeline-cell--layer';
      rowHeader.classList.add('pixel-frame');
      rowHeader.style.gridColumn = '1';
      rowHeader.style.gridRow = String(row);
      rowHeader.setAttribute('role', 'rowheader');
      rowHeader.dataset.layerRowIndex = String(rowIndex);
      const rowVisibility = getLayerVisibilityForRow(rowIndex);

      if (rowIndex === activeLayerRow) {
        rowHeader.classList.add('is-active-layer');
      }

      if (layer) {
        rowHeader.dataset.layerId = layer.id;
        const visibilityToggle = document.createElement('button');
        visibilityToggle.type = 'button';
        visibilityToggle.className = 'timeline-visibility';
        visibilityToggle.dataset.layerRowIndex = String(rowIndex);
        visibilityToggle.setAttribute('aria-pressed', String(rowVisibility));
        visibilityToggle.setAttribute('aria-label', rowVisibility ? 'レイヤーを非表示' : 'レイヤーを表示');
        visibilityToggle.textContent = rowVisibility ? '●' : '○';
        visibilityToggle.addEventListener('click', event => {
          event.stopPropagation();
          toggleLayerVisibilityForRow(rowIndex);
        });

        const tag = document.createElement('button');
        tag.type = 'button';
        tag.className = 'timeline-layer-tag';
        tag.textContent = labelName;
        tag.addEventListener('click', () => {
          state.activeLayer = layer.id;
          scheduleSessionPersist();
          renderTimelineMatrix();
          requestOverlayRender();
        });
        rowHeader.appendChild(visibilityToggle);
        rowHeader.appendChild(tag);
      } else {
        rowHeader.classList.add('is-placeholder');
        rowHeader.textContent = labelName;
        rowHeader.setAttribute('aria-hidden', 'true');
      }

      const layerVariant = rowHeader.classList.contains('is-placeholder')
        ? 'layerPlaceholder'
        : rowIndex === activeLayerRow
          ? (rowVisibility ? 'layerActive' : 'layerActiveHidden')
          : (rowVisibility ? 'layer' : 'layerHidden');
      applyTimelineCellFrame(rowHeader, layerVariant);

      fragment.appendChild(rowHeader);

      frames.forEach((frame, frameIndex) => {
        const col = frameIndex + 2;
        const cell = document.createElement('div');
        cell.className = 'timeline-cell timeline-cell--body';
        cell.classList.add('pixel-frame');
        cell.style.gridColumn = String(col);
        cell.style.gridRow = String(row);
        cell.setAttribute('role', 'gridcell');

        if (rowIndex === activeLayerRow) {
          cell.classList.add('is-active-layer-row');
        }
        if (frameIndex === activeFrameIndex) {
          cell.classList.add('is-active-frame-column');
        }

        const frameLayers = reversedLayersByFrame[frameIndex];
        const targetLayer = frameLayers[rowIndex];
        const isActiveLayerRow = rowIndex === activeLayerRow;
        const isActiveFrameColumn = frameIndex === activeFrameIndex;
        let isActiveCell = false;
        let isEmptyCell = false;
        let isHiddenCell = false;

        if (!targetLayer) {
          isEmptyCell = true;
          cell.classList.add('is-empty');
          const placeholder = document.createElement('span');
          placeholder.className = 'timeline-slot is-disabled';
          placeholder.textContent = '—';
          placeholder.setAttribute('aria-hidden', 'true');
          applyTimelineSlotFrame(placeholder, 'disabled');
          cell.appendChild(placeholder);
        } else {
          const slot = document.createElement('button');
          slot.type = 'button';
          slot.className = 'timeline-slot';
          slot.setAttribute('aria-label', `${frame.name} / ${targetLayer.name}`);
          if (!targetLayer.visible) {
            slot.classList.add('is-hidden');
            isHiddenCell = true;
          }
          if (frameIndex === activeFrameIndex && targetLayer.id === state.activeLayer) {
            slot.classList.add('is-active');
            cell.classList.add('is-active-cell');
            isActiveCell = true;
          }
          slot.addEventListener('click', () => {
            state.activeFrame = frameIndex;
            state.activeLayer = targetLayer.id;
            scheduleSessionPersist();
            renderTimelineMatrix();
            requestRender();
            requestOverlayRender();
          });

          const marker = document.createElement('span');
          marker.className = 'timeline-slot__marker';
          marker.setAttribute('aria-hidden', 'true');
          slot.appendChild(marker);

          let slotVariant = 'default';
          if (!targetLayer.visible) {
            slotVariant = 'hidden';
          }
          if (slot.classList.contains('is-active')) {
            slotVariant = 'active';
          }
          applyTimelineSlotFrame(slot, slotVariant);
          cell.appendChild(slot);
        }

        const bodyVariant = getTimelineBodyVariant({
          isEmpty: isEmptyCell,
          isActiveLayerRow,
          isActiveFrameColumn,
          isActiveCell,
          isHidden: isHiddenCell,
        });
        applyTimelineCellFrame(cell, bodyVariant);
        fragment.appendChild(cell);
      });
    }

    container.appendChild(fragment);

    syncAnimationFpsDisplayFromState();
  }

  function renderFrameList() {
    renderTimelineMatrix();
  }

  function renderLayerList() {
    renderTimelineMatrix();
  }

  function setupCanvas() {
    resizeCanvases();
    ensureCanvasWheelListener();
  }

  function ensureCanvasWheelListener() {
    if (canvasWheelListenerBound) {
      return;
    }
    const stack = dom.canvases.stack;
    if (!stack) {
      return;
    }
    stack.addEventListener('wheel', handleCanvasWheel, { passive: false });
    canvasWheelListenerBound = true;
  }

  function resizeCanvases() {
    const { width, height, scale } = state;
    dom.canvases.drawing.width = width;
    dom.canvases.drawing.height = height;
    dom.canvases.overlay.width = width;
    dom.canvases.overlay.height = height;
    if (dom.canvases.selection) {
      dom.canvases.selection.width = width * scale;
      dom.canvases.selection.height = height * scale;
    }
    if (ctx.drawing) {
      ctx.drawing.imageSmoothingEnabled = false;
    }
    if (ctx.overlay) {
      ctx.overlay.imageSmoothingEnabled = false;
    }
    if (ctx.selection) {
      ctx.selection.imageSmoothingEnabled = false;
    }
    dom.canvases.drawing.style.width = `${width * scale}px`;
    dom.canvases.drawing.style.height = `${height * scale}px`;
    dom.canvases.overlay.style.width = `${width * scale}px`;
    dom.canvases.overlay.style.height = `${height * scale}px`;
    if (dom.canvases.selection) {
      dom.canvases.selection.style.width = `${width * scale}px`;
      dom.canvases.selection.style.height = `${height * scale}px`;
    }
    applyViewportTransform();
    syncControlsWithState();
    markCanvasDirty();
    renderCanvas();
    requestOverlayRender();
  }

  function setZoom(nextScale, focus) {
    const prevScale = Number(state.scale) || MIN_ZOOM_SCALE;
    const targetScale = normalizeZoomScale(nextScale, prevScale);
    if (Math.abs(targetScale - prevScale) < ZOOM_EPSILON) {
      syncControlsWithState();
      return;
    }

    const previousPan = {
      x: Number(state.pan.x) || 0,
      y: Number(state.pan.y) || 0,
    };
    const stack = dom.canvases.stack;
    const stackRectBefore = stack ? stack.getBoundingClientRect() : null;
    const zoomFocus = focus && Number.isFinite(focus.worldX) && Number.isFinite(focus.worldY)
      ? focus
      : null;

    state.scale = targetScale;
    resizeCanvases();

    if (zoomFocus && stack && stackRectBefore) {
      const stackRectAfter = stack.getBoundingClientRect();
      const layoutShiftX = stackRectAfter.left - stackRectBefore.left;
      const layoutShiftY = stackRectAfter.top - stackRectBefore.top;
      const scaleDelta = prevScale - targetScale;
      const nextPanX = previousPan.x + zoomFocus.worldX * scaleDelta - layoutShiftX;
      const nextPanY = previousPan.y + zoomFocus.worldY * scaleDelta - layoutShiftY;
      state.pan.x = Math.round(nextPanX);
      state.pan.y = Math.round(nextPanY);
    } else {
      const ratio = targetScale / prevScale;
      state.pan.x = Math.round(previousPan.x * ratio);
      state.pan.y = Math.round(previousPan.y * ratio);
    }

    applyViewportTransform();
    scheduleSessionPersist();
  }

  function adjustZoomBySteps(delta, focus) {
    const currentIndex = getZoomStepIndex(state.scale);
    const nextIndex = clamp(currentIndex + Math.round(delta || 0), 0, ZOOM_STEPS.length - 1);
    if (nextIndex === currentIndex) {
      syncControlsWithState();
      return;
    }
    setZoom(getZoomScaleAtIndex(nextIndex), focus);
  }

  function getCanvasFocusAt(clientX, clientY) {
    const drawing = dom.canvases.drawing;
    if (!drawing) {
      return null;
    }
    const rect = drawing.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return null;
    }
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return null;
    }
    const scale = Number(state.scale) || MIN_ZOOM_SCALE;
    const worldX = (clientX - rect.left) / scale;
    const worldY = (clientY - rect.top) / scale;
    return {
      clientX,
      clientY,
      worldX,
      worldY,
      cellX: Math.floor(worldX),
      cellY: Math.floor(worldY),
    };
  }

  function handleCanvasWheel(event) {
    const focus = getCanvasFocusAt(event.clientX, event.clientY);
    if (!focus) {
      return;
    }
    const deltaY = event.deltaY;
    if (!Number.isFinite(deltaY) || deltaY === 0) {
      return;
    }
    event.preventDefault();
    const normalizer = event.deltaMode === 0 ? 100 : 3;
    const stepMagnitude = clamp(Math.ceil(Math.abs(deltaY) / normalizer), 1, 4);
    const direction = deltaY < 0 ? 1 : -1;
    focus.cellX = clamp(focus.cellX, 0, state.width - 1);
    focus.cellY = clamp(focus.cellY, 0, state.height - 1);
    adjustZoomBySteps(direction * stepMagnitude, focus);
  }

  function setupKeyboard() {
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        clearSelection();
        return;
      }
      const isModifier = event.metaKey || event.ctrlKey;
      if (!isModifier) {
        return;
      }
      const target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === 'z' && event.shiftKey) || key === 'y') {
        event.preventDefault();
        redo();
      }
    });
  }

  function detachPointerListeners() {
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  function resetPointerState({ commitHistory: shouldCommit = false } = {}) {
    if (pointerState.pointerId !== null && dom.canvases.drawing) {
      try {
        dom.canvases.drawing.releasePointerCapture(pointerState.pointerId);
      } catch (error) {
        // Ignore release failures when capture is not set.
      }
    }
    pointerState.active = false;
    pointerState.pointerId = null;
    pointerState.tool = null;
    pointerState.start = null;
    pointerState.current = null;
    pointerState.last = null;
    pointerState.path = [];
    pointerState.preview = null;
    pointerState.selectionPreview = null;
    pointerState.selectionMove = null;
    pointerState.selectionClearedOnDown = false;
    pointerState.startClient = null;
    pointerState.panOrigin = { x: state.pan.x, y: state.pan.y };
    pointerState.panMode = null;
    pointerState.touchPanStart = null;
    pointerState.curveHandle = null;
    if (shouldCommit) {
      commitHistory();
    }
    requestOverlayRender();
  }

  function abortActivePointerInteraction({ commitHistory: shouldCommit = true } = {}) {
    if (!pointerState.active) {
      return;
    }
    if (pointerState.tool === 'selectionMove') {
      finalizeSelectionMove();
    }
    detachPointerListeners();
    resetPointerState({ commitHistory: shouldCommit });
  }

  function updateTouchPointer(event) {
    if (event.pointerType !== 'touch') {
      return;
    }
    activeTouchPointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
  }

  function hasActiveMultiTouch() {
    return activeTouchPointers.size >= TOUCH_PAN_MIN_POINTERS;
  }

  function removeTouchPointer(event) {
    if (event.pointerType !== 'touch') {
      return;
    }
    activeTouchPointers.delete(event.pointerId);
  }

  function getTouchCentroid() {
    if (!activeTouchPointers.size) {
      return null;
    }
    let sumX = 0;
    let sumY = 0;
    activeTouchPointers.forEach(point => {
      sumX += point.x;
      sumY += point.y;
    });
    const count = activeTouchPointers.size;
    return { x: sumX / count, y: sumY / count };
  }

  function refreshTouchPanBaseline() {
    pointerState.touchPanStart = getTouchCentroid();
    pointerState.panOrigin = { x: state.pan.x, y: state.pan.y };
  }

  function startPanInteraction(event, { multiTouch = false } = {}) {
    pointerState.active = true;
    pointerState.tool = 'pan';
    pointerState.panMode = multiTouch ? 'multiTouch' : 'single';
    pointerState.panOrigin = { x: state.pan.x, y: state.pan.y };
    pointerState.path = [];
    if (multiTouch) {
      pointerState.pointerId = null;
      pointerState.startClient = null;
      pointerState.touchPanStart = getTouchCentroid();
      if (!pointerState.touchPanStart) {
        pointerState.touchPanStart = { x: event.clientX, y: event.clientY };
      }
    } else {
      pointerState.pointerId = event.pointerId;
      pointerState.startClient = { x: event.clientX, y: event.clientY };
      pointerState.touchPanStart = null;
      if (dom.canvases.drawing) {
        dom.canvases.drawing.setPointerCapture(event.pointerId);
      }
    }
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  function finishPanInteraction() {
    detachPointerListeners();
    if (pointerState.pointerId !== null && dom.canvases.drawing) {
      try {
        dom.canvases.drawing.releasePointerCapture(pointerState.pointerId);
      } catch (error) {
        // Ignore capture release issues.
      }
    }
    pointerState.active = false;
    pointerState.pointerId = null;
    pointerState.tool = null;
    pointerState.panMode = null;
    pointerState.touchPanStart = null;
    pointerState.startClient = null;
    pointerState.path = [];
    activeTouchPointers.clear();
    requestOverlayRender();
    scheduleSessionPersist();
  }

  function handlePointerDown(event) {
    const isTouch = event.pointerType === 'touch';
    if (isTouch) {
      updateTouchPointer(event);
    }
    const isMiddleMousePan = event.pointerType !== 'touch' && event.button === 1;
    if (isMiddleMousePan) {
      event.preventDefault();
      if (pointerState.active) {
        abortActivePointerInteraction();
      }
      startPanInteraction(event);
      return;
    }

    if (isTouch && hasActiveMultiTouch()) {
      event.preventDefault();
      if (!pointerState.active || pointerState.tool !== 'pan' || pointerState.panMode !== 'multiTouch') {
        abortActivePointerInteraction();
        startPanInteraction(event, { multiTouch: true });
      } else {
        refreshTouchPanBaseline();
      }
      return;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    event.preventDefault();
    const position = getPointerPosition(event);
    const activeTool = state.tool;
    const layer = getActiveLayer();

    if (HISTORY_DRAW_TOOLS.has(activeTool) && !layer) {
      return;
    }

    if (activeTool === 'pan') {
      startPanInteraction(event, { multiTouch: isTouch && hasActiveMultiTouch() });
      return;
    }

    if (!position) {
      pointerState.active = false;
      return;
    }

    pointerState.selectionClearedOnDown = false;
    pointerState.selectionMove = null;

    const selectionMask = state.selectionMask;
    const isSelectionTool = activeTool === 'selectRect' || activeTool === 'selectLasso' || activeTool === 'selectSame';
    if (isSelectionTool && selectionMask) {
      const maskIndex = position.y * state.width + position.x;
      const insideSelection = selectionMask[maskIndex] === 1;
      if (!insideSelection) {
        clearSelection();
        pointerState.selectionClearedOnDown = true;
      } else if (activeTool !== 'selectSame') {
        const moved = beginSelectionMove(event, position);
        if (moved) {
          return;
        }
      }
    }

    if (activeTool === 'curve') {
      if (HISTORY_DRAW_TOOLS.has(activeTool) && !layer) {
        return;
      }
      handleCurvePointerDown(event, position, layer);
      return;
    }

    if (!dom.canvases.drawing) {
      return;
    }
    dom.canvases.drawing.setPointerCapture(event.pointerId);
    hoverPixel = null;
    requestOverlayRender();
    pointerState.active = true;
    pointerState.pointerId = event.pointerId;
    pointerState.tool = activeTool;
    pointerState.start = position;
    pointerState.current = position;
    pointerState.last = position;
    pointerState.path = position ? [position] : [];
    pointerState.preview = null;
    pointerState.selectionPreview = null;

    if (HISTORY_DRAW_TOOLS.has(activeTool)) {
      beginHistory(activeTool);
    }

    if (activeTool === 'eyedropper') {
      sampleColor(position.x, position.y);
      pointerState.active = false;
      if (dom.canvases.drawing) {
        dom.canvases.drawing.releasePointerCapture(event.pointerId);
      }
      setActiveTool('pen');
      return;
    }

    if (activeTool === 'selectSame') {
      createSelectionByColor(position.x, position.y);
      pointerState.active = false;
      if (dom.canvases.drawing) {
        dom.canvases.drawing.releasePointerCapture(event.pointerId);
      }
      return;
    }

    if (activeTool === 'fill') {
      floodFill(position.x, position.y);
      commitHistory();
      pointerState.active = false;
      if (dom.canvases.drawing) {
        dom.canvases.drawing.releasePointerCapture(event.pointerId);
      }
      requestOverlayRender();
      return;
    }

    if (activeTool === 'selectRect' || activeTool === 'selectLasso') {
      pointerState.selectionPreview = { start: position, points: [position] };
    } else if (activeTool === 'line' || activeTool === 'rect' || activeTool === 'rectFill' || activeTool === 'ellipse' || activeTool === 'ellipseFill') {
      pointerState.preview = { start: position, end: position, points: [position] };
    } else {
      applyBrushStroke(position.x, position.y, position.x, position.y);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  function handlePointerMove(event) {
    if (event.pointerType === 'touch' && activeTouchPointers.has(event.pointerId)) {
      updateTouchPointer(event);
    }
    if (!pointerState.active) return;
    if (pointerState.tool === 'pan') {
      if (pointerState.panMode === 'multiTouch') {
        if (!activeTouchPointers.has(event.pointerId)) {
          return;
        }
        if (!pointerState.touchPanStart) {
          refreshTouchPanBaseline();
        }
        const centroid = getTouchCentroid();
        if (!centroid || !pointerState.touchPanStart) {
          return;
        }
        const dx = centroid.x - pointerState.touchPanStart.x;
        const dy = centroid.y - pointerState.touchPanStart.y;
        const originX = pointerState.panOrigin?.x || 0;
        const originY = pointerState.panOrigin?.y || 0;
        state.pan.x = Math.round(originX + dx);
        state.pan.y = Math.round(originY + dy);
        applyViewportTransform();
        return;
      }
      if (event.pointerId !== pointerState.pointerId) return;
      const dx = event.clientX - (pointerState.startClient?.x || 0);
      const dy = event.clientY - (pointerState.startClient?.y || 0);
      const originX = pointerState.panOrigin?.x || 0;
      const originY = pointerState.panOrigin?.y || 0;
      state.pan.x = Math.round(originX + dx);
      state.pan.y = Math.round(originY + dy);
      applyViewportTransform();
      return;
    }
    if (event.pointerId !== pointerState.pointerId) return;
    if (pointerState.tool === 'curve') {
      handleCurvePointerMove(event);
      return;
    }

    const position = getPointerPosition(event);
    if (!position) return;
    pointerState.current = position;
    pointerState.path.push(position);

    if (pointerState.tool === 'pen' || pointerState.tool === 'eraser') {
      applyBrushStroke(pointerState.last.x, pointerState.last.y, position.x, position.y);
      pointerState.last = position;
    } else if (pointerState.tool === 'line' || pointerState.tool === 'rect' || pointerState.tool === 'rectFill' || pointerState.tool === 'ellipse' || pointerState.tool === 'ellipseFill') {
      pointerState.preview = { start: pointerState.start, end: position, points: pointerState.path.slice() };
      requestOverlayRender();
    } else if (pointerState.tool === 'selectionMove') {
      handleSelectionMoveDrag(position);
    } else if (pointerState.tool === 'selectRect' || pointerState.tool === 'selectLasso') {
      pointerState.selectionPreview.points.push(position);
      pointerState.selectionPreview.end = position;
      requestOverlayRender();
    }
  }

  function handlePointerUp(event) {
    if (event.pointerType === 'touch') {
      removeTouchPointer(event);
    }
    if (!pointerState.active) return;
    const isPanTool = pointerState.tool === 'pan';
    const isMultiTouchPan = isPanTool && pointerState.panMode === 'multiTouch';
    if (isPanTool) {
      if (isMultiTouchPan) {
        if (hasActiveMultiTouch()) {
          refreshTouchPanBaseline();
          return;
        }
        finishPanInteraction();
        return;
      }
      if (pointerState.pointerId !== event.pointerId) {
        return;
      }
      finishPanInteraction();
      return;
    }

    if (event.pointerId !== pointerState.pointerId) {
      return;
    }

    if (dom.canvases.drawing) {
      dom.canvases.drawing.releasePointerCapture(event.pointerId);
    }
    pointerState.active = false;
    detachPointerListeners();

    if (pointerState.tool === 'curve') {
      handleCurvePointerUp(event);
      return;
    }

    hoverPixel = getPointerPosition(event);
    const tool = pointerState.tool;

    if (tool === 'line') {
      drawLine(pointerState.start, pointerState.current);
    } else if (tool === 'rect') {
      drawRectangle(pointerState.start, pointerState.current, false);
    } else if (tool === 'rectFill') {
      drawRectangle(pointerState.start, pointerState.current, true);
    } else if (tool === 'ellipse') {
      drawEllipse(pointerState.start, pointerState.current, false);
    } else if (tool === 'ellipseFill') {
      drawEllipse(pointerState.start, pointerState.current, true);
    } else if (tool === 'selectionMove') {
      finalizeSelectionMove();
    } else if (tool === 'selectRect') {
      if (!(pointerState.selectionClearedOnDown && pointerState.path.length <= 1)) {
        createSelectionRect(pointerState.start, pointerState.current);
      }
    } else if (tool === 'selectLasso') {
      const pointCount = pointerState.selectionPreview?.points?.length || 0;
      if (!(pointerState.selectionClearedOnDown && pointCount <= 1)) {
        createSelectionLasso(pointerState.selectionPreview.points);
      }
    }

    if (HISTORY_DRAW_TOOLS.has(tool)) {
      commitHistory();
    }

    pointerState.pointerId = null;
    pointerState.preview = null;
    pointerState.selectionPreview = null;
    pointerState.selectionMove = null;
    pointerState.selectionClearedOnDown = false;
    pointerState.path = [];
    requestOverlayRender();
  }

  function handlePointerCancel(event) {
    if (event.pointerType === 'touch') {
      removeTouchPointer(event);
    }
    if (!pointerState.active) {
      return;
    }
    if (pointerState.tool === 'pan') {
      finishPanInteraction();
      return;
    }
    if (pointerState.pointerId === event.pointerId) {
      abortActivePointerInteraction();
    }
  }

  function beginSelectionMove(event, startPosition) {
    const mask = state.selectionMask;
    const bounds = state.selectionBounds;
    const layer = getActiveLayer();
    if (!mask || !bounds || !layer) {
      return false;
    }
    const moveState = createSelectionMoveState(layer, bounds, mask);
    if (!moveState) {
      return false;
    }

    dom.canvases.drawing.setPointerCapture(event.pointerId);
    hoverPixel = null;
    requestOverlayRender();
    pointerState.active = true;
    pointerState.pointerId = event.pointerId;
    pointerState.tool = 'selectionMove';
    pointerState.start = startPosition;
    pointerState.current = startPosition;
    pointerState.last = startPosition;
    pointerState.path = startPosition ? [startPosition] : [];
    pointerState.preview = null;
    pointerState.selectionPreview = null;
    pointerState.selectionMove = moveState;

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return true;
  }

  function createSelectionMoveState(layer, bounds, mask) {
    if (!layer || !bounds || !mask) {
      return null;
    }
    const width = Math.max(0, (bounds.x1 ?? 0) - (bounds.x0 ?? 0) + 1);
    const height = Math.max(0, (bounds.y1 ?? 0) - (bounds.y0 ?? 0) + 1);
    if (width <= 0 || height <= 0) {
      return null;
    }

    const size = width * height;
    const localMask = new Uint8Array(size);
    const localIndices = new Int16Array(size);
    const localDirect = new Uint8ClampedArray(size * 4);
    let imageData = null;
    if (ctx.overlay && typeof ctx.overlay.createImageData === 'function') {
      imageData = ctx.overlay.createImageData(width, height);
    } else if (typeof ImageData === 'function') {
      imageData = new ImageData(width, height);
    }

    const layerDirect = layer.direct instanceof Uint8ClampedArray ? layer.direct : null;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const canvasX = bounds.x0 + x;
        const canvasY = bounds.y0 + y;
        if (canvasX < 0 || canvasY < 0 || canvasX >= state.width || canvasY >= state.height) {
          continue;
        }
        const canvasIndex = canvasY * state.width + canvasX;
        const localIndex = y * width + x;
        const selected = mask[canvasIndex] === 1 ? 1 : 0;
        localMask[localIndex] = selected;
        const canvasBase = canvasIndex * 4;
        const localBase = localIndex * 4;
        if (selected) {
          localIndices[localIndex] = layer.indices[canvasIndex];
          if (layerDirect) {
            localDirect[localBase] = layerDirect[canvasBase];
            localDirect[localBase + 1] = layerDirect[canvasBase + 1];
            localDirect[localBase + 2] = layerDirect[canvasBase + 2];
            localDirect[localBase + 3] = layerDirect[canvasBase + 3];
          } else {
            localDirect[localBase] = 0;
            localDirect[localBase + 1] = 0;
            localDirect[localBase + 2] = 0;
            localDirect[localBase + 3] = 0;
          }
          if (imageData) {
            const paletteIndex = layer.indices[canvasIndex];
            let color = null;
            if (paletteIndex >= 0 && state.palette[paletteIndex]) {
              color = state.palette[paletteIndex];
            } else {
              color = {
                r: layerDirect ? layerDirect[canvasBase] : 0,
                g: layerDirect ? layerDirect[canvasBase + 1] : 0,
                b: layerDirect ? layerDirect[canvasBase + 2] : 0,
                a: layerDirect ? layerDirect[canvasBase + 3] : 0,
              };
            }
            if (color) {
              imageData.data[localBase] = color.r;
              imageData.data[localBase + 1] = color.g;
              imageData.data[localBase + 2] = color.b;
              imageData.data[localBase + 3] = color.a;
            }
          }
        } else {
          localIndices[localIndex] = -1;
          if (imageData) {
            imageData.data[localBase] = 0;
            imageData.data[localBase + 1] = 0;
            imageData.data[localBase + 2] = 0;
            imageData.data[localBase + 3] = 0;
          }
        }
      }
    }

    return {
      layer,
      bounds: { ...bounds },
      width,
      height,
      mask: localMask,
      indices: localIndices,
      direct: localDirect,
      imageData,
      offset: { x: 0, y: 0 },
      hasCleared: false,
    };
  }

  function handleSelectionMoveDrag(position) {
    const moveState = pointerState.selectionMove;
    if (!moveState) {
      return;
    }
    const start = pointerState.start || position;
    const offsetX = position.x - start.x;
    const offsetY = position.y - start.y;
    if (!moveState.hasCleared && (offsetX !== 0 || offsetY !== 0)) {
      beginHistory('selectionMove');
      clearSelectionSourcePixels(moveState);
    }
    if (moveState.offset.x === offsetX && moveState.offset.y === offsetY && moveState.hasCleared) {
      return;
    }
    moveState.offset.x = offsetX;
    moveState.offset.y = offsetY;
    if (moveState.hasCleared) {
      requestOverlayRender();
    }
  }

  function clearSelectionSourcePixels(moveState) {
    const { layer, bounds, mask, width, height } = moveState;
    if (!layer) {
      return;
    }
    const layerDirect = layer.direct instanceof Uint8ClampedArray ? layer.direct : null;
    let modified = false;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const localIndex = y * width + x;
        if (mask[localIndex] !== 1) continue;
        const canvasX = bounds.x0 + x;
        const canvasY = bounds.y0 + y;
        if (canvasX < 0 || canvasY < 0 || canvasX >= state.width || canvasY >= state.height) continue;
        const canvasIndex = canvasY * state.width + canvasX;
        const base = canvasIndex * 4;
        const alpha = layerDirect ? layerDirect[base + 3] : 0;
        if (layer.indices[canvasIndex] !== -1 || alpha !== 0) {
          modified = true;
        }
        layer.indices[canvasIndex] = -1;
        if (layerDirect) {
          layerDirect[base] = 0;
          layerDirect[base + 1] = 0;
          layerDirect[base + 2] = 0;
          layerDirect[base + 3] = 0;
        }
      }
    }
    if (modified) {
      markHistoryDirty();
      markDirtyRect(bounds.x0, bounds.y0, bounds.x1, bounds.y1);
    }
    moveState.hasCleared = true;
    requestRender();
  }

  function finalizeSelectionMove() {
    const moveState = pointerState.selectionMove;
    if (!moveState) {
      pointerState.tool = state.tool;
      return;
    }
    if (!moveState.hasCleared) {
      pointerState.tool = state.tool;
      pointerState.selectionMove = null;
      return;
    }

    const { offset } = moveState;
    const result = placeSelectionPixels(moveState, offset.x, offset.y);
    pointerState.selectionMove = null;
    pointerState.tool = state.tool;

    if (result.placed) {
      if (result.bounds) {
        markDirtyRect(result.bounds.x0, result.bounds.y0, result.bounds.x1, result.bounds.y1);
      }
      state.selectionMask = result.mask;
      state.selectionBounds = result.bounds;
    } else {
      clearSelection();
    }

    markHistoryDirty();
    requestRender();
    requestOverlayRender();
    commitHistory();
  }

  function placeSelectionPixels(moveState, offsetX, offsetY) {
    const { layer, bounds, mask, indices, direct, width, height } = moveState;
    const newMask = new Uint8Array(state.width * state.height);
    const newBounds = { x0: state.width, y0: state.height, x1: -1, y1: -1 };
    let placed = false;

    const targetDirect = direct ? ensureLayerDirect(layer) : null;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const localIndex = y * width + x;
        if (mask[localIndex] !== 1) continue;
        const targetX = bounds.x0 + x + offsetX;
        const targetY = bounds.y0 + y + offsetY;
        if (targetX < 0 || targetY < 0 || targetX >= state.width || targetY >= state.height) {
          continue;
        }
        const targetIndex = targetY * state.width + targetX;
        const targetBase = targetIndex * 4;
        const localBase = localIndex * 4;
        layer.indices[targetIndex] = indices[localIndex];
        if (targetDirect) {
          targetDirect[targetBase] = direct[localBase];
          targetDirect[targetBase + 1] = direct[localBase + 1];
          targetDirect[targetBase + 2] = direct[localBase + 2];
          targetDirect[targetBase + 3] = direct[localBase + 3];
        }
        newMask[targetIndex] = 1;
        if (!placed) placed = true;
        if (targetX < newBounds.x0) newBounds.x0 = targetX;
        if (targetY < newBounds.y0) newBounds.y0 = targetY;
        if (targetX > newBounds.x1) newBounds.x1 = targetX;
        if (targetY > newBounds.y1) newBounds.y1 = targetY;
      }
    }

    if (!placed) {
      return { placed: false, mask: null, bounds: null };
    }

    return { placed: true, mask: newMask, bounds: newBounds };
  }

  function drawSelectionMovePreview(moveState) {
    if (!moveState || !moveState.hasCleared) {
      return;
    }
    const originX = moveState.bounds.x0 + moveState.offset.x;
    const originY = moveState.bounds.y0 + moveState.offset.y;

    if (ctx.overlay && moveState.imageData) {
      ctx.overlay.putImageData(moveState.imageData, originX, originY);
    }

    if (!ctx.selection) {
      return;
    }

    strokeSelectionPath((pathCtx, scale) => {
      traceSelectionMoveOutline(pathCtx, moveState, originX, originY, scale);
    }, { translateHalf: true });
  }

  function traceSelectionMoveOutline(pathCtx, moveState, originX, originY, scale) {
    const { width, height, mask } = moveState;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const localIndex = y * width + x;
        if (mask[localIndex] !== 1) continue;
        const globalX = originX + x;
        const globalY = originY + y;
        if (globalX < 0 || globalY < 0 || globalX >= state.width || globalY >= state.height) {
          continue;
        }

        const topFilled = selectionMoveNeighborFilled(moveState, x, y - 1, originX, originY);
        const bottomFilled = selectionMoveNeighborFilled(moveState, x, y + 1, originX, originY);
        const leftFilled = selectionMoveNeighborFilled(moveState, x - 1, y, originX, originY);
        const rightFilled = selectionMoveNeighborFilled(moveState, x + 1, y, originX, originY);

        const sx = globalX * scale;
        const sy = globalY * scale;
        const ex = sx + scale;
        const ey = sy + scale;

        if (!topFilled) {
          pathCtx.moveTo(sx, sy);
          pathCtx.lineTo(ex, sy);
        }
        if (!bottomFilled) {
          pathCtx.moveTo(sx, ey);
          pathCtx.lineTo(ex, ey);
        }
        if (!leftFilled) {
          pathCtx.moveTo(sx, sy);
          pathCtx.lineTo(sx, ey);
        }
        if (!rightFilled) {
          pathCtx.moveTo(ex, sy);
          pathCtx.lineTo(ex, ey);
        }
      }
    }
  }

  function selectionMoveNeighborFilled(moveState, localX, localY, originX, originY) {
    if (localX < 0 || localY < 0 || localX >= moveState.width || localY >= moveState.height) {
      return false;
    }
    const localIndex = localY * moveState.width + localX;
    if (moveState.mask[localIndex] !== 1) {
      return false;
    }
    const globalX = originX + localX;
    const globalY = originY + localY;
    if (globalX < 0 || globalY < 0 || globalX >= state.width || globalY >= state.height) {
      return false;
    }
    return true;
  }

  function getPointerPosition(event) {
    const rect = dom.canvases.drawing.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * state.width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * state.height);
    if (x < 0 || y < 0 || x >= state.width || y >= state.height) return null;
    return { x, y };
  }

  function applyBrushStroke(x0, y0, x1, y1) {
    const layer = getActiveLayer();
    if (!layer) return;
    const points = bresenhamLine(x0, y0, x1, y1);
    points.forEach(point => stampBrush(layer, point.x, point.y));
    requestRender();
  }

  function setPixel(layer, x, y) {
    if (x < 0 || y < 0 || x >= state.width || y >= state.height) return;
    if (state.selectionMask && state.selectionMask[y * state.width + x] !== 1) return;
    const index = y * state.width + x;
    const base = index * 4;
    const direct = layer.direct instanceof Uint8ClampedArray ? layer.direct : null;

    if (pointerState.tool === 'eraser') {
      if (layer.indices[index] === -1 && (!direct || direct[base + 3] === 0)) {
        return;
      }
      layer.indices[index] = -1;
      if (direct) {
        direct[base] = 0;
        direct[base + 1] = 0;
        direct[base + 2] = 0;
        direct[base + 3] = 0;
      }
      markHistoryDirty();
      markDirtyPixel(x, y);
      return;
    }

    const paletteIndex = clamp(state.activePaletteIndex, 0, state.palette.length - 1);
    if (layer.indices[index] === paletteIndex) {
      return;
    }
    layer.indices[index] = paletteIndex;
    if (direct) {
      direct[base] = 0;
      direct[base + 1] = 0;
      direct[base + 2] = 0;
      direct[base + 3] = 0;
    }
    markHistoryDirty();
    markDirtyPixel(x, y);
  }

  function getBrushOffsets(size) {
    const base = clamp(Math.round(size || 1), 1, 64);
    let offsets = brushOffsetCache.get(base);
    if (!offsets) {
      const halfDown = Math.floor(base / 2);
      const halfUp = Math.ceil(base / 2);
      offsets = [];
      for (let dy = -halfDown; dy < halfUp; dy += 1) {
        for (let dx = -halfDown; dx < halfUp; dx += 1) {
          offsets.push({ dx, dy });
        }
      }
      brushOffsetCache.set(base, offsets);
    }
    return offsets;
  }

  function forEachBrushOffset(callback, sizeOverride) {
    const baseSize = sizeOverride ?? state.brushSize;
    const offsets = getBrushOffsets(baseSize || 1);
    for (let i = 0; i < offsets.length; i += 1) {
      const { dx, dy } = offsets[i];
      callback(dx, dy);
    }
  }

  function stampBrush(layer, cx, cy) {
    forEachBrushOffset((dx, dy) => setPixel(layer, cx + dx, cy + dy));
  }

  function drawLine(start, end) {
    const layer = getActiveLayer();
    if (!layer) return;
    const points = bresenhamLine(start.x, start.y, end.x, end.y);
    points.forEach(point => stampBrush(layer, point.x, point.y));
    requestRender();
  }

  function drawRectangle(start, end, filled) {
    const layer = getActiveLayer();
    if (!layer) return;
    const x0 = Math.min(start.x, end.x);
    const x1 = Math.max(start.x, end.x);
    const y0 = Math.min(start.y, end.y);
    const y1 = Math.max(start.y, end.y);

    if (filled) {
      for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) {
          stampBrush(layer, x, y);
        }
      }
    } else {
      for (let x = x0; x <= x1; x += 1) {
        stampBrush(layer, x, y0);
        stampBrush(layer, x, y1);
      }
      for (let y = y0; y <= y1; y += 1) {
        stampBrush(layer, x0, y);
        stampBrush(layer, x1, y);
      }
    }
    requestRender();
  }

  function drawEllipse(start, end, filled) {
    const layer = getActiveLayer();
    if (!layer) return;
    const cx = Math.round((start.x + end.x) / 2);
    const cy = Math.round((start.y + end.y) / 2);
    const rx = Math.round(Math.abs(end.x - start.x) / 2);
    const ry = Math.round(Math.abs(end.y - start.y) / 2);
    if (rx === 0 && ry === 0) {
      stampBrush(layer, cx, cy);
      requestRender();
      return;
    }
    drawEllipsePixels(cx, cy, rx, ry, filled, (x, y) => stampBrush(layer, x, y));
    requestRender();
  }

  function drawEllipsePixels(cx, cy, rx, ry, filled, plotPixel) {
    if (rx < 0 || ry < 0) return;
    if (rx === 0 && ry === 0) {
      plotPixel(cx, cy);
      return;
    }
    if (rx === 0) {
      for (let y = cy - ry; y <= cy + ry; y += 1) {
        plotPixel(cx, y);
      }
      return;
    }
    if (ry === 0) {
      for (let x = cx - rx; x <= cx + rx; x += 1) {
        plotPixel(x, cy);
      }
      return;
    }

    const fillRanges = filled ? new Map() : null;
    const rxSq = rx * rx;
    const rySq = ry * ry;
    let x = 0;
    let y = ry;
    let px = 0;
    let py = 2 * rxSq * y;

    const recordFillRange = (yRow, xValue) => {
      if (!fillRanges) return;
      const entry = fillRanges.get(yRow);
      if (entry) {
        entry.min = Math.min(entry.min, xValue);
        entry.max = Math.max(entry.max, xValue);
      } else {
        fillRanges.set(yRow, { min: xValue, max: xValue });
      }
    };

    const plotSymmetric = (offsetX, offsetY) => {
      const coords = [
        { x: cx + offsetX, y: cy + offsetY },
        { x: cx - offsetX, y: cy + offsetY },
        { x: cx + offsetX, y: cy - offsetY },
        { x: cx - offsetX, y: cy - offsetY },
      ];
      coords.forEach(point => {
        plotPixel(point.x, point.y);
        recordFillRange(point.y, point.x);
      });
    };

    let p1 = rySq - (rxSq * ry) + (0.25 * rxSq);
    while (px < py) {
      plotSymmetric(x, y);
      x += 1;
      px += 2 * rySq;
      if (p1 < 0) {
        p1 += rySq + px;
      } else {
        y -= 1;
        py -= 2 * rxSq;
        p1 += rySq + px - py;
      }
    }

    let p2 = (rySq * (x + 0.5) ** 2) + (rxSq * (y - 1) ** 2) - (rxSq * rySq);
    while (y >= 0) {
      plotSymmetric(x, y);
      y -= 1;
      py -= 2 * rxSq;
      if (p2 > 0) {
        p2 += rxSq - py;
      } else {
        x += 1;
        px += 2 * rySq;
        p2 += rxSq - py + px;
      }
    }

    if (fillRanges) {
      fillRanges.forEach((range, row) => {
        for (let col = range.min; col <= range.max; col += 1) {
          plotPixel(col, row);
        }
      });
    }
  }

  function floodFill(x, y) {
    const layer = getActiveLayer();
    if (!layer) return;
    const targetColor = sampleLayerColor(layer, x, y);
    const replacement = { type: 'index', index: state.activePaletteIndex };

    if (colorsEqual(targetColor, replacement)) {
      return;
    }

    const visited = new Uint8Array(state.width * state.height);
    const stack = [[x, y]];

    while (stack.length > 0) {
      const [px, py] = stack.pop();
      if (px < 0 || py < 0 || px >= state.width || py >= state.height) continue;
      const idx = py * state.width + px;
      if (visited[idx]) continue;
      visited[idx] = 1;
      if (state.selectionMask && state.selectionMask[idx] !== 1) continue;
      const current = sampleLayerColor(layer, px, py);
      if (!colorMatches(current, targetColor)) continue;
      setPixel(layer, px, py);
      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }
    requestRender();
  }

  function sampleColor(x, y) {
    const { color, mode, index } = sampleCompositeColor(x, y);
    if (!color) return;
    if (mode === 'index' && typeof index === 'number' && index >= 0) {
      setActivePaletteIndex(index);
    } else {
      const normalized = normalizeColorValue(color);
      const activeIndex = clamp(state.activePaletteIndex, 0, state.palette.length - 1);
      if (state.palette[activeIndex]) {
        Object.assign(state.palette[activeIndex], normalized);
        applyPaletteChange();
        renderPalette();
      }
    }
    state.colorMode = 'index';
    updateColorTabSwatch();
  }

  function sampleCompositeColor(x, y) {
    const layers = getActiveFrame().layers;
    let color = null;
    let mode = 'rgb';
    let index = -1;
    for (let i = layers.length - 1; i >= 0; i -= 1) {
      const layer = layers[i];
      if (!layer.visible) continue;
      const idx = y * state.width + x;
      if (layer.indices[idx] >= 0) {
        color = state.palette[layer.indices[idx]];
        mode = 'index';
        index = layer.indices[idx];
        break;
      }
      const direct = layer.direct instanceof Uint8ClampedArray ? layer.direct : null;
      const base = idx * 4;
      const a = direct ? direct[base + 3] : 0;
      if (a > 0) {
        color = {
          r: direct ? direct[base] : 0,
          g: direct ? direct[base + 1] : 0,
          b: direct ? direct[base + 2] : 0,
          a,
        };
        mode = 'rgb';
        break;
      }
    }
    return { color, mode, index };
  }

  function sampleCompositeColorExcludingLayer(x, y, excludedLayerId) {
    const frame = getActiveFrame();
    if (!frame) {
      return null;
    }
    const idx = y * state.width + x;
    for (let i = frame.layers.length - 1; i >= 0; i -= 1) {
      const layer = frame.layers[i];
      if (!layer.visible || layer.id === excludedLayerId) {
        continue;
      }
      if (layer.indices[idx] >= 0) {
        const paletteColor = state.palette[layer.indices[idx]];
        if (paletteColor) {
          const normalized = normalizeColorValue(paletteColor);
          return normalized;
        }
      }
      const direct = layer.direct instanceof Uint8ClampedArray ? layer.direct : null;
      if (direct) {
        const base = idx * 4;
        const alpha = direct[base + 3];
        if (alpha > 0) {
          return {
            r: direct[base],
            g: direct[base + 1],
            b: direct[base + 2],
            a: alpha,
          };
        }
      }
    }
    return null;
  }

  function sampleLayerColor(layer, x, y) {
    const idx = y * state.width + x;
    if (layer.indices[idx] >= 0) {
      return { type: 'index', index: layer.indices[idx] };
    }
    const direct = layer.direct instanceof Uint8ClampedArray ? layer.direct : null;
    const base = idx * 4;
    return {
      type: 'rgb',
      color: {
        r: direct ? direct[base] : 0,
        g: direct ? direct[base + 1] : 0,
        b: direct ? direct[base + 2] : 0,
        a: direct ? direct[base + 3] : 0,
      },
    };
  }

  function colorsEqual(target, replacement) {
    if (!target || !replacement) return false;
    if (target.type === 'index' && replacement.type === 'index') {
      return target.index === replacement.index;
    }
    if (target.type === 'rgb' && replacement.type === 'direct') {
      const c = replacement.color;
      return target.color.r === c.r && target.color.g === c.g && target.color.b === c.b && target.color.a === c.a;
    }
    return false;
  }

  function colorMatches(target, sample) {
    if (!sample || !target) return false;
    if (sample.type === 'index' && target.type === 'index') {
      return sample.index === target.index;
    }
    if (sample.type === 'rgb' && target.type === 'rgb') {
      return sample.color.r === target.color.r && sample.color.g === target.color.g && sample.color.b === target.color.b && sample.color.a === target.color.a;
    }
    return false;
  }

  function createSelectionRect(start, end) {
    const layer = getActiveLayer();
    if (!layer) {
      clearSelection();
      return;
    }
    const x0 = clamp(Math.min(start.x, end.x), 0, state.width - 1);
    const x1 = clamp(Math.max(start.x, end.x), 0, state.width - 1);
    const y0 = clamp(Math.min(start.y, end.y), 0, state.height - 1);
    const y1 = clamp(Math.max(start.y, end.y), 0, state.height - 1);
    const mask = new Uint8Array(state.width * state.height);
    const bounds = { x0: state.width, y0: state.height, x1: -1, y1: -1 };

    for (let y = y0; y <= y1; y += 1) {
      for (let x = x0; x <= x1; x += 1) {
        if (!layerHasDrawablePixel(layer, x, y)) continue;
        const idx = y * state.width + x;
        mask[idx] = 1;
        if (x < bounds.x0) bounds.x0 = x;
        if (y < bounds.y0) bounds.y0 = y;
        if (x > bounds.x1) bounds.x1 = x;
        if (y > bounds.y1) bounds.y1 = y;
      }
    }

    if (bounds.x0 > bounds.x1 || bounds.y0 > bounds.y1) {
      clearSelection();
      return;
    }

    state.selectionMask = mask;
    state.selectionBounds = bounds;
    requestOverlayRender();
  }

  function createSelectionLasso(points) {
    if (!points || points.length < 3) return;
    const layer = getActiveLayer();
    if (!layer) {
      clearSelection();
      return;
    }
    const mask = new Uint8Array(state.width * state.height);
    const searchBounds = {
      x0: state.width,
      y0: state.height,
      x1: 0,
      y1: 0,
    };
    for (const point of points) {
      searchBounds.x0 = Math.min(searchBounds.x0, point.x);
      searchBounds.y0 = Math.min(searchBounds.y0, point.y);
      searchBounds.x1 = Math.max(searchBounds.x1, point.x);
      searchBounds.y1 = Math.max(searchBounds.y1, point.y);
    }
    searchBounds.x0 = clamp(searchBounds.x0, 0, state.width - 1);
    searchBounds.y0 = clamp(searchBounds.y0, 0, state.height - 1);
    searchBounds.x1 = clamp(searchBounds.x1, 0, state.width - 1);
    searchBounds.y1 = clamp(searchBounds.y1, 0, state.height - 1);

    const selectedBounds = { x0: state.width, y0: state.height, x1: -1, y1: -1 };

    for (let y = searchBounds.y0; y <= searchBounds.y1; y += 1) {
      for (let x = searchBounds.x0; x <= searchBounds.x1; x += 1) {
        if (!pointInPolygon({ x, y }, points)) continue;
        if (!layerHasDrawablePixel(layer, x, y)) continue;
        const idx = y * state.width + x;
        mask[idx] = 1;
        if (x < selectedBounds.x0) selectedBounds.x0 = x;
        if (y < selectedBounds.y0) selectedBounds.y0 = y;
        if (x > selectedBounds.x1) selectedBounds.x1 = x;
        if (y > selectedBounds.y1) selectedBounds.y1 = y;
      }
    }

    if (selectedBounds.x0 > selectedBounds.x1 || selectedBounds.y0 > selectedBounds.y1) {
      clearSelection();
      return;
    }

    state.selectionMask = mask;
    state.selectionBounds = selectedBounds;
    requestOverlayRender();
  }

  function layerHasDrawablePixel(layer, x, y) {
    if (!layer) return false;
    if (x < 0 || y < 0 || x >= state.width || y >= state.height) return false;
    const idx = y * state.width + x;
    if (layer.indices[idx] >= 0) {
      return true;
    }
    const base = idx * 4;
    const direct = layer.direct instanceof Uint8ClampedArray ? layer.direct : null;
    return direct ? direct[base + 3] > 0 : false;
  }

  function createSelectionByColor(x, y) {
    const frame = getActiveFrame();
    const mask = new Uint8Array(state.width * state.height);
    const bounds = { x0: state.width, y0: state.height, x1: 0, y1: 0 };
    const stack = [[x, y]];
    const visited = new Uint8Array(state.width * state.height);
    const target = sampleCompositeColor(x, y);

    while (stack.length > 0) {
      const [px, py] = stack.pop();
      if (px < 0 || py < 0 || px >= state.width || py >= state.height) continue;
      const idx = py * state.width + px;
      if (visited[idx]) continue;
      visited[idx] = 1;
      const sample = sampleCompositeColor(px, py);
      if (!compositeColorMatches(sample, target)) continue;
      mask[idx] = 1;
      bounds.x0 = Math.min(bounds.x0, px);
      bounds.y0 = Math.min(bounds.y0, py);
      bounds.x1 = Math.max(bounds.x1, px);
      bounds.y1 = Math.max(bounds.y1, py);
      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }

    if (bounds.x0 > bounds.x1 || bounds.y0 > bounds.y1) {
      clearSelection();
      return;
    }

    state.selectionMask = mask;
    state.selectionBounds = bounds;
    requestOverlayRender();
  }

  function compositeColorMatches(a, b) {
    if (!a.color || !b.color) return false;
    if (a.mode === 'index' && b.mode === 'index') {
      return a.index === b.index;
    }
    return a.color.r === b.color.r && a.color.g === b.color.g && a.color.b === b.color.b && a.color.a === b.color.a;
  }

  function clearSelection() {
    state.selectionMask = null;
    state.selectionBounds = null;
    requestOverlayRender();
  }

  function renderEverything() {
    requestRender();
  }

  function markDirtyRect(x0, y0, x1, y1) {
    const width = state.width;
    const height = state.height;
    if (width <= 0 || height <= 0) {
      return;
    }
    const left = clamp(Math.floor(Math.min(x0, x1)), 0, width - 1);
    const right = clamp(Math.floor(Math.max(x0, x1)), 0, width - 1);
    const top = clamp(Math.floor(Math.min(y0, y1)), 0, height - 1);
    const bottom = clamp(Math.floor(Math.max(y0, y1)), 0, height - 1);
    if (right < left || bottom < top) {
      return;
    }
    if (!dirtyRegion) {
      dirtyRegion = { x0: left, y0: top, x1: right, y1: bottom };
      return;
    }
    if (left < dirtyRegion.x0) dirtyRegion.x0 = left;
    if (top < dirtyRegion.y0) dirtyRegion.y0 = top;
    if (right > dirtyRegion.x1) dirtyRegion.x1 = right;
    if (bottom > dirtyRegion.y1) dirtyRegion.y1 = bottom;
  }

  function markDirtyPixel(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    const width = state.width;
    const height = state.height;
    if (width <= 0 || height <= 0) {
      return;
    }
    const px = clamp(Math.round(x), 0, width - 1);
    const py = clamp(Math.round(y), 0, height - 1);
    markDirtyRect(px, py, px, py);
  }

  function markCanvasDirty() {
    const width = state.width;
    const height = state.height;
    if (width <= 0 || height <= 0) {
      dirtyRegion = null;
      return;
    }
    dirtyRegion = { x0: 0, y0: 0, x1: width - 1, y1: height - 1 };
  }

  function takeDirtyRegion() {
    if (!dirtyRegion) {
      return null;
    }
    const region = dirtyRegion;
    dirtyRegion = null;
    return region;
  }

  function requestRender() {
    if (!dirtyRegion) {
      markCanvasDirty();
    }
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(() => {
      renderScheduled = false;
      renderCanvas();
      requestOverlayRender();
    });
  }

  function renderCanvas() {
    if (!ctx.drawing) {
      return;
    }
    const { width, height } = state;
    if (width <= 0 || height <= 0) {
      dirtyRegion = null;
      return;
    }
    const pending = takeDirtyRegion();
    if (!pending) {
      return;
    }
    const x0 = clamp(pending.x0, 0, width - 1);
    const y0 = clamp(pending.y0, 0, height - 1);
    const x1 = clamp(pending.x1, 0, width - 1);
    const y1 = clamp(pending.y1, 0, height - 1);
    if (x1 < x0 || y1 < y0) {
      return;
    }
    const regionWidth = x1 - x0 + 1;
    const regionHeight = y1 - y0 + 1;
    const image = ctx.drawing.createImageData(regionWidth, regionHeight);
    const data = image.data;

    const layers = getActiveFrame()?.layers || [];
    const palette = state.palette;
    for (let l = 0; l < layers.length; l += 1) {
      const layer = layers[l];
      if (!layer || !layer.visible || layer.opacity <= 0) continue;
      const opacity = layer.opacity;
      const layerIndices = layer.indices;
      const layerDirect = layer.direct instanceof Uint8ClampedArray ? layer.direct : null;
      for (let py = y0; py <= y1; py += 1) {
        const rowOffset = (py - y0) * regionWidth * 4;
        const layerRow = py * width;
        for (let px = x0; px <= x1; px += 1) {
          const pixelIndex = layerRow + px;
          const paletteIndex = layerIndices[pixelIndex];
          let srcR;
          let srcG;
          let srcB;
          let srcA;
          if (paletteIndex >= 0) {
            const color = palette[paletteIndex];
            if (!color) continue;
            srcR = color.r;
            srcG = color.g;
            srcB = color.b;
            srcA = color.a;
          } else if (layerDirect) {
            const directBase = pixelIndex * 4;
            srcA = layerDirect[directBase + 3];
            if (srcA === 0) continue;
            srcR = layerDirect[directBase];
            srcG = layerDirect[directBase + 1];
            srcB = layerDirect[directBase + 2];
          } else {
            continue;
          }
          const alpha = (srcA / 255) * opacity;
          if (alpha <= 0) continue;
          const destIndex = rowOffset + (px - x0) * 4;
          const dstA = data[destIndex + 3] / 255;
          const outA = alpha + dstA * (1 - alpha);
          if (outA <= 0) {
            data[destIndex] = 0;
            data[destIndex + 1] = 0;
            data[destIndex + 2] = 0;
            data[destIndex + 3] = 0;
            continue;
          }
          const srcFactor = alpha / outA;
          const dstFactor = (dstA * (1 - alpha)) / outA;
          data[destIndex] = Math.round(srcR * srcFactor + data[destIndex] * dstFactor);
          data[destIndex + 1] = Math.round(srcG * srcFactor + data[destIndex + 1] * dstFactor);
          data[destIndex + 2] = Math.round(srcB * srcFactor + data[destIndex + 2] * dstFactor);
          data[destIndex + 3] = Math.round(outA * 255);
        }
      }
    }

    ctx.drawing.putImageData(image, x0, y0);
  }

  function requestOverlayRender() {
    overlayNeedsRedraw = true;
    requestAnimationFrame(timestamp => {
      if (!overlayNeedsRedraw) return;
      overlayNeedsRedraw = false;
      renderOverlay(timestamp);
    });
  }

  function renderOverlay(timestamp) {
    const { width, height } = state;
    const now = Number.isFinite(timestamp) ? timestamp : performance.now();
    if (ctx.overlay) {
      ctx.overlay.clearRect(0, 0, width, height);
    }
    if (ctx.selection) {
      ensureSelectionCanvasResolution(Math.max(Number(state.scale) || MIN_ZOOM_SCALE, MIN_ZOOM_SCALE));
      const selectionCanvas = dom.canvases.selection;
      const clearWidth = selectionCanvas ? selectionCanvas.width : width * state.scale;
      const clearHeight = selectionCanvas ? selectionCanvas.height : height * state.scale;
      ctx.selection.clearRect(0, 0, clearWidth, clearHeight);
    }

    const moveState = pointerState.selectionMove;
    const hasSelectionPreview = Boolean(pointerState.selectionPreview
      && (pointerState.tool === 'selectLasso' || pointerState.tool === 'selectRect'));
    const hasSelectionOutline = Boolean(state.selectionMask)
      || hasSelectionPreview
      || Boolean(moveState && moveState.hasCleared);
    if (hasSelectionOutline) {
      updateSelectionDashAnimation(now);
    } else {
      resetSelectionDashAnimation();
    }
    if (moveState && moveState.hasCleared) {
      drawSelectionMovePreview(moveState);
    } else if (state.selectionMask) {
      drawSelectionOverlay();
    }

    const focusPixel = pointerState.active ? pointerState.current : hoverPixel;
    const activeTool = getActiveTool();
    if (state.showPixelGuides && focusPixel) {
      const overrideSize = activeTool === 'fill' ? 1 : undefined;
      drawBrushPreview(focusPixel, activeTool, overrideSize);
    }

    if (ctx.overlay && !pointerState.active && activeTool === 'fill' && focusPixel) {
      const previewPixels = getFillPreviewPixels(focusPixel.x, focusPixel.y);
      if (previewPixels && previewPixels.length) {
        ctx.overlay.save();
        ctx.overlay.fillStyle = rgbaToCss(getActiveDrawColor());
        previewPixels.forEach(idx => {
          const px = idx % state.width;
          const py = Math.floor(idx / state.width);
          ctx.overlay.fillRect(px, py, 1, 1);
        });
        ctx.overlay.restore();
      }
    }

    if (pointerState.preview && ctx.overlay && (pointerState.tool === 'line' || pointerState.tool === 'rect' || pointerState.tool === 'rectFill' || pointerState.tool === 'ellipse' || pointerState.tool === 'ellipseFill' || pointerState.tool === 'curve')) {
      drawPreviewShape(pointerState);
    }

    if (ctx.overlay && state.tool === 'curve' && curveBuilder) {
      drawCurveGuides(curveBuilder);
    }

    if (pointerState.selectionPreview && pointerState.tool === 'selectLasso') {
      drawLassoPreview(pointerState.selectionPreview.points);
    }

    if (pointerState.selectionPreview && pointerState.tool === 'selectRect') {
      drawRectanglePreview(pointerState.selectionPreview.start, pointerState.selectionPreview.end);
    }

    if (hasSelectionOutline) {
      requestOverlayRender();
    }
  }

  function getBackgroundTileColor(x, y) {
    const tiles = BACKGROUND_TILE_COLORS[state.backgroundMode] || BACKGROUND_TILE_COLORS.dark;
    const tileSize = TRANSPARENT_TILE_SIZE;
    const parity = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) & 1;
    return tiles[parity] || tiles[0];
  }

  function getEraserPreviewColor(x, y) {
    const activeLayer = getActiveLayer();
    if (!activeLayer) {
      return getBackgroundTileColor(x, y);
    }
    const color = sampleCompositeColorExcludingLayer(x, y, activeLayer.id);
    if (color) {
      return color;
    }
    return getBackgroundTileColor(x, y);
  }

  function resolveSampledColor(sample) {
    if (!sample) {
      return null;
    }
    if (sample.mode === 'index') {
      const paletteColor = state.palette[sample.index];
      if (paletteColor) {
        return normalizeColorValue(paletteColor);
      }
      return null;
    }
    if (sample.color) {
      return normalizeColorValue(sample.color);
    }
    return null;
  }

  function getActiveSwatchColor() {
    const paletteColor = state.palette[state.activePaletteIndex];
    if (paletteColor) {
      return normalizeColorValue(paletteColor);
    }
    return { r: 255, g: 255, b: 255, a: 255 };
  }

  function updateColorTabSwatch() {
    const color = getActiveSwatchColor();
    if (!color) return;
    const borderColor = color.a >= 192 ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.75)';
    [dom.colorTabSwatch, dom.mobileColorTabSwatch].forEach(element => {
      if (!element) return;
      applyPixelFrameBackground(element, color, { borderColor });
    });
  }

  function getActiveToolIconNode() {
    if (!toolButtons || !toolButtons.length) {
      return null;
    }
    const activeTool = state.tool;
    const button = toolButtons.find(btn => btn.dataset.tool === activeTool);
    if (!button) {
      return null;
    }
    const icon = button.querySelector('img, svg');
    if (icon) {
      return icon.cloneNode(true);
    }
    return null;
  }

  function updateToolTabIcon() {
    const targets = [dom.toolTabIcon, dom.mobileToolTabIcon].filter(Boolean);
    if (!targets.length) {
      return;
    }
    const activeTool = state.tool;
    const iconNode = getActiveToolIconNode();
    targets.forEach(target => {
      if (!target) return;
      target.innerHTML = '';
      if (iconNode) {
        target.appendChild(iconNode.cloneNode(true));
      } else {
        const span = document.createElement('span');
        span.textContent = TOOL_ICON_FALLBACK[activeTool] || activeTool?.slice(0, 1)?.toUpperCase() || '?';
        span.style.fontSize = '12px';
        span.style.lineHeight = '1';
        span.style.fontWeight = '600';
        target.appendChild(span);
      }
    });
  }

  function drawEyedropperPreview(center, selectionMask) {
    const { width, height } = state;
    if (center.x < 0 || center.y < 0 || center.x >= width || center.y >= height) {
      return;
    }
    const idx = center.y * width + center.x;
    if (selectionMask && selectionMask[idx] !== 1) {
      return;
    }
    const sample = sampleCompositeColor(center.x, center.y);
    let color = resolveSampledColor(sample);
    if (!color) {
      color = getBackgroundTileColor(center.x, center.y);
    }
    ctx.overlay.fillStyle = rgbaToCss(color);
    ctx.overlay.fillRect(center.x, center.y, 1, 1);
    ctx.overlay.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.overlay.lineWidth = 1;
    ctx.overlay.strokeRect(center.x - 0.5, center.y - 0.5, 1, 1);
  }

  function drawBrushPreview(center, tool = getActiveTool(), sizeOverride) {
    if (!center || !ctx.overlay) return;
    const { width, height } = state;
    if (width <= 0 || height <= 0) return;
    const selectionMask = state.selectionMask;
    const size = clamp(Math.round(sizeOverride || state.brushSize || 1), 1, 64);
    if (SELECTION_TOOLS.has(tool)) {
      return;
    }

    ctx.overlay.save();
    if (tool === 'eyedropper') {
      drawEyedropperPreview(center, selectionMask);
      ctx.overlay.restore();
      return;
    }
    if (BRUSH_TOOLS.has(tool)) {
      const penColor = getActiveDrawColor(state.brushOpacity);
      const resolver = tool === 'pen'
        ? () => penColor
        : (x, y) => getEraserPreviewColor(x, y);
      drawFilledPreview(center, size, selectionMask, resolver);
      ctx.overlay.restore();
      return;
    }

    if (FILL_TOOLS.has(tool)) {
      const pixels = getFillPreviewPixels(center.x, center.y);
      if (pixels && pixels.length) {
        const fillColor = rgbaToCss(getActiveDrawColor());
        ctx.overlay.fillStyle = fillColor;
        pixels.forEach(idx => {
          const px = idx % width;
          const py = Math.floor(idx / width);
          ctx.overlay.fillRect(px, py, 1, 1);
        });
        ctx.overlay.restore();
        return;
      }
    }

    const color = getActiveDrawColor();
    ctx.overlay.fillStyle = rgbaToCss(color);
    drawFilledPreview(center, size, selectionMask, () => color);
    ctx.overlay.restore();
  }

  function drawFilledPreview(center, size, selectionMask, colorResolver) {
    const { width, height } = state;
    const halfDown = Math.floor(size / 2);
    const halfUp = Math.ceil(size / 2);
    const minX = clamp(center.x - halfDown, 0, width - 1);
    const maxX = clamp(center.x + halfUp - 1, 0, width - 1);
    const minY = clamp(center.y - halfDown, 0, height - 1);
    const maxY = clamp(center.y + halfUp - 1, 0, height - 1);
    let lastKey = null;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const idx = y * width + x;
        if (selectionMask && selectionMask[idx] !== 1) {
          continue;
        }
        const color = colorResolver ? colorResolver(x, y) : getActiveDrawColor();
        if (!color) continue;
        const key = `${color.r}-${color.g}-${color.b}-${color.a}`;
        if (key !== lastKey) {
          ctx.overlay.fillStyle = rgbaToCss(color);
          lastKey = key;
        }
        ctx.overlay.fillRect(x, y, 1, 1);
      }
    }
  }

  function drawBrushCrosshair(center, size, selectionMask) {
    const { width, height } = state;
    const halfDown = Math.floor(size / 2);
    const halfUp = Math.ceil(size / 2);
    const minX = clamp(center.x - halfDown, 0, width - 1);
    const maxX = clamp(center.x + halfUp - 1, 0, width - 1);
    const minY = clamp(center.y - halfDown, 0, height - 1);
    const maxY = clamp(center.y + halfUp - 1, 0, height - 1);
    const crossY = clamp(center.y, minY, maxY);
    for (let x = minX; x <= maxX; x += 1) {
      const idx = crossY * width + x;
      if (!selectionMask || selectionMask[idx] === 1) {
        ctx.overlay.fillRect(x, crossY, 1, 1);
      }
    }
    const crossX = clamp(center.x, minX, maxX);
    for (let y = minY; y <= maxY; y += 1) {
      const idx = y * width + crossX;
      if (!selectionMask || selectionMask[idx] === 1) {
        ctx.overlay.fillRect(crossX, y, 1, 1);
      }
    }
  }

  function computeFillPreview(x, y) {
    const layer = getActiveLayer();
    if (!layer) return null;
    const width = state.width;
    const height = state.height;
    const selectionMask = state.selectionMask;
    const startIdx = y * width + x;
    if (selectionMask && selectionMask[startIdx] !== 1) {
      return [];
    }
    const targetColor = sampleLayerColor(layer, x, y);
    const replacement = { type: 'index', index: state.activePaletteIndex };
    if (colorsEqual(targetColor, replacement)) {
      return [];
    }
    const visited = new Uint8Array(width * height);
    const stack = [[x, y]];
    const pixels = [];
    while (stack.length > 0) {
      const [px, py] = stack.pop();
      if (px < 0 || py < 0 || px >= width || py >= height) continue;
      const idx = py * width + px;
      if (visited[idx]) continue;
      visited[idx] = 1;
      if (selectionMask && selectionMask[idx] !== 1) continue;
      const current = sampleLayerColor(layer, px, py);
      if (!colorMatches(current, targetColor)) continue;
      pixels.push(idx);
      stack.push([px + 1, py]);
      stack.push([px - 1, py]);
      stack.push([px, py + 1]);
      stack.push([px, py - 1]);
    }
    return pixels;
  }

  function getFillPreviewKey(x, y) {
    const frame = getActiveFrame();
    const layer = getActiveLayer();
    if (!frame || !layer) return null;
    const colorKey = `index-${state.activePaletteIndex}-${JSON.stringify(state.palette[state.activePaletteIndex] || {})}`;
    return `${frame.id}|${layer.id}|${state.width}x${state.height}|${x},${y}|${colorKey}`;
  }

  function getFillPreviewPixels(x, y) {
    if (state.selectionMask) {
      return computeFillPreview(x, y);
    }
    const key = getFillPreviewKey(x, y);
    if (key && fillPreviewCache.key === key) {
      return fillPreviewCache.pixels;
    }
    const pixels = computeFillPreview(x, y);
    if (key) {
      fillPreviewCache.key = key;
      fillPreviewCache.pixels = pixels;
    }
    return pixels;
  }

  function drawSelectionOverlay() {
    const mask = state.selectionMask;
    if (!mask) return;
    const { width, height } = state;
    strokeSelectionPath((pathCtx, scale) => {
      traceSelectionOutline(pathCtx, mask, width, height, scale);
    }, { translateHalf: true });
  }

  function updateSelectionDashAnimation(timestamp) {
    if (!Number.isFinite(timestamp)) {
      timestamp = performance.now();
    }
    if (!lastSelectionDashTime) {
      lastSelectionDashTime = timestamp;
      return;
    }
    const delta = Math.max(0, timestamp - lastSelectionDashTime);
    lastSelectionDashTime = timestamp;
    if (delta === 0) return;
    const advance = (delta / 1000) * SELECTION_DASH_SPEED;
    selectionDashScreenOffset = (selectionDashScreenOffset + advance) % 1024;
  }

  function resetSelectionDashAnimation() {
    selectionDashScreenOffset = 0;
    lastSelectionDashTime = 0;
  }

  function ensureSelectionCanvasResolution(scale) {
    const canvas = dom.canvases.selection;
    if (!canvas) return;
    const desiredWidth = state.width * scale;
    const desiredHeight = state.height * scale;
    if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
      canvas.width = desiredWidth;
      canvas.height = desiredHeight;
      if (ctx.selection) {
        ctx.selection.imageSmoothingEnabled = false;
      }
    }
    const cssWidth = `${desiredWidth}px`;
    const cssHeight = `${desiredHeight}px`;
    if (canvas.style.width !== cssWidth) {
      canvas.style.width = cssWidth;
    }
    if (canvas.style.height !== cssHeight) {
      canvas.style.height = cssHeight;
    }
  }

  function strokeSelectionPath(trace, options = {}) {
    if (typeof trace !== 'function') return;
    const targetCtx = ctx.selection;
    if (!targetCtx || typeof targetCtx.setLineDash !== 'function') {
      return;
    }
    const scale = Math.max(Number(state.scale) || MIN_ZOOM_SCALE, MIN_ZOOM_SCALE);
    ensureSelectionCanvasResolution(scale);
    const lineWidth = 1;
    const dashPattern = options.dashPattern || [4, 4];
    const dashCycle = dashPattern.reduce((sum, value) => sum + value, 0) || 8;
    const dashOffset = ((selectionDashScreenOffset) % dashCycle + dashCycle) % dashCycle;

    targetCtx.save();
    if (options.translateHalf) {
      targetCtx.translate(0.5, 0.5);
    }
    targetCtx.lineWidth = lineWidth;
    targetCtx.setLineDash(dashPattern);
    targetCtx.lineJoin = 'miter';
    targetCtx.lineCap = 'butt';

    targetCtx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    targetCtx.lineDashOffset = dashOffset;
    targetCtx.beginPath();
    trace(targetCtx, scale);
    targetCtx.stroke();

    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    targetCtx.lineDashOffset = (dashOffset + dashPattern[0]) % dashCycle;
    targetCtx.beginPath();
    trace(targetCtx, scale);
    targetCtx.stroke();

    targetCtx.restore();
  }

  function traceSelectionOutline(pathCtx, mask, width, height, scale) {
    for (let y = 0; y < height; y += 1) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x += 1) {
        const idx = rowOffset + x;
        if (mask[idx] !== 1) continue;
        const topFilled = y > 0 && mask[idx - width] === 1;
        const bottomFilled = y < height - 1 && mask[idx + width] === 1;
        const leftFilled = x > 0 && mask[idx - 1] === 1;
        const rightFilled = x < width - 1 && mask[idx + 1] === 1;

        const sx = x * scale;
        const sy = y * scale;
        const ex = sx + scale;
        const ey = sy + scale;

        if (!topFilled) {
          pathCtx.moveTo(sx, sy);
          pathCtx.lineTo(ex, sy);
        }
        if (!bottomFilled) {
          pathCtx.moveTo(sx, ey);
          pathCtx.lineTo(ex, ey);
        }
        if (!leftFilled) {
          pathCtx.moveTo(sx, sy);
          pathCtx.lineTo(sx, ey);
        }
        if (!rightFilled) {
          pathCtx.moveTo(ex, sy);
          pathCtx.lineTo(ex, ey);
        }
      }
    }
  }

  function drawPreviewShape(previewState) {
    const tool = pointerState.tool || state.tool;
    const preview = previewState.preview;
    if (!preview) return;
    const { start, end, points } = preview;
    if (!start || !end) return;
    const width = state.width;
    const height = state.height;
    const selectionMask = state.selectionMask;
    const color = getActiveDrawColor();
    ctx.overlay.save();
    ctx.overlay.fillStyle = rgbaToCss(color);
    const stamp = (x, y) => {
      forEachBrushOffset((dx, dy) => {
        const px = x + dx;
        const py = y + dy;
        if (px < 0 || py < 0 || px >= width || py >= height) {
          return;
        }
        if (selectionMask && selectionMask[py * width + px] !== 1) {
          return;
        }
        ctx.overlay.fillRect(px, py, 1, 1);
      });
    };

    if (tool === 'line' || tool === 'curve') {
      const linePoints = bresenhamLine(start.x, start.y, end.x, end.y);
      linePoints.forEach(pt => stamp(pt.x, pt.y));
    } else if (tool === 'rect' || tool === 'rectFill') {
      const x0 = Math.min(start.x, end.x);
      const x1 = Math.max(start.x, end.x);
      const y0 = Math.min(start.y, end.y);
      const y1 = Math.max(start.y, end.y);
      if (tool === 'rectFill') {
        for (let y = y0; y <= y1; y += 1) {
          for (let x = x0; x <= x1; x += 1) {
            stamp(x, y);
          }
        }
      } else {
        for (let x = x0; x <= x1; x += 1) {
          stamp(x, y0);
          stamp(x, y1);
        }
        for (let y = y0; y <= y1; y += 1) {
          stamp(x0, y);
          stamp(x1, y);
        }
      }
    } else if (tool === 'ellipse' || tool === 'ellipseFill') {
      const cx = Math.round((start.x + end.x) / 2);
      const cy = Math.round((start.y + end.y) / 2);
      const rx = Math.round(Math.abs(end.x - start.x) / 2);
      const ry = Math.round(Math.abs(end.y - start.y) / 2);
      const filled = tool === 'ellipseFill';
      drawEllipsePixels(cx, cy, rx, ry, filled, (x, y) => stamp(x, y));
    }

    ctx.overlay.restore();
  }

  function drawLassoPreview(points) {
    if (!points || points.length < 2) return;
    strokeSelectionPath((pathCtx, scale) => {
      pathCtx.moveTo(points[0].x * scale, points[0].y * scale);
      for (let i = 1; i < points.length; i += 1) {
        const point = points[i];
        pathCtx.lineTo(point.x * scale, point.y * scale);
      }
      pathCtx.closePath();
    }, { translateHalf: true });
  }

  function drawRectanglePreview(start, end) {
    if (!start || !end) return;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x) + 1;
    const h = Math.abs(end.y - start.y) + 1;
    strokeSelectionPath((pathCtx, scale) => {
      pathCtx.rect(x * scale, y * scale, w * scale, h * scale);
    }, { translateHalf: true });
  }

  function blendColors(target, source, opacity) {
    const srcA = (source.a / 255) * opacity;
    const dstA = target.a / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA === 0) {
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    const blendChannel = (dst, src) => Math.round(((src * srcA) + dst * dstA * (1 - srcA)) / outA);
    return {
      r: blendChannel(target.r, source.r),
      g: blendChannel(target.g, source.g),
      b: blendChannel(target.b, source.b),
      a: Math.round(outA * 255),
    };
  }

  function getActiveFrame() {
    return state.frames[state.activeFrame];
  }

  function getActiveLayer() {
    const frame = getActiveFrame();
    return frame.layers.find(layer => layer.id === state.activeLayer) || frame.layers[frame.layers.length - 1];
  }

  function getActiveLayerIndex() {
    const frame = getActiveFrame();
    return frame.layers.findIndex(layer => layer.id === state.activeLayer);
  }

  function bresenhamLine(x0, y0, x1, y1) {
    const points = [];
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    while (true) {
      points.push({ x, y });
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y += sy;
      }
    }
    return points;
  }

  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 0.00001) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function scheduleSessionPersist() {
    scheduleAutosaveSnapshot();
    if (!canUseSessionStorage) return;
    if (sessionPersistHandle !== null) return;
    sessionPersistHandle = window.setTimeout(() => {
      sessionPersistHandle = null;
      persistSessionState();
    }, 120);
  }

  function persistSessionState() {
    if (!canUseSessionStorage) return;
    try {
      const snapshot = {
        scale: normalizeZoomScale(state.scale, MIN_ZOOM_SCALE),
        pan: {
          x: Math.round(Number(state.pan?.x) || 0),
          y: Math.round(Number(state.pan?.y) || 0),
        },
        tool: state.tool,
        brushSize: clamp(Math.round(state.brushSize || 1), 1, 32),
        brushOpacity: clamp(Number(state.brushOpacity ?? 1), 0, 1),
        showGrid: Boolean(state.showGrid),
        gridScreenStep: clamp(Math.round(state.gridScreenStep || 16), 1, 256),
        showMajorGrid: Boolean(state.showMajorGrid),
        majorGridSpacing: clamp(Math.round(state.majorGridSpacing || 16), 2, 512),
        showPixelGuides: Boolean(state.showPixelGuides),
        showChecker: Boolean(state.showChecker),
        activeFrame: clamp(Number(state.activeFrame) || 0, 0, state.frames.length - 1),
        activeLayer: state.activeLayer,
        paletteIndex: clamp(Number(state.activePaletteIndex) || 0, 0, state.palette.length - 1),
        colorMode: state.colorMode,
        leftTab: state.activeLeftTab,
        rightTab: state.activeRightTab,
        backgroundMode: state.backgroundMode,
        toolGroup: state.activeToolGroup,
        lastGroupTool: { ...(state.lastGroupTool || DEFAULT_GROUP_TOOL) },
        documentName: state.documentName,
      };
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      // Ignore storage errors (private mode or quota exceeded)
    }
  }

  function restoreSessionState() {
    if (!canUseSessionStorage) return;
    let payload;
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      payload = JSON.parse(raw);
    } catch (error) {
      return;
    }
    if (!payload || typeof payload !== 'object') {
      return;
    }

    if (Number.isFinite(payload.scale)) {
      state.scale = normalizeZoomScale(payload.scale, state.scale || MIN_ZOOM_SCALE);
    }
    if (payload.pan && Number.isFinite(payload.pan.x) && Number.isFinite(payload.pan.y)) {
      state.pan.x = Math.round(payload.pan.x);
      state.pan.y = Math.round(payload.pan.y);
    }
    if (typeof payload.tool === 'string') {
      state.tool = payload.tool;
    }
    if (Number.isFinite(payload.brushSize)) {
      state.brushSize = clamp(Math.round(payload.brushSize), 1, 32);
    }
    if (Number.isFinite(payload.brushOpacity)) {
      state.brushOpacity = clamp(payload.brushOpacity, 0, 1);
    }
    if (typeof payload.showGrid === 'boolean') {
      state.showGrid = payload.showGrid;
    }
    if (Number.isFinite(payload.gridScreenStep)) {
      state.gridScreenStep = clamp(Math.round(payload.gridScreenStep), 1, 256);
    }
    if (typeof payload.showMajorGrid === 'boolean') {
      state.showMajorGrid = payload.showMajorGrid;
    }
    if (Number.isFinite(payload.majorGridSpacing)) {
      state.majorGridSpacing = clamp(Math.round(payload.majorGridSpacing), 2, 512);
    }
    if (payload.backgroundMode === 'light' || payload.backgroundMode === 'dark' || payload.backgroundMode === 'pink') {
      state.backgroundMode = payload.backgroundMode;
    }
    if (payload.toolGroup && TOOL_GROUPS[payload.toolGroup]) {
      state.activeToolGroup = payload.toolGroup;
    }
    if (payload.lastGroupTool && typeof payload.lastGroupTool === 'object') {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL, ...payload.lastGroupTool };
    }
    if (payload.leftTab && LEFT_TAB_KEYS.includes(payload.leftTab)) {
      state.activeLeftTab = payload.leftTab;
    }
    if (payload.rightTab && RIGHT_TAB_KEYS.includes(payload.rightTab)) {
      state.activeRightTab = payload.rightTab;
    }
    if (typeof payload.showPixelGuides === 'boolean') {
      state.showPixelGuides = payload.showPixelGuides;
    }
    if (typeof payload.showChecker === 'boolean') {
      state.showChecker = payload.showChecker;
    }
    state.colorMode = 'index';
    if (Number.isFinite(payload.paletteIndex)) {
      state.activePaletteIndex = clamp(Math.round(payload.paletteIndex), 0, state.palette.length - 1);
    }
    if (Number.isFinite(payload.activeFrame)) {
      state.activeFrame = clamp(Math.round(payload.activeFrame), 0, state.frames.length - 1);
    }
    const frame = state.frames[state.activeFrame];
    if (frame && frame.layers && frame.layers.length) {
      const preferredLayer = typeof payload.activeLayer === 'string' ? payload.activeLayer : null;
      const fallbackLayer = frame.layers.find(layer => layer.id === preferredLayer);
      state.activeLayer = fallbackLayer ? fallbackLayer.id : frame.layers[frame.layers.length - 1].id;
    }
    if (!state.lastGroupTool) {
      state.lastGroupTool = { ...DEFAULT_GROUP_TOOL };
    }
    state.activeToolGroup = state.activeToolGroup || TOOL_TO_GROUP[state.tool] || 'pen';
    if (typeof payload.documentName === 'string') {
      state.documentName = normalizeDocumentName(payload.documentName);
    }
  }

  function rgbaToHex({ r, g, b, a }) {
    const toHex = value => value.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function rgbaToCss({ r, g, b, a }) {
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  }

  function toCssColor(value) {
    if (typeof value === 'string') {
      return value;
    }
    if (value && typeof value === 'object') {
      const { r = 0, g = 0, b = 0, a = 255 } = value;
      return rgbaToCss({ r, g, b, a });
    }
    return 'rgba(0, 0, 0, 0)';
  }

  function createPixelFrameImage(color, { borderColor = '#C8C8C8' } = {}) {
    const colorCss = toCssColor(color);
    const borderCss = toCssColor(borderColor);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='21' height='21' shape-rendering='crispEdges'>` +
      `<rect x='1' y='0' width='19' height='1' fill='${borderCss}' />` +
      `<rect x='0' y='1' width='2' height='1' fill='${borderCss}' />` +
      `<rect x='2' y='1' width='17' height='19' fill='${colorCss}' />` +
      `<rect x='19' y='1' width='2' height='1' fill='${borderCss}' />` +
      `<rect x='0' y='2' width='1' height='18' fill='${borderCss}' />` +
      `<rect x='1' y='2' width='1' height='17' fill='${colorCss}' />` +
      `<rect x='19' y='2' width='1' height='17' fill='${colorCss}' />` +
      `<rect x='20' y='2' width='1' height='18' fill='${borderCss}' />` +
      `<rect x='1' y='19' width='1' height='2' fill='${borderCss}' />` +
      `<rect x='19' y='19' width='1' height='2' fill='${borderCss}' />` +
      `<rect x='2' y='20' width='17' height='1' fill='${borderCss}' />` +
      `</svg>`;
    const encoded = encodeURIComponent(svg)
      .replace(/%0A/g, '')
      .replace(/%09/g, '');
    return `url("data:image/svg+xml,${encoded}")`;
  }

  function applyPixelFrameBackground(element, color, options = {}) {
    if (!element) return;
    element.classList.add('pixel-frame');
    element.style.setProperty('--pixel-frame-image', createPixelFrameImage(color, options));
  }

  window.pixelFrameUtils = Object.freeze({
    createImage: createPixelFrameImage,
    applyBackground: applyPixelFrameBackground,
    toCssColor,
  });

  function rgbaToHsv({ r, g, b }) {
    const rn = clamp(r, 0, 255) / 255;
    const gn = clamp(g, 0, 255) / 255;
    const bn = clamp(b, 0, 255) / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    let h = 0;
    if (delta !== 0) {
      if (max === rn) {
        h = ((gn - bn) / delta) % 6;
      } else if (max === gn) {
        h = (bn - rn) / delta + 2;
      } else {
        h = (rn - gn) / delta + 4;
      }
      h *= 60;
      if (h < 0) h += 360;
    }
    const s = max === 0 ? 0 : delta / max;
    const v = max;
    return { h, s, v };
  }

  function hsvToRgba(h, s, v) {
    const hue = ((h % 360) + 360) % 360;
    const saturation = clamp(s, 0, 1);
    const value = clamp(v, 0, 1);
    const c = value * saturation;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = value - c;
    let rp = 0;
    let gp = 0;
    let bp = 0;
    if (hue < 60) {
      rp = c;
      gp = x;
    } else if (hue < 120) {
      rp = x;
      gp = c;
    } else if (hue < 180) {
      gp = c;
      bp = x;
    } else if (hue < 240) {
      gp = x;
      bp = c;
    } else if (hue < 300) {
      rp = x;
      bp = c;
    } else {
      rp = c;
      bp = x;
    }
    const r = Math.round((rp + m) * 255);
    const g = Math.round((gp + m) * 255);
    const b = Math.round((bp + m) * 255);
    return { r, g, b, a: 255 };
  }

  function getActiveDrawColor(opacityOverride) {
    const previewTool = pointerState.tool || state.tool;
    let baseColor;
    if (previewTool === 'eraser') {
      baseColor = { r: 255, g: 255, b: 255, a: 255 };
    } else {
      baseColor = state.palette[state.activePaletteIndex];
    }
    if (!baseColor) {
      baseColor = { r: 255, g: 255, b: 255, a: 255 };
    }
    const color = {
      r: baseColor.r ?? 255,
      g: baseColor.g ?? 255,
      b: baseColor.b ?? 255,
      a: baseColor.a ?? 255,
    };
    if (color.a <= 0) {
      color.a = 255;
    }
    if (typeof opacityOverride === 'number') {
      const clamped = clamp(opacityOverride, 0, 1);
      color.a = Math.round(clamped * 255);
    }
    return color;
  }

  function hexToRgba(value) {
    if (!value || value[0] !== '#') return null;
    const hex = value.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b, a: 255 };
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b, a: 255 };
    }
    return null;
  }

  function getZoomStepIndex(scale) {
    if (!Number.isFinite(scale)) {
      return 0;
    }
    let bestIndex = 0;
    let bestDiff = Number.POSITIVE_INFINITY;
    for (let i = 0; i < ZOOM_STEPS.length; i += 1) {
      const diff = Math.abs(ZOOM_STEPS[i] - scale);
      if (diff < bestDiff - ZOOM_EPSILON) {
        bestDiff = diff;
        bestIndex = i;
      }
    }
    return bestIndex;
  }

  function getZoomScaleAtIndex(index) {
    const numeric = Number(index);
    const clampedIndex = Math.min(Math.max(Number.isFinite(numeric) ? Math.round(numeric) : 0, 0), ZOOM_STEPS.length - 1);
    return ZOOM_STEPS[clampedIndex];
  }

  function normalizeZoomScale(value, fallback = MIN_ZOOM_SCALE) {
    const base = Number.isFinite(value) ? Number(value) : Number(fallback);
    const effective = Number.isFinite(base) ? base : MIN_ZOOM_SCALE;
    return ZOOM_STEPS[getZoomStepIndex(effective)];
  }

  function formatZoomLabel(scale) {
    const percent = normalizeZoomScale(scale, MIN_ZOOM_SCALE) * 100;
    const roundedTenth = Math.round(percent * 10) / 10;
    const isWhole = Math.abs(roundedTenth - Math.round(roundedTenth)) < 0.05;
    const value = isWhole ? Math.round(roundedTenth) : Number(roundedTenth.toFixed(1));
    return `${value}%`;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function debounce(fn, wait) {
    let handle;
    return (...args) => {
      clearTimeout(handle);
      handle = setTimeout(() => fn(...args), wait);
    };
  }

  init();
})();
