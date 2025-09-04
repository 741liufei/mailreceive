/**
 * MailReceive Cloudflare Workers 主入口文件
 * 
 * 轻量级邮箱接收邮件Web应用的主入口点。
 * 处理所有HTTP请求，包括API路由和静态文件服务。
 * 
 * @author mailreceive
 * @version 1.0.0
 * @since 2024-01-01
 */

import { ResponseUtil } from './utils/response.js';
import SessionHandler from './handlers/sessionHandler.js';
import { generateClientRegexCode } from './config/regexConfig.js';

/**
 * 路由配置
 * 
 * 定义所有API路由和对应的处理器方法。
 */
const ROUTES = {
  // 邮件相关路由（简化后）
  'GET:/api/session/emails': SessionHandler.getEmails,
  'GET:/api/session/email-detail': SessionHandler.getEmailDetail
};

/**
 * 处理HTTP请求
 * 
 * 根据请求的URL和方法分发到相应的处理器。
 * 
 * @param {Request} request HTTP请求对象
 * @param {Object} env 环境变量对象
 * @param {Object} ctx 执行上下文
 * @returns {Response} HTTP响应对象
 */
async function handleRequest(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    
    // 构建路由键
    const routeKey = `${method}:${path}`;
    
    // 处理CORS预检请求
    if (method === 'OPTIONS') {
      return ResponseUtil.corsPreflight();
    }
    
    // 处理静态文件请求
    if (path === '/' || path === '/index.html') {
      return serveStaticFile('index.html');
    }
    
    if (path.startsWith('/static/')) {
      return serveStaticFile(path.substring(1));
    }
    
    // 查找路由处理器
    const handler = ROUTES[routeKey];
    
    if (handler) {
      // 调用对应的处理器
      return await handler(request, env);
    }
    
    // 处理API路由（支持查询参数）
    const apiRouteKey = `${method}:${path.split('?')[0]}`;
    const apiHandler = ROUTES[apiRouteKey];
    
    if (apiHandler) {
      return await apiHandler(request, env);
    }
    
    // 路由未找到
    return ResponseUtil.notFound('请求的路由不存在');
    
  } catch (error) {
    console.error('请求处理失败:', error);
    return ResponseUtil.error('服务器内部错误', 500, {
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 服务静态文件
 * 
 * @param {string} filePath 文件路径
 * @returns {Response} HTTP响应对象
 */
function serveStaticFile(filePath) {
  // 这里应该返回实际的静态文件内容
  // 在实际部署中，这些文件应该通过Cloudflare Pages或其他静态文件服务提供
  
  if (filePath === 'index.html') {
    return ResponseUtil.html(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MailReceive - 临时邮箱接收邮件</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            padding: 30px;
        }
        h1 {
            text-align: center;
            color: #4a5568;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #2d3748;
        }
        input[type="email"], input[type="text"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input[type="email"]:focus, input[type="text"]:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        .result {
            margin-top: 20px;
            padding: 20px;
            background: #f7fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .error {
            background: #fed7d7;
            border-left-color: #e53e3e;
            color: #c53030;
        }
        .success {
            background: #c6f6d5;
            border-left-color: #38a169;
            color: #2f855a;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📧 MailReceive</h1>
        <p style="text-align: center; color: #718096; margin-bottom: 30px;">
            轻量级临时邮箱接收邮件服务
        </p>
        
        <div class="form-group">
            <label for="userEmail">您的邮箱地址:</label>
            <input type="email" id="userEmail" placeholder="请输入您的邮箱地址" required>
            <small style="color: #718096; font-size: 14px; margin-top: 5px; display: block;">
                请输入您的邮箱地址，我们将为您获取邮件列表
            </small>
        </div>
        
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <button onclick="getEmails()">获取邮件列表</button>
            <button onclick="getAugmentCode()" 
                    style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                           color: white; 
                           border: none; 
                           padding: 12px 24px; 
                           border-radius: 8px; 
                           font-size: 16px; 
                           cursor: pointer; 
                           transition: transform 0.2s;">
                🚀 获取Augment验证码
            </button>
        </div>
        
        <div id="sessionInfo" class="result hidden">
            <h3>邮箱信息</h3>
            <p><strong>您的邮箱:</strong> <span id="userEmailDisplay"></span></p>
            <p><strong>邮件数量:</strong> <span id="emailCount">0</span></p>
        </div>
        
        <div id="verificationResult" class="result hidden">
            <h3>邮件列表</h3>
            <div id="verificationContent"></div>
        </div>
        
        <div id="emailDetail" class="result hidden">
            <h3>邮件详情</h3>
            <div id="emailDetailContent"></div>
            <button onclick="backToEmailList()" style="margin-top: 10px;">返回邮件列表</button>
        </div>
        
        <div id="errorMessage" class="result error hidden">
            <h3>错误信息</h3>
            <div id="errorContent"></div>
        </div>
    </div>

    <script>
        ${generateClientRegexCode()}
        
        let currentUserEmail = null;
        
        async function getEmails() {
            const userEmail = document.getElementById('userEmail').value;
            if (!userEmail) {
                showError('请输入邮箱地址');
                return;
            }
            
            currentUserEmail = userEmail;
            
            try {
                showSuccess('正在获取邮件列表...');
                
                // 直接调用邮件列表API，不需要会话
                const response = await fetch(\`/api/session/emails?userEmail=\${encodeURIComponent(userEmail)}\`);
                const result = await response.json();
                
                if (result.success) {
                    const data = result.data;
                    document.getElementById('userEmailDisplay').textContent = userEmail;
                    document.getElementById('emailCount').textContent = data.emails ? data.emails.length : 0;
                    
                                         // 只显示HTML格式的邮件列表
                     let message = '';
                     if (data.emails && data.emails.length > 0) {
                         // 提取用户邮箱后缀
                         const userEmailSuffix = userEmail.split('@')[1];
                         
                         // 筛选匹配后缀的邮件
                         const matchingEmails = data.emails.filter(email => {
                             const fromEmail = email.from || '';
                             const fromSuffix = fromEmail.split('@')[1];
                             return fromSuffix === userEmailSuffix;
                         });
                         
                         let emailListHtml = '<div style="margin-top: 20px;">';
                         
                         // 显示匹配的邮件
                         if (matchingEmails.length > 0) {
                             emailListHtml += \`<div style="background: #e8f5e8; border: 1px solid #28a745; border-radius: 6px; padding: 10px; margin-bottom: 15px;">
                                 <strong style="color: #28a745;">📧 找到 \${matchingEmails.length} 封来自 \${userEmailSuffix} 的邮件</strong>
                                 <button onclick="extractAllVerificationCodes()" 
                                         style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 12px;">
                                     批量提取验证码
                                 </button>
                             </div>\`;
                             
                             matchingEmails.forEach((email, index) => {
                                 emailListHtml += \`
                                     <div style="
                                         border: 2px solid #28a745; 
                                         padding: 15px; 
                                         margin: 8px 0; 
                                         border-radius: 8px; 
                                         cursor: pointer; 
                                         background: #f8fff8;
                                         transition: all 0.2s ease;
                                         box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                                     " 
                                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'"
                                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'"
                                     onclick="viewEmailDetail('\${email.id}', '\${email.subject}')"
                                     >
                                         <div style="font-weight: 600; color: #2d3748; margin-bottom: 8px; font-size: 16px;">\${email.subject}</div>
                                         <div style="color: #718096; font-size: 14px; margin-bottom: 4px;">来自: \${email.from}</div>
                                         <div style="color: #a0aec0; font-size: 12px;">时间: \${new Date(email.date).toLocaleString()}</div>
                                         <div style="color: #28a745; font-size: 12px; margin-top: 5px;">✅ 匹配您的邮箱后缀</div>
                                     </div>
                                 \`;
                             });
                         }
                         
                         // 显示其他邮件
                         const otherEmails = data.emails.filter(email => {
                             const fromEmail = email.from || '';
                             const fromSuffix = fromEmail.split('@')[1];
                             return fromSuffix !== userEmailSuffix;
                         });
                         
                         if (otherEmails.length > 0) {
                             emailListHtml += \`<div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 10px; margin: 15px 0;">
                                 <strong style="color: #856404;">📧 其他邮件 (\${otherEmails.length} 封)</strong>
                             </div>\`;
                             
                             otherEmails.forEach((email, index) => {
                                 emailListHtml += \`
                                     <div style="
                                         border: 1px solid #e2e8f0; 
                                         padding: 15px; 
                                         margin: 8px 0; 
                                         border-radius: 8px; 
                                         cursor: pointer; 
                                         background: white;
                                         transition: all 0.2s ease;
                                         box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                                     " 
                                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)'"
                                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.1)'"
                                     onclick="viewEmailDetail('\${email.id}', '\${email.subject}')"
                                     >
                                         <div style="font-weight: 600; color: #2d3748; margin-bottom: 8px; font-size: 16px;">\${email.subject}</div>
                                         <div style="color: #718096; font-size: 14px; margin-bottom: 4px;">来自: \${email.from}</div>
                                         <div style="color: #a0aec0; font-size: 12px;">时间: \${new Date(email.date).toLocaleString()}</div>
                                     </div>
                                 \`;
                             });
                         }
                         
                         emailListHtml += '</div>';
                         message = emailListHtml;
                         
                         // 存储匹配的邮件数据供批量提取使用
                         window.matchingEmailsData = matchingEmails;
                     } else {
                         message = '<p style="text-align: center; color: #718096;">暂无邮件</p>';
                     }
                    
                    showSessionInfo();
                    showSuccess(message);
                } else {
                    showError(result.message);
                }
            } catch (error) {
                showError('获取邮件失败: ' + error.message);
            }
        }
        
        function showSessionInfo() {
            document.getElementById('sessionInfo').classList.remove('hidden');
            // 不调用 hideMessages()，避免隐藏邮件列表
        }
        
        function showSuccess(message) {
            const contentElement = document.getElementById('verificationContent');
            // 检查是否包含HTML标签
            if (message.includes('<') && message.includes('>')) {
                contentElement.innerHTML = message;
            } else {
                contentElement.textContent = message;
            }
            document.getElementById('verificationResult').classList.remove('hidden');
            document.getElementById('verificationResult').classList.remove('error');
            document.getElementById('verificationResult').classList.add('success');
            document.getElementById('errorMessage').classList.add('hidden');
        }
        
        function showError(message) {
            document.getElementById('errorContent').textContent = message;
            document.getElementById('errorMessage').classList.remove('hidden');
            document.getElementById('verificationResult').classList.add('hidden');
        }
        
        async function viewEmailDetail(emailId, subject) {
            if (!currentUserEmail) {
                showError('请先获取邮件列表');
                return;
            }
            
            try {
                // 显示加载状态，但不使用showSuccess避免影响邮件列表
                document.getElementById('emailDetailContent').innerHTML = '<p style="text-align: center; color: #718096;">正在获取邮件详情...</p>';
                document.getElementById('emailDetail').classList.remove('hidden');
                document.getElementById('verificationResult').classList.add('hidden');
                document.getElementById('errorMessage').classList.add('hidden');
                
                const response = await fetch(\`/api/session/email-detail?userEmail=\${encodeURIComponent(currentUserEmail)}&emailId=\${emailId}\`);
                const result = await response.json();
                
                if (result.success) {
                    const data = result.data;
                    
                    // 直接显示邮件内容，不添加额外的包装
                    document.getElementById('emailDetailContent').innerHTML = data.content || '<p style="color: #666;">邮件内容为空</p>';
                    document.getElementById('emailDetail').classList.remove('hidden');
                    document.getElementById('verificationResult').classList.add('hidden');
                    document.getElementById('errorMessage').classList.add('hidden');
                } else {
                    showError(result.message);
                }
            } catch (error) {
                showError('获取邮件详情失败: ' + error.message);
            }
        }
        
        function backToEmailList() {
            // 隐藏邮件详情
            document.getElementById('emailDetail').classList.add('hidden');
            
            // 重新显示邮件列表和邮箱信息
            document.getElementById('verificationResult').classList.remove('hidden');
            document.getElementById('sessionInfo').classList.remove('hidden');
            document.getElementById('errorMessage').classList.add('hidden');
            
            // 确保邮件列表内容仍然存在
            if (!document.getElementById('verificationContent').innerHTML.trim()) {
                // 如果邮件列表内容被清空了，重新获取
                getEmails();
            }
        }
        
                 function hideMessages() {
             document.getElementById('verificationResult').classList.add('hidden');
             document.getElementById('emailDetail').classList.add('hidden');
             document.getElementById('errorMessage').classList.add('hidden');
         }
         
         function extractAugmentCode(content, subject) {
             try {
                 // 使用模块化的验证码提取函数
                 const extractResult = extractVerificationCode(content);
                 
                 if (extractResult.success) {
                     const verificationCode = extractResult.code;
                     
                     // 创建验证码显示区域
                     let resultHtml = \`
                         <div style="background: #e8f5e8; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin-top: 15px;">
                             <h4 style="color: #28a745; margin-top: 0; margin-bottom: 15px;">✅ Augment验证码提取成功</h4>
                             <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 12px; color: #666;">
                                 <strong>使用模式:</strong> \${extractResult.patternDescription}<br>
                                 <strong>匹配文本:</strong> \${extractResult.matchedText}
                             </div>
                             <div style="text-align: center;">
                                 <div style="font-size: 24px; font-weight: bold; color: #28a745; background: white; padding: 15px; border-radius: 6px; border: 2px dashed #28a745; display: inline-block; margin-bottom: 10px;">
                                     \${verificationCode}
                                 </div>
                                 <p style="color: #666; margin: 0; font-size: 14px;">验证码已成功提取，您可以复制使用</p>
                             </div>
                             <div style="margin-top: 15px; text-align: center;">
                                 <button onclick="copyToClipboard('\${verificationCode}', this)" 
                                         style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                                     复制验证码
                                 </button>
                                 <button onclick="closeExtractResult()" 
                                         style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                     关闭
                                 </button>
                             </div>
                         </div>
                     \`;
                     
                     // 在邮件详情下方显示结果
                     const emailDetailContent = document.getElementById('emailDetailContent');
                     emailDetailContent.innerHTML += resultHtml;
                     
                 } else {
                     // 没有找到验证码
                     let errorHtml = \`
                         <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin-top: 15px;">
                             <h4 style="color: #856404; margin-top: 0; margin-bottom: 15px;">⚠️ 未找到验证码</h4>
                             <p style="color: #856404; margin: 0;">在邮件内容中未找到符合格式的验证码。</p>
                             <p style="color: #856404; margin: 10px 0 0 0; font-size: 12px;">错误信息: \${extractResult.message}</p>
                             <div style="margin-top: 15px; text-align: center;">
                                 <button onclick="closeExtractResult()" 
                                         style="background: #ffc107; color: #212529; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                     关闭
                                 </button>
                             </div>
                         </div>
                     \`;
                     
                     const emailDetailContent = document.getElementById('emailDetailContent');
                     emailDetailContent.innerHTML += errorHtml;
                 }
                 
             } catch (error) {
                 console.error('提取验证码失败:', error);
                 
                 let errorHtml = \`
                     <div style="background: #f8d7da; border: 2px solid #dc3545; border-radius: 8px; padding: 20px; margin-top: 15px;">
                         <h4 style="color: #721c24; margin-top: 0; margin-bottom: 15px;">❌ 提取失败</h4>
                         <p style="color: #721c24; margin: 0;">提取验证码时发生错误: \${error.message}</p>
                         <div style="margin-top: 15px; text-align: center;">
                             <button onclick="closeExtractResult()" 
                                     style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                 关闭
                             </button>
                         </div>
                     </div>
                 \`;
                 
                 const emailDetailContent = document.getElementById('emailDetailContent');
                 emailDetailContent.innerHTML += errorHtml;
             }
         }
         
         function copyToClipboard(text, buttonElement) {
             // 如果没有传入按钮元素，尝试从事件中获取
             if (!buttonElement && event && event.target) {
                 buttonElement = event.target;
             }
             
             // 首先尝试使用现代的Clipboard API
             if (navigator.clipboard && window.isSecureContext) {
                 navigator.clipboard.writeText(text).then(function() {
                     showCopySuccess(buttonElement, '已复制!');
                 }).catch(function(err) {
                     console.error('Clipboard API复制失败:', err);
                     fallbackCopyTextToClipboard(text, buttonElement);
                 });
             } else {
                 // 回退到传统的复制方法
                 fallbackCopyTextToClipboard(text, buttonElement);
             }
         }
         
         function fallbackCopyTextToClipboard(text, buttonElement) {
             const textArea = document.createElement('textarea');
             textArea.value = text;
             
             // 避免在页面上显示文本框
             textArea.style.position = 'fixed';
             textArea.style.left = '-999999px';
             textArea.style.top = '-999999px';
             
             document.body.appendChild(textArea);
             textArea.focus();
             textArea.select();
             
             try {
                 const successful = document.execCommand('copy');
                 if (successful) {
                     showCopySuccess(buttonElement, '已复制!');
                 } else {
                     showCopyError(buttonElement, '复制失败，请手动复制验证码');
                 }
             } catch (err) {
                 console.error('Fallback复制失败:', err);
                 showCopyError(buttonElement, '复制失败，请手动复制验证码');
             }
             
             document.body.removeChild(textArea);
         }
         
         function showCopySuccess(buttonElement, message) {
             if (buttonElement) {
                 const originalText = buttonElement.textContent;
                 const originalBackground = buttonElement.style.background || '#28a745';
                 
                 buttonElement.textContent = message;
                 buttonElement.style.background = '#28a745';
                 
                 setTimeout(() => {
                     buttonElement.textContent = originalText;
                     buttonElement.style.background = originalBackground;
                 }, 2000);
             } else {
                 // 如果没有按钮元素，显示通知
                 showNotification(message, 'success');
             }
         }
         
         function showCopyError(buttonElement, message) {
             if (buttonElement) {
                 const originalText = buttonElement.textContent;
                 const originalBackground = buttonElement.style.background || '#28a745';
                 
                 buttonElement.textContent = '复制失败';
                 buttonElement.style.background = '#dc3545';
                 
                 setTimeout(() => {
                     buttonElement.textContent = originalText;
                     buttonElement.style.background = originalBackground;
                 }, 2000);
             }
             
             alert(message);
         }
         
         function showNotification(message, type = 'info') {
             // 创建通知元素
             const notification = document.createElement('div');
             notification.style.cssText = \`
                 position: fixed;
                 top: 20px;
                 right: 20px;
                 padding: 12px 20px;
                 border-radius: 6px;
                 color: white;
                 font-weight: 500;
                 z-index: 10000;
                 animation: slideIn 0.3s ease-out;
                 background: \${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#6c757d'};
             \`;
             notification.textContent = message;
             
             // 添加CSS动画
             if (!document.querySelector('#notification-styles')) {
                 const styles = document.createElement('style');
                 styles.id = 'notification-styles';
                 styles.textContent = \`
                     @keyframes slideIn {
                         from { transform: translateX(100%); opacity: 0; }
                         to { transform: translateX(0); opacity: 1; }
                     }
                 \`;
                 document.head.appendChild(styles);
             }
             
             document.body.appendChild(notification);
             
             // 3秒后自动移除
             setTimeout(() => {
                 if (notification.parentNode) {
                     notification.parentNode.removeChild(notification);
                 }
             }, 3000);
         }
         
         function closeExtractResult() {
             // 移除提取结果显示区域
             const emailDetailContent = document.getElementById('emailDetailContent');
             const extractResult = emailDetailContent.querySelector('div[style*="background: #e8f5e8"], div[style*="background: #fff3cd"], div[style*="background: #f8d7da"]');
             if (extractResult) {
                 extractResult.remove();
             }
         }
         
         async function extractAllVerificationCodes() {
             if (!window.matchingEmailsData || window.matchingEmailsData.length === 0) {
                 alert('没有找到匹配的邮件');
                 return;
             }
             
             // 显示批量提取进度
             const verificationContent = document.getElementById('verificationContent');
             const progressHtml = \`
                 <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 8px; padding: 20px; margin-top: 15px;">
                     <h4 style="color: #1976d2; margin-top: 0; margin-bottom: 15px;">🔄 正在批量提取验证码...</h4>
                     <div style="text-align: center;">
                         <div style="color: #1976d2; margin-bottom: 10px;">正在处理 \${window.matchingEmailsData.length} 封邮件</div>
                         <div style="background: #e0e0e0; border-radius: 10px; height: 20px; overflow: hidden;">
                             <div id="progressBar" style="background: #2196f3; height: 100%; width: 0%; transition: width 0.3s;"></div>
                         </div>
                     </div>
                 </div>
             \`;
             verificationContent.innerHTML += progressHtml;
             
             const results = [];
             const progressBar = document.getElementById('progressBar');
             
             for (let i = 0; i < window.matchingEmailsData.length; i++) {
                 const email = window.matchingEmailsData[i];
                 
                 try {
                     // 更新进度条
                     const progress = ((i + 1) / window.matchingEmailsData.length) * 100;
                     progressBar.style.width = progress + '%';
                     
                     // 获取邮件详情
                     const response = await fetch(\`/api/session/email-detail?userEmail=\${encodeURIComponent(currentUserEmail)}&emailId=\${email.id}\`);
                     const result = await response.json();
                     
                     if (result.success) {
                         const data = result.data;
                         
                         // 提取验证码 - 优先使用text字段，直接使用原始内容
                         const rawContent = data.text || data.content || '';
                         const extractResult = extractVerificationCode(rawContent);
                         
                         if (extractResult.success) {
                             results.push({
                                 subject: data.subject,
                                 from: data.from,
                                 date: data.date,
                                 verificationCode: extractResult.code
                             });
                         }
                     }
                     
                     // 添加延迟避免请求过快
                     await new Promise(resolve => setTimeout(resolve, 500));
                     
                 } catch (error) {
                     console.error('处理邮件失败:', error);
                 }
             }
             
             // 移除进度条
             const progressDiv = verificationContent.querySelector('div[style*="background: #e3f2fd"]');
             if (progressDiv) {
                 progressDiv.remove();
             }
             
             // 显示结果
             if (results.length > 0) {
                 let resultHtml = \`
                     <div style="background: #e8f5e8; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin-top: 15px;">
                         <h4 style="color: #28a745; margin-top: 0; margin-bottom: 15px;">✅ 批量提取完成</h4>
                         <p style="color: #28a745; margin-bottom: 15px;">成功提取 \${results.length} 个验证码</p>
                         <div style="max-height: 300px; overflow-y: auto;">
                 \`;
                 
                 results.forEach((result, index) => {
                     resultHtml += \`
                         <div style="background: white; border: 1px solid #28a745; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
                             <div style="font-weight: 600; color: #2d3748; margin-bottom: 5px;">\${result.subject}</div>
                             <div style="color: #718096; font-size: 12px; margin-bottom: 5px;">来自: \${result.from}</div>
                             <div style="color: #a0aec0; font-size: 12px; margin-bottom: 10px;">时间: \${new Date(result.date).toLocaleString()}</div>
                             <div style="text-align: center;">
                                 <span style="font-size: 20px; font-weight: bold; color: #28a745; background: #f8fff8; padding: 8px 12px; border-radius: 4px; border: 1px dashed #28a745;">
                                     \${result.verificationCode}
                                 </span>
                                 <button onclick="copyToClipboard('\${result.verificationCode}', this)" 
                                         style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; margin-left: 8px; font-size: 11px;">
                                     复制
                                 </button>
                             </div>
                         </div>
                     \`;
                 });
                 
                 resultHtml += \`
                         </div>
                         <div style="margin-top: 15px; text-align: center;">
                             <button onclick="copyAllCodes()" 
                                     style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                                 复制所有验证码
                             </button>
                             <button onclick="closeBatchResult()" 
                                     style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                 关闭
                             </button>
                         </div>
                     </div>
                 \`;
                 
                 verificationContent.innerHTML += resultHtml;
                 
                 // 存储结果供复制所有验证码使用
                 window.batchResults = results;
                 
             } else {
                 const noResultHtml = \`
                     <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin-top: 15px;">
                         <h4 style="color: #856404; margin-top: 0; margin-bottom: 15px;">⚠️ 未找到验证码</h4>
                         <p style="color: #856404; margin: 0;">在匹配的邮件中未找到符合格式的验证码。</p>
                         <div style="margin-top: 15px; text-align: center;">
                             <button onclick="closeBatchResult()" 
                                     style="background: #ffc107; color: #212529; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                 关闭
                             </button>
                         </div>
                     </div>
                 \`;
                 verificationContent.innerHTML += noResultHtml;
             }
         }
         
         function copyAllCodes() {
             if (!window.batchResults || window.batchResults.length === 0) {
                 alert('没有可复制的验证码');
                 return;
             }
             
             const allCodes = window.batchResults.map(result => result.verificationCode).join(', ');
             // 使用事件源作为按钮元素
             copyToClipboard(allCodes, event ? event.target : null);
         }
         
         function closeBatchResult() {
             // 移除批量提取结果显示区域
             const verificationContent = document.getElementById('verificationContent');
             const batchResult = verificationContent.querySelector('div[style*="background: #e8f5e8"], div[style*="background: #fff3cd"]');
             if (batchResult) {
                 batchResult.remove();
             }
         }
         
         async function getAugmentCode() {
             const userEmail = document.getElementById('userEmail').value;
             if (!userEmail) {
                 showError('请输入邮箱地址');
                 return;
             }
             
             currentUserEmail = userEmail;
             
             try {
                 // 显示处理状态
                 showSuccess('🔄 正在获取Augment验证码...');
                 
                 // 1. 获取邮件列表
                 const response = await fetch(\`/api/session/emails?userEmail=\${encodeURIComponent(userEmail)}\`);
                 const result = await response.json();
                 
                 if (!result.success) {
                     showError(result.message);
                     return;
                 }
                 
                 const data = result.data;
                 if (!data.emails || data.emails.length === 0) {
                     showError('未找到任何邮件');
                     return;
                 }
                 
                                 // 2. 先按邮箱后缀筛选邮件
                const emailSuffix = userEmail.split('@')[1];
                console.log('当前邮箱后缀:', emailSuffix);
                console.log('所有邮件详情:', data.emails.map(e => ({ 
                    subject: e.subject, 
                    from: e.from, 
                    from_mail: e.from_mail,
                    mail_id: e.mail_id,
                    date: e.date
                })));
                
                // 使用 from 字段进行筛选（与 getEmails 函数保持一致）
                const emailsWithSameSuffix = data.emails.filter(email => {
                    const fromEmail = email.from || '';
                    console.log('检查邮件发件人:', fromEmail, '目标后缀:', emailSuffix);
                    if (!fromEmail) return false;
                    
                    const emailSuffixFromEmail = fromEmail.split('@')[1];
                    const isMatch = emailSuffixFromEmail === emailSuffix;
                    console.log('后缀匹配结果:', emailSuffixFromEmail, '===', emailSuffix, '->', isMatch);
                    return isMatch;
                });
                
                console.log('按邮箱后缀筛选后的邮件数量:', emailsWithSameSuffix.length);
                
                if (emailsWithSameSuffix.length === 0) {
                    showError('未找到匹配邮箱后缀的邮件');
                    return;
                }
                
                // 3. 按时间排序，取最新的一条邮件
                const sortedEmails = emailsWithSameSuffix.sort((a, b) => {
                    const dateA = new Date(a.date || 0);
                    const dateB = new Date(b.date || 0);
                    return dateB - dateA; // 降序，最新的在前
                });
                
                const latestEmail = sortedEmails[0];
                console.log('最新邮件:', latestEmail);
                 
                // 4. 获取最新邮件的详情
                try {
                    const detailResponse = await fetch(\`/api/session/email-detail?userEmail=\${encodeURIComponent(userEmail)}&emailId=\${latestEmail.id}\`);
                    const detailResult = await detailResponse.json();
                    
                    if (!detailResult.success) {
                        showError('获取邮件详情失败: ' + detailResult.message);
                        return;
                    }
                    
                    const emailData = detailResult.data;
                    console.log('邮件详情:', emailData);
                 
                    // 5. 提取Augment验证码 - 优先使用text字段，避免HTML解析问题
                    console.log('原始邮件内容 (content):', emailData.content);
                    console.log('原始邮件内容 (text):', emailData.text);
                    
                    // 优先使用text字段，然后才取content字段 - 直接使用原始内容
                    let rawContent = emailData.text || emailData.content || '';
                    
                    console.log('原始内容长度:', rawContent.length);
                    console.log('原始内容(前200字符):', rawContent.substring(0, 200));
                    console.log('是否包含关键词:', rawContent.includes('Your verification code'));
                    
                    // 使用模块化的验证码提取函数
                    const extractResult = extractVerificationCode(rawContent);
                    
                    console.log('模块化提取结果:', extractResult);
                    
                    let verificationCode = null;
                    let matchedPattern = null;
                    
                    if (extractResult.success) {
                        verificationCode = extractResult.code;
                        matchedPattern = extractResult.patternDescription;
                        console.log('✅ 模块化提取成功 - 验证码:', verificationCode);
                        console.log('使用的模式:', matchedPattern);
                    } else {
                        console.log('❌ 模块化提取失败:', extractResult.message);
                    }
                    
                    console.log('最终提取的验证码:', verificationCode);
                    console.log('使用的模式:', matchedPattern);
                    
                    if (!verificationCode) {
                        // 显示邮件内容供调试
                        const errorMessage = extractResult ? extractResult.message : '未知错误';
                        showError(\`在邮件中未找到验证码\\n\\n错误信息: \${errorMessage}\\n\\n邮件内容:\\n\${emailData.text}\\n\\n请检查邮件内容格式\`);
                        return;
                    }
                 
                                     // 6. 显示结果
                    const resultHtml = \`
                     <div style="background: #e8f5e8; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin-top: 15px;">
                         <h4 style="color: #28a745; margin-top: 0; margin-bottom: 15px;">✅ Augment验证码获取成功</h4>
                         
                         <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                             <div style="margin-bottom: 8px;">
                                 <strong style="color: #495057;">邮件主题:</strong> 
                                 <span style="color: #212529;">\${emailData.subject}</span>
                             </div>
                             <div style="margin-bottom: 8px;">
                                 <strong style="color: #495057;">发件人:</strong> 
                                 <span style="color: #212529;">\${emailData.from}</span>
                             </div>
                             <div style="margin-bottom: 8px;">
                                 <strong style="color: #495057;">时间:</strong> 
                                 <span style="color: #212529;">\${new Date(emailData.date).toLocaleString()}</span>
                             </div>
                             <div style="margin-bottom: 8px;">
                                 <strong style="color: #495057;">使用模式:</strong> 
                                 <span style="color: #28a745; font-size: 12px;">\${matchedPattern}</span>
                             </div>
                         </div>
                         
                         <div style="text-align: center;">
                             <div style="font-size: 28px; font-weight: bold; color: #28a745; background: white; padding: 20px; border-radius: 8px; border: 3px dashed #28a745; display: inline-block; margin-bottom: 15px; letter-spacing: 3px;">
                                 \${verificationCode}
                             </div>
                             <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">验证码已成功提取，您可以复制使用</p>
                             
                             <div style="display: flex; gap: 10px; justify-content: center;">
                                 <button onclick="copyToClipboard('\${verificationCode}', this)" 
                                         style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: transform 0.2s;"
                                         onmouseover="this.style.transform='translateY(-2px)'"
                                         onmouseout="this.style.transform='translateY(0)'">
                                     📋 复制验证码
                                 </button>
                                 <button onclick="viewEmailDetail('\${latestEmail.id}', '\${emailData.subject}')" 
                                         style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: transform 0.2s;"
                                         onmouseover="this.style.transform='translateY(-2px)'"
                                         onmouseout="this.style.transform='translateY(0)'">
                                     📧 查看邮件详情
                                 </button>
                             </div>
                         </div>
                     </div>
                 \`;
                 
                                     // 更新邮箱信息显示
                    document.getElementById('userEmailDisplay').textContent = userEmail;
                    document.getElementById('emailCount').textContent = data.emails.length;
                    
                                        // 显示结果
                    showSessionInfo();
                    showSuccess(resultHtml);
                    
                } catch (error) {
                    console.error('获取邮件详情失败:', error);
                    showError('获取邮件详情失败: ' + error.message);
                }
                
            } catch (error) {
                console.error('获取Augment验证码失败:', error);
                showError('获取Augment验证码失败: ' + error.message);
            }
        }
    </script>
</body>
</html>
    `);
  }
  
  return ResponseUtil.notFound('文件未找到');
}

/**
 * Cloudflare Workers 事件监听器
 * 
 * 处理所有传入的fetch事件。
 */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request, event.env, event.ctx));
});

/**
 * 导出处理函数（用于测试）
 */
export { handleRequest };
