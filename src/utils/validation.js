/**
 * 输入验证工具类
 * 
 * 提供基本的输入验证和清理功能。
 * 简化版本，只保留实际使用的功能。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * 验证工具类
 */
class ValidationUtil {
  /**
   * 清理和标准化输入数据
   * 
   * 移除危险字符，防止XSS攻击。
   * 
   * @param {string} input 输入字符串
   * @returns {string} 清理后的字符串
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') {
      return '';
    }

    // 清理输入：去除首尾空格，移除危险的HTML字符
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * 验证邮箱地址基本格式
   * 
   * @param {string} email 邮箱地址
   * @returns {boolean} 邮箱格式是否有效
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    // 基本的邮箱格式检查
    return email.includes('@') && email.includes('.') && email.length >= 5;
  }

  /**
   * 生成验证错误响应
   * 
   * @param {string} message 错误消息
   * @returns {string} 错误消息
   */
  static validationError(message) {
    return message || '输入验证失败';
  }
}

// 导出验证工具类
export { ValidationUtil };
export default ValidationUtil;