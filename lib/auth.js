export const setSession = (token, user) => {
  localStorage.setItem('pushsms_token', token);
  localStorage.setItem('pushsms_user', JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem('pushsms_token');
  localStorage.removeItem('pushsms_user');
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('pushsms_user') || 'null');
  } catch { return null; }
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pushsms_token');
};

export const isAuthenticated = () => !!getToken();

export const isAdmin = () => ['ADMIN', 'SUPERADMIN'].includes(getUser()?.role);
export const isSuperAdmin = () => getUser()?.role === 'SUPERADMIN';
