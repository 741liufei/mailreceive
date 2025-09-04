# 📧 MailReceive

> 轻量级临时邮箱接收邮件 Web 应用 - 基于 Cloudflare Workers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-green)](https://nodejs.org/)

## 🚀 项目简介

MailReceive 是一个基于 Cloudflare Workers 的轻量级临时邮箱服务，专为需要临时接收邮件和验证码的用户设计。采用 Serverless 架构，实现了无数据库依赖的高性能邮件接收和处理服务。

### ✨ 核心特性

- 🎯 **临时邮箱服务** - 快速获取临时邮箱，接收验证码和邮件
- 🔍 **智能验证码提取** - 自动识别和提取邮件中的验证码
- 📱 **响应式界面** - 支持桌面和移动设备的优雅体验
- ⚡ **边缘计算** - 基于 Cloudflare Workers 的全球分布式部署
- 🛡️ **安全可靠** - 输入验证、XSS 防护、会话管理
- 🚀 **零数据库** - 无需数据库，轻量级部署

## 🌐 在线演示

- **生产环境**: https://mailreceive.441491549.workers.dev

## 🏗️ 技术架构

### 架构图

```
用户请求 → Cloudflare Workers → tempmail.plus API → 邮件处理 → 响应用户
    ↓                ↓                    ↓
 Web界面        边缘计算处理          验证码提取
```

### 技术栈

- **运行时**: Cloudflare Workers (JavaScript/ES6+)
- **前端**: 纯 HTML/CSS/JavaScript (无框架依赖)
- **API**: tempmail.plus API 集成
- **部署**: Cloudflare Workers 边缘计算
- **开发工具**: Wrangler CLI v4.33.2+
- **测试**: Playwright v1.55.0+

### 核心组件

- **🎯 邮件服务 (`tempMailService`)** - 邮件获取和内容解析
- **📋 请求处理器 (`sessionHandler`)** - API 路由处理
- **🔧 工具类 (`utils`)** - 响应处理、验证、配置管理
- **⚙️ 配置管理 (`config`)** - 环境变量和正则表达式配置

## 🛠️ 快速开始

### 环境要求

- Node.js v16+ (推荐 v24.4.1)
- npm v11.4.2+
- Cloudflare 账户

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd mailreceive

# 安装依赖
npm install

# 登录 Cloudflare (如果未登录)
npx wrangler login
```

### 环境配置

编辑 `wrangler.toml` 文件配置环境变量：

```toml
[vars]
TEMPMAIL_PLUS_EMAIL = "your-email@mailto.plus"
TEMPMAIL_PLUS_PIN = "your-pin-code"
TEMPMAIL_PLUS_API_URL = "https://tempmail.plus/api"
SESSION_TIMEOUT = "1800"
VERIFICATION_TIMEOUT = "180"
MAX_RETRY_ATTEMPTS = "3"
PIN_LENGTH = "8"
```

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 访问应用
# http://localhost:8787
```

### 部署

```bash
# 部署到生产环境
npm run deploy

# 部署到测试环境
npm run deploy:staging

# 部署到生产环境
npm run deploy:production
```

## 📚 API 文档

### 邮件列表 API

```http
GET /api/session/emails?userEmail={email}
```

**参数**:

- `userEmail`: 用户邮箱地址

**响应**:

```json
{
  "success": true,
  "data": {
    "emails": [
      {
        "id": "email_id",
        "subject": "邮件主题",
        "from": "sender@example.com",
        "date": "2024-01-01T00:00:00.000Z",
        "preview": "邮件预览",
        "isNew": true,
        "attachmentCount": 0
      }
    ]
  },
  "message": "邮件列表获取成功"
}
```

### 邮件详情 API

```http
GET /api/session/email-detail?userEmail={email}&emailId={id}
```

**参数**:

- `userEmail`: 用户邮箱地址
- `emailId`: 邮件 ID

**响应**:

```json
{
  "success": true,
  "data": {
    "id": "email_id",
    "subject": "邮件主题",
    "from": "sender@example.com",
    "date": "2024-01-01T00:00:00.000Z",
    "content": "邮件HTML内容",
    "text": "邮件文本内容",
    "html": "邮件HTML内容"
  },
  "message": "邮件详情获取成功"
}
```

## 🎨 功能特性

### 邮件管理

- ✅ 获取邮件列表
- ✅ 查看邮件详情
- ✅ 邮件内容渲染
- ✅ 按邮箱后缀筛选

### 验证码提取

- ✅ 自动识别验证码
- ✅ 多种正则表达式模式
- ✅ 批量验证码提取
- ✅ 验证码复制功能

### 用户界面

- ✅ 响应式设计
- ✅ 直观的操作流程
- ✅ 实时状态反馈
- ✅ 错误处理提示

## 🔧 项目结构

```
mailreceive/
├── src/                          # 源代码目录
│   ├── config/                   # 配置模块
│   │   └── regexConfig.js       # 正则表达式配置
│   ├── handlers/                 # 请求处理器
│   │   └── sessionHandler.js   # 会话处理器
│   ├── services/                 # 业务服务层
│   │   └── tempMailService.js  # 邮件服务
│   ├── utils/                    # 工具类
│   │   ├── config.js           # 配置管理
│   │   ├── response.js         # 响应工具
│   │   └── validation.js       # 验证工具
│   └── index.js                 # 主入口文件
├── tests/                        # 测试文件
├── wrangler.toml                # Cloudflare Workers 配置
├── package.json                 # 项目配置
└── README.md                    # 项目文档
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行浏览器可见测试
npm run test:headed

# 运行 Chromium 测试
npm run test:chromium

# 查看测试报告
npm run test:report
```

## 🔒 安全特性

### 输入验证

- ✅ 邮箱格式验证
- ✅ 输入数据清理
- ✅ XSS 防护
- ✅ 参数验证

### 会话管理

- ✅ 超时机制
- ✅ 自动清理
- ✅ 安全头设置

## 📊 性能优化

### 边缘计算

- ⚡ 全球分布式部署
- ⚡ 低延迟响应
- ⚡ 自动缓存优化

### 代码优化

- 📦 轻量级打包 (77.10 KiB)
- 📦 Gzip 压缩 (14.17 KiB)
- 📦 无外部依赖

## 🐛 故障排除

### 常见问题

**Q: 部署时出现环境变量错误？**
A: 检查 `wrangler.toml` 中的环境变量配置是否正确。

**Q: 邮件获取失败？**
A: 确认 tempmail.plus API 凭据是否有效。

**Q: 本地开发时无法访问？**
A: 确保端口 8787 未被占用，检查防火墙设置。

### 调试模式

```bash
# 启用详细日志
wrangler dev --log-level debug
```

## 🤝 贡献指南

### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 使用 ES6+ 语法
- 遵循模块化设计原则
- 添加适当的注释
- 保持代码简洁可读

## 📋 更新日志

### v1.0.0 (2024-01-01)

- ✨ 初始版本发布
- ✨ 基础邮件接收功能
- ✨ 验证码提取功能
- ✨ Cloudflare Workers 部署

## 📞 支持与反馈

如果你在使用过程中遇到问题或有改进建议，请：

- 🐛 [提交 Issue](https://github.com/your-repo/mailreceive/issues)
- 💡 [功能建议](https://github.com/your-repo/mailreceive/discussions)
- 📧 邮件联系: your-email@example.com

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 查看 LICENSE 文件了解详情。

---

<p align="center">
  <b>⭐ 如果这个项目对你有帮助，请给它一个星标！</b>
</p>

<p align="center">
  Made with ❤️ by MailReceive Team
</p>
