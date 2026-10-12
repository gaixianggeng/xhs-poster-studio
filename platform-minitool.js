"use strict";

// 小红书小工具运行环境：离线运行、不联网，只调用容器注入的 window.xhs.miniTool。
// 规范来源：小工具在线文档与 minitool-zip-builder 1.7.0（2026-10-12 读取）。
// 必须在 app.js 之前加载；导出改为保存到系统相册。
(function () {
  // 容器 Storage API 需要客户端 9.46+；buildVersion 末三位是编译序号，比较时忽略。
  const STORAGE_MIN_CLIENT_VERSION = 9460;

  function getMiniTool() {
    return window.xhs && window.xhs.miniTool ? window.xhs.miniTool : null;
  }

  function hasApi(name) {
    const miniTool = getMiniTool();
    return Boolean(miniTool && typeof miniTool[name] === "function");
  }

  function readBuildVersion(launchOptions) {
    const miniToolEnv = launchOptions && launchOptions.miniToolEnv;
    return Number(miniToolEnv && miniToolEnv.buildVersion) || 0;
  }

  async function getBuildVersion() {
    const syncVersion = readBuildVersion(window.xhs && window.xhs.launchOptions);
    if (syncVersion) return syncVersion;
    if (!hasApi("getLaunchOptions")) return 0;
    try {
      return readBuildVersion(await getMiniTool().getLaunchOptions());
    } catch (error) {
      return 0;
    }
  }

  let storageSupport = null;
  function canUseStorageApi() {
    if (!storageSupport) {
      storageSupport = getBuildVersion().then(
        (version) =>
          Math.floor(version / 1000) >= STORAGE_MIN_CLIENT_VERSION && hasApi("getStorage") && hasApi("setStorage"),
      );
    }
    return storageSupport;
  }

  // 浏览器存储只作低版本兜底：容器不保证可用和持久，读写失败都要容忍。
  function readLocal(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeLocal(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // 保存失败时继续编辑，下次打开不保留。
    }
  }

  function friendlyError(error, fallback) {
    const detail = error && (error.errMsg || error.message);
    return new Error(detail ? `${fallback}（${detail}）` : fallback);
  }

  // 大图先写成临时文件再交给相册和发笔记接口，避免超长 base64 上行。
  async function canvasToFilePath(canvas) {
    const dataUrl = canvas.toDataURL("image/png");
    if (!hasApi("writeTempFile")) return dataUrl;
    const result = await getMiniTool().writeTempFile({ data: dataUrl });
    return result && result.filePath ? result.filePath : dataUrl;
  }

  // 中性示例：不出现具体品牌或平台名，内容只用来演示 6 种证据类型的版式。
  const EXAMPLES = Object.freeze([
    {
      id: "rating",
      label: "评分 · 通勤耳机",
      content: {
        seriesText: "使用记录 · 示例",
        mainWord: "耳机",
        titleText: "通勤用了一个月\n我给【4 星】",
        pillsText: "每天 2 小时\n地铁通勤\n降噪",
        stampText: "还不错",
        evidenceLabel: "证据 · 个人评分",
        evidenceType: "rating",
        ratingScore: "4",
        ratingComment: "降噪够用\n续航比预期短",
        ratingNote: "满分 5 星 · 个人体验",
        scheme: "rose",
      },
    },
    {
      id: "steps",
      label: "步骤 · 数据透视表",
      content: {
        seriesText: "上手教程 · 示例",
        mainWord: "表格",
        titleText: "数据透视表\n【3 步】做出来",
        pillsText: "新手向\n电脑端\n10 分钟",
        stampText: "3 步搞定",
        evidenceLabel: "证据 · 操作步骤",
        evidenceType: "steps",
        stepsText: "选中数据区域｜确认首行是表头\n插入透视表｜放在新的工作表里\n拖动字段｜行放类别，值放金额",
        scheme: "mint",
      },
    },
    {
      id: "compare",
      label: "对比 · 两种记账方式",
      content: {
        seriesText: "对比 · 示例",
        mainWord: "VS",
        titleText: "纸质手账和记账软件\n各有【长处】",
        pillsText: "都用了半年\n每天记账",
        stampText: "看习惯",
        evidenceLabel: "证据 · 两种方式",
        evidenceType: "compare",
        compareLeft: "纸质手账｜手写\n记得更用心\n回顾有仪式感\n不方便统计",
        compareRight: "记账软件｜自动\n统计很方便\n随手就能记\n容易变成流水账",
        evidenceNote: "按自己的习惯选就好",
        scheme: "lime",
      },
    },
    {
      id: "rows",
      label: "分层 · 笔记结构",
      content: {
        seriesText: "拆解 · 示例",
        mainWord: "4",
        mainSuffix: "层结构",
        titleText: "一篇图文笔记\n拆成【4 层】",
        pillsText: "标题\n封面\n正文",
        stampText: "照着写",
        evidenceLabel: "证据 · 笔记结构",
        evidenceType: "rows",
        rowsText: "标题｜一句话说清收获\n封面｜主词加一个关键词\n正文｜过程、结果和边界\n评论区｜补充信息，回答问题",
        scheme: "lavender",
      },
    },
    {
      id: "statement",
      label: "大字 · 早起打卡",
      content: {
        seriesText: "短状态 · 示例",
        mainWord: "30",
        mainSuffix: "天",
        titleText: "坚持早起\n【第 30 天】了",
        pillsText: "早上 6 点半\n每天打卡",
        stampText: "还在坚持",
        evidenceLabel: "证据 · 当前状态",
        evidenceType: "statement",
        statementText: "比以前早睡了一小时",
        statementNote: "记录于第 30 天",
        scheme: "apricot",
      },
    },
    {
      id: "screenshot",
      label: "截图 · 放自己的图",
      content: {
        seriesText: "截图证据 · 示例",
        mainWord: "截图",
        titleText: "放一张截图\n让它当【证据】",
        pillsText: "选择截图\n拖动取景",
        stampText: "有图有真相",
        evidenceLabel: "证据 · 你的截图",
        evidenceType: "screenshot",
        scheme: "sky",
      },
    },
  ]);

  window.PosterPlatform = {
    id: "minitool",
    examples: EXAMPLES,
    exampleHint: "6 张示例对应 6 种证据，载入会整体替换当前文案，可以撤回。",
    defaultFooter: "亲手测过才写｜我的实测笔记",
    publishedCovers: [],
    exportLabel: "保存到相册",
    readStateSync: readLocal,
    async loadStateAsync(key) {
      if (!(await canUseStorageApi())) return null;
      const result = await getMiniTool().getStorage({ key });
      return result && typeof result.data === "string" ? result.data : null;
    },
    saveState(key, value) {
      canUseStorageApi()
        .then((supported) => {
          if (supported) return getMiniTool().setStorage({ key, data: value });
          writeLocal(key, value);
          return null;
        })
        .catch(() => writeLocal(key, value));
    },
    async exportImage(canvas) {
      if (!hasApi("saveImageToPhotosAlbum")) throw new Error("请在小红书 App 里打开后保存");
      try {
        const filePath = await canvasToFilePath(canvas);
        await getMiniTool().saveImageToPhotosAlbum({ filePath });
      } catch (error) {
        throw friendlyError(error, "保存失败，请检查相册权限后重试");
      }
      return "已保存到相册";
    },
    async postNote(canvas, title) {
      if (!hasApi("postNote")) throw new Error("请在小红书 App 里打开后发布");
      try {
        const filePath = await canvasToFilePath(canvas);
        const options = {
          pageType: "photo_publish",
          mediaInfo: { image_resources: [{ url: filePath }] },
        };
        if (title) options.title = title;
        await getMiniTool().postNote(options);
      } catch (error) {
        throw friendlyError(error, "没能打开发笔记页面，请重试");
      }
      return "";
    },
  };
})();
