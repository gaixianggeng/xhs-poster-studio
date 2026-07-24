# 本地字体说明

## 目标

为海报提供成年人日常书写感，不使用书法笔锋、卡通手账字形，也不仿制某位具体作者的个人笔迹。

## 方案

- 字体：Yozai Medium
- 版本：v0.868
- 上游项目：<https://github.com/lxgw/yozai-font>
- 字体文件：<https://github.com/lxgw/yozai-font/releases/download/v0.868/Yozai-Medium.ttf>
- 许可：SIL Open Font License 1.1，完整文本见 `Yozai-OFL.txt`
- SHA-256：`05f50f252b45197d0d6148a4abc3e37c7cd4cfdf03c955b57c25d53d924f835f`

项目直接分发未修改的上游字体文件。网页仅在用户选择“自然手写”后加载字体，Canvas 导出前会等待字体就绪。

## 风险与优化

字体文件约 15 MB，首次切换需要等待下载。当前采用按需加载控制首屏成本；如果线上带宽成为问题，再评估经过许可约束检查后的字符子集化。
