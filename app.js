const STORAGE_KEY = "xhs-poster-studio:v1";
const MIN_CANVAS_SIZE = 320;
const MAX_CANVAS_SIZE = 4096;

const defaults = Object.freeze({
  topLeft: "",
  topRight: "#05",
  upperText: "和 Codex 额度重置赛跑\n50+ 次迭代实录",
  titleText: "Codex 远程\n又快又稳？",
  subtitleText: "不止 iPad，我的 iOS 端远程解决方案",
  footerText: "BUILD · USE · IMPROVE · REPEAT",
  footerAlign: "center",
  canvasWidth: 1080,
  canvasHeight: 1440,
  backgroundColor: "#021F22",
  cardColor: "#F65219",
  textColor: "#061819",
  fontFamily: "system",
  mainSize: 172,
  upperSize: 42,
  subtitleSize: 40,
  groupGap: 86,
  verticalOffset: 0,
  cardWidth: 78,
  cardHeight: 88,
  cornerRadius: 64,
  sidePadding: 58,
});

const themes = {
  codex: {
    backgroundColor: "#021F22",
    cardColor: "#F65219",
    textColor: "#061819",
  },
  blue: {
    backgroundColor: "#101C42",
    cardColor: "#A9C5FF",
    textColor: "#101C42",
  },
  lime: {
    backgroundColor: "#151B16",
    cardColor: "#C8FF62",
    textColor: "#151B16",
  },
  paper: {
    backgroundColor: "#E8E3D6",
    cardColor: "#FFFAF0",
    textColor: "#1F2625",
  },
};

const fontStacks = {
  system:
    '"Helvetica Neue", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", Arial, sans-serif',
  grotesk: 'Arial, "Helvetica Neue", "PingFang SC", "Noto Sans CJK SC", sans-serif',
  rounded:
    '"Arial Rounded MT Bold", "SF Pro Rounded", "PingFang SC", "Noto Sans CJK SC", sans-serif',
};

const canvas = document.querySelector("#posterCanvas");
const context = canvas.getContext("2d");
const feedPosterCanvas = document.querySelector("#feedPosterCanvas");
const feedPosterContext = feedPosterCanvas.getContext("2d");
const feedPosterTitle = document.querySelector("#feedPosterTitle");
const ratioBadge = document.querySelector("#ratioBadge");
const toast = document.querySelector("#toast");
const downloadButton = document.querySelector("#downloadButton");
const resetButton = document.querySelector("#resetButton");

let state = loadState();
let renderFrame = 0;
let toastTimer = 0;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...(saved && typeof saved === "object" ? saved : {}) };
  } catch {
    return { ...defaults };
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

function clampCanvasSize(value, fallback) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.min(MAX_CANVAS_SIZE, Math.max(MIN_CANVAS_SIZE, number));
}

function getCanvasDimensions() {
  return {
    width: clampCanvasSize(state.canvasWidth, defaults.canvasWidth),
    height: clampCanvasSize(state.canvasHeight, defaults.canvasHeight),
  };
}

