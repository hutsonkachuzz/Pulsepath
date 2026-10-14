const TOKEN_KEY = 'pulsepath_jwt_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getAssetUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url : '/' + url;
  return `${API_BASE_URL}${cleanUrl}`;
}

export async function apiRequest(endpoint, { method = 'GET', body, headers = {}, isFormData = false } = {}) {
  const token = getStoredToken();
  const reqHeaders = { ...headers };

  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData && body && typeof body === 'object') {
    reqHeaders['Content-Type'] = 'application/json';
  }

  const fullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const response = await fetch(fullUrl, {
    method,
    headers: reqHeaders,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
  });

  if (response.status === 401) {
    const cachedUser = localStorage.getItem('pulsepath_local_user');
    const isDemo = cachedUser && (cachedUser.includes('pulsepath.love') || cachedUser.includes('user_eren') || cachedUser.includes('user_mikasa'));
    if (!isDemo) {
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent('pulsepath_unauthorized'));
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Session expired. Please sign in again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = errorData.detail;
    if (Array.isArray(msg)) {
      msg = msg.map(m => m.msg || m.message).join(', ');
    }
    throw new Error(msg || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// API Resource Endpoints
export const api = {
  // Auth
  register: (data) => apiRequest('/api/auth/register', { method: 'POST', body: data }),
  login: (data) => apiRequest('/api/auth/login', { method: 'POST', body: data }),
  demoLogin: (role) => apiRequest('/api/auth/demo', { method: 'POST', body: { role } }),
  getMe: () => apiRequest('/api/auth/me'),
  updateProfile: (data) => apiRequest('/api/auth/profile', { method: 'PUT', body: data }),

  // Couples
  createCouple: (data) => apiRequest('/api/couples/create', { method: 'POST', body: data }),
  joinCouple: (data) => apiRequest('/api/couples/join', { method: 'POST', body: data }),
  getCurrentCouple: () => apiRequest('/api/couples/current'),

  // Memories
  getMemories: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.mood && params.mood !== 'ALL') query.append('mood', params.mood);
    if (params.only_favorites) query.append('only_favorites', 'true');
    const qs = query.toString();
    return apiRequest(`/api/memories/${qs ? '?' + qs : ''}`);
  },
  createMemory: (data) => apiRequest('/api/memories/', { method: 'POST', body: data }),
  updateMemory: (id, data) => apiRequest(`/api/memories/${id}`, { method: 'PUT', body: data }),
  deleteMemory: (id) => apiRequest(`/api/memories/${id}`, { method: 'DELETE' }),

  // Chat
  getMessages: () => apiRequest('/api/chat/messages'),
  sendMessage: (data) => apiRequest('/api/chat/messages', { method: 'POST', body: data }),
  toggleReaction: (id, emoji) => apiRequest(`/api/chat/messages/${id}/reaction`, { method: 'POST', body: { emoji } }),
  saveAsMemory: (id, customTitle) => apiRequest(`/api/chat/messages/${id}/save-memory`, { method: 'POST', body: { custom_title: customTitle } }),
  markSeen: () => apiRequest('/api/chat/messages/seen', { method: 'POST' }),

  // Thoughts
  getThoughts: () => apiRequest('/api/thoughts/'),
  createThought: (data) => apiRequest('/api/thoughts/', { method: 'POST', body: data }),
  deleteThought: (id) => apiRequest(`/api/thoughts/${id}`, { method: 'DELETE' }),

  // Letters
  getLetters: () => apiRequest('/api/letters/'),
  createLetter: (data) => apiRequest('/api/letters/', { method: 'POST', body: data }),
  openLetter: (id) => apiRequest(`/api/letters/${id}/open`, { method: 'PUT' }),

  // Dates
  getDates: () => apiRequest('/api/dates/'),
  createDate: (data) => apiRequest('/api/dates/', { method: 'POST', body: data }),
  deleteDate: (id) => apiRequest(`/api/dates/${id}`, { method: 'DELETE' }),

  // Daily Question
  getDailyQuestion: () => apiRequest('/api/daily/today'),
  submitDailyAnswer: (answerText) => apiRequest('/api/daily/answer', { method: 'POST', body: { answer_text: answerText } }),

  // Moods
  getMoods: () => apiRequest('/api/moods/'),
  setMood: (data) => apiRequest('/api/moods/', { method: 'POST', body: data }),

  // Reminders
  getReminders: () => apiRequest('/api/reminders/'),
  updateReminders: (data) => apiRequest('/api/reminders/', { method: 'PUT', body: data }),

  // File Uploads
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/api/uploads/', { method: 'POST', body: formData, isFormData: true });
  }
};
