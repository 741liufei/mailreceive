# 📧 MailReceive - 轻量级临时邮箱接收邮件 Web 应用

一个基于 Cloudflare Workers 的轻量级临时邮箱接收邮件 Web 应用，支持通过 tempmail.plus 服务接收邮件并提取验证码。

## 🎯 项目概述

MailReceive 是一个专为 Cloudflare Workers 环境设计的轻量级应用，具有以下特点：

- **轻量化设计**: 无数据库依赖，使用 Cloudflare KV 存储
- **高性能**: 基于边缘计算，全球 CDN 加速
- **易部署**: 一键部署到 Cloudflare Workers
- **配置灵活**: 支持环境变量配置 tempmail.plus 邮箱和 PIN 码
- **安全可靠**: 完整的输入验证和错误处理

## ✨ 核心功能

### 1. 临时邮箱会话管理

- 用户输入邮箱地址
- 系统生成临时邮箱会话
- 提供会话 ID、临时邮箱地址和 PIN 码

### 2. PIN 码验证

- 验证用户提供的 PIN 码
- 确保会话安全性
- 支持会话状态管理

### 3. 邮件接收和解析

- 自动接收邮件
- 智能提取验证码
- 支持多种验证码格式

### 4. 配置管理

- 环境变量配置
- 配置验证和热更新
- 健康检查功能

## 🏗️ 技术架构

### 技术栈

- **运行时**: Cloudflare Workers (JavaScript/TypeScript)
- **存储**: Cloudflare KV (键值存储)
- **API**: tempmail.plus API 集成
- **前端**: 纯 HTML/CSS/JavaScript
- **部署**: Cloudflare Pages + Workers

### 项目结构

```
mailreceive/
├── src/
│   ├── utils/           # 工具类
│   │   ├── config.js    # 配置管理
│   │   ├── response.js  # 响应处理
│   │   └── validation.js # 输入验证
│   ├── services/        # 服务层
│   │   ├── tempMailService.js  # tempmail.plus服务
│   │   └── sessionService.js   # 会话管理
│   ├── handlers/        # 处理器
│   │   ├── configHandler.js    # 配置处理器
│   │   └── sessionHandler.js   # 会话处理器
│   └── index.js         # 主入口文件
├── public/              # 静态文件
├── wrangler.toml        # Cloudflare Workers配置
├── package.json         # 项目配置
└── README.md           # 项目文档
```

## 🚀 快速开始

### 1. 环境准备

确保您已安装以下工具：

