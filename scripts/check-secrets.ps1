# 敏感信息检查脚本（PowerShell 版本）
# 在提交代码前运行此脚本，确保没有敏感信息泄露

Write-Host "🔍 检查敏感信息..." -ForegroundColor Cyan
Write-Host ""

# 定义敏感信息模式
$sensitivePatterns = @(
    "test1234",
    "liufei@mailto.plus",
    "TEMPMAIL_PLUS_EMAIL.*=.*@",
    "TEMPMAIL_PLUS_PIN.*=.*[a-zA-Z0-9]{6,}"
)

# 检查标志
$hasSensitive = $false

# 检查暂存区的文件
Write-Host "📋 检查暂存区文件..." -ForegroundColor Yellow
$stagedDiff = git diff --cached
foreach ($pattern in $sensitivePatterns) {
    if ($stagedDiff -match $pattern) {
        Write-Host "❌ 发现敏感信息: $pattern" -ForegroundColor Red
        $hasSensitive = $true
    }
}

# 检查未暂存的修改
Write-Host ""
Write-Host "📝 检查未暂存的修改..." -ForegroundColor Yellow
$unstagedDiff = git diff
foreach ($pattern in $sensitivePatterns) {
    if ($unstagedDiff -match $pattern) {
        Write-Host "⚠️  未暂存的修改中包含敏感信息: $pattern" -ForegroundColor Yellow
    }
}

# 检查是否包含敏感文件
Write-Host ""
Write-Host "📁 检查敏感文件..." -ForegroundColor Yellow
$sensitiveFiles = @(
    ".dev.vars",
    "wrangler.toml.local",
    "config.env"
)

$gitStatus = git status --porcelain
foreach ($file in $sensitiveFiles) {
    if ($gitStatus -match "^[AM].*$file") {
        Write-Host "❌ 敏感文件被添加到暂存区: $file" -ForegroundColor Red
        $hasSensitive = $true
    }
}

Write-Host ""
if (-not $hasSensitive) {
    Write-Host "✅ 未发现敏感信息，可以安全提交！" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ 发现敏感信息，请移除后再提交！" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 提示：" -ForegroundColor Cyan
    Write-Host "   1. 使用 'git reset HEAD <file>' 取消暂存"
    Write-Host "   2. 移除敏感信息后重新添加"
    Write-Host "   3. 确保敏感信息配置在 .dev.vars 文件中"
    exit 1
}
