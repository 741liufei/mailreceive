# 验证码提取功能文档

本文档详细说明了 MailReceive 项目中验证码提取功能的实现原理和支持的验证码格式。

## 📋 目录

- [功能概述](#功能概述)
- [支持的验证码格式](#支持的验证码格式)
- [提取策略](#提取策略)
- [使用示例](#使用示例)
- [测试验证](#测试验证)

---

## 功能概述

MailReceive 使用智能的正则表达式匹配策略，能够从邮件内容中自动提取各种格式的验证码。系统按照优先级顺序尝试多种匹配模式，确保最大程度地识别不同服务商发送的验证码。

### 核心特性

- ✅ **多模式匹配**：支持 10+ 种验证码格式
- ✅ **优先级排序**：按照准确度从高到低尝试匹配
- ✅ **智能提取**：自动识别上下文中的验证码
- ✅ **容错处理**：单个模式失败不影响其他模式
- ✅ **详细反馈**：返回匹配的模式和原始文本

---

## 支持的验证码格式

### 1. 标准验证码模式（高优先级）

#### 模式 1：Your verification code is
```
Your verification code is: 123456
```
**正则表达式**：`Your verification code is:\s*(\d+)`

#### 模式 2：verification code is
```
Your verification code is: 654321
```
**正则表达式**：`verification code is:\s*(\d+)`

---

### 2. GitHub 验证码模式 ⭐ 新增

#### 模式 3：GitHub launch code
```
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003
```
**正则表达式**：`launch code[\s\S]*?(\d{8})`

**说明**：匹配 "launch code" 后面出现的第一个 8 位数字，支持跨行匹配。

#### 模式 4：GitHub entering the code below
```
Continue signing up for GitHub by entering the code below:

70685003
```
**正则表达式**：`entering the code below:\s*(\d{8})`

**说明**：匹配 "entering the code below" 后面的 8 位数字。

#### 实际邮件示例

```text
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003

You can enter it by visiting the link below:

https://github.com/account_verifications?verification=114b29a9-f838-4730-b1ce-e78636146135&via_launch_code_email=true

You're receiving this email because you recently created a new GitHub account. If this wasn't you, please ignore this email.

Not able to enter the code? Paste the following link into your browser:

https://github.com/account_verifications/confirm/114b29a9-f838-4730-b1ce-e78636146135/70685003
```

**提取结果**：`70685003`

---

### 3. 简化验证码模式

#### 模式 5：code is
```
Your code is: 789012
```
**正则表达式**：`code is:\s*(\d+)`

---

### 4. 中文验证码模式

#### 模式 6：中文验证码
```
您的验证码：123456
您的验证码: 654321
```
**正则表达式**：`验证码[：:]\s*(\d+)`

---

### 5. HTML 包围模式

#### 模式 7：HTML 标签内的验证码
```html
Your verification code is: <strong>123456</strong>
```
**正则表达式**：`Your verification code is:\s*<[^>]*>(\d+)<\/[^>]*>`

---

### 6. 通用数字模式（备用方案）

#### 模式 8：8 位数字
```
70685003
```
**正则表达式**：`\b\d{8}\b`

**说明**：匹配独立的 8 位数字（适用于 GitHub 等服务）。

#### 模式 9：6 位数字
```
123456
```
**正则表达式**：`\b\d{6}\b`

**说明**：匹配独立的 6 位数字（最常见的验证码格式）。

#### 模式 10：4-8 位数字
```
1234
12345678
```
**正则表达式**：`\b\d{4,8}\b`

**说明**：匹配 4 到 8 位的数字（兜底方案）。

---

## 提取策略

### 优先级顺序

系统按照以下优先级顺序尝试匹配验证码：

1. **标准验证码模式**（最高优先级）
   - Your verification code is
   - verification code is

2. **GitHub 验证码模式**
   - launch code 模式
   - entering the code below 模式

3. **简化模式**
   - code is

4. **中文模式**
   - 验证码

5. **HTML 模式**
   - HTML 标签包围

6. **通用数字模式**（最低优先级）
   - 8 位数字
   - 6 位数字
   - 4-8 位数字

### 匹配流程

```
开始
  ↓
尝试模式 1（Your verification code is）
  ↓ 失败
尝试模式 2（verification code is）
  ↓ 失败
尝试模式 3（GitHub launch code）
  ↓ 成功 ✅
返回验证码：70685003
```

---

## 使用示例

### 服务端使用（Node.js）

```javascript
import { tempMailService } from './services/tempMailService.js';

// 获取邮件内容
const emailContent = await tempMailService.getEmailContent(emailId);

// 提取验证码
const result = tempMailService.extractVerificationCode(emailContent.text);

if (result.success) {
  console.log('验证码:', result.code);
  console.log('使用的模式:', result.patternDescription);
  console.log('匹配的文本:', result.matchedText);
} else {
  console.log('未找到验证码:', result.message);
}
```

### 客户端使用（浏览器）

```javascript
// 提取验证码（客户端函数已自动注入）
const result = extractVerificationCode(emailText);

if (result.success) {
  console.log('验证码:', result.code);
  alert('验证码: ' + result.code);
} else {
  console.log('未找到验证码');
}
```

### 返回数据格式

**成功时**：
```javascript
{
  success: true,
  code: "70685003",
  patternName: "GITHUB_LAUNCH_CODE_PATTERN",
  patternDescription: "GitHub 模式：launch code 后的 8 位数字",
  matchedText: "launch code!\n\nContinue signing up for GitHub by entering the code below:\n\n70685003"
}
```

**失败时**：
```javascript
{
  success: false,
  code: null,
  message: "未找到匹配的验证码模式"
}
```

---

## 测试验证

### 运行测试

项目包含了针对 GitHub 验证码的专门测试：

```bash
# 运行 GitHub 验证码提取测试
node tests/test-github-code.js
```

### 测试输出示例

```
=== GitHub 验证码提取测试 ===

测试文本：
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003

...

==================================================

✅ 测试成功！
提取的验证码: 70685003
使用的模式: GITHUB_LAUNCH_CODE_PATTERN
模式描述: GitHub 模式：launch code 后的 8 位数字
匹配的文本: launch code!

Continue signing up for GitHub by entering the code below:

70685003

==================================================

🎉 验证通过！成功提取到正确的验证码: 70685003
```

### 手动测试

您也可以通过 Web 界面手动测试：

1. 访问应用：http://localhost:8787
2. 输入邮箱地址
3. 点击"获取邮件列表"
4. 查看包含 GitHub 验证码的邮件
5. 系统会自动提取并显示验证码

---

## 配置文件

验证码提取的所有正则表达式配置都集中在 `src/config/regexConfig.js` 文件中：

```javascript
export const REGEX_PATTERNS = {
  // 标准模式
  VERIFICATION_CODE_PRIMARY: 'Your verification code is:\\s*(\\d+)',
  VERIFICATION_CODE_SECONDARY: 'verification code is:\\s*(\\d+)',
  CODE_IS: 'code is:\\s*(\\d+)',
  
  // GitHub 模式 ⭐ 新增
  GITHUB_LAUNCH_CODE: 'launch code[!\\s]*[\\s\\S]*?(\\d{8})',
  GITHUB_ENTERING_CODE: 'entering the code below[:\\s]*(\\d{8})',
  
  // 中文模式
  CHINESE_VERIFICATION: '验证码[：:]\\s*(\\d+)',
  
  // 通用数字模式
  EIGHT_DIGITS: '\\b\\d{8}\\b',
  SIX_DIGITS: '\\b\\d{6}\\b',
  FOUR_TO_EIGHT_DIGITS: '\\b\\d{4,8}\\b',
  
  // HTML 模式
  HTML_WRAPPED_CODE: 'Your verification code is:\\s*<[^>]*>(\\d+)<\\/[^>]*>'
};
```

---

## 扩展新的验证码格式

如果需要支持新的验证码格式，只需在 `src/config/regexConfig.js` 中添加新的模式：

### 步骤 1：添加正则表达式模式

```javascript
export const REGEX_PATTERNS = {
  // ... 现有模式 ...
  
  // 新增模式
  YOUR_NEW_PATTERN: 'your regex pattern here'
};
```

### 步骤 2：添加到提取策略

```javascript
export const EXTRACTION_STRATEGY = [
  // ... 现有策略 ...
  
  {
    name: 'YOUR_NEW_PATTERN',
    pattern: REGEX_PATTERNS.YOUR_NEW_PATTERN,
    flags: REGEX_FLAGS.CASE_INSENSITIVE,
    description: '您的模式描述'
  }
];
```

### 步骤 3：测试验证

创建测试文件验证新模式是否工作正常。

---

## 常见问题

### Q1: 为什么有些验证码提取不出来？

**A**: 可能的原因：
1. 验证码格式不在支持列表中
2. 邮件内容包含特殊字符或编码
3. 验证码被 HTML 标签包围但格式不匹配

**解决方案**：
- 查看邮件原始内容
- 根据实际格式添加新的正则表达式模式
- 调整现有模式的优先级

### Q2: 如何调试验证码提取？

**A**: 启用详细日志：

```javascript
console.log('邮件原始内容:', emailContent);
console.log('提取结果:', extractResult);
```

### Q3: 通用数字模式会不会误匹配？

**A**: 通用数字模式优先级最低，只有在所有特定模式都失败时才会使用。而且使用了词边界 `\b` 来确保匹配的是独立的数字，不会匹配电话号码、日期等。

---

## 更新日志

### v1.1.0 (2024-01-02)

- ✨ 新增 GitHub 验证码支持
  - 支持 "launch code" 格式
  - 支持 "entering the code below" 格式
  - 支持 8 位数字验证码
- ✨ 添加专门的测试文件
- 📝 完善文档说明

### v1.0.0 (2024-01-01)

- ✨ 初始版本
- ✨ 支持标准验证码格式
- ✨ 支持中文验证码
- ✨ 支持 6 位数字验证码

---

**文档版本**: v1.1.0  
**最后更新**: 2024-01-02  
**维护者**: MailReceive Team
