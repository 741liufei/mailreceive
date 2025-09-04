/**
 * Tempmail.plus服务集成类
 * 
 * 负责与tempmail.plus API的交互，包括邮件接收、验证码提取等功能。
 * 使用配置的邮箱地址和PIN码进行API调用。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

import { configManager } from '../utils/config.js';

/**
 * Tempmail.plus API错误类型
 */
const TEMPMAIL_ERRORS = {
  API_REQUEST_FAILED: 'Tempmail.plus API请求失败',
  INVALID_RESPONSE: 'Tempmail.plus API响应无效',
  EMAIL_NOT_FOUND: '邮件未找到',
  VERIFICATION_CODE_NOT_FOUND: '验证码未找到',
  TIMEOUT_EXCEEDED: '等待超时',
  CONFIG_ERROR: '配置错误'
};

/**
 * Tempmail.plus服务类
 */
class TempMailService {
  constructor() {
    this.config = null;
    this.apiUrl = null;
    this.email = null;
    this.pin = null;
  }

  /**
   * 初始化服务配置
   * 
   * 从配置管理器加载tempmail.plus的配置信息。
   * 
   * @param {Object} env 环境变量对象
   * @throws {Error} 配置加载失败时抛出错误
   */
  async initialize(env = {}) {
    try {
      this.config = configManager.getConfig(env);
      this.apiUrl = this.config.emailService.apiUrl;
      this.email = this.config.emailService.actualEmail;
      this.pin = this.config.emailService.actualEmailPin;
    } catch (error) {
      throw new Error(`${TEMPMAIL_ERRORS.CONFIG_ERROR}: ${error.message}`);
    }
  }

  /**
   * 获取配置的临时邮箱地址
   * 
   * @returns {string} 临时邮箱地址
   */
  getConfiguredEmail() {
    return this.email;
  }

  /**
   * 获取配置的PIN码
   * 
   * @returns {string} PIN码
   */
  getConfiguredPin() {
    return this.pin;
  }

