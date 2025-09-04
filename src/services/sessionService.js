/**
 * 会话管理服务类
 * 
 * 负责管理用户会话，包括会话创建、存储、验证、清理等功能。
 * 使用Cloudflare KV存储会话数据，支持会话超时和自动清理。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

import { configManager } from '../utils/config.js';
import { tempMailService } from './tempMailService.js';
import { LOCAL_CONFIG } from '../config/localConfig.js';

/**
 * 会话状态枚举
 */
const SESSION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  VERIFIED: 'verified',
  CANCELLED: 'cancelled'
};

/**
 * 会话错误类型
 */
const SESSION_ERRORS = {
  SESSION_NOT_FOUND: '会话未找到',
  SESSION_EXPIRED: '会话已过期',
  SESSION_ALREADY_VERIFIED: '会话已验证',
  INVALID_SESSION_ID: '无效的会话ID',
  KV_STORAGE_ERROR: 'KV存储错误',
  CONFIG_ERROR: '配置错误'
};

/**
 * 会话管理服务类
 */
class SessionService {
  constructor() {
    this.config = null;
    this.sessionsKV = null;
    this.emailsKV = null;
  }

  /**
   * 初始化服务
   * 
   * @param {Object} env 环境变量对象
   */
  initialize(env) {
    this.config = configManager.getConfig(env);
    
    // 根据本地配置决定是否使用模拟KV存储
    if (LOCAL_CONFIG.USE_MOCK_KV || (!env.SESSIONS || !env.EMAILS)) {
      // 本地开发环境：使用内存模拟KV存储
      // 只有在还没有初始化时才创建新的Map
      if (!this.sessionsKV) {
        this.sessionsKV = new Map();
        this.emailsKV = new Map();
        if (LOCAL_CONFIG.DEBUG_MODE) {
          console.log('使用本地模拟KV存储');
        }
      } else {
        if (LOCAL_CONFIG.DEBUG_MODE) {
          console.log('复用现有的本地模拟KV存储');
        }
      }
    } else {
      // 生产环境：使用真实的KV存储
      this.sessionsKV = env.SESSIONS;
      this.emailsKV = env.EMAILS;
      if (LOCAL_CONFIG.DEBUG_MODE) {
        console.log('使用真实KV存储');
      }
    }
  }

