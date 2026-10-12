# 小红书封面生成器：部署与运维

> 本文是公开版，只记录通用流程。服务器地址、登录用户、密钥文件、备份目录等生产连接信息写在本地的 `docs/DEPLOYMENT.local.md`，该文件已加入 `.gitignore`，不入库。

## 1. 目标

- 维持纯静态、无后端、低维护成本的部署方式。
- 保证“编辑 → 预览 → 导出 PNG”的页面闭环可用。
- 正式入口为 `https://xhs.code89757.com`。
- 修改 Nginx 时始终先备份、执行 `nginx -t`，验证成功后再重载。

## 2. 当前部署方式

| 项目 | 说明 |
| --- | --- |
| 正式域名 | `https://xhs.code89757.com`（Cloudflare DNS only） |
| 服务器 | 腾讯云 Ubuntu 主机；地址与登录方式见本地说明 |
| 静态文件目录 | `/var/www/xhs-poster-studio` |
| Nginx 配置 | 源文件 [deploy/nginx/xhs-code89757-tencent.conf](../deploy/nginx/xhs-code89757-tencent.conf) |
| 证书 | Let's Encrypt，webroot 方式自动续期 |
| 同机服务 | 同一台机器还有其他站点；只改本站配置，443 的 `listen` 参数不加 `http2` |

「实测笔记」版式只用系统字体，页面不再加载 `assets/fonts/` 与 `assets/presets/` 里的旧素材，发布时也不再同步它们。

## 3. 发布

先在项目根目录做本地检查：

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

从本地说明读取 `DEPLOY_HOST`（`用户@地址`）和 `DEPLOY_KEY`（密钥路径）后发布。服务器不允许 root 直登，文件先传到临时目录，再用 `sudo` 备份并覆盖：

```shell
set -eu
: "${DEPLOY_HOST:?}" "${DEPLOY_KEY:?}"
rsync -aR --checksum -e "ssh -i $DEPLOY_KEY -o IdentitiesOnly=yes" \
  index.html styles.css app.js README.md assets/published-covers.js \
  "$DEPLOY_HOST:/tmp/xhs-stage/"
ssh -i "$DEPLOY_KEY" -o IdentitiesOnly=yes "$DEPLOY_HOST" '
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

纯静态文件更新不需要重载 Nginx。每次发布输出的备份目录记入本地说明，便于回滚。

## 4. 上线验收

```shell
app_path=$(curl -fsS https://xhs.code89757.com/ | grep -o 'app.js?v=[^"]*')
echo "$app_path"
curl -fsSI "https://xhs.code89757.com/$app_path" | head -1
curl -fsSI 'https://xhs.code89757.com/assets/published-covers.js?v=20260806-2' | head -1
```

预期 HTML 引用当前版本的 `app.js`，静态文件返回 `200`。界面验证按 [AGENTS.md](../AGENTS.md) 的浏览器验证清单执行。

## 5. 回滚

用发布时输出的备份目录覆盖静态目录：

```shell
set -eu
: "${DEPLOY_HOST:?}" "${DEPLOY_KEY:?}" "${BACKUP_DIR:?}"
ssh -i "$DEPLOY_KEY" -o IdentitiesOnly=yes "$DEPLOY_HOST" \
  "sudo rsync -a --delete '$BACKUP_DIR/' /var/www/xhs-poster-studio/"
```

纯静态回滚不需要重载 Nginx。

## 6. 旧入口

2026-09-11 之前网站部署在火山引擎，旧域名 `poster.code89757.com` 一直被备案校验阻断，已于当天下线。旧服务器上的 IP 路径入口与相关备份只在本地说明中记录。仓库里的 `deploy/nginx/poster-code89757-*.conf` 与 `poster-ip-path.locations.snippet` 只作历史参考。

## 7. 安全与边界

- 不把 SSH 私钥、密码、令牌、证书私钥、Cloudflare 凭据，以及服务器地址、登录用户、密钥文件名、备份路径写入仓库。
- 用户截图不上传服务器，只在浏览器运行时内存中处理。
- 未经明确授权，不修改 DNS、共享代理配置或删除旧服务文件。
- 修改 Nginx 后必须先执行 `nginx -t`，不得跳过检查直接重载。
