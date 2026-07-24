const STORAGE_KEY = "xhs-poster-studio:v1";
const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1440;
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MIN_MAIN_SIZE = 60;
const MAX_MAIN_SIZE = 210;
const MAIN_SIZE_STEP = 2;
const CARD_WIDTH_PERCENT = 84;
const CARD_HEIGHT_PERCENT = 88;
const CARD_CORNER_RADIUS = 52;
const MIN_PHOTO_FRAME_WIDTH = 220;
const MIN_PHOTO_FRAME_HEIGHT = 180;
const LEGACY_PHOTO_MODULE_OFFSET = -48;
const MAX_HISTORY_COVERS = 8;
const CENTER_SNAP_SCREEN_PX = 12;
const CENTER_GUIDE_LINGER_MS = 1200;
const VALID_NOTE_TYPES = ["experience", "tutorial", "product", "deepDive"];

const photoLayoutPresets = Object.freeze({
  editorial: {
    photoFrameX: 150,
    photoFrameY: 878,
    photoFrameWidth: 780,
    photoFrameHeight: 340,
  },
  album: {
    photoFrameX: 200,
    photoFrameY: 220,
    photoFrameWidth: 680,
    photoFrameHeight: 680,
  },
  deepDive: {
    photoFrameX: 106,
    photoFrameY: 106,
    photoFrameWidth: 868,
    photoFrameHeight: 570,
  },
});

const defaults = Object.freeze({
  noteType: "experience",
  styleCustomized: false,
  topLeft: "FIELD NOTES",
  topRight: "#05",
  upperText: "50+ 次迭代复盘",
  // 默认使用两行，兼顾文字海报与专辑焦点版的信息流识别度。
  titleText: "Codex 远程\n到底稳不稳？",
  subtitleText: "我的 iOS 端远程解决方案",
  footerText: "",
  footerAlign: "center",
  backgroundColor: "#173027",
  cardColor: "#F0E6CF",
  textColor: "#19352B",
  visualColor: "#D8D6E2",
  fontFamily: "grotesk",
  titleFontFamily: "grotesk",
  mainSize: 190,
  mainSizePreference: 190,
  upperSize: 38,
  subtitleSize: 42,
  groupGap: 74,
  verticalOffset: 0,
  // 卡片外轮廓是账号视觉识别的一部分，固定宽高与圆角，不允许逐篇改变。
  cardWidth: CARD_WIDTH_PERCENT,
  cardHeight: CARD_HEIGHT_PERCENT,
  cornerRadius: CARD_CORNER_RADIUS,
  sidePadding: 64,
  photoLayout: "editorial",
  photoEditMode: "frame",
  photoFocusX: 50,
  photoFocusY: 50,
  ...photoLayoutPresets.editorial,
});

const themes = {
  // 每套只使用外层、卡片、文字三种颜色，保证主标题层级稳定，切换预设不改变排版。
  codex: {
    backgroundColor: "#071F20",
    cardColor: "#F2552C",
    textColor: "#081C1C",
  },
  midnight: {
    backgroundColor: "#0E1733",
    cardColor: "#A9C4F5",
    textColor: "#111A38",
  },
  ivory: {
    backgroundColor: "#173027",
    cardColor: "#F0E6CF",
    textColor: "#19352B",
  },
  mustard: {
    backgroundColor: "#1B1A17",
    cardColor: "#E1B84B",
    textColor: "#1C1A14",
  },
  burgundy: {
    backgroundColor: "#2D161B",
    cardColor: "#D8B5A3",
    textColor: "#35191F",
  },
  plumButter: {
    backgroundColor: "#24182F",
    cardColor: "#F0D56A",
    textColor: "#261B30",
  },
  cobaltPeach: {
    backgroundColor: "#17254B",
    cardColor: "#F0B39A",
    textColor: "#19264A",
  },
  cocoaSky: {
    backgroundColor: "#2A1D20",
    cardColor: "#BFD8EC",
    textColor: "#271C1F",
  },
  // 由参考图与 ImageGen 色彩稿收敛：青色方案使用深色文字，保持小图列表中的标题识别度。
  electricCyan: {
    backgroundColor: "#031B20",
    cardColor: "#42CCD4",
    textColor: "#041A1D",
  },
  // 高饱和蓝底反用冰白文字，避免小字号信息在蓝色上发灰。
  signalBlue: {
    backgroundColor: "#07152D",
    cardColor: "#0867D9",
    textColor: "#F5F7FF",
  },
  paperBlack: {
    backgroundColor: "#E6E0D5",
    cardColor: "#FAF7F0",
    textColor: "#171B1A",
  },
  forestSage: {
    backgroundColor: "#142923",
    cardColor: "#BFD6C4",
    textColor: "#142923",
  },
  plumRose: {
    backgroundColor: "#2B1B29",
    cardColor: "#E5BBCD",
    textColor: "#2E1B29",
  },
  inkMint: {
    backgroundColor: "#072826",
    cardColor: "#93D9C1",
    textColor: "#0A2A26",
  },
  graphiteSilver: {
    backgroundColor: "#1D232B",
    cardColor: "#CDD3DA",
    textColor: "#202730",
  },
  coffeeCream: {
    backgroundColor: "#2A211C",
    cardColor: "#E8D8C2",
    textColor: "#30241E",
  },
};

const fontStacks = {
  system:
    '"Helvetica Neue", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", Arial, sans-serif',
  grotesk: 'Arial, "Helvetica Neue", "PingFang SC", "Noto Sans CJK SC", sans-serif',
  rounded:
    '"Arial Rounded MT Bold", "SF Pro Rounded", "PingFang SC", "Noto Sans CJK SC", sans-serif',
  // 自带字体强调成年人日常书写感；加载失败时宁可回退系统黑体，也不伪装成书法或卡通字体。
  handwritten: '"Yozai", "PingFang SC", "Microsoft YaHei", sans-serif',
  serif:
    '"Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", Georgia, serif',
};

const fontPresets = Object.freeze({
  system: {
    label: "标准黑体",
    fontFamily: "system",
    titleFontFamily: "system",
  },
  grotesk: {
    label: "现代黑体",
    fontFamily: "grotesk",
    titleFontFamily: "grotesk",
  },
  rounded: {
    label: "圆润标题",
    fontFamily: "system",
    titleFontFamily: "rounded",
  },
  handwritten: {
    label: "自然手写",
    fontFamily: "handwritten",
    titleFontFamily: "handwritten",
  },
  editorial: {
    label: "编辑衬线",
    fontFamily: "grotesk",
    titleFontFamily: "serif",
  },
});

const noteTypePresets = Object.freeze({
  experience: {
    label: "经验 / 观点",
    description: "纯文字 · 日常主力",
    backgroundColor: "#173027",
    cardColor: "#F0E6CF",
    textColor: "#19352B",
    visualColor: "#D8D6E2",
    fontFamily: "grotesk",
    titleFontFamily: "grotesk",
    mainSize: 190,
    upperSize: 38,
    subtitleSize: 42,
    groupGap: 74,
    verticalOffset: 0,
    sidePadding: 64,
    footerAlign: "center",
    photoLayout: "editorial",
  },
  tutorial: {
    label: "教程 / 清单",
    description: "步骤证据 · 收藏导向",
    backgroundColor: "#0E1733",
    cardColor: "#A9C4F5",
    textColor: "#111A38",
    visualColor: "#111A38",
    fontFamily: "grotesk",
    titleFontFamily: "grotesk",
    mainSize: 176,
    upperSize: 36,
    subtitleSize: 38,
    groupGap: 58,
    verticalOffset: 0,
    sidePadding: 64,
    footerAlign: "center",
    photoLayout: "editorial",
  },
  product: {
    label: "产品 / 实测",
    description: "大图优先 · 重点内容",
    backgroundColor: "#071F20",
    cardColor: "#F2552C",
    textColor: "#081C1C",
    visualColor: "#081C1C",
    fontFamily: "grotesk",
    titleFontFamily: "grotesk",
    mainSize: 190,
    upperSize: 38,
    subtitleSize: 42,
    groupGap: 60,
    verticalOffset: 0,
    sidePadding: 64,
    footerAlign: "center",
    photoLayout: "album",
  },
  deepDive: {
    label: "深度文章",
    description: "编辑博客 · 专题复盘",
    backgroundColor: "#173027",
    cardColor: "#F0E6CF",
    textColor: "#19352B",
    visualColor: "#D8D6E2",
    fontFamily: "grotesk",
    titleFontFamily: "serif",
    mainSize: 150,
    upperSize: 36,
    subtitleSize: 38,
    groupGap: 44,
    verticalOffset: 0,
    sidePadding: 64,
    footerAlign: "left",
    photoLayout: "deepDive",
  },
});

