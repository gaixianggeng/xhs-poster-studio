const STORAGE_KEY = "xhs-poster-studio:v1";
const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1440;
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MIN_MAIN_SIZE = 60;
const MAX_MAIN_SIZE = 360;
const MAIN_SIZE_STEP = 2;
const MIN_MAIN_LINE_HEIGHT = 0.9;
const MAX_MAIN_LINE_HEIGHT = 1.5;
const MIN_TITLE_LINE_SCALE = 0.6;
const MAX_TITLE_LINE_SCALE = 1.5;
const MAX_CUSTOM_TITLE_LINES = 4;
const CARD_WIDTH_PERCENT = 84;
const CARD_HEIGHT_PERCENT = 88;
const CARD_CORNER_RADIUS = 52;
const MIN_PHOTO_FRAME_WIDTH = 220;
const MIN_PHOTO_FRAME_HEIGHT = 180;
const LEGACY_PHOTO_MODULE_OFFSET = -48;
const MAX_HISTORY_COVERS = 8;
const CENTER_SNAP_SCREEN_PX = 12;
const CENTER_GUIDE_LINGER_MS = 1200;
// 只有一种版式，文案不再按模板分抽屉：写过的字永远跟着你，切换呈现方式不会被替换。
// 模块通过 moduleToggles 开关，关掉时保留文字，随时开回来。
const MODULE_KEYS = Object.freeze(["corner", "eyebrow", "bigNumber", "subtitle", "footer"]);
const MODULE_LABELS = Object.freeze({
  corner: "角标",
  eyebrow: "上方副标题",
  bigNumber: "超大编号",
  subtitle: "下方副标题",
  footer: "底部文字",
});
// 主视觉区（照片或超大编号）与下方副标题各有两个预设槽位，位置之外不做自由拖拽，
// 卡片骨架仍然固定，主页才保持统一。
// 主视觉槽位沿用既有的 photoLayout 存储键：editorial = 标题下方，album = 标题上方。
// 只在读写处做一层语义映射，不为了改名去动二十多处调用和历史状态。
const HERO_SLOT_BY_LAYOUT = Object.freeze({ editorial: "below", album: "above" });
const SUBTITLE_SLOTS = Object.freeze(["below", "above"]);
// 已发布封面由前置数据脚本提供本地快照，不做账号登录、接口同步或后台抓取。
const PUBLISHED_COVER_SAMPLES = Object.freeze(
  Array.isArray(globalThis.XHS_PUBLISHED_COVER_SAMPLES)
    ? globalThis.XHS_PUBLISHED_COVER_SAMPLES.map((cover) => Object.freeze({ ...cover }))
    : [],
);
const DEFAULT_CONTENT = Object.freeze({
  topLeft: "TEST LOG",
  topRight: "#03",
  upperText: "1080 × 1440 导出检查",
  titleText: "预览就是\n最终成品",
  subtitleText: "编辑与导出复用同一套 Canvas",
  footerText: "EXPORT CHECK",
});
// 文案规则只在这里维护一份：字段提示、写法参考和字数校验都从这里读，
// 避免同一条规则同时写在 HTML 提示、原稿列表和 syncStyleControls 里三处各说一套。
// 文案规则只维护一份：字段提示、原稿列表和主标题字数校验都从这里读。
const COPY_GUIDE = Object.freeze({
  summary: "先给真实测试条件和明确结论，再用一张图片或超大编号承担证据。",
  bestFor: "测评、产品体验、结果对比、版本解读",
  roles: Object.freeze([
    { field: "corner", label: "角标", rule: "栏目名 + 期数", sample: "TEST LOG · #03" },
    {
      field: "upperText",
      label: "上方副标题",
      rule: "写测试条件或证据口径 · 6–16 字",
      sample: "1080 × 1440 导出检查",
    },
    {
      field: "titleText",
      label: "主标题",
      rule: "结论先行，先写产品再写结果 · 6–16 字，建议 2 行",
      sample: "预览就是 / 最终成品",
      min: 6,
      max: 16,
      lines: 2,
    },
    {
      field: "subtitleText",
      label: "下方副标题",
      rule: "补充结论依据、限制或适用人群 · 8–20 字",
      sample: "编辑与导出复用同一套 Canvas",
    },
    { field: "footerText", label: "底部文字", rule: "来源或方法标签 · 可留空", sample: "EXPORT CHECK" },
  ]),
});

const titleWordSegmenter =
  typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("zh-CN", { granularity: "word" })
    : null;

// 象牙与近黑是「满幅色场」系列的固定两层，只有满幅 accent 随主题变化。
const FIELD_CARD_COLOR = "#FAF9F5";
const FIELD_INK_COLOR = "#141413";
// accent 与象牙卡对比过低时，卡片轮廓会在白色信息流里消失；低于该比值就补一条墨色细边。
const CARD_OUTLINE_MIN_RATIO = 1.7;

// 主视觉区的两个槽位：editorial = 标题下方，album = 标题上方。
const photoLayoutPresets = Object.freeze({
  editorial: {
    photoFrameX: 150,
    photoFrameY: 878,
    photoFrameWidth: 780,
    photoFrameHeight: 340,
  },
  album: {
    photoFrameX: 132,
    photoFrameY: 218,
    photoFrameWidth: 816,
    photoFrameHeight: 500,
  },
});

