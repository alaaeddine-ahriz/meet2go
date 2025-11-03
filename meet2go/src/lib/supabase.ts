import 'react-native-url-polyfill/auto';
// Polyfill WebCrypto for PKCE (Expo Go / React Native)
try {
  // Random values for PKCE verifiers
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('react-native-get-random-values');
  // WebCrypto (subtle.digest) for SHA-256 code challenge
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { crypto } = require('react-native-webcrypto');
  // Attach to global so auth-js can find crypto.subtle
  if (typeof global !== 'undefined' && !(global as any).crypto) {
    (global as any).crypto = crypto;
  }
} catch {}
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as ExpoCrypto from 'expo-crypto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Storage implementation for auth tokens
// - Native: use expo-secure-store
// - Web: fall back to localStorage (expo-secure-store isn't supported)
const NativeSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from SecureStore:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in SecureStore:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from SecureStore:', error);
    }
  },
};

const WebStorageAdapter = {
  getItem: async (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: (Platform.OS === 'web' ? WebStorageAdapter : NativeSecureStoreAdapter) as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

// Final fallback: provide minimal crypto.subtle.digest using expo-crypto if still missing
try {
  const g: any = global as any;
  if (!g.crypto || !g.crypto.subtle || typeof g.crypto.subtle.digest !== 'function') {
    if (!g.crypto) g.crypto = {};
    g.crypto.subtle = {
      async digest(algorithm: string | { name: string }, data: ArrayBuffer): Promise<ArrayBuffer> {
        const algo = typeof algorithm === 'string' ? algorithm : algorithm?.name;
        if (!algo || algo.toUpperCase() !== 'SHA-256') {
          throw new Error('Only SHA-256 is supported');
        }
        const bytes = new Uint8Array(data);
        let str = '';
        for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
        const hex = await ExpoCrypto.digestStringAsync(ExpoCrypto.CryptoDigestAlgorithm.SHA256, str);
        const out = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) out[i / 2] = parseInt(hex.substr(i, 2), 16);
        return out.buffer;
      },
    } as SubtleCrypto;
  }
} catch {}
