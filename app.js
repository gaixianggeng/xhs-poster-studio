"use strict";

// ===== 运行环境适配层 =====
// platform-web.js 或 platform-minitool.js 必须先于本文件加载，负责示例、存储、导出与发笔记。
const PLATFORM = window.PosterPlatform || {};

// ===== 画布基准 =====
// 所有坐标都以小红书图文首图 1080 × 1440 为基准；预览、主页缩略图和导出共用同一次 Canvas 渲染。
const STORAGE_KEY = "xhs-poster-studio:field-note:v1";
const W = 1080;
const H = 1440;
const PAD_X = 72;
const PAD_TOP = 64;
const PAD_BOTTOM = 56;
const CONTENT_W = W - PAD_X * 2;
// 底带顶边固定在 880：证据窗通常从 750 左右开始，正好跨在两块颜色之间，形成拼色。
const BAND_TOP = 880;
const BAND_RADIUS = 96;
const WINDOW_BOTTOM = H - PAD_BOTTOM - 30 - 40;
const MIN_WINDOW_HEIGHT = 320;
const STAMP_SIZE = 256;
// 结论章斜盖在证据窗右上角；胶囊行超过这条线会提前换行，避免被章盖住。
const PILL_LIMIT_WITH_STAMP = 668;
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MAX_HISTORY_COVERS = 10;

// 部署在国内服务器，不能依赖 Google Fonts；全部使用系统字体，缺字时由苹方或雅黑兜底。
const FONTS = Object.freeze({
  display: '"Arial Black", "Helvetica Neue", Arial, "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif',
  sans: '"Helvetica Neue", Arial, "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif',
  cjk: '"PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif',
  mono: '"SF Mono", Menlo, Consolas, "PingFang SC", "Microsoft YaHei", monospace',
});

// ===== 配色 =====
// 参考 Android 16（Material 3 Expressive）的配色思路：浅色容器底 + 另一色底带 + 同色系深色文字
// + 一个高饱和主色 + 一个点缀色。色值是按该思路自行调配的，不是官方色板。
const SCHEMES = Object.freeze({
  rose: { label: "樱粉", bg: "#FFD9E4", band: "#D3E4FF", ink: "#3B0920", key: "#C2185B", onKey: "#FFFFFF", stamp: "#FFC94D", sticker: "#7FB0FF", e: ["#E8DEFF", "#D3E4FF", "#C4F1DE", "#FFE2B3"] },
  mint: { label: "薄荷", bg: "#C4F1DE", band: "#FFD9E4", ink: "#00241A", key: "#00795A", onKey: "#FFFFFF", stamp: "#B79CFF", sticker: "#FF8FB1", e: ["#E8DEFF", "#D3E4FF", "#DDF5A6", "#FFE2B3"] },
  lime: { label: "青柠", bg: "#DDF5A6", band: "#E8DEFF", ink: "#172600", key: "#3F6B00", onKey: "#FFFFFF", stamp: "#FF8A6B", sticker: "#B79CFF", e: ["#D3E4FF", "#FFD9E4", "#E8DEFF", "#FFE2B3"] },
  sky: { label: "天蓝", bg: "#D3E4FF", band: "#FFE2B3", ink: "#001B44", key: "#2563EB", onKey: "#FFFFFF", stamp: "#5FDDB0", sticker: "#FFB648", e: ["#FFD9E4", "#E8DEFF", "#C4F1DE", "#FFE2B3"] },
  lavender: { label: "薰衣草", bg: "#E8DEFF", band: "#DDF5A6", ink: "#21005E", key: "#6D3EF5", onKey: "#FFFFFF", stamp: "#FF8FB1", sticker: "#C3EE5E", e: ["#FFE2B3", "#D3E4FF", "#FFD9E4", "#C4F1DE"] },
  apricot: { label: "杏黄", bg: "#FFE2B3", band: "#D3E4FF", ink: "#2D1700", key: "#C2410C", onKey: "#FFFFFF", stamp: "#C3EE5E", sticker: "#7FB0FF", e: ["#FFD9E4", "#E8DEFF", "#C4F1DE", "#D3E4FF"] },
});

// 封面深一档：底色和底带换成同色相更深一级的容器色。
// 白色信息流里浅底容易和背景融在一起，封面需要先把卡片轮廓立住；内页保持标准浅色。
const DEEP = Object.freeze({
  "#FFD9E4": "#FFB1C8",
  "#D3E4FF": "#A9C7FF",
  "#C4F1DE": "#8EE3C0",
  "#DDF5A6": "#C2EB6A",
  "#E8DEFF": "#CDBDFF",
  "#FFE2B3": "#FFC57A",
});

// ===== 形状 =====
// Material 3 Expressive 风格的软形状，用圆的并集表示（0–100 坐标系），绘制时同向填充即可合并。
const COOKIE = [[50, 50, 42], ...ring(12, 41, 8.5)];
const FLOWER = [[50, 50, 28], ...ring(8, 27, 16)];
const CLOVER = [[50, 50, 16], ...ring(4, 26, 21)];
const STAR = [[50, 5], [61, 38], [96, 38], [68, 59], [79, 93], [50, 72], [21, 93], [32, 59], [4, 38], [39, 38]];

function ring(count, radius, size, rotation = 0) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count + rotation;
    return [50 + radius * Math.cos(angle), 50 + radius * Math.sin(angle), size];
  });
}

// ===== 证据类型与示例 =====
const EVIDENCE_TYPES = Object.freeze([
  { id: "screenshot", label: "截图" },
  { id: "steps", label: "步骤" },
  { id: "rows", label: "分层" },
  { id: "compare", label: "对比" },
  { id: "rating", label: "评分" },
  { id: "statement", label: "大字" },
]);
const EVIDENCE_IDS = EVIDENCE_TYPES.map((type) => type.id);

const CONTENT_KEYS = Object.freeze([
  "masthead",
  "seriesText",
  "mainWord",
  "mainSuffix",
  "titleText",
  "pillsText",
  "stampText",
  "footerText",
  "evidenceLabel",
  "evidenceType",
  "stepsText",
  "rowsText",
  "compareLeft",
  "compareRight",
  "ratingScore",
  "ratingComment",
  "ratingNote",
  "statementText",
  "statementNote",
  "evidenceNote",
  "scheme",
]);

const TEXT_FIELD_IDS = CONTENT_KEYS.filter((key) => !["evidenceType", "scheme"].includes(key));

