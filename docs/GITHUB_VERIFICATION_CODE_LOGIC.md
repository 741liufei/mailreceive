# GitHub 验证码识别逻辑

本文档详细说明了如何识别和提取 GitHub 邮件中的验证码。

## 📋 目录

- [验证码格式说明](#验证码格式说明)
- [正则表达式配置](#正则表达式配置)
- [前端实现](#前端实现)
- [后端实现](#后端实现)
- [完整示例](#完整示例)

## 🎯 验证码格式说明

### GitHub 验证码特征

GitHub 发送的验证码邮件有以下特征：

1. **发件人**: `noreply@github.com` 或包含 `github` 的邮箱
2. **验证码格式**: 8 位纯数字
3. **邮件主题**: 通常包含 "launch code" 或 "verification code"
4. **邮件内容**: 包含特定的关键词和验证码

### 邮件内容示例

```
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003

You can enter it by visiting the link below:
https://github.com/account_verifications?verification=xxx

Not able to enter the code? Paste the following link into your browser:
https://github.com/account_verifications/confirm/xxx/70685003
```

## 🔧 正则表达式配置

### 1. 正则表达式模式定义

```javascript
// GitHub 验证码正则表达式模式
const GITHUB_REGEX_PATTERNS = {
  // 模式 1: launch code 后的 8 位数字
  LAUNCH_CODE: 'launch code[!\\s]*[\\s\\S]*?(\\d{8})',
  
  // 模式 2: entering the code below 后的 8 位数字
  ENTERING_CODE: 'entering the code below[:\\s]*(\\d{8})',
  
  // 模式 3: 独立的 8 位数字（备用）
  EIGHT_DIGITS: '\\b\\d{8}\\b'
};

// 正则表达式标志
const REGEX_FLAGS = {
  CASE_INSENSITIVE: 'i',
  GLOBAL: 'g'
};
```

### 2. 提取策略配置

```javascript
// 按优先级排序的提取策略
const GITHUB_EXTRACTION_STRATEGY = [
  {
    name: 'GITHUB_LAUNCH_CODE',
    pattern: GITHUB_REGEX_PATTERNS.LAUNCH_CODE,
    flags: REGEX_FLAGS.CASE_INSENSITIVE,
    description: 'GitHub 模式：launch code 后的 8 位数字'
  },
  {
    name: 'GITHUB_ENTERING_CODE',
    pattern: GITHUB_REGEX_PATTERNS.ENTERING_CODE,
    flags: REGEX_FLAGS.CASE_INSENSITIVE,
    description: 'GitHub 模式：entering the code below 后的 8 位数字'
  },
  {
    name: 'EIGHT_DIGITS',
    pattern: GITHUB_REGEX_PATTERNS.EIGHT_DIGITS,
    flags: REGEX_FLAGS.GLOBAL,
    description: '通用模式：8 位数字'
  }
];
```

## 💻 前端实现

### 1. 验证码提取函数

```javascript
/**
 * 从邮件内容中提取验证码
 * @param {string} content - 邮件内容（文本或 HTML）
 * @returns {Object} 提取结果
 */
function extractVerificationCode(content) {
  if (!content || typeof content !== 'string') {
    return {
      success: false,
      code: null,
      message: '无效的邮件内容'
    };
  }

  // 遍历所有提取策略
  for (let i = 0; i < GITHUB_EXTRACTION_STRATEGY.length; i++) {
    const strategy = GITHUB_EXTRACTION_STRATEGY[i];
    
    try {
      // 创建正则表达式对象
      const regex = new RegExp(strategy.pattern, strategy.flags);
      const match = content.match(regex);
      
      // 检查是否匹配成功
      if (match && match[1]) {
        console.log('✅ 成功提取验证码:', match[1]);
        console.log('使用的模式:', strategy.description);
        
        return {
          success: true,
          code: match[1],
          patternName: strategy.name,
          patternDescription: strategy.description,
          matchedText: match[0]
        };
      }
    } catch (error) {
      console.error(`正则表达式执行错误 [${strategy.name}]:`, error);
      continue;
    }
  }

  // 未找到验证码
  return {
    success: false,
    code: null,
    message: '未找到匹配的验证码模式'
  };
}
```

### 2. GitHub 验证码获取函数

```javascript
/**
 * 获取 GitHub 验证码
 * @param {string} userEmail - 用户邮箱地址
 * @returns {Promise<Object>} 验证码信息
 */
async function getGithubCode(userEmail) {
  try {
    // 1. 获取邮件列表
    const response = await fetch(`/api/session/emails?userEmail=${encodeURIComponent(userEmail)}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    const emails = result.data.emails || [];
    if (emails.length === 0) {
      throw new Error('未找到任何邮件');
    }
    
    // 2. 按邮箱后缀筛选邮件
    const emailSuffix = userEmail.split('@')[1];
    const matchingEmails = emails.filter(email => {
      const fromEmail = email.from || '';
      const fromSuffix = fromEmail.split('@')[1];
      return fromSuffix === emailSuffix;
    });
    
    if (matchingEmails.length === 0) {
      throw new Error('未找到匹配邮箱后缀的邮件');
    }
    
    // 3. 按时间排序（最新的在前）
    const sortedEmails = matchingEmails.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    // 4. 逐个检查邮件，查找 GitHub 验证码
    for (let i = 0; i < sortedEmails.length; i++) {
      const email = sortedEmails[i];
      console.log(`检查第 ${i + 1}/${sortedEmails.length} 封邮件:`, email.subject);
      
      // 获取邮件详情
      const detailResponse = await fetch(
        `/api/session/email-detail?userEmail=${encodeURIComponent(userEmail)}&emailId=${email.id}`
      );
      const detailResult = await detailResponse.json();
      
      if (!detailResult.success) {
        console.log('获取邮件详情失败:', detailResult.message);
        continue;
      }
      
      const emailData = detailResult.data;
      
      // 检查是否是 GitHub 邮件
      const fromEmail = (emailData.from || '').toLowerCase();
      const isFromGithub = fromEmail.includes('github.com') || fromEmail.includes('github');
      
      console.log('发件人:', emailData.from);
      console.log('是否来自 GitHub:', isFromGithub);
      
      if (!isFromGithub) {
        console.log('❌ 不是 GitHub 邮件，跳过');
        continue;
      }
      
      // 提取验证码（优先使用 text 字段）
      const rawContent = emailData.text || emailData.content || '';
      const extractResult = extractVerificationCode(rawContent);
      
      if (extractResult.success) {
        console.log('✅ 找到验证码:', extractResult.code);
        console.log('使用的模式:', extractResult.patternDescription);
        
        return {
          success: true,
          code: extractResult.code,
          email: emailData,
          pattern: extractResult.patternDescription
        };
      } else {
        console.log('❌ 未找到验证码:', extractResult.message);
      }
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 未找到验证码
    throw new Error(`未在 ${sortedEmails.length} 封邮件中找到 GitHub 验证码`);
    
  } catch (error) {
    console.error('获取 GitHub 验证码失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
}
```

## 🖥️ 后端实现

### Node.js / JavaScript 版本

```javascript
/**
 * 从邮件内容中提取 GitHub 验证码
 * @param {string} content - 邮件内容
 * @returns {Object} 提取结果
 */
function extractGithubCode(content) {
  if (!content || typeof content !== 'string') {
    return {
      success: false,
      code: null,
      message: '无效的邮件内容'
    };
  }

  // GitHub 验证码提取策略
  const strategies = [
    {
      name: 'GITHUB_LAUNCH_CODE',
      pattern: /launch code[!\s]*[\s\S]*?(\d{8})/i,
      description: 'GitHub 模式：launch code 后的 8 位数字'
    },
    {
      name: 'GITHUB_ENTERING_CODE',
      pattern: /entering the code below[:\s]*(\d{8})/i,
      description: 'GitHub 模式：entering the code below 后的 8 位数字'
    },
    {
      name: 'EIGHT_DIGITS',
      pattern: /\b\d{8}\b/g,
      description: '通用模式：8 位数字'
    }
  ];

  // 遍历策略
  for (const strategy of strategies) {
    try {
      const match = content.match(strategy.pattern);
      
      if (match && match[1]) {
        return {
          success: true,
          code: match[1],
          patternName: strategy.name,
          patternDescription: strategy.description,
          matchedText: match[0]
        };
      }
    } catch (error) {
      console.error(`正则表达式执行错误 [${strategy.name}]:`, error);
      continue;
    }
  }

  return {
    success: false,
    code: null,
    message: '未找到匹配的验证码模式'
  };
}

module.exports = { extractGithubCode };
```

### Python 版本

```python
import re
from typing import Dict, Optional

def extract_github_code(content: str) -> Dict:
    """
    从邮件内容中提取 GitHub 验证码
    
    Args:
        content: 邮件内容（文本或 HTML）
        
    Returns:
        包含提取结果的字典
    """
    if not content or not isinstance(content, str):
        return {
            'success': False,
            'code': None,
            'message': '无效的邮件内容'
        }
    
    # GitHub 验证码提取策略
    strategies = [
        {
            'name': 'GITHUB_LAUNCH_CODE',
            'pattern': r'launch code[!\s]*[\s\S]*?(\d{8})',
            'flags': re.IGNORECASE,
            'description': 'GitHub 模式：launch code 后的 8 位数字'
        },
        {
            'name': 'GITHUB_ENTERING_CODE',
            'pattern': r'entering the code below[:\s]*(\d{8})',
            'flags': re.IGNORECASE,
            'description': 'GitHub 模式：entering the code below 后的 8 位数字'
        },
        {
            'name': 'EIGHT_DIGITS',
            'pattern': r'\b\d{8}\b',
            'flags': 0,
            'description': '通用模式：8 位数字'
        }
    ]
    
    # 遍历策略
    for strategy in strategies:
        try:
            match = re.search(strategy['pattern'], content, strategy['flags'])
            
            if match and len(match.groups()) > 0:
                return {
                    'success': True,
                    'code': match.group(1),
                    'pattern_name': strategy['name'],
                    'pattern_description': strategy['description'],
                    'matched_text': match.group(0)
                }
        except Exception as e:
            print(f"正则表达式执行错误 [{strategy['name']}]: {e}")
            continue
    
    return {
        'success': False,
        'code': None,
        'message': '未找到匹配的验证码模式'
    }
```

## 📦 完整示例

### HTML + JavaScript 完整示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>GitHub 验证码提取示例</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
            font-family: monospace;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <h1>GitHub 验证码提取示例</h1>
    
    <div>
        <label for="emailContent">邮件内容：</label>
        <textarea id="emailContent" rows="10" style="width: 100%;">
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003

You can enter it by visiting the link below:
https://github.com/account_verifications?verification=xxx
        </textarea>
    </div>
    
    <button onclick="extractCode()">提取验证码</button>
    
    <div id="result"></div>

    <script>
        // GitHub 验证码提取策略
        const GITHUB_EXTRACTION_STRATEGY = [
          {
            name: 'GITHUB_LAUNCH_CODE',
            pattern: 'launch code[!\\s]*[\\s\\S]*?(\\d{8})',
            flags: 'i',
            description: 'GitHub 模式：launch code 后的 8 位数字'
          },
          {
            name: 'GITHUB_ENTERING_CODE',
            pattern: 'entering the code below[:\\s]*(\\d{8})',
            flags: 'i',
            description: 'GitHub 模式：entering the code below 后的 8 位数字'
          },
          {
            name: 'EIGHT_DIGITS',
            pattern: '\\b\\d{8}\\b',
            flags: 'g',
            description: '通用模式：8 位数字'
          }
        ];

        function extractVerificationCode(content) {
          if (!content || typeof content !== 'string') {
            return {
              success: false,
              code: null,
              message: '无效的邮件内容'
            };
          }

          for (let i = 0; i < GITHUB_EXTRACTION_STRATEGY.length; i++) {
            const strategy = GITHUB_EXTRACTION_STRATEGY[i];
            
            try {
              const regex = new RegExp(strategy.pattern, strategy.flags);
              const match = content.match(regex);
              
              if (match && match[1]) {
                return {
                  success: true,
                  code: match[1],
                  patternName: strategy.name,
                  patternDescription: strategy.description,
                  matchedText: match[0]
                };
              }
            } catch (error) {
              console.error(`正则表达式执行错误 [${strategy.name}]:`, error);
              continue;
            }
          }

          return {
            success: false,
            code: null,
            message: '未找到匹配的验证码模式'
          };
        }

        function extractCode() {
          const content = document.getElementById('emailContent').value;
          const result = extractVerificationCode(content);
          const resultDiv = document.getElementById('result');
          
          if (result.success) {
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `
              <h3>✅ 提取成功</h3>
              <div class="code">${result.code}</div>
              <p><strong>使用模式：</strong>${result.patternDescription}</p>
              <p><strong>匹配文本：</strong>${result.matchedText}</p>
            `;
          } else {
            resultDiv.className = 'result error';
            resultDiv.innerHTML = `
              <h3>❌ 提取失败</h3>
              <p>${result.message}</p>
            `;
          }
        }
    </script>
</body>
</html>
```

## 🔍 测试用例

### 测试邮件内容 1

```
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003
```

**预期结果**: 提取到验证码 `70685003`

### 测试邮件内容 2

```
GitHub Verification

Please enter the code below:

12345678

This code will expire in 10 minutes.
```

**预期结果**: 提取到验证码 `12345678`

### 测试邮件内容 3

```
[GitHub] A third-party OAuth application has been added to your account
```

**预期结果**: 未找到验证码（这是 OAuth 通知邮件，不包含验证码）

## 💡 使用建议

### 1. 优先使用 text 字段

```javascript
// 优先使用纯文本内容，避免 HTML 标签干扰
const rawContent = emailData.text || emailData.content || '';
const extractResult = extractVerificationCode(rawContent);
```

### 2. 验证发件人

```javascript
// 确保邮件来自 GitHub
const fromEmail = (emailData.from || '').toLowerCase();
const isFromGithub = fromEmail.includes('github.com') || fromEmail.includes('github');

if (!isFromGithub) {
  console.log('不是 GitHub 邮件，跳过');
  continue;
}
```

### 3. 按时间排序

```javascript
// 优先检查最新的邮件
const sortedEmails = emails.sort((a, b) => {
  return new Date(b.date) - new Date(a.date);
});
```

### 4. 添加日志

```javascript
console.log('检查邮件:', email.subject);
console.log('发件人:', emailData.from);
console.log('是否来自 GitHub:', isFromGithub);
console.log('提取结果:', extractResult);
```

## 🚀 性能优化

### 1. 添加延迟避免请求过快

```javascript
// 每次请求后延迟 300ms
await new Promise(resolve => setTimeout(resolve, 300));
```

### 2. 限制检查邮件数量

```javascript
// 只检查最近的 10 封邮件
const recentEmails = sortedEmails.slice(0, 10);
```

### 3. 找到验证码后立即停止

```javascript
if (extractResult.success) {
  console.log('✅ 找到验证码，停止搜索');
  return extractResult;
}
```

## 📝 注意事项

1. **正则表达式优先级**: 按照从具体到通用的顺序排列
2. **错误处理**: 每个正则表达式都要有 try-catch 保护
3. **日志记录**: 详细记录每一步的执行情况，便于调试
4. **性能考虑**: 避免过度请求，添加适当的延迟
5. **兼容性**: 确保正则表达式在不同环境下都能正常工作

## 🔗 相关资源

- [MDN - 正则表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)
- [Regex101 - 正则表达式测试工具](https://regex101.com/)
- [GitHub API 文档](https://docs.github.com/en/rest)

---

**最后更新**: 2026-02-02
