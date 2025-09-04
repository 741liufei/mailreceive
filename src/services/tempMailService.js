/**
 * Tempmail.plus服务集成类（简化版）
 * 
 * 负责与tempmail.plus API的交互，包括邮件接收、验证码提取等功能。
 * 
 * @author mailreceive
 * @version 2.0.0
 * @since 2024-01-01
 */

import { configManager } from '../utils/config.js';
import { EXTRACTION_STRATEGY } from '../config/regexConfig.js';

/**
 * Tempmail.plus API错误类型
 */
const TEMPMAIL_ERRORS = {
  API_REQUEST_FAILED: 'Tempmail.plus API请求失败',
  INVALID_RESPONSE: 'Tempmail.plus API响应无效',
  EMAIL_NOT_FOUND: '邮件未找到',
  VERIFICATION_CODE_NOT_FOUND: '验证码未找到',
  CONFIG_ERROR: '配置错误'
};

/**
 * Tempmail.plus服务类（简化版）
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
   * @param {string} content 邮件内容
   * @returns {Object} 提取结果对象
   */
  extractVerificationCode(content) {
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

  /**
   * 获取所有邮件并提取验证码
   * 
   * @returns {Promise<Object>} 包含所有邮件信息的对象
   * @throws {Error} 获取失败时抛出错误
   */
  async waitForVerificationCode() {
    console.log('=== 开始获取所有邮件 ===');
    
    const startTime = Date.now();

    try {
      // 直接获取邮件列表
      const emails = await this.getEmails();
      console.log('获取到邮件数量:', emails.length);
      
      // 获取每封邮件的详细内容
      const detailedEmails = [];
      for (const email of emails) {
        console.log('获取邮件详情:', email.id, '主题:', email.subject);
        
        try {
          // 获取邮件内容
          const emailContent = await this.getEmailContent(email.id);
          
          // 提取验证码（如果存在）
          const extractResult = this.extractVerificationCode(emailContent.content);
          const verificationCode = extractResult.success ? extractResult.code : null;
          
          if (extractResult.success) {
            console.log('提取的验证码:', verificationCode);
            console.log('使用的模式:', extractResult.patternDescription);
          }
          
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
}

// 创建全局服务实例
const tempMailService = new TempMailService();

// 导出服务实例和错误类型
export { tempMailService, TEMPMAIL_ERRORS };
export default tempMailService;