const BLANK_CONTENT = Object.freeze({
  masthead: "FIELD NOTE · 实测记录",
  seriesText: "",
  mainWord: "",
  mainSuffix: "",
  titleText: "",
  pillsText: "",
  stampText: "",
  footerText: PLATFORM.defaultFooter || "亲手测过才写｜实测笔记",
  evidenceLabel: "证据",
  evidenceType: "screenshot",
  stepsText: "",
  rowsText: "",
  compareLeft: "",
  compareRight: "",
  ratingScore: "",
  ratingComment: "",
  ratingNote: "",
  statementText: "",
  statementNote: "",
  evidenceNote: "",
  scheme: "rose",
});

// 示例与默认页脚由运行环境适配层提供：网页版用账号真实笔记，小工具版用不含品牌名的中性示例。
const EXAMPLES = Object.freeze(PLATFORM.examples || []);

const PUBLISHED_COVER_SAMPLES = Object.freeze(PLATFORM.publishedCovers || []);

// ===== DOM =====
const canvas = document.querySelector("#posterCanvas");
const context = canvas.getContext("2d");
const feedPosterCanvas = document.querySelector("#feedPosterCanvas");
const feedPosterContext = feedPosterCanvas.getContext("2d");
const feedPosterTitle = document.querySelector("#feedPosterTitle");
const toast = document.querySelector("#toast");
const titleHint = document.querySelector("#titleHint");
const exampleSelect = document.querySelector("#exampleSelect");
const loadExampleButton = document.querySelector("#loadExampleButton");
const undoExampleButton = document.querySelector("#undoExampleButton");
const evidenceTypePicker = document.querySelector("#evidenceTypePicker");
const schemeList = document.querySelector("#schemeList");
const tonePicker = document.querySelector("#tonePicker");
const stickersToggle = document.querySelector("#stickersToggle");
const screenshotInput = document.querySelector("#screenshotInput");
const screenshotStatus = document.querySelector("#screenshotStatus");
const removeScreenshotButton = document.querySelector("#removeScreenshotButton");
const historyFeedGrid = document.querySelector("#historyFeedGrid");
const historyEmptyState = document.querySelector("#historyEmptyState");
const historyStatus = document.querySelector("#historyStatus");
const historyCoverInput = document.querySelector("#historyCoverInput");
const loadPublishedCoversButton = document.querySelector("#loadPublishedCoversButton");
const loadSchemeCoversButton = document.querySelector("#loadSchemeCoversButton");
const clearHistoryButton = document.querySelector("#clearHistoryButton");

let state = loadState();
let uploadedPhoto = null;
let uploadedPhotoUrl = "";
let lastLayout = null;
let photoDrag = null;
let renderFrame = 0;
let toastTimer = 0;
let historyCovers = [];
let contentBeforeExample = null;

// ===== 状态 =====
function defaultState() {
  return Object.assign({}, BLANK_CONTENT, EXAMPLES.length ? EXAMPLES[0].content : {}, {
    tone: "cover",
    stickers: true,
    photoFocusX: 50,
    photoFocusY: 50,
  });
}

function sanitizeState(source) {
  const next = Object.assign({}, source);
  if (!SCHEMES[next.scheme]) next.scheme = "rose";
  if (!["cover", "inner"].includes(next.tone)) next.tone = "cover";
  if (!EVIDENCE_IDS.includes(next.evidenceType)) next.evidenceType = "rating";
  next.stickers = next.stickers !== false;
  next.photoFocusX = clamp(Number(next.photoFocusX), 0, 100, 50);
  next.photoFocusY = clamp(Number(next.photoFocusY), 0, 100, 50);
  TEXT_FIELD_IDS.forEach((key) => {
    next[key] = next[key] == null ? "" : String(next[key]);
  });
  return next;
}

function mergeSavedState(saved) {
  return sanitizeState(Object.assign({}, defaultState(), saved && typeof saved === "object" ? saved : {}));
}

// 首帧先同步读取（网页版 localStorage）；小工具的容器存储是异步接口，读到后在 initialize 里再覆盖一次。
function loadState() {
  try {
    const raw = PLATFORM.readStateSync ? PLATFORM.readStateSync(STORAGE_KEY) : null;
    return mergeSavedState(raw ? JSON.parse(raw) : null);
  } catch (error) {
    return defaultState();
  }
}

let persistTimer = 0;
// 输入时每帧都会触发保存；合并成 300 ms 一次，避免小工具频繁调用异步存储接口。
function persistState() {
  clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    try {
      if (PLATFORM.saveState) PLATFORM.saveState(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // 存储不可用或已满时仍可继续编辑，只是下次打开不保留。
    }
  }, 300);
}

function pickContent(source = state) {
  const content = {};
  CONTENT_KEYS.forEach((key) => {
    content[key] = source[key];
  });
  return content;
}

// ===== 通用工具 =====
function clamp(value, minimum, maximum, fallback = minimum) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(maximum, Math.max(minimum, value));
}

function splitLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

// 用全角竖线分隔字段；也接受半角 |，方便直接粘贴。
function splitPair(line) {
  const index = line.search(/[｜|]/);
  if (index < 0) return [line.trim(), ""];
  return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
}

function hasCjk(text) {
  return /[㐀-鿿豈-﫿]/.test(text);
}

function font(weight, size, family) {
  return `${weight} ${Math.round(size * 10) / 10}px ${FONTS[family]}`;
}

function getScheme(source = state) {
  const base = SCHEMES[source.scheme] || SCHEMES.rose;
  if (source.tone !== "cover") return base;
  // 只加深底色与底带；文字、主色和点缀色不变，保证两档之间仍是同一套配色。
  return Object.assign({}, base, { bg: DEEP[base.bg] || base.bg, band: DEEP[base.band] || base.band });
}

function roundRectPath(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, width, height, radius, color) {
  roundRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = color;
  ctx.fill();
}

function fillShape(ctx, circles, centerX, centerY, size, color) {
  const scale = size / 100;
  ctx.beginPath();
  circles.forEach(([x, y, r]) => {
    const cx = centerX + (x - 50) * scale;
    const cy = centerY + (y - 50) * scale;
    ctx.moveTo(cx + r * scale, cy);
    ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
  });
  ctx.fillStyle = color;
  ctx.fill("nonzero");
}

// 超出宽度时截断并补省略号；只用于说明类小字，标题与主词改用缩小字号保证完整。
function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

// 在不超过 maxWidth 的前提下取最大字号，最小不低于 minSize。
function fitFontSize(ctx, text, weight, family, preferred, minSize, maxWidth) {
  ctx.font = font(weight, 100, family);
  const widthAt100 = ctx.measureText(text).width || 1;
  return Math.max(minSize, Math.min(preferred, (maxWidth * 100) / widthAt100));
}

