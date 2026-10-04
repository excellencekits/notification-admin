import axios from 'axios';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { config } from '../../lib/config';

export type Tokens = { accessToken: string; refreshToken: string };

// A small, browser-only token manager for handling refresh with single-flight locking.
class TokenManager {
  private refreshPromise: Promise<Tokens | null> | null = null;

  getAccessToken(): string | undefined {
    return (getCookie('accessToken') as string | undefined) || undefined;
  }

  getRefreshToken(): string | undefined {
    return (getCookie('refreshToken') as string | undefined) || undefined;
  }

  setTokens(tokens: Tokens) {
    const { accessToken, refreshToken } = tokens;
    setCookie('accessToken', accessToken, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    setCookie('refreshToken', refreshToken, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

  clearTokens() {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
  }

  isAccessExpired(leewaySeconds = 30): boolean {
    try {
      const token = this.getAccessToken();
      if (!token) return true;
      const decoded: any = jwtDecode(token);
      const nowSec = Math.floor(Date.now() / 1000);
      return typeof decoded?.exp === 'number' ? decoded.exp <= nowSec + leewaySeconds : false;
    } catch {
      return true;
    }
  }

  async refreshTokens(): Promise<Tokens | null> {
    // Single-flight: return existing promise if a refresh is in progress
    if (this.refreshPromise) return this.refreshPromise;

    const run = async (): Promise<Tokens | null> => {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;

      try {
        const url = `${config.NEXT_PUBLIC_OAUTH2_SERVER}/oauth2/token`;
        const params = new URLSearchParams({
          client_id: String(config.NEXT_PUBLIC_OAUTH2_CLIENT_ID ?? ''),
          client_secret: String(config.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET ?? ''),
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        });

        const res = await axios.post(url, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        const data = res.data || {};
        const newAccess = data.access_token as string | undefined;
        const newRefresh = (data.refresh_token as string | undefined) || refreshToken;
        if (!newAccess) throw new Error('No access_token in refresh response');

        const tokens = { accessToken: newAccess, refreshToken: newRefresh };
        this.setTokens(tokens);
        return tokens;
      } catch {
        // On any failure, clear tokens
        this.clearTokens();
        return null;
      } finally {
        // Ensure the promise reference is cleared after completion
        this.refreshPromise = null;
      }
    };

    this.refreshPromise = run();
    return this.refreshPromise;
  }
}

export const tokenManager = new TokenManager();
export default tokenManager;
