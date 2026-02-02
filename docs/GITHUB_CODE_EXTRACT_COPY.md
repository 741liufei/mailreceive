# GitHub 验证码提取 - 快速复制版

## 🚀 核心代码（可直接复制）

### JavaScript 版本

```javascript
// ============================================
// GitHub 验证码提取 - 完整实现
// ============================================

/**
 * GitHub 验证码提取策略配置
 */
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

/**
 * 从邮件内容中提取验证码
 * @param {string} content - 邮件内容（优先使用纯文本）
 * @returns {Object} 提取结果 { success, code, patternDescription, matchedText }
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
      const regex = new RegExp(strategy.pattern, strategy.flags);
      const match = content.match(regex);
      
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

  return {
    success: false,
    code: null,
    message: '未找到匹配的验证码模式'
  };
}

/**
 * 获取 GitHub 验证码（完整流程）
 * @param {string} userEmail - 用户邮箱地址
 * @returns {Promise<Object>} 验证码信息
 */
async function getGithubCode(userEmail) {
  try {
    console.log('🔄 开始获取 GitHub 验证码...');
    
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
    console.log('用户邮箱后缀:', emailSuffix);
    
    const matchingEmails = emails.filter(email => {
      const fromEmail = email.from || '';
      const fromSuffix = fromEmail.split('@')[1];
      return fromSuffix === emailSuffix;
    });
    
    console.log('按邮箱后缀筛选后的邮件数量:', matchingEmails.length);
    
    if (matchingEmails.length === 0) {
      throw new Error('未找到匹配邮箱后缀的邮件');
    }
    
    // 3. 按时间排序（最新的在前）
    const sortedEmails = matchingEmails.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    // 4. 逐个检查邮件，查找 GitHub 验证码
    let foundCode = null;
    let foundEmail = null;
    let foundPattern = null;
    
    for (let i = 0; i < sortedEmails.length; i++) {
      const email = sortedEmails[i];
      console.log(`\n检查第 ${i + 1}/${sortedEmails.length} 封邮件:`, email.subject);
      
      try {
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
        console.log('邮件内容长度:', rawContent.length);
        
        const extractResult = extractVerificationCode(rawContent);
        
        if (extractResult.success) {
          console.log('✅ 找到验证码:', extractResult.code);
          console.log('使用的模式:', extractResult.patternDescription);
          
          foundCode = extractResult.code;
          foundEmail = emailData;
          foundPattern = extractResult.patternDescription;
          break; // 找到验证码，停止搜索
        } else {
          console.log('❌ 未找到验证码:', extractResult.message);
        }
        
        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error('处理邮件失败:', error);
        continue;
      }
    }
    
    // 5. 返回结果
    if (!foundCode || !foundEmail) {
      throw new Error(`未在 ${sortedEmails.length} 封邮件中找到 GitHub 验证码`);
    }
    
    return {
      success: true,
      code: foundCode,
      email: {
        id: foundEmail.id,
        subject: foundEmail.subject,
        from: foundEmail.from,
        date: foundEmail.date
      },
      pattern: foundPattern
    };
    
  } catch (error) {
    console.error('获取 GitHub 验证码失败:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// ============================================
// 使用示例
// ============================================

// 示例 1: 提取验证码
const emailContent = `
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003
`;

const result = extractVerificationCode(emailContent);
console.log(result);
// 输出: { success: true, code: '70685003', ... }

// 示例 2: 获取 GitHub 验证码
async function example() {
  const userEmail = 'user@example.com';
  const result = await getGithubCode(userEmail);
  
  if (result.success) {
    console.log('验证码:', result.code);
    console.log('邮件主题:', result.email.subject);
  } else {
    console.error('错误:', result.message);
  }
}
```

### Python 版本

