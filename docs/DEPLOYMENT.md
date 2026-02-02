# 部署指南

本文档详细介绍如何将 MailReceive 部署到 Cloudflare Workers。

## 🚀 部署前准备

### 1. 环境要求

- **Node.js**: v16+ (推荐 v24.4.1)
- **npm**: v11.4.2+
- **Cloudflare 账户**: 免费或付费账户
- **Wrangler CLI**: v4.33.2+

### 2. 获取 Cloudflare 账户

1. 访问 [Cloudflare](https://cloudflare.com) 注册账户
2. 获取您的 Account ID (在右侧边栏中显示)
3. 创建 API Token 或使用全局 API Key

### 3. 安装 Wrangler CLI

```bash
# 全局安装 Wrangler
npm install -g wrangler

# 验证安装
wrangler --version
```

## 🔧 配置设置

### 1. 登录 Cloudflare

```bash
# 使用浏览器登录
wrangler login

# 验证登录状态
wrangler whoami
```

### 2. 配置环境变量

编辑 `wrangler.toml` 文件：

```toml
name = "mailreceive"
main = "src/index.js"
compatibility_date = "2024-01-01"

# 基础环境变量
[vars]
TEMPMAIL_PLUS_EMAIL = "your-email@mailto.plus"
TEMPMAIL_PLUS_PIN = "your-pin-code"
TEMPMAIL_PLUS_API_URL = "https://tempmail.plus/api"
SESSION_TIMEOUT = "1800"
VERIFICATION_TIMEOUT = "180"
MAX_RETRY_ATTEMPTS = "3"
PIN_LENGTH = "8"

# 开发环境
[env.development]
name = "mailreceive-dev"

[env.development.dev]
port = 8787

# 预发布环境
[env.staging]
name = "mailreceive-staging"

# 生产环境
[env.production]
name = "mailreceive-prod"
```

### 3. 获取 tempmail.plus 凭据

1. 访问 [tempmail.plus](https://tempmail.plus)
2. 注册账户并获取：
   - 邮箱地址 (格式：xxx@mailto.plus)
   - PIN 码
3. 将凭据更新到 `wrangler.toml` 中

## 📦 部署步骤

### 1. 安装项目依赖

```bash
# 克隆项目
git clone <your-repository-url>
cd mailreceive

# 安装依赖
npm install
```

### 2. 本地测试

```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问
# http://localhost:8787
```

### 3. 部署到不同环境

#### 开发环境部署

```bash
npm run deploy:staging
```

#### 生产环境部署

```bash
npm run deploy:production
```

#### 默认环境部署

```bash
npm run deploy
```

### 4. 验证部署

部署成功后，您将看到类似输出：

```
✅ Successfully published your Worker
🌍 Your worker is accessible at:
https://mailreceive-prod.your-subdomain.workers.dev
```

## 🔍 部署验证

### 1. 功能测试

访问部署的 URL，测试以下功能：

- [ ] 页面正常加载
- [ ] 输入邮箱地址
- [ ] 获取邮件列表
- [ ] 查看邮件详情
- [ ] 验证码提取功能

### 2. API 测试

```bash
# 测试邮件列表 API
curl "https://your-worker-url.workers.dev/api/session/emails?userEmail=test@example.com"

# 测试邮件详情 API
curl "https://your-worker-url.workers.dev/api/session/email-detail?userEmail=test@example.com&emailId=123"
```

## 🔒 安全配置

### 1. 环境变量安全

**不要在代码中硬编码敏感信息！**

使用 Wrangler Secrets 存储敏感数据：

```bash
# 设置密钥
wrangler secret put TEMPMAIL_PLUS_EMAIL
wrangler secret put TEMPMAIL_PLUS_PIN

# 列出所有密钥
wrangler secret list
```

### 2. 自定义域名 (可选)

1. 在 Cloudflare 中添加您的域名
2. 在 `wrangler.toml` 中配置路由：

```toml
[[routes]]
pattern = "mail.yourdomain.com/*"
zone_name = "yourdomain.com"
```

3. 部署到自定义域名：

```bash
wrangler deploy --routes
```

## 📊 监控和日志

### 1. 查看实时日志

```bash
# 查看生产环境日志
wrangler tail --env production

# 查看特定格式日志
wrangler tail --format pretty
```

### 2. Cloudflare Dashboard

在 Cloudflare Dashboard 中可以查看：

- 请求统计
- 错误日志
- 性能指标
- 使用量统计

## 🔄 CI/CD 自动部署

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "24"

      - name: Install dependencies
        run: npm install

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy --env production
```

### 设置 GitHub Secrets

在 GitHub 仓库设置中添加：

- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- 其他敏感环境变量

## 🚨 故障排除

### 常见问题

#### 1. 部署失败

**错误**: `Authentication error`
**解决**: 检查是否已正确登录 Cloudflare

```bash
wrangler logout
wrangler login
```

#### 2. 环境变量错误

**错误**: `Missing required environment variable`
**解决**: 检查 `wrangler.toml` 配置

```bash
# 验证配置
wrangler dev --dry-run
```

#### 3. API 请求失败

**错误**: `tempmail.plus API请求失败`
**解决**: 检查 API 凭据是否有效

```bash
# 测试 API 连接
curl -H "Authorization: Bearer your-token" \
  "https://tempmail.plus/api/test"
```

#### 4. 内存或 CPU 超限

**错误**: `Worker exceeded memory/CPU limits`
**解决**: 优化代码或升级到付费计划

### 日志分析

使用 `wrangler tail` 查看详细错误信息：

```bash
# 查看错误日志
wrangler tail --env production | grep ERROR

# 查看特定时间段日志
wrangler tail --since 1h
```

## 📈 性能优化

### 1. 代码优化

- 减少不必要的 API 调用
- 使用 Cloudflare KV 缓存数据
- 优化 JavaScript 代码大小

### 2. 缓存策略

```javascript
// 使用 Cloudflare Cache API
const cache = caches.default;
const cacheKey = new Request(url, request);
let response = await cache.match(cacheKey);

if (!response) {
  response = await fetch(request);
  await cache.put(cacheKey, response.clone());
}
```

### 3. 资源压缩

- 启用 Gzip 压缩
- 压缩 HTML/CSS/JavaScript
- 优化图片资源

## 🔄 版本管理

### 版本发布流程

1. **开发** → 部署到 staging 环境
2. **测试** → 验证功能完整性
3. **发布** → 部署到 production 环境
4. **监控** → 观察生产环境表现

### 回滚操作

如果部署出现问题，可以快速回滚：

```bash
# 查看部署历史
wrangler deployments list

# 回滚到上一版本
wrangler rollback
```

---

## 📞 支持

如需帮助，请：

- 📖 查看 [官方文档](https://developers.cloudflare.com/workers/)
- 🐛 [提交 Issue](https://github.com/your-repo/mailreceive/issues)
- 💬 [社区讨论](https://github.com/your-repo/mailreceive/discussions)

---

✅ **部署完成后，您的 MailReceive 应用就可以在全球范围内高速访问了！**
