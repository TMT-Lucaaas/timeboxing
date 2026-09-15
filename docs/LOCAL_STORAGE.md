# Local Storage / 本地存储

[中文](#中文) | [English](#english)

## 中文

Timeboxing 是本地优先应用。默认不需要后端服务、数据库账号或云端配置。

### 存储引擎

应用使用 Dexie 操作浏览器 IndexedDB。

```text
数据库名称：timeboxing_oss_db
数据库版本：1
```

Electron 桌面版使用独立 session partition：

```text
persist:timeboxing-oss
```

这可以让开源版和其他本地版本的数据相互隔离。

### 网页版与迁移

网页版地址为 [www.thinkmaketell.com/timeboxing/](https://www.thinkmaketell.com/timeboxing/)。服务器只提供页面、脚本和静态资源，时间盒、待办、日志、设置均在当前浏览器保存。常规窗口中刷新页面、关闭后再打开、服务器更新页面均不会主动删除这些数据。

IndexedDB 按浏览器用户配置和站点来源（协议、域名、端口）隔离，不按 URL 路径隔离。同一浏览器访问同一 HTTPS 域名会继续使用原数据库；换域名、浏览器、设备或切换到 Electron 会使用独立数据。浏览器清理网站数据、存储回收或结束无痕会话可能删除记录。

网页版和开源 macOS 版使用相同的 JSON 备份格式，可手动导出、导入来迁移。导入会替换目标数据，不是合并或自动同步。迁移前先在两端导出备份；不会自动读取个人版应用的数据。

### 数据表

```text
boxes      已安排的时间盒
backlog    未安排的待办事项
logs       时间盒操作日志
settings   应用设置，使用 singleton 记录
```

### 存储内容

`boxes` 保存：

- 标题、开始时间、结束时间。
- 状态：`planned`、`active`、`done`、`missed`。
- 标签、颜色、备注、地点、链接等可选信息。
- 是否为计划盒。
- 创建时间和更新时间。

`backlog` 保存：

- 待办标题。
- 预估分钟数。
- 标签和备注。

`logs` 保存：

- 对应时间盒 ID。
- 事件类型，例如创建、开始、完成、顺延、分割、更新、删除。
- 事件载荷。
- 创建时间。

`settings` 保存：

- 工作日开始时间。
- 工作日结束时间。
- 每日计划盒默认时长。
- 专注保护开关。
- 界面语言偏好（跟随系统、中文或 English）。
- 日历集成开关字段。

### 导出备份

打开 `Settings 设置 -> 本地数据`，点击 `导出 JSON`。

导出的 JSON 包含：

- `boxes`
- `backlog`
- `logs`
- `settings`
- 导出时间
- schema 版本

建议在批量调整计划、清空数据或切换运行环境前先导出备份。

### 导入恢复

打开 `Settings 设置 -> 本地数据`，点击 `导入 JSON` 并选择备份文件。

当前导入策略是替换本地数据。导入前如果需要回滚点，请先导出当前数据。

导入时会把 JSON 中的时间字段恢复为 `Date` 对象，以便日历、复盘和排序逻辑正常工作。

### 清空数据

打开 `Settings 设置 -> 本地数据`，点击 `清空数据`。

该操作会清空：

- 时间盒
- 待办
- 日志
- 设置

清空后应用会重新创建默认设置。

### 隐私说明

默认情况下，数据只保存在用户设备上。应用不会主动上传数据，也不需要登录账号。

如果未来添加云同步或第三方集成，应在 README、用户手册和本文件中明确说明数据流向、配置方式和迁移步骤。

## English

Timeboxing is local-first. It does not require a backend service, database account, or cloud configuration by default.

### Storage Engine

The app uses Dexie on top of browser IndexedDB.

```text
Database name: timeboxing_oss_db
Database version: 1
```

The Electron app also uses an isolated session partition:

```text
persist:timeboxing-oss
```

This keeps the open-source version separate from other local builds.

### Web App And Data Transfer

The hosted app is at [www.thinkmaketell.com/timeboxing/](https://www.thinkmaketell.com/timeboxing/). The server serves pages, scripts, and assets. Timeboxes, backlog, logs, and settings stay in the current browser. Reloading, reopening a normal window, and updating hosted files do not actively delete these records.

IndexedDB is isolated by browser profile and origin (scheme, hostname, and port), not URL path. The same HTTPS origin in the same browser keeps using the same database. Another domain, browser, device, or Electron uses separate storage. Clearing site data, browser storage eviction, or ending a private session may remove records.

The web and open-source macOS apps share the same JSON backup format. Export and import to move data manually. Import replaces destination data; it is not merging or automatic sync. Back up both sides first. The web app does not automatically read personal-edition app data.

### Tables

```text
boxes      scheduled timeboxes
backlog    unscheduled backlog items
logs       action history for timeboxes
settings   app settings stored as a singleton record
```

### Stored Data

`boxes` stores:

- Title, start time, and end time.
- Status: `planned`, `active`, `done`, or `missed`.
- Optional tags, color, notes, location, and links.
- Whether the box is a planning box.
- Created and updated timestamps.

`backlog` stores:

- Backlog title.
- Estimated minutes.
- Tags and notes.

`logs` stores:

- Related timebox ID.
- Event type, such as create, start, finish, snooze, split, update, or delete.
- Event payload.
- Created timestamp.

`settings` stores:

- Workday start time.
- Workday end time.
- Default daily planning box duration.
- Focus shield flag.
- Interface language preference (System, 中文, or English).
- Calendar integration flag field.

### Backup

Open `Settings -> Local Data` and choose `Export JSON`.

The exported JSON contains:

- `boxes`
- `backlog`
- `logs`
- `settings`
- export timestamp
- schema version

Export a backup before large schedule changes, data clearing, or moving to another runtime.

### Restore

Open `Settings -> Local Data`, choose `Import JSON`, and select a backup file.

Import currently replaces existing local data. Export first if you want a rollback point.

During import, date fields from JSON are revived into `Date` objects so that calendar, review, and sorting logic continue to work.

### Reset

Open `Settings -> Local Data` and choose `Clear Data`.

This clears:

- timeboxes
- backlog items
- logs
- settings

After clearing, the app creates default settings again.

### Privacy

By default, data stays on the user's device. The app does not upload data and does not require login.

If cloud sync or third-party integrations are added in the future, README, the user guide, and this file should explain data flow, configuration, and migration steps clearly.