```python
import re
from typing import Dict, List, Optional
from datetime import datetime

# ============================================
# GitHub 验证码提取 - Python 实现
# ============================================

# GitHub 验证码提取策略配置
GITHUB_EXTRACTION_STRATEGY = [
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

def extract_verification_code(content: str) -> Dict:
    """
    从邮件内容中提取验证码
    
    Args:
        content: 邮件内容（优先使用纯文本）
        
    Returns:
        提取结果字典 { success, code, pattern_description, matched_text }
    """
    if not content or not isinstance(content, str):
        return {
            'success': False,
            'code': None,
            'message': '无效的邮件内容'
        }
    
    # 遍历所有提取策略
    for strategy in GITHUB_EXTRACTION_STRATEGY:
        try:
            match = re.search(strategy['pattern'], content, strategy['flags'])
            
            if match and len(match.groups()) > 0:
                print(f"✅ 成功提取验证码: {match.group(1)}")
                print(f"使用的模式: {strategy['description']}")
                
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

# ============================================
# 使用示例
# ============================================

# 示例 1: 提取验证码
email_content = """
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003
"""

result = extract_verification_code(email_content)
print(result)
# 输出: {'success': True, 'code': '70685003', ...}

# 示例 2: 批量处理
def process_emails(emails: List[Dict]) -> Optional[str]:
    """
    从邮件列表中查找并提取 GitHub 验证码
    
    Args:
        emails: 邮件列表
        
    Returns:
        验证码字符串，如果未找到则返回 None
    """
    for email in emails:
        # 检查是否是 GitHub 邮件
        from_email = email.get('from', '').lower()
        if 'github' not in from_email:
            continue
        
        # 提取验证码
        content = email.get('text') or email.get('content', '')
        result = extract_verification_code(content)
        
        if result['success']:
            return result['code']
    
    return None
```

## 📋 关键要点

### 1. 正则表达式模式（按优先级）

```javascript
// 模式 1: launch code 后的 8 位数字（最精确）
'launch code[!\\s]*[\\s\\S]*?(\\d{8})'

// 模式 2: entering the code below 后的 8 位数字
'entering the code below[:\\s]*(\\d{8})'

// 模式 3: 独立的 8 位数字（备用）
'\\b\\d{8}\\b'
```

### 2. 邮件筛选逻辑

```javascript
// 步骤 1: 按邮箱后缀筛选
const emailSuffix = userEmail.split('@')[1];
const matchingEmails = emails.filter(email => {
  const fromSuffix = email.from.split('@')[1];
  return fromSuffix === emailSuffix;
});

// 步骤 2: 按时间排序（最新的在前）
const sortedEmails = matchingEmails.sort((a, b) => {
  return new Date(b.date) - new Date(a.date);
});

// 步骤 3: 验证是否来自 GitHub
const isFromGithub = fromEmail.includes('github.com') || fromEmail.includes('github');
```

### 3. 优先使用纯文本

```javascript
// 优先使用 text 字段，避免 HTML 标签干扰
const rawContent = emailData.text || emailData.content || '';
```

## 🎯 测试用例

### 测试内容 1: 标准格式

```
Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003
```

**预期**: ✅ 提取到 `70685003`

### 测试内容 2: 简化格式

```
GitHub Verification

Please enter the code below:

12345678
```

**预期**: ✅ 提取到 `12345678`

### 测试内容 3: OAuth 通知

```
[GitHub] A third-party OAuth application has been added to your account
```

**预期**: ❌ 未找到验证码（正确行为）

## 💡 集成建议

### 前端集成

```javascript
// 在按钮点击事件中调用
async function handleGetGithubCode() {
  const userEmail = document.getElementById('userEmail').value;
  const result = await getGithubCode(userEmail);
  
  if (result.success) {
    // 显示验证码
    displayCode(result.code);
  } else {
    // 显示错误
    showError(result.message);
  }
}
```

### 后端集成

```javascript
// Express.js 路由示例
app.get('/api/github-code', async (req, res) => {
  const { userEmail } = req.query;
  
  try {
    const result = await getGithubCode(userEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

## 🔧 调试技巧

### 1. 启用详细日志

```javascript
// 在提取函数中添加日志
console.log('邮件内容:', content.substring(0, 200));
console.log('正则表达式:', strategy.pattern);
console.log('匹配结果:', match);
```

### 2. 测试正则表达式

使用 [Regex101](https://regex101.com/) 在线测试工具验证正则表达式。

### 3. 检查邮件格式

```javascript
// 打印邮件的所有字段
console.log('邮件字段:', Object.keys(emailData));
console.log('text 字段:', emailData.text);
console.log('content 字段:', emailData.content);
```

---

**提示**: 这份文档包含了所有必要的代码，可以直接复制到你的项目中使用！