- [Node.js](https://nodejs.org/) (版本 16+)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### 2. 项目设置

```bash
# 克隆项目
git clone <repository-url>
cd mailreceive

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

### 3. 配置环境变量

在 Cloudflare Workers 中设置以下环境变量：

```bash
# tempmail.plus配置
ACTUAL_EMAIL=your-email@tempmail.plus
ACTUAL_EMAIL_PIN=your-pin-code
EMAIL_API_URL=https://tempmail.plus/api
```

### 4. 创建 KV 命名空间

```bash
# 创建SESSIONS命名空间
wrangler kv:namespace create "SESSIONS"

# 创建EMAILS命名空间
wrangler kv:namespace create "EMAILS"
```

### 5. 更新 wrangler.toml

将生成的 KV 命名空间 ID 更新到`wrangler.toml`文件中：

```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-sessions-kv-id"
preview_id = "your-sessions-preview-kv-id"

[[kv_namespaces]]
binding = "EMAILS"
id = "your-emails-kv-id"
preview_id = "your-emails-preview-kv-id"
```

### 6. 本地开发

```bash
# 启动本地开发服务器
npm run dev
```

### 7. 部署

```bash
# 部署到Cloudflare Workers
npm run deploy

# 部署到生产环境
npm run deploy:production
```

## 📚 API 文档

### 配置相关 API

#### 获取配置状态

```http
GET /api/config/status
```

**响应示例:**

```json
{
  "code": 200,
  "message": "配置状态获取成功",
  "data": {
    "configured": true,
    "emailAddress": "user@tempmail.plus",
    "configValid": true,
    "sessionTimeout": 1800,
    "verificationTimeout": 180
  },
  "success": true,
  "timestamp": 1640995200000
}
```

#### 验证配置

```http
GET /api/config/validate
```

#### 健康检查

```http
GET /api/health
```

### API 类型

#### 获取邮件列表

```http
GET /api/session/emails?userEmail=user@example.com
```

#### 获取邮件详情

```http
GET /api/session/email-detail?userEmail=user@example.com&emailId=123456
```

## 🔧 配置说明

### 环境变量配置

| 变量名             | 类型   | 必需 | 默认值                      | 说明                   |
| ------------------ | ------ | ---- | --------------------------- | ---------------------- |
| `ACTUAL_EMAIL`     | string | ✅   | -                           | tempmail.plus 邮箱地址 |
| `ACTUAL_EMAIL_PIN` | string | ✅   | -                           | tempmail.plus PIN 码   |
| `EMAIL_API_URL`    | string | ❌   | `https://tempmail.plus/api` | API 基础 URL           |

### 验证码格式支持

系统支持以下验证码格式：

- 6 位数字: `123456`
- 4 位数字: `1234`
- 8 位数字: `12345678`
- 字母数字混合(6-8 位): `ABC123`
- 带连字符: `123-456`
- 带空格: `123 456`

## 🛡️ 安全特性

### 输入验证

- 邮箱地址格式验证
- PIN 码格式验证
- 会话 ID 格式验证
- 超时时间范围验证

### 数据清理

- XSS 防护
- 输入数据清理
- 敏感信息过滤

### 会话管理

- 会话超时机制
- 自动清理过期会话
- PIN 码验证

## 🧪 测试

### 本地测试

```bash
# 启动本地开发服务器
npm run dev

# 测试配置状态
curl http://localhost:8787/api/config/status

# 测试健康检查
curl http://localhost:8787/api/health
```

### API 测试示例

```bash
# 创建会话
curl -X POST http://localhost:8787/api/session/emails?userEmail=test@example.com

# 获取邮件详情
curl -X GET http://localhost:8787/api/session/email-detail?userEmail=test@example.com&emailId=123456
```

## 📝 开发指南

### 代码规范

- 使用 ES6+语法
- 遵循 JSDoc 注释规范
- 统一的错误处理机制
- 完整的输入验证

### 添加新功能

1. 在`src/services/`中添加服务类
2. 在`src/handlers/`中添加处理器
3. 在`src/index.js`中注册路由
4. 更新 API 文档

### 调试技巧

- 使用`console.log()`进行调试
- 查看 Cloudflare Workers 日志
- 使用 Wrangler 本地开发模式

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 故障排除

### 常见问题

#### 1. 配置验证失败

- 检查环境变量是否正确设置
- 确认 tempmail.plus 邮箱和 PIN 码有效
- 验证 API URL 是否可访问

#### 2. KV 存储错误

- 确认 KV 命名空间已创建
- 检查 wrangler.toml 配置
- 验证 KV 绑定是否正确

#### 3. 部署失败

- 检查 Wrangler CLI 版本
- 确认 Cloudflare 账户权限
- 验证项目配置

### 日志查看

```bash
# 查看实时日志
wrangler tail

# 查看特定环境日志
wrangler tail --env production
```

## 📞 支持

如果您遇到问题或有建议，请：

1. 查看[故障排除](#故障排除)部分
2. 搜索[Issues](../../issues)
3. 创建新的 Issue

## 🔄 更新日志

### v1.0.0 (2024-01-01)

- ✨ 初始版本发布
- 🎯 核心功能实现
- 📚 完整文档
- 🛡️ 安全特性
- 🚀 Cloudflare Workers 部署支持

---

**Made with ❤️ by MailReceive Team**
