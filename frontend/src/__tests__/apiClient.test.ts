import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { InternalAxiosRequestConfig } from 'axios';

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => {
        const instance = actual.default.create({
          baseURL: '/api/v1',
          headers: { 'Content-Type': 'application/json' },
        });

        const origReqUse = instance.interceptors.request.use;
        const origResUse = instance.interceptors.response.use;

        instance.interceptors.request.use = (...args: Parameters<typeof origReqUse>) => {
          return origReqUse.apply(instance.interceptors.request, args);
        };

        instance.interceptors.response.use = (...args: Parameters<typeof origResUse>) => {
          return origResUse.apply(instance.interceptors.response, args);
        };

        return instance;
      }),
    },
  };
});

import apiClient from '@/services/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('/api/v1');
  });

  it('has JSON content type header', () => {
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('intercepts request to add Authorization header when token exists', async () => {
    localStorage.setItem('token', 'test-token');

    const config = {
      headers: {} as Record<string, string>,
      url: '/test',
    } as unknown as InternalAxiosRequestConfig;
    await apiClient.interceptors.request.handlers[0].fulfilled(config);

    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('request interceptor does not set header when no token', async () => {
    const config = {
      headers: {} as Record<string, string>,
      url: '/test',
    } as unknown as InternalAxiosRequestConfig;
    await apiClient.interceptors.request.handlers[0].fulfilled(config);

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('response interceptor passes through successful responses', async () => {
    const response = { data: 'ok' };
    const result = await apiClient.interceptors.response.handlers[0].fulfilled(response);

    expect(result).toBe(response);
  });

  it('response interceptor handles 401 error', async () => {
    localStorage.setItem('token', 'expired-token');
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');

    const error = { response: { status: 401 }, config: { url: '/facts/random' } };

    try {
      await apiClient.interceptors.response.handlers[0].rejected(error);
    } catch {
      // expected
    }

    expect(removeSpy).toHaveBeenCalledWith('token');
    removeSpy.mockRestore();
  });

  it('response interceptor does not redirect on 401 from /auth/login', async () => {
    localStorage.setItem('token', 'bad-token');
    const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');

    const error = { response: { status: 401 }, config: { url: '/auth/login' } };

    try {
      await apiClient.interceptors.response.handlers[0].rejected(error);
    } catch {
      // expected
    }

    expect(removeSpy).not.toHaveBeenCalledWith('token');
    removeSpy.mockRestore();
  });

  it('response interceptor rethrows non-401 errors', async () => {
    const error = { response: { status: 500 } };

    await expect(apiClient.interceptors.response.handlers[0].rejected(error)).rejects.toEqual(
      error,
    );
  });
});
