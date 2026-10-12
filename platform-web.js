"use strict";

// 网页版运行环境：示例取自账号已发布或已定时的笔记，状态存浏览器 localStorage，导出为下载 PNG。
// 必须在 app.js 之前加载；已发布封面快照来自 assets/published-covers.js。
(function () {
  // 示例全部取自已发布或已定时的笔记，便于直接对照真实效果。
  const EXAMPLES = Object.freeze([
    {
      id: "dot",
      label: "评分 · dot 用了两天",
      content: {
        seriesText: "dot 使用记录 · 2026.10.11",
        mainWord: "dot",
        titleText: "用了两天\n我给【3 星半】",
        pillsText: "重度使用 2 天\nCodex 接续\n多设备",
        stampText: "还挺好用",
        evidenceLabel: "证据 · 个人评分",
        evidenceType: "rating",
        ratingScore: "3.5",
        ratingComment: "还挺好用\n有些功能没用顺",
        ratingNote: "满分 5 星 · 两天真实使用后打分",
        scheme: "rose",
      },
    },
    {
      id: "ipad",
      label: "步骤 · iPad 接着用 Codex",
      content: {
        seriesText: "上手教程 · 2026.10.07",
        mainWord: "iPad",
        titleText: "接着用 Codex\n【我这样连】",
        pillsText: "Mac 运行 Codex\niPad / iPhone 接续\nMimi Remote",
        stampText: "4 步连上",
        evidenceLabel: "证据 · 连接顺序",
        evidenceType: "steps",
        stepsText:
          "电脑端先就绪｜Mac 上 Codex CLI 能运行，Mimi Remote Mac 服务就绪\n移动端配对｜按电脑端的配对提示完成连接\n找到已有会话｜从「会话」选任务，或从「工作区」按项目找\n先试一句，再继续｜确认能收到回复，再补充下一步要求",
        scheme: "mint",
      },
    },
    {
      id: "luna",
      label: "对比 · Sol + Luna 分工",
      content: {
        seriesText: "模型分工 · 2026.08.03",
        mainWord: "Luna",
        titleText: "降价 80% 后\n我这样【分工】",
        pillsText: "主 Agent · Sol\n执行 · Luna Max\n路由 auto",
        stampText: "别硬碰",
        evidenceLabel: "证据 · 实际分工",
        evidenceType: "compare",
        compareLeft: "Sol｜主线程\n理解需求\n拆任务、做取舍\n处理风险\n最终验收",
        compareRight: "Luna｜执行位\n代码搜索\n单点测试\n批量检查\n范围明确的 review",
        evidenceNote: "Luna 做完 → Sol 必须自己验证",
        scheme: "lime",
      },
    },
    {
      id: "v2",
      label: "对比 · 多代理 V2",
      content: {
        seriesText: "版本解读 · 2026.08.17",
        mainWord: "V2",
        titleText: "Codex 多代理\n看得我【一头雾水】",
        pillsText: "5 组 QA\n原作者答疑\n可委托 Luna",
        stampText: "5 问讲清",
        evidenceLabel: "证据 · 两级代理",
        evidenceType: "compare",
        compareLeft: "对等协作代理｜\n互发消息\n递归委托",
        compareRight: "叶子子代理｜含 Luna\n可被委托\n不跨代理协作",
        evidenceNote: "不会自动按任务选模型，要在提示里写明",
        scheme: "sky",
      },
    },
    {
      id: "workbuddy",
      label: "分层 · WorkBuddy 拆解",
      content: {
        seriesText: "拆解 · 2026.07.28",
        mainWord: "393",
        mainSuffix: "个专家",
        titleText: "我用 Codex 拆了\n【WorkBuddy 专家】",
        pillsText: "只读检查\n14 类专家\n拆成 4 层",
        stampText: "顶好",
        evidenceLabel: "证据 · 专家结构",
        evidenceType: "rows",
        rowsText:
          "plugin.json｜专家卡片、名称\nagents/*.md｜角色、方法和流程\nskills/*/SKILL.md｜领域方法规则\n脚本与工具｜登录、搜索、写文件",
        scheme: "lavender",
      },
    },
    {
      id: "quota",
      label: "大字 · 额度没重置",
      content: {
        seriesText: "短状态 · 2026.07.18",
        mainWord: "额度",
        titleText: "Codex 快两天\n【没重置】了",
        pillsText: "短状态记录\nCodex 额度",
        stampText: "还在等",
        evidenceLabel: "证据 · 当前状态",
        evidenceType: "statement",
        statementText: "额度还没重置",
        statementNote: "记录于 2026.07.18 · 快两天",
        scheme: "apricot",
      },
    },
  ]);

  window.PosterPlatform = {
    id: "web",
    examples: EXAMPLES,
    exampleHint: "6 张示例覆盖评分、步骤、对比、分层、大字 5 种证据；截图类型直接上传自己的图。载入会整体替换当前文案，可以撤回。",
    defaultFooter: "亲手测过才写｜CODEX · AGENT 实战",
    publishedCovers: window.XHS_PUBLISHED_COVER_SAMPLES || [],
    exportLabel: "导出 PNG",
    readStateSync(key) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    saveState(key, value) {
      localStorage.setItem(key, value);
    },
    exportImage(canvas, fileName) {
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("导出失败，请换一个浏览器重试"));
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          resolve(`已导出 ${canvas.width} × ${canvas.height} PNG`);
        }, "image/png");
      });
    },
  };
})();