function greatestCommonDivisor(first, second) {
  let a = Math.abs(first);
  let b = Math.abs(second);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function getRatioLabel(width, height) {
  const divisor = greatestCommonDivisor(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function fontString(weight, size, family = state.fontFamily) {
  return `${weight} ${size}px ${fontStacks[family] || fontStacks.system}`;
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

function fitScale(lines, sizes, weight, maxWidth, minimumScale = 0.54) {
  if (!lines.length) return 1;

  let scale = 1;
  lines.forEach((line, index) => {
    const text = line || " ";
    const size = sizes[Math.min(index, sizes.length - 1)];
    context.font = fontString(weight, size);
    const measured = context.measureText(text).width;
    if (measured > maxWidth) scale = Math.min(scale, maxWidth / measured);
  });
  return Math.max(minimumScale, scale);
}

function createBlock(lines, desiredSizes, options) {
  if (!lines.length) {
    return { lines: [], sizes: [], height: 0, lineGap: 0, options };
  }

  const scale = fitScale(lines, desiredSizes, options.weight, options.maxWidth, options.minScale);
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
    context.font = fontString(block.options.weight, size);
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

  let size = 42 * layoutScale;
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

function renderPoster() {
  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();
  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  // 版式参数以 1080 × 1440 为设计基准，切换尺寸时等比缩放，避免方图中文字溢出。
  const layoutScale = Math.min(canvasWidth / 1080, canvasHeight / 1440);
  const cardWidth = canvasWidth * (Number(state.cardWidth) / 100);
  const cardHeight = canvasHeight * (Number(state.cardHeight) / 100);
  const cardX = (canvasWidth - cardWidth) / 2;
  const cardY = (canvasHeight - cardHeight) / 2;
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
    Number(state.cornerRadius) * layoutScale,
  );
  context.fill();

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

  const upperSize = Number(state.upperSize) * layoutScale;
  const mainSize = Number(state.mainSize) * layoutScale;
  const subtitleSize = Number(state.subtitleSize) * layoutScale;

  const upperBlock = createBlock(
    upperLines,
    upperLines.map(() => upperSize),
    {
      weight: 760,
      maxWidth: maxContentWidth,
      minScale: 0.62,
      lineGap: upperSize * 0.25,
    },
  );

  const mainSizes = titleLines.map((_, index) => (index === 0 ? mainSize * 0.78 : mainSize));
  const mainBlock = createBlock(titleLines, mainSizes, {
    weight: 900,
    maxWidth: maxContentWidth,
    minScale: 0.54,
    lineGap: mainSize * 0.18,
  });

  const subtitleBlock = createBlock(
    subtitleLines,
    subtitleLines.map(() => subtitleSize),
    {
      weight: 760,
      maxWidth: maxContentWidth,
      minScale: 0.58,
      lineGap: subtitleSize * 0.28,
    },
  );

  let activeBlocks = [upperBlock, mainBlock, subtitleBlock].filter((block) => block.height > 0);
  let groupGap = Number(state.groupGap) * layoutScale;
  let groupHeight =
    activeBlocks.reduce((sum, block) => sum + block.height, 0) +
    Math.max(0, activeBlocks.length - 1) * groupGap;

  const safeContentTop = cardY + 158 * layoutScale;
  const safeContentBottom = cardY + cardHeight - 90 * layoutScale;
  const availableContentHeight = Math.max(1, safeContentBottom - safeContentTop);
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

  const groupCenter =
    cardY + cardHeight * 0.485 + Number(state.verticalOffset) * layoutScale;
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
  ratioBadge.textContent = `${canvasWidth} × ${canvasHeight} · ${getRatioLabel(
    canvasWidth,
    canvasHeight,
  )}`;
}

function scheduleRender({ persist = true } = {}) {
  if (persist) persistState();
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(renderPoster);
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
    cardWidth: "%",
    cardHeight: "%",
    cornerRadius: " px",
    sidePadding: " px",
  };

  document.querySelectorAll("[data-output]").forEach((output) => {
    const key = output.dataset.output;
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

function syncActiveSizePreset() {
  const { width, height } = getCanvasDimensions();
  document.querySelectorAll(".size-preset").forEach((button) => {
    const isActive =
      Number(button.dataset.width) === width && Number(button.dataset.height) === height;
    button.classList.toggle("is-active", isActive);
  });
}

function syncControls() {
  [
    "topLeft",
    "topRight",
    "upperText",
    "titleText",
    "subtitleText",
    "footerText",
    "footerAlign",
    "canvasWidth",
    "canvasHeight",
    "fontFamily",
    "mainSize",
    "upperSize",
    "subtitleSize",
    "groupGap",
    "verticalOffset",
    "cardWidth",
    "cardHeight",
    "cornerRadius",
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
  syncActiveSizePreset();
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
    "mainSize",
    "upperSize",
    "subtitleSize",
    "groupGap",
    "verticalOffset",
    "cardWidth",
    "cardHeight",
    "cornerRadius",
    "sidePadding",
  ];

  keys.forEach((key) => {
    const element = document.getElementById(key);
    element.addEventListener("input", () => {
      state[key] = element.type === "range" ? Number(element.value) : element.value;
      updateRangeOutputs();
      scheduleRender();
    });
  });
}

function bindCanvasSizeControls() {
  ["canvasWidth", "canvasHeight"].forEach((key) => {
    const element = document.getElementById(key);
    element.addEventListener("input", () => {
      const value = Number(element.value);
      if (!Number.isFinite(value) || value < MIN_CANVAS_SIZE || value > MAX_CANVAS_SIZE) return;
      state[key] = Math.round(value);
      syncActiveSizePreset();
      scheduleRender();
    });
    element.addEventListener("blur", () => {
      state[key] = clampCanvasSize(element.value, defaults[key]);
      element.value = state[key];
      syncActiveSizePreset();
      scheduleRender();
    });
  });

  document.querySelectorAll(".size-preset").forEach((button) => {
    button.addEventListener("click", () => {
      state.canvasWidth = Number(button.dataset.width);
      state.canvasHeight = Number(button.dataset.height);
      setControlValue("canvasWidth", state.canvasWidth);
      setControlValue("canvasHeight", state.canvasHeight);
      syncActiveSizePreset();
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
      document.querySelectorAll(".theme-chip").forEach((chip) => chip.classList.remove("is-active"));
      button.classList.add("is-active");
      syncControls();
      scheduleRender();
    });
  });
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function downloadPoster() {
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
  state = { ...defaults };
  document.querySelectorAll(".theme-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.theme === "codex");
  });
  syncControls();
  scheduleRender();
  showToast("已恢复示例内容");
}

function initialize() {
  bindStandardControls();
  bindCanvasSizeControls();
  bindColorControls();
  bindThemes();
  bindPreviewModes();
  downloadButton.addEventListener("click", downloadPoster);
  resetButton.addEventListener("click", resetPoster);
  syncControls();
  renderPoster();
}

initialize();
