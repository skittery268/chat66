const BASE = import.meta.env.VITE_API_URL;

// Called by AuthContext when it mounts — allows API layer to auto-logout on 401
let onUnauthorized = () => {};
export const setOnUnauthorized = (fn) => { onUnauthorized = fn; };

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (res.status === 401) {
    onUnauthorized();
    throw new Error(data.message || 'Session expired, please login again');
  }
  if (data.status !== 'success') {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Auth
export const signup = (fullname, email, password) =>
  request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ fullname, email, password }),
  });

export const login = (email, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const getMe = () => request('/auth/me');

// Groups
export const createGroup = (title) =>
  request('/group', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });

export const getUserGroups = () => request('/group/user');

export const joinGroup = (id) =>
  request(`/group/join/${id}`, { method: 'POST' });

export const deleteGroup = (id) =>
  request(`/group/${id}`, { method: 'DELETE' });

// Messages
export const getMessages = (groupId) =>
  request(`/message/group/${groupId}`);

export const sendMessage = (groupId, content) =>
  request(`/message/${groupId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

export const deleteMessage = (messageId) =>
  request(`/message/${messageId}`, { method: 'DELETE' });
