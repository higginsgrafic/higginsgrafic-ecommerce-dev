/**
 * Client HTTP per fer peticions a l'API
 * Implementa retry logic, error handling i interceptors
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const DEFAULT_TIMEOUT = 10000; // 10 segons
const MAX_RETRIES = 3;

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Funció per fer timeout a una petició
 */
const fetchWithTimeout = (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

/**
 * Funció per fer retry amb backoff exponencial
 */
const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Si la resposta és OK, retornar-la
      if (response.ok) {
        return response;
      }

      // Si és un error del client (4xx), no fer retry
      if (response.status >= 400 && response.status < 500) {
        throw response;
      }

      // Si és l'últim intent, llançar error
      if (i === retries - 1) {
        throw response;
      }

      // Backoff exponencial: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error) {
      // Si és l'últim intent, llançar error
      if (i === retries - 1) {
        throw error;
      }

      // Si és un error de xarxa, fer retry
      if (error instanceof TypeError || error.message === 'Request timeout') {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Si és un altre tipus d'error, llançar-lo
        throw error;
      }
    }
  }
};

/**
 * Client HTTP principal
 */
class HTTPClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
    this.interceptors = {
      request: [],
      response: []
    };
  }

  /**
   * Afegir interceptor de petició
   */
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  /**
   * Afegir interceptor de resposta
   */
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  /**
   * Aplicar interceptors de petició
   */
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config };
    for (const interceptor of this.interceptors.request) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    return modifiedConfig;
  }

  /**
   * Aplicar interceptors de resposta
   */
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;
    for (const interceptor of this.interceptors.response) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    return modifiedResponse;
  }

  /**
   * Mètode principal per fer peticions
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    let config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    };

    // Aplicar interceptors de petició
    config = await this.applyRequestInterceptors(config);

    try {
      const response = await fetchWithRetry(url, config);

      // Aplicar interceptors de resposta
      const modifiedResponse = await this.applyResponseInterceptors(response);

      // Parsejar JSON
      const data = await modifiedResponse.json().catch(() => null);

      if (!modifiedResponse.ok) {
        throw new APIError(
          data?.message || 'Error en la petició',
          modifiedResponse.status,
          data
        );
      }

      return data;

    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Response) {
        const data = await error.json().catch(() => null);
        throw new APIError(
          data?.message || 'Error en la petició',
          error.status,
          data
        );
      }

      // Errors de xarxa o altres
      throw new APIError(
        error.message || 'Error de connexió',
        0,
        null
      );
    }
  }

  /**
   * Mètodes HTTP
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Instància global del client
const apiClient = new HTTPClient();

// Interceptor per afegir token d'autenticació (si existeix)
apiClient.addRequestInterceptor(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
});

// Interceptor per gestionar errors d'autenticació
apiClient.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    // Token expirat o invàlid
    localStorage.removeItem('authToken');
    // Redirigir a login (opcional)
    // window.location.href = '/login';
  }
  return response;
});

export { HTTPClient, APIError };
export default apiClient;
