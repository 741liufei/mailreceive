/**
 * GitHub 验证码提取测试
 * 
 * 测试新增的正则表达式是否能正确提取 GitHub 格式的验证码
 */

import { EXTRACTION_STRATEGY } from '../src/config/regexConfig.js';

// GitHub 邮件示例文本
const githubEmailText = `Here's your GitHub launch code!

Continue signing up for GitHub by entering the code below:

70685003

You can enter it by visiting the link below:

https://github.com/account_verifications?verification=114b29a9-f838-4730-b1ce-e78636146135&via_launch_code_email=true

You're receiving this email because you recently created a new GitHub account. If this wasn't you, please ignore this email.

Not able to enter the code? Paste the following link into your browser:

https://github.com/account_verifications/confirm/114b29a9-f838-4730-b1ce-e78636146135/70685003

---
Sent with <3 by GitHub.
GitHub, Inc. 88 Colin P Kelly Jr Street
San Francisco, CA 94107`;

/**
 * 验证码提取函数
 */
function extractVerificationCode(content) {
  if (!content || typeof content !== 'string') {
    return {
      success: false,
      code: null,
      message: '无效的邮件内容'
    };
  }

  // 使用模块化的验证码提取策略
  for (let i = 0; i < EXTRACTION_STRATEGY.length; i++) {
    const strategy = EXTRACTION_STRATEGY[i];
    
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

// 执行测试
console.log('=== GitHub 验证码提取测试 ===\n');
console.log('测试文本：');
console.log(githubEmailText);
console.log('\n' + '='.repeat(50) + '\n');

const result = extractVerificationCode(githubEmailText);

if (result.success) {
  console.log('✅ 测试成功！');
  console.log('提取的验证码:', result.code);
  console.log('使用的模式:', result.patternName);
  console.log('模式描述:', result.patternDescription);
  console.log('匹配的文本:', result.matchedText);
} else {
  console.log('❌ 测试失败！');
  console.log('错误信息:', result.message);
}

console.log('\n' + '='.repeat(50));

// 验证结果
const expectedCode = '70685003';
if (result.success && result.code === expectedCode) {
  console.log('\n🎉 验证通过！成功提取到正确的验证码:', expectedCode);
  process.exit(0);
} else {
  console.log('\n❌ 验证失败！');
  console.log('期望的验证码:', expectedCode);
  console.log('实际提取的验证码:', result.code || '无');
  process.exit(1);
}
