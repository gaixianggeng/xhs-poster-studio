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
const VALID_NOTE_TYPES = ["experience", "tutorial", "product", "deepDive", "hardwareVideo"];
const PRESET_FEED_ORDER = ["experience", "tutorial", "product", "deepDive", "hardwareVideo"];
const TEMPLATE_CONTENT_KEYS = Object.freeze([
  "topLeft",
  "topRight",
  "upperText",
  "titleText",
  "subtitleText",
  "footerText",
]);
// 已发布封面由前置数据脚本提供本地快照，不做账号登录、接口同步或后台抓取。
const PUBLISHED_COVER_SAMPLES = Object.freeze(
  Array.isArray(globalThis.XHS_PUBLISHED_COVER_SAMPLES)
    ? globalThis.XHS_PUBLISHED_COVER_SAMPLES.map((cover) => Object.freeze({ ...cover }))
    : [],
);
const PRESET_FEED_CONTENT = Object.freeze({
  experience: {
    topLeft: "ASK BETTER",
    topRight: "#01",
    upperText: "先把问题说清楚",
    titleText: "小红书封面\n先写什么？",
    subtitleText: "目标：缩略图一眼看懂\n限制：只保留一个重点\n已有：正文里的真实证据",
    footerText: "PROMPT WORKSPACE",
  },
  tutorial: {
    topLeft: "HOW TO",
    topRight: "#02",
    upperText: "3 步完成",
    titleText: "做出统一风格\n小红书封面",
    subtitleText: "选构图 → 填文案 → 导出 PNG",
    footerText: "POSTER STUDIO",
  },
  product: {
    topLeft: "TEST LOG",
    topRight: "#03",
    upperText: "1080 × 1440 导出检查",
    titleText: "预览就是\n最终成品",
    subtitleText: "编辑与导出复用同一套 Canvas",
    footerText: "EXPORT CHECK",
  },
  deepDive: {
    topLeft: "THINKING NOTES",
    topRight: "NO.04",
    upperText: "从结构、反馈与边界谈起",
    titleText: "为什么好用的工具\n都在隐藏复杂度",
    subtitleText: "给小团队的产品设计笔记",
    footerText: "EDITORIAL SERIES",
  },
  hardwareVideo: {
    topLeft: "MODEL RELEASE",
    topRight: "5.6",
    upperText: "FRONTIER UPDATE",
    titleText: "新模型来了\n这次升级了什么",
    subtitleText: "能力、速度与适用边界",
    footerText: "RELEASE NOTES",
  },
});
const TEMPLATE_COPY_GUIDES = Object.freeze({
  experience: {
    summary: "先呈现读者正在问的问题，再用 Prompt 卡补齐上下文。",
    bestFor: "问答、观点、需求拆解",
    roles: [
      ["角标", "栏目名 + 序号", "ASK BETTER · #01"],
      ["上方副标题", "提问前提 · 6–10 字", "先把问题说清楚"],
      ["主标题", "读者问题 · 8–16 字，建议 2 行", "小红书封面 / 先写什么？"],
      ["下方副标题", "Prompt 输入 · 2–3 行", "目标 / 限制 / 已有"],
      ["底部文字", "系列名 · 可留空", "PROMPT WORKSPACE"],
    ],
  },
  tutorial: {
    summary: "用数字先承诺结果，再把步骤压缩成一条可收藏的行动路径。",
    bestFor: "教程、清单、操作指南",
    roles: [
      ["角标", "教程分类 + 期数", "HOW TO · #02"],
      ["上方副标题", "数量或时间承诺 · 4–10 字", "3 步完成"],
      ["主标题", "完成后的结果 · 8–18 字，建议 2 行", "做出统一风格 / 小红书封面"],
      ["下方副标题", "2–3 个步骤 · 用 → 分隔", "选构图 → 填文案 → 导出 PNG"],
      ["底部文字", "教程系列名 · 可留空", "POSTER STUDIO"],
    ],
  },
  product: {
    summary: "先给真实测试条件和明确结论，再用一张图片承担证据。",
    bestFor: "测评、产品体验、结果对比",
    roles: [
      ["角标", "测试栏目 + 期数", "TEST LOG · #03"],
      ["上方副标题", "测试条件或证据口径 · 6–16 字", "1080 × 1440 导出检查"],
      ["主标题", "结论先行 · 6–16 字，建议 2 行", "预览就是 / 最终成品"],
      ["下方副标题", "结论依据 · 8–20 字", "编辑与导出复用同一套 Canvas"],
      ["底部文字", "来源或方法标签 · 可留空", "EXPORT CHECK"],
    ],
  },
  deepDive: {
    summary: "像文章封面一样先给完整观点，再补充论证方向。",
    bestFor: "深度分析、趋势判断、长文导读",
    roles: [
      ["角标", "专栏名 + 期号", "THINKING NOTES · NO.04"],
      ["上方副标题", "论据或切入维度 · 8–18 字", "从结构、反馈与边界谈起"],
      ["主标题", "完整观点 · 14–28 字，建议 2–3 行", "为什么好用的工具 / 都在隐藏复杂度"],
      ["下方副标题", "文章范围或读者收益", "给小团队的产品设计笔记"],
      ["底部文字", "文章系列名 · 可留空", "EDITORIAL SERIES"],
    ],
  },
  hardwareVideo: {
    summary: "让版本号和主视觉先建立发布感，标题只回答这次更新了什么。",
    bestFor: "模型发布、产品更新、版本解读",
    roles: [
      ["角标", "发布类型 + 版本号", "MODEL RELEASE · 5.6"],
      ["上方副标题", "发布阶段 · 2–3 个短词", "FRONTIER UPDATE"],
      ["主标题", "更新事件 + 核心问题 · 固定 2 行", "新模型来了 / 这次升级了什么"],
      ["下方副标题", "3 个升级维度", "能力、速度与适用边界"],
      ["底部文字", "发布记录名 · 可留空", "RELEASE NOTES"],
    ],
  },
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
  deepDive: {
    photoFrameX: 106,
    photoFrameY: 106,
    photoFrameWidth: 868,
    photoFrameHeight: 570,
  },
  video: {
    photoFrameX: 132,
    photoFrameY: 218,
    photoFrameWidth: 816,
    photoFrameHeight: 459,
  },
});