const canvas = document.querySelector("#posterCanvas");
const context = canvas.getContext("2d");
const feedPosterCanvas = document.querySelector("#feedPosterCanvas");
const feedPosterContext = feedPosterCanvas.getContext("2d");
const feedPosterTitle = document.querySelector("#feedPosterTitle");
const ratioBadge = document.querySelector("#ratioBadge");
const toast = document.querySelector("#toast");
const downloadButton = document.querySelector("#downloadButton");
const resetButton = document.querySelector("#resetButton");
const photoInput = document.querySelector("#photoInput");
const photoStatus = document.querySelector("#photoStatus");
const photoTransformControls = document.querySelector("#photoTransformControls");
const photoGeometryStatus = document.querySelector("#photoGeometryStatus");
const photoTransformOverlay = document.querySelector("#photoTransformOverlay");
const photoTransformLabel = document.querySelector("#photoTransformLabel");
const photoAlignmentGuides = document.querySelector("#photoAlignmentGuides");
const photoAlignmentLabel = document.querySelector("#photoAlignmentLabel");
const photoTransformHelp = document.querySelector("#photoTransformHelp");
const resetPhotoFrameButton = document.querySelector("#resetPhotoFrameButton");
const removePhotoButton = document.querySelector("#removePhotoButton");
const customStyleControls = document.querySelector("#customStyleControls");
const customStyleButton = document.querySelector("#customStyleButton");
const styleStatus = document.querySelector("#styleStatus");
const styleDescription = document.querySelector("#styleDescription");
const photoLayoutPicker = document.querySelector("#photoLayoutPicker");
const photoPresetHint = document.querySelector("#photoPresetHint");
const historyCoverInput = document.querySelector("#historyCoverInput");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const historyStatus = document.querySelector("#historyStatus");
const historyFeedGrid = document.querySelector("#historyFeedGrid");
const historyEmptyState = document.querySelector("#historyEmptyState");

let state = loadState();
let renderFrame = 0;
let toastTimer = 0;
let uploadedPhoto = null;
let uploadedPhotoUrl = "";
let handwrittenFontPromise;
let photoGesture = null;
let alignmentGuideTimer = 0;
// 即使从旧版本迁移了自定义值，也默认收起高级项，避免生成页再次变成控制台。
let customStyleOpen = false;
let historyCovers = [];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const validSaved = saved && typeof saved === "object" ? saved : {};
    const merged = { ...defaults, ...validSaved };
    const hasSavedState = Object.keys(validSaved).length > 0;
    if (!VALID_NOTE_TYPES.includes(merged.noteType)) {
      merged.noteType = defaults.noteType;
    }
    // 旧版本没有笔记类型概念：保留用户原有视觉值，并标记为基于经验预设的自定义样式。
    if (hasSavedState && !Object.prototype.hasOwnProperty.call(validSaved, "noteType")) {
      merged.noteType = "experience";
      merged.styleCustomized = true;
    }
    // 未做过单篇样式覆盖时，始终跟随类型的推荐字体；用户主动选过的字体继续保留。
    if (!merged.styleCustomized) {
      merged.fontFamily = noteTypePresets[merged.noteType].fontFamily;
      merged.titleFontFamily = noteTypePresets[merged.noteType].titleFontFamily;
    }
    if (!["system", "grotesk", "rounded", "handwritten", "serif"].includes(merged.titleFontFamily)) {
      merged.titleFontFamily = noteTypePresets[merged.noteType].titleFontFamily;
    }
    merged.visualColor =
      normalizeHex(merged.visualColor) || noteTypePresets[merged.noteType].visualColor;
    // 兼容旧版状态：首次升级时把用户原有字号作为偏好值，不强行恢复默认字号。
    if (!Object.prototype.hasOwnProperty.call(validSaved, "mainSizePreference")) {
      merged.mainSizePreference = merged.mainSize;
    }
    if (!Object.prototype.hasOwnProperty.call(validSaved, "photoFocusY")) {
      merged.photoFocusY = Number.isFinite(Number(validSaved.photoPosition))
        ? Number(validSaved.photoPosition)
        : defaults.photoFocusY;
    }
    if (!Object.prototype.hasOwnProperty.call(photoLayoutPresets, merged.photoLayout)) {
      merged.photoLayout = defaults.photoLayout;
    }
    if (!["frame", "crop"].includes(merged.photoEditMode)) {
      merged.photoEditMode = defaults.photoEditMode;
    }
    if (!Object.prototype.hasOwnProperty.call(validSaved, "photoFrameY")) {
      const legacyOffset = Number(validSaved.photoModuleOffset);
      if (Number.isFinite(legacyOffset)) {
        merged.photoFrameY =
          photoLayoutPresets.editorial.photoFrameY +
          legacyOffset -
          LEGACY_PHOTO_MODULE_OFFSET;
      }
    }

    // 旧版本可能在本地保存过这些值；统一账号视觉后始终覆盖为品牌固定值。
    merged.cardWidth = CARD_WIDTH_PERCENT;
    merged.cardHeight = CARD_HEIGHT_PERCENT;
    merged.cornerRadius = CARD_CORNER_RADIUS;
    return merged;
  } catch {
    return { ...defaults };
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getNoteTypePreset(noteType = state.noteType) {
  return noteTypePresets[noteType] || noteTypePresets.experience;
}

function applyNoteTypePreset(noteType, { notify = true } = {}) {
  if (!VALID_NOTE_TYPES.includes(noteType)) return;

  const preset = getNoteTypePreset(noteType);
  const framePreset = photoLayoutPresets[preset.photoLayout];
  state = {
    ...state,
    ...preset,
    ...framePreset,
    noteType,
    styleCustomized: false,
    mainSizePreference: preset.mainSize,
    photoFocusX: 50,
    photoFocusY: 50,
    photoEditMode: "frame",
  };
  customStyleOpen = false;
  syncControls();
  scheduleRender();
  if (notify) showToast(`已切换为「${preset.label}」`);
}

function markStyleCustomized() {
  if (!state.styleCustomized) state.styleCustomized = true;
  syncStyleControls();
}

function normalizeHex(value) {
  const raw = String(value ?? "").trim();
  const short = /^#?([\da-f]{3})$/i.exec(raw);
  if (short) {
    return `#${short[1]
      .split("")
      .map((character) => character.repeat(2))
      .join("")}`.toUpperCase();
  }

  const full = /^#?([\da-f]{6})$/i.exec(raw);
  return full ? `#${full[1].toUpperCase()}` : null;
}

function splitLines(value) {
  const lines = String(value ?? "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trimEnd());
  return lines.some((line) => line.length > 0) ? lines : [];
}

function getCanvasDimensions() {
  return {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
  };
}

function fontString(weight, size, family = state.fontFamily) {
  // Yozai 当前只内置 Medium；固定使用真实字重，避免浏览器合成粗体破坏自然笔触。
  const effectiveWeight = family === "handwritten" ? 500 : weight;
  return `${effectiveWeight} ${size}px ${fontStacks[family] || fontStacks.system}`;
}

function ensureFontReady(family = state.fontFamily) {
  if (family !== "handwritten" || !document.fonts?.load) return Promise.resolve();
  if (handwrittenFontPromise) return handwrittenFontPromise;

  // Canvas 不会自动重绘异步到达的 Web Font，因此加载完成后重新计算字号上限并渲染。
  handwrittenFontPromise = document.fonts
    .load('500 96px "Yozai"', "Codex 远程 到底稳不稳？")
    .then(() => {
      if (state.fontFamily === "handwritten" || state.titleFontFamily === "handwritten") {
        syncMainSizeLimit();
        updateRangeOutputs();
        scheduleRender({ persist: false });
      }
    })
    .catch(() => {
      handwrittenFontPromise = null;
      showToast("自然手写字体加载失败，已使用系统字体");
    });

  return handwrittenFontPromise;
}

function alignMainSizeToStep(value, mode = "nearest") {
  const steps = (Number(value) - MIN_MAIN_SIZE) / MAIN_SIZE_STEP;
  const alignedSteps = mode === "down" ? Math.floor(steps) : Math.round(steps);
  return MIN_MAIN_SIZE + Math.max(0, alignedSteps) * MAIN_SIZE_STEP;
}

function getFixedCardMetrics() {
  const cardWidth = POSTER_WIDTH * (CARD_WIDTH_PERCENT / 100);
  const cardHeight = POSTER_HEIGHT * (CARD_HEIGHT_PERCENT / 100);
  return {
    cardWidth,
    cardHeight,
    cardX: (POSTER_WIDTH - cardWidth) / 2,
    cardY: (POSTER_HEIGHT - cardHeight) / 2,
  };
}

function calculateMainVerticalLimit(maxContentWidth) {
  const titleLines = splitLines(state.titleText);
  if (!titleLines.length) return MAX_MAIN_SIZE;
  if (state.noteType === "deepDive") return 168;

  const { cardWidth, cardHeight, cardX, cardY } = getFixedCardMetrics();
  const padding = Number(state.sidePadding);
  const photoWindow = uploadedPhoto
    ? getPhotoWindowMetrics(cardX, cardY, cardWidth, cardHeight, padding, 1)
    : null;
  const useAlbumLayout = state.photoLayout === "album" && photoWindow;
  const albumTextRegion =
    useAlbumLayout ? getAlbumTextRegion(cardY, cardHeight, photoWindow, 1) : null;
  const safeContentTop = albumTextRegion?.top ?? cardY + 158;
  const safeContentBottom =
    albumTextRegion?.bottom ?? (photoWindow ? photoWindow.y - 44 : cardY + cardHeight - 90);
  const availableContentHeight = Math.max(1, safeContentBottom - safeContentTop);

  const upperSize = useAlbumLayout
    ? Math.min(Number(state.upperSize), 32)
    : Number(state.upperSize);
  const subtitleSize = Number(state.subtitleSize);
  const upperLines = splitLines(state.upperText);
  const subtitleLines = splitLines(state.subtitleText);
  const upperBlock = createBlock(
    upperLines,
    upperLines.map(() => upperSize),
    {
      weight: 700,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.62,
      lineGap: upperSize * 0.25,
    },
  );
  const subtitleBlock = createBlock(
    subtitleLines,
    subtitleLines.map(() => subtitleSize),
    {
      weight: 700,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.58,
      lineGap: subtitleSize * 0.28,
    },
  );

  const visibleBlockCount =
    1 + Number(upperBlock.height > 0) + Number(subtitleBlock.height > 0);
  const reservedHeight =
    upperBlock.height +
    subtitleBlock.height +
    Math.max(0, visibleBlockCount - 1) * (useAlbumLayout ? 18 : 24);
  const mainHeightFactor =
    titleLines.reduce(
      (sum, _, index) =>
        sum + (useAlbumLayout ? 1 : index === 0 ? 0.84 : 1),
      0,
    ) + Math.max(0, titleLines.length - 1) * (useAlbumLayout ? 0.08 : 0.1);

  return Math.floor(Math.max(1, availableContentHeight - reservedHeight) / mainHeightFactor);
}

function calculateMainSizeLimit() {
  const lines = splitLines(state.titleText);
  if (!lines.length) return MAX_MAIN_SIZE;

  const { cardWidth } = getFixedCardMetrics();
  const maxContentWidth = cardWidth - Number(state.sidePadding) * 2;
  const useAlbumLayout = state.photoLayout === "album" && uploadedPhoto;
  let limit = Math.min(MAX_MAIN_SIZE, calculateMainVerticalLimit(maxContentWidth));

  lines.forEach((line, index) => {
    if (!line) return;
    const sizeFactor = useAlbumLayout ? 1 : index === 0 ? 0.84 : 1;
    const titleWeight = state.titleFontFamily === "serif" ? 700 : 900;
    context.font = fontString(titleWeight, 100 * sizeFactor, state.titleFontFamily);
    const measuredAt100 = context.measureText(line).width;
    if (measuredAt100 <= 0) return;
    limit = Math.min(limit, Math.floor((maxContentWidth / measuredAt100) * 100));
  });

  const safeLimit = Math.max(MIN_MAIN_SIZE, Math.min(MAX_MAIN_SIZE, limit));
  // 范围上限必须与 range 的步长对齐，避免状态显示值和滑杆实际值相差 1 px。
  return alignMainSizeToStep(safeLimit, "down");
}

function syncMainSizeLimit() {
  const input = document.getElementById("mainSize");
  const limit = calculateMainSizeLimit();
  const preferred = Number(state.mainSizePreference);
  const safePreferred = Number.isFinite(preferred) ? preferred : Number(state.mainSize);
  const alignedPreferred = alignMainSizeToStep(safePreferred);
  const effectiveSize = Math.max(MIN_MAIN_SIZE, Math.min(limit, alignedPreferred));

  input.min = String(MIN_MAIN_SIZE);
  input.max = String(limit);
  state.mainSize = effectiveSize;
  input.value = String(effectiveSize);

  return { limit, constrained: safePreferred > limit };
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function calculateCoverCrop(
  imageWidth,
  imageHeight,
  targetWidth,
  targetHeight,
  horizontalPosition,
  verticalPosition,
) {
  const sourceRatio = imageWidth / imageHeight;
  const targetRatio = targetWidth / targetHeight;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = imageHeight * targetRatio;
    const availableOffset = Math.max(0, imageWidth - sourceWidth);
    const position = Math.max(0, Math.min(100, Number(horizontalPosition))) / 100;
    sourceX = availableOffset * position;
  } else {
    sourceHeight = imageWidth / targetRatio;
    const availableOffset = Math.max(0, imageHeight - sourceHeight);
    const position = Math.max(0, Math.min(100, Number(verticalPosition))) / 100;
    sourceY = availableOffset * position;
  }

  return { sourceX, sourceY, sourceWidth, sourceHeight };
}

function clamp(value, minimum, maximum) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(maximum, Math.max(minimum, number))
    : minimum;
}

function getPhotoFrameBounds(cardX, cardY, cardWidth, cardHeight, layoutScale) {
  const isDeepDive = state.photoLayout === "deepDive";
  return {
    minX: cardX + 20 * layoutScale,
    minY: cardY + (isDeepDive ? 20 : 132) * layoutScale,
    maxX: cardX + cardWidth - 20 * layoutScale,
    maxY: cardY + cardHeight - 70 * layoutScale,
  };
}

function sanitizePhotoFrame(frame, bounds) {
  const maximumWidth = Math.max(MIN_PHOTO_FRAME_WIDTH, bounds.maxX - bounds.minX);
  const maximumHeight = Math.max(MIN_PHOTO_FRAME_HEIGHT, bounds.maxY - bounds.minY);
  const width = clamp(frame.width, MIN_PHOTO_FRAME_WIDTH, maximumWidth);
  const height = clamp(frame.height, MIN_PHOTO_FRAME_HEIGHT, maximumHeight);
  const x = clamp(frame.x, bounds.minX, bounds.maxX - width);
  const y = clamp(frame.y, bounds.minY, bounds.maxY - height);

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  };
}

