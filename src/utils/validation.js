/**
 * 输入验证工具类
 * 
 * 提供各种输入验证功能，包括邮箱验证、PIN码验证、会话ID验证等。
 * 确保所有用户输入和API参数都经过严格验证。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * 验证错误类型枚举
 */
const VALIDATION_ERRORS = {
  INVALID_EMAIL: '邮箱地址格式无效',
  INVALID_PIN: 'PIN码格式无效',
  INVALID_SESSION_ID: '会话ID格式无效',
  INVALID_TIMEOUT: '超时时间无效',
  INVALID_USER_EMAIL: '用户邮箱地址格式无效',
  MISSING_REQUIRED_FIELD: '缺少必需字段',
  FIELD_TOO_LONG: '字段长度超出限制',
  FIELD_TOO_SHORT: '字段长度不足'
};

/**
 * 验证规则配置
 */
const VALIDATION_RULES = {
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    minLength: 5
  },
  PIN: {
    pattern: /^[a-zA-Z0-9]{6,12}$/,
    maxLength: 12,
    minLength: 6
  },
  SESSION_ID: {
    pattern: /^[a-zA-Z0-9]{16,32}$/,
    maxLength: 32,
    minLength: 16
  },
  TIMEOUT: {
    min: 30,
    max: 3600
  },
  USER_EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    minLength: 5
  }
};

/**
 * 验证工具类
 */
class ValidationUtil {
  /**
   * 验证邮箱地址格式
   * 
   * @param {string} email 邮箱地址
   * @returns {Object} 验证结果 { isValid: boolean, error: string }
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_EMAIL };
    }

    if (email.length < VALIDATION_RULES.EMAIL.minLength) {
      return { isValid: false, error: VALIDATION_ERRORS.FIELD_TOO_SHORT };
    }

    if (email.length > VALIDATION_RULES.EMAIL.maxLength) {
      return { isValid: false, error: VALIDATION_ERRORS.FIELD_TOO_LONG };
    }

    if (!VALIDATION_RULES.EMAIL.pattern.test(email)) {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_EMAIL };
    }

    return { isValid: true, error: null };
  }

  /**
   * 验证PIN码格式
   * 
   * @param {string} pin PIN码
   * @returns {Object} 验证结果 { isValid: boolean, error: string }
   */
  static validatePin(pin) {
    if (!pin || typeof pin !== 'string') {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_PIN };
    }

    if (pin.length < VALIDATION_RULES.PIN.minLength) {
      return { isValid: false, error: VALIDATION_ERRORS.FIELD_TOO_SHORT };
    }

    if (pin.length > VALIDATION_RULES.PIN.maxLength) {
      return { isValid: false, error: VALIDATION_ERRORS.FIELD_TOO_LONG };
    }