const defaults = Object.freeze({
  noteType: "experience",
  styleCustomized: false,
  // 手动挑过配色后，切换模板不再覆盖颜色；未挑过时跟随模板的默认色系。
  themeCustomized: false,
  themeId: "cactusField",
  contentMode: "text",
  templateContentDrafts: Object.freeze({}),
  topLeft: PRESET_FEED_CONTENT.experience.topLeft,
  topRight: PRESET_FEED_CONTENT.experience.topRight,
  upperText: PRESET_FEED_CONTENT.experience.upperText,
  // 默认使用两行，兼顾纯文字与照片优先模式的信息流识别度。
  titleText: PRESET_FEED_CONTENT.experience.titleText,
  subtitleText: PRESET_FEED_CONTENT.experience.subtitleText,
  footerText: PRESET_FEED_CONTENT.experience.footerText,
  footerAlign: "center",
  floatingPreviewSide: "right",
  backgroundColor: "#BCD1CA",
  cardColor: FIELD_CARD_COLOR,
  textColor: FIELD_INK_COLOR,
  // mediaColor 负责照片占位与视觉块底色，inkColor 负责插画墨线与装饰；
  // 旧版把两者合并成 visualColor，导致它既要够浅当底色又要够深当线条。
  mediaColor: "#BCD1CA",
  inkColor: FIELD_INK_COLOR,
  fontFamily: "grotesk",
  titleFontFamily: "grotesk",
  mainSize: 260,
  mainSizePreference: 260,
  mainLineHeight: 0.96,
  // null 表示跟随当前笔记类型的自动强调规则；用户拖动分行滑杆后保存每行比例。
  titleLineScales: null,
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

const THEME_FAMILIES = Object.freeze({
  ink: {
    label: "深底高对比",
    hint: "近黑画布 + 单一高饱和亮卡；缩略图冲击力最强，延续账号已发布的封面",
  },
  field: {
    label: "满幅色场",
    hint: "满幅色场 + 象牙承载卡 + 近黑墨线；适合观点、教程与深度内容",
  },
});

// 两套基础配色只允许一个色相：背景、卡片、媒体块和墨线都由同一个色系派生，
// 避免随意拼贴。科技编辑只增加一个固定强调色，不进入可编辑颜色状态。
const themes = Object.freeze({
  // ——「深底高对比」：取自账号已发布封面的实际取色（近黑墨绿画布 + 高饱和亮卡 + 近黑字）。
  // 深底系列的媒体块直接取画布色：视觉上像从亮卡里开了一扇窗回到画布，
  // 比中间调的深色块干净，也天然保证一套里不出现第二个色相。
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
    // 已发布封面用的 #027AFF 配白字只有 3.8:1；压深到 #0061D6 后达到 5.4:1，观感几乎不变。
    cardColor: "#0061D6",
    textColor: "#F4F8FF",
    mediaColor: "#050B16",
    inkColor: "#F4F8FF",
  },
  monoInk: {
    label: "纯黑白",
    family: "ink",
    backgroundColor: "#000000",
    cardColor: "#101010",
    textColor: "#F7F7F7",
    mediaColor: "#262626",
    inkColor: "#F7F7F7",
  },

  // ——「满幅色场」：anthropic-art 的三层结构，accent 铺满画布、象牙卡承载文字、近黑负责所有墨线。
  cactusField: {
    label: "仙人掌绿",
    family: "field",
    backgroundColor: "#BCD1CA",
    cardColor: FIELD_CARD_COLOR,
    textColor: FIELD_INK_COLOR,
    mediaColor: "#BCD1CA",
    inkColor: FIELD_INK_COLOR,
  },
  heatherField: {
    label: "石楠紫",
    family: "field",
    backgroundColor: "#CBCADB",
    cardColor: FIELD_CARD_COLOR,
    textColor: FIELD_INK_COLOR,
    mediaColor: "#CBCADB",
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

const localFontDefinitions = Object.freeze({
  handwritten: {
    css: '500 96px "Yozai"',
    sample: "Codex 远程 到底稳不稳？",
    label: "自然手写",
  },
});

// 两套基础色系按模板分工：发布与测评走深底高对比，观点、教程与深度走满幅色场。
// 用户仍可自由跨系列选色；只有在没有手动挑过配色时才跟随模板的默认值。
const NOTE_TYPE_DEFAULT_THEMES = Object.freeze({
  experience: "cactusField",
  tutorial: "skyField",
  deepDive: "heatherField",
  product: "cyanInk",
  hardwareVideo: "emberInk",
});

const noteTypePresets = Object.freeze({
  experience: {
    label: "对话工作台",
    description: "问题主导 · Prompt 卡片",
    fontFamily: "grotesk",
    titleFontFamily: "grotesk",
    mainSize: 250,
    mainLineHeight: 0.96,
    upperSize: 32,
    subtitleSize: 36,
    groupGap: 44,
    verticalOffset: 0,
    sidePadding: 64,
    footerAlign: "center",
    photoLayout: "editorial",
  },
  tutorial: {
    label: "编号清单",
    description: "步骤卡片 · 收藏导向",
    fontFamily: "grotesk",
    titleFontFamily: "grotesk",
    mainSize: 270,
    mainLineHeight: 0.96,
    upperSize: 32,
    subtitleSize: 34,
    groupGap: 40,
    verticalOffset: 0,
    sidePadding: 64,
    footerAlign: "center",
    photoLayout: "editorial",
  },
  product: {
    label: "证据图文",
    description: "照片佐证 · 实测结论",
    fontFamily: "grotesk",
    titleFontFamily: "grotesk",
    mainSize: 280,
    mainLineHeight: 0.96,
    upperSize: 30,
    subtitleSize: 34,
    groupGap: 32,
    verticalOffset: 0,
    sidePadding: 64,
    footerAlign: "center",
    photoLayout: "editorial",
  },
  deepDive: {
    label: "编辑杂志",
    description: "暖黑衬线 · 手绘导读",
    fontFamily: "grotesk",
    titleFontFamily: "serif",
    mainSize: 200,
    mainLineHeight: 1,
    upperSize: 30,
    subtitleSize: 34,
    groupGap: 32,
    verticalOffset: 0,
    sidePadding: 64,
    footerAlign: "left",
    photoLayout: "album",
  },
  hardwareVideo: {
    label: "模型发布",
    description: "超大编号 · 图片主导",
    fontFamily: "grotesk",
    titleFontFamily: "grotesk",
    mainSize: 176,
    mainLineHeight: 0.94,
    upperSize: 28,
    subtitleSize: 30,
    groupGap: 24,
    verticalOffset: 0,
    sidePadding: 64,
    footerAlign: "left",
    photoLayout: "album",
  },
});

const typographyProfiles = Object.freeze({
  // 五类模板只改变信息层级，不改变品牌卡片骨架；最后一行默认承担缩略图里的记忆点。
  experience: {
    titleWeight: 900,
    focusScale: 1.08,
    singleLineScale: 1.08,
    maxLineSizeRatio: 1.62,
    titleLineGapEm: -0.04,
    letterSpacingEm: -0.026,
    upperAlpha: 0.72,
    subtitleAlpha: 0.82,
    maxTitleLines: 4,
  },
  tutorial: {
    titleWeight: 900,
    focusScale: 1.04,
    singleLineScale: 1.06,
    maxLineSizeRatio: 1.5,
    titleLineGapEm: -0.04,
    letterSpacingEm: -0.027,
    upperAlpha: 0.74,
    subtitleAlpha: 0.84,
    maxTitleLines: 3,
  },
  product: {
    titleWeight: 900,
    focusScale: 1.05,
    singleLineScale: 1.08,
    maxLineSizeRatio: 1.55,
    titleLineGapEm: -0.04,
    letterSpacingEm: -0.029,
    upperAlpha: 0.72,
    subtitleAlpha: 0.82,
    maxTitleLines: 4,
  },
  deepDive: {
    titleWeight: 700,
    focusScale: 1.04,
    singleLineScale: 1.04,
    maxLineSizeRatio: 1.45,
    titleLineGapEm: 0,
    letterSpacingEm: -0.014,
    upperAlpha: 0.68,
    subtitleAlpha: 0.8,
    maxTitleLines: 3,
  },
  hardwareVideo: {
    titleWeight: 900,
    focusScale: 1.04,
    singleLineScale: 1.04,
    maxLineSizeRatio: 1.5,
    titleLineGapEm: -0.02,
    letterSpacingEm: -0.022,
    upperAlpha: 0.72,
    subtitleAlpha: 0.82,
    maxTitleLines: 3,
  },
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
const upperTextHint = document.querySelector("#upperTextHint");
const titleTextHint = document.querySelector("#titleTextHint");
const subtitleTextHint = document.querySelector("#subtitleTextHint");
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
let templateContentBeforeExample = null;

editorialSamplePhoto.addEventListener("load", () => {
  scheduleRender({ persist: false });
});

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const validSaved = saved && typeof saved === "object" ? saved : {};
    const merged = { ...defaults, ...validSaved };
    const hasSavedState = Object.keys(validSaved).length > 0;
    if (!VALID_NOTE_TYPES.includes(merged.noteType)) {
      merged.noteType = defaults.noteType;
    }
    merged.templateContentDrafts = sanitizeTemplateContentDrafts(
      validSaved.templateContentDrafts,
    );
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
    if (merged.themeId === "custom") merged.themeCustomized = true;
    if (!Object.prototype.hasOwnProperty.call(validSaved, "contentMode")) {
      merged.contentMode = "text";
    }
    if (!["text", "photo"].includes(merged.contentMode)) {
      merged.contentMode = defaults.contentMode;
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
    if (
      !["system", "grotesk", "rounded", "handwritten", "serif"].includes(
        merged.titleFontFamily,
      )
    ) {
      merged.titleFontFamily = noteTypePresets[merged.noteType].titleFontFamily;
    }
    // 兼容旧版状态：首次升级时把用户原有字号作为偏好值，不强行恢复默认字号。
    if (!Object.prototype.hasOwnProperty.call(validSaved, "mainSizePreference")) {
      merged.mainSizePreference = merged.mainSize;
    }
    if (!Object.prototype.hasOwnProperty.call(validSaved, "mainLineHeight")) {
      merged.mainLineHeight = noteTypePresets[merged.noteType].mainLineHeight;
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
    // 旧版“视频框”已经收敛进模型发布的大图主导；只迁移模式名，保留用户保存的照片区域与取景。
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

function getTemplateContentSnapshot(source) {
  return Object.fromEntries(
    TEMPLATE_CONTENT_KEYS.map((key) => [key, String(source?.[key] ?? "")]),
  );
}

function sanitizeTemplateContentDrafts(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter(([noteType, draft]) => VALID_NOTE_TYPES.includes(noteType) && draft)
      .map(([noteType, draft]) => [noteType, getTemplateContentSnapshot(draft)]),
  );
}

function isSameTemplateContent(first, second) {
  return TEMPLATE_CONTENT_KEYS.every(
    (key) => String(first?.[key] ?? "") === String(second?.[key] ?? ""),
  );
}

function applyTemplateContentSnapshot(snapshot) {
  TEMPLATE_CONTENT_KEYS.forEach((key) => {
    state[key] = String(snapshot?.[key] ?? "");
  });
  // 文案原稿自带换行结构，载入时恢复该模板的自动标题强调，避免沿用上一份文案的逐行比例。
  state.titleLineScales = null;
}

function updateCurrentTemplateContentDraft() {
  state.templateContentDrafts = {
    ...(state.templateContentDrafts || {}),
    [state.noteType]: getTemplateContentSnapshot(state),
  };
}

function inferThemeIdFromColors(source = state) {
  return Object.entries(themes).find(([, theme]) =>
    THEME_COLOR_KEYS.every(
      (key) => normalizeHex(theme[key]) === normalizeHex(source[key]),
    ),
  )?.[0];
}

function getActiveThemeFamily() {
  return themes[state.themeId]?.family || null;
}

function getNoteTypePreset(noteType = state.noteType) {
  return noteTypePresets[noteType] || noteTypePresets.experience;
}

function getTypographyProfile(noteType = state.noteType) {
  const baseProfile = typographyProfiles[noteType] || typographyProfiles.experience;
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

function applyNoteTypePreset(noteType, { notify = true } = {}) {
  if (!VALID_NOTE_TYPES.includes(noteType)) return;

  const previousNoteType = state.noteType;
  const currentContent = getTemplateContentSnapshot(state);
  const existingDraft = state.templateContentDrafts?.[noteType];
  const templateContentDrafts = {
    ...(state.templateContentDrafts || {}),
    [previousNoteType]: currentContent,
  };
  const nextContent =
    noteType === previousNoteType
      ? currentContent
      : existingDraft || PRESET_FEED_CONTENT[noteType];
  const preset = getNoteTypePreset(noteType);
  const framePreset = photoLayoutPresets[preset.photoLayout];
  const { label, description, ...styleValues } = preset;
  // 两套基础色系按模板分工，但用户手动挑过配色后就以用户的选择为准，不再被模板覆盖。
  const themeColors = state.themeCustomized
    ? null
    : getThemeColors(NOTE_TYPE_DEFAULT_THEMES[noteType]);
  state = {
    ...state,
    ...styleValues,
    ...framePreset,
    ...nextContent,
    ...(themeColors || {}),
    ...(themeColors ? { themeId: NOTE_TYPE_DEFAULT_THEMES[noteType] } : {}),
    noteType,
    templateContentDrafts,
    styleCustomized: false,
    mainSizePreference: preset.mainSize,
    titleLineScales: null,
    photoFocusX: 50,
    photoFocusY: 50,
    photoEditMode: "frame",
  };
  templateContentBeforeExample = null;
  customStyleOpen = true;
  syncControls();
  scheduleRender();
  if (notify) {
    const contentStatus =
      noteType === previousNoteType
        ? "文案保持不变"
        : existingDraft
          ? "已恢复这套模板的文案草稿"
          : "已载入模板原稿";
    const themeStatus = themeColors
      ? `；配色跟随为「${themes[NOTE_TYPE_DEFAULT_THEMES[noteType]].label}」`
      : "";
    showToast(`已切换到「${label}」；${contentStatus}${themeStatus}`);
  }
}

function loadCurrentTemplateExample() {
  const example = PRESET_FEED_CONTENT[state.noteType];
  if (!example || isSameTemplateContent(state, example)) {
    showToast("当前已经是这套模板的最佳示例");
    return;
  }

  templateContentBeforeExample = {
    noteType: state.noteType,
    content: getTemplateContentSnapshot(state),
  };
  applyTemplateContentSnapshot(example);
  updateCurrentTemplateContentDraft();
  syncControls();
  scheduleRender();
  showToast("已载入最佳示例；可以按字段逐项替换，原文仍可恢复");
}

function restoreTemplateContentBeforeExample() {
  if (
    !templateContentBeforeExample ||
    templateContentBeforeExample.noteType !== state.noteType
  ) {
    templateContentBeforeExample = null;
    syncStyleControls();
    return;
  }

  applyTemplateContentSnapshot(templateContentBeforeExample.content);
  updateCurrentTemplateContentDraft();
  templateContentBeforeExample = null;
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

function calculateMainSizeLimit() {
  // 实际渲染会自动拆行并按可用高度收敛，这里保留完整字号范围供标题优先布局使用。
  return MAX_MAIN_SIZE;
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
      (state.photoLayout === "album"
        ? 40
        : ["deepDive", "video"].includes(state.photoLayout)
          ? 32
          : 28) *
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

function drawSamplePhotoFallback(metrics) {
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
  context.fillStyle = normalizeHex(state.mediaColor) || defaults.mediaColor;
  context.fillRect(metrics.x, metrics.y, metrics.width, metrics.height);

  if (editorialSamplePhoto.complete && editorialSamplePhoto.naturalWidth > 0) {
    const crop = calculateCoverCrop(
      editorialSamplePhoto.naturalWidth,
      editorialSamplePhoto.naturalHeight,
      metrics.width,
      metrics.height,
      50,
      50,
    );
    context.drawImage(
      editorialSamplePhoto,
      crop.sourceX,
      crop.sourceY,
      crop.sourceWidth,
      crop.sourceHeight,
      metrics.x,
      metrics.y,
      metrics.width,
      metrics.height,
    );
  }
  context.restore();
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

function drawBlock(block, x, top) {
  if (!block.lines.length) return;

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

function drawCenteredBlock(block, centerX, top) {
  if (!block.lines.length) return;

  context.save();
  context.fillStyle = state.textColor;
  context.globalAlpha = block.options.alpha ?? 1;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";

  let lineTop = top;
  block.lines.forEach((line, index) => {
    const size = block.sizes[index];
    const spacing = size * (block.options.letterSpacingEm || 0);
    context.font = fontString(
      block.options.weight,
      size,
      block.options.family || state.fontFamily,
    );
    const lineWidth = measureSpacedText(line, spacing);
    drawTextWithSpacing(line, centerX - lineWidth / 2, lineTop + size * 0.82, spacing);
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

function getMediaFirstTextRegion(cardY, cardHeight, photoWindow, layoutScale) {
  const bottom = cardY + cardHeight - 84 * layoutScale;
  const minimumHeight = 350 * layoutScale;
  const desiredTop = photoWindow.y + photoWindow.height + 42 * layoutScale;
  const top = Math.max(
    cardY + 160 * layoutScale,
    Math.min(desiredTop, bottom - minimumHeight),
  );
  return { top, bottom };
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
// 这时把富余空间平均摊到每一条缝隙上（含首块之前与末块之后）：
// 缝隙越多、每条越小，就不会出现某一处 20% 以上的整块空白。
// minGaps[i] 是第 i 块之后必须保留的最小间隙，空间不足时只剩这些最小值。
function distributeVerticalSlack(regionTop, regionBottom, heights, minGaps = []) {
  const totalHeight = heights.reduce((sum, height) => sum + height, 0);
  const totalMinGap = minGaps.reduce((sum, gap) => sum + gap, 0);
  const seamCount = heights.length + 1;
  const slack = Math.max(
    0,
    regionBottom - regionTop - totalHeight - totalMinGap,
  );
  const share = slack / seamCount;
  const tops = [];
  let cursor = regionTop + share;
  heights.forEach((height, index) => {
    tops.push(cursor);
    cursor += height + (minGaps[index] ?? 0) + share;
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

function parseTutorialSteps(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  const parts = raw
    .split(/\s*(?:→|->|›|·|\||｜)\s*/u)
    .map((part) =>
      part
        .replace(/^(?:0?\d{1,2})\s*[.、:：)\-]?\s*/u, "")
        .trim(),
    )
    .filter(Boolean);
  return parts.length > 1 ? parts.slice(0, 3) : [raw];
}

function drawCenteredFittedText(text, centerX, baseline, maxWidth, fontSize, weight) {
  let size = fontSize;
  context.font = fontString(weight, size, state.fontFamily);
  const measured = context.measureText(text).width;
  if (measured > maxWidth) size *= maxWidth / measured;
  context.font = fontString(weight, size, state.fontFamily);
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillText(text, centerX, baseline);
}

function getTutorialRailHeight(steps, layoutScale, scale) {
  return (steps.length > 1 ? 142 : 82) * layoutScale * scale;
}

function drawTutorialStepRail(steps, x, top, width, layoutScale, scale) {
  if (!steps.length) return;
  const height = getTutorialRailHeight(steps, layoutScale, scale);
  context.save();
  context.fillStyle = state.textColor;
  context.strokeStyle = state.textColor;

  if (steps.length === 1) {
    roundedRectPath(context, x, top, width, height, height / 2);
    context.globalAlpha = 0.12;
    context.fill();
    context.globalAlpha = 1;
    const badgeRadius = 25 * layoutScale * scale;
    const badgeX = x + 42 * layoutScale * scale;
    const centerY = top + height / 2;
    context.beginPath();
    context.arc(badgeX, centerY, badgeRadius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = state.cardColor;
    context.font = fontString(900, 19 * layoutScale * scale, state.fontFamily);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("01", badgeX, centerY);
    context.fillStyle = state.textColor;
    context.textAlign = "left";
    context.font = fontString(800, 28 * layoutScale * scale, state.fontFamily);
    context.fillText(
      steps[0],
      badgeX + 43 * layoutScale * scale,
      centerY + 1 * layoutScale * scale,
    );
    context.restore();
    return;
  }

  const cellWidth = width / steps.length;
  const circleRadius = 34 * layoutScale * scale;
  const circleY = top + circleRadius;
  const firstCenterX = x + cellWidth / 2;
  const lastCenterX = x + width - cellWidth / 2;
  context.globalAlpha = 0.34;
  context.lineWidth = 3 * layoutScale * scale;
  context.beginPath();
  context.moveTo(firstCenterX + circleRadius, circleY);
  context.lineTo(lastCenterX - circleRadius, circleY);
  context.stroke();
  context.globalAlpha = 1;

  steps.forEach((step, index) => {
    const centerX = x + cellWidth * (index + 0.5);
    context.fillStyle = state.textColor;
    context.beginPath();
    context.arc(centerX, circleY, circleRadius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = state.cardColor;
    context.font = fontString(900, 25 * layoutScale * scale, state.fontFamily);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(String(index + 1).padStart(2, "0"), centerX, circleY);
    context.fillStyle = state.textColor;
    drawCenteredFittedText(
      step,
      centerX,
      top + 121 * layoutScale * scale,
      cellWidth - 22 * layoutScale * scale,
      30 * layoutScale * scale,
      850,
    );
  });
  context.restore();
}

function renderTutorialContent({
  cardX,
  cardY,
  cardWidth,
  cardHeight,
  padding,
  photoWindow,
  layoutScale,
}) {
  const contentX = cardX + padding;
  const maxContentWidth = cardWidth - padding * 2;
  drawTemplateCornerLabels({
    cardX,
    cardY,
    cardWidth,
    padding,
    maxContentWidth,
    layoutScale,
  });

  const typography = getTypographyProfile("tutorial");
  const mainSize = Number(state.mainSize) * layoutScale;
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
  const steps = parseTutorialSteps(state.subtitleText);
  const hasEyebrow = Boolean(state.upperText.trim());
  let scale = 1;
  let eyebrowHeight = hasEyebrow ? 58 * layoutScale : 0;
  let railHeight = getTutorialRailHeight(steps, layoutScale, scale);
  let firstGap = (hasEyebrow ? 28 : 0) * layoutScale;
  let secondGap = (steps.length ? 34 : 0) * layoutScale;
  let stackHeight =
    eyebrowHeight + mainBlock.height + railHeight + firstGap + secondGap;
  const isMediaFirst = state.photoLayout === "album" && photoWindow;
  const regionTop = isMediaFirst
    ? photoWindow.y + photoWindow.height + 36 * layoutScale
    : cardY + 158 * layoutScale;
  const regionBottom = isMediaFirst
    ? cardY + cardHeight - 88 * layoutScale
    : photoWindow
      ? photoWindow.y - 38 * layoutScale
      : cardY + cardHeight - 88 * layoutScale;
  const availableHeight = Math.max(1, regionBottom - regionTop);

  if (stackHeight > availableHeight) {
    scale = Math.max(0.64, availableHeight / stackHeight);
    mainBlock = scaleTextBlock(mainBlock, scale);
    eyebrowHeight *= scale;
    railHeight = getTutorialRailHeight(steps, layoutScale, scale);
    firstGap *= scale;
    secondGap *= scale;
    stackHeight =
      eyebrowHeight + mainBlock.height + railHeight + firstGap + secondGap;
  }

  // 纯文字模式下承诺、标题和步骤条各自独立定位，富余空间摊给四条缝隙，
  // 避免顶部角标被一整段空白孤立、或步骤条与标题挤在一起。
  if (!photoWindow) {
    const offset = Number(state.verticalOffset) * layoutScale;
    const blocks = [];
    if (hasEyebrow) blocks.push({ kind: "eyebrow", height: eyebrowHeight, gap: firstGap });
    blocks.push({ kind: "title", height: mainBlock.height, gap: secondGap });
    if (railHeight) blocks.push({ kind: "rail", height: railHeight, gap: 0 });
    const tops = distributeVerticalSlack(
      regionTop + offset,
      regionBottom,
      blocks.map((block) => block.height),
      blocks.map((block) => block.gap),
    );
    blocks.forEach((block, index) => {
      const top = tops[index];
      if (block.kind === "eyebrow") {
        drawEyebrowChip(
          state.upperText,
          contentX,
          top,
          maxContentWidth,
          layoutScale,
          scale,
          false,
        );
      } else if (block.kind === "title") {
        drawBlock(mainBlock, contentX, top);
      } else {
        drawTutorialStepRail(steps, contentX, top, maxContentWidth, layoutScale, scale);
      }
    });
  } else {
    let cursorY =
      getOpticalStackTop(regionTop, regionBottom, stackHeight, 0.5) +
      Number(state.verticalOffset) * layoutScale;
    cursorY = clamp(cursorY, regionTop, Math.max(regionTop, regionBottom - stackHeight));
    if (hasEyebrow) {
      drawEyebrowChip(
        state.upperText,
        contentX,
        cursorY,
        maxContentWidth,
        layoutScale,
        scale,
        false,
      );
      cursorY += eyebrowHeight + firstGap;
    }
    drawBlock(mainBlock, contentX, cursorY);
    cursorY += mainBlock.height + secondGap;
    drawTutorialStepRail(steps, contentX, cursorY, maxContentWidth, layoutScale, scale);
  }

  drawSpacedText(
    state.footerText.trim(),
    contentX,
    cardY + cardHeight - 37 * layoutScale,
    maxContentWidth,
    state.footerAlign,
    layoutScale,
  );
}

function renderProductContent({
  cardX,
  cardY,
  cardWidth,
  cardHeight,
  padding,
  photoWindow,
  layoutScale,
}) {
  const contentX = cardX + padding;
  const maxContentWidth = cardWidth - padding * 2;
  drawTemplateCornerLabels({
    cardX,
    cardY,
    cardWidth,
    padding,
    maxContentWidth,
    layoutScale,
  });

  const typography = getTypographyProfile("product");
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
  const subtitleLines = splitLines(state.subtitleText);
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
  const hasEyebrow = Boolean(state.upperText.trim());
  let scale = 1;
  let eyebrowHeight = hasEyebrow ? 58 * layoutScale : 0;
  let firstGap = (hasEyebrow ? 28 : 0) * layoutScale;
  let secondGap = (subtitleBlock.height ? 26 : 0) * layoutScale;
  let stackHeight =
    eyebrowHeight + mainBlock.height + subtitleBlock.height + firstGap + secondGap;
  const isMediaFirst = state.photoLayout === "album" && photoWindow;
  const regionTop = isMediaFirst
    ? photoWindow.y + photoWindow.height + 36 * layoutScale
    : cardY + 158 * layoutScale;
  const regionBottom = isMediaFirst
    ? cardY + cardHeight - 88 * layoutScale
    : photoWindow
      ? photoWindow.y - 34 * layoutScale
      : cardY + cardHeight - 88 * layoutScale;
  const availableHeight = Math.max(1, regionBottom - regionTop);

  if (stackHeight > availableHeight) {
    // 产品封面先压缩眉题、解释文字和间距；标题只有在副信息已经让位后才缩小。
    const supportingHeight = eyebrowHeight + subtitleBlock.height + firstGap + secondGap;
    const overflow = stackHeight - availableHeight;
    scale = supportingHeight > 0
      ? Math.max(0.76, 1 - overflow / supportingHeight)
      : 1;
    subtitleBlock = scaleTextBlock(subtitleBlock, scale);
    eyebrowHeight *= scale;
    firstGap *= scale;
    secondGap *= scale;
    stackHeight =
      eyebrowHeight + mainBlock.height + subtitleBlock.height + firstGap + secondGap;

    if (stackHeight > availableHeight) {
      const availableTitleHeight = Math.max(
        1,
        availableHeight - eyebrowHeight - subtitleBlock.height - firstGap - secondGap,
      );
      mainBlock = scaleTextBlock(
        mainBlock,
        Math.max(0.62, availableTitleHeight / mainBlock.height),
      );
      stackHeight =
        eyebrowHeight + mainBlock.height + subtitleBlock.height + firstGap + secondGap;
    }

    if (stackHeight > availableHeight) {
      const finalScale = availableHeight / stackHeight;
      mainBlock = scaleTextBlock(mainBlock, finalScale);
      subtitleBlock = scaleTextBlock(subtitleBlock, finalScale);
      eyebrowHeight *= finalScale;
      firstGap *= finalScale;
      secondGap *= finalScale;
      scale *= finalScale;
      stackHeight = availableHeight;
    }
  }

  // 纯文字模式下测评条件、结论标题和结论依据各自独立定位，富余空间摊给四条缝隙；
  // 有照片时照片已经占住下半区，仍按原来的整组视觉重心摆放。
  if (!photoWindow) {
    const offset = Number(state.verticalOffset) * layoutScale;
    const blocks = [];
    if (hasEyebrow) blocks.push({ kind: "eyebrow", height: eyebrowHeight, gap: firstGap });
    blocks.push({ kind: "title", height: mainBlock.height, gap: secondGap });
    if (subtitleBlock.height) {
      blocks.push({ kind: "subtitle", height: subtitleBlock.height, gap: 0 });
    }
    const tops = distributeVerticalSlack(
      regionTop + offset,
      regionBottom,
      blocks.map((block) => block.height),
      blocks.map((block) => block.gap),
    );
    blocks.forEach((block, index) => {
      const top = tops[index];
      if (block.kind === "eyebrow") {
        drawEyebrowChip(
          state.upperText,
          contentX,
          top,
          maxContentWidth,
          layoutScale,
          scale,
          true,
        );
      } else if (block.kind === "title") {
        drawBlock(mainBlock, contentX, top);
      } else {
        drawBlock(subtitleBlock, contentX, top);
      }
    });
  } else {
    let cursorY =
      getOpticalStackTop(regionTop, regionBottom, stackHeight, 0.46) +
      Number(state.verticalOffset) * layoutScale;
    cursorY = clamp(cursorY, regionTop, Math.max(regionTop, regionBottom - stackHeight));
    if (hasEyebrow) {
      drawEyebrowChip(
        state.upperText,
        contentX,
        cursorY,
        maxContentWidth,
        layoutScale,
        scale,
        true,
      );
      cursorY += eyebrowHeight + firstGap;
    }
    drawBlock(mainBlock, contentX, cursorY);
    cursorY += mainBlock.height + secondGap;
    drawBlock(subtitleBlock, contentX, cursorY);
  }

  drawSpacedText(
    state.footerText.trim(),
    contentX,
    cardY + cardHeight - 37 * layoutScale,
    maxContentWidth,
    state.footerAlign,
    layoutScale,
  );
}

function renderConversationContent({
  cardX,
  cardY,
  cardWidth,
  cardHeight,
  padding,
  layoutScale,
}) {
  const contentX = cardX + padding;
  const maxContentWidth = cardWidth - padding * 2;
  const centerX = cardX + cardWidth / 2;
  drawTemplateCornerLabels({
    cardX,
    cardY,
    cardWidth,
    padding,
    maxContentWidth,
    layoutScale,
  });

  const panelHeight = 250 * layoutScale;
  const panelY = cardY + cardHeight - 390 * layoutScale;
  const panelRadius = 38 * layoutScale;
  const typography = getTypographyProfile("experience");
  const mainSize = Number(state.mainSize) * layoutScale;
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
      minScale: 0.44,
      fitMode: "perLine",
      letterSpacingEm: typography.letterSpacingEm,
      maxLineSizeRatio: 1.34,
      lineHeight: Number(state.mainLineHeight),
    },
  );

  const upperText = state.upperText.trim();
  const upperSize = Math.min(Number(state.upperSize), 38) * layoutScale;
  let upperHeight = upperText ? upperSize * 1.1 : 0;
  let upperGap = upperText ? 34 * layoutScale : 0;
  let stackHeight = upperHeight + upperGap + mainBlock.height;
  const regionTop = cardY + 176 * layoutScale;
  const regionBottom = panelY - 64 * layoutScale;
  const availableHeight = Math.max(1, regionBottom - regionTop);
  if (stackHeight > availableHeight) {
    const fit = availableHeight / stackHeight;
    mainBlock = scaleTextBlock(mainBlock, fit);
    upperHeight *= fit;
    upperGap *= fit;
    stackHeight = availableHeight;
  }

  let cursorY =
    getOpticalStackTop(regionTop, regionBottom, stackHeight, 0.46) +
    Number(state.verticalOffset) * layoutScale;
  cursorY = clamp(cursorY, regionTop, Math.max(regionTop, regionBottom - stackHeight));
  if (upperText) {
    context.save();
    context.fillStyle = state.textColor;
    context.globalAlpha = typography.upperAlpha;
    drawCenteredFittedText(
      upperText,
      centerX,
      cursorY + upperHeight * 0.8,
      maxContentWidth,
      upperHeight,
      750,
    );
    context.restore();
    cursorY += upperHeight + upperGap;
  }
  drawCenteredBlock(mainBlock, centerX, cursorY);

  // Prompt 卡保持独立于标题区域：用户只需修改下方副标题，就能得到类似对话输入框的内容承接。
  context.save();
  roundedRectPath(
    context,
    contentX,
    panelY,
    maxContentWidth,
    panelHeight,
    panelRadius,
  );
  context.fillStyle = normalizeHex(state.mediaColor) || defaults.mediaColor;
  context.fill();
  context.strokeStyle = state.inkColor;
  context.globalAlpha = 0.18;
  context.lineWidth = 2 * layoutScale;
  context.stroke();
  context.globalAlpha = 1;

  context.fillStyle = state.textColor;
  context.globalAlpha = 0.58;
  context.font = fontString(800, 18 * layoutScale, "grotesk");
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillText("PROMPT", contentX + 32 * layoutScale, panelY + 37 * layoutScale);
  context.restore();

  const subtitleSize = Math.min(Number(state.subtitleSize), 38) * layoutScale;
  let promptBlock = createBlock(
    splitLines(state.subtitleText),
    splitLines(state.subtitleText).map(() => subtitleSize),
    {
      weight: 700,
      family: state.fontFamily,
      maxWidth: maxContentWidth - 64 * layoutScale,
      minScale: 0.58,
      lineGap: subtitleSize * 0.25,
      alpha: typography.subtitleAlpha,
    },
  );
  const promptTextHeight = panelHeight - 116 * layoutScale;
  if (promptBlock.height > promptTextHeight) {
    promptBlock = scaleTextBlock(promptBlock, promptTextHeight / promptBlock.height);
  }
  drawBlock(promptBlock, contentX + 32 * layoutScale, panelY + 57 * layoutScale);

  const controlY = panelY + panelHeight - 43 * layoutScale;
  const controlRadius = 23 * layoutScale;
  context.save();
  context.strokeStyle = state.textColor;
  context.fillStyle = state.textColor;
  context.lineWidth = 2.5 * layoutScale;
  context.globalAlpha = 0.76;
  context.beginPath();
  context.arc(contentX + 42 * layoutScale, controlY, controlRadius, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(contentX + 32 * layoutScale, controlY);
  context.lineTo(contentX + 52 * layoutScale, controlY);
  context.moveTo(contentX + 42 * layoutScale, controlY - 10 * layoutScale);
  context.lineTo(contentX + 42 * layoutScale, controlY + 10 * layoutScale);
  context.stroke();

  const sendX = contentX + maxContentWidth - 42 * layoutScale;
  context.globalAlpha = 1;
  context.beginPath();
  context.arc(sendX, controlY, controlRadius, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = state.cardColor;
  context.lineWidth = 3 * layoutScale;
  context.beginPath();
  context.moveTo(sendX - 9 * layoutScale, controlY + 5 * layoutScale);
  context.lineTo(sendX, controlY - 5 * layoutScale);
  context.lineTo(sendX + 9 * layoutScale, controlY + 5 * layoutScale);
  context.stroke();
  context.restore();

  drawSpacedText(
    state.footerText.trim(),
    contentX,
    cardY + cardHeight - 36 * layoutScale,
    maxContentWidth,
    state.footerAlign,
    layoutScale,
  );
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

function renderDeepDiveContent({
  cardX,
  cardY,
  cardWidth,
  cardHeight,
  padding,
  visualWindow,
  visualFirst,
  layoutScale,
}) {
  const contentX = cardX + padding;
  const maxContentWidth = cardWidth - padding * 2;
  const isMediaFirst = visualFirst ?? (state.photoLayout === "album" && visualWindow);
  // 编辑杂志支持纯文字、下置证据图和上置大图；元信息始终贴近接下来要读的正文。
  const metadataBaseline = isMediaFirst
    ? visualWindow.y + visualWindow.height + 70 * layoutScale
    : cardY + 105 * layoutScale;
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
  const typography = getTypographyProfile("deepDive");
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
  let proofBlock = createBlock(
    splitLines(state.upperText),
    splitLines(state.upperText).map(() => upperSize),
    {
      weight: 700,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.62,
      lineGap: upperSize * 0.24,
      alpha: typography.upperAlpha,
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
      alpha: typography.subtitleAlpha,
    },
  );

  const regionTop = dividerY + 46 * layoutScale;
  let firstGap = 22 * layoutScale;
  let secondGap = 28 * layoutScale;
  // 底沿留出足够空间给页脚：文案排满时也不会压到 EDITORIAL SERIES 这行。
  const safeBottom =
    visualWindow && !isMediaFirst
      ? visualWindow.y - 44 * layoutScale
      : cardY + cardHeight - 96 * layoutScale;
  let requestedHeight =
    mainBlock.height +
    proofBlock.height +
    subtitleBlock.height +
    (proofBlock.height ? firstGap : 0) +
    (subtitleBlock.height ? secondGap : 0);
  const availableHeight = Math.max(1, safeBottom - regionTop);

  if (requestedHeight > availableHeight) {
    const scale = availableHeight / requestedHeight;
    const scaleBlock = (block) => ({
      ...block,
      sizes: block.sizes.map((size) => size * scale),
      lineGap: block.lineGap * scale,
      lineGaps: block.lineGaps.map((gap) => gap * scale),
      height: block.height * scale,
    });
    mainBlock = scaleBlock(mainBlock);
    proofBlock = scaleBlock(proofBlock);
    subtitleBlock = scaleBlock(subtitleBlock);
    firstGap *= scale;
    secondGap *= scale;
    requestedHeight = availableHeight;
  }

  // 原来标题硬贴在分隔线下方，余量全部堆到卡片底部，形成一整块空白。
  // 现在标题、论据和导读各自定位，富余空间摊到每条缝隙上。
  const blocks = [{ block: mainBlock, gap: proofBlock.height ? firstGap : secondGap }];
  if (proofBlock.height) {
    blocks.push({ block: proofBlock, gap: subtitleBlock.height ? secondGap : 0 });
  }
  if (subtitleBlock.height) blocks.push({ block: subtitleBlock, gap: 0 });
  const tops = distributeVerticalSlack(
    regionTop + Number(state.verticalOffset) * layoutScale,
    safeBottom,
    blocks.map((entry) => entry.block.height),
    blocks.map((entry) => entry.gap),
  );
  blocks.forEach((entry, index) => drawBlock(entry.block, contentX, tops[index]));

  drawSpacedText(
    state.footerText.trim(),
    contentX,
    cardY + cardHeight - 36 * layoutScale,
    maxContentWidth,
    state.footerAlign,
    layoutScale,
  );
}

function renderModelLaunchContent({
  cardX,
  cardY,
  cardWidth,
  cardHeight,
  padding,
  photoWindow,
  layoutScale,
}) {
  const contentX = cardX + padding;
  const maxContentWidth = cardWidth - padding * 2;
  const isSupportingPhoto = photoWindow && state.photoLayout === "editorial";
  const heroWindow =
    photoWindow ||
    {
      x: contentX,
      y: cardY + 120 * layoutScale,
      width: maxContentWidth,
      height: 500 * layoutScale,
      radius: 38 * layoutScale,
    };

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
  if (photoWindow) {
    const photoShade = context.createLinearGradient(
      heroWindow.x,
      heroWindow.y,
      heroWindow.x,
      heroWindow.y + heroWindow.height,
    );
    photoShade.addColorStop(0, "rgba(0, 0, 0, 0.32)");
    photoShade.addColorStop(0.42, "rgba(0, 0, 0, 0.02)");
    photoShade.addColorStop(1, "rgba(0, 0, 0, 0.7)");
    context.fillStyle = photoShade;
    context.fillRect(heroWindow.x, heroWindow.y, heroWindow.width, heroWindow.height);
  } else {
    context.fillStyle = normalizeHex(state.mediaColor) || defaults.mediaColor;
    context.fillRect(heroWindow.x, heroWindow.y, heroWindow.width, heroWindow.height);
    context.strokeStyle = pickReadableInk(normalizeHex(state.mediaColor) || defaults.mediaColor);
    context.globalAlpha = 0.18;
    context.lineWidth = 3 * layoutScale;
    context.beginPath();
    context.arc(
      heroWindow.x + heroWindow.width * 0.2,
      heroWindow.y + heroWindow.height * 0.08,
      heroWindow.height * 0.62,
      -0.35,
      Math.PI * 1.25,
    );
    context.stroke();
    context.globalAlpha = 1;
  }

  // 照片上压半透明黑渐变，白字最稳；纯色主视觉块则按块底色重新选墨。
  const heroInk = photoWindow
    ? "#FFFFFF"
    : pickReadableInk(normalizeHex(state.mediaColor) || defaults.mediaColor);
  const label = state.topLeft.trim();
  if (label) {
    let labelSize = 24 * layoutScale;
    context.font = fontString(800, labelSize, "grotesk");
    const labelMaxWidth = heroWindow.width * 0.62;
    const measured = context.measureText(label).width;
    if (measured > labelMaxWidth) labelSize *= labelMaxWidth / measured;
    context.font = fontString(800, labelSize, "grotesk");
    context.fillStyle = heroInk;
    context.textAlign = "left";
    context.textBaseline = "alphabetic";
    context.fillText(
      label,
      heroWindow.x + 30 * layoutScale,
      heroWindow.y + 48 * layoutScale,
    );
  }

  const issue = state.topRight.trim() || "5.6";
  let issueSize = Math.min(238 * layoutScale, heroWindow.height * 0.48);
  context.font = fontString(900, issueSize, state.titleFontFamily);
  const issueMaxWidth = heroWindow.width - 56 * layoutScale;
  const issueWidth = context.measureText(issue).width;
  if (issueWidth > issueMaxWidth) issueSize *= issueMaxWidth / issueWidth;
  context.font = fontString(900, issueSize, state.titleFontFamily);
  context.fillStyle = heroInk;
  context.textAlign = "right";
  context.textBaseline = "alphabetic";
  context.fillText(
    issue,
    heroWindow.x + heroWindow.width - 28 * layoutScale,
    heroWindow.y + heroWindow.height - 18 * layoutScale,
  );
  context.restore();

  const typography = getTypographyProfile("hardwareVideo");
  const mainSize = Number(state.mainSize) * layoutScale;
  const upperSize = Math.min(Number(state.upperSize), 32) * layoutScale;
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
  let upperBlock = createBlock(
    splitLines(state.upperText),
    splitLines(state.upperText).map(() => upperSize),
    {
      weight: 800,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.62,
      lineGap: upperSize * 0.2,
      alpha: typography.upperAlpha,
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
      lineGap: subtitleSize * 0.24,
      alpha: typography.subtitleAlpha,
    },
  );

  let firstGap = upperBlock.height ? 18 * layoutScale : 0;
  let secondGap = subtitleBlock.height ? 22 * layoutScale : 0;
  let stackHeight =
    upperBlock.height +
    mainBlock.height +
    subtitleBlock.height +
    firstGap +
    secondGap;
  // 图文佐证把标题放在照片上方；大图主导与纯文字发布卡则先展示主视觉。
  const regionTop = isSupportingPhoto
    ? cardY + 154 * layoutScale
    : heroWindow.y + heroWindow.height + 34 * layoutScale;
  const regionBottom = isSupportingPhoto
    ? heroWindow.y - 36 * layoutScale
    : cardY + cardHeight - 96 * layoutScale;
  const availableHeight = Math.max(1, regionBottom - regionTop);
  if (stackHeight > availableHeight) {
    const fit = availableHeight / stackHeight;
    upperBlock = scaleTextBlock(upperBlock, fit);
    mainBlock = scaleTextBlock(mainBlock, fit);
    subtitleBlock = scaleTextBlock(subtitleBlock, fit);
    firstGap *= fit;
    secondGap *= fit;
    stackHeight = availableHeight;
  }

  // 原来整组内容硬贴在主视觉下方，剩余空间全部落在页脚之上形成整块空白。
  // 现在发布阶段、标题和升级维度各自定位，富余空间摊到每条缝隙上。
  const blocks = [];
  if (upperBlock.height) blocks.push({ block: upperBlock, gap: firstGap });
  blocks.push({ block: mainBlock, gap: secondGap });
  if (subtitleBlock.height) blocks.push({ block: subtitleBlock, gap: 0 });
  const tops = distributeVerticalSlack(
    regionTop + Number(state.verticalOffset) * layoutScale,
    regionBottom,
    blocks.map((entry) => entry.block.height),
    blocks.map((entry) => entry.gap),
  );
  blocks.forEach((entry, index) => drawBlock(entry.block, contentX, tops[index]));

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

  const isDeepDive = state.noteType === "deepDive";
  const isModelLaunch = state.noteType === "hardwareVideo";
  const isTutorial = state.noteType === "tutorial";
  const isProduct = state.noteType === "product";
  const hasPhotoMode = state.contentMode === "photo";
  const samplePhoto =
    editorialSamplePhoto.complete && editorialSamplePhoto.naturalWidth > 0
      ? editorialSamplePhoto
      : null;
  const displayPhoto = hasPhotoMode ? uploadedPhoto || samplePhoto : null;
  const photoWindow = hasPhotoMode
    ? getPhotoWindowMetrics(cardX, cardY, cardWidth, cardHeight, padding, layoutScale)
    : null;
  if (state.noteType === "experience" && !photoWindow) {
    renderConversationContent({
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      padding,
      layoutScale,
    });
    syncPhotoTransformOverlay(null);
    renderFeedPreview(canvasWidth, canvasHeight);
    return;
  }
  if (isDeepDive) {
    // 无照片时也保留一个上置视觉区，让“编辑杂志”与普通大字封面有明确结构差异。
    const visualWindow =
      photoWindow ||
      {
        x: contentX,
        y: cardY + 112 * layoutScale,
        width: maxContentWidth,
        height: 360 * layoutScale,
        radius: 36 * layoutScale,
      };
    if (photoWindow && displayPhoto) drawPhotoWindow(photoWindow, displayPhoto);
    else drawDeepDiveVisual(visualWindow, layoutScale);
    renderDeepDiveContent({
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      padding,
      visualWindow,
      visualFirst: !photoWindow || state.photoLayout === "album",
      layoutScale,
    });
    syncPhotoTransformOverlay(photoWindow);
    renderFeedPreview(canvasWidth, canvasHeight);
    return;
  }
  if (isModelLaunch) {
    if (photoWindow) {
      if (displayPhoto) drawPhotoWindow(photoWindow, displayPhoto);
      else drawSamplePhotoFallback(photoWindow);
    }
    renderModelLaunchContent({
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      padding,
      photoWindow,
      layoutScale,
    });
    syncPhotoTransformOverlay(photoWindow);
    renderFeedPreview(canvasWidth, canvasHeight);
    return;
  }
  if (photoWindow) {
    if (displayPhoto) drawPhotoWindow(photoWindow, displayPhoto);
    else drawDeepDiveVisual(photoWindow, layoutScale);
  }

  if (isTutorial) {
    renderTutorialContent({
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      padding,
      photoWindow,
      layoutScale,
    });
    syncPhotoTransformOverlay(photoWindow);
    renderFeedPreview(canvasWidth, canvasHeight);
    return;
  }

  if (isProduct) {
    renderProductContent({
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      padding,
      photoWindow,
      layoutScale,
    });
    syncPhotoTransformOverlay(photoWindow);
    renderFeedPreview(canvasWidth, canvasHeight);
    return;
  }

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
  const subtitleLines = splitLines(state.subtitleText);

  const typography = getTypographyProfile();
  const isMediaFirstLayout = state.photoLayout === "album" && photoWindow;
  const upperSize = Number(state.upperSize) * layoutScale;
  const mainSize = Number(state.mainSize) * layoutScale;
  const subtitleSize = Number(state.subtitleSize) * layoutScale;
  const titleLines = wrapTitleLinesForEmphasis(
    splitLines(state.titleText),
    mainSize,
    maxContentWidth,
    typography,
  );

  const upperBlock = createBlock(
    upperLines,
    upperLines.map(() => upperSize),
    {
      weight: 700,
      family: state.fontFamily,
      maxWidth: maxContentWidth,
      minScale: 0.62,
      lineGap: upperSize * 0.25,
      alpha: typography.upperAlpha,
    },
  );

  const mainSizes = getTitleDesiredSizes(titleLines, mainSize, typography);
  const mainBlock = createBlock(titleLines, mainSizes, {
    weight: typography.titleWeight,
    family: state.titleFontFamily,
    maxWidth: maxContentWidth,
    minScale: 0.46,
    fitMode: "perLine",
    letterSpacingEm: typography.letterSpacingEm,
    maxLineSizeRatio: typography.maxLineSizeRatio,
    // 行距直接跟随用户设置；不同字号的标题行会各自按比例换算真实间隙。
    lineHeight: Number(state.mainLineHeight),
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
      alpha: typography.subtitleAlpha,
    },
  );

  let activeBlocks = [upperBlock, mainBlock, subtitleBlock].filter((block) => block.height > 0);
  let groupGap = (isMediaFirstLayout ? 18 : Number(state.groupGap)) * layoutScale;
  let groupHeight =
    activeBlocks.reduce((sum, block) => sum + block.height, 0) +
    Math.max(0, activeBlocks.length - 1) * groupGap;

  const mediaTextRegion = isMediaFirstLayout
    ? getMediaFirstTextRegion(cardY, cardHeight, photoWindow, layoutScale)
    : null;
  const safeContentTop = mediaTextRegion?.top ?? cardY + 158 * layoutScale;
  // 图文佐证把标题放在照片上方；大图主导则先展示图片，再承接下方结论。
  const safeContentBottom =
    mediaTextRegion?.bottom ??
    (photoWindow ? photoWindow.y - 44 * layoutScale : cardY + cardHeight - 90 * layoutScale);
  const availableContentHeight = Math.max(1, safeContentBottom - safeContentTop);

  // 空间不足时先压缩组间距，避免字号滑杆的变化被整体等比缩放抵消。
  if (groupHeight > availableContentHeight && activeBlocks.length > 1) {
    const blockHeight = activeBlocks.reduce((sum, block) => sum + block.height, 0);
    const gapCount = activeBlocks.length - 1;
    const fittingGap = (availableContentHeight - blockHeight) / gapCount;
    const minimumGap = (isMediaFirstLayout ? 14 : 20) * layoutScale;
    groupGap = Math.max(minimumGap, Math.min(groupGap, fittingGap));
    groupHeight = blockHeight + gapCount * groupGap;
  }

  if (groupHeight > availableContentHeight) {
    const verticalScale = availableContentHeight / groupHeight;
    activeBlocks = activeBlocks.map((block) => ({
      ...block,
      sizes: block.sizes.map((size) => size * verticalScale),
      lineGap: block.lineGap * verticalScale,
      lineGaps: block.lineGaps.map((gap) => gap * verticalScale),
      height: block.height * verticalScale,
    }));
    groupGap *= verticalScale;
    groupHeight = availableContentHeight;
  }

  // 标题优先从安全区顶部开始，剩余留白集中到下方；避免上下各空一块把主标题夹小。
  const preferredTop = safeContentTop + Number(state.verticalOffset) * layoutScale;
  let blockTop = Math.max(
    safeContentTop,
    Math.min(preferredTop, safeContentBottom - groupHeight),
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
  renderFloatingPreview();

  const title = splitLines(state.titleText).join(" ").trim();
  feedPosterTitle.textContent = title || "未命名封面";
  ratioBadge.textContent = `小红书图文 · ${canvasWidth} × ${canvasHeight} · 3:4`;
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
      const { limit, constrained } = syncMainSizeLimit();
      output.value = `目标 ${state.mainSize} px${constrained ? ` · 安全上限 ${limit}` : ""}`;
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

function syncTemplateCopyGuide() {
  const guide = TEMPLATE_COPY_GUIDES[state.noteType];
  const example = PRESET_FEED_CONTENT[state.noteType];
  if (!guide || !example) return;

  if (templateCopyGuideBestFor) {
    templateCopyGuideBestFor.textContent = `适合${guide.bestFor}`;
  }
  if (templateCopyGuideSummary) {
    templateCopyGuideSummary.textContent = guide.summary;
  }
  if (templateCopyGuideList) {
    const rows = guide.roles.map(([label, rule, sample]) => {
      const row = document.createElement("div");
      row.className = "template-copy-guide-row";

      const labelElement = document.createElement("strong");
      labelElement.textContent = label;
      const content = document.createElement("div");
      const ruleElement = document.createElement("span");
      ruleElement.className = "template-copy-guide-rule";
      ruleElement.textContent = rule;
      const sampleElement = document.createElement("p");
      sampleElement.className = "template-copy-guide-sample";
      sampleElement.textContent = sample;
      content.append(ruleElement, sampleElement);
      row.append(labelElement, content);
      return row;
    });
    templateCopyGuideList.replaceChildren(...rows);
  }

  if (applyTemplateExampleButton) {
    const isCurrentExample = isSameTemplateContent(state, example);
    applyTemplateExampleButton.disabled = isCurrentExample;
    applyTemplateExampleButton.textContent = isCurrentExample
      ? "已载入最佳示例"
      : "载入最佳示例";
  }
  if (restoreTemplateContentButton) {
    restoreTemplateContentButton.hidden = !(
      templateContentBeforeExample &&
      templateContentBeforeExample.noteType === state.noteType
    );
  }
}

function syncStyleControls() {
  const preset = getNoteTypePreset();
  if (styleStatus) {
    styleStatus.textContent = state.styleCustomized
      ? `当前样式：${preset.label} · 已微调`
      : `当前样式：${preset.label}`;
  }
  if (styleDescription) {
    styleDescription.textContent = state.styleCustomized
      ? "重选当前样式会恢复推荐排版；文案草稿、照片和配色保持不变。"
      : `${preset.description}。下方原稿给出最佳字数与换行。`;
  }
  syncTemplateCopyGuide();
  if (customStyleControls) customStyleControls.hidden = !customStyleOpen;
  if (customStyleButton) {
    customStyleButton.textContent = customStyleOpen ? "精简参数" : "展开全部";
    customStyleButton.setAttribute("aria-expanded", String(customStyleOpen));
  }
  if (photoLayoutPicker) photoLayoutPicker.hidden = false;
  if (photoPresetHint) {
    const hints = {
      experience: "纯文字时下方副标题会进入 Prompt 卡；切换图文后可补一张背景或结果截图。",
      tutorial: "下方副标题可用 → 分隔 2–3 个步骤；照片适合放结果截图。",
      product: "优先上传真实产品图或结果截图；避免把多张图挤进同一封面。",
      deepDive: "纯文字展示手绘思考线稿；大图主导适合专题封面或文章头图。",
      hardwareVideo: "右上角建议填写版本号，例如 5.6；上传横图后会成为发布主视觉。",
    };
    photoPresetHint.textContent = hints[state.noteType];
  }
  const textHints = {
    experience: ["写提问背景或一句前置条件", "直接写读者正在问的问题", "写进 Prompt 卡：目标、限制或已有材料"],
    tutorial: ["写步骤数量，例如：3 步快速上手", "写清要完成的结果", "用 → 分隔 2–3 个步骤"],
    product: ["写测试条件或一句结论", "先写产品名，再写真实结果", "补充限制、成本或适用人群"],
    deepDive: ["写议题、报告来源或证据", "像文章标题一样完整表达观点", "写导读或核心结论"],
    hardwareVideo: ["写发布阶段，例如 FRONTIER UPDATE", "两行内说清升级重点", "补充能力、速度或适用边界"],
  }[state.noteType];
  if (textHints) {
    upperTextHint.textContent = textHints[0];
    titleTextHint.textContent = textHints[1];
    subtitleTextHint.textContent = textHints[2];
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
    "mainLineHeight",
    "upperSize",
    "subtitleSize",
    "groupGap",
    "verticalOffset",
    "sidePadding",
  ].forEach((key) => setControlValue(key, state[key]));

  updateRangeOutputs();
  syncActiveTheme();
  syncFontPresetButtons();
  syncNoteTypeButtons();
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
      if (TEMPLATE_CONTENT_KEYS.includes(key)) {
        updateCurrentTemplateContentDraft();
        syncTemplateCopyGuide();
      }
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

function bindNoteTypeControls() {
  document.querySelectorAll("[data-note-type]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.noteType === state.noteType && !state.styleCustomized) return;
      applyNoteTypePreset(button.dataset.noteType);
    });
  });
}

function bindTemplateCopyGuideControls() {
  applyTemplateExampleButton?.addEventListener("click", loadCurrentTemplateExample);
  restoreTemplateContentButton?.addEventListener(
    "click",
    restoreTemplateContentBeforeExample,
  );
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
        const recommendedLayout = getNoteTypePreset().photoLayout;
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

async function createPresetFeedCovers() {
  const originalState = { ...state };
  const originalPhoto = uploadedPhoto;
  const covers = [];

  try {
    for (const noteType of PRESET_FEED_ORDER) {
      const preset = getNoteTypePreset(noteType);
      const framePreset = photoLayoutPresets[preset.photoLayout];
      const { label, description, ...styleValues } = preset;
      // 每套样式用它自己的默认配色，这样这组对比才等于主页真实会长成的样子；
      // 用户手动挑过配色时以用户的选择为准，五张统一走那一套色。
      const themeId = state.themeCustomized
        ? null
        : NOTE_TYPE_DEFAULT_THEMES[noteType];
      state = {
        ...originalState,
        ...styleValues,
        ...framePreset,
        ...PRESET_FEED_CONTENT[noteType],
        ...(getThemeColors(themeId) || {}),
        ...(themeId ? { themeId } : {}),
        noteType,
        contentMode: ["product", "deepDive", "hardwareVideo"].includes(noteType)
          ? "photo"
          : "text",
        styleCustomized: false,
        mainSizePreference: preset.mainSize,
        titleLineScales: null,
        photoFocusX: 50,
        photoFocusY: 50,
        photoEditMode: "frame",
      };
      // 图文样式读取内置本地示例照片，不访问用户相册。
      uploadedPhoto = null;
      renderPoster();
      covers.push({
        id: `preset-${noteType}`,
        source: "preset",
        name: `样式 · ${label}`,
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
  state = { ...defaults, templateContentDrafts: {} };
  templateContentBeforeExample = null;
  customStyleOpen = true;
  syncControls();
  scheduleRender();
  showToast("已恢复示例内容");
}

function initialize() {
  renderThemeList();
  bindNoteTypeControls();
  bindTemplateCopyGuideControls();
  bindCustomStyleControls();
  bindStandardControls();
  bindTitleLineSizeControls();
  bindThemes();
  bindFontPresetControls();
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
