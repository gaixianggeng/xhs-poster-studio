#!/usr/bin/env bash
# 生成小红书小工具上传包：dist/xhs-field-note-minitool.zip。
# 小工具离线运行、不联网：用 platform-minitool.js 替换网页版适配层，去掉 ?v= 版本参数，
# 只打包运行所需的 4 个文件，index.html 位于 zip 根目录。
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/dist/minitool"
zip_path="$root/dist/xhs-field-note-minitool.zip"

rm -rf "$out" "$zip_path"
mkdir -p "$out"

python3 - "$root/index.html" "$out/index.html" <<'PY'
import re
import sys

source, target = sys.argv[1], sys.argv[2]
html = open(source, encoding="utf-8").read()
pattern = re.compile(r"\s*<!-- platform:web.*?<!-- /platform:web -->", re.S)
if len(pattern.findall(html)) != 1:
    sys.exit("index.html 中没有找到唯一的 platform:web 标记段")
html = pattern.sub('\n    <script src="./platform-minitool.js" defer></script>', html)
# 离线包内按文件名加载，查询参数可能导致找不到文件。
html = re.sub(r'(\.(?:css|js))\?v=[^"]*"', r'\1"', html)
if "http://" in html or "https://" in html or "published-covers" in html:
    sys.exit("小工具 index.html 仍包含外部地址或网页版专用脚本")
open(target, "w", encoding="utf-8").write(html)
PY

cp "$root/styles.css" "$root/app.js" "$root/platform-minitool.js" "$out/"

(cd "$out" && zip -q -r -X "$zip_path" . -x '*.DS_Store')
echo "$zip_path"