function getPhotoWindowMetrics(cardX, cardY, cardWidth, cardHeight, padding, layoutScale) {
  const bounds = getPhotoFrameBounds(cardX, cardY, cardWidth, cardHeight, layoutScale);
  const frame = sanitizePhotoFrame(
    {
      x: Number(state.photoFrameX) * layoutScale,
      y: Number(state.photoFrameY) * layoutScale,
      width: Number(state.photoFrameWidth) * layoutScale,
      height: Number(state.photoFrameHeight) * layoutScale,
    },
    bounds,
  );

  state.photoFrameX = Math.round(frame.x / layoutScale);
  state.photoFrameY = Math.round(frame.y / layoutScale);
  state.photoFrameWidth = Math.round(frame.width / layoutScale);
  state.photoFrameHeight = Math.round(frame.height / layoutScale);
  return {
    ...frame,
    radius: Math.min(
      (state.photoLayout === "album" ? 40 : state.photoLayout === "deepDive" ? 32 : 28) *
        layoutScale,
      frame.height / 2,
    ),
  };
}

function drawPhotoWindow(metrics) {
  if (!uploadedPhoto) return;

  // 采用 cover 裁切；取景位置由预览中的直接拖动更新，保证窗口填满且不拉伸。
  const crop = calculateCoverCrop(
    uploadedPhoto.naturalWidth,
    uploadedPhoto.naturalHeight,
    metrics.width,
    metrics.height,
    state.photoFocusX,
    state.photoFocusY,
  );

  if (state.photoLayout === "album") {
    context.save();
    context.shadowColor = "rgba(0, 0, 0, 0.24)";
    context.shadowBlur = 34;
    context.shadowOffsetY = 18;
    context.fillStyle = "rgba(0, 0, 0, 0.18)";
    roundedRectPath(
      context,
      metrics.x,
      metrics.y,
      metrics.width,
      metrics.height,
      metrics.radius,
    );
    context.fill();
    context.restore();
  }

  context.save();
  roundedRectPath(
    context,
    metrics.x,
    metrics.y,
    metrics.width,
    metrics.height,
    metrics.radius,
  );
  context.clip();
  context.drawImage(
    uploadedPhoto,
    crop.sourceX,
    crop.sourceY,
    crop.sourceWidth,
    crop.sourceHeight,
    metrics.x,
    metrics.y,
    metrics.width,
    metrics.height,
  );
  context.restore();

  if (state.photoLayout === "album") {
    context.save();
    context.strokeStyle = "rgba(255, 255, 255, 0.24)";
    context.lineWidth = 2;
    roundedRectPath(
      context,
      metrics.x,
      metrics.y,
      metrics.width,
      metrics.height,
      metrics.radius,
    );
    context.stroke();
    context.restore();
  }
}

function fitScale(lines, sizes, weight, maxWidth, minimumScale = 0.54, family = state.fontFamily) {
  if (!lines.length) return 1;

  let scale = 1;
  lines.forEach((line, index) => {
    const text = line || " ";
    const size = sizes[Math.min(index, sizes.length - 1)];
    context.font = fontString(weight, size, family);
    const measured = context.measureText(text).width;
    if (measured > maxWidth) scale = Math.min(scale, maxWidth / measured);
  });
  return Math.max(minimumScale, scale);
}

function createBlock(lines, desiredSizes, options) {
  if (!lines.length) {
    return { lines: [], sizes: [], height: 0, lineGap: 0, options };
  }

  const scale = fitScale(
    lines,
    desiredSizes,
    options.weight,
    options.maxWidth,
    options.minScale,
    options.family,
  );
  const sizes = desiredSizes.map((size) => Math.round(size * scale));
  const lineGap = Math.round(options.lineGap * scale);
  const height = sizes.reduce((sum, size) => sum + size, 0) + lineGap * (lines.length - 1);
  return { lines, sizes, height, lineGap, options };
}

function drawBlock(block, x, top) {
  if (!block.lines.length) return;

  context.save();
  context.fillStyle = state.textColor;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";

  let lineTop = top;
  block.lines.forEach((line, index) => {
    const size = block.sizes[index];
    context.font = fontString(
      block.options.weight,
      size,
      block.options.family || state.fontFamily,
    );
    context.fillText(line, x, lineTop + size * 0.82);
    lineTop += size + block.lineGap;
  });
  context.restore();
}

function measureSpacedText(text, spacing) {
  let width = 0;
  Array.from(text).forEach((character, index, characters) => {
    width += context.measureText(character).width;
    if (index < characters.length - 1) width += spacing;
  });
  return width;
}