const defaults = Object.freeze({
  styleCustomized: false,
  // 手动挑过配色后不再被默认值覆盖。
  themeCustomized: false,
  themeId: "cyanInk",
  contentMode: "text",
  // 模块开关：关掉只是不渲染，文字原样留在输入框里，随时开回来。
  // 主标题不在其中——它是这张封面的存在理由，不提供关闭。
  moduleToggles: Object.freeze({
    corner: true,
    eyebrow: true,
    bigNumber: false,
    subtitle: true,
    footer: true,
  }),
  subtitleSlot: "below",
  ...DEFAULT_CONTENT,
  footerAlign: "center",
  floatingPreviewSide: "right",
  backgroundColor: "#02181A",
  cardColor: "#41CFD8",
  textColor: "#04201F",
  // mediaColor 负责照片占位与视觉块底色，inkColor 负责插画墨线与装饰。
  mediaColor: "#02181A",
  inkColor: "#04201F",
  fontFamily: "grotesk",
  titleFontFamily: "grotesk",
  mainSize: 280,
  mainSizePreference: 280,
  mainLineHeight: 0.96,
  // null 表示跟随自动强调规则；用户拖动分行滑杆后保存每行比例。
  titleLineScales: null,
  upperSize: 30,
  subtitleSize: 40,
  groupGap: 32,
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

function getHeroSlot() {
  return HERO_SLOT_BY_LAYOUT[state.photoLayout] || "below";
}

function isModuleOn(key) {
  return state.moduleToggles?.[key] !== false;
}

// 模块「开着」还不够，对应字段有内容才真的渲染。
function hasModuleContent(key) {
  if (key === "corner") return Boolean(state.topLeft.trim() || state.topRight.trim());
  if (key === "eyebrow") return Boolean(state.upperText.trim());
  if (key === "subtitle") return Boolean(state.subtitleText.trim());
  if (key === "footer") return Boolean(state.footerText.trim());
  if (key === "bigNumber") return Boolean(state.topRight.trim());
  return true;
}

function isModuleVisible(key) {
  return isModuleOn(key) && hasModuleContent(key);
}

const THEME_FAMILIES = Object.freeze({
  ink: {
    label: "深底高对比",
    hint: "近黑画布 + 单一高饱和亮卡；缩略图冲击力最强，延续账号已发布的封面",
  },
  field: {
    label: "满幅色场",
    hint: "满幅色场 + 象牙承载卡 + 近黑墨线；适合观点、教程与深度内容",
  },
  paper: {
    label: "浅纸彩卡",
    hint: "浅纸画布 + 彩卡承载文字；卡片在白色信息流里最跳，适合单点主张",
  },
});

// 三套基础色系一律使用深色文字：白字在双列缩略图里冲击力不足。
// 每套只允许一个色相：背景、卡片、媒体块和墨线都由同一个色系派生。
const themes = Object.freeze({
  // ——「深底高对比」：近黑画布 + 高饱和亮卡 + 近黑字，取自账号已发布封面的实际取色。
  cyanInk: {
    label: "青绿墨底",
    family: "ink",
    backgroundColor: "#02181A",
    cardColor: "#41CFD8",
    textColor: "#04201F",
    mediaColor: "#02181A",
    inkColor: "#04201F",
  },
  emberInk: {
    label: "橙红墨底",
    family: "ink",
    backgroundColor: "#141010",
    cardColor: "#F2542C",
    textColor: "#210A03",
    mediaColor: "#141010",
    inkColor: "#210A03",
  },
  lemonInk: {
    label: "柠檬墨底",
    family: "ink",
    backgroundColor: "#0D1206",
    cardColor: "#D9F46C",
    textColor: "#1C2205",
    mediaColor: "#0D1206",
    inkColor: "#1C2205",
  },
  azureInk: {
    label: "电光蓝墨底",
    family: "ink",
    backgroundColor: "#050B16",
    cardColor: "#4FA8FF",
    textColor: "#04203E",
    mediaColor: "#050B16",
    inkColor: "#04203E",
  },
  monoInk: {
    label: "纯黑白",
    family: "ink",
    backgroundColor: "#000000",
    cardColor: "#F5F5F5",
    textColor: "#0A0A0A",
    mediaColor: "#000000",
    inkColor: "#0A0A0A",
  },
  violetInk: {
    label: "紫罗兰墨底",
    family: "ink",
    backgroundColor: "#0A0714",
    cardColor: "#B389FF",
    textColor: "#160A2E",
    mediaColor: "#0A0714",
    inkColor: "#160A2E",
  },
  magentaInk: {
    label: "品红墨底",
    family: "ink",
    backgroundColor: "#150710",
    cardColor: "#FF5C9E",
    textColor: "#2A0512",
    mediaColor: "#150710",
    inkColor: "#2A0512",
  },

  // ——「满幅色场」：accent 铺满画布、象牙卡承载文字、近黑负责所有墨线。
  cactusField: {
    label: "仙人掌绿",
    family: "field",
    backgroundColor: "#9DBFB1",
    cardColor: FIELD_CARD_COLOR,
    textColor: FIELD_INK_COLOR,
    mediaColor: "#9DBFB1",
    inkColor: FIELD_INK_COLOR,
  },
  heatherField: {
    label: "石楠紫",
    family: "field",
    backgroundColor: "#AFADCE",
    cardColor: FIELD_CARD_COLOR,
    textColor: FIELD_INK_COLOR,
    mediaColor: "#AFADCE",
    inkColor: FIELD_INK_COLOR,
  },
  clayField: {
    label: "陶土橙",
    family: "field",
    backgroundColor: "#D97757",
    cardColor: FIELD_CARD_COLOR,
    textColor: FIELD_INK_COLOR,
    mediaColor: "#D97757",
    inkColor: FIELD_INK_COLOR,
  },
  skyField: {
    label: "晴空蓝",
    family: "field",
    backgroundColor: "#6A9BCC",
    cardColor: FIELD_CARD_COLOR,
    textColor: FIELD_INK_COLOR,
    mediaColor: "#6A9BCC",
    inkColor: FIELD_INK_COLOR,
  },
  oliveField: {
    label: "橄榄绿",
    family: "field",
    backgroundColor: "#788C5D",
    cardColor: FIELD_CARD_COLOR,
    textColor: FIELD_INK_COLOR,
    mediaColor: "#788C5D",
    inkColor: FIELD_INK_COLOR,
  },
  signalGrid: {
    label: "编辑蓝",
    family: "field",
    backgroundColor: "#263F8F",
    cardColor: "#F1EEE6",
    textColor: "#17191D",
    mediaColor: "#263F8F",
    inkColor: "#17191D",
    decorator: "editorialTech",
    accentColor: "#E66749",
  },

  // ——「浅纸彩卡」：浅纸铺满画布，彩卡承载全部文字，靠浅底上的彩卡形成硬边。
  brickPaper: {
    label: "砖红纸",
    family: "paper",
    backgroundColor: "#F5EFE5",
    cardColor: "#F0714E",
    textColor: "#2E0D04",
    mediaColor: "#F5EFE5",
    inkColor: "#2E0D04",
  },
  forestPaper: {
    label: "墨绿纸",
    family: "paper",
    backgroundColor: "#F1F1E9",
    cardColor: "#7FB79F",
    textColor: "#0E2A20",
    mediaColor: "#F1F1E9",
    inkColor: "#0E2A20",
  },
  indigoPaper: {
    label: "靛蓝纸",
    family: "paper",
    backgroundColor: "#EEF0F5",
    cardColor: "#7FA8E8",
    textColor: "#0B1B3D",
    mediaColor: "#EEF0F5",
    inkColor: "#0B1B3D",
  },
  plumPaper: {
    label: "深梅纸",
    family: "paper",
    backgroundColor: "#F4EDEE",
    cardColor: "#E39BB8",
    textColor: "#35101F",
    mediaColor: "#F4EDEE",
    inkColor: "#35101F",
  },
});

const LEGACY_FIELD_THEME_COLORS = Object.freeze({
  cactusField: "#BCD1CA",
  heatherField: "#CBCADB",
});

const LEGACY_SIGNAL_GRID_COLORS = Object.freeze({
  backgroundColor: "#1E1E1E",
  cardColor: "#2144AB",
  textColor: "#D5E0EC",
  mediaColor: "#D5E0EC",
  inkColor: "#1E1E1E",
});

const THEME_COLOR_KEYS = Object.freeze([
  "backgroundColor",
  "cardColor",
  "textColor",
  "mediaColor",
  "inkColor",
]);

// 取出主题的颜色值，丢掉 label / family 这类描述字段，避免它们被写进 state。
function getThemeColors(themeId) {
  const theme = themes[themeId];
  if (!theme) return null;
  return Object.fromEntries(THEME_COLOR_KEYS.map((key) => [key, theme[key]]));
}

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

// 行距、组间距和副标题字号总是要一起调；单独拖任何一根滑杆都很难一次到位。
// 「标准」不写死数值，直接回到默认的推荐排版。
const rhythmPresets = Object.freeze({
  tight: {
    label: "紧凑",
    mainLineHeight: 0.92,
    groupGap: 34,
    upperSizeDelta: -4,
    subtitleSizeDelta: -4,
  },
  standard: { label: "标准" },
  airy: {
    label: "宽松",
    mainLineHeight: 1.08,
    groupGap: 104,
    upperSizeDelta: 2,
    subtitleSizeDelta: 2,
  },
});

const localFontDefinitions = Object.freeze({
  handwritten: {
    css: '500 96px "Yozai"',
    sample: "Codex 远程 到底稳不稳？",
    label: "自然手写",
  },
});

// 唯一版式的排版档案；最后一行默认承担缩略图里的记忆点。
const typographyProfiles = Object.freeze({
  titleWeight: 900,
  focusScale: 1.05,
  singleLineScale: 1.08,
  maxLineSizeRatio: 1.55,
  titleLineGapEm: -0.04,
  letterSpacingEm: -0.029,
  upperAlpha: 0.72,
  subtitleAlpha: 0.92,
  maxTitleLines: 4,
});

const canvas = document.querySelector("#posterCanvas");
const context = canvas.getContext("2d");
const feedPosterCanvas = document.querySelector("#feedPosterCanvas");
const feedPosterContext = feedPosterCanvas.getContext("2d");
const feedPosterTitle = document.querySelector("#feedPosterTitle");
const previewShell = document.querySelector(".preview-shell");
const floatingPreview = document.querySelector("#floatingPreview");
const floatingPreviewCanvas = document.querySelector("#floatingPreviewCanvas");
const floatingPreviewContext = floatingPreviewCanvas.getContext("2d");
const floatingPreviewMedia = window.matchMedia(
  "(min-width: 601px) and (max-width: 900px) and (any-pointer: coarse)",
);
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
const themeList = document.querySelector("#themeList");
const customStyleButton = document.querySelector("#customStyleButton");
const styleStatus = document.querySelector("#styleStatus");
const styleDescription = document.querySelector("#styleDescription");
const templateCopyGuideBestFor = document.querySelector("#templateCopyGuideBestFor");
const templateCopyGuideSummary = document.querySelector("#templateCopyGuideSummary");
const templateCopyGuideList = document.querySelector("#templateCopyGuideList");
const applyTemplateExampleButton = document.querySelector("#applyTemplateExampleButton");
const restoreTemplateContentButton = document.querySelector(
  "#restoreTemplateContentButton",
);
const cornerHint = document.querySelector("#cornerHint");
const upperTextHint = document.querySelector("#upperTextHint");
const titleTextHint = document.querySelector("#titleTextHint");
const subtitleTextHint = document.querySelector("#subtitleTextHint");
const footerTextHint = document.querySelector("#footerTextHint");
const titleTextCount = document.querySelector("#titleTextCount");
const titleLineSizeControls = document.querySelector("#titleLineSizeControls");
const titleLineSizeList = document.querySelector("#titleLineSizeList");
const resetTitleLineSizesButton = document.querySelector("#resetTitleLineSizesButton");
const photoLayoutPicker = document.querySelector("#photoLayoutPicker");
const photoPresetHint = document.querySelector("#photoPresetHint");
const historyCoverInput = document.querySelector("#historyCoverInput");
const loadPublishedCoversButton = document.querySelector("#loadPublishedCoversButton");
const loadPresetCoversButton = document.querySelector("#loadPresetCoversButton");
const clearHistoryButton = document.querySelector("#clearHistoryButton");
const historyStatus = document.querySelector("#historyStatus");
const historyFeedGrid = document.querySelector("#historyFeedGrid");
const historyEmptyState = document.querySelector("#historyEmptyState");
const editorialSamplePhoto = new Image();
editorialSamplePhoto.decoding = "async";
editorialSamplePhoto.src = "./assets/presets/editorial-workbench-sample-v1.jpg";

let state = loadState();
let renderFrame = 0;
let toastTimer = 0;
let uploadedPhoto = null;
let uploadedPhotoUrl = "";
const localFontPromises = new Map();
let photoGesture = null;
let alignmentGuideTimer = 0;
let floatingPreviewVisibilityFrame = 0;
// 参数工作台默认展示完整调节项，避免用户在文案、配色和排版之间反复展开与跳转。
let customStyleOpen = true;
let historyCovers = [];
let contentBeforeExample = null;

editorialSamplePhoto.addEventListener("load", () => {
  scheduleRender({ persist: false });
});

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const validSaved = saved && typeof saved === "object" ? saved : {};
    const merged = { ...defaults, ...validSaved };
    const hasSavedState = Object.keys(validSaved).length > 0;
    // 旧版按模板存的文案草稿已经取消：只保留当前这一份文案，草稿整体丢弃。
    delete merged.templateContentDrafts;
    delete merged.noteType;
    merged.moduleToggles = {
      ...defaults.moduleToggles,
      ...(validSaved.moduleToggles && typeof validSaved.moduleToggles === "object"
        ? Object.fromEntries(
            MODULE_KEYS.filter((key) =>
              Object.prototype.hasOwnProperty.call(validSaved.moduleToggles, key),
            ).map((key) => [key, validSaved.moduleToggles[key] !== false]),
          )
        : {}),
    };
    if (!SUBTITLE_SLOTS.includes(merged.subtitleSlot)) {
      merged.subtitleSlot = defaults.subtitleSlot;
    }
    // 旧版本把媒体块底色与装饰墨线合并成一个 visualColor，所以它既不能太深也不能太浅。
    // 升级时按角色拆成两个键：媒体块沿用用户原值，墨线跟随文字色，视觉结果不突变。
    if (!Object.prototype.hasOwnProperty.call(validSaved, "mediaColor")) {
      merged.mediaColor = normalizeHex(validSaved.visualColor) || defaults.mediaColor;
    }
    if (!Object.prototype.hasOwnProperty.call(validSaved, "inkColor")) {
      merged.inkColor = normalizeHex(validSaved.textColor) || defaults.inkColor;
    }
    merged.mediaColor = normalizeHex(merged.mediaColor) || defaults.mediaColor;
    merged.inkColor = normalizeHex(merged.inkColor) || defaults.inkColor;
    delete merged.visualColor;
    // 旧的十套配色已被当前预设取代。保留用户保存的色值，但只有在色值真的等于
    // 某套新配色时才声称命中，否则标记为 custom，不谎报当前激活的主题。
    if (
      !Object.prototype.hasOwnProperty.call(validSaved, "themeId") ||
      !Object.prototype.hasOwnProperty.call(themes, merged.themeId)
    ) {
      merged.themeId = inferThemeIdFromColors(merged) || "custom";
    }
    // 仅迁移上一版完整的旧信号蓝预设；其他保存色值仍按用户状态原样保留。
    // 这样刷新后不会继续显示已经撤回的三色像素风，也不会误改真正的自定义配色。
    if (
      merged.themeId === "signalGrid" &&
      THEME_COLOR_KEYS.every(
        (key) => normalizeHex(merged[key]) === normalizeHex(LEGACY_SIGNAL_GRID_COLORS[key]),
      )
    ) {
      Object.assign(merged, getThemeColors("signalGrid"));
    }
    // 只有当保存的色值确实还是这两套配色的旧值时才更新，手动改过的自定义色仍原样保留。
    const legacyFieldColor = LEGACY_FIELD_THEME_COLORS[merged.themeId];
    if (
      legacyFieldColor &&
      normalizeHex(merged.backgroundColor) === legacyFieldColor &&
      normalizeHex(merged.mediaColor) === legacyFieldColor
    ) {
      Object.assign(merged, getThemeColors(merged.themeId));
    }
    if (merged.themeId === "custom") merged.themeCustomized = true;
    if (!Object.prototype.hasOwnProperty.call(validSaved, "contentMode")) {
      merged.contentMode = "text";
    }
    if (!["text", "photo"].includes(merged.contentMode)) {
      merged.contentMode = defaults.contentMode;
    }
    // 未做过单篇样式覆盖时跟随推荐字体；用户主动选过的字体继续保留。
    if (!merged.styleCustomized) {
      merged.fontFamily = defaults.fontFamily;
      merged.titleFontFamily = defaults.titleFontFamily;
    }
    if (
      !["system", "grotesk", "rounded", "handwritten", "serif"].includes(
        merged.titleFontFamily,
      )
    ) {
      merged.titleFontFamily = defaults.titleFontFamily;
    }
    // 兼容旧版状态：首次升级时把用户原有字号作为偏好值，不强行恢复默认字号。
    if (!Object.prototype.hasOwnProperty.call(validSaved, "mainSizePreference")) {
      merged.mainSizePreference = merged.mainSize;
    }
    if (!Object.prototype.hasOwnProperty.call(validSaved, "mainLineHeight")) {
      merged.mainLineHeight = defaults.mainLineHeight;
    }
    merged.mainLineHeight = clamp(
      merged.mainLineHeight,
      MIN_MAIN_LINE_HEIGHT,
      MAX_MAIN_LINE_HEIGHT,
    );
    merged.titleLineScales = Array.isArray(validSaved.titleLineScales)
      ? validSaved.titleLineScales
          .slice(0, MAX_CUSTOM_TITLE_LINES)
          .map((scale) => clamp(scale, MIN_TITLE_LINE_SCALE, MAX_TITLE_LINE_SCALE))
      : null;
    if (!Object.prototype.hasOwnProperty.call(validSaved, "photoFocusY")) {
      merged.photoFocusY = Number.isFinite(Number(validSaved.photoPosition))
        ? Number(validSaved.photoPosition)
        : defaults.photoFocusY;
    }
    // 旧版“视频框”已并入「图在标题上方」；只迁移模式名，保留用户保存的照片区域与取景。
    if (merged.photoLayout === "video") {
      merged.photoLayout = "album";
    }
    if (!Object.prototype.hasOwnProperty.call(photoLayoutPresets, merged.photoLayout)) {
      merged.photoLayout = defaults.photoLayout;
    }
    if (!["frame", "crop"].includes(merged.photoEditMode)) {
      merged.photoEditMode = defaults.photoEditMode;
    }
    if (!["left", "right"].includes(merged.floatingPreviewSide)) {
      merged.floatingPreviewSide = defaults.floatingPreviewSide;
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






function inferThemeIdFromColors(source = state) {
  return Object.entries(themes).find(([, theme]) =>
    THEME_COLOR_KEYS.every(
      (key) => normalizeHex(theme[key]) === normalizeHex(source[key]),
    ),
  )?.[0];
}


function getTypographyProfile() {
  const baseProfile = typographyProfiles;
  const activeTheme = themes[state.themeId] || themes[inferThemeIdFromColors(state)];
  if (activeTheme?.decorator !== "editorialTech") return baseProfile;

  // 科技编辑风把变化交给留白、色面与信号标记，标题仍使用可读的现代黑体。
  // 适度收回字重、负字距与末行放大，避免中文长标题出现拥挤和断裂感。
  return {
    ...baseProfile,
    titleWeight: Math.min(baseProfile.titleWeight, 800),
    focusScale: Math.min(baseProfile.focusScale, 1.04),
    singleLineScale: Math.min(baseProfile.singleLineScale, 1.04),
    titleLineGapEm: Math.max(baseProfile.titleLineGapEm, -0.02),
    letterSpacingEm: Math.max(baseProfile.letterSpacingEm, -0.018),
  };
}

function getTitleDesiredSizes(lines, mainSize, profile = getTypographyProfile()) {
  return getEffectiveTitleLineScales(lines, profile).map((scale) => mainSize * scale);
}

function getDefaultTitleLineScales(lines, profile = getTypographyProfile()) {
  const focusIndex = Math.max(0, lines.length - 1);
  return lines.map((_, index) => {
    if (lines.length === 1) return profile.singleLineScale;
    return index === focusIndex ? profile.focusScale : 1;
  });
}

function getEffectiveTitleLineScales(lines, profile = getTypographyProfile()) {
  const automaticScales = getDefaultTitleLineScales(lines, profile);
  if (!Array.isArray(state.titleLineScales)) return automaticScales;

  return lines.map((_, index) =>
    clamp(
      state.titleLineScales[index] ?? automaticScales[index],
      MIN_TITLE_LINE_SCALE,
      MAX_TITLE_LINE_SCALE,
    ),
  );
}

function mergeSingleCjkTitleTokens(tokens) {
  const merged = [];
  for (let index = 0; index < tokens.length; ) {
    if (!/^[\p{Script=Han}]$/u.test(tokens[index])) {
      merged.push(tokens[index]);
      index += 1;
      continue;
    }

    const run = [];
    while (index < tokens.length && /^[\p{Script=Han}]$/u.test(tokens[index])) {
      run.push(tokens[index]);
      index += 1;
    }
    for (let runIndex = 0; runIndex < run.length; runIndex += 2) {
      merged.push(run.slice(runIndex, runIndex + 2).join(""));
    }
  }
  return merged;
}

function splitTitleLineForEmphasis(
  line,
  size,
  maxWidth,
  weight,
  family,
  letterSpacingEm,
) {
  const segmentedTokens = titleWordSegmenter
    ? Array.from(titleWordSegmenter.segment(line), ({ segment }) => segment)
    : line.match(/[A-Za-z0-9][A-Za-z0-9.+/#:&_-]*|\s+|./gu) || Array.from(line);
  const tokens = mergeSingleCjkTitleTokens(segmentedTokens);
  if (tokens.length < 2) return null;

  context.font = fontString(weight, size, family);
  const candidates = [];
  for (let index = 1; index < tokens.length; index += 1) {
    const left = tokens.slice(0, index).join("").trim();
    const right = tokens.slice(index).join("").trim();
    if (!left || !right) continue;

    const spacing = size * letterSpacingEm;
    const leftWidth = measureSpacedText(left, spacing);
    const rightWidth = measureSpacedText(right, spacing);
    const boundaryHasSpace =
      /\s/u.test(tokens[index - 1] || "") || /\s/u.test(tokens[index] || "");
    const score =
      Math.max(leftWidth, rightWidth) + Math.abs(leftWidth - rightWidth) * 0.18;
    candidates.push({ left, right, score, boundaryHasSpace });
  }

  // 有自然空格时只在词组边界拆行，避免出现 “Codex 已 / 经快两天” 这类机械断句。
  const naturalCandidates = candidates.filter((candidate) => {
    if (!candidate.boundaryHasSpace) return false;
    // 不把单个数字或单字留成一整行，例如教程标题里的“3 步”不能被拆成“3 / 步…”。
    return (
      Array.from(candidate.left.replace(/\s/gu, "")).length >= 2 &&
      Array.from(candidate.right.replace(/\s/gu, "")).length >= 2
    );
  });
  const candidatePool = naturalCandidates.length ? naturalCandidates : candidates;
  const bestSplit = candidatePool.reduce(
    (best, candidate) => (!best || candidate.score < best.score ? candidate : best),
    null,
  );
  return bestSplit ? [bestSplit.left, bestSplit.right] : null;
}

function wrapTitleLinesForEmphasis(
  lines,
  mainSize,
  maxWidth,
  profile = getTypographyProfile(),
) {
  const wrapped = [...lines];
  if (!wrapped.length) return wrapped;
  // 用户已经手动换行时，以手动结构为准；超宽单行交给逐行缩放，不能擅自再拆出第四行。
  if (wrapped.length > 1) return wrapped;

  // 旧封面突出的关键不是单纯字号，而是把长句拆成更多展示行，让标题主动占用纵向空间。
  while (wrapped.length < profile.maxTitleLines) {
    context.font = fontString(profile.titleWeight, mainSize, state.titleFontFamily);
    const widths = wrapped.map((line) =>
      measureSpacedText(line || " ", mainSize * profile.letterSpacingEm),
    );
    const widestWidth = Math.max(...widths);
    if (widestWidth <= maxWidth * 0.78) break;

    const widestIndex = widths.indexOf(widestWidth);
    const split = splitTitleLineForEmphasis(
      wrapped[widestIndex],
      mainSize,
      maxWidth,
      profile.titleWeight,
      state.titleFontFamily,
      profile.letterSpacingEm,
    );
    if (!split) break;
    wrapped.splice(widestIndex, 1, ...split);
  }

  return wrapped;
}

const CONTENT_KEYS = Object.freeze([
  "topLeft",
  "topRight",
  "upperText",
  "titleText",
  "subtitleText",
  "footerText",
]);

function getContentSnapshot(source = state) {
  return Object.fromEntries(CONTENT_KEYS.map((key) => [key, String(source?.[key] ?? "")]));
}

function isSameContent(source, other) {
  return CONTENT_KEYS.every(
    (key) => String(source?.[key] ?? "") === String(other?.[key] ?? ""),
  );
}

function applyContentSnapshot(snapshot) {
  CONTENT_KEYS.forEach((key) => {
    state[key] = String(snapshot?.[key] ?? "");
  });
  // 换了一整份文案，行数与断句都变了，回到自动强调而不是沿用上一份的逐行比例。
  state.titleLineScales = null;
}

// 示例文案只是一次性替换，随时可以撤回；不再有“每个模板一份草稿”这种会吞掉文字的机制。
function loadContentExample() {
  if (isSameContent(state, DEFAULT_CONTENT)) {
    showToast("当前已经是示例文案");
    return;
  }

  contentBeforeExample = getContentSnapshot(state);
  applyContentSnapshot(DEFAULT_CONTENT);
  syncControls();
  scheduleRender();
  showToast("已载入示例文案；可以按字段逐项替换，原文仍可恢复");
}

function restoreContentBeforeExample() {
  if (!contentBeforeExample) {
    syncStyleControls();
    return;
  }

  applyContentSnapshot(contentBeforeExample);
  contentBeforeExample = null;
  syncControls();
  scheduleRender();
  showToast("已恢复载入示例前的文案");
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

function getRelativeLuminance(value) {
  const hex = normalizeHex(value);
  if (!hex) return 0;
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function getContrastRatio(firstColor, secondColor) {
  const first = getRelativeLuminance(firstColor);
  const second = getRelativeLuminance(secondColor);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

// 媒体块底色可深可浅：满幅色场与信号蓝使用浅色块，深底系列使用深色块。
// 墨线与块内文字统一走这里选色，避免出现近黑线画在深块上这种不可读组合。
function pickReadableInk(backgroundColor) {
  const candidates = [state.inkColor, state.textColor, state.cardColor, FIELD_CARD_COLOR];
  return candidates.reduce((best, candidate) => {
    if (!normalizeHex(candidate)) return best;
    return getContrastRatio(candidate, backgroundColor) >
      getContrastRatio(best, backgroundColor)
      ? candidate
      : best;
  }, state.inkColor);
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
  // 本地手写字体只有一个真实字重；固定为 500，避免浏览器合成粗体破坏笔画。
  const localFontWeights = { handwritten: 500 };
  const effectiveWeight = localFontWeights[family] || weight;
  return `${effectiveWeight} ${size}px ${fontStacks[family] || fontStacks.system}`;
}

function ensureFontReady(family = state.fontFamily) {
  const definition = localFontDefinitions[family];
  if (!definition || !document.fonts?.load) return Promise.resolve();
  if (localFontPromises.has(family)) return localFontPromises.get(family);

  // Canvas 不会自动重绘异步到达的 Web Font，因此加载完成后重新计算字号上限并渲染。
  const promise = document.fonts
    .load(definition.css, definition.sample)
    .then((faces) => {
      if (!faces.length) throw new Error("font unavailable");
      if (state.fontFamily === family || state.titleFontFamily === family) {
        // 字体换了以后文字宽度变了，但状态签名没变，必须显式作废上限缓存。
        invalidateMainSizeLimit();
        syncMainSizeLimit();
        updateRangeOutputs();
        scheduleRender({ persist: false });
      }
    })
    .catch(() => {
      localFontPromises.delete(family);
      showToast(`${definition.label}字体加载失败，已使用系统字体`);
    });

  localFontPromises.set(family, promise);
  return promise;
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

function getCurrentRenderedTitleLines() {
  const { cardWidth } = getFixedCardMetrics();
  const maxContentWidth = Math.max(1, cardWidth - Number(state.sidePadding) * 2);
  // 分行控件必须对应 Canvas 里的实际展示行；自动拆行后也按预览顺序提供滑杆。
  return wrapTitleLinesForEmphasis(
    splitLines(state.titleText),
    Number(state.mainSize),
    maxContentWidth,
    getTypographyProfile(),
  ).slice(0, MAX_CUSTOM_TITLE_LINES);
}

// 滑杆右半段长期是空行程：目标字号早被行宽和可用高度压住，再拖也不会更大。
// 这里逐格试出真正能生效的最大值，让滑杆的右端就是画布上的上限。
let mainSizeLimitCache = { signature: null, limit: MAX_MAIN_SIZE };

function getMainSizeLimitSignature() {
  return [
    JSON.stringify(state.moduleToggles),
    state.subtitleSlot,
    state.titleText,
    state.upperText,
    state.subtitleText,
    state.titleFontFamily,
    state.fontFamily,
    state.sidePadding,
    state.mainLineHeight,
    state.groupGap,
    state.upperSize,
    state.subtitleSize,
    state.photoLayout,
    state.contentMode,
    state.photoFrameX,
    state.photoFrameY,
    state.photoFrameWidth,
    state.photoFrameHeight,
    Array.isArray(state.titleLineScales) ? state.titleLineScales.join(",") : "auto",
    uploadedPhoto ? "photo" : "none",
  ].join("|");
}

function invalidateMainSizeLimit() {
  mainSizeLimitCache = { signature: null, limit: mainSizeLimitCache.limit };
}

// 二分：某个字号画出来还等于它自己，就说明没被压缩，可以再往上试。
let measuringMainSizeLimit = false;

function searchMaxEffectiveMainSize() {
  const restore = state.mainSize;
  let low = 0;
  let high = Math.floor((MAX_MAIN_SIZE - MIN_MAIN_SIZE) / MAIN_SIZE_STEP);
  let best = null;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const size = MIN_MAIN_SIZE + middle * MAIN_SIZE_STEP;
    state.mainSize = size;
    renderPoster();
    if (renderedTitleSize !== null && renderedTitleSize >= size - 1) {
      best = size;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  // 试探过程会把中间字号画到可见画布上；恢复原值，由调用方在退出量测状态后补一帧。
  state.mainSize = restore;
  return best ?? MIN_MAIN_SIZE;
}

function calculateMainSizeLimit() {
  // 没有标题时不存在收敛问题，保留完整范围。
  if (!splitLines(state.titleText).length) return MAX_MAIN_SIZE;

  // 试探过程本身会渲染；万一哪条渲染路径又回头问上限，直接返回上一次的结果。
  if (measuringMainSizeLimit) return mainSizeLimitCache.limit;
  if (mainSizeLimitCache.signature === getMainSizeLimitSignature()) {
    return mainSizeLimitCache.limit;
  }

  measuringMainSizeLimit = true;
  let limit;
  try {
    limit = searchMaxEffectiveMainSize();
  } finally {
    measuringMainSizeLimit = false;
  }
  // 退出量测状态后补画一帧，把画布和缩略图从试探中途的字号拉回真实状态。
  renderPoster();
  // 渲染会把照片区域夹回边界内，签名要按试探结束后的状态记录，否则下次必然落空。
  mainSizeLimitCache = { signature: getMainSizeLimitSignature(), limit };
  return limit;
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

function drawEditorialTechDecorations({ cardX, cardY, cardWidth, cardHeight, layoutScale }) {
  const theme = themes[state.themeId] || themes[inferThemeIdFromColors(state)];
  if (theme?.decorator !== "editorialTech") return;

  context.save();
  // 信号标记只占用卡片左右安全边缘，并裁在固定圆角内；不侵入标题、正文和照片区域。
  roundedRectPath(
    context,
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    CARD_CORNER_RADIUS * layoutScale,
  );
  context.clip();

  context.fillStyle = theme.accentColor;
  context.fillRect(
    cardX + 26 * layoutScale,
    cardY + 174 * layoutScale,
    6 * layoutScale,
    70 * layoutScale,
  );

  context.fillStyle = state.inkColor;
  context.globalAlpha = 0.14;
  const dotX = cardX + cardWidth - 28 * layoutScale;
  const dotY = cardY + 176 * layoutScale;
  const dotRadius = 2.4 * layoutScale;
  for (let row = 0; row < 6; row += 1) {
    context.beginPath();
    context.arc(dotX, dotY + row * 16 * layoutScale, dotRadius, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
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
  return {
    minX: cardX + 20 * layoutScale,
    minY: cardY + 132 * layoutScale,
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
      (state.photoLayout === "album" ? 40 : 28) *
        layoutScale,
      frame.height / 2,
    ),
  };
}

function drawPhotoWindow(metrics, image = uploadedPhoto) {
  if (!image) return;

  // 采用 cover 裁切；用户照片沿用可拖动焦点，内置示例固定居中，保证窗口填满且不拉伸。
  const focusX = image === uploadedPhoto ? state.photoFocusX : 50;
  const focusY = image === uploadedPhoto ? state.photoFocusY : 50;
  const crop = calculateCoverCrop(
    image.naturalWidth,
    image.naturalHeight,
    metrics.width,
    metrics.height,
    focusX,
    focusY,
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
    image,
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

function fitScale(
  lines,
  sizes,
  weight,
  maxWidth,
  minimumScale = 0.54,
  family = state.fontFamily,
  letterSpacingEm = 0,
) {
  if (!lines.length) return 1;

  let scale = 1;
  lines.forEach((line, index) => {
    const text = line || " ";
    const size = sizes[Math.min(index, sizes.length - 1)];
    context.font = fontString(weight, size, family);
    const measured = measureSpacedText(text, size * letterSpacingEm);
    if (measured > maxWidth) scale = Math.min(scale, maxWidth / measured);
  });
  return Math.max(minimumScale, scale);
}

function balanceTitleLineSizes(sizes, maximumRatio) {
  if (sizes.length < 3 || !Number.isFinite(maximumRatio)) return sizes;

  const sortedSizes = [...sizes].sort((left, right) => left - right);
  const referenceSize = sortedSizes[Math.floor((sortedSizes.length - 1) / 2)];
  const maximumSize = referenceSize * maximumRatio;

  // 三行以上的标题不能让一个极短词吃掉整组高度；保留强调，但优先保证其余长行在信息流里可读。
  return sizes.map((size) => Math.min(size, maximumSize));
}

function createBlock(lines, desiredSizes, options) {
  if (!lines.length) {
    return { lines: [], sizes: [], height: 0, lineGap: 0, lineGaps: [], options };
  }

  let scales;
  if (options.fitMode === "perLine") {
    // 主标题逐行适配：长行只缩小自己，短的重点行保留大字号，避免整组被最长一行拖小。
    scales = lines.map((line, index) => {
      const text = line || " ";
      const size = desiredSizes[Math.min(index, desiredSizes.length - 1)];
      context.font = fontString(options.weight, size, options.family);
      const measured = measureSpacedText(text, size * (options.letterSpacingEm || 0));
      return measured > options.maxWidth ? options.maxWidth / measured : 1;
    });
  } else {
    const scale = fitScale(
      lines,
      desiredSizes,
      options.weight,
      options.maxWidth,
      options.minScale,
      options.family,
      options.letterSpacingEm,
    );
    scales = desiredSizes.map(() => scale);
  }

  let sizes = desiredSizes.map((size, index) => Math.round(size * scales[index]));
  if (options.fitMode === "perLine") {
    sizes = balanceTitleLineSizes(sizes, options.maxLineSizeRatio);
  }
  const gapScale = Math.min(...scales);
  const lineGap = Math.round((options.lineGap || 0) * gapScale);
  const lineHeight = Number.isFinite(options.lineHeight)
    ? clamp(options.lineHeight, MIN_MAIN_LINE_HEIGHT, MAX_MAIN_LINE_HEIGHT)
    : null;
  // 主标题逐行字号可以不同，因此行距也按每一行的实际字号计算，滑杆调整才会与预览一致。
  const lineGaps = lines.slice(0, -1).map((_, index) =>
    lineHeight === null ? lineGap : Math.round(sizes[index] * (lineHeight - 1)),
  );
  const height =
    sizes.reduce((sum, size) => sum + size, 0) +
    lineGaps.reduce((sum, gap) => sum + gap, 0);
  return { lines, sizes, height, lineGap, lineGaps, options };
}

function drawTextWithSpacing(text, x, baseline, spacing) {
  if (!spacing) {
    context.fillText(text, x, baseline);
    return;
  }

  let cursor = x;
  Array.from(text).forEach((character, index, characters) => {
    context.fillText(character, cursor, baseline);
    cursor += context.measureText(character).width;
    if (index < characters.length - 1) cursor += spacing;
  });
}

// 主标题字号会先按行宽收敛、再按可用高度整体压缩，滑杆上的“目标字号”常常不是画布上的字号。
// 这里在真正绘制时记录最终字号，让滑杆能显示实际值，而不是让用户拖着猜。
let renderedTitleSize = null;
let renderedTitleLineSizes = [];

function recordRenderedTitleSize(block) {
  // 只有主标题用 perLine 逐行适配；副标题、步骤轨道等不参与。
  if (block.options.fitMode !== "perLine" || !block.sizes.length) return;
  renderedTitleLineSizes = block.sizes.map((size) => Math.round(size));
  renderedTitleSize = Math.max(...renderedTitleLineSizes);
}

function drawBlock(block, x, top) {
  if (!block.lines.length) return;
  recordRenderedTitleSize(block);

  context.save();
  context.fillStyle = state.textColor;
  context.globalAlpha = block.options.alpha ?? 1;
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
    drawTextWithSpacing(
      line,
      x,
      lineTop + size * 0.82,
      size * (block.options.letterSpacingEm || 0),
    );
    lineTop += size + (block.lineGaps[index] ?? block.lineGap);
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

function scaleTextBlock(block, scale) {
  if (scale >= 1 || !block.height) return block;
  return {
    ...block,
    sizes: block.sizes.map((size) => Math.max(1, Math.round(size * scale))),
    lineGap: block.lineGap * scale,
    lineGaps: block.lineGaps.map((gap) => gap * scale),
    height: block.height * scale,
  };
}

function getOpticalStackTop(regionTop, regionBottom, stackHeight, bias = 0.48) {
  const availableHeight = Math.max(1, regionBottom - regionTop);
  const remainingHeight = Math.max(0, availableHeight - stackHeight);
  // 视觉中心略高于几何中心：大标题的黑色重量更靠上，照片或步骤轨道负责稳定下半区。
  return regionTop + remainingHeight * bias;
}

// 大标题受卡片宽度限制，往往无法再放大，内容因此明显短于卡片高度。
// 这时把富余空间摊到每一条缝隙上（含首块之前与末块之后），避免某一处出现整块空白。
// 但完全平均会让眉题、标题、副标题之间和上下外边距一样松，整组读起来是散的；
// INNER_SLACK_WEIGHT 让内部缝隙只拿到外侧缝隙的一部分，文字收成一组，留白留在上下。
// minGaps[i] 是第 i 块之后必须保留的最小间隙，空间不足时只剩这些最小值。
const INNER_SLACK_WEIGHT = 0.38;

function distributeVerticalSlack(regionTop, regionBottom, heights, minGaps = []) {
  const totalHeight = heights.reduce((sum, height) => sum + height, 0);
  const totalMinGap = minGaps.reduce((sum, gap) => sum + gap, 0);
  const seamCount = heights.length + 1;
  const slack = Math.max(
    0,
    regionBottom - regionTop - totalHeight - totalMinGap,
  );
  // 首尾两条缝隙权重为 1，中间的都按 INNER_SLACK_WEIGHT 缩小。
  const weights = Array.from({ length: seamCount }, (_, index) =>
    index === 0 || index === seamCount - 1 ? 1 : INNER_SLACK_WEIGHT,
  );
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const unit = weightTotal > 0 ? slack / weightTotal : 0;
  const tops = [];
  let cursor = regionTop + unit * weights[0];
  heights.forEach((height, index) => {
    tops.push(cursor);
    cursor += height + (minGaps[index] ?? 0) + unit * weights[index + 1];
  });
  return tops;
}

function drawTemplateCornerLabels({
  cardX,
  cardY,
  cardWidth,
  padding,
  maxContentWidth,
  layoutScale,
}) {
  const baseline = cardY + 105 * layoutScale;
  drawCornerLabel(
    state.topLeft.trim(),
    cardX + padding,
    baseline,
    "left",
    maxContentWidth * 0.42,
    layoutScale,
  );
  drawCornerLabel(
    state.topRight.trim(),
    cardX + cardWidth - padding,
    baseline,
    "right",
    maxContentWidth * 0.42,
    layoutScale,
  );
}

function drawEyebrowChip(text, x, top, maxWidth, layoutScale, scale, filled) {
  const value = text.trim();
  if (!value) return 0;

  let fontSize = 29 * layoutScale * scale;
  const horizontalPadding = 20 * layoutScale * scale;
  const height = 58 * layoutScale * scale;
  context.font = fontString(800, fontSize, state.fontFamily);
  const measured = context.measureText(value).width;
  const availableTextWidth = Math.max(1, maxWidth - horizontalPadding * 2);
  if (measured > availableTextWidth) {
    fontSize *= availableTextWidth / measured;
  }

  context.font = fontString(800, fontSize, state.fontFamily);
  const width = Math.min(
    maxWidth,
    context.measureText(value).width + horizontalPadding * 2,
  );
  context.save();
  roundedRectPath(context, x, top, width, height, height / 2);
  if (filled) {
    context.fillStyle = state.textColor;
    context.fill();
  } else {
    context.strokeStyle = state.textColor;
    context.globalAlpha = 0.42;
    context.lineWidth = 2 * layoutScale * scale;
    context.stroke();
    context.globalAlpha = 1;
  }
  context.fillStyle = filled ? state.cardColor : state.textColor;
  context.textBaseline = "middle";
  context.textAlign = "left";
  context.fillText(value, x + horizontalPadding, top + height * 0.52);
  context.restore();
  return height;
}

// 唯一版式的内容渲染：模块开关决定画不画，槽位决定画在标题上方还是下方。
// 卡片骨架、角标行和页脚位置固定，模块只在这套骨架内部增减。
function photoActive() {
  return state.contentMode === "photo";
}

function renderCoverContent({
  cardX,
  cardY,
  cardWidth,
  cardHeight,
  padding,
  heroWindow,
  layoutScale,
}) {
  const contentX = cardX + padding;
  const maxContentWidth = cardWidth - padding * 2;

  if (isModuleVisible("corner")) {
    drawTemplateCornerLabels({
      cardX,
      cardY,
      cardWidth,
      padding,
      maxContentWidth,
      layoutScale,
    });
  }

  const typography = getTypographyProfile();
  const mainSize = Number(state.mainSize) * layoutScale;
  const subtitleSize = Number(state.subtitleSize) * layoutScale;
  const titleLines = wrapTitleLinesForEmphasis(
    splitLines(state.titleText),
    mainSize,
    maxContentWidth,
    typography,
  );
  let mainBlock = createBlock(
    titleLines,
    getTitleDesiredSizes(titleLines, mainSize, typography),
    {
      weight: typography.titleWeight,
      family: state.titleFontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.46,
      fitMode: "perLine",
      letterSpacingEm: typography.letterSpacingEm,
      maxLineSizeRatio: typography.maxLineSizeRatio,
      lineHeight: Number(state.mainLineHeight),
    },
  );

  const showSubtitle = isModuleVisible("subtitle");
  const subtitleLines = showSubtitle ? splitLines(state.subtitleText) : [];
  let subtitleBlock = createBlock(
    subtitleLines,
    subtitleLines.map(() => subtitleSize),
    {
      weight: 800,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.58,
      lineGap: subtitleSize * 0.18,
      alpha: typography.subtitleAlpha,
    },
  );

  const hasEyebrow = isModuleVisible("eyebrow");
  let scale = 1;
  let eyebrowHeight = hasEyebrow ? 58 * layoutScale : 0;

  // 槽位决定顺序：副标题可以落在标题下方（默认）或标题上方。
  const subtitleAbove = state.subtitleSlot === "above" && subtitleBlock.height > 0;
  const order = [];
  if (hasEyebrow) order.push("eyebrow");
  if (subtitleAbove) order.push("subtitle");
  order.push("title");
  if (subtitleBlock.height > 0 && !subtitleAbove) order.push("subtitle");

  const gapAfter = { eyebrow: 28 * layoutScale, subtitle: 26 * layoutScale, title: 26 * layoutScale };
  const heightOf = (kind) =>
    kind === "eyebrow" ? eyebrowHeight : kind === "title" ? mainBlock.height : subtitleBlock.height;
  const gapsFor = () => order.slice(0, -1).map((kind) => gapAfter[kind] * scale);
  const stackOf = () =>
    order.reduce((sum, kind) => sum + heightOf(kind), 0) +
    gapsFor().reduce((sum, gap) => sum + gap, 0);

  let stackHeight = stackOf();
  // 槽位只对照片有意义；纯编号主视觉固定画在卡片上方，正文一定排在它下面。
  const heroFirst = Boolean(heroWindow) && (!photoActive() || getHeroSlot() === "above");
  const regionTop = heroFirst
    ? heroWindow.y + heroWindow.height + 36 * layoutScale
    : cardY + (isModuleVisible("corner") ? 158 : 118) * layoutScale;
  const regionBottom =
    heroWindow && !heroFirst
      ? heroWindow.y - 34 * layoutScale
      : cardY + cardHeight - (isModuleVisible("footer") ? 88 : 56) * layoutScale;
  const availableHeight = Math.max(1, regionBottom - regionTop);

  if (stackHeight > availableHeight) {
    // 先压缩眉题、解释文字和间距；标题只有在副信息已经让位后才缩小。
    const supportingHeight = eyebrowHeight + subtitleBlock.height;
    const overflow = stackHeight - availableHeight;
    scale = supportingHeight > 0 ? Math.max(0.76, 1 - overflow / supportingHeight) : 1;
    subtitleBlock = scaleTextBlock(subtitleBlock, scale);
    eyebrowHeight *= scale;
    stackHeight = stackOf();

    if (stackHeight > availableHeight) {
      const others = stackHeight - mainBlock.height;
      mainBlock = scaleTextBlock(
        mainBlock,
        Math.max(0.62, Math.max(1, availableHeight - others) / mainBlock.height),
      );
      stackHeight = stackOf();
    }

    if (stackHeight > availableHeight) {
      const finalScale = availableHeight / stackHeight;
      mainBlock = scaleTextBlock(mainBlock, finalScale);
      subtitleBlock = scaleTextBlock(subtitleBlock, finalScale);
      eyebrowHeight *= finalScale;
      scale *= finalScale;
      stackHeight = stackOf();
    }
  }

  const drawKind = (kind, top) => {
    if (kind === "eyebrow") {
      drawEyebrowChip(state.upperText, contentX, top, maxContentWidth, layoutScale, scale, true);
    } else if (kind === "title") {
      drawBlock(mainBlock, contentX, top);
    } else {
      drawBlock(subtitleBlock, contentX, top);
    }
  };

  // 没有主视觉时各块独立定位，富余空间按加权摊到每条缝隙；
  // 有主视觉时它已经占住一半，整组按视觉重心摆放。
  if (!heroWindow) {
    const tops = distributeVerticalSlack(
      regionTop + Number(state.verticalOffset) * layoutScale,
      regionBottom,
      order.map(heightOf),
      gapsFor(),
    );
    order.forEach((kind, index) => drawKind(kind, tops[index]));
  } else {
    let cursorY =
      getOpticalStackTop(regionTop, regionBottom, stackHeight, 0.46) +
      Number(state.verticalOffset) * layoutScale;
    cursorY = clamp(cursorY, regionTop, Math.max(regionTop, regionBottom - stackHeight));
    const gaps = gapsFor();
    order.forEach((kind, index) => {
      drawKind(kind, cursorY);
      cursorY += heightOf(kind) + (gaps[index] ?? 0);
    });
  }

  if (isModuleVisible("footer")) {
    drawSpacedText(
      state.footerText.trim(),
      contentX,
      cardY + cardHeight - 37 * layoutScale,
      maxContentWidth,
      state.footerAlign,
      layoutScale,
    );
  }
}

function drawPlaceholderVisual(metrics, layoutScale) {
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
  const blockColor = normalizeHex(state.mediaColor) || defaults.mediaColor;
  context.fillStyle = blockColor;
  context.fillRect(metrics.x, metrics.y, metrics.width, metrics.height);

  // 三层结构：accent 块打底，墨线在上，承载色负责实心点，一个视觉块只出现一个色相。
  const inkOnBlock = pickReadableInk(blockColor);
  const accentColor =
    getContrastRatio(state.cardColor, blockColor) >= 1.6 ? state.cardColor : inkOnBlock;
  context.strokeStyle = inkOnBlock;
  context.lineWidth = 8 * layoutScale;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.globalAlpha = 0.92;
  context.beginPath();
  context.moveTo(metrics.x + metrics.width * 0.08, metrics.y + metrics.height * 0.72);
  context.bezierCurveTo(
    metrics.x + metrics.width * 0.18,
    metrics.y + metrics.height * 0.2,
    metrics.x + metrics.width * 0.43,
    metrics.y + metrics.height * 0.12,
    metrics.x + metrics.width * 0.49,
    metrics.y + metrics.height * 0.47,
  );
  context.bezierCurveTo(
    metrics.x + metrics.width * 0.55,
    metrics.y + metrics.height * 0.84,
    metrics.x + metrics.width * 0.78,
    metrics.y + metrics.height * 0.84,
    metrics.x + metrics.width * 0.9,
    metrics.y + metrics.height * 0.28,
  );
  context.stroke();

  context.globalAlpha = 0.54;
  context.lineWidth = 4 * layoutScale;
  context.beginPath();
  context.moveTo(metrics.x + metrics.width * 0.17, metrics.y + metrics.height * 0.84);
  context.bezierCurveTo(
    metrics.x + metrics.width * 0.28,
    metrics.y + metrics.height * 0.56,
    metrics.x + metrics.width * 0.25,
    metrics.y + metrics.height * 0.28,
    metrics.x + metrics.width * 0.43,
    metrics.y + metrics.height * 0.22,
  );
  context.bezierCurveTo(
    metrics.x + metrics.width * 0.65,
    metrics.y + metrics.height * 0.14,
    metrics.x + metrics.width * 0.72,
    metrics.y + metrics.height * 0.47,
    metrics.x + metrics.width * 0.84,
    metrics.y + metrics.height * 0.66,
  );
  context.stroke();

  context.globalAlpha = 1;
  context.fillStyle = accentColor;
  [
    [0.2, 0.26, 22],
    [0.7, 0.28, 38],
    [0.78, 0.7, 16],
  ].forEach(([x, y, radius]) => {
    context.beginPath();
    context.arc(
      metrics.x + metrics.width * x,
      metrics.y + metrics.height * y,
      radius * layoutScale,
      0,
      Math.PI * 2,
    );
    context.fill();
  });

  context.strokeStyle = accentColor;
  context.lineWidth = 6 * layoutScale;
  context.beginPath();
  context.moveTo(metrics.x + metrics.width * 0.09, metrics.y + metrics.height * 0.44);
  context.bezierCurveTo(
    metrics.x + metrics.width * 0.12,
    metrics.y + metrics.height * 0.37,
    metrics.x + metrics.width * 0.15,
    metrics.y + metrics.height * 0.36,
    metrics.x + metrics.width * 0.2,
    metrics.y + metrics.height * 0.38,
  );
  context.stroke();
  context.restore();
}

// 超大编号模块：版本号是版本解读类内容的记忆点，每套配色都必须是深色字。
// 有照片时垫一块卡片色标牌保证对比；纯文字时主视觉区留空描边，编号直接落在卡片上。
function drawBigNumberModule({ heroWindow, hasPhoto, layoutScale }) {
  // 栏目名由角标模块负责画在卡片顶部，这里只画编号，避免同一句话出现两次。
  const issue = state.topRight.trim();
  if (!issue) return;

  if (!hasPhoto) {
    // 纯文字时给主视觉区一圈描边和一层极淡的底，避免编号悬空。
    context.save();
    context.strokeStyle = state.inkColor;
    context.globalAlpha = 0.22;
    context.lineWidth = 3 * layoutScale;
    roundedRectPath(
      context,
      heroWindow.x + 1.5 * layoutScale,
      heroWindow.y + 1.5 * layoutScale,
      heroWindow.width - 3 * layoutScale,
      heroWindow.height - 3 * layoutScale,
      heroWindow.radius,
    );
    context.stroke();
    context.globalAlpha = 0.06;
    context.fillStyle = state.inkColor;
    roundedRectPath(
      context,
      heroWindow.x,
      heroWindow.y,
      heroWindow.width,
      heroWindow.height,
      heroWindow.radius,
    );
    context.fill();
    context.restore();
  } else {
    // 照片上压一层底部渐变，托住下面那块标牌。
    context.save();
    roundedRectPath(
      context,
      heroWindow.x,
      heroWindow.y,
      heroWindow.width,
      heroWindow.height,
      heroWindow.radius,
    );
    context.clip();
    const shade = context.createLinearGradient(
      heroWindow.x,
      heroWindow.y + heroWindow.height * 0.45,
      heroWindow.x,
      heroWindow.y + heroWindow.height,
    );
    shade.addColorStop(0, "rgba(0, 0, 0, 0)");
    shade.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    context.fillStyle = shade;
    context.fillRect(heroWindow.x, heroWindow.y, heroWindow.width, heroWindow.height);
    context.restore();
  }
  // 标牌用的是卡片色：贴着主视觉边缘会和卡片连成一片，看起来像照片缺了一角。
  // 有照片时多收一点，四周留出一圈照片。
  const inset = (hasPhoto ? 42 : 26) * layoutScale;

  context.save();
  roundedRectPath(
    context,
    heroWindow.x,
    heroWindow.y,
    heroWindow.width,
    heroWindow.height,
    heroWindow.radius,
  );
  context.clip();

  // 有照片时编号是压在图上的角标；纯文字时它就是这张封面的主视觉，放到几乎撑满主视觉区。
  let issueSize = hasPhoto
    ? Math.min(232 * layoutScale, heroWindow.height * 0.46)
    : Math.min(420 * layoutScale, heroWindow.height * 0.82);
  context.font = fontString(900, issueSize, state.titleFontFamily);
  const issueMaxWidth = heroWindow.width - inset * 2 - (hasPhoto ? 44 * layoutScale : 0);
  const measured = context.measureText(issue).width;
  if (measured > issueMaxWidth) issueSize *= issueMaxWidth / measured;
  context.font = fontString(900, issueSize, state.titleFontFamily);
  const issueWidth = context.measureText(issue).width;

  const issueBaseline = hasPhoto
    ? heroWindow.y + heroWindow.height - inset - issueSize * 0.16
    : heroWindow.y + heroWindow.height / 2 + issueSize * 0.34;
  const issueRight = hasPhoto
    ? heroWindow.x + heroWindow.width - inset
    : heroWindow.x + (heroWindow.width + issueWidth) / 2;

  if (hasPhoto) {
    const padX = 22 * layoutScale;
    const padY = 12 * layoutScale;
    const plateHeight = issueSize * 0.86 + padY * 2;
    const plateWidth = issueWidth + padX * 2;
    context.fillStyle = state.cardColor;
    roundedRectPath(
      context,
      issueRight - plateWidth,
      issueBaseline - issueSize * 0.7 - padY,
      plateWidth,
      plateHeight,
      18 * layoutScale,
    );
    context.fill();
  }

  context.fillStyle = state.textColor;
  context.textAlign = "right";
  context.textBaseline = "alphabetic";
  context.fillText(issue, issueRight, issueBaseline);

  context.restore();
}

function renderPoster() {
  // 每帧重置：没有标题的构图不应该沿用上一帧的字号读数。
  renderedTitleSize = null;
  renderedTitleLineSizes = [];
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

  // 满幅色场里 accent 与象牙卡可能只差一点明度，卡片轮廓会在白色信息流里消失。
  // 对比过低时补一条低透明度墨边，把承载形的边界描出来，不改变整体气质。
  if (getContrastRatio(state.cardColor, state.backgroundColor) < CARD_OUTLINE_MIN_RATIO) {
    context.save();
    context.strokeStyle = state.inkColor;
    context.globalAlpha = 0.16;
    context.lineWidth = 3 * layoutScale;
    roundedRectPath(
      context,
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      CARD_CORNER_RADIUS * layoutScale,
    );
    context.stroke();
    context.restore();
  }

  drawEditorialTechDecorations({ cardX, cardY, cardWidth, cardHeight, layoutScale });

  const hasPhotoMode = state.contentMode === "photo";
  const samplePhoto =
    editorialSamplePhoto.complete && editorialSamplePhoto.naturalWidth > 0
      ? editorialSamplePhoto
      : null;
  const displayPhoto = hasPhotoMode ? uploadedPhoto || samplePhoto : null;
  const photoWindow = hasPhotoMode
    ? getPhotoWindowMetrics(cardX, cardY, cardWidth, cardHeight, padding, layoutScale)
    : null;

  // 主视觉区由照片和超大编号共用：两个都关就没有这一块，文字直接占满卡片。
  const showBigNumber = isModuleVisible("bigNumber");
  const heroWindow =
    photoWindow ||
    (showBigNumber
      ? {
          x: cardX + padding,
          y: cardY + 120 * layoutScale,
          width: cardWidth - padding * 2,
          height: 440 * layoutScale,
          radius: 38 * layoutScale,
        }
      : null);

  if (photoWindow) {
    if (displayPhoto) drawPhotoWindow(photoWindow, displayPhoto);
    else drawPlaceholderVisual(photoWindow, layoutScale);
  }
  if (heroWindow && showBigNumber) {
    drawBigNumberModule({
      heroWindow,
      hasPhoto: Boolean(photoWindow),
      layoutScale,
    });
  }

  renderCoverContent({
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    padding,
    heroWindow,
    layoutScale,
  });
  syncPhotoTransformOverlay(photoWindow);
  renderFeedPreview(canvasWidth, canvasHeight);
}

function renderFeedPreview(canvasWidth, canvasHeight) {
  // 量字号上限时会连画八帧；缩略图不影响排版结果，跳过能把这段开销降下来。
  if (measuringMainSizeLimit) return;

  const previewWidth = 360;
  const previewHeight = Math.max(1, Math.round(previewWidth * (canvasHeight / canvasWidth)));
  if (feedPosterCanvas.width !== previewWidth || feedPosterCanvas.height !== previewHeight) {
    feedPosterCanvas.width = previewWidth;
    feedPosterCanvas.height = previewHeight;
  }
  feedPosterContext.clearRect(0, 0, previewWidth, previewHeight);
  feedPosterContext.drawImage(canvas, 0, 0, previewWidth, previewHeight);
  renderFloatingPreview();

  const title = splitLines(state.titleText).join(" ").trim();
  feedPosterTitle.textContent = title || "未命名封面";
  ratioBadge.textContent = `小红书图文 · ${canvasWidth} × ${canvasHeight} · 3:4`;
  syncRenderedTitleReadout();
}

// 渲染完成后把“目标字号”旁边的实际字号补上，并说明是被宽度还是被高度压下去的。
function syncRenderedTitleReadout() {
  const output = document.querySelector('[data-output="mainSize"]');
  if (!output) return;

  const target = Number(state.mainSize);
  if (!Number.isFinite(renderedTitleSize) || renderedTitleSize === null) {
    output.value = `${target} px`;
    output.dataset.state = "neutral";
    return;
  }

  // 逐行适配会让最长一行更小、重点行保持大字号；这里比较的是画布上最大的那一行。
  const shrunk = renderedTitleSize < target - 1;
  output.value = shrunk
    ? `实际 ${renderedTitleSize} · 目标 ${target} px`
    : `${renderedTitleSize} px`;
  // 多数模板默认就有一点收敛，只在滑杆明显空转时才变色，否则警告色会一直亮着失去意义。
  output.dataset.state = !shrunk
    ? "exact"
    : renderedTitleSize < target * 0.9
      ? "shrunk"
      : "fitted";
  output.title = shrunk
    ? "标题被卡片宽度或可用高度压小了：继续往右拖不会更大。点「放到最大」直接跳到真正的上限，或减少每行字数、增加一次换行。"
    : "滑杆字号已经完整生效。";

  syncRenderedTitleLineReadouts();
}

function syncRenderedTitleLineReadouts() {
  if (!titleLineSizeList) return;

  titleLineSizeList.querySelectorAll("output[data-line-index]").forEach((output) => {
    const actual = renderedTitleLineSizes[Number(output.dataset.lineIndex)];
    if (!Number.isFinite(actual)) return;
    output.value = `${output.dataset.percent}% · 实际 ${actual} px`;
  });
}

function renderFloatingPreview() {
  const previewWidth = 270;
  const previewHeight = 360;
  if (
    floatingPreviewCanvas.width !== previewWidth ||
    floatingPreviewCanvas.height !== previewHeight
  ) {
    floatingPreviewCanvas.width = previewWidth;
    floatingPreviewCanvas.height = previewHeight;
  }
  floatingPreviewContext.clearRect(0, 0, previewWidth, previewHeight);
  floatingPreviewContext.drawImage(canvas, 0, 0, previewWidth, previewHeight);
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
  // 触屏拖动期间只更新必要几何信息，松手后再计算字号上限，避免每帧重复测量文字。
  if (persist) updateRangeOutputs();
  scheduleRender({ persist });
}

function syncPhotoLayoutButtons() {
  document.querySelectorAll("[data-photo-layout]").forEach((button) => {
    const isActive =
      state.contentMode === "text"
        ? button.dataset.photoLayout === "text"
        : button.dataset.photoLayout === state.photoLayout;
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
  if (layout === "text") {
    state.contentMode = "text";
    photoTransformControls.hidden = true;
    photoTransformOverlay.hidden = true;
    if (!uploadedPhoto) photoStatus.textContent = "纯文字模式 · 未选择照片";
    else photoStatus.textContent = "照片已保留，切回图文后继续使用";
    markStyleCustomized();
    syncPhotoLayoutButtons();
    scheduleRender();
    if (notify) showToast("已切换为纯文字，照片不会丢失");
    return;
  }

  const preset = photoLayoutPresets[layout];
  if (!preset) return;

  state.contentMode = "photo";
  state.photoLayout = layout;
  Object.assign(state, preset);
  photoTransformControls.hidden = !uploadedPhoto;
  if (!uploadedPhoto) photoStatus.textContent = "当前显示本地示例图，上传后立即替换";
  markStyleCustomized();
  syncPhotoLayoutButtons();
  updateRangeOutputs();
  scheduleRender();
  if (notify) {
    showToast(layout === "album" ? "已切换为大图主导" : "已切换为图文佐证");
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
      syncMainSizeLimit();
      // 实际字号要等这一帧画完才知道，统一由 syncRenderedTitleReadout 写入。
      syncRenderedTitleReadout();
      return;
    }

    if (key === "mainLineHeight") {
      output.value = `${Number(state.mainLineHeight).toFixed(2)}×`;
      return;
    }

    const prefix = key === "verticalOffset" && Number(state[key]) > 0 ? "+" : "";
    output.value = `${prefix}${state[key]}${suffix[key] || ""}`;
  });

  syncTitleLineSizeControls();
}

function syncTitleLineSizeControls() {
  const lines = getCurrentRenderedTitleLines();
  const shouldShow = lines.length > 1;
  titleLineSizeControls.hidden = !shouldShow;
  titleLineSizeList.replaceChildren();
  if (!shouldShow) return;

  const scales = getEffectiveTitleLineScales(lines);
  lines.forEach((line, index) => {
    const field = document.createElement("label");
    field.className = "range-field title-line-size-field";

    const labelRow = document.createElement("span");
    const labelText = document.createElement("b");
    labelText.textContent = `第 ${index + 1} 行`;
    const previewText = document.createElement("small");
    const compactLine = line.trim() || "空行";
    previewText.textContent = `· ${
      compactLine.length > 12 ? `${compactLine.slice(0, 12)}…` : compactLine
    }`;
    labelText.append(previewText);

    const output = document.createElement("output");
    const percentage = Math.round(scales[index] * 100);
    // 真实字号要等这一帧画完才知道；先写目标值，渲染后由 syncRenderedTitleReadout 覆盖。
    output.dataset.lineIndex = String(index);
    output.dataset.percent = String(percentage);
    output.value = `${percentage}% · 目标 ${Math.round(Number(state.mainSize) * scales[index])} px`;
    labelRow.append(labelText, output);

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(MIN_TITLE_LINE_SCALE * 100);
    input.max = String(MAX_TITLE_LINE_SCALE * 100);
    input.step = "1";
    input.value = String(percentage);
    input.dataset.titleLineScaleIndex = String(index);
    input.setAttribute("aria-label", `第 ${index + 1} 行字号：${compactLine}`);

    field.append(labelRow, input);
    titleLineSizeList.append(field);
  });

  const usesAutomaticScale = !Array.isArray(state.titleLineScales);
  resetTitleLineSizesButton.disabled = usesAutomaticScale;
}

function syncActiveTheme() {
  const activeTheme =
    state.themeId !== "custom" && themes[state.themeId]
      ? state.themeId
      : inferThemeIdFromColors(state);

  document.querySelectorAll(".theme-chip").forEach((chip) => {
    const isActive = chip.dataset.theme === activeTheme;
    chip.classList.toggle("is-active", isActive);
    chip.setAttribute("aria-pressed", String(isActive));
  });
}

// 三档节奏是快捷入口而不是独立状态：当前数值刚好落在某一档上时才点亮它。
function syncRhythmPresetButtons() {
  const notePreset = defaults;
  const matches = (presetId) => {
    const rhythm = rhythmPresets[presetId];
    if (presetId === "standard") {
      return (
        Number(state.mainLineHeight) === notePreset.mainLineHeight &&
        Number(state.groupGap) === notePreset.groupGap &&
        Number(state.upperSize) === notePreset.upperSize &&
        Number(state.subtitleSize) === notePreset.subtitleSize
      );
    }
    return (
      Number(state.mainLineHeight) === rhythm.mainLineHeight &&
      Number(state.groupGap) === rhythm.groupGap &&
      Number(state.upperSize) === clamp(notePreset.upperSize + rhythm.upperSizeDelta, 26, 64) &&
      Number(state.subtitleSize) ===
        clamp(notePreset.subtitleSize + rhythm.subtitleSizeDelta, 26, 58)
    );
  };

  document.querySelectorAll("[data-rhythm-preset]").forEach((button) => {
    const isActive = matches(button.dataset.rhythmPreset);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
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


function syncTemplateCopyGuide() {
  const guide = COPY_GUIDE;
  const example = DEFAULT_CONTENT;
  if (!guide || !example) return;

  if (templateCopyGuideBestFor) {
    templateCopyGuideBestFor.textContent = `适合${guide.bestFor}`;
  }
  if (templateCopyGuideSummary) {
    templateCopyGuideSummary.textContent = guide.summary;
  }
  if (templateCopyGuideList) {
    const rows = guide.roles.map((role) => {
      const row = document.createElement("div");
      row.className = "template-copy-guide-row";

      const labelElement = document.createElement("strong");
      labelElement.textContent = role.label;
      const content = document.createElement("div");
      const ruleElement = document.createElement("span");
      ruleElement.className = "template-copy-guide-rule";
      ruleElement.textContent = role.rule;
      const sampleElement = document.createElement("p");
      sampleElement.className = "template-copy-guide-sample";
      sampleElement.textContent = role.sample;
      content.append(ruleElement, sampleElement);
      row.append(labelElement, content);
      return row;
    });
    templateCopyGuideList.replaceChildren(...rows);
  }

  if (applyTemplateExampleButton) {
    const isCurrentExample = isSameContent(state, example);
    applyTemplateExampleButton.disabled = isCurrentExample;
    applyTemplateExampleButton.textContent = isCurrentExample
      ? "已载入示例文案"
      : "载入示例文案";
  }
  if (restoreTemplateContentButton) {
    restoreTemplateContentButton.hidden = !(
      contentBeforeExample
    );
  }
}

function syncStyleControls() {
  if (styleStatus) {
    styleStatus.textContent = state.styleCustomized ? "排版：已微调" : "排版：推荐值";
  }
  if (styleDescription) {
    styleDescription.textContent = state.styleCustomized
      ? "「标准」节奏可以一键回到推荐排版；文案、照片和配色都不受影响。"
      : "字数与换行建议直接显示在下面每个输入框上。";
  }
  syncTemplateCopyGuide();
  syncModuleControls();
  if (customStyleControls) customStyleControls.hidden = !customStyleOpen;
  if (customStyleButton) {
    customStyleButton.textContent = customStyleOpen ? "精简参数" : "展开全部";
    customStyleButton.setAttribute("aria-expanded", String(customStyleOpen));
  }
  if (photoLayoutPicker) photoLayoutPicker.hidden = false;
  if (photoPresetHint) {
    photoPresetHint.textContent =
      "优先上传真实产品图或结果截图；主视觉区与超大编号共用同一块位置。";
  }
  syncFieldHints();
}

// 模块开关与槽位：关掉只是不渲染，输入框里的文字原样留着。
function syncModuleControls() {
  document.querySelectorAll("[data-module-toggle]").forEach((input) => {
    const key = input.dataset.moduleToggle;
    input.checked = isModuleOn(key);
    const row = input.closest(".module-row");
    if (row) {
      row.classList.toggle("is-off", !input.checked);
      row.classList.toggle("is-empty", isModuleOn(key) && !hasModuleContent(key));
    }
  });
  document.querySelectorAll("[data-subtitle-slot]").forEach((button) => {
    const isActive = button.dataset.subtitleSlot === state.subtitleSlot;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

// 字段提示直接读写法参考：规则与示例贴在输入框上，不用滚回上面对照。
const FIELD_HINT_TARGETS = {
  corner: () => cornerHint,
  upperText: () => upperTextHint,
  titleText: () => titleTextHint,
  subtitleText: () => subtitleTextHint,
  footerText: () => footerTextHint,
};

function getTitleCopyRole() {
  return COPY_GUIDE.roles.find(
    (role) => role.field === "titleText",
  );
}

function syncFieldHints() {
  const guide = COPY_GUIDE;

  guide.roles.forEach((role) => {
    const target = FIELD_HINT_TARGETS[role.field]?.();
    if (!target) return;
    target.textContent = `${role.rule} · 例：${role.sample}`;
  });

  syncTitleTextCount();
}

// 主标题是唯一有字数区间的字段；超出区间只提示，不阻止输入。
function syncTitleTextCount() {
  if (!titleTextCount) return;

  const role = getTitleCopyRole();
  const characters = Array.from(state.titleText.replace(/\s/gu, "")).length;
  const lineCount = splitLines(state.titleText).length;
  titleTextCount.value = `${characters} 字 · ${lineCount} 行`;

  if (!role?.min || !role?.max) {
    titleTextCount.dataset.state = "neutral";
    titleTextCount.title = "";
    return;
  }

  const tooShort = characters < role.min;
  const tooLong = characters > role.max;
  titleTextCount.dataset.state = tooShort || tooLong ? "warn" : "ok";
  titleTextCount.title = tooShort
    ? `建议 ${role.min}–${role.max} 字，现在偏短`
    : tooLong
      ? `建议 ${role.min}–${role.max} 字，现在偏长，Canvas 会自动缩小标题`
      : `符合建议的 ${role.min}–${role.max} 字`;
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
    "mainLineHeight",
    "upperSize",
    "subtitleSize",
    "groupGap",
    "verticalOffset",
    "sidePadding",
  ].forEach((key) => setControlValue(key, state[key]));

  updateRangeOutputs();
  syncActiveTheme();
  syncRhythmPresetButtons();
  syncFontPresetButtons();
  syncStyleControls();
  syncPhotoLayoutButtons();
  syncPhotoEditModeButtons();
  syncFloatingPreviewSide();
  updatePhotoGeometryStatus();
  if (!uploadedPhoto) {
    photoStatus.textContent =
      state.contentMode === "photo"
        ? "当前显示本地示例图，上传后立即替换"
        : "纯文字模式 · 未选择照片";
    photoTransformControls.hidden = true;
    removePhotoButton.hidden = true;
  }
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
    "mainLineHeight",
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
    "mainLineHeight",
    "upperSize",
    "subtitleSize",
    "groupGap",
    "verticalOffset",
    "sidePadding",
  ]);

  keys.forEach((key) => {
    const element = document.getElementById(key);
    element.addEventListener("input", () => {
      const isRange = element.type === "range";
      const previousTitleLineCount =
        key === "titleText" ? getCurrentRenderedTitleLines().length : null;
      state[key] = element.type === "range" ? Number(element.value) : element.value;
      if (CONTENT_KEYS.includes(key)) {
        syncTemplateCopyGuide();
        // 角标和右上角同时决定「角标」与「超大编号」两个模块是否有内容可画。
        syncModuleControls();
      }
      if (key === "titleText") syncTitleTextCount();
      if (key === "mainSize") state.mainSizePreference = state.mainSize;
      // 只在行数改变时恢复自动规则；同样行数内改文案时继续保留“第几行更大”的设计意图。
      if (
        key === "titleText" &&
        getCurrentRenderedTitleLines().length !== previousTitleLineCount
      ) {
        state.titleLineScales = null;
      }
      if (["fontFamily", "titleFontFamily"].includes(key)) {
        ensureFontReady(state[key]);
      }
      if (styleKeys.has(key)) markStyleCustomized();
      if (["titleText", "fontFamily", "titleFontFamily", "sidePadding"].includes(key)) {
        syncMainSizeLimit();
      }
      if (["fontFamily", "titleFontFamily"].includes(key)) syncFontPresetButtons();
      updateRangeOutputs();
      // 滑杆拖动会连续触发 input；实时渲染但只在 change 时落盘，保持 iPad 上的 1:1 跟手感。
      scheduleRender({ persist: !isRange });
    });

    if (element.type === "range") {
      element.addEventListener("change", persistState);
    }
  });
}

function bindTitleLineSizeControls() {
  titleLineSizeList.addEventListener("input", (event) => {
    const input = event.target.closest("[data-title-line-scale-index]");
    if (!input) return;

    const lines = getCurrentRenderedTitleLines();
    const index = Number(input.dataset.titleLineScaleIndex);
    if (!Number.isInteger(index) || index < 0 || index >= lines.length) return;

    const scales = getEffectiveTitleLineScales(lines);
    scales[index] = clamp(
      Number(input.value) / 100,
      MIN_TITLE_LINE_SCALE,
      MAX_TITLE_LINE_SCALE,
    );
    state.titleLineScales = scales.slice(0, MAX_CUSTOM_TITLE_LINES);
    markStyleCustomized();

    const output = input.closest(".range-field")?.querySelector("output");
    if (output) {
      output.value = `${Math.round(scales[index] * 100)}% · 目标 ${Math.round(
        Number(state.mainSize) * scales[index],
      )} px`;
    }
    resetTitleLineSizesButton.disabled = false;
    // 分行字号也是高频滑杆；拖动时只重绘，松手后再写入本地存储。
    scheduleRender({ persist: false });
  });

  titleLineSizeList.addEventListener("change", persistState);

  resetTitleLineSizesButton.addEventListener("click", () => {
    state.titleLineScales = null;
    syncTitleLineSizeControls();
    scheduleRender();
    showToast("已恢复当前类型的自动标题强调");
  });
}

function syncFloatingPreviewSide() {
  floatingPreview.dataset.side = state.floatingPreviewSide;
  document.querySelectorAll("[data-floating-preview-side]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.floatingPreviewSide === state.floatingPreviewSide),
    );
  });
}

function updateFloatingPreviewVisibility() {
  const previewHasScrolledAway = previewShell.getBoundingClientRect().bottom <= 16;
  const shouldFloat = floatingPreviewMedia.matches && previewHasScrolledAway;
  floatingPreview.hidden = !shouldFloat;
  if (shouldFloat) renderFloatingPreview();
}

function scheduleFloatingPreviewVisibility() {
  if (floatingPreviewVisibilityFrame) return;
  floatingPreviewVisibilityFrame = requestAnimationFrame(() => {
    floatingPreviewVisibilityFrame = 0;
    updateFloatingPreviewVisibility();
  });
}

function bindFloatingPreview() {
  syncFloatingPreviewSide();
  document.querySelectorAll("[data-floating-preview-side]").forEach((button) => {
    button.addEventListener("click", () => {
      state.floatingPreviewSide = button.dataset.floatingPreviewSide;
      syncFloatingPreviewSide();
      persistState();
      showToast(`浮窗已移到${state.floatingPreviewSide === "left" ? "左侧" : "右侧"}`);
    });
  });

  window.addEventListener("scroll", scheduleFloatingPreviewVisibility, { passive: true });
  window.addEventListener("resize", scheduleFloatingPreviewVisibility, { passive: true });
  if (typeof floatingPreviewMedia.addEventListener === "function") {
    floatingPreviewMedia.addEventListener("change", scheduleFloatingPreviewVisibility);
  } else {
    floatingPreviewMedia.addListener(scheduleFloatingPreviewVisibility);
  }
  updateFloatingPreviewVisibility();
}

function bindPreviewModes() {
  const buttons = [...document.querySelectorAll(".preview-mode-button")];

  const activate = (button, { focus = false } = {}) => {
    const mode = button.dataset.previewMode;
    buttons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });
    document.querySelectorAll("[data-preview-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.previewPanel !== mode;
    });
    if (focus) button.focus();
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => activate(button));
    button.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;
      if (nextIndex === null) return;

      event.preventDefault();
      activate(buttons[nextIndex], { focus: true });
    });
  });
}

// 配色列表按系列分组渲染，色值与受控装饰只在 themes 里维护一份，避免和 HTML 重复。
function renderThemeList() {
  if (!themeList) return;

  themeList.textContent = "";

  // 分组数量直接由 themes 统计，增删配色不必再回头改 HTML 里的文案。
  const themeCountHint = document.querySelector("#themeCountHint");
  if (themeCountHint) {
    themeCountHint.textContent = Object.entries(THEME_FAMILIES)
      .map(
        ([familyId, family]) =>
          `${family.label} ${
            Object.values(themes).filter((theme) => theme.family === familyId).length
          } 组`,
      )
      .join(" · ");
  }

  Object.entries(THEME_FAMILIES).forEach(([familyId, family]) => {
    const group = document.createElement("div");
    group.className = "theme-group";
    group.dataset.themeFamily = familyId;

    const heading = document.createElement("div");
    heading.className = "theme-group-heading";
    const name = document.createElement("strong");
    name.textContent = family.label;
    const hint = document.createElement("span");
    hint.textContent = family.hint;
    heading.append(name, hint);

    const chips = document.createElement("div");
    chips.className = "theme-group-chips";
    Object.entries(themes)
      .filter(([, theme]) => theme.family === familyId)
      .forEach(([themeId, theme]) => {
        const chip = document.createElement("button");
        chip.className = "theme-chip";
        chip.type = "button";
        chip.dataset.theme = themeId;
        chip.setAttribute("aria-pressed", "false");

        const preview = document.createElement("span");
        preview.className = "theme-chip-preview";
        preview.setAttribute("aria-hidden", "true");
        preview.style.setProperty("--chip-field", theme.backgroundColor);
        preview.style.setProperty("--chip-card", theme.cardColor);
        preview.style.setProperty("--chip-ink", theme.inkColor);
        if (theme.decorator) preview.dataset.decorator = theme.decorator;
        if (theme.accentColor) preview.style.setProperty("--chip-accent", theme.accentColor);

        const copy = document.createElement("span");
        copy.className = "theme-chip-copy";
        const title = document.createElement("strong");
        title.textContent = theme.label;
        copy.append(title);

        chip.append(preview, copy);
        chips.append(chip);
      });

    group.append(heading, chips);
    themeList.append(group);
  });
}

function applyTheme(themeId, { notify = true, markCustom = true } = {}) {
  const themeColors = getThemeColors(themeId);
  if (!themeColors) return;

  state = { ...state, ...themeColors, themeId };
  if (markCustom) state.themeCustomized = true;
  syncControls();
  scheduleRender();
  if (notify) showToast(`已切换为「${themes[themeId].label}」，构图保持不变`);
}

function bindThemes() {
  if (!themeList) return;
  themeList.addEventListener("click", (event) => {
    const chip = event.target.closest(".theme-chip");
    if (!chip || !themeList.contains(chip)) return;
    applyTheme(chip.dataset.theme);
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
      ensureFontReady(state.titleFontFamily);
      syncControls();
      scheduleRender();
      showToast(`已切换为「${preset.label}」`);
    });
  });
}

function bindRhythmPresetControls() {
  document.querySelectorAll("[data-rhythm-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const presetId = button.dataset.rhythmPreset;
      const rhythm = rhythmPresets[presetId];
      if (!rhythm) return;

      const notePreset = defaults;
      if (presetId === "standard") {
        state.mainLineHeight = notePreset.mainLineHeight;
        state.groupGap = notePreset.groupGap;
        state.upperSize = notePreset.upperSize;
        state.subtitleSize = notePreset.subtitleSize;
      } else {
        // 副标题字号按模板推荐值偏移，避免把不同模板拉成同一套绝对值。
        state.mainLineHeight = rhythm.mainLineHeight;
        state.groupGap = rhythm.groupGap;
        state.upperSize = clamp(notePreset.upperSize + rhythm.upperSizeDelta, 26, 64);
        state.subtitleSize = clamp(notePreset.subtitleSize + rhythm.subtitleSizeDelta, 26, 58);
      }

      markStyleCustomized();
      syncControls();
      scheduleRender();
      showToast(`排版节奏已设为「${rhythm.label}」`);
    });
  });
}

// 滑杆右端已经是真正的上限，这个按钮只是把偏好推到顶，省去精确拖到底的动作。
function maximizeTitleSize() {
  if (!splitLines(state.titleText).length) {
    showToast("先填写主标题，再放大字号");
    return;
  }

  state.mainSizePreference = MAX_MAIN_SIZE;
  markStyleCustomized();
  syncControls();
  scheduleRender();
  showToast(`主标题已放大到 ${state.mainSize} px`);
}

function bindPhotoLayoutControls() {
  document.querySelectorAll("[data-photo-layout]").forEach((button) => {
    button.addEventListener("click", () => {
      applyPhotoLayoutPreset(button.dataset.photoLayout);
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

function bindModuleControls() {
  document.querySelectorAll("[data-module-toggle]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.moduleToggle;
      state.moduleToggles = { ...state.moduleToggles, [key]: input.checked };
      invalidateMainSizeLimit();
      syncControls();
      scheduleRender();
      showToast(
        input.checked
          ? `已显示「${MODULE_LABELS[key]}」`
          : `已隐藏「${MODULE_LABELS[key]}」，文字仍保留在输入框里`,
      );
    });
  });

  document.querySelectorAll("[data-subtitle-slot]").forEach((button) => {
    button.addEventListener("click", () => {
      const slot = button.dataset.subtitleSlot;
      if (!SUBTITLE_SLOTS.includes(slot) || state.subtitleSlot === slot) return;
      state.subtitleSlot = slot;
      invalidateMainSizeLimit();
      syncControls();
      scheduleRender();
      showToast(slot === "above" ? "下方副标题已移到标题上方" : "下方副标题已回到标题下方");
    });
  });
}

function bindTemplateCopyGuideControls() {
  applyTemplateExampleButton?.addEventListener("click", loadContentExample);
  restoreTemplateContentButton?.addEventListener("click", restoreContentBeforeExample);
}

function bindCustomStyleControls() {
  if (!customStyleButton) return;
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
  state.contentMode = "text";
  photoStatus.textContent = "纯文字模式 · 未选择照片";
  photoTransformControls.hidden = true;
  photoTransformOverlay.hidden = true;
  removePhotoButton.hidden = true;
  syncPhotoLayoutButtons();
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
      state.contentMode = "photo";
      if (!["editorial", "album"].includes(state.photoLayout)) {
        const recommendedLayout = defaults.photoLayout;
        state.photoLayout = ["editorial", "album"].includes(recommendedLayout)
          ? recommendedLayout
          : "editorial";
        Object.assign(state, photoLayoutPresets[state.photoLayout]);
      }
      photoStatus.textContent = `${file.name} · ${nextPhoto.naturalWidth} × ${nextPhoto.naturalHeight}`;
      photoTransformControls.hidden = false;
      removePhotoButton.hidden = false;
      syncPhotoLayoutButtons();
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
        id: `upload-${file.name}-${file.lastModified || Date.now()}`,
        source: "upload",
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

function mergeHistoryCoverGroup(source, covers) {
  const otherGroups = historyCovers.filter((cover) => cover.source !== source);
  // 后加入的组优先保留；三张已发布封面和五种预设刚好组成 8 张完整对比。
  historyCovers = [...otherGroups, ...covers].slice(-MAX_HISTORY_COVERS);
  renderHistoryCovers();
}

// 只剩一种版式后，这组对比不再是「不同模板」，而是同一份文案在几种模块组合下的样子。
// 用用户当前真实文案渲染，比罐头示例更能说明主页会长成什么样。
const PRESET_FEED_VARIANTS = Object.freeze([
  {
    id: "text-number",
    name: "无图 · 超大编号",
    contentMode: "text",
    modules: { bigNumber: true },
  },
  {
    id: "photo-below",
    name: "图在标题下方",
    contentMode: "photo",
    photoLayout: "editorial",
    modules: { bigNumber: false },
  },
  {
    id: "photo-above",
    name: "图在标题上方",
    contentMode: "photo",
    photoLayout: "album",
    modules: { bigNumber: true },
  },
]);

async function createPresetFeedCovers() {
  const originalState = { ...state };
  const originalPhoto = uploadedPhoto;
  const covers = [];

  try {
    for (const variant of PRESET_FEED_VARIANTS) {
      const framePreset = photoLayoutPresets[variant.photoLayout || state.photoLayout];
      state = {
        ...originalState,
        ...framePreset,
        contentMode: variant.contentMode,
        photoLayout: variant.photoLayout || originalState.photoLayout,
        moduleToggles: { ...originalState.moduleToggles, ...variant.modules },
        titleLineScales: null,
        photoFocusX: 50,
        photoFocusY: 50,
        photoEditMode: "frame",
      };
      invalidateMainSizeLimit();
      // 图文样式读取内置本地示例照片，不访问用户相册。
      uploadedPhoto = null;
      renderPoster();
      covers.push({
        id: `preset-${variant.id}`,
        source: "preset",
        name: `组合 · ${variant.name}`,
        dataUrl: canvas.toDataURL("image/jpeg", 0.88),
      });
    }
  } finally {
    state = originalState;
    uploadedPhoto = originalPhoto;
    syncControls();
    renderPoster();
  }

  return covers;
}

function getHistorySourceLabel(source) {
  return {
    published: "已发布",
    preset: "预设",
    upload: "本地",
  }[source] || "对比";
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

    const sourceBadge = document.createElement("span");
    sourceBadge.className = "feed-source-badge";
    sourceBadge.textContent = getHistorySourceLabel(cover.source);

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

    card.append(sourceBadge, image, title, meta);
    historyFeedGrid.append(card);
  });

  historyEmptyState.hidden = historyCovers.length > 0;
  clearHistoryButton.hidden = historyCovers.length === 0;
  if (!historyCovers.length) {
    historyStatus.textContent = "可加载已发布封面、五种样式或本地图片，不会保存或上传";
    return;
  }

  const counts = historyCovers.reduce(
    (summary, cover) => {
      summary[cover.source] = (summary[cover.source] || 0) + 1;
      return summary;
    },
    {},
  );
  const parts = [
    counts.published ? `已发布 ${counts.published}` : "",
    counts.preset ? `预设 ${counts.preset}` : "",
    counts.upload ? `本地 ${counts.upload}` : "",
  ].filter(Boolean);
  historyStatus.textContent = `对比中：${parts.join(" · ")}，仅限当前页面`;
}

function bindHistoryPreview() {
  loadPublishedCoversButton.addEventListener("click", () => {
    mergeHistoryCoverGroup(
      "published",
      PUBLISHED_COVER_SAMPLES.map((cover) => ({ ...cover })),
    );
    showToast("已加载 3 张当前发布封面");
  });

  loadPresetCoversButton.addEventListener("click", async () => {
    const originalText = loadPresetCoversButton.textContent;
    loadPresetCoversButton.disabled = true;
    loadPresetCoversButton.textContent = "生成中…";
    historyStatus.textContent = "正在用当前配色生成五种样式…";
    try {
      const covers = await createPresetFeedCovers();
      mergeHistoryCoverGroup("preset", covers);
      showToast("已生成并加载五种封面样式");
    } catch {
      renderHistoryCovers();
      showToast("预设生成失败，请刷新后重试");
    } finally {
      loadPresetCoversButton.disabled = false;
      loadPresetCoversButton.textContent = originalText;
    }
  });

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
    const uploadedCovers = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value)
      .slice(0, MAX_HISTORY_COVERS);
    mergeHistoryCoverGroup("upload", uploadedCovers);

    if (uploadedCovers.length < selectedFiles.length) {
      showToast(`已加入 ${uploadedCovers.length} 张，部分文件因格式、大小或数量被忽略`);
    } else {
      showToast(`已加入 ${uploadedCovers.length} 张本地封面`);
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
  contentBeforeExample = null;
  customStyleOpen = true;
  syncControls();
  scheduleRender();
  showToast("已恢复示例内容");
}

function initialize() {
  renderThemeList();
  bindModuleControls();
  bindTemplateCopyGuideControls();
  bindCustomStyleControls();
  bindStandardControls();
  bindTitleLineSizeControls();
  bindThemes();
  bindFontPresetControls();
  bindRhythmPresetControls();
  document
    .querySelector("#maximizeTitleSizeButton")
    ?.addEventListener("click", maximizeTitleSize);
  bindPhotoLayoutControls();
  bindPhotoControls();
  bindPhotoTransformGestures();
  bindPreviewModes();
  bindFloatingPreview();
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
