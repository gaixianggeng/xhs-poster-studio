# 小红书封面生成器：部署与运维

## 1. 目标

- 维持纯静态、无后端、低维护成本的部署方式。
- 保证“编辑 → 预览 → 导出 PNG”的页面闭环可用。
- 正式入口为腾讯云上的 `https://xhs.code89757.com`；火山引擎的 IP 路径保留为旧入口。
- 修改 Nginx 时始终先备份、执行 `nginx -t`，验证成功后再重载。

## 2. 当前部署事实

2026-09-11 迁到腾讯云。`code89757.com` 的 ICP 备案接入在腾讯云，子域名可以直接在这台服务器上提供 HTTPS，不再受火山引擎备案校验阻断。

| 项目 | 当前值 |
| --- | --- |
| 服务器 | 腾讯云 CVM `124.221.80.250`（上海），Ubuntu 22.04 |
| SSH | `ssh -i ~/.ssh/mimi-push-provider ubuntu@124.221.80.250`，改动需要 `sudo` |
| 正式域名 | `https://xhs.code89757.com`（Cloudflare A 记录，DNS only） |
| 静态文件目录 | `/var/www/xhs-poster-studio` |
| Nginx 配置 | `/etc/nginx/conf.d/xhs-poster-studio.conf`，源文件 [deploy/nginx/xhs-code89757-tencent.conf](../deploy/nginx/xhs-code89757-tencent.conf) |
| 证书 | Let's Encrypt `/etc/letsencrypt/live/xhs.code89757.com/`，webroot `/var/www/acme`，`certbot.timer` 自动续期 |
| 同机服务 | 官网 `www.code89757.com`、`api.code89757.com` 等；只改本站配置，443 的 `listen` 参数不加 `http2` |

服务器带宽只有 5Mbps。2026-10-12 起的「实测笔记」版式只用系统字体，页面不再加载 `Yozai-Medium.ttf`（约 15MB）；服务器上的旧字体与示例图保留不删，发布时也不再同步。

### 腾讯云发布

先按第 4 节做本地检查。服务器不能 root 直登，文件先传到临时目录，再用 `sudo` 备份并覆盖：

```shell
set -eu
rsync -aR --checksum -e "ssh -i $HOME/.ssh/mimi-push-provider -o IdentitiesOnly=yes" \
  index.html styles.css app.js README.md assets/published-covers.js \
  ubuntu@124.221.80.250:/tmp/xhs-stage/
ssh -i "$HOME/.ssh/mimi-push-provider" -o IdentitiesOnly=yes ubuntu@124.221.80.250 '
set -eu
backup=/var/backups/xhs-poster-studio-$(date +%Y%m%d-%H%M%S)
sudo cp -a /var/www/xhs-poster-studio "$backup"
sudo rsync -a /tmp/xhs-stage/ /var/www/xhs-poster-studio/ && rm -rf /tmp/xhs-stage
sudo chown -R root:root /var/www/xhs-poster-studio
sudo find /var/www/xhs-poster-studio -type d -exec chmod 755 {} +
sudo find /var/www/xhs-poster-studio -type f -exec chmod 644 {} +
echo "backup=$backup"
'
```

纯静态文件更新不需要重载 Nginx。

发布后验收：

```shell
curl -fsS https://xhs.code89757.com/ | grep -o 'app.js?v=[^"]*'
curl -fsSI 'https://xhs.code89757.com/app.js?v=20261012-field-note' | head -1
curl -fsSI 'https://xhs.code89757.com/styles.css?v=20261012-field-note' | head -1
curl -fsSI 'https://xhs.code89757.com/assets/published-covers.js?v=20260806-2' | head -1
```

预期 HTML 引用 `app.js?v=20261012-field-note`，三个静态文件返回 `200`。界面验证按 [AGENTS.md](../AGENTS.md) 的浏览器验证清单执行。

### 旧部署：火山引擎（保留 IP 入口）

以下内容和第 3—7 节中指向 `14.103.53.126` 的命令，都只适用于火山引擎上的旧入口。

| 项目 | 当前值 |
| --- | --- |
| 服务器 | `14.103.53.126` |
| SSH | `ssh root@14.103.53.126` |
| 静态文件目录 | `/var/www/xhs-poster-studio` |
| 临时访问地址 | `http://14.103.53.126/poster/` |
| 裸 IP 行为 | `http://14.103.53.126` 跳转到 `/poster/` |
| 旧域名 | `poster.code89757.com`，一直被火山引擎备案校验阻断；2026-09-11 已下线，由 `xhs.code89757.com` 取代 |
| IP HTTP 配置 | `/etc/nginx/conf.d/chat-archive-ip-80.conf` |
| 已删除 | 域名站点 `poster-code89757-edge-80.conf`、`poster-code89757-origin-https.conf`；HAProxy 中 `poster.code89757.com` 的 SNI 分流和 `poster_code89757_https` 后端；Let's Encrypt 证书；Cloudflare DNS 记录 |
| 下线备份 | 服务器 `/root/poster-takedown-20260911-232736`（HAProxy 原配置、两份 Nginx 配置、证书归档） |

