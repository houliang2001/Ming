# 灵犀阁 AI 测算系统项目说明

## 1. 项目是干什么的

灵犀阁是一个「AI 东方玄学测算」Web 应用，前端提供手相、面相、生辰八字、塔罗牌、今日灵签等体验入口，后端通过 OpenAI-compatible 接口调用 AI 模型生成报告，并使用 MySQL + Prisma 保存报告、支付订单和 AI 调用日志。

核心能力：

- 首页展示 AI 测算入口和产品视觉。
- 手相、面相：上传图片后调用视觉模型生成报告。
- 生辰八字、塔罗牌：提交表单后调用文本模型生成报告。
- 今日灵签：每日生成一次灵签内容。
- 结果页：展示免费报告，完整报告通过 6.66 元收款码解锁。
- 专属海报：解锁后可生成测算海报并下载保存。
- 历史记录：通过浏览器 localStorage 生成匿名 clientId，只显示当前浏览器自己的报告。
- 后台管理：查看报告、订单、收入和统计数据。

注意：本项目不做登录注册，不做会员系统，普通用户历史记录通过匿名 clientId 区分。

## 2. 技术栈

前端：

- Vue 3
- Vue Router
- Vite
- Element Plus
- Lucide Vue 图标
- html-to-image
- qrcode

后端：

- Node.js
- Express
- Prisma
- MySQL
- Multer
- OpenAI-compatible AI 调用方式

数据库：

- MySQL
- Prisma Client

## 3. 目录结构说明

```text
Ming/
├─ src/                         前端源码
│  ├─ main.js                   前端入口
│  ├─ App.vue                   根组件
│  ├─ router/                   前端路由
│  │  └─ index.js
│  ├─ views/                    页面
│  │  ├─ Home.vue               首页
│  │  ├─ PalmReading.vue        手相测算页
│  │  ├─ FaceReading.vue        面相测算页
│  │  ├─ BaziReading.vue        生辰八字页
│  │  ├─ TarotReading.vue       塔罗牌页
│  │  ├─ DailyFortune.vue       今日灵签页
│  │  ├─ Result.vue             报告结果页
│  │  ├─ History.vue            历史记录页
│  │  ├─ Admin.vue              后台管理页
│  │  ├─ Privacy.vue            隐私说明页
│  │  ├─ Disclaimer.vue         免责声明页
│  │  └─ Member.vue             会员中心占位页
│  ├─ components/               前端组件
│  │  ├─ AppHeader.vue          顶部导航
│  │  ├─ FeatureCard.vue        首页测算入口卡片
│  │  ├─ LoadingAnalyze.vue     AI 分析加载页
│  │  ├─ LockedPremium.vue      完整报告锁定/支付模块
│  │  ├─ ReportPoster.vue       专属测算海报
│  │  ├─ ResultCard.vue         结果卡片
│  │  ├─ TarotCard.vue          塔罗卡牌
│  │  └─ UploadPanel.vue        上传组件
│  └─ utils/                    前端工具
│     ├─ aiService.js           AI 测算接口封装
│     ├─ dailyService.js        今日灵签接口封装
│     ├─ reportService.js       报告接口封装，如存在则用于报告读取
│     ├─ storage.js             本地缓存
│     ├─ clientId.js            匿名 clientId
│     ├─ posterService.js       海报生成/下载/复制链接
│     ├─ quoteService.js        首页每日签语
│     └─ adminService.js        后台接口封装
│
├─ server/                      后端源码
│  ├─ app.js                    Express 入口
│  ├─ .env.example              环境变量示例，不放真实密钥
│  ├─ prisma/
│  │  ├─ schema.prisma          Prisma 模型
│  │  └─ migrations/            数据库迁移
│  ├─ lib/
│  │  └─ prisma.js              Prisma Client 单例
│  ├─ routes/                   后端路由
│  │  ├─ analyze.js             AI 分析接口
│  │  ├─ reports.js             报告查询接口
│  │  ├─ payment.js             支付/个人收款码解锁接口
│  │  └─ admin.js               后台管理接口
│  ├─ services/                 后端服务
│  │  ├─ aiRuntime.js           OpenAI-compatible 请求封装
│  │  ├─ aiVisionService.js     视觉模型分析
│  │  ├─ aiTextService.js       文本模型分析
│  │  ├─ dailyFortuneService.js 今日灵签生成
│  │  ├─ reportService.js       报告写入/查询
│  │  ├─ orderService.js        订单写入/解锁
│  │  └─ aiLogService.js        AI 调用日志
│  ├─ utils/
│  │  ├─ promptTemplates.js     AI 提示词模板
│  │  └─ jsonParser.js          AI JSON 解析
│  └─ config/
│     └─ payment.js             支付金额等配置
│
├─ public/                      静态资源
├─ dist/                        前端生产构建产物，上传宝塔用
├─ scripts/                     本地开发/构建脚本
├─ package.json                 前端依赖和脚本
├─ server/package.json          后端依赖和脚本
├─ vite.config.cjs              Vite 配置
└─ PROJECT_SUMMARY.md           当前项目说明文档
```

