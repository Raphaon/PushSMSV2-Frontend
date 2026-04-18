import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pushsms_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('pushsms_token');
      localStorage.removeItem('pushsms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Helpers ──────────────────────────────────────────────────────────────────
export const getErrMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Une erreur est survenue';

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (body) => api.post('/auth/register', body),
  login: (body) => api.post('/auth/login', body),
  me: () => api.get('/auth/me'),
  forgotPassword: (body) => api.post('/auth/forgot-password', body),
  resetPassword: (body) => api.post('/auth/reset-password', body),
  changePassword: (body) => api.post('/auth/change-password', body),
};

// ── Tenants ───────────────────────────────────────────────────────────────────
export const tenantsApi = {
  get: (id) => api.get(`/tenants/${id}`),
  update: (id, body) => api.patch(`/tenants/${id}`, body),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  create: (body) => api.post('/users', body),
  update: (id, body) => api.patch(`/users/${id}`, body),
  delete: (id) => api.delete(`/users/${id}`),
};

// ── Contacts ──────────────────────────────────────────────────────────────────
export const contactsApi = {
  list: (params) => api.get('/contacts', { params }),
  get: (id) => api.get(`/contacts/${id}`),
  create: (body) => api.post('/contacts', body),
  update: (id, body) => api.patch(`/contacts/${id}`, body),
  delete: (id) => api.delete(`/contacts/${id}`),
  import: (formData) => api.post('/contacts/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Contact Lists ─────────────────────────────────────────────────────────────
export const contactListsApi = {
  list: (params) => api.get('/contact-lists', { params }),
  get: (id) => api.get(`/contact-lists/${id}`),
  create: (body) => api.post('/contact-lists', body),
  update: (id, body) => api.patch(`/contact-lists/${id}`, body),
  delete: (id) => api.delete(`/contact-lists/${id}`),
  getMembers: (id, params) => api.get(`/contact-lists/${id}/members`, { params }),
  addMember: (id, body) => api.post(`/contact-lists/${id}/members`, body),
  removeMember: (id, contactId) => api.delete(`/contact-lists/${id}/members/${contactId}`),
};

// ── Sender IDs ────────────────────────────────────────────────────────────────
export const senderIdsApi = {
  list: () => api.get('/sender-ids'),
  create: (body) => api.post('/sender-ids', body),
  activate: (id) => api.patch(`/sender-ids/${id}/activate`),
  deactivate: (id) => api.patch(`/sender-ids/${id}/deactivate`),
};

// ── SMS Templates ─────────────────────────────────────────────────────────────
export const templatesApi = {
  list: (params) => api.get('/sms-templates', { params }),
  get: (id) => api.get(`/sms-templates/${id}`),
  create: (body) => api.post('/sms-templates', body),
  update: (id, body) => api.patch(`/sms-templates/${id}`, body),
  delete: (id) => api.delete(`/sms-templates/${id}`),
  preview: (id, body) => api.post(`/sms-templates/${id}/preview`, body),
};

// ── Opt-outs ──────────────────────────────────────────────────────────────────
export const optOutsApi = {
  list: (params) => api.get('/opt-outs', { params }),
  check: (phone) => api.get('/opt-outs/check', { params: { phone } }),
  create: (body) => api.post('/opt-outs', body),
  remove: (body) => api.delete('/opt-outs', { data: body }),
};

// ── Wallet ────────────────────────────────────────────────────────────────────
export const walletApi = {
  get: () => api.get('/wallet'),
  transactions: (params) => api.get('/wallet/transactions', { params }),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsApi = {
  initiate: (body) => api.post('/payments', body),
  confirm: (id) => api.post(`/payments/${id}/confirm`),
  cancel: (id) => api.post(`/payments/${id}/cancel`),
};

// ── Providers ─────────────────────────────────────────────────────────────────
export const providersApi = {
  list: () => api.get('/providers'),
  pricing: () => api.get('/providers/pricing'),
};

// ── Campaigns ─────────────────────────────────────────────────────────────────
export const campaignsApi = {
  list: (params) => api.get('/campaigns', { params }),
  get: (id) => api.get(`/campaigns/${id}`),
  create: (body) => api.post('/campaigns', body),
  update: (id, body) => api.patch(`/campaigns/${id}`, body),
  schedule: (id, body) => api.post(`/campaigns/${id}/schedule`, body),
  launch: (id) => api.post(`/campaigns/${id}/launch`),
  cancel: (id) => api.post(`/campaigns/${id}/cancel`),
  report: (id) => api.get(`/campaigns/${id}/report`),
};

// ── Messages ──────────────────────────────────────────────────────────────────
export const messagesApi = {
  list: (params) => api.get('/messages', { params }),
  get: (id) => api.get(`/messages/${id}`),
  events: (id) => api.get(`/messages/${id}/events`),
  send: (body) => api.post('/messages/send', body),
};

// ── API Keys ──────────────────────────────────────────────────────────────────
export const apiKeysApi = {
  list: () => api.get('/api-keys'),
  create: (body) => api.post('/api-keys', body),
  revoke: (id) => api.delete(`/api-keys/${id}`),
};

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const auditApi = {
  list: (params) => api.get('/audit-logs', { params }),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: (params) => api.get('/notifications', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// ── Recharge Requests ─────────────────────────────────────────────────────────
export const rechargeApi = {
  list: (params) => api.get('/recharge-requests', { params }),
  create: (body) => api.post('/recharge-requests', body),
  review: (id, body) => api.patch(`/recharge-requests/${id}/review`, body),
};

// ── Contact Lists: import ─────────────────────────────────────────────────────
export const contactListsImportApi = (id, formData) =>
  api.post(`/contact-lists/${id}/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
