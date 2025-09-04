/**
 * 配置处理器
 * 
 * 处理配置相关的API请求，包括配置状态检查、配置验证等功能。
 * 提供配置信息的查询和验证接口。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ResponseUtil } from '../utils/response.js';
import { configManager } from '../utils/config.js';
import { tempMailService } from '../services/tempMailService.js';

/**
 * 配置处理器类
 */
class ConfigHandler {
  /**
   * 获取配置状态
   * 
   * 返回当前配置的状态信息，包括是否已配置、配置是否有效等。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async getConfigStatus(request, env = {}) {
    try {
      // 获取配置状态
      const configStatus = configManager.getConfigStatus();
      
      // 获取tempmail.plus服务状态
      const serviceStatus = tempMailService.getServiceStatus();
      
      // 合并状态信息
      const status = {
        ...configStatus,
        service: serviceStatus,
        timestamp: new Date().toISOString()
      };
      
      return ResponseUtil.success(status, '配置状态获取成功');
    } catch (error) {
      console.error('获取配置状态失败:', error);
      return ResponseUtil.configError(`获取配置状态失败: ${error.message}`);
    }
  }

  /**
   * 验证配置有效性
   * 
   * 验证当前配置是否有效，包括环境变量检查、API连接测试等。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async validateConfig(request, env = {}) {
    try {
      const validationResults = {
        configValidation: null,
        apiConnectionTest: null,
        overallStatus: false
      };

      // 验证配置
      try {
        const config = configManager.getConfig(env);
        validationResults.configValidation = {
          success: true,
          message: '配置验证通过',
          details: {
            actualEmailConfigured: !!config.emailService.actualEmail,
            pinConfigured: !!config.emailService.actualEmailPin,
            apiUrlConfigured: !!config.emailService.apiUrl,
            sessionTimeoutConfigured: !!config.session.timeout,
            verificationTimeoutConfigured: !!config.session.verificationTimeout
          }
        };
      } catch (error) {
        validationResults.configValidation = {
          success: false,
          message: `配置验证失败: ${error.message}`,
          error: error.message
        };
      }

      // 测试API连接
      if (validationResults.configValidation.success) {
        try {
          const isValid = await tempMailService.verifyPin();
          validationResults.apiConnectionTest = {
            success: isValid,
            message: isValid ? 'API连接测试通过' : 'API连接测试失败',
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          validationResults.apiConnectionTest = {
            success: false,
            message: `API连接测试失败: ${error.message}`,
            error: error.message,
            timestamp: new Date().toISOString()
          };
        }
      }

      // 确定整体状态
      validationResults.overallStatus = 
        validationResults.configValidation.success && 
        validationResults.apiConnectionTest.success;

      return ResponseUtil.success(validationResults, '配置验证完成');
    } catch (error) {
      console.error('验证配置失败:', error);
      return ResponseUtil.configError(`验证配置失败: ${error.message}`);
    }
  }

  /**
   * 重新加载配置
   * 
   * 强制重新加载配置，用于配置热更新场景。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async reloadConfig(request, env = {}) {
    try {
      // 重新加载配置
      const config = configManager.reloadConfig(env);
      
      // 重新初始化tempmail.plus服务
      await tempMailService.initialize();
      
      const result = {
        reloaded: true,
        config: {
          email: config.tempMail.email,
          apiUrl: config.tempMail.apiUrl,
          sessionTimeout: config.session.timeout,
          verificationTimeout: config.session.verificationTimeout
        },
        timestamp: new Date().toISOString()
      };
      
      return ResponseUtil.success(result, '配置重新加载成功');
    } catch (error) {
      console.error('重新加载配置失败:', error);
      return ResponseUtil.configError(`重新加载配置失败: ${error.message}`);
    }
  }

  /**
   * 获取配置详情
   * 
   * 返回详细的配置信息（不包含敏感信息如PIN码）。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async getConfigDetails(request, env = {}) {
    try {
      const config = configManager.getConfig(env);
      
      // 只返回非敏感配置信息
      const configDetails = {
        emailService: {
          actualEmail: config.emailService.actualEmail,
          apiUrl: config.emailService.apiUrl,
          pinConfigured: !!config.emailService.actualEmailPin
        },
        session: {
          timeout: config.session.timeout,
          verificationTimeout: config.session.verificationTimeout
        },
        app: {
          maxRetryAttempts: config.app.maxRetryAttempts,
          pinLength: config.app.pinLength
        },
        timestamp: new Date().toISOString()
      };
      
      return ResponseUtil.success(configDetails, '配置详情获取成功');
    } catch (error) {
      console.error('获取配置详情失败:', error);
      return ResponseUtil.configError(`获取配置详情失败: ${error.message}`);
    }
  }

  /**
   * 健康检查
   * 
   * 提供系统健康检查接口，检查配置和服务状态。
   * 
   * @param {Request} request HTTP请求对象
   * @param {Object} env 环境变量对象
   * @returns {Response} HTTP响应对象
   */
  static async healthCheck(request, env = {}) {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          config: false,
          service: false,
          overall: false
        },
        details: {}
      };

      // 检查配置
      try {
        const config = configManager.getConfig(env);
        healthStatus.checks.config = true;
        healthStatus.details.config = {
          actualEmailConfigured: !!config.emailService.actualEmail,
          pinConfigured: !!config.emailService.actualEmailPin,
          apiUrlConfigured: !!config.emailService.apiUrl
        };
      } catch (error) {
        healthStatus.details.config = {
          error: error.message
        };
      }

      // 检查服务状态
      try {
        const serviceStatus = tempMailService.getServiceStatus();
        healthStatus.checks.service = serviceStatus.configured;
        healthStatus.details.service = serviceStatus;
      } catch (error) {
        healthStatus.details.service = {
          error: error.message
        };
      }

      // 确定整体状态
      healthStatus.checks.overall = healthStatus.checks.config && healthStatus.checks.service;
      
      if (!healthStatus.checks.overall) {
        healthStatus.status = 'unhealthy';
      }

      return ResponseUtil.success(healthStatus, '健康检查完成');
    } catch (error) {
      console.error('健康检查失败:', error);
      return ResponseUtil.error('健康检查失败', 503, {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// 导出配置处理器
export default ConfigHandler;
