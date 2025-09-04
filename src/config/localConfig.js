/**
 * 本地开发配置文件
 * 
 * 集中管理所有配置项，方便本地开发和测试。
 * 修改此文件中的配置后，重启开发服务器即可生效。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * 本地开发配置
 * 
 * 请根据您的实际需求修改以下配置项
 */
export const LOCAL_CONFIG = {
  // ==================== 邮箱转发配置 ====================
  // 实际接收邮件的邮箱地址（所有邮件都转发到这里）
  ACTUAL_EMAIL: 'liufei@mailto.plus',
  
  // 实际邮箱的PIN码
  ACTUAL_EMAIL_PIN: 'test1234',
  
  // 邮箱服务API基础URL
  EMAIL_API_URL: 'https://tempmail.plus/api',
  
  // ==================== 用户界面配置 ====================
  // 是否显示实际邮箱地址给用户（false=隐藏，true=显示）
  SHOW_ACTUAL_EMAIL: false,
  
  // 用户看到的提示信息
  USER_MESSAGE: '请输入您的邮箱地址，我们将为您获取邮件中的验证码',
  
  // ==================== 会话配置 ====================
  // 会话超时时间（秒）- 30分钟
  SESSION_TIMEOUT: 1800,
  
  // 验证码等待超时时间（秒）- 3分钟
  VERIFICATION_TIMEOUT: 180,
  
  // ==================== 应用配置 ====================
  // 最大重试次数
  MAX_RETRY_ATTEMPTS: 3,
  
  // PIN码长度
  PIN_LENGTH: 8,
  
  // ==================== 开发配置 ====================
  // 是否启用调试模式
  DEBUG_MODE: true,
  
  // 是否使用模拟KV存储（本地开发）
  USE_MOCK_KV: true,
  
  // 轮询间隔（秒）
  POLL_INTERVAL: 5
};

/**
 * 配置说明
 * 
 * 1. TEMPMAIL_PLUS_EMAIL: 您的tempmail.plus邮箱地址
 * 2. TEMPMAIL_PLUS_PIN: 您的tempmail.plus PIN码
 * 3. SESSION_TIMEOUT: 会话超时时间，超过此时间会话将失效
 * 4. VERIFICATION_TIMEOUT: 等待验证码的最大时间
 * 5. DEBUG_MODE: 是否显示详细的调试信息
 * 6. USE_MOCK_KV: 本地开发时是否使用内存模拟KV存储
 * 
 * 修改配置后，请重启开发服务器：
 * npm run dev
 */

export default LOCAL_CONFIG;
