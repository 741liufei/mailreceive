# 环境变量配置指南

本文档说明如何安全地配置项目所需的敏感信息。

## 📋 目录

- [本地开发配置](#本地开发配置)
- [生产环境配置](#生产环境配置)
- [环境变量说明](#环境变量说明)
- [安全注意事项](#安全注意事项)

## 🔧 本地开发配置

### 方法一：使用 .dev.vars 文件（推荐）

1. 在项目根目录创建 `.dev.vars` 文件：

```bash
# 复制示例文件
cp .dev.vars.example .dev.vars
```

2. 编辑 `.dev.vars` 文件，填入你的配置：

```env
# Tempmail.plus 邮箱配置
TEMPMAIL_PLUS_EMAIL=your-email@mailto.plus
TEMPMAIL_PLUS_PIN=your-pin-code
```

3. 启动本地开发服务器：

```bash
npm run dev
```

Wrangler 会自动读取 `.dev.vars` 文件中的环境变量。

### 方法二：使用命令行参数

```bash
TEMPMAIL_PLUS_EMAIL=your-email@mailto.plus TEMPMAIL_PLUS_PIN=your-pin-code npm run dev
```

## 🚀 生产环境配置

### 使用 Cloudflare Workers Secrets

生产环境的敏感信息应该使用 Cloudflare Workers 的 Secrets 功能：

1. **配置邮箱地址：**

```bash
wrangler secret put TEMPMAIL_PLUS_EMAIL
# 输入提示后，输入你的邮箱地址
```

2. **配置 PIN 码：**

```bash
wrangler secret put TEMPMAIL_PLUS_PIN
# 输入提示后，输入你的 PIN 码
```

3. **验证配置：**

```bash
wrangler secret list
```

### 部署到生产环境

```bash
npm run deploy
```

## 📝 环境变量说明

### 必需的敏感变量

| 变量名 | 说明 | 示例 | 配置方式 |
|--------|------|------|----------|
| `TEMPMAIL_PLUS_EMAIL` | Tempmail.plus 邮箱地址 | `liufei@mailto.plus` | 本地：`.dev.vars`<br>生产：Secrets |
| `TEMPMAIL_PLUS_PIN` | Tempmail.plus PIN 码 | `test1234` | 本地：`.dev.vars`<br>生产：Secrets |

### 非敏感变量（已在 wrangler.toml 中配置）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `TEMPMAIL_PLUS_API_URL` | API 地址 | `https://tempmail.plus/api` |
| `SESSION_TIMEOUT` | 会话超时时间（秒） | `1800` |
| `VERIFICATION_TIMEOUT` | 验证码超时时间（秒） | `180` |
| `MAX_RETRY_ATTEMPTS` | 最大重试次数 | `3` |
| `PIN_LENGTH` | PIN 码长度 | `8` |

## 🔒 安全注意事项

### ⚠️ 重要提醒

1. **永远不要将敏感信息提交到 Git 仓库**
   - `.dev.vars` 文件已在 `.gitignore` 中排除
   - 检查提交前确保没有包含敏感信息

2. **定期更换 PIN 码**
   - 建议每 3-6 个月更换一次
   - 如果怀疑泄露，立即更换

3. **使用强 PIN 码**
   - 至少 8 位字符
   - 包含字母和数字
   - 避免使用常见密码

4. **限制访问权限**
   - 只有必要的团队成员才能访问生产环境 Secrets
   - 使用 Cloudflare 的访问控制功能

### 检查敏感信息是否泄露

在提交代码前，运行以下命令检查：

```bash
# 检查是否包含敏感信息
git diff | grep -i "TEMPMAIL_PLUS_EMAIL\|TEMPMAIL_PLUS_PIN\|test1234\|liufei@mailto.plus"
```

如果有输出，说明可能包含敏感信息，需要移除。

## 🔍 故障排查

### 本地开发时提示环境变量未配置

**问题：** 启动时报错 `TEMPMAIL_PLUS_EMAIL环境变量未配置`

**解决方案：**
1. 确认 `.dev.vars` 文件存在且格式正确
2. 确认文件中的变量名拼写正确
3. 重启开发服务器

### 生产环境无法访问邮件

**问题：** 部署后无法获取邮件

**解决方案：**
1. 检查 Secrets 是否正确配置：
   ```bash
   wrangler secret list
   ```
2. 确认 Secrets 的值正确（重新设置）：
   ```bash
   wrangler secret put TEMPMAIL_PLUS_EMAIL
   wrangler secret put TEMPMAIL_PLUS_PIN
   ```
3. 重新部署应用

## 📚 相关文档

- [Cloudflare Workers Secrets 文档](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Wrangler 配置文档](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Tempmail.plus API 文档](./TEMPMAIL_API.md)

## 🆘 获取帮助

如果遇到配置问题，请：

1. 查看本文档的故障排查部分
2. 检查 Cloudflare Workers 日志
3. 联系项目维护者

---

**最后更新：** 2026-02-02
