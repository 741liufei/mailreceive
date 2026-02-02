# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

MailReceive 是一个基于 Cloudflare Workers 的轻量级临时邮箱接收邮件 Web 应用，专门用于接收邮件并提取验证码。项目使用 JavaScript/ES6+ 语法，采用模块化架构设计。

## 常用命令

### 开发和测试

```bash
# 启动本地开发服务器
npm run dev

# 部署到 Cloudflare Workers
npm run deploy

# 部署到测试环境
npm run deploy:staging

# 部署到生产环境
npm run deploy:production
```

### 环境变量配置

```bash
# 设置必需的环境变量
wrangler secret put TEMPMAIL_PLUS_EMAIL
wrangler secret put TEMPMAIL_PLUS_PIN

# 创建 KV 命名空间
wrangler kv:namespace create "SESSIONS"
wrangler kv:namespace create "EMAILS"
```

### 监控和调试

```bash
# 查看实时日志
wrangler tail

# 查看特定环境日志
wrangler tail --env production
```

## 核心架构

### 技术栈

- **运行时**: Cloudflare Workers (JavaScript/ES6+)
- **存储**: Cloudflare KV (键值存储)
- **API**: tempmail.plus API 集成
- **部署**: Wrangler CLI

### 项目结构

```
src/
├── index.js              # 主入口文件 - 路由分发和请求处理
├── utils/               # 工具类
│   ├── config.js        # 配置管理 - 环境变量和配置验证
│   ├── response.js      # 响应处理 - 统一的API响应格式
│   └── validation.js    # 输入验证 - 邮箱、参数等验证
├── services/            # 服务层
│   └── tempMailService.js  # tempmail.plus API 集成
└── handlers/            # 处理器层
    └── sessionHandler.js   # 邮件查询API处理器
```

### 路由设计

所有路由在 `src/index.js` 中定义，采用 `${method}:${path}` 格式：

- 邮件查询: `/api/session/*` - 邮件列表、邮件详情获取

### 数据存储

项目直接通过 tempmail.plus API 查询邮件，无需本地 KV 存储会话数据。

## 开发规范

### 代码风格

- 使用 ES6+ 语法和模块导入/导出
- 遵循 JSDoc 注释规范
- 统一的错误处理机制
- 完整的输入验证和清理

### 添加新功能

1. 在 `src/services/` 中添加服务类
2. 在 `src/handlers/` 中添加处理器
3. 在 `src/index.js` 中注册路由
4. 更新相关文档

### 错误处理

- 使用 `ResponseUtil.error()` 统一错误响应
- 定义明确的错误类型和错误码
- 记录详细的错误日志

### 安全特性

- 输入验证和清理（防止 XSS 攻击）
- 环境变量敏感信息保护
- 邮箱地址格式验证
- API 参数验证

## 环境配置

### 必需环境变量

- `ACTUAL_EMAIL`: tempmail.plus 邮箱地址
- `ACTUAL_EMAIL_PIN`: tempmail.plus PIN 码

### 可选环境变量

- `EMAIL_API_URL`: API 基础 URL（默认：https://tempmail.plus/api）

## 部署注意事项

### 本地开发

- 通过命令行设置环境变量或创建 `.env` 文件
- 访问 http://localhost:8787 进行测试

### 生产部署

- 使用 `wrangler secret` 设置敏感环境变量
- 配置适当的监控和日志

### 性能优化

- 启用 Cloudflare 缓存
- 优化代码体积和依赖
- 监控 KV 存储使用情况

## 测试建议

### API 测试

```bash
# 健康检查
curl http://localhost:8787/api/health

# 配置状态
curl http://localhost:8787/api/config/status

# 创建会话
curl -X POST http://localhost:8787/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "test@example.com"}'
```

### 功能测试

- 测试邮箱验证功能
- 测试 PIN 码验证
- 测试邮件接收和验证码提取
- 测试会话超时机制

## 故障排除

### 常见问题

- **环境变量未设置**: 确保设置了 `TEMPMAIL_PLUS_EMAIL` 和 `TEMPMAIL_PLUS_PIN`
- **KV 命名空间错误**: 检查 `wrangler.toml` 中的 KV ID 配置
- **API 调用失败**: 验证 tempmail.plus 配置和网络连接
- **CORS 错误**: 检查请求头和跨域配置

### 调试技巧

- 使用 `wrangler dev` 进行本地调试
- 查看 `wrangler tail` 实时日志
- 使用浏览器开发者工具检查网络请求
- 检查 Cloudflare Dashboard 中的错误日志