仓库里的 `deploy/nginx/poster-code89757-*.conf` 只作历史参考，第 3 节“正式域名入口”描述的也是已下线的链路。

当前 IP 配置修改前的备份：

```text
/etc/nginx/conf.d/chat-archive-ip-80.conf.bak-poster.E3fZ3a
```

该备份只用于当前服务器回滚，不应复制到代码仓库。

## 3. 请求链路

### 临时 IP 入口

```text
浏览器
  → http://14.103.53.126/poster/
  → Nginx :80
  → alias /var/www/xhs-poster-studio/
```

临时入口仅使用 HTTP。不要使用 `https://14.103.53.126`：该入口使用自签名证书，并属于服务器旧的 HTTPS 默认虚拟主机。

### 正式域名入口

```text
浏览器
  → https://poster.code89757.com
  → 火山引擎公网边界
  → HAProxy :443（按 SNI 分流）
  → Nginx 127.0.0.1:18445
  → /var/www/xhs-poster-studio
```

服务器内部该链路、证书、HAProxy 和 Nginx 均已验证正常。当前失败发生在火山引擎公网边界：

- HTTP 返回 `Server: Suzaku`，并跳转到 `https://webblock.volcengine.com`。
- HTTPS 在读取 `poster.code89757.com` 的 SNI 后关闭连接，浏览器显示 `ERR_CONNECTION_CLOSED`。

处理方式：

1. 如果 `code89757.com` 完全没有 ICP 备案，在火山引擎办理首次备案。
2. 如果已经在其他服务商备案，在火山引擎办理接入备案。
3. 等待管局数据同步到火山引擎后，再验证正式 HTTPS 域名。

Cloudflare DNS、Let's Encrypt 证书、Nginx 和 HAProxy 的修改都不能替代备案或接入备案。

## 4. 静态文件发布

在项目根目录执行本地检查：

```shell
set -eu
node --check app.js
git diff --check
python3 -m http.server 4173 >/tmp/xhs-poster-studio-http.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT
curl --retry 10 --retry-delay 1 --retry-connrefused \
  -fsS http://127.0.0.1:4173/ >/dev/null
kill "$server_pid"
trap - EXIT
```

覆盖线上文件前先创建可恢复的服务器备份：

```shell
ssh root@14.103.53.126 '
set -eu
backup_dir=$(mktemp -d /var/backups/xhs-poster-studio-release.XXXXXX)
cp \
  /var/www/xhs-poster-studio/index.html \
  /var/www/xhs-poster-studio/styles.css \
  /var/www/xhs-poster-studio/app.js \
  /var/www/xhs-poster-studio/README.md \
  "$backup_dir/"
cp -a /var/www/xhs-poster-studio/assets "$backup_dir/assets"
printf "backup=%s\n" "$backup_dir"
'
```

同步静态文件：

```shell
rsync -av --checksum \
  index.html \
  styles.css \
  app.js \
  README.md \
  root@14.103.53.126:/var/www/xhs-poster-studio/

ssh root@14.103.53.126 \
  'mkdir -p /var/www/xhs-poster-studio/assets/fonts /var/www/xhs-poster-studio/assets/presets'

rsync -av --checksum \
  assets/fonts/ \
  root@14.103.53.126:/var/www/xhs-poster-studio/assets/fonts/

rsync -av --checksum \
  assets/presets/editorial-workbench-sample-v1.jpg \
  root@14.103.53.126:/var/www/xhs-poster-studio/assets/presets/

rsync -av --checksum \
  assets/published-covers.js \
  root@14.103.53.126:/var/www/xhs-poster-studio/assets/
```

修正权限并检查 Nginx：

```shell
ssh root@14.103.53.126 '
set -eu
chown root:root \
  /var/www/xhs-poster-studio/index.html \
  /var/www/xhs-poster-studio/styles.css \
  /var/www/xhs-poster-studio/app.js \
  /var/www/xhs-poster-studio/README.md \
  /var/www/xhs-poster-studio/assets/fonts/Yozai-Medium.ttf \
  /var/www/xhs-poster-studio/assets/fonts/Yozai-OFL.txt \
  /var/www/xhs-poster-studio/assets/presets/editorial-workbench-sample-v1.jpg \
  /var/www/xhs-poster-studio/assets/published-covers.js
chmod 0644 \
  /var/www/xhs-poster-studio/index.html \
  /var/www/xhs-poster-studio/styles.css \
  /var/www/xhs-poster-studio/app.js \
  /var/www/xhs-poster-studio/README.md \
  /var/www/xhs-poster-studio/assets/presets/editorial-workbench-sample-v1.jpg \
  /var/www/xhs-poster-studio/assets/published-covers.js
nginx -t
'
```