## 4. 环境变量

后端真实环境变量写在：

```bash
server/.env
```

不要把真实 `.env` 提交到仓库，也不要写进前端代码或 README。

示例：

```env
DATABASE_URL="mysql://username:password@database-host:3306/database-name"

NODE_ENV=development
PORT=3001

AI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
AI_API_KEY=your_ai_api_key
AI_MODEL=your_model_name
AI_TIMEOUT_MS=60000
ENABLE_AI_MOCK=false
CORS_ORIGIN=http://your-domain.com,https://your-domain.com

ALIPAY_AMOUNT=6.66
ADMIN_TOKEN=your_admin_token
```

生产环境必须注意：

- `ENABLE_AI_MOCK=false`
- `DATABASE_URL` 必须指向 MySQL
- `CORS_ORIGIN` 必须包含正式域名
- `AI_API_KEY` 不允许写入前端

## 5. 本地安装和启动

### 5.1 安装前端依赖

在项目根目录执行：

```bash
npm install
```

### 5.2 安装后端依赖

```bash
cd server
npm install
```

### 5.3 初始化 Prisma

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

如果数据库已经有迁移记录，生产环境使用：

```bash
npx prisma migrate deploy
```

### 5.4 启动后端

```bash
cd server
npm run dev
```

默认后端地址：

```text
http://127.0.0.1:3001
```

健康检查：

```bash
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1:3001/api/health/ai
```

### 5.5 启动前端

在项目根目录执行：

```bash
npm run dev
```

默认前端地址：

```text
http://127.0.0.1:5173
```

## 6. 打包和部署

### 6.1 前端打包

在项目根目录执行：

```bash
npm run build
```

生成目录：

```text
dist/
```

宝塔部署前端时，上传并覆盖 `dist` 目录内容即可。

### 6.2 后端部署

服务器目录示例：

```text
/www/wwwroot/lingxige/server
```

