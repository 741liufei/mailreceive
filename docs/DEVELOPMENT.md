# 开发指南

本文档为 MailReceive 项目的开发人员提供详细的开发指南和最佳实践。

## 🛠️ 开发环境搭建

### 1. 系统要求

- **操作系统**: Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: v24.4.1+ (推荐使用 nvm 管理版本)
- **npm**: v11.4.2+
- **Git**: 最新版本
- **IDE**: VS Code (推荐) 或其他支持 JavaScript/TypeScript 的编辑器

### 2. 开发工具安装

```bash
# 安装 Node.js 版本管理器 (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装并使用指定版本的 Node.js
nvm install 24.4.1
nvm use 24.4.1

# 验证版本
node --version  # v24.4.1
npm --version   # 11.4.2+
```

### 3. 项目初始化

```bash
# 克隆项目
git clone <repository-url>
cd mailreceive

# 安装依赖
npm install

# 复制环境配置
cp wrangler.toml.example wrangler.toml

# 启动开发服务器
npm run dev
```

## 📁 项目结构详解

```
mailreceive/
├── src/                          # 源代码目录
│   ├── config/                   # 配置模块
│   │   └── regexConfig.js       # 正则表达式配置
│   ├── handlers/                 # 请求处理器
│   │   └── sessionHandler.js   # 会话相关处理器
│   ├── services/                 # 业务服务层
│   │   └── tempMailService.js  # 邮件服务实现
│   ├── utils/                    # 工具类库
│   │   ├── config.js           # 配置管理工具
│   │   ├── response.js         # 响应处理工具
│   │   └── validation.js       # 输入验证工具
│   └── index.js                 # 应用主入口
├── tests/                        # 测试文件目录
│   ├── playwright/              # E2E 测试
│   └── unit/                    # 单元测试
├── docs/                         # 文档目录
│   ├── API.md                   # API 文档
│   ├── DEPLOYMENT.md            # 部署指南
│   └── DEVELOPMENT.md           # 开发指南
├── .github/                      # GitHub 配置
│   └── workflows/               # CI/CD 工作流
├── wrangler.toml                # Cloudflare Workers 配置
├── package.json                 # 项目配置
└── README.md                    # 项目说明
```

## 🏗️ 架构设计

### 1. 分层架构

```
┌─────────────────────────────────────┐
│           前端界面层                  │
│     (HTML + CSS + JavaScript)      │
├─────────────────────────────────────┤
│            路由层                    │
│       (index.js 路由分发)           │
├─────────────────────────────────────┤
│           处理器层                   │
│      (handlers/ 业务逻辑)           │
├─────────────────────────────────────┤
│           服务层                     │
│     (services/ 外部API调用)         │
├─────────────────────────────────────┤
│           工具层                     │
│     (utils/ 通用工具函数)           │
└─────────────────────────────────────┘
```

### 2. 数据流

```
用户请求 → 路由分发 → 处理器 → 服务层 → 外部API → 响应处理 → 用户界面
```

## 💻 核心模块开发

### 1. 服务层 (Services)

服务层负责与外部 API 交互和数据处理。

**tempMailService.js 示例**:

