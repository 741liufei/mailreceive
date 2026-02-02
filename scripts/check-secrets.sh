#!/bin/bash

# 敏感信息检查脚本
# 在提交代码前运行此脚本，确保没有敏感信息泄露

echo "🔍 检查敏感信息..."
echo ""

# 定义敏感信息模式
SENSITIVE_PATTERNS=(
    "test1234"
    "liufei@mailto.plus"
    "TEMPMAIL_PLUS_EMAIL.*=.*@"
    "TEMPMAIL_PLUS_PIN.*=.*[a-zA-Z0-9]{6,}"
)

# 检查标志
HAS_SENSITIVE=0

# 检查暂存区的文件
echo "📋 检查暂存区文件..."
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if git diff --cached | grep -iE "$pattern" > /dev/null; then
        echo "❌ 发现敏感信息: $pattern"
        HAS_SENSITIVE=1
    fi
done

# 检查未暂存的修改
echo ""
echo "📝 检查未暂存的修改..."
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if git diff | grep -iE "$pattern" > /dev/null; then
        echo "⚠️  未暂存的修改中包含敏感信息: $pattern"
    fi
done

# 检查是否包含敏感文件
echo ""
echo "📁 检查敏感文件..."
SENSITIVE_FILES=(
    ".dev.vars"
    "wrangler.toml.local"
    "config.env"
)

for file in "${SENSITIVE_FILES[@]}"; do
    if git status --porcelain | grep -E "^[AM].*$file" > /dev/null; then
        echo "❌ 敏感文件被添加到暂存区: $file"
        HAS_SENSITIVE=1
    fi
done

echo ""
if [ $HAS_SENSITIVE -eq 0 ]; then
    echo "✅ 未发现敏感信息，可以安全提交！"
    exit 0
else
    echo "❌ 发现敏感信息，请移除后再提交！"
    echo ""
    echo "💡 提示："
    echo "   1. 使用 'git reset HEAD <file>' 取消暂存"
    echo "   2. 移除敏感信息后重新添加"
    echo "   3. 确保敏感信息配置在 .dev.vars 文件中"
    exit 1
fi
