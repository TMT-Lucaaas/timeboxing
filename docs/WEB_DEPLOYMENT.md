# Web Deployment / 网页部署

[中文](#中文) | [English](#english)

## 中文

### 在线使用

正式入口：[https://www.thinkmaketell.com/timeboxing/](https://www.thinkmaketell.com/timeboxing/)。访问 `/timeboxing` 会跳转到带尾斜杠的入口。建议使用桌面浏览器。

网页版与开源 macOS 版共用一套页面和本地数据逻辑，包含中英双语、计划、执行、复盘和 JSON 备份。数据保存在当前浏览器的 IndexedDB，服务器不接收业务数据，无需账号、云数据库或运行 Node 服务。浏览器与 macOS 版不会自动同步，迁移方式见 [本地存储](LOCAL_STORAGE.md)。

### 构建

使用 Node.js 22.13+ 和 npm，在仓库根目录运行（macOS/Linux）：

```bash
npm ci
npm run lint
npm run build-web
```

`build-web` 等价于 `TIMEBOXING_BASE_PATH=/timeboxing next build`。Next.js 在构建时把路径前缀写入导航、静态脚本、样式和图标 URL。产物位于 `out/`，上传的是它的内容，不是源代码或 `node_modules/`。

自定义子路径：`TIMEBOXING_BASE_PATH=/my-app npm run build-static`。部署在域名根路径或构建桌面版时，取消该环境变量并运行 `npm run build-static`。前缀以 `/` 开头，不带尾斜杠；改变路径后必须重新构建。两种构建共用 `out/`，不要并行运行。

### 本地预览

将静态产物放到父目录下的 `timeboxing/`，模拟真实 URL。以下示例需要 Python 3：

```bash
mkdir -p dist/web-preview/timeboxing
cp -R out/. dist/web-preview/timeboxing/
python3 -m http.server 17896 --bind 127.0.0.1 --directory dist/web-preview
```

打开 `http://127.0.0.1:17896/timeboxing/`。检查语言切换、各页导航和直接刷新；新增待办后刷新应仍保留。测试完成按 Ctrl+C 停止预览。`next start` 不用于本项目的静态导出部署。

### Nginx 部署

在已有 HTTPS 站点中引入 [nginx-timeboxing.conf](../deploy/nginx-timeboxing.conf)。该配置仅接管 `/timeboxing` 和 `/timeboxing/`，文件目录独立于主页：

```text
/srv/timeboxing/releases/<release-id>/timeboxing/  每次发布的 out/ 内容
/srv/timeboxing/current                          指向当前 release-id 的符号链接
```

由有权限的部署账号创建发布目录，把 `out/` 内容上传到该目录的 `timeboxing/` 中。将配置保存为 `/etc/nginx/snippets/timeboxing.conf`，在正式域名的 HTTPS `server` 块中添加：

```nginx
include /etc/nginx/snippets/timeboxing.conf;
```

配置里的 `/srv/timeboxing/current` 必须与实际发布目录对应。确保 Nginx 用户可读取文件及遍历父目录。切换 `current` 到新发布目录后执行 `sudo nginx -t`，成功再执行 `sudo systemctl reload nginx`。HTTP 与其他域名统一重定向到正式 HTTPS 域名，让用户使用稳定的浏览器存储来源。

配置要求浏览器重新验证缓存，避免旧 HTML 引用已替换的脚本。不添加单页应用的全站 fallback；未知页面应返回 404。每个页面都有自己的 `index.html`，因此直接访问、收藏和刷新均可用。

### 更新、验收与回退

1. 拉取代码，运行 `npm ci`、lint 和 `build-web`。
2. 上传到新的发布目录；保留旧发布目录及修改前的 Nginx 配置。
3. 原子替换 `current` 符号链接；首次接入或配置变更时先校验 Nginx 再 reload。
4. 检查首页、`plan/`、`focus/`、`review/`、`settings/`，包括直接刷新、脚本/图标返回 200、未知页面返回 404；确认原主页仍正常。
5. 用测试浏览器验证创建待办、安排时间盒、完成、复盘、语言偏好持久化、JSON 导出/导入。浏览器数据不随部署上传。
6. 需要回退时，把 `current` 原子指回旧发布目录；如修改了 Nginx，恢复备份并在 `nginx -t` 成功后 reload。

网页更新不会清空 IndexedDB。用户清理网站数据、浏览器回收存储、无痕会话结束均可能删除数据，应定期导出 JSON。页面需要联网加载，不承诺离线启动。

## English

### Hosted App

Open [https://www.thinkmaketell.com/timeboxing/](https://www.thinkmaketell.com/timeboxing/) in a desktop browser. `/timeboxing` redirects to the trailing-slash URL.

Web and open-source macOS share the same pages and local data logic: Chinese/English, Plan, Focus, Review, and JSON backups. Records stay in browser IndexedDB. The server receives no app records; no account, cloud database, or Node server is required. Browser and macOS data do not sync automatically; see [Local Storage](LOCAL_STORAGE.md).

### Build

Use Node.js 22.13+ and npm from the repository root (macOS/Linux):

```bash
npm ci
npm run lint
npm run build-web
```

`build-web` runs `TIMEBOXING_BASE_PATH=/timeboxing next build`. Next.js embeds the prefix in navigation, script, stylesheet, and icon URLs at build time. Upload the contents of `out/`, not source files or `node_modules/`.

For another subpath, run `TIMEBOXING_BASE_PATH=/my-app npm run build-static`. For root hosting or desktop builds, unset that variable and run `npm run build-static`. The prefix starts with `/` and has no trailing slash. Changing it requires rebuilding. Both builds write to `out/`; do not run them concurrently.

### Local Preview

Place the export under a `timeboxing/` folder to reproduce the public URL. This example requires Python 3:

```bash
mkdir -p dist/web-preview/timeboxing
cp -R out/. dist/web-preview/timeboxing/
python3 -m http.server 17896 --bind 127.0.0.1 --directory dist/web-preview
```

Open `http://127.0.0.1:17896/timeboxing/`. Check language switching, navigation, direct reloads, and backlog persistence. Press Ctrl+C when finished. `next start` is not used to serve this static export.

### Nginx Hosting

Include [nginx-timeboxing.conf](../deploy/nginx-timeboxing.conf) in an existing HTTPS server. It handles only `/timeboxing` and `/timeboxing/`, using a separate directory from the homepage:

```text
/srv/timeboxing/releases/<release-id>/timeboxing/  contents of out/ for each release
/srv/timeboxing/current                          symlink to the current release-id
```

Create a release directory with an authorized deployment account and upload `out/` contents into its `timeboxing/` folder. Install the snippet at `/etc/nginx/snippets/timeboxing.conf` and add this line inside the canonical hostname's HTTPS `server` block:

```nginx
include /etc/nginx/snippets/timeboxing.conf;
```

The snippet's `/srv/timeboxing/current` must match the actual release path. Ensure Nginx can read the files and traverse parent directories. Point `current` at the release, run `sudo nginx -t`, then `sudo systemctl reload nginx` after validation succeeds. Redirect HTTP and alternate hostnames to the canonical HTTPS origin so browser storage stays consistent.

The configuration revalidates browser caches to avoid stale HTML referencing replaced scripts. Do not add a site-wide SPA fallback: unknown pages should return 404. Each page has its own `index.html`, supporting direct visits, bookmarks, and reloads.

### Updates, Checks, And Rollback

1. Pull source, run `npm ci`, lint, and `build-web`.
2. Upload to a new release directory; retain the previous release and Nginx configuration.
3. Atomically replace the `current` symlink. For initial setup or config changes, validate Nginx before reloading.
4. Check Home, `plan/`, `focus/`, `review/`, and `settings/`, including reloads, script/icon responses, and unknown-page 404s. Check the original homepage too.
5. In a test browser, exercise backlog creation, scheduling, completion, review, language persistence, and JSON export/import. Do not upload browser records with the deployment.
6. To roll back, atomically point `current` at the previous release. If Nginx changed, restore its backup, validate, and reload.

Web updates do not clear IndexedDB. Clearing site data, storage eviction, or ending a private session can remove records; export JSON backups regularly. Loading pages requires a connection; offline startup is not guaranteed.
