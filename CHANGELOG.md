# 更新日志

本文档记录了 MailReceive 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 计划添加

- 邮件搜索功能
- 邮件自动刷新
- 多语言支持
- 邮件导出功能

## [1.1.0] - 2024-01-02

### 新增

- ✨ **GitHub 验证码支持** - 新增对 GitHub 格式验证码的识别
  - 支持 "launch code" 格式（8 位数字）
  - 支持 "entering the code below" 格式
  - 自动识别 GitHub 注册/登录验证码
- ✨ **专用的 GitHub 验证码按钮** ⭐
  - 🐙 GitHub 风格的紫黑色渐变按钮
  - 智能筛选 GitHub 验证码邮件
  - 自动排除通知类邮件（OAuth、安全警报等）
  - GitHub 品牌色的结果展示界面
- ✨ **增强的正则表达式配置**
  - 新增 `GITHUB_LAUNCH_CODE` 模式
  - 新增 `GITHUB_ENTERING_CODE` 模式
  - 新增 `EIGHT_DIGITS` 独立 8 位数字模式
- 📝 **完善的文档**
  - 新增 `docs/VERIFICATION_CODE_EXTRACTION.md` 验证码提取功能文档
  - 新增 `docs/TEMPMAIL_API.md` tempmail.plus API 技术文档
  - 新增 `docs/GITHUB_CODE_FEATURE.md` GitHub 验证码功能说明
  - 更新 README.md 说明新功能
- 🧪 **测试支持**
  - 新增 `tests/test-github-code.js` GitHub 验证码测试文件
  - 验证 GitHub 格式验证码提取功能

### 改进

- 🔧 优化验证码提取优先级顺序
- 🔧 提升 8 位数字验证码的识别准确度
- 🔧 智能邮件筛选，排除通知类邮件
- 🔧 详细的错误提示和调试信息
- 📝 完善代码注释和文档说明
- 🎨 响应式按钮布局（支持自动换行）

### 技术细节

**支持的 GitHub 验证码格式示例**：
```
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003
```

**新增的正则表达式模式**：
- `launch code[\s\S]*?(\d{8})` - 匹配 launch code 后的 8 位数字
- `entering the code below:\s*(\d{8})` - 匹配 entering the code below 后的 8 位数字
- `\b\d{8}\b` - 匹配独立的 8 位数字

**邮件筛选逻辑**：
- 发件人包含 `github.com` 或 `github`
- 主题包含验证码关键词（verification、code、launch 等）
- 自动排除通知类邮件（oauth、application、security alert 等）

---

## [1.0.0] - 2024-01-01

### 新增

- ✨ 基础邮件接收功能
- ✨ 智能验证码提取
- ✨ 响应式用户界面
- ✨ Cloudflare Workers 部署支持
- ✨ 多环境配置管理
- ✨ API 文档和开发指南
- ✨ 自动化测试框架

### 功能特性

- 📧 **邮件管理**

  - 获取邮件列表
  - 查看邮件详情
  - 按邮箱后缀筛选
  - 邮件内容直接渲染

- 🔍 **验证码提取**

  - 自动识别验证码
  - 支持多种正则表达式模式
  - 批量验证码提取
  - 一键复制功能

- 🎨 **用户界面**

  - 现代化设计风格
  - 响应式布局
  - 实时状态反馈
  - 错误处理提示

- 🚀 **技术架构**
  - Serverless 架构
  - 边缘计算优化
  - 无数据库设计
  - ES6+ 模块化

### 技术实现

- 🏗️ 基于 Cloudflare Workers 的轻量级架构
- 📱 纯 HTML/CSS/JavaScript 前端实现
- 🔧 模块化代码结构设计
- 🧪 Playwright E2E 测试集成
- 📋 完整的 API 文档

### 安全特性

- 🛡️ 输入验证和 XSS 防护
- 🔒 安全的环境变量管理
- 🚨 错误处理和日志记录
- ⏱️ 会话超时机制

### 性能优化

- ⚡ 全球 CDN 分发
- 📦 代码压缩优化 (77.10 KiB → 14.17 KiB)
- 🚀 边缘计算加速
- 💾 智能缓存策略

---

## 版本说明

### 版本号规则

- **主版本号 (Major)**: 不兼容的 API 修改
- **次版本号 (Minor)**: 向下兼容的功能性新增
- **修订号 (Patch)**: 向下兼容的问题修正

### 变更类型

- `新增` (Added): 新功能
- `变更` (Changed): 对现有功能的变更
- `弃用` (Deprecated): 不久将被移除的功能
- `移除` (Removed): 已移除的功能
- `修复` (Fixed): 任何 bug 修复
- `安全` (Security): 修复安全问题