function drawPill(ctx, { x, y, text, size, family, weight, padX, height, bg, fg }) {
  ctx.font = font(weight, size, family);
  const width = ctx.measureText(text).width + padX * 2;
  fillRoundRect(ctx, x, y, width, height, height / 2, bg);
  ctx.fillStyle = fg;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + padX, y + height / 2 + 1);
  ctx.textBaseline = "alphabetic";
  return width;
}

// 标题里只有首个【】会成为关键词胶囊，其余括号按普通文字处理。
function parseTitle(text) {
  let keywordUsed = false;
  return splitLines(text)
    .slice(0, 2)
    .map((line) => {
      const segments = [];
      const pattern = /【([^】]*)】/g;
      let last = 0;
      let match;
      while ((match = pattern.exec(line))) {
        if (match.index > last) segments.push({ text: line.slice(last, match.index), keyword: false });
        if (match[1]) {
          segments.push({ text: match[1], keyword: !keywordUsed });
          keywordUsed = true;
        }
        last = pattern.lastIndex;
      }
      if (last < line.length) segments.push({ text: line.slice(last), keyword: false });
      return segments;
    });
}

function titlePlainText(text) {
  return splitLines(text).slice(0, 2).join(" ").replace(/[【】]/g, "");
}

// ===== 渲染 =====
// 主词与后缀共用一行，整体宽度不超过内容区；贴纸是否绘制也依赖这里算出的宽度。
function measureMainWord(ctx, source) {
  const mainWord = source.mainWord.trim();
  const mainSuffix = source.mainSuffix.trim();
  if (!mainWord) return { mainWord, mainSuffix, family: "display", size: 0, width: 0 };
  const family = hasCjk(mainWord) ? "cjk" : "display";
  ctx.font = font(900, 64, "cjk");
  const suffixWidth = mainSuffix ? ctx.measureText(mainSuffix).width + 20 : 0;
  const size = fitFontSize(ctx, mainWord, 900, family, family === "cjk" ? 236 : 260, 120, CONTENT_W - suffixWidth);
  ctx.font = font(900, size, family);
  return { mainWord, mainSuffix, family, size, width: ctx.measureText(mainWord).width + suffixWidth };
}

