import { getCookie, removeCookie } from '../helpers/cookieHelper';

/**
 * PATRÓN IMPLEMENTADO: Interceptor / Wrapper (Envoltorio sobre Fetch)
 * PATRÓN IMPLEMENTADO: Global Exception Handling (Manejo Global de Errores)
 * 
 * Centraliza las responsabilidades transversales (cross-cutting concerns) como:
 * 1. Inyección automática del Token JWT en las cabeceras.
 * 2. Intercepción global de errores HTTP (401, 403, 400, 500).
 * 3. Parseo automático de mensajes de error JSON del backend.
 * Esto evita la duplicación de código en todos los servicios de la aplicación.
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
            window.localStorage.removeItem('jwt');
            window.localStorage.removeItem('refreshToken');
            window.localStorage.removeItem('username');
            window.localStorage.removeItem('nombreCompleto');
            window.localStorage.removeItem('nombreSocio');
            window.localStorage.removeItem('nombreRol');
            window.localStorage.removeItem('logoSocio');
            window.localStorage.removeItem('idsocio');
            window.localStorage.removeItem('idRol');
            window.localStorage.removeItem('idUser');
            window.localStorage.removeItem('codRol');
            window.localStorage.removeItem('idConsultor');
            window.localStorage.removeItem('notificacionTicket');
            window.location.href = '/Login';
            throw new Error('Sesión expirada o no autorizada');
        }

        // Handle 403 Forbidden globally
        if (response.status === 403) {
            throw new Error('No tienes permisos para realizar esta acción');
        }

        // Handle 429 Too Many Requests globally
        if (response.status === 429) {
            throw new Error('Demasiados intentos. Por favor, espere un momento e intente de nuevo.');
        }

        // Handle other HTTP errors globally (400, 404, 409, 500, etc.)
        if (!response.ok) {
            let errorMsg = "Ocurrió un error al comunicarse con el servidor";
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg = errorData.message;
                else if (errorData.errors) errorMsg = Object.values(errorData.errors)[0][0];
            } catch (e) {
                // Fallback si no es JSON válido
            }
            throw new Error(errorMsg);
        }

        return response;
    } catch (error) {
        throw error;
    }
};

export default apiFetch;
