# 📋 MailReceive 功能文档

本文档详细说明了MailReceive应用的各个功能模块、实现细节和技术特性。

## 🏗️ 架构概览

MailReceive采用分层架构设计，包含以下主要层次：

```
┌─────────────────────────────────────┐
│           前端界面层                  │
│        (HTML/CSS/JavaScript)        │
├─────────────────────────────────────┤
│           路由分发层                  │
│         (index.js - 主入口)          │
├─────────────────────────────────────┤
│           处理器层                    │
│    (configHandler.js, sessionHandler.js) │
├─────────────────────────────────────┤
│           服务层                      │
│ (tempMailService.js, sessionService.js) │
├─────────────────────────────────────┤
│           工具层                      │
│ (config.js, response.js, validation.js) │
├─────────────────────────────────────┤
│           存储层                      │
│         (Cloudflare KV)              │
└─────────────────────────────────────┘
```

## 🔧 核心功能模块

### 1. 配置管理模块 (`src/utils/config.js`)

#### 功能描述
负责管理应用的所有配置项，包括环境变量验证、配置加载和验证。

#### 主要功能
- **配置加载**: 从环境变量加载配置信息
- **配置验证**: 验证配置的有效性和完整性
- **配置缓存**: 缓存配置信息，提高性能
- **配置热更新**: 支持配置的动态重新加载

#### 配置项说明
```javascript
{
  tempMail: {
    email: "配置的临时邮箱地址",
    pin: "配置的PIN码",
    apiUrl: "API基础URL"
  },
  session: {
    timeout: 1800,        // 会话超时时间(秒)
    verificationTimeout: 180  // 验证码等待超时(秒)
  },
  app: {
    maxRetryAttempts: 3,  // 最大重试次数
    pinLength: 8          // PIN码长度
  }
}
```

#### 验证规则
- 邮箱地址格式验证
- PIN码格式验证（6-12位字母数字）
- 超时时间范围验证
- 必需字段检查

### 2. 响应处理模块 (`src/utils/response.js`)

#### 功能描述
提供统一的API响应格式处理，确保所有API接口返回一致的响应格式。

#### 响应格式
```javascript
{
  code: 200,              // HTTP状态码
  message: "操作成功",     // 响应消息
  data: {},               // 响应数据
  success: true,          // 操作是否成功
  timestamp: 1640995200000 // 时间戳
}
```

#### 支持的响应类型
- 成功响应 (`success`)
- 错误响应 (`error`)
- 配置错误响应 (`configError`)
- 验证错误响应 (`validationError`)
- CORS预检响应 (`corsPreflight`)
- JSON响应 (`json`)
- HTML响应 (`html`)
- 文本响应 (`text`)

### 3. 输入验证模块 (`src/utils/validation.js`)

#### 功能描述
提供各种输入验证功能，确保所有用户输入和API参数都经过严格验证。

#### 验证功能
- **邮箱验证**: 验证邮箱地址格式
- **PIN码验证**: 验证PIN码格式和长度
- **会话ID验证**: 验证会话ID格式
- **超时验证**: 验证超时时间范围
- **必需字段验证**: 检查必需字段是否存在

#### 验证规则
```javascript
const VALIDATION_RULES = {
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    minLength: 5
  },
  PIN: {
    pattern: /^[a-zA-Z0-9]{6,12}$/,
    maxLength: 12,
    minLength: 6
  },
  SESSION_ID: {
    pattern: /^[a-zA-Z0-9]{16,32}$/,
    maxLength: 32,
    minLength: 16
  }
};
```

### 4. Tempmail.plus服务模块 (`src/services/tempMailService.js`)

#### 功能描述
负责与tempmail.plus API的交互，包括邮件接收、验证码提取等功能。

#### 核心功能
- **邮箱配置**: 使用配置的邮箱地址和PIN码
- **邮件接收**: 从tempmail.plus获取邮件列表
- **邮件内容获取**: 获取特定邮件的详细内容
- **验证码提取**: 从邮件内容中智能提取验证码
- **轮询等待**: 等待并获取验证码邮件

#### 验证码提取算法
支持多种验证码格式：
```javascript
const patterns = [
  /\b\d{6}\b/g,           // 6位数字
  /\b\d{4}\b/g,           // 4位数字
  /\b\d{8}\b/g,           // 8位数字
  /\b[a-zA-Z0-9]{6,8}\b/g, // 字母数字混合
  /\b\d{3}-\d{3}\b/g,     // 带连字符
  /\b\d{3}\s\d{3}\b/g     // 带空格
];
```

#### API集成
- 邮箱验证API
- 邮件列表API
- 邮件内容API
- 邮箱状态API
- 邮箱清理API

### 5. 会话管理模块 (`src/services/sessionService.js`)

#### 功能描述
负责管理用户会话，包括会话创建、存储、验证、清理等功能。

#### 会话生命周期
1. **创建**: 用户输入邮箱地址，系统创建会话
2. **验证**: 用户验证PIN码，激活会话
3. **使用**: 用户获取邮件和验证码
4. **过期**: 会话超时，自动失效
5. **清理**: 删除会话数据

#### 会话数据结构
```javascript
{
  sessionId: "唯一会话ID",
  userEmail: "用户邮箱地址",
  tempEmail: "临时邮箱地址",
  pinCode: "PIN码",
  createdAt: "创建时间",
  expiresAt: "过期时间",
  status: "会话状态",
  verified: false,
  verificationCode: null,
  emailCount: 0,
  lastChecked: "最后检查时间"
}
```

#### 存储机制
- 使用Cloudflare KV存储会话数据
- 支持会话超时自动清理
- 会话状态实时更新

### 6. 配置处理器 (`src/handlers/configHandler.js`)

#### 功能描述
处理配置相关的API请求，提供配置状态查询和验证功能。

