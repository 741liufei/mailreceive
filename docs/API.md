# API 文档

## 概述

MailReceive API 提供了简洁的 RESTful 接口，用于邮件接收和管理功能。所有 API 响应都采用统一的 JSON 格式。

## 基础信息

- **基础 URL**: `https://mailreceive.441491549.workers.dev`
- **API 版本**: v1.0.0
- **响应格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "success": false,
  "error": "错误信息",
  "message": "详细错误描述"
}
```

## API 端点

### 1. 获取邮件列表

获取指定邮箱的邮件列表。

**端点**: `GET /api/session/emails`

**参数**:
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userEmail | string | 是 | 用户邮箱地址 |

**请求示例**:

```http
GET /api/session/emails?userEmail=user@example.com
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "emails": [
      {
        "id": "3960246177",
        "subject": "Your verification code is ready",
        "from": "noreply@augmentcode.com",
        "date": "2024-01-01T12:00:00.000Z",
        "preview": "Your verification code",
        "isNew": true,
        "attachmentCount": 0
      }
    ]
  },
  "message": "邮件列表获取成功"
}
```

**错误响应**:

- `400 Bad Request`: 缺少必需参数或邮箱格式无效
- `500 Internal Server Error`: 服务器内部错误

### 2. 获取邮件详情

获取指定邮件的详细内容。

**端点**: `GET /api/session/email-detail`

**参数**:
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| userEmail | string | 是 | 用户邮箱地址 |
| emailId | string | 是 | 邮件 ID |

**请求示例**:

```http
GET /api/session/email-detail?userEmail=user@example.com&emailId=3960246177
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": "3960246177",
    "subject": "Your verification code is ready",
    "from": "noreply@augmentcode.com",
    "date": "2024-01-01T12:00:00.000Z",
    "content": "<!DOCTYPE html>...",
    "text": "Your verification code is: 004151",
    "html": "<!DOCTYPE html>..."
  },
  "message": "邮件详情获取成功"
}
```

**字段说明**:

- `content`: 邮件的 HTML 内容（用于页面显示）
- `text`: 邮件的纯文本内容（用于验证码提取）
- `html`: 邮件的原始 HTML 内容

**错误响应**:

- `400 Bad Request`: 缺少必需参数或参数格式无效
- `404 Not Found`: 邮件不存在
- `500 Internal Server Error`: 服务器内部错误

## 前端页面

### 主页

**端点**: `GET /`

返回 MailReceive 的主页面，包含完整的用户界面。

**功能**:

- 邮箱输入
- 邮件列表显示
- 邮件详情查看
- 验证码提取

## 错误代码

| 错误代码 | 描述           |
| -------- | -------------- |
| 400      | 请求参数错误   |
| 404      | 资源不存在     |
| 500      | 服务器内部错误 |

## 验证码提取

API 支持自动验证码提取功能，使用以下正则表达式模式：

1. **英文模式**: `/Your verification code is:\s*(\d+)/i`
2. **中文模式**: `/验证码[:：]\s*(\d+)/i`
3. **通用数字模式**: `/\d{4,8}/g`

## 限制说明

- 请求频率：无特殊限制
- 数据保留：临时存储，不持久化
- 邮件大小：支持常见邮件大小
- 并发连接：支持高并发访问

## 示例代码

### JavaScript (Fetch API)

```javascript
// 获取邮件列表
async function getEmails(userEmail) {
  const response = await fetch(
    `/api/session/emails?userEmail=${encodeURIComponent(userEmail)}`
  );
  const result = await response.json();

  if (result.success) {
    console.log("邮件列表:", result.data.emails);
  } else {
    console.error("获取失败:", result.message);
  }
}

// 获取邮件详情
async function getEmailDetail(userEmail, emailId) {
  const response = await fetch(
    `/api/session/email-detail?userEmail=${encodeURIComponent(
      userEmail
    )}&emailId=${emailId}`
  );
  const result = await response.json();

  if (result.success) {
    console.log("邮件详情:", result.data);
  } else {
    console.error("获取失败:", result.message);
  }
}
```

### cURL

```bash
# 获取邮件列表
curl "https://mailreceive.441491549.workers.dev/api/session/emails?userEmail=user@example.com"

# 获取邮件详情
curl "https://mailreceive.441491549.workers.dev/api/session/email-detail?userEmail=user@example.com&emailId=3960246177"
```

## 更新历史

### v1.0.0 (2024-01-01)

- 初始 API 版本
- 支持邮件列表和详情获取
- 集成验证码提取功能
