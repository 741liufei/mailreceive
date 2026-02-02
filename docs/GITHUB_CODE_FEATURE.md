# GitHub 验证码获取功能说明

本文档说明了"获取 GitHub 验证码"功能的使用方法和注意事项。

## 📋 功能概述

"🐙 获取GitHub验证码"按钮专门用于从 GitHub 发送的验证码邮件中提取验证码，支持以下场景：

- ✅ GitHub 账号注册验证码
- ✅ GitHub 登录验证码
- ✅ GitHub 双因素认证（2FA）验证码
- ✅ GitHub 邮箱验证码

---

## 🎯 使用方法

### 步骤 1：输入邮箱地址

在"您的邮箱地址"输入框中输入接收 GitHub 验证码的邮箱地址。

### 步骤 2：点击按钮

点击"🐙 获取GitHub验证码"按钮（紫黑色渐变按钮）。

### 步骤 3：查看结果

系统会自动：
1. 获取所有邮件列表
2. 筛选出 GitHub 发送的验证码邮件
3. 提取最新邮件中的验证码
4. 以 GitHub 风格显示验证码

---

## 🔍 邮件筛选逻辑

### 筛选条件

系统会筛选同时满足以下条件的邮件：

#### 1. 发件人验证
- 发件人邮箱包含 `github.com` 或 `github`

#### 2. 主题关键词（满足任一即可）
- `verification` - 验证
- `verify` - 验证
- `code` - 验证码
- `launch` - 启动码
- `sign` - 登录/注册
- `confirm` - 确认
- `验证` - 中文验证

#### 3. 排除通知类邮件
系统会自动排除以下类型的邮件：
- ❌ OAuth 应用通知（`oauth`, `application`）
- ❌ 账户添加通知（`added to your account`）
- ❌ 安全警报（`security alert`）
- ❌ 其他通知类邮件（`通知`）

### 示例

**✅ 会被识别的邮件主题**：
- `[GitHub] Please verify your device`
- `Here's your GitHub launch code!`
- `Your GitHub verification code`
- `Sign in to GitHub`
- `Confirm your email address`

**❌ 会被排除的邮件主题**：
- `[GitHub] A third-party OAuth application has been added to your account`
- `[GitHub] Security alert: new sign-in`
- `[GitHub] Your account has been updated`

---

## 📧 支持的验证码格式

### GitHub 标准格式

```
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003
```

**提取结果**：`70685003`

### 其他支持格式

- 8 位数字：`12345678`
- 6 位数字：`123456`
- 标准格式：`Your verification code is: 123456`

---

## 🎨 界面特点

### 按钮样式
- **颜色**：GitHub 紫色到黑色渐变 (#6e5494 → #24292e)
- **图标**：🐙 GitHub 章鱼猫
- **位置**：在"获取Augment验证码"按钮右侧

### 结果显示
- **主题色**：GitHub 紫色 (#6e5494)
- **字体**：等宽字体（Courier New）
- **字号**：32px，字间距 4px
- **边框**：紫色虚线边框

---

## ⚠️ 常见问题

### Q1: 提示"未找到来自 GitHub 的验证码邮件"

**原因**：
- 邮箱中没有 GitHub 发送的验证码邮件
- 只有通知类邮件（如 OAuth 应用添加通知）

**解决方案**：
1. 确认邮箱中是否有 GitHub 验证码邮件
2. 点击"获取邮件列表"查看所有邮件
3. 手动点击包含验证码的邮件查看详情

### Q2: 提示"在 GitHub 邮件中未找到验证码"

**原因**：
- 邮件内容格式不符合已知的验证码模式
- 邮件是其他类型的 GitHub 邮件

**解决方案**：
1. 查看错误信息中的"邮件内容预览"
2. 确认邮件中是否真的包含验证码
3. 如果验证码格式特殊，可以手动查看邮件详情

### Q3: 如何查看所有 GitHub 邮件？

**方法 1**：使用"获取邮件列表"按钮
1. 点击"获取邮件列表"
2. 在列表中找到 GitHub 邮件
3. 点击邮件查看详情

**方法 2**：查看控制台日志
1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 查看"GitHub 验证码邮件列表"日志

---

## 🔧 调试信息

### 控制台日志

点击"🐙 获取GitHub验证码"按钮后，控制台会输出以下信息：

```javascript
// 筛选结果
找到 GitHub 验证码邮件数量: 2
GitHub 验证码邮件列表: ["Here's your GitHub launch code!", "Verify your email"]

// 最新邮件
最新 GitHub 邮件: {id: "...", subject: "...", from: "..."}

// 内容检查
原始内容长度: 1234
原始内容(前300字符): "Here's your GitHub..."
是否包含 launch code: true
是否包含 entering the code: true

// 提取结果
GitHub 验证码提取结果: {success: true, code: "70685003", ...}
✅ GitHub 验证码提取成功: 70685003
使用的模式: GitHub 模式：launch code 后的 8 位数字
```

### 错误信息

如果提取失败，会显示详细的错误信息：

```
在 GitHub 邮件中未找到验证码

错误信息: 未找到匹配的验证码模式

邮件主题: [GitHub] Please verify your device
发件人: noreply@github.com

邮件内容预览（前200字符）:
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003

You can enter it by visiting the link below:
...

提示：
- 请确保这是包含验证码的邮件
- GitHub 验证码通常是 8 位数字
- 如果是其他类型的邮件，请点击"获取邮件列表"查看所有邮件
```

---

## 🆚 与其他按钮的区别

| 特性 | 获取邮件列表 | 获取Augment验证码 | 获取GitHub验证码 |
|------|-------------|------------------|-----------------|
| **筛选方式** | 无筛选 | 按邮箱后缀 | 按发件人+主题关键词 |
| **主题色** | 蓝紫色 | 绿色 | GitHub 紫色 |
| **图标** | 无 | 🚀 | 🐙 |
| **验证码格式** | 通用 | 通用 | 8位数字优先 |
| **排除规则** | 无 | 无 | 排除通知类邮件 |

---

## 💡 使用建议

### 最佳实践

1. **优先使用专用按钮**
   - 如果是 GitHub 验证码，使用"🐙 获取GitHub验证码"
   - 如果是 Augment 验证码，使用"🚀 获取Augment验证码"
   - 如果不确定，使用"获取邮件列表"查看所有邮件

2. **查看调试信息**
   - 打开浏览器控制台（F12）
   - 查看详细的筛选和提取日志
   - 有助于理解为什么某些邮件被排除

3. **手动验证**
   - 如果自动提取失败，可以手动查看邮件详情
   - 在邮件列表中点击邮件查看完整内容
   - 手动复制验证码

### 注意事项

- ⚠️ 只会提取最新的验证码邮件
- ⚠️ 通知类邮件会被自动排除
- ⚠️ 如果没有验证码邮件，会提示错误
- ⚠️ 验证码必须符合已知的格式模式

---

## 🔄 更新日志

### v1.1.0 (2024-01-02)

- ✨ 新增 GitHub 验证码获取功能
- ✨ 智能筛选验证码邮件
- ✨ 排除通知类邮件
- ✨ 详细的错误提示
- ✨ GitHub 风格的界面设计

---

## 📞 技术支持

如果遇到问题：

1. 查看控制台日志了解详细信息
2. 查看错误提示中的邮件内容预览
3. 尝试使用"获取邮件列表"手动查看
4. 提交 Issue 反馈问题

---

**文档版本**: v1.1.0  
**最后更新**: 2024-01-02  
**维护者**: MailReceive Team
