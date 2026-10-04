// next
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// project imports
import axiosServices from 'utils/axios';
import { config } from '../../lib/config';

const users = [
  {
    id: 1,
    name: 'Jone Doe',
    email: 'info@codedthemes.com',
    password: '123456'
  }
];

declare module 'next-auth' {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  }

  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      id?: string;
      email?: string;
      name?: string;
      role?: string[];
      image?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  }
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(token: any) {
  try {
    const response = await axios.post(
      `${config.NEXT_PUBLIC_OAUTH2_SERVER}/oauth2/token`,
      (() => {
        const params = {
          client_id: config.NEXT_PUBLIC_OAUTH2_CLIENT_ID ?? '',
          client_secret: config.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET ?? '',
          grant_type: 'refresh_token',
          refresh_token: String(token.refreshToken ?? '')
        } as Record<string, string | number | boolean | undefined>;
        return new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)] as [string, string]));
      })(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const refreshedTokens = response.data;

    // Decode the new access token to get user info
    const decoded: any = jwtDecode(refreshedTokens.access_token);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      accessTokenExpires: decoded.exp * 1000, // Convert to milliseconds
      error: undefined
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError'
    };
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const appleClientId = process.env.APPLE_ID || process.env.NEXT_PUBLIC_APPLE_ID;
const appleClientSecret = process.env.APPLE_SECRET;

export const authOptions: NextAuthOptions = {
  secret: config.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET,
  providers: [
    GoogleProvider({
      clientId: googleClientId || 'google-client-id-placeholder',
      clientSecret: googleClientSecret || 'google-client-secret-placeholder',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    AppleProvider({
      clientId: appleClientId || 'apple-client-id-placeholder',
      clientSecret: appleClientSecret || 'apple-client-secret-placeholder'
    }),
    CredentialsProvider({
      id: 'login',
      name: 'login',
      credentials: {
        email: { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter Email' },
        password: { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter Password' }
      },
      async authorize(credentials) {
        try {
          // Call your OAuth2 server for password grant
          // Ensure credentials are provided
          if (!credentials || !credentials.email || !credentials.password) {
            throw new Error('Missing credentials');
          }

          const response = await axios.post(
            `${config.NEXT_PUBLIC_OAUTH2_SERVER}/oauth2/token`,
            (() => {
              const params = {
                client_id: config.NEXT_PUBLIC_OAUTH2_CLIENT_ID ?? '',
                client_secret: config.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET ?? '',
                grant_type: 'password',
                username: String(credentials.email),
                password: String(credentials.password)
              } as Record<string, string | number | boolean | undefined>;
              return new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)] as [string, string]));
            })(),
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
          );

          if (response.data?.access_token) {
            // Decode JWT to get user information
            const decoded: any = jwtDecode(response.data.access_token);

            // Extract user ID - prefer 'id' field over 'sub'
            const userId = decoded.id || decoded.sub;

            // Extract email from token or use credentials as fallback
            const email = decoded.email || decoded.username || decoded.user_name || credentials?.email;

            // Extract role - handle both string and array formats
            let role: string | undefined;
            if (typeof decoded.roles === 'string') {
              role = decoded.roles;
            } else if (Array.isArray(decoded.roles) && decoded.roles.length > 0) {
              role = decoded.roles[0];
            } else if (decoded.role) {
              role = decoded.role;
            } else if (decoded.authorities && decoded.authorities[0]) {
              role = decoded.authorities[0];
            }

            return {
              id: userId,
              email: email,
              name: decoded.name,
              role: role,
              accessToken: response.data.access_token,
              refreshToken: response.data.refresh_token
            };
          }

          return null;
        } catch (e: any) {
          const errorMessage = e?.response?.data?.error_description || e?.response?.data?.error || e?.message || 'Login failed';
          throw new Error(errorMessage);
        }
      }
    }),
    CredentialsProvider({
      id: 'register',
      name: 'Register',
      credentials: {
        firstname: { name: 'firstname', label: 'Firstname', type: 'text', placeholder: 'Enter Firstname' },
        lastname: { name: 'lastname', label: 'Lastname', type: 'text', placeholder: 'Enter Lastname' },
        email: { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter Email' },
        company: { name: 'company', label: 'Company', type: 'text', placeholder: 'Enter Company' },
        password: { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter Password' }
      },
      async authorize(credentials) {
        try {
          // Register user via your API
          const user = await axiosServices.post('/api/account/register', {
            firstName: credentials?.firstname,
            lastName: credentials?.lastname,
            company: credentials?.company,
            password: credentials?.password,
            email: credentials?.email
          });

          if (user) {
            users.push(user.data);
            return user.data;
          }
        } catch (e: any) {
          const errorMessage = e?.message || e?.response?.data?.message || 'Something went wrong!';
          throw new Error(errorMessage);
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user, account }: any) => {
      // Handle OAuth Providers (Google, Apple)
      if (account && (account.provider === 'google' || account.provider === 'apple')) {
        const grantType = account.provider === 'google' ? 'google_token' : 'apple_token';
        const idToken = account.id_token;

        token.provider = account.provider;

        if (idToken) {
          try {
            console.log(`[NextAuth] Exchanging ${account.provider} id_token with OAuth2 server...`);
            const response = await axios.post(
              `${config.NEXT_PUBLIC_OAUTH2_SERVER}/oauth2/token?grant_type=${grantType}`,
              new URLSearchParams({
                client_id: config.NEXT_PUBLIC_OAUTH2_CLIENT_ID ?? '',
                client_secret: config.NEXT_PUBLIC_OAUTH2_CLIENT_SECRET ?? '',
                id_token: idToken,
                ...(user?.name ? { full_name: user.name } : {})
              }),
              {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
              }
            );

            if (response.data?.access_token) {
              const decoded: any = jwtDecode(response.data.access_token);
              token.accessToken = response.data.access_token;
              token.refreshToken = response.data.refresh_token;
              token.accessTokenExpires = decoded.exp ? decoded.exp * 1000 : Date.now() + 86400000;
              token.id = String(decoded.id || decoded.sub || user?.id);
              token.email = decoded.email || user?.email;
              token.name = decoded.name || user?.name;
              token.role = decoded.roles || decoded.role || 'USER';
              return token;
            }
          } catch (exchangeErr: any) {
            console.warn(`[NextAuth] Backend exchange failed for ${account.provider}:`, exchangeErr?.response?.data || exchangeErr?.message);
          }
        }

        // Fallback if backend exchange did not return token
        token.accessToken = account.access_token || account.id_token;
        token.id = String(user?.id || token.sub || '');
        token.email = user?.email;
        token.name = user?.name;
        token.role = user?.role || 'USER';
      }

      // Initial sign in
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;

        // Decode token to get expiration
        if (user.accessToken) {
          try {
            const decoded: any = jwtDecode(user.accessToken);
            token.accessTokenExpires = decoded.exp * 1000; // Convert to milliseconds
          } catch {}
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      if (token.refreshToken) {
        return await refreshAccessToken(token);
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.error = token.error as string;
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role ? (Array.isArray(token.role) ? token.role : [token.role]) : []
        };
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.NEXT_PUBLIC_JWT_TIMEOUT!)
  },
  jwt: {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET
  },
  pages: {
    signIn: '/login',
    newUser: '/register'
  }
};