function drawSpacedText(text, x, baseline, maxWidth, align, layoutScale) {
  if (!text) return;

  let fontSize = 25 * layoutScale;
  let spacing = 7 * layoutScale;
  context.font = fontString(700, fontSize, "grotesk");
  let width = measureSpacedText(text, spacing);

  if (width > maxWidth) {
    const scale = Math.max(0.62, maxWidth / width);
    fontSize = Math.round(fontSize * scale);
    spacing *= scale;
    context.font = fontString(700, fontSize, "grotesk");
    width = measureSpacedText(text, spacing);
  }

  context.save();
  context.fillStyle = state.textColor;
  context.textBaseline = "alphabetic";
  const availableOffset = Math.max(0, maxWidth - width);
  let cursor = x;
  if (align === "center") cursor += availableOffset / 2;
  if (align === "right") cursor += availableOffset;
  Array.from(text).forEach((character, index, characters) => {
    context.fillText(character, cursor, baseline);
    cursor += context.measureText(character).width;
    if (index < characters.length - 1) cursor += spacing;
  });
  context.restore();
}

function drawCornerLabel(text, x, baseline, align, maxWidth, layoutScale) {
  if (!text) return;

  let size = 34 * layoutScale;
  context.font = fontString(800, size);
  const measured = context.measureText(text).width;
  if (measured > maxWidth) {
    size = Math.max(24 * layoutScale, Math.floor(size * (maxWidth / measured)));
  }

  context.save();
  context.fillStyle = state.textColor;
  context.font = fontString(800, size);
  context.textAlign = align;
  context.textBaseline = "alphabetic";
  context.fillText(text, x, baseline);
  context.restore();
}

function getAlbumTextRegion(cardY, cardHeight, photoWindow, layoutScale) {
  const bottom = cardY + cardHeight - 84 * layoutScale;
  const minimumHeight = 350 * layoutScale;
  const desiredTop = photoWindow.y + photoWindow.height + 42 * layoutScale;
  const top = Math.max(
    cardY + 160 * layoutScale,
    Math.min(desiredTop, bottom - minimumHeight),
  );
  return { top, bottom };
}

