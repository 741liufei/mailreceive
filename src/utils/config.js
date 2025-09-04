/**
 * 配置管理工具类
 * 
 * 负责管理应用的所有配置项，包括环境变量验证、配置加载和验证。
 * 支持tempmail.plus服务的配置管理。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

import { LOCAL_CONFIG } from '../config/localConfig.js';

/**
 * 配置验证错误类型枚举
 */
const CONFIG_ERRORS = {
  EMAIL_NOT_CONFIGURED: 'TEMPMAIL_PLUS_EMAIL环境变量未配置',
  PIN_NOT_CONFIGURED: 'TEMPMAIL_PLUS_PIN环境变量未配置',
  INVALID_EMAIL_FORMAT: '配置的邮箱地址格式无效',
  INVALID_PIN_FORMAT: '配置的PIN码格式无效',
  API_URL_NOT_CONFIGURED: 'TEMPMAIL_PLUS_API_URL环境变量未配置',
  SESSION_TIMEOUT_INVALID: 'SESSION_TIMEOUT配置无效',
  VERIFICATION_TIMEOUT_INVALID: 'VERIFICATION_TIMEOUT配置无效'
};

/**
 * 配置管理类
 */
class ConfigManager {
  constructor() {
    this.config = null;
    this.isValidated = false;
  }

  /**
   * 获取应用配置
   * 
   * 从环境变量中加载配置，并进行验证。
   * 如果配置无效，将抛出相应的错误。
   * 
   * @param {Object} env 环境变量对象
   * @returns {Object} 配置对象
   * @throws {Error} 配置验证失败时抛出错误
   */
  getConfig(env = {}) {
    if (this.config && this.isValidated) {
      return this.config;
    }

    this.config = {
      // 邮箱服务配置
      emailService: {
        actualEmail: this.getEnvVar('ACTUAL_EMAIL', env),
        actualEmailPin: this.getEnvVar('ACTUAL_EMAIL_PIN', env),
        apiUrl: this.getEnvVar('EMAIL_API_URL', env) || 'https://tempmail.plus/api'
      },
      
      // 会话配置
      session: {
        timeout: parseInt(this.getEnvVar('SESSION_TIMEOUT', env)) || 1800, // 30分钟
        verificationTimeout: parseInt(this.getEnvVar('VERIFICATION_TIMEOUT', env)) || 180 // 3分钟
      },
      
      // 应用配置
      app: {
        maxRetryAttempts: parseInt(this.getEnvVar('MAX_RETRY_ATTEMPTS', env)) || 3,
        pinLength: parseInt(this.getEnvVar('PIN_LENGTH', env)) || 8
      }
    };

    this.validateConfig();
    this.isValidated = true;
    
    return this.config;
  }

  /**
   * 获取环境变量值
   * 
   * 优先从env参数获取，然后从本地配置文件获取
   * 
   * @param {string} key 环境变量键名
   * @param {Object} env 环境变量对象
   * @returns {string} 环境变量值
   */
  getEnvVar(key, env = {}) {
    // 优先级：env参数 > 本地配置文件 > globalThis > process.env
    return env[key] || LOCAL_CONFIG[key] || globalThis[key] || (typeof process !== 'undefined' ? process.env[key] : undefined);
  }

  /**
   * 验证配置的有效性
   * 
   * 检查所有必需的配置项是否存在且格式正确。
   * 如果验证失败，将抛出详细的错误信息。
   * 
   * @throws {Error} 配置验证失败时抛出错误
   */
  validateConfig() {
    const { emailService, session, app } = this.config;

    // 验证实际邮箱配置
    if (!emailService.actualEmail) {
      throw new Error(CONFIG_ERRORS.EMAIL_NOT_CONFIGURED);
    }

    if (!this.isValidEmail(emailService.actualEmail)) {
      throw new Error(CONFIG_ERRORS.INVALID_EMAIL_FORMAT);
    }

    // 验证PIN码配置
    if (!emailService.actualEmailPin) {
      throw new Error(CONFIG_ERRORS.PIN_NOT_CONFIGURED);
    }

    if (!this.isValidPin(emailService.actualEmailPin)) {
      throw new Error(CONFIG_ERRORS.INVALID_PIN_FORMAT);
    }

    // 验证超时配置
    if (session.timeout <= 0 || session.timeout > 3600) {
      throw new Error(CONFIG_ERRORS.SESSION_TIMEOUT_INVALID);
    }

    if (session.verificationTimeout <= 0 || session.verificationTimeout > 600) {
      throw new Error(CONFIG_ERRORS.VERIFICATION_TIMEOUT_INVALID);
    }
  }

  /**
   * 验证邮箱地址格式
   * 
   * 使用正则表达式验证邮箱地址的格式是否正确。
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
   * 验证PIN码是否为有效的格式（字母数字组合，长度6-12位）。
   * 
   * @param {string} pin PIN码
   * @returns {boolean} PIN码格式是否有效
   */
  isValidPin(pin) {
    const pinRegex = /^[a-zA-Z0-9]{6,12}$/;
    return pinRegex.test(pin);
  }

  /**
   * 获取配置状态信息
   * 
   * 返回当前配置的状态信息，用于调试和监控。
   * 
   * @returns {Object} 配置状态对象
   */
  getConfigStatus() {
    try {
      const config = this.getConfig();
      return {
        configured: true,
        actualEmail: config.emailService.actualEmail,
        configValid: true,
        sessionTimeout: config.session.timeout,
        verificationTimeout: config.session.verificationTimeout
      };
    } catch (error) {
      return {
        configured: false,
        actualEmail: null,
        configValid: false,
        error: error.message
      };
    }
  }

  /**
   * 重新加载配置
   * 
   * 清除缓存的配置，强制重新从环境变量加载。
   * 用于配置热更新场景。
   * 
   * @param {Object} env 环境变量对象
   * @returns {Object} 配置对象
   */
  reloadConfig(env = {}) {
    this.config = null;
    this.isValidated = false;
    return this.getConfig(env);
  }
}

// 创建全局配置管理器实例
const configManager = new ConfigManager();

// 导出配置管理器和错误类型
export { configManager, CONFIG_ERRORS };
export default configManager;
