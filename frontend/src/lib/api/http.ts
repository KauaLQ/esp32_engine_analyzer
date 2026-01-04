import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/tokenStorage';
import type { RefreshTokenRequest, RefreshTokenResponse } from '../../types/auth';

import axios, { AxiosHeaders } from 'axios';
import type {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rotorial-backend.onrender.com';

const http: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

const setAuthHeader = (config: InternalAxiosRequestConfig, token: string) => {
    // ✅ garante headers sempre definido (Axios v1)
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
};

// ✅ helper: identifica refresh pra não entrar em loop
const isRefreshEndpoint = (url?: string) =>
    /(^|\/)auth\/refresh(\b|\/)/i.test(url ?? '');

/**
 * REQUEST: injeta token EM QUALQUER endpoint,
 * desde que token exista e não seja nulo.
 */
http.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();

        // ✅ injeta em qualquer request se houver token válido (não nulo/vazio)
        if (typeof token === 'string' && token.trim().length > 0) {
            setAuthHeader(config, token);
        }

        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newToken: string) => {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
};

const refreshAuthToken = async (): Promise<string> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    // ✅ usa axios "cru" pra evitar interceptors do http e loops
    const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken } as RefreshTokenRequest,
        { headers: { 'Content-Type': 'application/json' } },
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setTokens({ accessToken, refreshToken: newRefreshToken });

    return accessToken;
};

/**
 * RESPONSE: se 401, tenta refresh (se tiver refreshToken) e repete request.
 * - Não tenta refresh se a request original já era /auth/refresh (evita loop)
 * - Não tenta de novo se _retry já foi marcado
 */
http.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest =
            error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // ✅ evita loop infinito se o refresh falhar com 401
        if (isRefreshEndpoint(originalRequest.url)) {
            clearTokens();
            return Promise.reject(error);
        }

        // ✅ evita loop
        if (originalRequest._retry) return Promise.reject(error);
        originalRequest._retry = true;

        // ✅ se não tem refresh token, limpa e devolve erro
        if (!getRefreshToken()) {
            clearTokens();
            return Promise.reject(error);
        }

        // ✅ se já está refreshando, espera o token novo
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh((token) => {
                    try {
                        setAuthHeader(originalRequest, token);
                        resolve(http.request(originalRequest));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshAuthToken();

            // ✅ repete a request original com token novo
            setAuthHeader(originalRequest, newToken);

            onTokenRefreshed(newToken);

            return http.request(originalRequest);
        } catch (refreshError) {
            clearTokens();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default http;