```javascript
class TempMailService {
  constructor() {
    this.config = null;
    this.apiUrl = null;
    this.email = null;
    this.pin = null;
  }

  /**
   * 初始化服务配置
   */
  async initialize(env = {}) {
    try {
      this.config = configManager.getConfig(env);
      this.apiUrl = this.config.emailService.apiUrl;
      this.email = this.config.emailService.actualEmail;
      this.pin = this.config.emailService.actualEmailPin;
    } catch (error) {
      throw new Error(`配置加载失败: ${error.message}`);
    }
  }

  /**
   * 获取邮件列表
   */
  async getEmails(env = {}) {
    await this.initialize(env);

    const response = await fetch(`${this.apiUrl}/mails`, {
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.statusText}`);
    }

    return await response.json();
  }
}
```

### 2. 处理器层 (Handlers)

处理器层负责处理 HTTP 请求和响应。

**sessionHandler.js 示例**:

```javascript
class SessionHandler {
  /**
   * 获取邮件列表
   */
  static async getEmails(request, env) {
    try {
      const url = new URL(request.url);
      const userEmail = url.searchParams.get("userEmail");

      // 参数验证
      if (!userEmail) {
        return ResponseUtil.validationError("缺少必需的userEmail参数");
      }

      // 业务逻辑
      const emails = await tempMailService.getEmails(env);

      return ResponseUtil.success({ emails }, "邮件列表获取成功");
    } catch (error) {
      return ResponseUtil.error(`获取邮件列表失败: ${error.message}`);
    }
  }
}
```

### 3. 工具层 (Utils)

工具层提供通用的工具函数。

**response.js 示例**:

```javascript
class ResponseUtil {
  /**
   * 成功响应
   */
  static success(data = null, message = "操作成功") {
    return new Response(
      JSON.stringify({
        success: true,
        data,
        message,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  /**
   * 错误响应
   */
  static error(message, status = 500) {
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        message,
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
```

## 🔧 开发工作流

### 1. 功能开发流程

1. **需求分析** - 明确功能需求和技术要求
2. **设计阶段** - 设计 API 接口和数据结构
3. **编码实现** - 按照分层架构进行开发
4. **单元测试** - 编写和运行单元测试
5. **集成测试** - 进行端到端测试
6. **代码审查** - 提交 Pull Request 进行审查
7. **部署发布** - 部署到测试/生产环境

### 2. Git 工作流

```bash
# 创建功能分支
git checkout -b feature/email-search

# 开发功能
# ... 编码 ...

# 提交更改
git add .
git commit -m "feat: 添加邮件搜索功能"

# 推送分支
git push origin feature/email-search

# 创建 Pull Request
# ... 在 GitHub 上创建 PR ...
```

### 3. 代码规范

#### JavaScript 编码规范

```javascript
// ✅ 推荐写法
class EmailService {
  constructor() {
    this.apiUrl = null;
  }

  async getEmails(userEmail) {
    try {
      const response = await fetch(`${this.apiUrl}/emails`);
      return await response.json();
    } catch (error) {
      console.error("获取邮件失败:", error);
      throw error;
    }
  }
}

// ❌ 不推荐写法
function getEmails(email) {
  fetch(api_url + "/emails")
    .then((response) => response.json())
    .then((data) => {
      // 处理数据
    })
    .catch((err) => {
      console.log(err);
    });
}
```

#### 注释规范

```javascript
/**
 * 获取邮件列表
 *
 * @param {string} userEmail - 用户邮箱地址
 * @param {Object} options - 可选参数
 * @param {number} options.limit - 返回邮件数量限制
 * @returns {Promise<Array>} 邮件列表
 * @throws {Error} 当API请求失败时抛出错误
 */
async function getEmails(userEmail, options = {}) {
  // 实现逻辑
}
```

## 🧪 测试开发

### 1. 单元测试

使用 Jest 进行单元测试：

```javascript
// tests/unit/tempMailService.test.js
import { TempMailService } from "../../src/services/tempMailService.js";

describe("TempMailService", () => {
  let service;

  beforeEach(() => {
    service = new TempMailService();
  });

  test("应该正确初始化服务", async () => {
    const mockEnv = {
      TEMPMAIL_PLUS_EMAIL: "test@mailto.plus",
      TEMPMAIL_PLUS_PIN: "test123",
    };

    await service.initialize(mockEnv);

    expect(service.email).toBe("test@mailto.plus");
    expect(service.pin).toBe("test123");
  });
});
```

### 2. 集成测试

使用 Playwright 进行 E2E 测试：

```javascript
// tests/playwright/email-flow.test.js
import { test, expect } from "@playwright/test";

test("邮件获取流程", async ({ page }) => {
  await page.goto("http://localhost:8787");

  // 输入邮箱
  await page.fill("#userEmail", "test@example.com");

  // 点击获取邮件
  await page.click('button:text("获取邮件列表")');

  // 验证结果
  await expect(page.locator("#verificationResult")).toBeVisible();
});
```

### 3. 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行 E2E 测试
npm run test:e2e

# 查看测试覆盖率
npm run test:coverage
```

## 🔍 调试技巧

### 1. 本地调试

```bash
# 启动开发服务器（带调试信息）
wrangler dev --log-level debug

# 在另一个终端查看日志
wrangler tail --local
```

### 2. 控制台调试

在代码中添加调试日志：

```javascript
console.log("=== 调试信息 ===");
console.log("用户邮箱:", userEmail);
console.log("API响应:", response);
console.log("=== 调试结束 ===");
```

### 3. 浏览器调试

在浏览器开发者工具中：

1. **Network 面板** - 查看 API 请求和响应
2. **Console 面板** - 查看 JavaScript 错误和日志
3. **Sources 面板** - 设置断点进行调试

## 📦 构建和优化

### 1. 代码分割

```javascript
// 动态导入模块
const { EmailService } = await import("./services/emailService.js");
```

### 2. 性能优化

```javascript
// 使用 Cache API
const cache = caches.default;
const cacheKey = new Request(url);

let response = await cache.match(cacheKey);
if (!response) {
  response = await fetch(request);
  await cache.put(cacheKey, response.clone());
}
```

### 3. 错误处理

```javascript
try {
  const result = await api.call();
  return result;
} catch (error) {
  // 记录错误
  console.error("API调用失败:", error);

  // 返回用户友好的错误
  throw new Error("服务暂时不可用，请稍后重试");
}
```

## 🚀 发布流程

### 1. 版本发布检查清单

- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 文档更新完整
- [ ] 版本号已更新
- [ ] CHANGELOG 已更新

### 2. 发布命令

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 构建项目
npm run build

# 部署到测试环境
npm run deploy:staging

# 测试验证通过后部署到生产环境
npm run deploy:production

# 推送标签
git push origin --tags
```

## 📋 常见问题

### Q: 如何添加新的 API 端点？

1. 在 `src/handlers/` 中创建处理器
2. 在 `src/index.js` 中添加路由
3. 编写测试用例
4. 更新 API 文档

### Q: 如何处理环境变量？

使用 `wrangler.toml` 配置不同环境的变量：

```toml
[env.development.vars]
DEBUG = "true"

[env.production.vars]
DEBUG = "false"
```

### Q: 如何优化性能？

1. 使用 Cloudflare Cache API 缓存响应
2. 减少不必要的 API 调用
3. 压缩 JavaScript 代码
4. 优化正则表达式性能

---

## 📞 开发支持

遇到开发问题？

- 📖 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- 🐛 [提交 Issue](https://github.com/your-repo/mailreceive/issues)
- 💬 [开发讨论](https://github.com/your-repo/mailreceive/discussions)

---

**Happy Coding! 🎉**
