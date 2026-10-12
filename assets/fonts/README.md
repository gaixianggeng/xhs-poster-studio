# 本地字体说明

## 目标

为海报提供一种明确但克制的成年人日常书写感。字体可随项目分发，不仿制某位具体作者的个人笔迹。

## 方案

### Yozai Medium

- 字体：Yozai Medium
- 版本：v0.868
- 上游项目：<https://github.com/lxgw/yozai-font>
- 字体文件：<https://github.com/lxgw/yozai-font/releases/download/v0.868/Yozai-Medium.ttf>
- 许可：SIL Open Font License 1.1，完整文本见 `Yozai-OFL.txt`
- SHA-256：`05f50f252b45197d0d6148a4abc3e37c7cd4cfdf03c955b57c25d53d924f835f`

## 实现

项目直接分发未修改的上游字体文件。Yozai 用于“自然手写”，Canvas 在字体加载完成后重新计算排版，PNG 导出前也会等待当前标题与正文字体就绪。

## 风险与优化

Yozai 文件约 15 MB。字体按钮需要展示真实字形，浏览器可能在进入页面时预加载对应文件；如果线上带宽成为问题，再评估移除按钮内的真实字体预览或在许可约束下做字符子集化。字体加载失败时会回退系统字体，导出尺寸和内容仍可用，但字宽可能略有变化。