进入后端目录执行：

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run start
```

宝塔 Node 项目启动命令建议：

```bash
npm run start
```

或：

```bash
node app.js
```

### 6.3 Nginx 反向代理示例

前端站点根目录指向：

```text
/www/wwwroot/lingxige/dist
```

反向代理 `/api/` 到后端：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 90s;
    proxy_send_timeout 90s;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

## 7. 主要接口

AI 分析：

```text
POST /api/analyze/palm
POST /api/analyze/face
POST /api/analyze/bazi
POST /api/analyze/tarot
POST /api/analyze/daily
```

报告：

```text
GET /api/reports
GET /api/reports/:id
GET /api/reports/:id/unlock-status
```

支付：

```text
POST /api/payment/personal-qr/create
POST /api/payment/personal-qr/confirm
POST /api/payment/alipay/create
POST /api/payment/alipay/notify
GET  /api/payment/order/:orderNo
POST /api/payment/dev/unlock
```

后台：

```text
GET /api/admin/stats
GET /api/admin/reports
GET /api/admin/reports/:id
GET /api/admin/orders
GET /api/admin/revenue/daily
```

## 8. 数据库表说明

当前 Prisma 主要模型：

- `Report`：AI 测算报告，包含 type、score、summary、sections、detailSections、clientId、unlocked。
- `PaymentOrder`：支付订单，金额固定 6.66 元，支付成功后解锁对应 Report。
- `AiLog`：AI 调用日志，记录模块、成功状态、错误信息。
- `DailyFortune`：今日灵签记录，按 clientId 和日期保存。

普通用户历史记录依赖：

```text
localStorage key: lingxige_client_id
```

后端查询历史时通过 `X-Client-Id` 或 `clientId` 查询，不再给普通用户返回所有报告。

## 9. 常见报错和解决方案

### 9.1 npm: command not found

原因：服务器没有安装 Node.js，或宝塔 Node 环境没有加入 PATH。

解决：

- 宝塔软件商店安装 Node.js。
- 确认终端执行 `node -v` 和 `npm -v` 有输出。

### 9.2 Cannot find package 'dotenv'

原因：后端依赖没有安装。

解决：

```bash
cd /www/wwwroot/lingxige/server
npm install
```

### 9.3 fetch is not defined

原因：服务器 Node 版本过低，旧版本 Node 没有内置 `fetch`。

解决：

- 升级到 Node 18+，推荐 Node 20+。
- 然后重启后端服务。

### 9.4 当前来源未被允许访问 AI 分析服务

原因：CORS_ORIGIN 没有包含当前访问域名。

解决：

在 `server/.env` 中加入正式域名：

```env
CORS_ORIGIN=http://your-domain.com,https://your-domain.com
```

然后重启后端。

### 9.5 Cannot POST /api/analyze/daily

原因：

- 线上后端代码不是最新版本。
- `server/routes/analyze.js` 没有 `/daily` 路由。
- 后端未重启。

解决：

```bash
cd /www/wwwroot/lingxige/server
grep -n "router.post('/daily'" routes/analyze.js
npm install
npx prisma generate
npx prisma migrate deploy
```

确认有路由后重启后端。

### 9.6 Unknown argument `clientId`

原因：服务器 Prisma Client 没有更新，或数据库迁移没有执行。

解决：

```bash
cd /www/wwwroot/lingxige/server
npx prisma generate
npx prisma migrate deploy
```

然后重启后端。

### 9.7 AI分析服务暂时不可用

常见原因：

- `AI_API_KEY` 未配置或失效。
- `AI_BASE_URL` 写错。
- `AI_MODEL` 写错。
- 服务器无法访问 AI 服务。
- AI 返回不是合法 JSON。

检查：

```bash
curl http://127.0.0.1:3001/api/health/ai
```

如果配置都为 true，再用最小请求测试 AI 服务。

### 9.8 Prisma migrate deploy 提示 No pending migrations

含义：没有新的数据库迁移需要执行，不是错误。

### 9.9 访问域名 404

常见原因：

- 域名 DNS 没解析到服务器 IP。
- 宝塔站点根目录没有指向 `dist`。
- Nginx 没配置 `try_files $uri $uri/ /index.html;`。
- `/api/` 没反代到 `127.0.0.1:3001`。

### 9.10 前端能打开，但接口 500

排查顺序：

1. 看后端日志。
2. 看 `/api/health` 是否正常。
3. 看 `/api/health/ai` 是否正常。
4. 看 `.env` 是否存在并配置正确。
5. 执行 `npx prisma generate`。
6. 执行 `npx prisma migrate deploy`。

## 10. 部署检查清单

上线前确认：

- `server/.env` 存在。
- `DATABASE_URL` 指向 MySQL。
- `AI_BASE_URL`、`AI_API_KEY`、`AI_MODEL` 正确。
- `ENABLE_AI_MOCK=false`。
- `CORS_ORIGIN` 包含线上域名。
- `ALIPAY_AMOUNT=6.66`。
- 后端依赖已安装。
- 已执行 `npx prisma generate`。
- 已执行 `npx prisma migrate deploy`。
- 后端服务已启动。
- 前端 `dist` 已上传。
- Nginx 已配置 `/api/` 反向代理。
- Nginx 已配置 SPA fallback：`try_files $uri $uri/ /index.html;`。

## 11. 下一步开发建议

建议优先级：

1. 稳定 AI 输出格式：继续强化 prompt 和 JSON 解析，避免模型返回非 JSON。
2. 完善今日灵签：增加更丰富的签文模板、视觉卡片和每日记录。
3. 完善支付闭环：如果后续接真实支付宝/微信商户支付，可替换当前个人收款码确认逻辑。
4. 海报功能增强：增加更多模板、二维码样式、长图适配和移动端保存优化。
5. 后台增强：增加按模块、日期、支付状态筛选和 CSV 导出。
6. 错误监控：把 AI 调用失败、支付失败、Prisma 错误记录到更清晰的日志系统。
7. 图片压缩：手相/面相上传前做前端压缩，减少接口请求体积。
8. 视觉统一：继续统一手相、面相、八字、塔罗、灵签的字体、卡片、动效规范。
9. SEO 与分享：补充标题、描述、Open Graph 图片和分享海报入口。
10. 安全加固：限制上传大小、接口频率、防刷、后台 ADMIN_TOKEN 管理。

## 12. 开发注意事项

- 不要把真实 `.env`、API Key、数据库密码提交到仓库。
- 不要把 AI Key 写进前端。
- 不要在前端保存用户原始图片。
- 不要随意修改 `Report`、`PaymentOrder`、`AiLog` 的字段，改动前先做 Prisma migration。
- 普通用户历史记录只按 clientId 查询，后台 `/admin` 才能看全部数据。
- 支付金额当前固定为 6.66 元，前后端、订单、统计都要保持一致。
- 生产环境不要开启 mock。