function renderPoster(ctx = context, source = state, photo = uploadedPhoto) {
  const s = getScheme(source);
  const layout = {};
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // 1. 上下两块颜色：浅色底 + 圆角底带
  ctx.fillStyle = s.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.beginPath();
  ctx.moveTo(0, H);
  ctx.lineTo(0, BAND_TOP + BAND_RADIUS);
  ctx.arcTo(0, BAND_TOP, BAND_RADIUS, BAND_TOP, BAND_RADIUS);
  ctx.lineTo(W - BAND_RADIUS, BAND_TOP);
  ctx.arcTo(W, BAND_TOP, W, BAND_TOP + BAND_RADIUS, BAND_RADIUS);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = s.band;
  ctx.fill();

  // 2. 贴纸画在文字下层；主词伸到贴纸位置时不画该贴纸，避免和主词叠在一起
  const main = measureMainWord(ctx, source);
  if (source.stickers) {
    const mainRight = PAD_X + main.width;
    if (mainRight < 848) fillShape(ctx, FLOWER, 934, 220, 148, s.sticker);
    if (mainRight < 760) fillShape(ctx, CLOVER, 808, 354, 72, s.stamp);
  }

  // 3. 报告头：左侧深色胶囊 + 右侧系列与日期
  const mastheadText = source.masthead.trim();
  let mastheadWidth = 0;
  if (mastheadText) {
    mastheadWidth = drawPill(ctx, {
      x: PAD_X,
      y: PAD_TOP,
      text: mastheadText,
      size: 26,
      family: "mono",
      weight: 700,
      padX: 24,
      height: 54,
      bg: s.ink,
      fg: s.bg,
    });
  }
  const seriesText = source.seriesText.trim();
  if (seriesText) {
    const available = CONTENT_W - mastheadWidth - 24;
    const size = fitFontSize(ctx, seriesText, 700, "mono", 26, 18, available);
    ctx.font = font(700, size, "mono");
    ctx.fillStyle = s.ink;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(fitText(ctx, seriesText, available), W - PAD_X, PAD_TOP + 28);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  // 4. 主词：主色超大字，按宽度自动缩小；中文主词用中文字体
  const mainTop = PAD_TOP + 54 + 52;
  let cursorY = mainTop;
  const { mainWord, mainSuffix, family, size } = main;
  if (mainWord) {
    ctx.font = font(900, size, family);
    const metrics = ctx.measureText(mainWord);
    const ascent = metrics.actualBoundingBoxAscent || size * 0.74;
    const descent = Math.max(metrics.actualBoundingBoxDescent || 0, 0);
    const baseline = mainTop + ascent;
    ctx.fillStyle = s.key;
    ctx.fillText(mainWord, PAD_X, baseline);
    if (mainSuffix) {
      ctx.font = font(900, 64, "cjk");
      ctx.fillText(mainSuffix, PAD_X + metrics.width + 20, baseline);
    }
    cursorY = baseline + descent;
  }

  // 5. 两行标题：关键词放进主色胶囊；整体按最宽一行缩小，保证完整
  const titleLines = parseTitle(source.titleText);
  if (titleLines.length) {
    let size = 96;
    const keywordPad = (value) => value * 0.31;
    const measureLine = (segments, fontSize) => {
      ctx.font = font(800, fontSize, "sans");
      return segments.reduce(
        (sum, segment) =>
          sum + ctx.measureText(segment.text).width + (segment.keyword ? keywordPad(fontSize) * 2 : 0),
        0,
      );
    };
    const widest = Math.max(...titleLines.map((segments) => measureLine(segments, size)));
    if (widest > CONTENT_W) size = Math.max(56, (size * CONTENT_W) / widest);
    const lineHeight = size * 1.18;
    const top = cursorY + 34;
    titleLines.forEach((segments, index) => {
      const lineTop = top + index * lineHeight;
      const middle = lineTop + lineHeight / 2;
      let x = PAD_X;
      ctx.font = font(800, size, "sans");
      ctx.textBaseline = "middle";
      segments.forEach((segment) => {
        const width = ctx.measureText(segment.text).width;
        if (segment.keyword) {
          const pad = keywordPad(size);
          const pillHeight = size * 1.12;
          fillRoundRect(ctx, x, middle - pillHeight / 2, width + pad * 2, pillHeight, pillHeight / 2, s.key);
          ctx.fillStyle = s.onKey;
          ctx.fillText(segment.text, x + pad, middle + size * 0.03);
          x += width + pad * 2;
        } else {
          ctx.fillStyle = s.ink;
          ctx.fillText(segment.text, x, middle + size * 0.03);
          x += width;
        }
      });
      ctx.textBaseline = "alphabetic";
    });
    cursorY = top + titleLines.length * lineHeight;
  }

  // 6. 实测条件胶囊：白 / 底带色 / 点缀色轮换，最多 3 个，放不下时换行
  const pills = splitLines(source.pillsText).slice(0, 3);
  const hasStamp = Boolean(source.stampText.trim());
  if (pills.length) {
    const pillColors = ["#FFFFFF", s.band, s.stamp];
    const rowLimit = hasStamp ? PILL_LIMIT_WITH_STAMP : CONTENT_W;
    const pillHeight = 54;
    let x = PAD_X;
    let y = cursorY + 30;
    ctx.font = font(700, 28, "sans");
    pills.forEach((text, index) => {
      const label = fitText(ctx, text, rowLimit - 52);
      const width = ctx.measureText(label).width + 52;
      if (x > PAD_X && x + width > PAD_X + rowLimit) {
        x = PAD_X;
        y += pillHeight + 12;
      }
      drawPill(ctx, {
        x,
        y,
        text: label,
        size: 28,
        family: "sans",
        weight: 700,
        padX: 26,
        height: pillHeight,
        bg: pillColors[index % pillColors.length],
        fg: s.ink,
      });
      x += width + 14;
    });
    cursorY = y + pillHeight;
  }

  // 7. 证据窗：白底圆角，跨在上下两块颜色之间
  const windowTop = clamp(cursorY + 48, 600, WINDOW_BOTTOM - MIN_WINDOW_HEIGHT);
  const windowHeight = WINDOW_BOTTOM - windowTop;
  fillRoundRect(ctx, PAD_X, windowTop, CONTENT_W, windowHeight, 44, "#FFFFFF");
  const label = source.evidenceLabel.trim();
  if (label) {
    ctx.font = font(700, 22, "mono");
    drawPill(ctx, {
      x: PAD_X + 32,
      y: windowTop + 26,
      text: fitText(ctx, label, CONTENT_W - 260),
      size: 22,
      family: "mono",
      weight: 700,
      padX: 20,
      height: 44,
      bg: s.bg,
      fg: s.ink,
    });
  }
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.font = font(700, 20, "mono");
  ctx.fillStyle = s.ink;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("EVIDENCE", W - PAD_X - 32, windowTop + 48);
  ctx.restore();

  const area = {
    x: PAD_X + 32,
    y: windowTop + 26 + 44 + 20,
    w: CONTENT_W - 64,
    h: WINDOW_BOTTOM - 28 - (windowTop + 26 + 44 + 20),
  };
  const note = source.evidenceNote.trim();
  if (note) {
    area.h -= 70;
    ctx.font = font(700, 24, "mono");
    drawPill(ctx, {
      x: area.x,
      y: area.y + area.h + 16,
      text: fitText(ctx, note, area.w - 48),
      size: 24,
      family: "mono",
      weight: 700,
      padX: 24,
      height: 54,
      bg: s.key,
      fg: s.onKey,
    });
  }
  layout.evidenceArea = drawEvidence(ctx, source, s, area, photo);

  // 8. 结论章：波浪饼干形，斜盖在证据窗右上角。
  // 圆心落在窗顶上方 14 px：章的下半部只压住窗内标题行右侧，不遮挡证据内容。
  const stampText = source.stampText.trim();
  if (stampText) {
    const centerX = W - PAD_X + 14 - STAMP_SIZE / 2;
    const centerY = windowTop - 14;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((-12 * Math.PI) / 180);
    fillShape(ctx, COOKIE, 0, 0, STAMP_SIZE, s.stamp);
    const mainSize = fitFontSize(ctx, stampText, 900, "cjk", 60, 28, 176);
    ctx.fillStyle = s.ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = font(700, 20, "mono");
    ctx.fillText("实测结论", 0, -mainSize * 0.55 - 22);
    ctx.font = font(900, mainSize, "cjk");
    ctx.fillText(stampText, 0, 2);
    ctx.font = font(700, 18, "mono");
    ctx.fillText("VERDICT", 0, mainSize * 0.55 + 22);
    ctx.restore();
  }

  // 9. 页脚：左｜右
  const [footerLeft, footerRight] = splitPair(source.footerText);
  ctx.font = font(700, 24, "mono");
  ctx.fillStyle = s.ink;
  ctx.textBaseline = "alphabetic";
  if (footerLeft) {
    ctx.textAlign = "left";
    ctx.fillText(fitText(ctx, footerLeft, CONTENT_W / 2 - 12), PAD_X, H - PAD_BOTTOM - 4);
  }
  if (footerRight) {
    ctx.textAlign = "right";
    ctx.fillText(fitText(ctx, footerRight, CONTENT_W / 2 - 12), W - PAD_X, H - PAD_BOTTOM - 4);
  }

  ctx.restore();
  return layout;
}

function drawEvidencePlaceholder(ctx, s, area, message) {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.font = font(700, 30, "cjk");
  ctx.fillStyle = s.ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, area.x + area.w / 2, area.y + area.h / 2);
  ctx.restore();
}

function drawEvidence(ctx, source, s, area, photo) {
  const type = source.evidenceType;
  if (type === "screenshot") return drawScreenshot(ctx, source, s, area, photo);
  if (type === "steps") drawSteps(ctx, source, s, area);
  if (type === "rows") drawRows(ctx, source, s, area);
  if (type === "compare") drawCompare(ctx, source, s, area);
  if (type === "rating") drawRating(ctx, source, s, area);
  if (type === "statement") drawStatement(ctx, source, s, area);
  return area;
}

function drawScreenshot(ctx, source, s, area, photo) {
  ctx.save();
  roundRectPath(ctx, area.x, area.y, area.w, area.h, 28);
  ctx.clip();
  if (photo) {
    // 截图按 cover 方式铺满证据区，取景位置由拖动记录的 focus 决定。
    const scale = Math.max(area.w / photo.naturalWidth, area.h / photo.naturalHeight);
    const drawWidth = photo.naturalWidth * scale;
    const drawHeight = photo.naturalHeight * scale;
    const x = area.x - (drawWidth - area.w) * (source.photoFocusX / 100);
    const y = area.y - (drawHeight - area.h) * (source.photoFocusY / 100);
    ctx.drawImage(photo, x, y, drawWidth, drawHeight);
  } else {
    ctx.fillStyle = s.e[0];
    ctx.fillRect(area.x, area.y, area.w, area.h);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = s.ink;
    ctx.font = font(700, 32, "cjk");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("选择截图后显示在这里", area.x + area.w / 2, area.y + area.h / 2 - 20);
    ctx.font = font(500, 22, "mono");
    ctx.fillText("在预览上拖动可以调整取景", area.x + area.w / 2, area.y + area.h / 2 + 26);
  }
  ctx.restore();
  return area;
}