  /**
   * 生成唯一会话ID
   * 
   * @returns {string} 会话ID
   */
  generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${random}`.substring(0, 16);
  }

  /**
   * 创建新会话
   * 
   * 为用户创建新的临时邮箱会话，包括会话ID、临时邮箱地址和PIN码。
   * 
   * @param {string} userEmail 用户邮箱地址
   * @returns {Promise<Object>} 会话信息
   * @throws {Error} 创建失败时抛出错误
   */
  async createSession(userEmail) {
    try {
      console.log('=== 创建会话服务开始 ===');
      console.log('用户邮箱:', userEmail);
      
      // 生成会话ID
      const sessionId = this.generateSessionId();
      console.log('生成的会话ID:', sessionId);
      
      // 初始化tempMailService以获取配置
      await tempMailService.initialize();
      
      // 获取配置的实际邮箱和PIN码
      const actualEmail = tempMailService.getConfiguredEmail();
      const pinCode = tempMailService.getConfiguredPin();
      console.log('实际邮箱:', actualEmail, 'PIN码:', pinCode);
      
      // 计算过期时间
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + this.config.session.timeout * 1000);
      console.log('创建时间:', createdAt.toISOString(), '过期时间:', expiresAt.toISOString());
      
      // 创建会话对象
      const session = {
        sessionId: sessionId,
        userEmail: userEmail,  // 用户输入的邮箱地址
        actualEmail: actualEmail,  // 实际接收邮件的邮箱地址
        pinCode: pinCode,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: SESSION_STATUS.ACTIVE,
        verified: false,
        verificationCode: null,
        emailCount: 0,
        lastChecked: createdAt.toISOString()
      };
      console.log('创建的会话对象:', session);
      
      // 存储到KV
      if (this.sessionsKV instanceof Map) {
        console.log('存储到Map，会话ID:', sessionId);
        this.sessionsKV.set(sessionId, JSON.stringify(session));
        console.log('Map中存储的会话数量:', this.sessionsKV.size);
        console.log('Map中是否有此会话:', this.sessionsKV.has(sessionId));
      } else {
        console.log('存储到KV，会话ID:', sessionId);
        await this.sessionsKV.put(sessionId, JSON.stringify(session));
      }
      
      const result = {
        sessionId: sessionId,
        userEmail: userEmail,  // 返回用户输入的邮箱地址
        pinCode: pinCode,
        expiresAt: expiresAt.toISOString()
      };
      console.log('返回结果:', result);
      return result;
    } catch (error) {
      console.error('创建会话失败:', error);
      throw new Error(`${SESSION_ERRORS.KV_STORAGE_ERROR}: ${error.message}`);
    }
  }

  /**
   * 获取会话信息
   * 
   * @param {string} sessionId 会话ID
   * @returns {Promise<Object|null>} 会话信息
   * @throws {Error} 获取失败时抛出错误
   */
  async getSession(sessionId) {
    try {
      console.log('获取会话 - 会话ID:', sessionId);
      console.log('获取会话 - KV类型:', this.sessionsKV instanceof Map ? 'Map' : 'KV');
      
      let sessionData;
      if (this.sessionsKV instanceof Map) {
        sessionData = this.sessionsKV.get(sessionId);
        console.log('获取会话 - Map中存储的会话数据:', sessionData ? '存在' : '不存在');
      } else {
        sessionData = await this.sessionsKV.get(sessionId);
        console.log('获取会话 - KV中存储的会话数据:', sessionData ? '存在' : '不存在');
      }
      
      if (!sessionData) {
        console.log('获取会话 - 会话数据为空');
        return null;
      }
      
      const session = JSON.parse(sessionData);
      
      // 检查会话是否过期
      if (new Date(session.expiresAt) < new Date()) {
        session.status = SESSION_STATUS.EXPIRED;
        await this.updateSession(sessionId, session);
        return null;
      }
      
      return session;
    } catch (error) {
      throw new Error(`${SESSION_ERRORS.KV_STORAGE_ERROR}: ${error.message}`);
    }
  }

  /**
   * 更新会话信息
   * 
   * @param {string} sessionId 会话ID
   * @param {Object} sessionData 会话数据
   * @returns {Promise<void>}
   * @throws {Error} 更新失败时抛出错误
   */
  async updateSession(sessionId, sessionData) {
    try {
      if (this.sessionsKV instanceof Map) {
        this.sessionsKV.set(sessionId, JSON.stringify(sessionData));
      } else {
        await this.sessionsKV.put(sessionId, JSON.stringify(sessionData));
      }
    } catch (error) {
      throw new Error(`${SESSION_ERRORS.KV_STORAGE_ERROR}: ${error.message}`);
    }
  }

  /**
   * 验证PIN码
   * 
   * @param {string} sessionId 会话ID
   * @param {string} pinCode PIN码
   * @returns {Promise<boolean>} 验证是否成功
   * @throws {Error} 验证失败时抛出错误
   */
  async verifyPin(sessionId, pinCode) {
    try {
      console.log('验证PIN码 - 查找会话ID:', sessionId);
      const session = await this.getSession(sessionId);
      console.log('验证PIN码 - 找到会话:', session ? '是' : '否');
      
      if (!session) {
        console.log('验证PIN码 - 会话未找到，会话ID:', sessionId);
        throw new Error(SESSION_ERRORS.SESSION_NOT_FOUND);
      }
      
      if (session.status === SESSION_STATUS.EXPIRED) {
        throw new Error(SESSION_ERRORS.SESSION_EXPIRED);
      }
      
      if (session.verified) {
        throw new Error(SESSION_ERRORS.SESSION_ALREADY_VERIFIED);
      }
      
      // 验证PIN码
      if (session.pinCode !== pinCode) {
        return false;
      }
      
      // 更新会话状态
      session.verified = true;
      session.status = SESSION_STATUS.VERIFIED;
      session.lastChecked = new Date().toISOString();
      
      await this.updateSession(sessionId, session);
      
      return true;
    } catch (error) {
      throw new Error(`PIN验证失败: ${error.message}`);
    }
  }

  /**
   * 获取邮件列表
   * 
   * @param {string} sessionId 会话ID
   * @returns {Promise<Array>} 邮件列表
   * @throws {Error} 获取失败时抛出错误
   */
  async getEmails(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        throw new Error(SESSION_ERRORS.SESSION_NOT_FOUND);
      }
      
      if (!session.verified) {
        throw new Error('会话未验证');
      }
      
      // 从tempmail.plus获取邮件
      const emails = await tempMailService.getEmails();
      
      // 更新会话中的邮件数量
      session.emailCount = emails.length;
      session.lastChecked = new Date().toISOString();
      await this.updateSession(sessionId, session);
      
      return emails;
    } catch (error) {
      throw new Error(`获取邮件失败: ${error.message}`);
    }
  }

  /**
   * 获取邮件详情
   * 
   * @param {string} emailId 邮件ID
   * @returns {Promise<Object>} 邮件详情
   * @throws {Error} 获取失败时抛出错误
   */
  async getEmailDetail(emailId) {
    try {
      // 从tempmail.plus获取邮件详情
      const emailDetail = await tempMailService.getEmailContent(emailId);
      
      // 提取验证码（如果存在）
      const verificationCode = tempMailService.extractVerificationCode(emailDetail.content);
      
      // 构建完整的邮件详情
      const fullEmailDetail = {
        ...emailDetail,
        verificationCode: verificationCode,
        hasVerificationCode: !!verificationCode
      };
      
      return fullEmailDetail;
    } catch (error) {
      throw new Error(`获取邮件详情失败: ${error.message}`);
    }
  }

  /**
   * 获取邮件详情
   * 
   * @param {string} sessionId 会话ID
   * @param {string} emailId 邮件ID
   * @returns {Promise<Object>} 邮件详情
   * @throws {Error} 获取失败时抛出错误
   */
  async getEmailDetail(sessionId, emailId) {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        throw new Error(SESSION_ERRORS.SESSION_NOT_FOUND);
      }
      
      if (!session.verified) {
        throw new Error('会话未验证');
      }
      
      // 从tempmail.plus获取邮件详情
      const emailDetail = await tempMailService.getEmailContent(emailId);
      
      // 提取验证码
      const verificationCode = tempMailService.extractVerificationCode(emailDetail.content);
      
      // 添加验证码信息到邮件详情
      emailDetail.verificationCode = verificationCode;
      
      return emailDetail;
    } catch (error) {
      throw new Error(`获取邮件详情失败: ${error.message}`);
    }
  }

  /**
   * 获取所有邮件（不查询验证码）
   * 
   * @param {string} sessionId 会话ID
   * @param {number} timeoutSeconds 超时时间(秒) - 保留参数以保持接口兼容
   * @param {number} pollInterval 轮询间隔(秒)，默认5秒 - 保留参数以保持接口兼容
   * @param {number} maxPollCount 最大查询次数，默认30次 - 保留参数以保持接口兼容
   * @returns {Promise<Object>} 包含所有邮件信息的对象
   * @throws {Error} 获取失败时抛出错误
   */
  async waitForVerificationCode(sessionId, timeoutSeconds = null, pollInterval = 5, maxPollCount = 30) {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        throw new Error(SESSION_ERRORS.SESSION_NOT_FOUND);
      }
      
      if (!session.verified) {
        throw new Error('会话未验证');
      }
      
      // 使用配置的超时时间或传入的超时时间
      const timeout = timeoutSeconds || this.config.session.verificationTimeout;
      
      // 获取所有邮件（不进行验证码轮询）
      const result = await tempMailService.waitForVerificationCode(timeout, pollInterval, maxPollCount);
      
      // 更新会话信息
      session.emailCount = result.totalEmails;
      session.lastChecked = new Date().toISOString();
      
      // 如果有验证码，保存第一个
      if (result.verificationCodes && result.verificationCodes.length > 0) {
        session.verificationCode = result.verificationCodes[0];
      }
      
      await this.updateSession(sessionId, session);
      
      return result;
    } catch (error) {
      throw new Error(`获取邮件失败: ${error.message}`);
    }
  }

  /**
   * 获取会话状态
   * 
   * @param {string} sessionId 会话ID
   * @returns {Promise<Object>} 会话状态
   * @throws {Error} 获取失败时抛出错误
   */
  async getSessionStatus(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      
      if (!session) {
        return {
          exists: false,
          status: SESSION_STATUS.EXPIRED
        };
      }
      
      return {
        exists: true,
        status: session.status,
        verified: session.verified,
        emailCount: session.emailCount,
        verificationCode: session.verificationCode,
        expiresAt: session.expiresAt,
        lastChecked: session.lastChecked
      };
    } catch (error) {
      throw new Error(`获取会话状态失败: ${error.message}`);
    }
  }

  /**
   * 清理会话
   * 
   * @param {string} sessionId 会话ID
   * @returns {Promise<boolean>} 清理是否成功
   */
  async cleanupSession(sessionId) {
    try {
      if (this.sessionsKV instanceof Map) {
        this.sessionsKV.delete(sessionId);
      } else {
        await this.sessionsKV.delete(sessionId);
      }
      return true;
    } catch (error) {
      console.error('清理会话失败:', error);
      return false;
    }
  }

  /**
   * 清理过期会话
   * 
   * 清理所有已过期的会话，释放存储空间。
   * 
   * @returns {Promise<number>} 清理的会话数量
   */
  async cleanupExpiredSessions() {
    try {
      // 注意：Cloudflare KV不支持直接列出所有键
      // 这里需要在应用层面维护会话列表或使用其他策略
      // 暂时返回0，实际实现可能需要额外的存储机制
      return 0;
    } catch (error) {
      console.error('清理过期会话失败:', error);
      return 0;
    }
  }

  /**
   * 获取会话统计信息
   * 
   * @returns {Promise<Object>} 统计信息
   */
  async getSessionStats() {
    try {
      // 由于KV限制，这里返回基本统计信息
      return {
        totalSessions: 0, // 需要额外存储机制
        activeSessions: 0,
        expiredSessions: 0,
        verifiedSessions: 0
      };
    } catch (error) {
      console.error('获取会话统计失败:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        verifiedSessions: 0
      };
    }
  }

  /**
   * 检查会话是否有效
   * 
   * @param {string} sessionId 会话ID
   * @returns {Promise<boolean>} 会话是否有效
   */
  async isSessionValid(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      return session !== null && session.status !== SESSION_STATUS.EXPIRED;
    } catch (error) {
      return false;
    }
  }
}

// 创建全局服务实例
const sessionService = new SessionService();

// 导出服务实例和常量
export { sessionService, SESSION_STATUS, SESSION_ERRORS };
export default sessionService;
