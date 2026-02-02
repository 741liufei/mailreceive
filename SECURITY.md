# 安全配置说明

## ⚠️ 重要提醒

本项目包含敏感信息配置，请务必遵循以下安全规范。

## 🔐 敏感信息管理

### 已保护的敏感信息

以下敏感信息已从代码仓库中移除，并通过安全方式配置：

- ✅ Tempmail.plus 邮箱地址 (`TEMPMAIL_PLUS_EMAIL`)
- ✅ Tempmail.plus PIN 码 (`TEMPMAIL_PLUS_PIN`)

### 配置方式

#### 本地开发

1. 复制示例配置文件：
   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. 编辑 `.dev.vars` 文件，填入你的实际配置

3. `.dev.vars` 文件已在 `.gitignore` 中，不会被提交到 Git

#### 生产环境

使用 Cloudflare Workers Secrets：

```bash
# 配置邮箱
wrangler secret put TEMPMAIL_PLUS_EMAIL

# 配置 PIN 码
wrangler secret put TEMPMAIL_PLUS_PIN
```

## 🚫 禁止操作

### 永远不要：

1. ❌ 将 `.dev.vars` 文件提交到 Git
2. ❌ 在 `wrangler.toml` 中硬编码敏感信息
3. ❌ 在代码注释中包含真实的邮箱或 PIN 码
4. ❌ 在日志中输出敏感信息
5. ❌ 在公开的文档中包含真实配置

### 提交前检查清单

在每次提交代码前，请确认：

- [ ] `.dev.vars` 文件未被添加到 Git
- [ ] `wrangler.toml` 中没有硬编码的敏感信息
- [ ] 代码中没有包含真实的邮箱地址或 PIN 码
- [ ] 日志输出已脱敏处理

### 检查命令

```bash
# 检查暂存区是否包含敏感文件
git status | grep -E "\.dev\.vars|wrangler\.toml\.local"

# 检查差异中是否包含敏感信息
git diff --cached | grep -iE "test1234|liufei@mailto\.plus"
```

## 🔍 已泄露信息的处理

如果不小心将敏感信息提交到了 Git：

### 1. 立即更换敏感信息

```bash
# 更换生产环境的 PIN 码
wrangler secret put TEMPMAIL_PLUS_PIN
```

### 2. 从 Git 历史中移除

```bash
# 使用 git filter-branch 或 BFG Repo-Cleaner
# 注意：这会重写 Git 历史，需要强制推送
```

### 3. 通知团队成员

告知所有团队成员敏感信息已更换，需要更新本地配置。

## 📚 详细文档

完整的环境配置指南请参考：[docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)

## 🆘 报告安全问题

如果发现安全漏洞，请：

1. **不要**在公开的 Issue 中报告
2. 直接联系项目维护者
3. 提供详细的漏洞描述和复现步骤

---

**记住：安全是每个人的责任！**