function drawSteps(ctx, source, s, area) {
  const steps = splitLines(source.stepsText).slice(0, 4).map(splitPair);
  if (!steps.length) {
    drawEvidencePlaceholder(ctx, s, area, "在左侧填写步骤");
    return;
  }
  const rowHeight = area.h / steps.length;
  steps.forEach(([title, detail], index) => {
    const centerY = area.y + rowHeight * index + rowHeight / 2;
    const badge = Math.min(62, rowHeight - 16);
    fillRoundRect(ctx, area.x, centerY - badge / 2, badge, badge, badge * 0.32, s.e[index % 4]);
    ctx.fillStyle = s.ink;
    ctx.font = font(900, badge * 0.52, "display");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(index + 1), area.x + badge / 2, centerY + 1);
    ctx.textAlign = "left";
    const textX = area.x + badge + 24;
    const textWidth = area.w - badge - 24;
    ctx.font = font(800, 36, "cjk");
    ctx.textBaseline = "middle";
    if (detail) {
      ctx.fillText(fitText(ctx, title, textWidth), textX, centerY - 18);
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.font = font(500, 23, "cjk");
      ctx.fillText(fitText(ctx, detail, textWidth), textX, centerY + 22);
      ctx.restore();
    } else {
      ctx.fillText(fitText(ctx, title, textWidth), textX, centerY);
    }
    ctx.textBaseline = "alphabetic";
  });
}

function drawRows(ctx, source, s, area) {
  const rows = splitLines(source.rowsText).slice(0, 4).map(splitPair);
  if (!rows.length) {
    drawEvidencePlaceholder(ctx, s, area, "在左侧填写分层");
    return;
  }
  const gap = 16;
  const rowHeight = Math.min(96, (area.h - gap * (rows.length - 1)) / rows.length);
  const totalHeight = rowHeight * rows.length + gap * (rows.length - 1);
  const startY = area.y + (area.h - totalHeight) / 2;
  ctx.font = font(700, 26, "mono");
  const labelWidth = Math.min(
    area.w * 0.45,
    Math.max(...rows.map(([labelText]) => ctx.measureText(labelText).width)) + 28,
  );
  rows.forEach(([labelText, detail], index) => {
    const y = startY + index * (rowHeight + gap);
    fillRoundRect(ctx, area.x, y, area.w, rowHeight, 24, s.e[index % 4]);
    ctx.fillStyle = s.ink;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = font(700, 26, hasCjk(labelText) ? "cjk" : "mono");
    ctx.fillText(fitText(ctx, labelText, labelWidth - 12), area.x + 22, y + rowHeight / 2);
    ctx.font = font(700, 30, "cjk");
    ctx.fillText(fitText(ctx, detail, area.w - labelWidth - 44), area.x + 22 + labelWidth, y + rowHeight / 2);
    ctx.textBaseline = "alphabetic";
  });
}

function parseCard(text) {
  const lines = splitLines(text);
  if (!lines.length) return null;
  const [name, tag] = splitPair(lines[0]);
  return { name, tag, items: lines.slice(1, 6) };
}

function drawCompare(ctx, source, s, area) {
  const cards = [parseCard(source.compareLeft), parseCard(source.compareRight)];
  if (!cards[0] && !cards[1]) {
    drawEvidencePlaceholder(ctx, s, area, "在左侧填写左右两张卡");
    return;
  }
  const gap = 20;
  const cardWidth = (area.w - gap) / 2;
  cards.forEach((card, index) => {
    const x = area.x + index * (cardWidth + gap);
    fillRoundRect(ctx, x, area.y, cardWidth, area.h, 32, s.e[index]);
    if (!card) return;
    const innerX = x + 26;
    const innerWidth = cardWidth - 52;
    ctx.fillStyle = s.ink;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const nameFamily = hasCjk(card.name) ? "cjk" : "sans";
    const nameSize = fitFontSize(ctx, card.name, 900, nameFamily, 46, 28, innerWidth);
    ctx.font = font(900, nameSize, nameFamily);
    ctx.fillText(card.name, innerX, area.y + 60);
    // 标签放在名称下一行：卡片右上角会被结论章压住，不放文字。
    let itemsTop = area.y + 92;
    if (card.tag) {
      ctx.save();
      ctx.globalAlpha = 0.72;
      ctx.font = font(700, 20, "mono");
      ctx.fillText(fitText(ctx, card.tag, innerWidth), innerX, area.y + 92);
      ctx.restore();
      itemsTop = area.y + 112;
    }
    const itemSize = 30;
    const lineHeight = Math.min(itemSize * 1.6, (area.y + area.h - 20 - itemsTop) / Math.max(card.items.length, 1));
    ctx.font = font(700, itemSize, "cjk");
    card.items.forEach((item, itemIndex) => {
      ctx.fillText(fitText(ctx, item, innerWidth), innerX, itemsTop + lineHeight * itemIndex + itemSize * 1.05);
    });
  });
}

function drawStar(ctx, x, y, size, fill, color) {
  const scale = size / 100;
  const path = () => {
    ctx.beginPath();
    STAR.forEach(([px, py], index) => {
      const pointX = x + px * scale;
      const pointY = y + py * scale;
      if (index) ctx.lineTo(pointX, pointY);
      else ctx.moveTo(pointX, pointY);
    });
    ctx.closePath();
  };
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineWidth = size * 0.07;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  if (fill > 0) {
    ctx.save();
    if (fill < 1) {
      ctx.beginPath();
      ctx.rect(x, y, size * fill, size);
      ctx.clip();
    }
    path();
    ctx.fill();
    ctx.restore();
  }
  path();
  ctx.stroke();
  ctx.restore();
}