function drawDeepDiveVisual(metrics, layoutScale) {
  context.save();
  roundedRectPath(
    context,
    metrics.x,
    metrics.y,
    metrics.width,
    metrics.height,
    metrics.radius,
  );
  context.clip();
  context.fillStyle = normalizeHex(state.visualColor) || "#D8D6E2";
  context.fillRect(metrics.x, metrics.y, metrics.width, metrics.height);

  // 深度文章的默认视觉只承担“技术主题”提示，不加入可变装饰，避免与标题争夺注意力。
  const centerX = metrics.x + metrics.width * 0.58;
  const centerY = metrics.y + metrics.height * 0.5;
  const polygonRadius = Math.min(metrics.width, metrics.height) * 0.23;
  context.beginPath();
  for (let index = 0; index < 7; index += 1) {
    const angle = -Math.PI / 2 + (index / 7) * Math.PI * 2;
    const radius = polygonRadius * (index % 2 === 0 ? 1 : 0.86);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fillStyle = state.cardColor;
  context.fill();

  context.strokeStyle = state.textColor;
  context.fillStyle = state.textColor;
  context.lineWidth = 4 * layoutScale;
  context.lineCap = "round";
  context.lineJoin = "round";

  const tablet = {
    x: metrics.x + metrics.width * 0.18,
    y: metrics.y + metrics.height * 0.28,
    width: metrics.width * 0.35,
    height: metrics.height * 0.32,
  };
  roundedRectPath(
    context,
    tablet.x,
    tablet.y,
    tablet.width,
    tablet.height,
    24 * layoutScale,
  );
  context.stroke();
  roundedRectPath(
    context,
    tablet.x + 28 * layoutScale,
    tablet.y + 20 * layoutScale,
    tablet.width - 52 * layoutScale,
    tablet.height - 40 * layoutScale,
    14 * layoutScale,
  );
  context.stroke();

  const codeX = tablet.x + tablet.width * 0.28;
  const codeY = tablet.y + tablet.height * 0.27;
  context.beginPath();
  context.moveTo(codeX, codeY);
  context.lineTo(codeX - 14 * layoutScale, codeY + 14 * layoutScale);
  context.lineTo(codeX, codeY + 28 * layoutScale);
  context.moveTo(codeX + 34 * layoutScale, codeY);
  context.lineTo(codeX + 48 * layoutScale, codeY + 14 * layoutScale);
  context.lineTo(codeX + 34 * layoutScale, codeY + 28 * layoutScale);
  context.stroke();
  [0.53, 0.66, 0.79].forEach((position, index) => {
    context.beginPath();
    context.moveTo(tablet.x + tablet.width * 0.25, tablet.y + tablet.height * position);
    context.lineTo(
      tablet.x + tablet.width * (index === 1 ? 0.68 : 0.76),
      tablet.y + tablet.height * position,
    );
    context.stroke();
  });

  const terminal = {
    x: metrics.x + metrics.width * 0.6,
    y: metrics.y + metrics.height * 0.58,
    width: metrics.width * 0.25,
    height: metrics.height * 0.22,
  };
  roundedRectPath(
    context,
    terminal.x,
    terminal.y,
    terminal.width,
    terminal.height,
    18 * layoutScale,
  );
  context.stroke();
  context.beginPath();
  context.moveTo(terminal.x, terminal.y + terminal.height * 0.28);
  context.lineTo(terminal.x + terminal.width, terminal.y + terminal.height * 0.28);
  context.stroke();
  [0.09, 0.16, 0.23].forEach((position) => {
    context.beginPath();
    context.arc(
      terminal.x + terminal.width * position,
      terminal.y + terminal.height * 0.14,
      4 * layoutScale,
      0,
      Math.PI * 2,
    );
    context.fill();
  });
  context.beginPath();
  context.moveTo(terminal.x + terminal.width * 0.18, terminal.y + terminal.height * 0.5);
  context.lineTo(terminal.x + terminal.width * 0.28, terminal.y + terminal.height * 0.62);
  context.lineTo(terminal.x + terminal.width * 0.18, terminal.y + terminal.height * 0.74);
  context.moveTo(terminal.x + terminal.width * 0.34, terminal.y + terminal.height * 0.74);
  context.lineTo(terminal.x + terminal.width * 0.48, terminal.y + terminal.height * 0.74);
  context.stroke();

  context.beginPath();
  context.moveTo(tablet.x + tablet.width, tablet.y + tablet.height * 0.52);
  context.bezierCurveTo(
    metrics.x + metrics.width * 0.68,
    tablet.y + tablet.height * 0.46,
    metrics.x + metrics.width * 0.76,
    terminal.y - 36 * layoutScale,
    terminal.x + terminal.width * 0.68,
    terminal.y,
  );
  context.stroke();
  const arrowX = terminal.x + terminal.width * 0.68;
  const arrowY = terminal.y;
  context.beginPath();
  context.moveTo(arrowX - 12 * layoutScale, arrowY - 14 * layoutScale);
  context.lineTo(arrowX, arrowY);
  context.lineTo(arrowX + 12 * layoutScale, arrowY - 14 * layoutScale);
  context.stroke();
  context.restore();
}

function renderDeepDiveContent({
  cardX,
  cardY,
  cardWidth,
  cardHeight,
  padding,
  visualWindow,
  layoutScale,
}) {
  const contentX = cardX + padding;
  const maxContentWidth = cardWidth - padding * 2;
  const metadataBaseline = visualWindow.y + visualWindow.height + 76 * layoutScale;
  drawCornerLabel(
    state.topLeft.trim(),
    contentX,
    metadataBaseline,
    "left",
    maxContentWidth * 0.42,
    layoutScale,
  );
  drawCornerLabel(
    state.topRight.trim(),
    cardX + cardWidth - padding,
    metadataBaseline,
    "right",
    maxContentWidth * 0.42,
    layoutScale,
  );

  const dividerY = metadataBaseline + 31 * layoutScale;
  context.save();
  context.strokeStyle = state.textColor;
  context.globalAlpha = 0.68;
  context.lineWidth = 1.5 * layoutScale;
  context.beginPath();
  context.moveTo(contentX, dividerY);
  context.lineTo(contentX + maxContentWidth, dividerY);
  context.stroke();
  context.restore();

  const mainSize = Number(state.mainSize) * layoutScale;
  const upperSize = Number(state.upperSize) * layoutScale;
  const subtitleSize = Number(state.subtitleSize) * layoutScale;
  let mainBlock = createBlock(
    splitLines(state.titleText),
    splitLines(state.titleText).map((_, index) => (index === 0 ? mainSize * 0.84 : mainSize)),
    {
      weight: 700,
      family: state.titleFontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.52,
      lineGap: mainSize * 0.08,
    },
  );
  let proofBlock = createBlock(
    splitLines(state.upperText),
    splitLines(state.upperText).map(() => upperSize),
    {
      weight: 700,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.62,
      lineGap: upperSize * 0.24,
    },
  );
  let subtitleBlock = createBlock(
    splitLines(state.subtitleText),
    splitLines(state.subtitleText).map(() => subtitleSize),
    {
      weight: 700,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.58,
      lineGap: subtitleSize * 0.25,
    },
  );

  let titleTop = dividerY + 46 * layoutScale;
  let firstGap = 34 * layoutScale;
  let secondGap = 42 * layoutScale;
  const safeBottom = cardY + cardHeight - 72 * layoutScale;
  const requestedHeight =
    mainBlock.height +
    proofBlock.height +
    subtitleBlock.height +
    (proofBlock.height ? firstGap : 0) +
    (subtitleBlock.height ? secondGap : 0);
  const availableHeight = Math.max(1, safeBottom - titleTop);

  if (requestedHeight > availableHeight) {
    const scale = availableHeight / requestedHeight;
    const scaleBlock = (block) => ({
      ...block,
      sizes: block.sizes.map((size) => size * scale),
      lineGap: block.lineGap * scale,
      height: block.height * scale,
    });
    mainBlock = scaleBlock(mainBlock);
    proofBlock = scaleBlock(proofBlock);
    subtitleBlock = scaleBlock(subtitleBlock);
    firstGap *= scale;
    secondGap *= scale;
  }

  drawBlock(mainBlock, contentX, titleTop);
  titleTop += mainBlock.height;
  if (proofBlock.height) {
    titleTop += firstGap;
    drawBlock(proofBlock, contentX, titleTop);
    titleTop += proofBlock.height;
  }
  if (subtitleBlock.height) {
    titleTop += secondGap;
    drawBlock(subtitleBlock, contentX, titleTop);
  }

  drawSpacedText(
    state.footerText.trim(),
    contentX,
    cardY + cardHeight - 36 * layoutScale,
    maxContentWidth,
    state.footerAlign,
    layoutScale,
  );
}

function renderPoster() {
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();
  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  // 版式参数以小红书图文封面的 1080 × 1440 标准为设计基准。
  const layoutScale = Math.min(canvasWidth / 1080, canvasHeight / 1440);
  const { cardWidth, cardHeight, cardX, cardY } = getFixedCardMetrics();
  const padding = Number(state.sidePadding) * layoutScale;
  const contentX = cardX + padding;
  const maxContentWidth = cardWidth - padding * 2;

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = state.backgroundColor;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  context.fillStyle = state.cardColor;
  roundedRectPath(
    context,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    CARD_CORNER_RADIUS * layoutScale,
  );
  context.fill();

  const isDeepDive = state.noteType === "deepDive";
  const visualWindow =
    uploadedPhoto || isDeepDive
      ? getPhotoWindowMetrics(cardX, cardY, cardWidth, cardHeight, padding, layoutScale)
      : null;
  const photoWindow = uploadedPhoto ? visualWindow : null;
  if (isDeepDive) {
    if (photoWindow) drawPhotoWindow(photoWindow);
    else drawDeepDiveVisual(visualWindow, layoutScale);
    renderDeepDiveContent({
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      padding,
      visualWindow,
      layoutScale,
    });
    syncPhotoTransformOverlay(photoWindow);
    renderFeedPreview(canvasWidth, canvasHeight);
    return;
  }
  if (photoWindow) drawPhotoWindow(photoWindow);

  const cornerBaseline = cardY + 105 * layoutScale;
  drawCornerLabel(
    state.topLeft.trim(),
    contentX,
    cornerBaseline,
    "left",
    maxContentWidth * 0.42,
    layoutScale,
  );
  drawCornerLabel(
    state.topRight.trim(),
    cardX + cardWidth - padding,
    cornerBaseline,
    "right",
    maxContentWidth * 0.42,
    layoutScale,
  );

  const upperLines = splitLines(state.upperText);
  const titleLines = splitLines(state.titleText);
  const subtitleLines = splitLines(state.subtitleText);

  const isAlbumLayout = state.photoLayout === "album" && photoWindow;
  const upperSize =
    (isAlbumLayout ? Math.min(Number(state.upperSize), 32) : Number(state.upperSize)) *
    layoutScale;
  const mainSize = Number(state.mainSize) * layoutScale;
  const subtitleSize = Number(state.subtitleSize) * layoutScale;

  const upperBlock = createBlock(
    upperLines,
    upperLines.map(() => upperSize),
    {
      weight: 700,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.62,
      lineGap: upperSize * 0.25,
    },
  );

  const mainSizes = titleLines.map((_, index) =>
    isAlbumLayout || index > 0 ? mainSize : mainSize * 0.84,
  );
  const mainBlock = createBlock(titleLines, mainSizes, {
    weight: 900,
    family: state.titleFontFamily,
    maxWidth: maxContentWidth,
    minScale: 0.54,
    // 专辑焦点版采用一致字号；文字海报保留首行略小的编辑式层级。
    lineGap: mainSize * (isAlbumLayout ? 0.08 : 0.1),
  });

  const subtitleBlock = createBlock(
    subtitleLines,
    subtitleLines.map(() => subtitleSize),
    {
      weight: 700,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.58,
      lineGap: subtitleSize * 0.28,
    },
  );

  let activeBlocks = [upperBlock, mainBlock, subtitleBlock].filter((block) => block.height > 0);
  let groupGap = (isAlbumLayout ? 18 : Number(state.groupGap)) * layoutScale;
  let groupHeight =
    activeBlocks.reduce((sum, block) => sum + block.height, 0) +
    Math.max(0, activeBlocks.length - 1) * groupGap;

  const albumTextRegion = isAlbumLayout
    ? getAlbumTextRegion(cardY, cardHeight, photoWindow, layoutScale)
    : null;
  const safeContentTop = albumTextRegion?.top ?? cardY + 158 * layoutScale;
  // 文字海报把标题放在照片上方；专辑焦点版把标题与副标题放在大照片下方。
  const safeContentBottom =
    albumTextRegion?.bottom ??
    (photoWindow ? photoWindow.y - 44 * layoutScale : cardY + cardHeight - 90 * layoutScale);
  const availableContentHeight = Math.max(1, safeContentBottom - safeContentTop);

  // 空间不足时先压缩组间距，避免字号滑杆的变化被整体等比缩放抵消。
  if (groupHeight > availableContentHeight && activeBlocks.length > 1) {
    const blockHeight = activeBlocks.reduce((sum, block) => sum + block.height, 0);
    const gapCount = activeBlocks.length - 1;
    const fittingGap = (availableContentHeight - blockHeight) / gapCount;
    const minimumGap = (isAlbumLayout ? 14 : 24) * layoutScale;
    groupGap = Math.max(minimumGap, Math.min(groupGap, fittingGap));
    groupHeight = blockHeight + gapCount * groupGap;
  }

  if (groupHeight > availableContentHeight) {
    const verticalScale = availableContentHeight / groupHeight;
    activeBlocks = activeBlocks.map((block) => ({
      ...block,
      sizes: block.sizes.map((size) => size * verticalScale),
      lineGap: block.lineGap * verticalScale,
      height: block.height * verticalScale,
    }));
    groupGap *= verticalScale;
    groupHeight = availableContentHeight;
  }

  const groupCenter = photoWindow
    ? safeContentTop +
      availableContentHeight * 0.5 +
      Number(state.verticalOffset) * layoutScale
    : cardY + cardHeight * 0.485 + Number(state.verticalOffset) * layoutScale;
  let blockTop = Math.max(
    safeContentTop,
    Math.min(groupCenter - groupHeight / 2, safeContentBottom - groupHeight),
  );

  activeBlocks.forEach((block, index) => {
    drawBlock(block, contentX, blockTop);
    blockTop += block.height;
    if (index < activeBlocks.length - 1) blockTop += groupGap;
  });

  const footerBaseline = cardY + cardHeight - 37 * layoutScale;
  drawSpacedText(
    state.footerText.trim(),
    contentX,
    footerBaseline,
    maxContentWidth,
    state.footerAlign,
    layoutScale,
  );

  syncPhotoTransformOverlay(photoWindow);
  renderFeedPreview(canvasWidth, canvasHeight);
}

function renderFeedPreview(canvasWidth, canvasHeight) {
  const previewWidth = 360;
  const previewHeight = Math.max(1, Math.round(previewWidth * (canvasHeight / canvasWidth)));
  if (feedPosterCanvas.width !== previewWidth || feedPosterCanvas.height !== previewHeight) {
    feedPosterCanvas.width = previewWidth;
    feedPosterCanvas.height = previewHeight;
  }
  feedPosterContext.clearRect(0, 0, previewWidth, previewHeight);
  feedPosterContext.drawImage(canvas, 0, 0, previewWidth, previewHeight);

  const title = splitLines(state.titleText).join(" ").trim();
  feedPosterTitle.textContent = title || "未命名封面";
  ratioBadge.textContent = `小红书图文 · ${canvasWidth} × ${canvasHeight} · 3:4`;
}

function scheduleRender({ persist = true } = {}) {
  if (persist) persistState();
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(renderPoster);
}

function getCurrentPhotoFrame() {
  return {
    x: Number(state.photoFrameX),
    y: Number(state.photoFrameY),
    width: Number(state.photoFrameWidth),
    height: Number(state.photoFrameHeight),
  };
}

function updatePhotoGeometryStatus(frame = getCurrentPhotoFrame()) {
  if (state.photoEditMode === "crop") {
    photoGeometryStatus.textContent = `取景 X ${Math.round(
      state.photoFocusX,
    )}% · Y ${Math.round(state.photoFocusY)}%`;
    return;
  }

  photoGeometryStatus.textContent = `区域 X ${Math.round(frame.x)} · Y ${Math.round(
    frame.y,
  )} · ${Math.round(frame.width)} × ${Math.round(frame.height)} px`;
}

function syncPhotoTransformOverlay(metrics) {
  if (!uploadedPhoto || !metrics) {
    photoTransformOverlay.hidden = true;
    return;
  }

  photoTransformOverlay.hidden = false;
  photoTransformOverlay.style.left = `${(metrics.x / POSTER_WIDTH) * 100}%`;
  photoTransformOverlay.style.top = `${(metrics.y / POSTER_HEIGHT) * 100}%`;
  photoTransformOverlay.style.width = `${(metrics.width / POSTER_WIDTH) * 100}%`;
  photoTransformOverlay.style.height = `${(metrics.height / POSTER_HEIGHT) * 100}%`;
  const isCropMode = state.photoEditMode === "crop";
  photoTransformOverlay.classList.toggle("is-crop-mode", isCropMode);
  photoTransformOverlay.setAttribute(
    "aria-label",
    isCropMode ? "调整照片取景" : "调整照片区域",
  );
  photoTransformLabel.textContent = isCropMode ? "拖动取景" : "拖动区域";
  updatePhotoGeometryStatus(metrics);
}

function applyPhotoFrame(frame, { persist = false } = {}) {
  const { cardWidth, cardHeight, cardX, cardY } = getFixedCardMetrics();
  const bounds = getPhotoFrameBounds(cardX, cardY, cardWidth, cardHeight, 1);
  const safeFrame = sanitizePhotoFrame(frame, bounds);

  state.photoFrameX = safeFrame.x;
  state.photoFrameY = safeFrame.y;
  state.photoFrameWidth = safeFrame.width;
  state.photoFrameHeight = safeFrame.height;
  updatePhotoGeometryStatus(safeFrame);
  updateRangeOutputs();
  scheduleRender({ persist });
}

function syncPhotoLayoutButtons() {
  document.querySelectorAll("[data-photo-layout]").forEach((button) => {
    const isActive = button.dataset.photoLayout === state.photoLayout;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function syncPhotoEditModeButtons() {
  const isCropMode = state.photoEditMode === "crop";
  document.querySelectorAll("[data-photo-edit-mode]").forEach((button) => {
    const isActive = button.dataset.photoEditMode === state.photoEditMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  photoTransformHelp.textContent = isCropMode
    ? "照片区域保持不动，直接拖动照片内容选择展示部分。方向键可微调取景。"
    : "拖动照片区域；接近画布中心会显示参考线并吸附。拖动四角调整大小。";
  photoTransformOverlay.classList.toggle("is-crop-mode", isCropMode);
  photoTransformOverlay.setAttribute(
    "aria-label",
    isCropMode ? "调整照片取景" : "调整照片区域",
  );
  photoTransformLabel.textContent = isCropMode ? "拖动取景" : "拖动区域";
  updatePhotoGeometryStatus();
}

function setPhotoEditMode(mode, { notify = true } = {}) {
  if (!["frame", "crop"].includes(mode)) return;
  state.photoEditMode = mode;
  hidePhotoAlignmentGuides();
  syncPhotoEditModeButtons();
  scheduleRender();
  if (notify) {
    showToast(mode === "crop" ? "现在拖动照片内容调整取景" : "现在移动或缩放照片区域");
  }
}

function applyPhotoLayoutPreset(layout, { notify = true } = {}) {
  const preset = photoLayoutPresets[layout];
  if (!preset) return;

  state.photoLayout = layout;
  Object.assign(state, preset);
  syncPhotoLayoutButtons();
  updateRangeOutputs();
  scheduleRender();
  if (notify) {
    showToast(layout === "album" ? "已切换为专辑焦点版" : "已切换为文字海报版");
  }
}

function setControlValue(id, value) {
  const element = document.getElementById(id);
  if (element) element.value = value;
}

function updateRangeOutputs() {
  const suffix = {
    mainSize: " px",
    upperSize: " px",
    subtitleSize: " px",
    groupGap: " px",
    verticalOffset: " px",
    sidePadding: " px",
  };

  document.querySelectorAll("[data-output]").forEach((output) => {
    const key = output.dataset.output;
    if (key === "mainSize") {
      const { limit, constrained } = syncMainSizeLimit();
      output.value = `${state.mainSize} px${constrained ? ` · 当前换行上限 ${limit}` : ""}`;
      return;
    }

    const prefix = key === "verticalOffset" && Number(state[key]) > 0 ? "+" : "";
    output.value = `${prefix}${state[key]}${suffix[key] || ""}`;
  });
}

function syncActiveTheme() {
  const activeTheme = Object.entries(themes).find(([, theme]) =>
    ["backgroundColor", "cardColor", "textColor"].every(
      (key) => normalizeHex(theme[key]) === normalizeHex(state[key]),
    ),
  )?.[0];

  document.querySelectorAll(".theme-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.theme === activeTheme);
  });
}

function syncFontPresetButtons() {
  const activePreset = Object.entries(fontPresets).find(
    ([, preset]) =>
      preset.fontFamily === state.fontFamily &&
      preset.titleFontFamily === state.titleFontFamily,
  )?.[0];

  document.querySelectorAll("[data-font-preset]").forEach((button) => {
    const isActive = button.dataset.fontPreset === activePreset;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function syncNoteTypeButtons() {
  document.querySelectorAll("[data-note-type]").forEach((button) => {
    const isActive = button.dataset.noteType === state.noteType;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function syncStyleControls() {
  const preset = getNoteTypePreset();
  if (styleStatus) {
    styleStatus.textContent = state.styleCustomized
      ? `基于「${preset.label}」· 已自定义`
      : `「${preset.label}」品牌风格已锁定`;
  }
  if (styleDescription) {
    styleDescription.textContent = state.styleCustomized
      ? "切换笔记类型会恢复目标类型的标准风格，文案和照片不会丢失。"
      : `${preset.description}。只需编辑文案和照片，主页视觉会自动保持一致。`;
  }
  if (customStyleControls) customStyleControls.hidden = !customStyleOpen;
  if (customStyleButton) {
    customStyleButton.textContent = customStyleOpen ? "收起微调" : "高级微调";
    customStyleButton.setAttribute("aria-expanded", String(customStyleOpen));
  }
  if (photoLayoutPicker) {
    photoLayoutPicker.hidden = !customStyleOpen || state.noteType === "deepDive";
  }
  if (photoPresetHint) {
    const hints = {
      experience: "默认纯文字；上传照片后使用底部证据区。",
      tutorial: "可上传终端或步骤截图，默认放在标题下方。",
      product: "建议上传一张真实产品图或使用结果，默认大图优先。",
      deepDive: "未上传图片时显示克制线稿；上传后替换上方视觉区。",
    };
    photoPresetHint.textContent = hints[state.noteType];
  }
}

function syncControls() {
  syncMainSizeLimit();

  [
    "topLeft",
    "topRight",
    "upperText",
    "titleText",
    "subtitleText",
    "footerText",
    "footerAlign",
    "fontFamily",
    "titleFontFamily",
    "mainSize",
    "upperSize",
    "subtitleSize",
    "groupGap",
    "verticalOffset",
    "sidePadding",
  ].forEach((key) => setControlValue(key, state[key]));

  document.querySelectorAll("[data-color]").forEach((input) => {
    input.value = normalizeHex(state[input.dataset.color]) || defaults[input.dataset.color];
  });
  document.querySelectorAll("[data-hex]").forEach((input) => {
    input.value = normalizeHex(state[input.dataset.hex]) || defaults[input.dataset.hex];
    input.classList.remove("is-invalid");
  });

  updateRangeOutputs();
  syncActiveTheme();
  syncFontPresetButtons();
  syncNoteTypeButtons();
  syncStyleControls();
  syncPhotoLayoutButtons();
  syncPhotoEditModeButtons();
  updatePhotoGeometryStatus();
}

function bindStandardControls() {
  const keys = [
    "topLeft",
    "topRight",
    "upperText",
    "titleText",
    "subtitleText",
    "footerText",
    "footerAlign",
    "fontFamily",
    "titleFontFamily",
    "mainSize",
    "upperSize",
    "subtitleSize",
    "groupGap",
    "verticalOffset",
    "sidePadding",
  ];
  const styleKeys = new Set([
    "footerAlign",
    "fontFamily",
    "titleFontFamily",
    "mainSize",
    "upperSize",
    "subtitleSize",
    "groupGap",
    "verticalOffset",
    "sidePadding",
  ]);

  keys.forEach((key) => {
    const element = document.getElementById(key);
    element.addEventListener("input", () => {
      state[key] = element.type === "range" ? Number(element.value) : element.value;
      if (key === "mainSize") state.mainSizePreference = state.mainSize;
      if (["fontFamily", "titleFontFamily"].includes(key)) {
        ensureFontReady(state[key]);
      }
      if (styleKeys.has(key)) markStyleCustomized();
      if (["titleText", "fontFamily", "titleFontFamily", "sidePadding"].includes(key)) {
        syncMainSizeLimit();
      }
      if (["fontFamily", "titleFontFamily"].includes(key)) syncFontPresetButtons();
      updateRangeOutputs();
      scheduleRender();
    });
  });
}

function bindPreviewModes() {
  document.querySelectorAll(".preview-mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.previewMode;
      document.querySelectorAll(".preview-mode-button").forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });
      document.querySelectorAll("[data-preview-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.previewPanel !== mode;
      });
    });
  });
}

function bindColorControls() {
  document.querySelectorAll("[data-color]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.color;
      state[key] = input.value.toUpperCase();
      const hexInput = document.querySelector(`[data-hex="${key}"]`);
      hexInput.value = state[key];
      hexInput.classList.remove("is-invalid");
      document.querySelectorAll(".theme-chip").forEach((chip) => chip.classList.remove("is-active"));
      markStyleCustomized();
      scheduleRender();
    });
  });

  document.querySelectorAll("[data-hex]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.hex;
      const normalized = normalizeHex(input.value);
      input.classList.toggle("is-invalid", !normalized);
      if (!normalized) return;

      state[key] = normalized;
      document.querySelector(`[data-color="${key}"]`).value = normalized;
      document.querySelectorAll(".theme-chip").forEach((chip) => chip.classList.remove("is-active"));
      markStyleCustomized();
      scheduleRender();
    });

    input.addEventListener("blur", () => {
      const key = input.dataset.hex;
      input.value = normalizeHex(state[key]) || defaults[key];
      input.classList.remove("is-invalid");
    });
  });
}

