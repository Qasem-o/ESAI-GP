
let baseUrl = import.meta.env.VITE_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : 'https://esai-firstdraft.onrender.com');

if (baseUrl && baseUrl.startsWith('http://') && (baseUrl.includes('railway.app') || baseUrl.includes('onrender.com'))) {
  baseUrl = baseUrl.replace('http://', 'https://');
}

export const API_BASE_URL = baseUrl;

export const getHeaders = (includeAuth = true) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Globally intercept 401 Unauthorized fetch responses
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    // 401 Unauthorized means the token is invalid or expired
    if (response.status === 401) {
      const urlStr = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url || '';
      if (!urlStr.includes('/auth/login') && !urlStr.includes('/auth/signup') && !urlStr.includes('/auth/refresh')) {
        // Dispatch session-expired event
        const event = new CustomEvent('session-expired');
        window.dispatchEvent(event);
      }
    }
    return response;
  };
}

export const translateError = (message: string, language: string): string => {
  if (!message) return message;
  const msgLower = message.toLowerCase();
  
  if (language === 'ar') {
    if (msgLower.includes('session expired') || msgLower.includes('invalid or expired token') || msgLower.includes('token expired')) {
      return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى إلى منصة EyeStocksAi.';
    }
    if (msgLower.includes('verification code expired')) {
      return 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.';
    }
    if (msgLower.includes('reset code expired')) {
      return 'انتهت صلاحية رمز إعادة التعيين. يرجى طلب رمز جديد.';
    }
  } else {
    if (msgLower.includes('session expired') || msgLower.includes('invalid or expired token') || msgLower.includes('token expired')) {
      return 'Session expired. Please login again to EyeStocksAi.';
    }
  }
  
  return message;
};