function drawRating(ctx, source, s, area) {
  // Number("") 会得到 0，空输入要先单独判断，否则会画出一个 0 分。
  const score = source.ratingScore.trim() ? clamp(Number(source.ratingScore), 0, 5, NaN) : NaN;
  if (!Number.isFinite(score)) {
    drawEvidencePlaceholder(ctx, s, area, "在左侧填写 0–5 的分数");
    return;
  }
  const scoreText = Number.isInteger(score) ? String(score) : score.toFixed(1);
  const scoreSize = fitFontSize(ctx, scoreText, 900, "display", 180, 90, area.w * 0.36);
  ctx.font = font(900, scoreSize, "display");
  const scoreWidth = ctx.measureText(scoreText).width;
  ctx.font = font(800, 52, "sans");
  const outOfWidth = ctx.measureText("/ 5").width;
  const centerY = area.y + area.h / 2;
  ctx.fillStyle = s.key;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = font(900, scoreSize, "display");
  ctx.fillText(scoreText, area.x, centerY);
  ctx.font = font(800, 52, "sans");
  ctx.fillText("/ 5", area.x + scoreWidth + 10, centerY + scoreSize * 0.2);

  const columnX = area.x + scoreWidth + outOfWidth + 44;
  const columnWidth = area.x + area.w - columnX;
  const starSize = Math.min(64, (columnWidth - 32) / 5);
  const comment = splitLines(source.ratingComment).slice(0, 2);
  const noteText = source.ratingNote.trim();
  const blockHeight = starSize + (comment.length ? 22 + comment.length * 52 : 0) + (noteText ? 50 : 0);
  let y = centerY - blockHeight / 2;
  for (let index = 0; index < 5; index += 1) {
    const fill = clamp(score - index, 0, 1);
    // 半星只按 0.5 取整显示，避免出现难以辨认的细碎比例。
    const shown = fill >= 1 ? 1 : fill >= 0.5 ? 0.5 : 0;
    drawStar(ctx, columnX + index * (starSize + 8), y, starSize, shown, s.key);
  }
  y += starSize + 22;
  ctx.fillStyle = s.ink;
  ctx.textBaseline = "top";
  ctx.font = font(900, 40, "cjk");
  comment.forEach((line) => {
    ctx.fillText(fitText(ctx, line, columnWidth), columnX, y);
    y += 52;
  });
  if (noteText) {
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.font = font(500, 22, "mono");
    ctx.fillText(fitText(ctx, noteText, columnWidth), columnX, y + 18);
    ctx.restore();
  }
  ctx.textBaseline = "alphabetic";
}

function drawStatement(ctx, source, s, area) {
  const lines = splitLines(source.statementText).slice(0, 2);
  if (!lines.length) {
    drawEvidencePlaceholder(ctx, s, area, "在左侧填写大字结论");
    return;
  }
  const size = Math.min(...lines.map((line) => fitFontSize(ctx, line, 900, "cjk", 72, 40, area.w)));
  const noteText = source.statementNote.trim();
  const lineHeight = size * 1.22;
  const blockHeight = lines.length * lineHeight + (noteText ? 54 : 0);
  let y = area.y + (area.h - blockHeight) / 2;
  ctx.fillStyle = s.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = font(900, size, "cjk");
  lines.forEach((line) => {
    ctx.fillText(line, area.x, y);
    y += lineHeight;
  });
  if (noteText) {
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.font = font(500, 24, "mono");
    ctx.fillText(fitText(ctx, noteText, area.w), area.x, y + 22);
    ctx.restore();
  }
  ctx.textBaseline = "alphabetic";
}

function renderFeedPreview() {
  feedPosterContext.imageSmoothingQuality = "high";
  feedPosterContext.clearRect(0, 0, feedPosterCanvas.width, feedPosterCanvas.height);
  feedPosterContext.drawImage(canvas, 0, 0, feedPosterCanvas.width, feedPosterCanvas.height);
  feedPosterTitle.textContent = titlePlainText(state.titleText) || "未命名封面";
}

function scheduleRender({ persist = true } = {}) {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(() => {
    lastLayout = renderPoster();
    renderFeedPreview();
    syncCanvasCursor();
    if (persist) persistState();
  });
}

// ===== 控件同步 =====
function syncTitleHint() {
  const lines = splitLines(state.titleText);
  const keyword = parseTitle(state.titleText)
    .reduce((all, segments) => all.concat(segments), [])
    .find((segment) => segment.keyword);
  const parts = [`${Math.min(lines.length, 2)} 行`];
  parts.push(keyword ? `关键词：${keyword.text}` : "还没有用【】标关键词");
  if (lines.length > 2) parts.push("超过两行的部分不显示");
  titleHint.textContent = parts.join(" · ");
}

function syncEvidencePanels() {
  evidenceTypePicker.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.evidenceType === state.evidenceType));
  });
  document.querySelectorAll("[data-evidence-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.evidencePanel === state.evidenceType);
  });
}

function syncSchemes() {
  schemeList.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.scheme === state.scheme));
  });
  tonePicker.querySelectorAll("button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.tone === state.tone));
  });
  stickersToggle.checked = state.stickers;
}

function syncControls() {
  TEXT_FIELD_IDS.forEach((key) => {
    const input = document.getElementById(key);
    if (input && input.value !== state[key]) input.value = state[key];
  });
  syncTitleHint();
  syncEvidencePanels();
  syncSchemes();
  undoExampleButton.hidden = !contentBeforeExample;
}

function buildPickers() {
  EVIDENCE_TYPES.forEach((type) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.evidenceType = type.id;
    button.textContent = type.label;
    button.addEventListener("click", () => {
      state.evidenceType = type.id;
      syncEvidencePanels();
      scheduleRender();
    });
    evidenceTypePicker.append(button);
  });

  Object.entries(SCHEMES).forEach(([id, scheme]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scheme-button";
    button.dataset.scheme = id;
    const swatches = document.createElement("span");
    swatches.className = "scheme-swatches";
    swatches.setAttribute("aria-hidden", "true");
    [DEEP[scheme.bg], DEEP[scheme.band], scheme.key, scheme.stamp].forEach((color) => {
      const dot = document.createElement("i");
      dot.style.background = color;
      swatches.append(dot);
    });
    const label = document.createElement("span");
    label.textContent = scheme.label;
    button.append(swatches, label);
    button.addEventListener("click", () => {
      state.scheme = id;
      syncSchemes();
      scheduleRender();
    });
    schemeList.append(button);
  });

  EXAMPLES.forEach((example) => {
    const option = document.createElement("option");
    option.value = example.id;
    option.textContent = example.label;
    exampleSelect.append(option);
  });
}