    if (!VALIDATION_RULES.PIN.pattern.test(pin)) {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_PIN };
    }

    return { isValid: true, error: null };
  }

  /**
   * 验证会话ID格式
   * 
   * @param {string} sessionId 会话ID
   * @returns {Object} 验证结果 { isValid: boolean, error: string }
   */
  static validateSessionId(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_SESSION_ID };
    }

    if (sessionId.length < VALIDATION_RULES.SESSION_ID.minLength) {
      return { isValid: false, error: VALIDATION_ERRORS.FIELD_TOO_SHORT };
    }

    if (sessionId.length > VALIDATION_RULES.SESSION_ID.maxLength) {
      return { isValid: false, error: VALIDATION_ERRORS.FIELD_TOO_LONG };
    }

    if (!VALIDATION_RULES.SESSION_ID.pattern.test(sessionId)) {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_SESSION_ID };
    }

    return { isValid: true, error: null };
  }

  /**
   * 验证超时时间
   * 
   * @param {number} timeout 超时时间(秒)
   * @returns {Object} 验证结果 { isValid: boolean, error: string }
   */
  static validateTimeout(timeout) {
    if (typeof timeout !== 'number' || isNaN(timeout)) {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_TIMEOUT };
    }

    if (timeout < VALIDATION_RULES.TIMEOUT.min) {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_TIMEOUT };
    }

    if (timeout > VALIDATION_RULES.TIMEOUT.max) {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_TIMEOUT };
    }

    return { isValid: true, error: null };
  }

  /**
   * 验证用户邮箱地址
   * 
   * @param {string} userEmail 用户邮箱地址
   * @returns {Object} 验证结果 { isValid: boolean, error: string }
   */
  static validateUserEmail(userEmail) {
    if (!userEmail || typeof userEmail !== 'string') {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_USER_EMAIL };
    }

    if (userEmail.length < VALIDATION_RULES.USER_EMAIL.minLength) {
      return { isValid: false, error: VALIDATION_ERRORS.FIELD_TOO_SHORT };
    }

    if (userEmail.length > VALIDATION_RULES.USER_EMAIL.maxLength) {
      return { isValid: false, error: VALIDATION_ERRORS.FIELD_TOO_LONG };
    }

    if (!VALIDATION_RULES.USER_EMAIL.pattern.test(userEmail)) {
      return { isValid: false, error: VALIDATION_ERRORS.INVALID_USER_EMAIL };
    }

    return { isValid: true, error: null };
  }

  /**
   * 验证必需字段
   * 
   * @param {Object} data 数据对象
   * @param {Array} requiredFields 必需字段数组
   * @returns {Object} 验证结果 { isValid: boolean, errors: Array }
   */
  static validateRequiredFields(data, requiredFields) {
    const errors = [];

    for (const field of requiredFields) {
      if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push(`${field}: ${VALIDATION_ERRORS.MISSING_REQUIRED_FIELD}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证创建会话请求参数
   * 
   * @param {Object} requestData 请求数据
   * @returns {Object} 验证结果 { isValid: boolean, errors: Array }
   */
  static validateCreateSessionRequest(requestData) {
    const errors = [];

    // 验证必需字段
    const requiredValidation = this.validateRequiredFields(requestData, ['userEmail']);
    if (!requiredValidation.isValid) {
      errors.push(...requiredValidation.errors);
    }

    // 验证用户邮箱格式
    if (requestData.userEmail) {
      const emailValidation = this.validateUserEmail(requestData.userEmail);
      if (!emailValidation.isValid) {
        errors.push(`userEmail: ${emailValidation.error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证PIN码验证请求参数
   * 
   * @param {Object} requestData 请求数据
   * @returns {Object} 验证结果 { isValid: boolean, errors: Array }
   */
  static validatePinVerificationRequest(requestData) {
    const errors = [];

    // 验证必需字段
    const requiredValidation = this.validateRequiredFields(requestData, ['sessionId', 'pinCode']);
    if (!requiredValidation.isValid) {
      errors.push(...requiredValidation.errors);
    }

    // 验证会话ID格式
    if (requestData.sessionId) {
      const sessionIdValidation = this.validateSessionId(requestData.sessionId);
      if (!sessionIdValidation.isValid) {
        errors.push(`sessionId: ${sessionIdValidation.error}`);
      }
    }

    // 验证PIN码格式
    if (requestData.pinCode) {
      const pinValidation = this.validatePin(requestData.pinCode);
      if (!pinValidation.isValid) {
        errors.push(`pinCode: ${pinValidation.error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证获取验证码请求参数
   * 
   * @param {Object} requestData 请求数据
   * @returns {Object} 验证结果 { isValid: boolean, errors: Array }
   */
  static validateGetVerificationCodeRequest(requestData) {
    const errors = [];

    // 验证必需字段
    const requiredValidation = this.validateRequiredFields(requestData, ['sessionId']);
    if (!requiredValidation.isValid) {
      errors.push(...requiredValidation.errors);
    }

    // 验证会话ID格式
    if (requestData.sessionId) {
      const sessionIdValidation = this.validateSessionId(requestData.sessionId);
      if (!sessionIdValidation.isValid) {
        errors.push(`sessionId: ${sessionIdValidation.error}`);
      }
    }

    // 验证超时时间(可选)
    if (requestData.timeout !== undefined) {
      const timeoutValidation = this.validateTimeout(requestData.timeout);
      if (!timeoutValidation.isValid) {
        errors.push(`timeout: ${timeoutValidation.error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 清理和标准化输入数据
   * 
   * @param {string} input 输入字符串
   * @returns {string} 清理后的字符串
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') {
      return '';
    }

    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * 生成验证错误响应
   * 
   * @param {Array} errors 错误数组
   * @returns {string} 格式化的错误消息
   */
  static formatValidationErrors(errors) {
    if (!Array.isArray(errors) || errors.length === 0) {
      return '输入验证失败';
    }

    return errors.join('; ');
  }
}

// 导出验证工具类和错误类型
export { ValidationUtil, VALIDATION_ERRORS, VALIDATION_RULES };
export default ValidationUtil;
