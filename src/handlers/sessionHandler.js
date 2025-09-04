/**
 * 会话处理器
 * 
 * 处理会话相关的API请求，包括会话创建、PIN验证、邮件获取、验证码提取等功能。
 * 提供完整的会话生命周期管理。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ResponseUtil } from '../utils/response.js';
import { ValidationUtil } from '../utils/validation.js';
import { sessionService } from '../services/sessionService.js';
import { tempMailService } from '../services/tempMailService.js';

/**
 * 会话处理器类
 */
class SessionHandler {
  /**
   * 创建新会话
   * 
   * 为用户创建新的临时邮箱会话，返回会话ID、临时邮箱地址和PIN码。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async createSession(request, env) {
    try {
      console.log('=== 创建会话开始 ===');
      
      // 解析请求体
      let requestData;
      try {
        requestData = await request.json();
        console.log('创建会话请求数据:', requestData);
      } catch (error) {
        console.log('解析请求体失败:', error);
        return ResponseUtil.validationError('请求体格式无效，需要JSON格式');
      }

      // 验证请求参数
      const validation = ValidationUtil.validateCreateSessionRequest(requestData);
      if (!validation.isValid) {
        console.log('参数验证失败:', validation.errors);
        return ResponseUtil.validationError(
          ValidationUtil.formatValidationErrors(validation.errors)
        );
      }

      // 清理输入数据
      const userEmail = ValidationUtil.sanitizeInput(requestData.userEmail);
      console.log('清理后的邮箱:', userEmail);
      
      // 初始化会话服务
      console.log('初始化会话服务...');
      sessionService.initialize(env);
      console.log('会话服务初始化完成');

      // 创建会话
      console.log('开始创建会话...');
      const session = await sessionService.createSession(userEmail);
      console.log('会话创建结果:', session);

      return ResponseUtil.success(session, '会话创建成功', 201);
    } catch (error) {
      console.error('创建会话失败:', error);
      return ResponseUtil.error(`创建会话失败: ${error.message}`);
    }
  }

  /**
   * 验证PIN码
   * 
   * 验证用户提供的PIN码是否正确。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async verifyPin(request, env) {
    try {
      console.log('=== 验证PIN码开始 ===');
      
      // 解析请求体
      let requestData;
      try {
        requestData = await request.json();
        console.log('请求数据:', requestData);
      } catch (error) {
        console.log('解析请求体失败:', error);
        return ResponseUtil.validationError('请求体格式无效，需要JSON格式');
      }

      // 验证请求参数
      const validation = ValidationUtil.validatePinVerificationRequest(requestData);
      if (!validation.isValid) {
        console.log('参数验证失败:', validation.errors);
        return ResponseUtil.validationError(
          ValidationUtil.formatValidationErrors(validation.errors)
        );
      }

      // 清理输入数据
      const sessionId = ValidationUtil.sanitizeInput(requestData.sessionId);
      const pinCode = ValidationUtil.sanitizeInput(requestData.pinCode);
      console.log('清理后的数据 - 会话ID:', sessionId, 'PIN码:', pinCode);

      // 初始化会话服务
      console.log('初始化会话服务...');
      sessionService.initialize(env);
      console.log('会话服务初始化完成');

      // 验证PIN码
      console.log('开始验证PIN码...');
      const isValid = await sessionService.verifyPin(sessionId, pinCode);
      console.log('PIN码验证结果:', isValid);

      if (isValid) {
        return ResponseUtil.success({ verified: true }, 'PIN码验证成功');
      } else {
        return ResponseUtil.error('PIN码验证失败', 401);
      }
    } catch (error) {
      console.error('验证PIN码失败:', error);
      return ResponseUtil.error(`验证PIN码失败: ${error.message}`);
    }
  }

  /**
   * 获取邮件列表
   * 
   * 获取指定邮箱的邮件列表。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async getEmails(request, env) {
    try {
      // 从URL参数获取用户邮箱
      const url = new URL(request.url);
      const userEmail = url.searchParams.get('userEmail');

      if (!userEmail) {
        return ResponseUtil.validationError('缺少必需的userEmail参数');
      }

      // 验证邮箱格式
      if (!userEmail.includes('@')) {
        return ResponseUtil.validationError('邮箱格式无效');
      }

      // 清理输入数据
      const cleanUserEmail = ValidationUtil.sanitizeInput(userEmail);

      // 直接获取邮件列表，不需要会话
      const emails = await tempMailService.getEmails(env);

      return ResponseUtil.success({ emails }, '邮件列表获取成功');
    } catch (error) {
      console.error('获取邮件列表失败:', error);
      return ResponseUtil.error(`获取邮件列表失败: ${error.message}`);
    }
  }

  /**
   * 获取邮件详情
   * 
   * 获取指定邮件的详细内容。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async getEmailDetail(request, env) {
    try {
      // 从URL参数获取参数
      const url = new URL(request.url);
      const userEmail = url.searchParams.get('userEmail');
      const emailId = url.searchParams.get('emailId');

      if (!userEmail) {
        return ResponseUtil.validationError('缺少必需的userEmail参数');
      }

      if (!emailId) {
        return ResponseUtil.validationError('缺少必需的emailId参数');
      }

      // 验证邮箱格式
      if (!userEmail.includes('@')) {
        return ResponseUtil.validationError('邮箱格式无效');
      }

      // 验证邮件ID格式
      if (typeof emailId !== 'string' || emailId.trim().length === 0) {
        return ResponseUtil.validationError('邮件ID格式无效');
      }

      // 清理输入数据
      const cleanUserEmail = ValidationUtil.sanitizeInput(userEmail);
      const cleanEmailId = ValidationUtil.sanitizeInput(emailId);

      // 直接获取邮件详情，不需要会话验证
      const emailDetail = await tempMailService.getEmailContent(cleanEmailId, env);

      return ResponseUtil.success(emailDetail, '邮件详情获取成功');
    } catch (error) {
      console.error('获取邮件详情失败:', error);
      return ResponseUtil.error(`获取邮件详情失败: ${error.message}`);
    }
  }

  /**
   * 获取所有邮件（不查询验证码）
   * 
   * 直接获取所有邮件，不进行验证码轮询。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async getVerificationCode(request, env) {
    try {
      // 从URL参数获取参数
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('sessionId');
      const timeout = url.searchParams.get('timeout');
      const pollInterval = url.searchParams.get('pollInterval');
      const maxPollCount = url.searchParams.get('maxPollCount');

      if (!sessionId) {
        return ResponseUtil.validationError('缺少必需的sessionId参数');
      }

      // 验证会话ID格式
      const sessionIdValidation = ValidationUtil.validateSessionId(sessionId);
      if (!sessionIdValidation.isValid) {
        return ResponseUtil.validationError(sessionIdValidation.error);
      }

      // 验证超时时间（如果提供）
      let timeoutSeconds = null;
      if (timeout) {
        const timeoutValidation = ValidationUtil.validateTimeout(parseInt(timeout));
        if (!timeoutValidation.isValid) {
          return ResponseUtil.validationError(timeoutValidation.error);
        }
        timeoutSeconds = parseInt(timeout);
      }

      // 验证轮询间隔（如果提供）
      let pollIntervalSeconds = 5; // 默认5秒
      if (pollInterval) {
        const pollIntervalNum = parseInt(pollInterval);
        if (isNaN(pollIntervalNum) || pollIntervalNum < 1 || pollIntervalNum > 60) {
          return ResponseUtil.validationError('轮询间隔必须在1-60秒之间');
        }
        pollIntervalSeconds = pollIntervalNum;
      }

      // 验证最大查询次数（如果提供）
      let maxPollCountNum = 30; // 默认30次
      if (maxPollCount) {
        const maxPollCountValidation = parseInt(maxPollCount);
        if (isNaN(maxPollCountValidation) || maxPollCountValidation < 1 || maxPollCountValidation > 100) {
          return ResponseUtil.validationError('最大查询次数必须在1-100次之间');
        }
        maxPollCountNum = maxPollCountValidation;
      }

      // 清理输入数据
      const cleanSessionId = ValidationUtil.sanitizeInput(sessionId);

      // 初始化会话服务
      sessionService.initialize(env);

      // 获取所有邮件（不进行验证码轮询）
      const result = await sessionService.waitForVerificationCode(
        cleanSessionId, 
        timeoutSeconds, 
        pollIntervalSeconds, 
        maxPollCountNum
      );

      return ResponseUtil.success(result, '邮件获取成功');
    } catch (error) {
      console.error('获取邮件失败:', error);
      return ResponseUtil.error(`获取邮件失败: ${error.message}`);
    }
  }

  /**
   * 获取会话状态
   * 
   * 获取指定会话的详细状态信息。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async getSessionStatus(request, env) {
    try {
      // 从URL参数获取会话ID
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('sessionId');

      if (!sessionId) {
        return ResponseUtil.validationError('缺少必需的sessionId参数');
      }

      // 验证会话ID格式
      const sessionIdValidation = ValidationUtil.validateSessionId(sessionId);
      if (!sessionIdValidation.isValid) {
        return ResponseUtil.validationError(sessionIdValidation.error);
      }

      // 清理输入数据
      const cleanSessionId = ValidationUtil.sanitizeInput(sessionId);

      // 初始化会话服务
      sessionService.initialize(env);

      // 获取会话状态
      const status = await sessionService.getSessionStatus(cleanSessionId);

      return ResponseUtil.success(status, '会话状态获取成功');
    } catch (error) {
      console.error('获取会话状态失败:', error);
      return ResponseUtil.error(`获取会话状态失败: ${error.message}`);
    }
  }

  /**
   * 清理会话
   * 
   * 删除指定的会话。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async cleanupSession(request, env) {
    try {
      // 从URL参数获取会话ID
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('sessionId');

      if (!sessionId) {
        return ResponseUtil.validationError('缺少必需的sessionId参数');
      }

      // 验证会话ID格式
      const sessionIdValidation = ValidationUtil.validateSessionId(sessionId);
      if (!sessionIdValidation.isValid) {
        return ResponseUtil.validationError(sessionIdValidation.error);
      }

      // 清理输入数据
      const cleanSessionId = ValidationUtil.sanitizeInput(sessionId);

      // 初始化会话服务
      sessionService.initialize(env);

      // 清理会话
      const success = await sessionService.cleanupSession(cleanSessionId);

      if (success) {
        return ResponseUtil.success({ cleaned: true }, '会话清理成功');
      } else {
        return ResponseUtil.error('会话清理失败');
      }
    } catch (error) {
      console.error('清理会话失败:', error);
      return ResponseUtil.error(`清理会话失败: ${error.message}`);
    }
  }

  /**
   * 获取会话统计信息
   * 
   * 获取会话相关的统计信息。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async getSessionStats(request, env) {
    try {
      // 初始化会话服务
      sessionService.initialize(env);

      // 获取统计信息
      const stats = await sessionService.getSessionStats();

      return ResponseUtil.success(stats, '会话统计信息获取成功');
    } catch (error) {
      console.error('获取会话统计失败:', error);
      return ResponseUtil.error(`获取会话统计失败: ${error.message}`);
    }
  }

  /**
   * 检查会话有效性
   * 
   * 检查指定会话是否有效。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async checkSessionValidity(request, env) {
    try {
      // 从URL参数获取会话ID
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('sessionId');

      if (!sessionId) {
        return ResponseUtil.validationError('缺少必需的sessionId参数');
      }

      // 验证会话ID格式
      const sessionIdValidation = ValidationUtil.validateSessionId(sessionId);
      if (!sessionIdValidation.isValid) {
        return ResponseUtil.validationError(sessionIdValidation.error);
      }

      // 清理输入数据
      const cleanSessionId = ValidationUtil.sanitizeInput(sessionId);

      // 初始化会话服务
      sessionService.initialize(env);

      // 检查会话有效性
      const isValid = await sessionService.isSessionValid(cleanSessionId);

      return ResponseUtil.success({ valid: isValid }, '会话有效性检查完成');
    } catch (error) {
      console.error('检查会话有效性失败:', error);
      return ResponseUtil.error(`检查会话有效性失败: ${error.message}`);
    }
  }
}

// 导出会话处理器
export default SessionHandler;
