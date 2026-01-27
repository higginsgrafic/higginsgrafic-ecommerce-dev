import { useState, useCallback, useEffect } from 'react';

/**
 * Hook personalitzat per gestionar peticions API
 * Proporciona loading state, error handling i retry logic
 */
export const useAPI = (apiFunction, { immediate = false, onSuccess, onError } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(...args);
      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      setError(err);

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook per fer múltiples peticions en paral·lel
 */
export const useParallelAPI = (apiFunctions) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const execute = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      const results = await Promise.allSettled(
        apiFunctions.map(fn => fn())
      );

      const successfulData = [];
      const failedErrors = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulData.push(result.value);
        } else {
          failedErrors.push({
            index,
            error: result.reason
          });
        }
      });

      setData(successfulData);
      setErrors(failedErrors);

      return successfulData;
    } finally {
      setLoading(false);
    }
  }, [apiFunctions]);

  return {
    data,
    loading,
    errors,
    execute
  };
};

/**
 * Hook per paginació
 */
export const usePagination = (apiFunction, { pageSize = 20 } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction({ page, pageSize });

      setData(prev => [...prev, ...result]);
      setPage(prev => prev + 1);

      if (result.length < pageSize) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, page, pageSize, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
};

/**
 * Hook per debounce de peticions API
 */
export const useDebouncedAPI = (apiFunction, delay = 500) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback((...args) => {
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const result = await apiFunction(...args);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [apiFunction, delay]);

  return {
    data,
    loading,
    error,
    execute
  };
};

/**
 * Hook per polling (peticions periòdiques)
 */
export const usePolling = (apiFunction, { interval = 5000, enabled = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await apiFunction();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // Primera crida immediata
    fetchData();

    // Polling
    const timer = setInterval(fetchData, interval);

    return () => clearInterval(timer);
  }, [apiFunction, interval, enabled]);

  return {
    data,
    loading,
    error
  };
};

export default useAPI;
