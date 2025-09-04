# 🏠 本地开发指南

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 设置环境变量

在启动开发服务器之前，需要设置以下环境变量：

#### 方法 1: 通过命令行设置（推荐）

```bash
# Windows PowerShell
$env:TEMPMAIL_PLUS_EMAIL="your-email@tempmail.plus"
$env:TEMPMAIL_PLUS_PIN="your-pin-code"

# Windows CMD
set TEMPMAIL_PLUS_EMAIL=your-email@tempmail.plus
set TEMPMAIL_PLUS_PIN=your-pin-code

# Linux/Mac
export TEMPMAIL_PLUS_EMAIL="your-email@tempmail.plus"
export TEMPMAIL_PLUS_PIN="your-pin-code"
```

#### 方法 2: 创建 .env 文件

在项目根目录创建 `.env` 文件：

```bash
TEMPMAIL_PLUS_EMAIL=your-email@tempmail.plus
TEMPMAIL_PLUS_PIN=your-pin-code
TEMPMAIL_PLUS_API_URL=https://tempmail.plus/api
SESSION_TIMEOUT=1800
VERIFICATION_TIMEOUT=180
MAX_RETRY_ATTEMPTS=3
PIN_LENGTH=8
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问应用

打开浏览器访问: http://localhost:8787

## 🔧 本地开发配置

### 环境变量说明

| 变量名                  | 必需 | 默认值                      | 说明                   |
| ----------------------- | ---- | --------------------------- | ---------------------- |
| `TEMPMAIL_PLUS_EMAIL`   | ✅   | -                           | tempmail.plus 邮箱地址 |
| `TEMPMAIL_PLUS_PIN`     | ✅   | -                           | tempmail.plus PIN 码   |
| `TEMPMAIL_PLUS_API_URL` | ❌   | `https://tempmail.plus/api` | API 基础 URL           |
| `SESSION_TIMEOUT`       | ❌   | `1800`                      | 会话超时时间(秒)       |
| `VERIFICATION_TIMEOUT`  | ❌   | `180`                       | 验证码等待超时(秒)     |
| `MAX_RETRY_ATTEMPTS`    | ❌   | `3`                         | 最大重试次数           |
| `PIN_LENGTH`            | ❌   | `8`                         | PIN 码长度             |

### 本地测试数据

如果暂时没有 tempmail.plus 账户，可以使用以下测试数据：

```bash
TEMPMAIL_PLUS_EMAIL=test@tempmail.plus
TEMPMAIL_PLUS_PIN=12345678
```

## 🧪 测试功能

### 1. 健康检查

```bash
curl http://localhost:8787/api/health
```

### 2. 配置状态

```bash
curl http://localhost:8787/api/config/status
```

### 3. 创建会话

```bash
curl -X POST http://localhost:8787/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"userEmail": "test@example.com"}'
```

## 🐛 常见问题

### 1. 环境变量未设置

**错误**: `TEMPMAIL_PLUS_EMAIL environment variable not set`
**解决**: 确保设置了必需的环境变量

### 2. KV 存储错误

**错误**: `KV namespace not found`
**解决**: 本地开发使用模拟 KV，无需创建实际 KV 命名空间

### 3. 端口被占用

**错误**: `Port 8787 is already in use`
**解决**:

```bash
# 使用其他端口
wrangler dev --port 8788
```

### 4. 模块导入错误

**错误**: `Cannot resolve module`
**解决**: 确保所有文件路径正确，使用相对路径导入

## 📝 开发提示

### 1. 热重载

开发服务器支持热重载，修改代码后会自动重启。

### 2. 日志查看

在终端中查看实时日志输出。

### 3. 调试模式

使用浏览器开发者工具进行调试。

### 4. API 测试

使用 Postman 或 curl 测试 API 接口。

## 🚀 下一步

本地测试完成后，可以：

1. 部署到 Cloudflare Workers
2. 配置生产环境变量
3. 设置自定义域名
4. 配置监控和日志

---

**本地开发指南版本**: v1.0.0  
**最后更新**: 2024-01-01