function bindThemes() {
  document.querySelectorAll(".theme-chip").forEach((button) => {
    button.addEventListener("click", () => {
      const theme = themes[button.dataset.theme];
      if (!theme) return;

      state = { ...state, ...theme };
      markStyleCustomized();
      document.querySelectorAll(".theme-chip").forEach((chip) => chip.classList.remove("is-active"));
      button.classList.add("is-active");
      syncControls();
      scheduleRender();
    });
  });
}

function bindFontPresetControls() {
  document.querySelectorAll("[data-font-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const preset = fontPresets[button.dataset.fontPreset];
      if (!preset) return;

      state.fontFamily = preset.fontFamily;
      state.titleFontFamily = preset.titleFontFamily;
      markStyleCustomized();
      ensureFontReady(state.fontFamily);
      syncControls();
      scheduleRender();
      showToast(`已切换为「${preset.label}」`);
    });
  });
}

function bindPhotoLayoutControls() {
  document.querySelectorAll("[data-photo-layout]").forEach((button) => {
    button.addEventListener("click", () => {
      applyPhotoLayoutPreset(button.dataset.photoLayout);
      markStyleCustomized();
    });
  });

  document.querySelectorAll("[data-photo-edit-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      setPhotoEditMode(button.dataset.photoEditMode);
    });
  });

  resetPhotoFrameButton.addEventListener("click", () => {
    state.photoFocusX = 50;
    state.photoFocusY = 50;
    state.photoEditMode = "frame";
    applyPhotoLayoutPreset(state.photoLayout, { notify: false });
    syncPhotoEditModeButtons();
    showToast("已重置照片区域和取景");
  });
}