纯静态文件更新不需要重载 Nginx。只有 Nginx 配置发生变化时才需要重载。

## 5. IP 路径配置

仓库中的 [deploy/nginx/poster-ip-path.locations.snippet](../deploy/nginx/poster-ip-path.locations.snippet) 是添加到 IP HTTP `server {}` 内的配置片段，不是可以单独放入 `conf.d` 的完整配置。

修改生产配置前先备份：

```shell
ssh root@14.103.53.126 '
set -eu
backup=$(mktemp /etc/nginx/conf.d/chat-archive-ip-80.conf.bak-poster.XXXXXX)
cp -a /etc/nginx/conf.d/chat-archive-ip-80.conf "$backup"
printf "backup=%s\n" "$backup"
'
```

应用配置后必须按顺序执行：

```shell
ssh root@14.103.53.126 '
set -eu
nginx -t
systemctl reload nginx
systemctl is-active nginx
'
```

本次修改保留了以下显式路径，没有删除旧文件：

- `/chat-archive/`
- `/order-scheduler-mvp/`
- `/merchant-settlement-mvp/`
- `/api/`

旧聊天归档后端 `127.0.0.1:18083` 已停止，IP 根路径不再跳转到 `/chat-archive/`。

## 6. 上线验收

```shell
curl -fsSI http://14.103.53.126/
curl -fsSI http://14.103.53.126/poster
curl -fsSI http://14.103.53.126/poster/
curl -fsSI 'http://14.103.53.126/poster/styles.css?v=20260814-1'
curl -fsSI 'http://14.103.53.126/poster/app.js?v=20260814-1'
curl -fsSI 'http://14.103.53.126/poster/assets/published-covers.js?v=20260806-2'
curl -fsSI http://14.103.53.126/poster/assets/presets/editorial-workbench-sample-v1.jpg
curl -fsSI http://14.103.53.126/poster/assets/fonts/Yozai-Medium.ttf
```

预期结果：

- 裸 IP 和 `/poster` 返回 `308`，目标是 `/poster/`。
- `/poster/`、CSS 和 JavaScript 返回 `200`。
- 页面 HTML 包含 `templateCopyGuideTitle` 和 `photoInput`，说明模板原稿与照片功能已经部署。

界面还需要在浏览器中验证：

1. 切换五套模板，确认首次进入会载入模板原稿，改写后返回会恢复该模板自己的草稿。
2. 点击“载入最佳示例 / 恢复载入前文案”，确认不会意外丢失当前文案。
3. 切换两套色系共十一组配色，并选择“自然手写”确认预览和导出字形一致。
4. 选择照片，在“调整区域”中拖动照片模块并从四角调整宽高。
5. 切换“调整取景”，直接拖动区域内的照片内容，并切换“纯文字 / 图文佐证 / 大图主导”。
6. 确认卡片宽高与圆角没有逐篇调节入口。
7. 移除照片并确认恢复纯文字布局。
8. 切换海报和列表预览。
9. 导出 PNG，并确认像素尺寸为 `1080 × 1440`。

## 7. 回滚

如果 IP 路径配置出现问题：

```shell
ssh root@14.103.53.126 '
set -eu
cp -a \
  /etc/nginx/conf.d/chat-archive-ip-80.conf.bak-poster.E3fZ3a \
  /etc/nginx/conf.d/chat-archive-ip-80.conf
nginx -t
systemctl reload nginx
systemctl is-active nginx
'
```

静态文件发布前应单独创建 `/var/backups/xhs-poster-studio-*` 目录并备份当前版本。最近两次备份为：

```text
/var/backups/xhs-poster-studio-color-presets.6nFxuq
/var/backups/xhs-poster-studio-photo-upload.meeMok
/var/backups/xhs-poster-studio-photo-module.rENEDG
/var/backups/xhs-poster-studio-photo-module-final.ZqEX76
```

## 8. 安全与边界

- 不把 SSH 私钥、密码、令牌、证书私钥或 Cloudflare 凭据写入仓库。
- 用户照片不上传服务器，只在浏览器运行时内存中处理。
- 临时 IP 地址没有 TLS，不在页面中输入密码、令牌或其他敏感数据。
- 未经明确授权，不修改 DNS、共享 HAProxy 配置或删除旧服务文件。
- 修改 Nginx 后必须先执行 `nginx -t`，不得跳过检查直接重载。