function bindControls() {
  TEXT_FIELD_IDS.forEach((key) => {
    const input = document.getElementById(key);
    if (!input) return;
    input.addEventListener("input", () => {
      state[key] = input.value;
      if (key === "titleText") syncTitleHint();
      scheduleRender();
    });
  });

  tonePicker.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.tone = button.dataset.tone;
      syncSchemes();
      scheduleRender();
    });
  });

  stickersToggle.addEventListener("change", () => {
    state.stickers = stickersToggle.checked;
    scheduleRender();
  });

  loadExampleButton.addEventListener("click", () => {
    const example = EXAMPLES.find((item) => item.id === exampleSelect.value) || EXAMPLES[0];
    contentBeforeExample = pickContent();
    // 示例只替换文案与配色；深浅、贴纸和已选截图保持不变。
    Object.assign(state, BLANK_CONTENT, example.content);
    state = sanitizeState(state);
    syncControls();
    scheduleRender();
    showToast(`已载入示例：${example.label}`);
  });

  undoExampleButton.addEventListener("click", () => {
    if (!contentBeforeExample) return;
    Object.assign(state, contentBeforeExample);
    contentBeforeExample = null;
    syncControls();
    scheduleRender();
    showToast("已恢复载入前的文案");
  });

  document.querySelector("#resetButton").addEventListener("click", () => {
    clearScreenshot({ notify: false });
    contentBeforeExample = null;
    state = defaultState();
    syncControls();
    scheduleRender();
    showToast("已恢复示例内容");
  });

  document.querySelector("#exportButton").addEventListener("click", exportPoster);
  document.querySelector("#postNoteButton").addEventListener("click", postNoteWithPoster);
}

// ===== 截图 =====
function clearScreenshot({ notify = true } = {}) {
  if (uploadedPhotoUrl) URL.revokeObjectURL(uploadedPhotoUrl);
  uploadedPhoto = null;
  uploadedPhotoUrl = "";
  screenshotStatus.textContent = "未选择截图，预览显示占位框";
  removeScreenshotButton.hidden = true;
  scheduleRender({ persist: false });
  if (notify) showToast("已移除截图");
}

function bindScreenshot() {
  screenshotInput.addEventListener("change", () => {
    const file = screenshotInput.files && screenshotInput.files[0];
    screenshotInput.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES) {
      showToast("请选择 20 MB 以内的图片");
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (uploadedPhotoUrl) URL.revokeObjectURL(uploadedPhotoUrl);
      uploadedPhoto = image;
      uploadedPhotoUrl = url;
      state.photoFocusX = 50;
      state.photoFocusY = 50;
      state.evidenceType = "screenshot";
      screenshotStatus.textContent = `已选择：${file.name}`;
      removeScreenshotButton.hidden = false;
      syncEvidencePanels();
      scheduleRender();
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      showToast("这张图片无法读取，请换一张");
    };
    image.src = url;
  });

  removeScreenshotButton.addEventListener("click", () => clearScreenshot());
}

function toPosterPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * W) / rect.width,
    y: ((event.clientY - rect.top) * H) / rect.height,
  };
}

function screenshotDraggable() {
  return state.evidenceType === "screenshot" && uploadedPhoto && lastLayout && lastLayout.evidenceArea;
}

function insideArea(point, area) {
  return point.x >= area.x && point.x <= area.x + area.w && point.y >= area.y && point.y <= area.y + area.h;
}

function syncCanvasCursor() {
  canvas.dataset.draggable = String(Boolean(screenshotDraggable()));
}

// 在预览上拖动截图：把屏幕位移换算成海报像素，再按溢出量折算为 0–100 的取景位置。
function bindScreenshotDrag() {
  canvas.addEventListener("pointerdown", (event) => {
    if (!screenshotDraggable()) return;
    const point = toPosterPoint(event);
    const area = lastLayout.evidenceArea;
    if (!insideArea(point, area)) return;
    const scale = Math.max(area.w / uploadedPhoto.naturalWidth, area.h / uploadedPhoto.naturalHeight);
    photoDrag = {
      pointerId: event.pointerId,
      start: point,
      focusX: state.photoFocusX,
      focusY: state.photoFocusY,
      overflowX: uploadedPhoto.naturalWidth * scale - area.w,
      overflowY: uploadedPhoto.naturalHeight * scale - area.h,
    };
    // 部分 WebView 对触摸指针调用 setPointerCapture 会抛异常；捕获失败只影响拖出画布后的跟随，不影响取景。
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      // 忽略，继续拖动。
    }
    canvas.dataset.dragging = "true";
    event.preventDefault();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!photoDrag || event.pointerId !== photoDrag.pointerId) return;
    const point = toPosterPoint(event);
    const dx = point.x - photoDrag.start.x;
    const dy = point.y - photoDrag.start.y;
    if (photoDrag.overflowX > 0.5) state.photoFocusX = clamp(photoDrag.focusX - (dx / photoDrag.overflowX) * 100, 0, 100);
    if (photoDrag.overflowY > 0.5) state.photoFocusY = clamp(photoDrag.focusY - (dy / photoDrag.overflowY) * 100, 0, 100);
    scheduleRender({ persist: false });
  });

  const finish = (event) => {
    if (!photoDrag || event.pointerId !== photoDrag.pointerId) return;
    photoDrag = null;
    canvas.dataset.dragging = "false";
    persistState();
  };
  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", finish);
}

// ===== 预览切换与主页对比 =====
function bindPreviewModes() {
  const buttons = document.querySelectorAll("[data-preview-mode]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
      });
      document.querySelectorAll("[data-preview-panel]").forEach((panel) => {
        panel.hidden = panel.dataset.previewPanel !== button.dataset.previewMode;
      });
      renderFeedPreview();
    });
  });
}

function coverCrop(sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = targetWidth / scale;
  const height = targetHeight / scale;
  return { x: (sourceWidth - width) / 2, y: (sourceHeight - height) / 2, width, height };
}

function createThumbnail(drawSource, sourceWidth, sourceHeight) {
  const thumbnail = document.createElement("canvas");
  thumbnail.width = 360;
  thumbnail.height = 480;
  const thumbnailContext = thumbnail.getContext("2d");
  thumbnailContext.imageSmoothingQuality = "high";
  const crop = coverCrop(sourceWidth, sourceHeight, 360, 480);
  thumbnailContext.drawImage(drawSource, crop.x, crop.y, crop.width, crop.height, 0, 0, 360, 480);
  return thumbnail.toDataURL("image/jpeg", 0.86);
}

function createHistoryThumbnail(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        id: `upload-${file.name}-${file.lastModified || Date.now()}`,
        source: "upload",
        name: file.name.replace(/\.[^.]+$/, "") || "本地封面",
        dataUrl: createThumbnail(image, image.naturalWidth, image.naturalHeight),
      });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`无法读取 ${file.name}`));
    };
    image.src = url;
  });
}