function bindNoteTypeControls() {
  document.querySelectorAll("[data-note-type]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.noteType === state.noteType && !state.styleCustomized) return;
      applyNoteTypePreset(button.dataset.noteType);
    });
  });
}

function bindCustomStyleControls() {
  customStyleButton.addEventListener("click", () => {
    customStyleOpen = !customStyleOpen;
    syncStyleControls();
  });
}

function applyPhotoFocus(horizontalPosition, verticalPosition, { persist = false } = {}) {
  state.photoFocusX = clamp(horizontalPosition, 0, 100);
  state.photoFocusY = clamp(verticalPosition, 0, 100);
  updatePhotoGeometryStatus();
  scheduleRender({ persist });
}

function getPhotoFocusFromDrag(gesture, deltaX, deltaY) {
  if (!uploadedPhoto) {
    return {
      horizontalPosition: gesture.startFocusX,
      verticalPosition: gesture.startFocusY,
    };
  }

  const crop = calculateCoverCrop(
    uploadedPhoto.naturalWidth,
    uploadedPhoto.naturalHeight,
    gesture.startFrame.width,
    gesture.startFrame.height,
    gesture.startFocusX,
    gesture.startFocusY,
  );
  const scale = gesture.startFrame.width / crop.sourceWidth;
  const horizontalOverflow = uploadedPhoto.naturalWidth - crop.sourceWidth;
  const verticalOverflow = uploadedPhoto.naturalHeight - crop.sourceHeight;

  // 手指向右/下拖动时，照片内容跟随手指，因此取景窗口在源图上向左/上移动。
  const horizontalPosition =
    horizontalOverflow > 0
      ? gesture.startFocusX - (deltaX / scale / horizontalOverflow) * 100
      : gesture.startFocusX;
  const verticalPosition =
    verticalOverflow > 0
      ? gesture.startFocusY - (deltaY / scale / verticalOverflow) * 100
      : gesture.startFocusY;

  return { horizontalPosition, verticalPosition };
}

function getPhotoResizeFrame(startFrame, handle, deltaX, deltaY) {
  const { cardWidth, cardHeight, cardX, cardY } = getFixedCardMetrics();
  const bounds = getPhotoFrameBounds(cardX, cardY, cardWidth, cardHeight, 1);
  const startRight = startFrame.x + startFrame.width;
  const startBottom = startFrame.y + startFrame.height;
  let left = startFrame.x;
  let top = startFrame.y;
  let right = startRight;
  let bottom = startBottom;

  if (handle.includes("w")) {
    left = clamp(
      startFrame.x + deltaX,
      bounds.minX,
      startRight - MIN_PHOTO_FRAME_WIDTH,
    );
  }
  if (handle.includes("e")) {
    right = clamp(
      startRight + deltaX,
      startFrame.x + MIN_PHOTO_FRAME_WIDTH,
      bounds.maxX,
    );
  }
  if (handle.includes("n")) {
    top = clamp(
      startFrame.y + deltaY,
      bounds.minY,
      startBottom - MIN_PHOTO_FRAME_HEIGHT,
    );
  }
  if (handle.includes("s")) {
    bottom = clamp(
      startBottom + deltaY,
      startFrame.y + MIN_PHOTO_FRAME_HEIGHT,
      bounds.maxY,
    );
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

function hidePhotoAlignmentGuides() {
  clearTimeout(alignmentGuideTimer);
  photoAlignmentGuides.hidden = true;
  photoAlignmentGuides.classList.remove("is-x-aligned", "is-y-aligned");
}

function showPhotoAlignmentGuides({ xAligned, yAligned }) {
  clearTimeout(alignmentGuideTimer);
  photoAlignmentGuides.hidden = !(xAligned || yAligned);
  photoAlignmentGuides.classList.toggle("is-x-aligned", xAligned);
  photoAlignmentGuides.classList.toggle("is-y-aligned", yAligned);
  photoAlignmentLabel.textContent =
    xAligned && yAligned ? "正中心" : xAligned ? "水平居中" : "垂直居中";
}

function snapPhotoFrameToCenter(frame, gesture) {
  const nextFrame = { ...frame };
  const centerX = POSTER_WIDTH / 2;
  const centerY = POSTER_HEIGHT / 2;
  const thresholdX = CENTER_SNAP_SCREEN_PX * gesture.scaleX;
  const thresholdY = CENTER_SNAP_SCREEN_PX * gesture.scaleY;
  const xAligned =
    Math.abs(nextFrame.x + nextFrame.width / 2 - centerX) <= thresholdX;
  const yAligned =
    Math.abs(nextFrame.y + nextFrame.height / 2 - centerY) <= thresholdY;

  // 接近中心时按屏幕像素阈值吸附，既给出明确落点，也避免不同预览尺寸手感不一致。
  if (xAligned) nextFrame.x = centerX - nextFrame.width / 2;
  if (yAligned) nextFrame.y = centerY - nextFrame.height / 2;

  return { frame: nextFrame, xAligned, yAligned };
}

function finishPhotoGesture(pointerId) {
  if (!photoGesture || photoGesture.pointerId !== pointerId) return;
  const alignment = photoGesture.alignment;
  if (photoTransformOverlay.hasPointerCapture(pointerId)) {
    photoTransformOverlay.releasePointerCapture(pointerId);
  }
  photoTransformOverlay.classList.remove("is-transforming");
  photoGesture = null;
  persistState();
  updateRangeOutputs();
  if (alignment?.xAligned || alignment?.yAligned) {
    // 松手后短暂保留参考线，让用户确认落点；参考线属于 DOM，不会进入导出图片。
    alignmentGuideTimer = window.setTimeout(
      hidePhotoAlignmentGuides,
      CENTER_GUIDE_LINGER_MS,
    );
  } else {
    hidePhotoAlignmentGuides();
  }
}

function bindPhotoTransformGestures() {
  photoTransformOverlay.addEventListener("pointerdown", (event) => {
    if (!uploadedPhoto || (event.pointerType === "mouse" && event.button !== 0)) return;

    hidePhotoAlignmentGuides();
    const canvasRect = canvas.getBoundingClientRect();
    const resizeHandle = event.target.closest("[data-resize-handle]");
    photoGesture = {
      pointerId: event.pointerId,
      mode:
        state.photoEditMode === "crop"
          ? "crop"
          : resizeHandle
            ? "resize"
            : "move",
      handle: resizeHandle?.dataset.resizeHandle || "",
      startClientX: event.clientX,
      startClientY: event.clientY,
      scaleX: POSTER_WIDTH / canvasRect.width,
      scaleY: POSTER_HEIGHT / canvasRect.height,
      startFrame: getCurrentPhotoFrame(),
      startFocusX: Number(state.photoFocusX),
      startFocusY: Number(state.photoFocusY),
      alignment: null,
    };

    photoTransformOverlay.setPointerCapture(event.pointerId);
    photoTransformOverlay.classList.add("is-transforming");
    event.preventDefault();
  });

  photoTransformOverlay.addEventListener("pointermove", (event) => {
    if (!photoGesture || photoGesture.pointerId !== event.pointerId) return;

    const deltaX = (event.clientX - photoGesture.startClientX) * photoGesture.scaleX;
    const deltaY = (event.clientY - photoGesture.startClientY) * photoGesture.scaleY;
    if (photoGesture.mode === "crop") {
      hidePhotoAlignmentGuides();
      const focus = getPhotoFocusFromDrag(photoGesture, deltaX, deltaY);
      // 取景模式只移动源图内容，不改变照片区域在海报中的位置和尺寸。
      applyPhotoFocus(focus.horizontalPosition, focus.verticalPosition);
      event.preventDefault();
      return;
    }

    let frame =
      photoGesture.mode === "resize"
        ? getPhotoResizeFrame(
            photoGesture.startFrame,
            photoGesture.handle,
            deltaX,
            deltaY,
          )
        : {
            ...photoGesture.startFrame,
            x: photoGesture.startFrame.x + deltaX,
            y: photoGesture.startFrame.y + deltaY,
          };

    if (photoGesture.mode === "move") {
      const alignment = snapPhotoFrameToCenter(frame, photoGesture);
      frame = alignment.frame;
      photoGesture.alignment = alignment;
      showPhotoAlignmentGuides(alignment);
    } else {
      photoGesture.alignment = null;
      hidePhotoAlignmentGuides();
    }

    // 拖动过程按指针 1:1 更新，不增加缓动，避免照片与手指脱节。
    applyPhotoFrame(frame);
    event.preventDefault();
  });

  photoTransformOverlay.addEventListener("pointerup", (event) => {
    finishPhotoGesture(event.pointerId);
  });
  photoTransformOverlay.addEventListener("pointercancel", (event) => {
    finishPhotoGesture(event.pointerId);
  });

  photoTransformOverlay.addEventListener("keydown", (event) => {
    const direction = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }[event.key];
    if (!uploadedPhoto || !direction) return;

    const step = event.shiftKey ? 16 : 4;
    if (state.photoEditMode === "crop") {
      const focusStep = event.shiftKey ? 8 : 2;
      applyPhotoFocus(
        Number(state.photoFocusX) - direction[0] * focusStep,
        Number(state.photoFocusY) - direction[1] * focusStep,
        { persist: true },
      );
      event.preventDefault();
      return;
    }

    const frame = getCurrentPhotoFrame();
    if (event.altKey) {
      frame.width += direction[0] * step;
      frame.height += direction[1] * step;
    } else {
      frame.x += direction[0] * step;
      frame.y += direction[1] * step;
    }
    applyPhotoFrame(frame, { persist: true });
    event.preventDefault();
  });
}

function clearUploadedPhoto({ render = true, notify = true } = {}) {
  if (uploadedPhotoUrl) URL.revokeObjectURL(uploadedPhotoUrl);
  uploadedPhoto = null;
  uploadedPhotoUrl = "";
  photoGesture = null;
  hidePhotoAlignmentGuides();
  photoTransformOverlay.classList.remove("is-transforming");
  photoInput.value = "";
  photoStatus.textContent = "未选择照片，刷新后需要重新选择";
  photoTransformControls.hidden = true;
  photoTransformOverlay.hidden = true;
  removePhotoButton.hidden = true;
  updateRangeOutputs();

  if (render) scheduleRender({ persist: false });
  if (notify) showToast("已移除照片");
}

function bindPhotoControls() {
  photoInput.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (!file) return;

    if ((file.type && !file.type.startsWith("image/")) || file.size > MAX_PHOTO_BYTES) {
      photoInput.value = "";
      showToast(
        file.size > MAX_PHOTO_BYTES ? "照片不能超过 20 MB" : "请选择可识别的图片文件",
      );
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    const nextPhoto = new Image();
    nextPhoto.onload = () => {
      if (uploadedPhotoUrl) URL.revokeObjectURL(uploadedPhotoUrl);
      uploadedPhoto = nextPhoto;
      uploadedPhotoUrl = nextUrl;
      photoStatus.textContent = `${file.name} · ${nextPhoto.naturalWidth} × ${nextPhoto.naturalHeight}`;
      photoTransformControls.hidden = false;
      removePhotoButton.hidden = false;
      updateRangeOutputs();
      scheduleRender({ persist: false });
      showToast("照片已加入海报");
    };
    nextPhoto.onerror = () => {
      URL.revokeObjectURL(nextUrl);
      photoInput.value = "";
      showToast("当前浏览器无法读取这张照片，请尝试 JPG、PNG 或 WebP");
    };
    nextPhoto.src = nextUrl;
  });

  removePhotoButton.addEventListener("click", () => clearUploadedPhoto());
  window.addEventListener("beforeunload", () => {
    if (uploadedPhotoUrl) URL.revokeObjectURL(uploadedPhotoUrl);
  });
}