#### API接口
- `GET /api/config/status`: 获取配置状态
- `GET /api/config/validate`: 验证配置有效性
- `POST /api/config/reload`: 重新加载配置
- `GET /api/config/details`: 获取配置详情
- `GET /api/health`: 健康检查

#### 健康检查功能
检查以下组件状态：
- 配置有效性
- 服务连接状态
- 整体系统健康

### 7. 会话处理器 (`src/handlers/sessionHandler.js`)

#### 功能描述
处理会话相关的API请求，提供完整的会话生命周期管理。

#### API接口
- `POST /api/session/create`: 创建新会话
- `POST /api/session/verify-pin`: 验证PIN码
- `GET /api/session/emails`: 获取邮件列表
- `GET /api/session/verification-code`: 获取验证码
- `GET /api/session/status`: 获取会话状态
- `DELETE /api/session/cleanup`: 清理会话
- `GET /api/session/stats`: 获取会话统计
- `GET /api/session/validity`: 检查会话有效性

#### 请求处理流程
1. **参数解析**: 解析请求参数
2. **输入验证**: 验证输入数据
3. **数据清理**: 清理和标准化输入
4. **业务处理**: 调用相应的服务方法
5. **响应生成**: 生成统一的响应格式

## 🎨 前端界面

### 界面设计
- **现代化设计**: 使用渐变背景和卡片式布局
- **响应式布局**: 适配不同屏幕尺寸
- **用户友好**: 清晰的操作流程和状态反馈

### 主要功能
- **邮箱输入**: 用户输入邮箱地址
- **会话创建**: 一键创建临时邮箱会话
- **信息展示**: 显示会话ID、临时邮箱、PIN码
- **PIN验证**: 验证PIN码功能
- **验证码获取**: 等待并获取验证码
- **状态反馈**: 实时显示操作结果

### 交互流程
1. 用户输入邮箱地址
2. 点击"创建临时邮箱会话"
3. 系统显示会话信息
4. 用户验证PIN码
5. 用户获取验证码
6. 显示验证码结果

## 🔒 安全特性

### 输入验证
- **格式验证**: 验证邮箱、PIN码等格式
- **长度验证**: 检查字段长度限制
- **类型验证**: 确保数据类型正确
- **范围验证**: 验证数值范围

### 数据清理
- **XSS防护**: 清理HTML标签
- **输入标准化**: 统一输入格式
- **敏感信息过滤**: 过滤敏感数据

### 会话安全
- **会话超时**: 自动过期机制
- **PIN验证**: 强制PIN码验证
- **状态管理**: 严格的会话状态控制

## 📊 性能优化

### 缓存策略
- **配置缓存**: 缓存配置信息
- **响应缓存**: 缓存API响应
- **会话缓存**: 缓存会话数据

### 异步处理
- **非阻塞操作**: 使用异步处理
- **并发控制**: 控制并发请求
- **超时处理**: 设置合理的超时时间

### 资源优化
- **代码压缩**: 最小化代码体积
- **依赖优化**: 减少不必要的依赖
- **内存管理**: 及时释放内存

## 🧪 测试策略

### 单元测试
- **工具类测试**: 测试配置、验证、响应工具
- **服务类测试**: 测试服务层功能
- **处理器测试**: 测试API处理器

### 集成测试
- **API测试**: 测试完整的API流程
- **端到端测试**: 测试用户操作流程
- **性能测试**: 测试系统性能

### 测试工具
- **本地测试**: 使用Wrangler本地开发
- **API测试**: 使用curl或Postman
- **浏览器测试**: 使用浏览器开发者工具

## 🔧 部署配置

### 环境变量
```bash
# 必需配置
TEMPMAIL_PLUS_EMAIL=your-email@tempmail.plus
TEMPMAIL_PLUS_PIN=your-pin-code

# 可选配置
TEMPMAIL_PLUS_API_URL=https://tempmail.plus/api
SESSION_TIMEOUT=1800
VERIFICATION_TIMEOUT=180
MAX_RETRY_ATTEMPTS=3
PIN_LENGTH=8
```

### KV存储配置
```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-sessions-kv-id"

[[kv_namespaces]]
binding = "EMAILS"
id = "your-emails-kv-id"
```

### 部署命令
```bash
# 本地开发
npm run dev

# 部署到Cloudflare Workers
npm run deploy

# 部署到生产环境
npm run deploy:production
```

## 📈 监控和日志

### 日志记录
- **请求日志**: 记录所有API请求
- **错误日志**: 记录错误信息
- **性能日志**: 记录性能指标

### 监控指标
- **响应时间**: 监控API响应时间
- **错误率**: 监控错误发生率
- **使用量**: 监控资源使用情况

### 告警机制
- **配置错误**: 配置验证失败告警
- **服务异常**: 服务连接失败告警
- **性能告警**: 性能指标异常告警

## 🔄 版本管理

### 版本号规则
- **主版本号**: 重大功能变更
- **次版本号**: 新功能添加
- **修订版本号**: 错误修复

### 更新日志
- **功能更新**: 记录新功能
- **错误修复**: 记录错误修复
- **性能优化**: 记录性能改进

## 🤝 扩展性

### 模块化设计
- **松耦合**: 模块间低耦合
- **高内聚**: 模块内高内聚
- **可扩展**: 易于添加新功能

### 插件机制
- **服务插件**: 支持新的邮件服务
- **验证插件**: 支持新的验证码格式
- **存储插件**: 支持新的存储后端

### 配置扩展
- **环境配置**: 支持多环境配置
- **动态配置**: 支持运行时配置
- **自定义配置**: 支持用户自定义配置

---

**文档版本**: v1.0.0  
**最后更新**: 2024-01-01  
**维护者**: MailReceive Team
