/**
 * 正则表达式配置模块
 * 
 * 统一管理所有验证码提取相关的正则表达式
 * 避免在模板字符串中直接定义正则表达式导致的转义问题
 * 
 * @author mailreceive
 * @version 1.0.0
 */

/**
 * 验证码提取正则表达式配置
 * 
 * 注意：这里使用字符串形式定义正则表达式模式，
 * 在客户端会通过new RegExp()动态创建正则对象
 */
export const REGEX_PATTERNS = {
  // 主要验证码模式
  VERIFICATION_CODE_PRIMARY: 'Your verification code is:\\s*(\\d+)',
  VERIFICATION_CODE_SECONDARY: 'verification code is:\\s*(\\d+)',
  CODE_IS: 'code is:\\s*(\\d+)',
  
  // 中文验证码模式
  CHINESE_VERIFICATION: '验证码[：:]\\s*(\\d+)',
  
  // 通用数字模式（备用方案）
  SIX_DIGITS: '\\b\\d{6}\\b',
  FOUR_TO_EIGHT_DIGITS: '\\b\\d{4,8}\\b',
  
  // HTML标签包围的验证码
  HTML_WRAPPED_CODE: 'Your verification code is:\\s*<[^>]*>(\\d+)<\\/[^>]*>'
};

/**
 * 正则表达式标志配置
 */
export const REGEX_FLAGS = {
  CASE_INSENSITIVE: 'i',
  GLOBAL: 'g',
  GLOBAL_CASE_INSENSITIVE: 'gi'
};

/**
 * 验证码提取策略配置
 * 按优先级排序，数组索引越小优先级越高
 */
export const EXTRACTION_STRATEGY = [
  {
    name: 'PRIMARY_PATTERN',
    pattern: REGEX_PATTERNS.VERIFICATION_CODE_PRIMARY,
    flags: REGEX_FLAGS.CASE_INSENSITIVE,
    description: '主要模式：Your verification code is: 数字'
  },
  {
    name: 'SECONDARY_PATTERN', 
    pattern: REGEX_PATTERNS.VERIFICATION_CODE_SECONDARY,
    flags: REGEX_FLAGS.CASE_INSENSITIVE,
    description: '次要模式：verification code is: 数字'
  },
  {
    name: 'CODE_IS_PATTERN',
    pattern: REGEX_PATTERNS.CODE_IS,
    flags: REGEX_FLAGS.CASE_INSENSITIVE,
    description: '简化模式：code is: 数字'
  },
  {
    name: 'CHINESE_PATTERN',
    pattern: REGEX_PATTERNS.CHINESE_VERIFICATION,
    flags: REGEX_FLAGS.CASE_INSENSITIVE,
    description: '中文模式：验证码: 数字'
  },
  {
    name: 'HTML_WRAPPED_PATTERN',
    pattern: REGEX_PATTERNS.HTML_WRAPPED_CODE,
    flags: REGEX_FLAGS.CASE_INSENSITIVE,
    description: 'HTML包围模式：标签内的验证码'
  },
  {
    name: 'SIX_DIGITS_PATTERN',
    pattern: REGEX_PATTERNS.SIX_DIGITS,
    flags: REGEX_FLAGS.GLOBAL,
    description: '通用模式：6位数字'
  },
  {
    name: 'FOUR_TO_EIGHT_DIGITS_PATTERN',
    pattern: REGEX_PATTERNS.FOUR_TO_EIGHT_DIGITS,
    flags: REGEX_FLAGS.GLOBAL,
    description: '通用模式：4-8位数字'
  }
];

/**
 * 客户端JavaScript代码生成器
 * 
 * 生成在浏览器中使用的正则表达式创建代码
 * 
 * @returns {string} 客户端可执行的JavaScript代码
 */
export function generateClientRegexCode() {
  return `
    // 验证码提取正则表达式配置（客户端版本）
    const REGEX_PATTERNS = ${JSON.stringify(REGEX_PATTERNS, null, 2)};
    const REGEX_FLAGS = ${JSON.stringify(REGEX_FLAGS, null, 2)};
    const EXTRACTION_STRATEGY = ${JSON.stringify(EXTRACTION_STRATEGY, null, 2)};
    
    // 动态创建正则表达式对象
    function createRegexPatterns() {
      return EXTRACTION_STRATEGY.map(strategy => ({
        name: strategy.name,
        regex: new RegExp(strategy.pattern, strategy.flags),
        description: strategy.description,
        pattern: strategy.pattern,
        flags: strategy.flags
      }));
    }
    
    // 验证码提取函数
    function extractVerificationCode(content) {
      if (!content || typeof content !== 'string') {
        return null;
      }
      
      const patterns = createRegexPatterns();
      
      for (let i = 0; i < patterns.length; i++) {
        const patternInfo = patterns[i];
        console.log('尝试模式 ' + (i + 1) + ':', patternInfo.description);
        console.log('正则表达式:', patternInfo.regex);
        console.log('模式字符串:', patternInfo.pattern);
        console.log('标志:', patternInfo.flags);
        
        const match = content.match(patternInfo.regex);
        console.log('匹配结果:', match);
        
        if (match && match[1]) {
          console.log('✅ 成功提取验证码:', match[1]);
          return {
            success: true,
            code: match[1],
            patternName: patternInfo.name,
            patternDescription: patternInfo.description,
            matchedText: match[0]
          };
        } else {
          console.log('❌ 模式匹配失败');
        }
      }
      
      return {
        success: false,
        code: null,
        message: '未找到匹配的验证码模式'
      };
    }
    
    // 导出到全局作用域
    window.extractVerificationCode = extractVerificationCode;
    window.createRegexPatterns = createRegexPatterns;
    window.REGEX_PATTERNS = REGEX_PATTERNS;
    window.EXTRACTION_STRATEGY = EXTRACTION_STRATEGY;
  `;
}