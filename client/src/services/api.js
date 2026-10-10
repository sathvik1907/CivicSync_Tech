/**
 * Centralized API service with credentials, CSRF management,
 * and robust error handling.
 */

let cachedCsrfToken = null;

export async function getCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const res = await fetch('/api/v1/auth/csrf', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
  }
  return null;
}

export function invalidateCsrfToken() {
  cachedCsrfToken = null;
}

export async function apiRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...options.headers };

  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // State-changing requests require CSRF token
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = await getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include'
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.code = data?.code || 'API_ERROR';
    error.fieldErrors = data?.fieldErrors;
    throw error;
  }

  return data;
}

export const api = {
  get: (url, options) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, body, options) => apiRequest(url, { ...options, method: 'POST', body: options?.isFormData ? body : JSON.stringify(body) }),
  patch: (url, body, options) => apiRequest(url, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url, options) => apiRequest(url, { ...options, method: 'DELETE' })
};