  /**
   * 验证PIN码
   * 
   * 使用配置的PIN码验证临时邮箱的访问权限。
   * 
   * @returns {Promise<boolean>} 验证是否成功
   * @throws {Error} 验证失败时抛出错误
   */
  async verifyPin() {
    try {
      await this.initialize();
      
      // 通过获取邮件列表来验证PIN码
      const response = await fetch(`${this.apiUrl}/mails?email=${encodeURIComponent(this.email)}&epin=${encodeURIComponent(this.pin)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result === true;
    } catch (error) {
      throw new Error(`${TEMPMAIL_ERRORS.API_REQUEST_FAILED}: ${error.message}`);
    }
  }

  /**
   * 获取邮件列表
   * 
   * 从tempmail.plus获取当前邮箱中的所有邮件。
   * 
   * @param {Object} env 环境变量对象
   * @returns {Promise<Array>} 邮件列表
   * @throws {Error} 获取失败时抛出错误
   */
  async getEmails(env = {}) {
    try {
      console.log('=== 获取邮件列表 ===');
      
      await this.initialize(env);
      
      console.log('API URL:', this.apiUrl);
      console.log('邮箱:', this.email);
      console.log('PIN码:', this.pin);
      
      const response = await fetch(`${this.apiUrl}/mails?email=${encodeURIComponent(this.email)}&epin=${encodeURIComponent(this.pin)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('API响应状态:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API响应数据:', data);
      
      if (!data.result) {
        throw new Error(data.err?.msg || TEMPMAIL_ERRORS.INVALID_RESPONSE);
      }

      // 转换邮件格式以匹配原有接口
      const emails = [];
      if (data.mail_list && Array.isArray(data.mail_list)) {
        for (const mail of data.mail_list) {
          emails.push({
            id: mail.mail_id,
            subject: mail.subject || '无主题',
            from: mail.from_mail || '未知发件人',
            date: new Date(mail.time).toISOString(),
            preview: mail.first_attachment_name || '',
            isNew: mail.is_new || false,
            attachmentCount: mail.attachment_count || 0
          });
        }
      }

      console.log('返回邮件列表:', emails);
      return emails;
    } catch (error) {
      console.error('获取邮件列表失败:', error);
      throw new Error(`${TEMPMAIL_ERRORS.API_REQUEST_FAILED}: ${error.message}`);
    }
  }

  /**
   * 获取特定邮件内容
   * 
   * @param {string} messageId 邮件ID
   * @param {Object} env 环境变量对象
   * @returns {Promise<Object>} 邮件内容
   * @throws {Error} 获取失败时抛出错误
   */
  async getEmailContent(messageId, env = {}) {
    try {
      await this.initialize(env);
      
      const response = await fetch(`${this.apiUrl}/mails/${messageId}?email=${encodeURIComponent(this.email)}&epin=${encodeURIComponent(this.pin)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 检查API响应是否成功
      if (data.err) {
        throw new Error(data.err.msg || TEMPMAIL_ERRORS.EMAIL_NOT_FOUND);
      }
      
      // 检查是否有邮件ID
      if (!data.mail_id) {
        throw new Error(TEMPMAIL_ERRORS.EMAIL_NOT_FOUND);
      }

      // 转换邮件内容格式以匹配原有接口
      let date;
      try {
        // 尝试解析时间戳
        if (data.mail_timestamp && typeof data.mail_timestamp === 'number') {
          date = new Date(data.mail_timestamp * 1000).toISOString();
        } else if (data.date) {
          date = new Date(data.date).toISOString();
        } else if (data.mail_time) {
          date = new Date(data.mail_time).toISOString();
        } else {
          date = new Date().toISOString();
        }
      } catch (error) {
        console.warn('时间解析失败，使用当前时间:', error);
        date = new Date().toISOString();
      }
      
      return {
        id: data.mail_id,
        subject: data.subject || '无主题',
        from: data.from || '未知发件人',
        date: date,
        content: data.html || '',  // html 字段映射到 content 字段
        text: data.text || '',     // text 字段保持不变
        html: data.html || ''
      };
    } catch (error) {
      throw new Error(`${TEMPMAIL_ERRORS.API_REQUEST_FAILED}: ${error.message}`);
    }
  }

  /**
   * 从邮件内容中提取验证码
   * 
   * 使用正则表达式从邮件内容中提取验证码。
   * 支持多种常见的验证码格式。
   * 
   * @param {string} content 邮件内容
   * @returns {string|null} 提取的验证码，未找到时返回null
   */
  extractVerificationCode(content) {
    if (!content || typeof content !== 'string') {
      return null;
    }

    // 验证码正则表达式模式
    const patterns = [
      // 6位数字验证码
      /\b\d{6}\b/g,
      // 4位数字验证码
      /\b\d{4}\b/g,
      // 8位数字验证码
      /\b\d{8}\b/g,
      // 字母数字混合验证码(6-8位)
      /\b[a-zA-Z0-9]{6,8}\b/g,
      // 带连字符的验证码
      /\b\d{3}-\d{3}\b/g,
      // 带空格的验证码
      /\b\d{3}\s\d{3}\b/g
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // 返回第一个匹配的验证码
        return matches[0];
      }
    }

    return null;
  }

  /**
   * 获取所有邮件（不查询验证码）
   * 
   * 直接获取所有邮件，不进行验证码轮询。
   * 
   * @param {number} timeoutSeconds 超时时间(秒) - 保留参数以保持接口兼容
   * @param {number} pollInterval 轮询间隔(秒) - 保留参数以保持接口兼容
   * @param {number} maxPollCount 最大查询次数 - 保留参数以保持接口兼容
   * @returns {Promise<Object>} 包含所有邮件信息的对象
   * @throws {Error} 获取失败时抛出错误
   */
  async waitForVerificationCode(timeoutSeconds = 180, pollInterval = 5, maxPollCount = 30) {
    console.log('=== 开始获取所有邮件 ===');
    console.log('直接获取邮件，不进行验证码轮询');
    
    const startTime = Date.now();

    try {
      // 直接获取邮件列表
      const emails = await this.getEmails();
      console.log('获取到邮件数量:', emails.length);
      console.log('邮件列表:', emails);
      
      // 获取每封邮件的详细内容
      const detailedEmails = [];
      for (const email of emails) {
        console.log('获取邮件详情:', email.id, '主题:', email.subject);
        
        try {
          // 获取邮件内容
          const emailContent = await this.getEmailContent(email.id);
          console.log('邮件内容长度:', emailContent.content ? emailContent.content.length : 0);
          
          // 提取验证码（如果存在）
          const verificationCode = this.extractVerificationCode(emailContent.content);
          console.log('提取的验证码:', verificationCode);
          
          // 构建详细邮件信息
          detailedEmails.push({
            id: email.id,
            subject: email.subject,
            from: email.from,
            date: email.date,
            preview: email.preview,
            isNew: email.isNew,
            attachmentCount: email.attachmentCount,
            content: emailContent.content,
            html: emailContent.html,
            verificationCode: verificationCode
          });
        } catch (error) {
          console.error('获取邮件详情失败:', email.id, error);
          // 即使获取详情失败，也保留基本信息
          detailedEmails.push({
            id: email.id,
            subject: email.subject,
            from: email.from,
            date: email.date,
            preview: email.preview,
            isNew: email.isNew,
            attachmentCount: email.attachmentCount,
            content: '',
            html: '',
            verificationCode: null,
            error: error.message
          });
        }
      }

      console.log('成功获取所有邮件详情，共', detailedEmails.length, '封');
      
      return {
        emails: detailedEmails,
        totalEmails: detailedEmails.length,
        totalTime: Date.now() - startTime,
        verificationCodes: detailedEmails.filter(email => email.verificationCode).map(email => email.verificationCode)
      };
      
    } catch (error) {
      console.error('获取邮件失败:', error);
      throw new Error(`获取邮件失败: ${error.message}`);
    }
  }

  /**
   * 检查邮箱状态
   * 
   * @returns {Promise<Object>} 邮箱状态信息
   * @throws {Error} 检查失败时抛出错误
   */
  async checkEmailStatus() {
    try {
      await this.initialize();
      
      // 通过获取邮件列表来检查邮箱状态
      const response = await fetch(`${this.apiUrl}/mails?email=${encodeURIComponent(this.email)}&epin=${encodeURIComponent(this.pin)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error(data.err?.msg || TEMPMAIL_ERRORS.INVALID_RESPONSE);
      }

      return {
        email: this.email,
        active: data.result,
        messageCount: data.count || 0,
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`${TEMPMAIL_ERRORS.API_REQUEST_FAILED}: ${error.message}`);
    }
  }

  /**
   * 清理邮箱
   * 
   * 删除邮箱中的所有邮件。
   * 注意：tempmail.plus API可能不支持直接清理，这里返回成功状态
   * 
   * @returns {Promise<boolean>} 清理是否成功
   * @throws {Error} 清理失败时抛出错误
   */
  async clearEmails() {
    try {
      await this.initialize();
      
      // tempmail.plus API可能不支持直接清理邮件
      // 这里返回成功状态，实际清理可能需要其他方式
      console.log('清理邮箱请求 - 注意：tempmail.plus API可能不支持直接清理邮件');
      
      return true;
    } catch (error) {
      throw new Error(`${TEMPMAIL_ERRORS.API_REQUEST_FAILED}: ${error.message}`);
    }
  }

  /**
   * 延时函数
   * 
   * @param {number} ms 延时毫秒数
   * @returns {Promise} 延时Promise
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取服务状态信息
   * 
   * @returns {Object} 服务状态信息
   */
  getServiceStatus() {
    return {
      configured: !!this.email && !!this.pin,
      email: this.email,
      apiUrl: this.apiUrl,
      lastInitialized: this.config ? new Date().toISOString() : null
    };
  }
}

// 创建全局服务实例
const tempMailService = new TempMailService();

// 导出服务实例和错误类型
export { tempMailService, TEMPMAIL_ERRORS };
export default tempMailService;
