# Tempmail.plus API 技术文档

本文档详细说明了 MailReceive 项目中使用的 tempmail.plus API 接口的调用方式、参数说明和返回数据格式。

## 📋 目录

- [API 基础信息](#api-基础信息)
- [认证方式](#认证方式)
- [API 接口列表](#api-接口列表)
  - [1. 获取邮件列表](#1-获取邮件列表)
  - [2. 获取邮件详情](#2-获取邮件详情)
- [错误处理](#错误处理)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)

---

## API 基础信息

### 基础 URL

```
https://tempmail.plus/api
```

### 请求方式

所有 API 接口均使用 `GET` 方法请求。

### 内容类型

```
Content-Type: application/json
```

### 字符编码

```
UTF-8
```

---

## 认证方式

tempmail.plus API 使用**邮箱地址 + PIN 码**的方式进行认证。

### 认证参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| `email` | string | 是 | 临时邮箱地址（如：`user@mailto.plus`） |
| `epin` | string | 是 | 邮箱对应的 PIN 码（8位字符） |

### 获取认证信息

1. 访问 [tempmail.plus](https://tempmail.plus)
2. 系统自动生成临时邮箱地址
3. 在邮箱设置中查看 PIN 码
4. 将邮箱地址和 PIN 码配置到项目环境变量中

---

## API 接口列表

### 1. 获取邮件列表

获取指定邮箱中的所有邮件列表。

#### 接口地址

```
GET /api/mails
```

#### 请求参数

| 参数名 | 类型 | 必需 | 说明 | 示例 |
|--------|------|------|------|------|
| `email` | string | 是 | 临时邮箱地址 | `liufei@mailto.plus` |
| `epin` | string | 是 | PIN 码 | `test1234` |

#### 请求示例

```http
GET https://tempmail.plus/api/mails?email=liufei@mailto.plus&epin=test1234
Content-Type: application/json
```

#### cURL 示例

```bash
curl -X GET "https://tempmail.plus/api/mails?email=liufei@mailto.plus&epin=test1234" \
  -H "Content-Type: application/json"
```

#### JavaScript 示例

```javascript
const response = await fetch(
  `https://tempmail.plus/api/mails?email=${encodeURIComponent('liufei@mailto.plus')}&epin=${encodeURIComponent('test1234')}`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data);
```

#### 响应参数

**成功响应 (200 OK)**

```json
{
  "result": true,
  "mail_list": [
    {
      "mail_id": "1234567890abcdef",
      "subject": "Your Verification Code",
      "from_mail": "noreply@example.com",
      "time": "2024-01-01T12:00:00.000Z",
      "first_attachment_name": "",
      "attachment_count": 0,
      "is_new": true
    },
    {
      "mail_id": "fedcba0987654321",
      "subject": "Welcome to Our Service",
      "from_mail": "welcome@service.com",
      "time": "2024-01-01T11:30:00.000Z",
      "first_attachment_name": "welcome.pdf",
      "attachment_count": 1,
      "is_new": false
    }
  ]
}
```

**响应字段说明**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `result` | boolean | 请求是否成功 |
| `mail_list` | array | 邮件列表数组 |
| `mail_list[].mail_id` | string | 邮件唯一标识符 |
| `mail_list[].subject` | string | 邮件主题 |
| `mail_list[].from_mail` | string | 发件人邮箱地址 |
| `mail_list[].time` | string | 邮件接收时间（ISO 8601 格式） |
| `mail_list[].first_attachment_name` | string | 第一个附件名称（无附件时为空字符串） |
| `mail_list[].attachment_count` | number | 附件数量 |
| `mail_list[].is_new` | boolean | 是否为新邮件（未读） |

**错误响应**

```json
{
  "result": false,
  "err": {
    "code": "INVALID_CREDENTIALS",
    "msg": "Invalid email or PIN"
  }
}
```

---

### 2. 获取邮件详情

获取指定邮件的完整内容，包括 HTML 和纯文本格式。

#### 接口地址

```
GET /api/mails/{mail_id}
```

#### 路径参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| `mail_id` | string | 是 | 邮件 ID（从邮件列表接口获取） |

#### 查询参数

| 参数名 | 类型 | 必需 | 说明 | 示例 |
|--------|------|------|------|------|
| `email` | string | 是 | 临时邮箱地址 | `liufei@mailto.plus` |
| `epin` | string | 是 | PIN 码 | `test1234` |

#### 请求示例

```http
GET https://tempmail.plus/api/mails/1234567890abcdef?email=liufei@mailto.plus&epin=test1234
Content-Type: application/json
```

#### cURL 示例

```bash
curl -X GET "https://tempmail.plus/api/mails/1234567890abcdef?email=liufei@mailto.plus&epin=test1234" \
  -H "Content-Type: application/json"
```

#### JavaScript 示例

```javascript
const mailId = '1234567890abcdef';
const email = 'liufei@mailto.plus';
const epin = 'test1234';

const response = await fetch(
  `https://tempmail.plus/api/mails/${mailId}?email=${encodeURIComponent(email)}&epin=${encodeURIComponent(epin)}`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }
);

const data = await response.json();
console.log(data);
```

#### 响应参数

**成功响应 (200 OK)**

```json
{
  "mail_id": "1234567890abcdef",
  "subject": "Your Verification Code",
  "from": "noreply@example.com",
  "date": "2024-01-01T12:00:00.000Z",
  "mail_timestamp": 1704110400,
  "text": "Your verification code is: 123456\n\nThis code will expire in 10 minutes.",
  "html": "<html><body><p>Your verification code is: <strong>123456</strong></p><p>This code will expire in 10 minutes.</p></body></html>",
  "attachments": []
}
```

**响应字段说明**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `mail_id` | string | 邮件唯一标识符 |
| `subject` | string | 邮件主题 |
| `from` | string | 发件人邮箱地址 |
| `date` | string | 邮件日期（ISO 8601 格式） |
| `mail_timestamp` | number | Unix 时间戳（秒） |
| `text` | string | 邮件纯文本内容 |
| `html` | string | 邮件 HTML 内容 |
| `attachments` | array | 附件列表（暂不支持） |

**错误响应**

```json
{
  "err": {
    "code": "MAIL_NOT_FOUND",
    "msg": "Mail not found"
  }
}
```

---

## 错误处理

### 错误响应格式

所有错误响应都包含 `err` 对象：

```json
{
  "result": false,
  "err": {
    "code": "ERROR_CODE",
    "msg": "Error message description"
  }
}
```

### 常见错误码

| 错误码 | HTTP 状态码 | 说明 | 解决方案 |
|--------|-------------|------|----------|
| `INVALID_CREDENTIALS` | 401 | 邮箱地址或 PIN 码无效 | 检查环境变量配置 |
| `MAIL_NOT_FOUND` | 404 | 邮件不存在 | 确认邮件 ID 是否正确 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 | 降低请求频率，添加延迟 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 | 稍后重试 |
| `INVALID_PARAMETERS` | 400 | 请求参数无效 | 检查参数格式和编码 |

### 错误处理示例

```javascript
async function getEmails(email, pin) {
  try {
    const response = await fetch(
      `https://tempmail.plus/api/mails?email=${encodeURIComponent(email)}&epin=${encodeURIComponent(pin)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.result) {
      throw new Error(data.err?.msg || '请求失败');
    }

    return data.mail_list;
  } catch (error) {
    console.error('获取邮件列表失败:', error);
    throw error;
  }
}
```

---

## 使用示例

### 完整工作流程

```javascript
// 1. 配置认证信息
const config = {
  email: 'liufei@mailto.plus',
  pin: 'test1234',
  apiUrl: 'https://tempmail.plus/api'
};

// 2. 获取邮件列表
async function fetchEmails() {
  const response = await fetch(
    `${config.apiUrl}/mails?email=${encodeURIComponent(config.email)}&epin=${encodeURIComponent(config.pin)}`
  );
  
  const data = await response.json();
  
  if (!data.result) {
    throw new Error(data.err?.msg || '获取邮件列表失败');
  }
  
  return data.mail_list;
}

// 3. 获取邮件详情
async function fetchEmailDetail(mailId) {
  const response = await fetch(
    `${config.apiUrl}/mails/${mailId}?email=${encodeURIComponent(config.email)}&epin=${encodeURIComponent(config.pin)}`
  );
  
  const data = await response.json();
  
  if (data.err) {
    throw new Error(data.err.msg || '获取邮件详情失败');
  }
  
  return data;
}

// 4. 提取验证码
function extractVerificationCode(text) {
  const patterns = [
    /Your verification code is:\s*(\d+)/i,
    /verification code is:\s*(\d+)/i,
    /code is:\s*(\d+)/i,
    /\b\d{6}\b/g
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// 5. 完整流程
async function getVerificationCode() {
  try {
    // 获取邮件列表
    const emails = await fetchEmails();
    console.log(`找到 ${emails.length} 封邮件`);
    
    // 遍历邮件查找验证码
    for (const email of emails) {
      const detail = await fetchEmailDetail(email.mail_id);
      const code = extractVerificationCode(detail.text);
      
      if (code) {
        console.log(`找到验证码: ${code}`);
        return code;
      }
    }
    
    console.log('未找到验证码');
    return null;
  } catch (error) {
    console.error('获取验证码失败:', error);
    throw error;
  }
}

// 执行
getVerificationCode();
```

---

## 最佳实践

### 1. 参数编码

始终使用 `encodeURIComponent()` 对 URL 参数进行编码：

```javascript
// ✅ 正确
const url = `${apiUrl}/mails?email=${encodeURIComponent(email)}&epin=${encodeURIComponent(pin)}`;

// ❌ 错误
const url = `${apiUrl}/mails?email=${email}&epin=${pin}`;
```

### 2. 错误处理

实现完善的错误处理机制：

```javascript
async function apiCall() {
  try {
    const response = await fetch(url);
    
    // 检查 HTTP 状态码
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 检查 API 响应结果
    if (!data.result && data.err) {
      throw new Error(data.err.msg);
    }
    
    return data;
  } catch (error) {
    console.error('API 调用失败:', error);
    throw error;
  }
}
```

### 3. 请求频率控制

避免频繁请求，添加适当延迟：

```javascript
async function pollEmails(maxAttempts = 10, interval = 5000) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const emails = await fetchEmails();
      if (emails.length > 0) {
        return emails;
      }
    } catch (error) {
      console.error(`第 ${i + 1} 次尝试失败:`, error);
    }
    
    // 等待指定时间后重试
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('超过最大重试次数');
}
```

### 4. 超时处理

为请求设置超时时间：

```javascript
async function fetchWithTimeout(url, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时');
    }
    throw error;
  }
}
```

### 5. 日志记录

记录关键操作日志便于调试：

```javascript
async function getEmails(email, pin) {
  console.log('=== 获取邮件列表 ===');
  console.log('邮箱:', email);
  console.log('API URL:', apiUrl);
  
  const response = await fetch(url);
  console.log('API 响应状态:', response.status, response.statusText);
  
  const data = await response.json();
  console.log('API 响应数据:', data);
  console.log('邮件数量:', data.mail_list?.length || 0);
  
  return data;
}
```

### 6. 数据验证

验证 API 返回的数据：

```javascript
function validateEmailData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('无效的响应数据');
  }
  
  if (!data.result) {
    throw new Error(data.err?.msg || '请求失败');
  }
  
  if (!Array.isArray(data.mail_list)) {
    throw new Error('邮件列表格式错误');
  }
  
  return true;
}
```

---

## 项目中的实现

### TempMailService 类

项目中的 `src/services/tempMailService.js` 封装了 tempmail.plus API 的调用：

```javascript
class TempMailService {
  // 获取邮件列表
  async getEmails(env = {}) {
    await this.initialize(env);
    
    const response = await fetch(
      `${this.apiUrl}/mails?email=${encodeURIComponent(this.email)}&epin=${encodeURIComponent(this.pin)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.result) {
      throw new Error(data.err?.msg || '获取邮件列表失败');
    }

    // 转换为统一格式
    return data.mail_list.map(mail => ({
      id: mail.mail_id,
      subject: mail.subject || '无主题',
      from: mail.from_mail || '未知发件人',
      date: new Date(mail.time).toISOString(),
      preview: mail.first_attachment_name || '',
      isNew: mail.is_new || false,
      attachmentCount: mail.attachment_count || 0
    }));
  }

  // 获取邮件详情
  async getEmailContent(messageId, env = {}) {
    await this.initialize(env);
    
    const response = await fetch(
      `${this.apiUrl}/mails/${messageId}?email=${encodeURIComponent(this.email)}&epin=${encodeURIComponent(this.pin)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.err) {
      throw new Error(data.err.msg || '获取邮件详情失败');
    }

    // 转换为统一格式
    return {
      id: data.mail_id,
      subject: data.subject || '无主题',
      from: data.from || '未知发件人',
      date: new Date(data.mail_timestamp * 1000).toISOString(),
      content: data.html || '',
      text: data.text || '',
      html: data.html || ''
    };
  }
}
```

---

## 附录

### A. 环境变量配置

在 `wrangler.toml` 中配置：

```toml
[vars]
TEMPMAIL_PLUS_EMAIL = "your-email@mailto.plus"
TEMPMAIL_PLUS_PIN = "your-pin-code"
TEMPMAIL_PLUS_API_URL = "https://tempmail.plus/api"
```

### B. 测试工具

使用 curl 测试 API：

```bash
# 测试邮件列表接口
curl -X GET "https://tempmail.plus/api/mails?email=test@mailto.plus&epin=test1234"

# 测试邮件详情接口
curl -X GET "https://tempmail.plus/api/mails/1234567890abcdef?email=test@mailto.plus&epin=test1234"
```

### C. 相关资源

- [tempmail.plus 官网](https://tempmail.plus)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [项目 GitHub 仓库](https://github.com/your-repo/mailreceive)

---

**文档版本**: v1.0.0  
**最后更新**: 2024-01-01  
**维护者**: MailReceive Team
