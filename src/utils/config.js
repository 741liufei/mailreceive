/**
 * 简化配置管理工具类
 * 
 * 负责管理tempmail.plus服务的基本配置。
 * 
 * @author mailreceive
 * @version 2.0.0
 * @since 2024-01-01
 */

/**
 * 配置验证错误类型枚举
 */
const CONFIG_ERRORS = {
  EMAIL_NOT_CONFIGURED: 'TEMPMAIL_PLUS_EMAIL环境变量未配置',
  PIN_NOT_CONFIGURED: 'TEMPMAIL_PLUS_PIN环境变量未配置',
  INVALID_EMAIL_FORMAT: '配置的邮箱地址格式无效',
  INVALID_PIN_FORMAT: '配置的PIN码格式无效'
};

/**
 * 简化的配置管理类
 */
class ConfigManager {
  /**
   * 获取应用配置
   * 
   * 从环境变量中加载配置，并进行验证。
   * 
   * @param {Object} env 环境变量对象
   * @returns {Object} 配置对象
   * @throws {Error} 配置验证失败时抛出错误
   */
  getConfig(env = {}) {
    const config = {
      emailService: {
        actualEmail: this.getEnvVar('TEMPMAIL_PLUS_EMAIL', env),
        actualEmailPin: this.getEnvVar('TEMPMAIL_PLUS_PIN', env),
        apiUrl: this.getEnvVar('EMAIL_API_URL', env) || 'https://tempmail.plus/api'
      }
    };

    this.validateConfig(config);
    return config;
  }

  /**
   * 获取环境变量值
   * 
   * @param {string} key 环境变量键名
   * @param {Object} env 环境变量对象
   * @returns {string} 环境变量值
   */
  getEnvVar(key, env = {}) {
    return env[key] || globalThis[key] || (typeof process !== 'undefined' ? process.env[key] : undefined);
  }

  /**
   * 验证配置的有效性
   * 
   * @param {Object} config 配置对象
   * @throws {Error} 配置验证失败时抛出错误
   */
  validateConfig(config) {
    const { emailService } = config;

    if (!emailService.actualEmail) {
      throw new Error(CONFIG_ERRORS.EMAIL_NOT_CONFIGURED);
    }

    if (!this.isValidEmail(emailService.actualEmail)) {
      throw new Error(CONFIG_ERRORS.INVALID_EMAIL_FORMAT);
    }

    if (!emailService.actualEmailPin) {
      throw new Error(CONFIG_ERRORS.PIN_NOT_CONFIGURED);
    }

    if (!this.isValidPin(emailService.actualEmailPin)) {
      throw new Error(CONFIG_ERRORS.INVALID_PIN_FORMAT);
    }
  }

  /**
   * 验证邮箱地址格式
   * 
   * @param {string} email 邮箱地址
   * @returns {boolean} 邮箱格式是否有效
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证PIN码格式
   * 
   * @param {string} pin PIN码
   * @returns {boolean} PIN码格式是否有效
   */
  isValidPin(pin) {
    const pinRegex = /^[a-zA-Z0-9]{6,12}$/;
    return pinRegex.test(pin);
  }
}

// 创建全局配置管理器实例
const configManager = new ConfigManager();

// 导出配置管理器和错误类型
export { configManager, CONFIG_ERRORS };
export default configManager;
