import { getCookie, removeCookie } from '../helpers/cookieHelper';

/**
 * Centralized fetch wrapper to inject JWT token in Authorization headers
 * and handle 401 Unauthorized status globally.
 */
export const apiFetch = async (url, options = {}) => {
    const jwt = getCookie('jwt');

    // Prepare headers
    const headers = {
        ...(options.headers || {}),
    };

    // Attach Authorization header if token exists and not already set
    if (jwt && !headers['Authorization'] && !headers['authorization']) {
        headers['Authorization'] = `Bearer ${jwt}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized globally
        if (response.status === 401) {
            removeCookie('jwt');
            removeCookie('refreshToken');
            window.location.reload();
            throw new Error('Sesión expirada o no autorizada');
        }

        return response;
    } catch (error) {
        throw error;
    }
};

export default apiFetch;
