/**
 * API响应工具类
 * 
 * 提供统一的API响应格式处理，包括成功响应、错误响应和状态码管理。
 * 确保所有API接口返回一致的响应格式。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * HTTP状态码枚举
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

/**
 * 响应工具类
 */
class ResponseUtil {
  /**
   * 创建成功响应
   * 
   * @param {any} data 响应数据
   * @param {string} message 响应消息
   * @param {number} statusCode HTTP状态码
   * @returns {Response} HTTP响应对象
   */
  static success(data = null, message = '操作成功', statusCode = HTTP_STATUS.OK) {
    const responseBody = {
      code: statusCode,
      message: message,
      data: data,
      success: true,
      timestamp: Date.now()
    };

    return new Response(JSON.stringify(responseBody), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  /**
   * 创建错误响应
   * 
   * @param {string} message 错误消息
   * @param {number} statusCode HTTP状态码
   * @param {any} errorData 错误详情数据
   * @returns {Response} HTTP响应对象
   */
  static error(message = '操作失败', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorData = null) {
    const responseBody = {
      code: statusCode,
      message: message,
      data: errorData,
      success: false,
      timestamp: Date.now()
    };

    return new Response(JSON.stringify(responseBody), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  /**
   * 创建配置错误响应
   * 
   * @param {string} message 配置错误消息
   * @returns {Response} HTTP响应对象
   */
  static configError(message) {
    return this.error(message, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  /**
   * 创建验证错误响应
   * 
   * @param {string} message 验证错误消息
   * @param {any} validationErrors 验证错误详情
   * @returns {Response} HTTP响应对象
   */
  static validationError(message, validationErrors = null) {
    return this.error(message, HTTP_STATUS.BAD_REQUEST, validationErrors);
  }

  /**
   * 创建未找到错误响应
   * 
   * @param {string} message 未找到错误消息
   * @returns {Response} HTTP响应对象
   */
  static notFound(message = '资源未找到') {
    return this.error(message, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * 创建未授权错误响应
   * 
   * @param {string} message 未授权错误消息
   * @returns {Response} HTTP响应对象
   */
  static unauthorized(message = '未授权访问') {
    return this.error(message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * 创建禁止访问错误响应
   * 
   * @param {string} message 禁止访问错误消息
   * @returns {Response} HTTP响应对象
   */
  static forbidden(message = '禁止访问') {
    return this.error(message, HTTP_STATUS.FORBIDDEN);
  }

  /**
   * 创建冲突错误响应
   * 
   * @param {string} message 冲突错误消息
   * @returns {Response} HTTP响应对象
   */
  static conflict(message = '资源冲突') {
    return this.error(message, HTTP_STATUS.CONFLICT);
  }

  /**
   * 创建CORS预检响应
   * 
   * @returns {Response} CORS预检响应对象
   */
  static corsPreflight() {
    return new Response(null, {
      status: HTTP_STATUS.OK,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  /**
   * 创建JSON响应
   * 
   * @param {any} data 响应数据
   * @param {number} statusCode HTTP状态码
   * @returns {Response} JSON响应对象
   */
  static json(data, statusCode = HTTP_STATUS.OK) {
    return new Response(JSON.stringify(data), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  /**
   * 创建纯文本响应
   * 
   * @param {string} text 响应文本
   * @param {number} statusCode HTTP状态码
   * @returns {Response} 文本响应对象
   */
  static text(text, statusCode = HTTP_STATUS.OK) {
    return new Response(text, {
      status: statusCode,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  /**
   * 创建HTML响应
   * 
   * @param {string} html HTML内容
   * @param {number} statusCode HTTP状态码
   * @returns {Response} HTML响应对象
   */
  static html(html, statusCode = HTTP_STATUS.OK) {
    return new Response(html, {
      status: statusCode,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 导出响应工具类和状态码枚举
export { ResponseUtil, HTTP_STATUS };
export default ResponseUtil;