// 用当前文案依次渲染 6 套配色（封面深一档），判断哪几套放在主页里更协调。
function createSchemeCovers() {
  const offscreen = document.createElement("canvas");
  offscreen.width = W;
  offscreen.height = H;
  const offscreenContext = offscreen.getContext("2d");
  return Object.entries(SCHEMES).map(([id, scheme]) => {
    renderPoster(offscreenContext, Object.assign({}, state, { scheme: id, tone: "cover" }), uploadedPhoto);
    return {
      id: `scheme-${id}`,
      source: "preset",
      name: `配色 · ${scheme.label}`,
      dataUrl: createThumbnail(offscreen, W, H),
    };
  });
}

function mergeHistoryCoverGroup(source, covers) {
  const others = historyCovers.filter((cover) => cover.source !== source);
  historyCovers = [...others, ...covers].slice(-MAX_HISTORY_COVERS);
  renderHistoryCovers();
}

function renderHistoryCovers() {
  historyFeedGrid.querySelectorAll("[data-history-cover]").forEach((card) => card.remove());
  const labels = { published: "已发布", preset: "配色", upload: "本地" };
  historyCovers.forEach((cover) => {
    const card = document.createElement("article");
    card.className = "feed-card";
    card.dataset.historyCover = "";
    const badge = document.createElement("span");
    badge.className = "feed-source-badge";
    badge.textContent = labels[cover.source] || "对比";
    const image = document.createElement("img");
    image.src = cover.dataUrl;
    image.alt = `${cover.name} 封面`;
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
    card.append(badge, image, title, meta);
    historyFeedGrid.append(card);
  });
  historyEmptyState.hidden = historyCovers.length > 0;
  clearHistoryButton.hidden = historyCovers.length === 0;
  if (!historyCovers.length) {
    historyStatus.textContent = "可加载对比封面、6 套配色或本地图片，不会保存或上传";
    return;
  }
  const counts = historyCovers.reduce((summary, cover) => {
    summary[cover.source] = (summary[cover.source] || 0) + 1;
    return summary;
  }, {});
  const parts = Object.entries(counts).map(([source, count]) => `${labels[source] || source} ${count}`);
  historyStatus.textContent = `对比中：${parts.join(" · ")}，仅限当前页面`;
}

function bindHistoryPreview() {
  loadPublishedCoversButton.addEventListener("click", () => {
    if (!PUBLISHED_COVER_SAMPLES.length) {
      showToast("没有找到已发布封面快照");
      return;
    }
    mergeHistoryCoverGroup("published", PUBLISHED_COVER_SAMPLES.map((cover) => Object.assign({}, cover)));
    showToast(`已加载 ${PUBLISHED_COVER_SAMPLES.length} 张已发布封面`);
  });

  loadSchemeCoversButton.addEventListener("click", () => {
    mergeHistoryCoverGroup("preset", createSchemeCovers());
    showToast("已用当前文案生成 6 套配色");
  });

  historyCoverInput.addEventListener("change", async () => {
    const files = Array.from(historyCoverInput.files || [])
      .filter((file) => ["image/png", "image/jpeg", "image/webp"].includes(file.type) && file.size <= MAX_PHOTO_BYTES)
      .slice(0, MAX_HISTORY_COVERS);
    historyCoverInput.value = "";
    if (!files.length) {
      showToast("请选择 20 MB 以内的 PNG、JPG 或 WebP");
      return;
    }
    // Promise.allSettled 晚于 Chrome 61，单张失败改为返回 null 再过滤。
    const results = await Promise.all(files.map((file) => createHistoryThumbnail(file).catch(() => null)));
    const covers = results.filter(Boolean);
    mergeHistoryCoverGroup("upload", covers);
    showToast(`已加入 ${covers.length} 张本地封面`);
  });

  clearHistoryButton.addEventListener("click", () => {
    historyCovers = [];
    renderHistoryCovers();
    showToast("已清空对比封面");
  });
}

// ===== 导出与提示 =====
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function exportFileName() {
  const slug =
    state.mainWord
      .trim()
      .replace(/[^\w一-龥-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "cover";
  return `xhs-field-note-${slug}-${state.tone === "cover" ? "cover" : "inner"}.png`;
}

// 导出方式由适配层决定：网页版导出 PNG 文件，小工具保存到系统相册。
function exportPoster() {
  lastLayout = renderPoster();
  if (!PLATFORM.exportImage) {
    showToast("当前环境不支持导出");
    return;
  }
  PLATFORM.exportImage(canvas, exportFileName())
    .then((message) => showToast(message))
    .catch((error) => showToast((error && error.message) || "导出失败，请重试"));
}

// 小工具专用：带着当前封面打开小红书发笔记页面，标题预填为封面标题（最长 20 字）。
function postNoteWithPoster() {
  lastLayout = renderPoster();
  PLATFORM.postNote(canvas, titlePlainText(state.titleText).slice(0, 20))
    .then((message) => {
      if (message) showToast(message);
    })
    .catch((error) => showToast((error && error.message) || "没能打开发笔记页面，请重试"));
}

function applyPlatformUi() {
  const exportButton = document.querySelector("#exportButton");
  if (PLATFORM.exportLabel) exportButton.textContent = PLATFORM.exportLabel;
  const postNoteButton = document.querySelector("#postNoteButton");
  postNoteButton.hidden = !PLATFORM.postNote;
  loadPublishedCoversButton.hidden = !PUBLISHED_COVER_SAMPLES.length;
  if (PLATFORM.exampleHint) document.querySelector("#exampleHint").textContent = PLATFORM.exampleHint;
}

function initialize() {
  applyPlatformUi();
  buildPickers();
  syncControls();
  bindControls();
  bindScreenshot();
  bindScreenshotDrag();
  bindPreviewModes();
  bindHistoryPreview();
  renderHistoryCovers();
  // 首帧同步绘制：标签页在后台打开时 requestAnimationFrame 会暂停，避免预览一直空白。
  lastLayout = renderPoster();
  renderFeedPreview();
  syncCanvasCursor();
  // 系统字体通常已就绪；个别浏览器首次测量时字体还没准备好，就绪后补画一帧。
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => scheduleRender({ persist: false }));
  if (PLATFORM.loadStateAsync) {
    PLATFORM.loadStateAsync(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        state = mergeSavedState(JSON.parse(raw));
        syncControls();
        scheduleRender({ persist: false });
      })
      .catch(() => {
        // 读不到时保留首帧状态，不打断编辑。
      });
  }
}

initialize();
