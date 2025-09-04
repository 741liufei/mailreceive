# 🚀 Cloudflare Workers 部署指南

本指南将帮助您将 MailReceive 应用部署到 Cloudflare Workers。

## 📋 前置要求

### 1. 必需工具

- [Node.js](https://nodejs.org/) (版本 16+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare 账户

### 2. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

## 🔧 部署步骤

### 步骤 1: 登录 Cloudflare 账户

```bash
wrangler login
```

按照提示在浏览器中完成登录。

### 步骤 2: 创建 KV 命名空间

```bash
# 创建SESSIONS命名空间
wrangler kv:namespace create "SESSIONS"

# 创建EMAILS命名空间
wrangler kv:namespace create "EMAILS"
```

**重要**: 保存命令输出中的 KV 命名空间 ID，稍后需要更新到`wrangler.toml`文件中。

### 步骤 3: 更新 wrangler.toml 配置

将步骤 2 中获得的 KV 命名空间 ID 替换到`wrangler.toml`文件中的占位符：

```toml
# 替换这些占位符
id = "your-sessions-kv-id"  # 替换为实际的SESSIONS KV命名空间ID
id = "your-emails-kv-id"    # 替换为实际的EMAILS KV命名空间ID
```

### 步骤 4: 设置环境变量

在 Cloudflare Workers 仪表板中设置以下环境变量：

#### 必需环境变量

```bash
TEMPMAIL_PLUS_EMAIL=your-email@tempmail.plus
TEMPMAIL_PLUS_PIN=your-pin-code
```

#### 可选环境变量

```bash
TEMPMAIL_PLUS_API_URL=https://tempmail.plus/api
SESSION_TIMEOUT=1800
VERIFICATION_TIMEOUT=180
MAX_RETRY_ATTEMPTS=3
PIN_LENGTH=8
```

### 步骤 5: 本地测试

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run dev
```

访问 `http://localhost:8787` 测试应用。

### 步骤 6: 部署到 Cloudflare Workers

```bash
# 部署到默认环境
npm run deploy

# 部署到测试环境
npm run deploy:staging

# 部署到生产环境
npm run deploy:production
```

## 🌐 环境配置

### 开发环境

- **URL**: `https://mailreceive-dev.your-subdomain.workers.dev`
- **用途**: 本地开发和测试

### 测试环境

- **URL**: `https://mailreceive-staging.your-subdomain.workers.dev`
- **用途**: 功能测试和集成测试

### 生产环境

- **URL**: `https://mailreceive-prod.your-subdomain.workers.dev`
- **用途**: 正式生产环境

## 🔍 验证部署

### 1. 健康检查

```bash
curl https://your-worker-url.workers.dev/api/health
```

### 2. 配置状态检查

```bash
curl https://your-worker-url.workers.dev/api/config/status
```

### 3. 前端界面测试

访问 `https://your-worker-url.workers.dev` 查看前端界面。

## 🛠️ 环境变量设置

### 通过 Wrangler CLI 设置

```bash
# 设置环境变量
wrangler secret put TEMPMAIL_PLUS_EMAIL
wrangler secret put TEMPMAIL_PLUS_PIN

# 为特定环境设置
wrangler secret put TEMPMAIL_PLUS_EMAIL --env production
wrangler secret put TEMPMAIL_PLUS_PIN --env production
```

### 通过 Cloudflare 仪表板设置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择 Workers & Pages
3. 选择您的 Worker
4. 进入 Settings > Variables
5. 添加环境变量

## 📊 监控和日志

### 查看实时日志

```bash
# 查看所有日志
wrangler tail

# 查看特定环境日志
wrangler tail --env production
```

### 监控指标

- 在 Cloudflare Dashboard 中查看 Worker 性能指标
- 监控 KV 存储使用情况
- 查看错误率和响应时间

## 🔧 故障排除

### 常见问题

#### 1. KV 命名空间错误

```
Error: KV namespace not found
```

**解决方案**: 确保 KV 命名空间 ID 在`wrangler.toml`中正确配置。

#### 2. 环境变量未设置

```
Error: TEMPMAIL_PLUS_EMAIL environment variable not set
```

**解决方案**: 确保所有必需的环境变量都已设置。

#### 3. 部署失败

```
Error: Failed to deploy worker
```

**解决方案**:

- 检查 Wrangler CLI 版本
- 确认 Cloudflare 账户权限
- 验证项目配置

#### 4. CORS 错误

```
Error: CORS policy blocked
```

**解决方案**: 检查 CORS 配置，确保允许的域名正确设置。

### 调试技巧

1. 使用 `wrangler dev` 进行本地调试
2. 查看 `wrangler tail` 输出
3. 检查 Cloudflare Dashboard 中的错误日志
4. 使用浏览器开发者工具检查网络请求

## 🔄 更新部署

### 代码更新

```bash
# 更新代码后重新部署
npm run deploy

# 更新特定环境
npm run deploy:production
```

### 配置更新

```bash
# 更新环境变量
wrangler secret put VARIABLE_NAME

# 重新部署以应用配置更改
npm run deploy
```

## 📈 性能优化

### 1. 启用缓存

- 在 Cloudflare Dashboard 中启用缓存
- 配置适当的缓存规则

### 2. 优化代码

- 减少不必要的依赖
- 优化代码体积
- 使用高效的算法

### 3. 监控性能

- 定期检查响应时间
- 监控内存使用情况
- 优化 KV 存储访问

## 🔒 安全最佳实践

### 1. 环境变量安全

- 不要在代码中硬编码敏感信息
- 使用 Cloudflare Secrets 存储敏感数据
- 定期轮换密钥

### 2. 访问控制

- 限制 API 访问频率
- 实施适当的验证机制
- 监控异常访问

### 3. 数据保护

- 加密敏感数据
- 定期清理过期数据
- 实施数据备份策略

## 📞 支持

如果遇到部署问题：

1. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. 检查 [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
3. 查看项目 [README.md](README.md)
4. 查看 [功能文档](docs/FEATURES.md)

---

**部署指南版本**: v1.0.0  
**最后更新**: 2024-01-01  
**维护者**: MailReceive Team
