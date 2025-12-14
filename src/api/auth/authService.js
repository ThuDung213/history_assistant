import userApi from './userApi';

const TOKEN_KEYS = ['token', 'access_token', 'ha_token', 'refresh_token'];

export function clearAuthTokens(storage = window.localStorage) {
  TOKEN_KEYS.forEach((k) => storage.removeItem(k));
}

export async function logout() {
  try {
    await userApi.logout();
  } catch {
  } finally {
    clearAuthTokens();
  }
}