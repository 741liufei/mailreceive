/**
 * 邮件处理器
 * 
 * 处理邮件相关的API请求，包括邮件获取和详情查看功能。
 * 简化版本，只保留实际使用的功能。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ResponseUtil } from '../utils/response.js';
import { ValidationUtil } from '../utils/validation.js';
import { tempMailService } from '../services/tempMailService.js';

/**
 * 邮件处理器类
 */
class SessionHandler {
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

      // 直接获取邮件列表
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

      // 直接获取邮件详情
      const emailDetail = await tempMailService.getEmailContent(cleanEmailId, env);

      return ResponseUtil.success(emailDetail, '邮件详情获取成功');
    } catch (error) {
      console.error('获取邮件详情失败:', error);
      return ResponseUtil.error(`获取邮件详情失败: ${error.message}`);
    }
  }
}

export default SessionHandler;