function createHistoryThumbnail(file) {
  return new Promise((resolve, reject) => {
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const thumbnail = document.createElement("canvas");
      thumbnail.width = 360;
      thumbnail.height = 480;
      const thumbnailContext = thumbnail.getContext("2d");
      const crop = calculateCoverCrop(
        image.naturalWidth,
        image.naturalHeight,
        thumbnail.width,
        thumbnail.height,
        50,
        50,
      );
      thumbnailContext.drawImage(
        image,
        crop.sourceX,
        crop.sourceY,
        crop.sourceWidth,
        crop.sourceHeight,
        0,
        0,
        thumbnail.width,
        thumbnail.height,
      );
      URL.revokeObjectURL(sourceUrl);
      resolve({
        name: file.name.replace(/\.[^.]+$/, "") || "历史封面",
        dataUrl: thumbnail.toDataURL("image/jpeg", 0.86),
        modifiedAt: file.lastModified || 0,
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(new Error(`无法读取 ${file.name}`));
    };
    image.src = sourceUrl;
  });
}

function renderHistoryCovers() {
  historyFeedGrid.querySelectorAll("[data-history-cover]").forEach((card) => card.remove());

  historyCovers.forEach((cover) => {
    const card = document.createElement("article");
    card.className = "feed-card feed-card-history";
    card.dataset.historyCover = "";

    const image = document.createElement("img");
    image.src = cover.dataUrl;
    image.alt = `${cover.name} 历史封面`;
    image.width = 360;
    image.height = 480;

    const title = document.createElement("h3");
    title.textContent = cover.name;

    const meta = document.createElement("div");
    meta.className = "feed-meta";
    const avatar = document.createElement("span");
    avatar.className = "feed-avatar";
    avatar.textContent = "你";
    const account = document.createElement("span");
    account.textContent = "你的账号";
    const like = document.createElement("span");
    like.className = "feed-like";
    like.textContent = "♡";
    meta.append(avatar, account, like);

    card.append(image, title, meta);
    historyFeedGrid.append(card);
  });

  historyEmptyState.hidden = historyCovers.length > 0;
  clearHistoryButton.hidden = historyCovers.length === 0;
  historyStatus.textContent = historyCovers.length
    ? `已加入 ${historyCovers.length} 张，仅用于本次主页对比`
    : "可临时加入最多 8 张旧封面，不会保存或上传";
}

function bindHistoryPreview() {
  historyCoverInput.addEventListener("change", async () => {
    const selectedFiles = Array.from(historyCoverInput.files || []);
    historyCoverInput.value = "";
    if (!selectedFiles.length) return;

    const validFiles = selectedFiles
      .filter(
        (file) =>
          ["image/png", "image/jpeg", "image/webp"].includes(file.type) &&
          file.size <= MAX_PHOTO_BYTES,
      )
      .sort((first, second) => second.lastModified - first.lastModified)
      .slice(0, MAX_HISTORY_COVERS);

    if (!validFiles.length) {
      showToast("请选择 20 MB 以内的 PNG、JPG 或 WebP");
      return;
    }

    historyStatus.textContent = "正在生成主页缩略图…";
    const results = await Promise.allSettled(validFiles.map(createHistoryThumbnail));
    historyCovers = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
      .slice(0, MAX_HISTORY_COVERS);
    renderHistoryCovers();

    if (historyCovers.length < selectedFiles.length) {
      showToast(`已加入 ${historyCovers.length} 张，部分文件因格式、大小或数量被忽略`);
    } else {
      showToast(`已加入 ${historyCovers.length} 张历史封面`);
    }
  });

  clearHistoryButton.addEventListener("click", () => {
    historyCovers = [];
    renderHistoryCovers();
    showToast("已清空临时历史封面");
  });
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

async function downloadPoster() {
  // 导出前等待字体文件，确保 PNG 与实时预览使用同一套字形。
  await Promise.all([
    ensureFontReady(state.fontFamily),
    ensureFontReady(state.titleFontFamily),
  ]);
  renderPoster();
  const { width, height } = getCanvasDimensions();
  const issue = state.topRight.replace(/[^\w\u4e00-\u9fa5-]+/g, "").toLowerCase() || "cover";
  canvas.toBlob((blob) => {
    if (!blob) {
      showToast("导出失败，请换一个浏览器重试。");
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `xiaohongshu-poster-${issue}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast(`已导出 ${width} × ${height} PNG`);
  }, "image/png");
}

function resetPoster() {
  clearUploadedPhoto({ render: false, notify: false });
  state = { ...defaults };
  customStyleOpen = false;
  syncControls();
  scheduleRender();
  showToast("已恢复示例内容");
}

function initialize() {
  bindNoteTypeControls();
  bindCustomStyleControls();
  bindStandardControls();
  bindColorControls();
  bindThemes();
  bindFontPresetControls();
  bindPhotoLayoutControls();
  bindPhotoControls();
  bindPhotoTransformGestures();
  bindPreviewModes();
  bindHistoryPreview();
  downloadButton.addEventListener("click", downloadPoster);
  resetButton.addEventListener("click", resetPoster);
  syncControls();
  renderHistoryCovers();
  renderPoster();
  ensureFontReady(state.fontFamily);
  ensureFontReady(state.titleFontFamily);
}

initialize();
