import { useState, useEffect, useCallback } from 'react';
import { syncGelatoCatalog, createGelatoOrder, getGelatoOrderStatus } from '@/api/gelato';
import { useAPI } from './useAPI';

/**
 * Hook per gestionar productes de Gelato
 */
export const useGelatoProducts = () => {
  const {
    data: products,
    loading,
    error,
    execute: sync
  } = useAPI(syncGelatoCatalog);

  return {
    products: products || [],
    loading,
    error,
    sync
  };
};

/**
 * Hook per crear comandes a Gelato
 */
export const useGelatoOrder = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await createGelatoOrder(orderData);
      setOrder(response);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    order,
    loading,
    error,
    createOrder
  };
};

/**
 * Hook per fer seguiment d'una comanda de Gelato
 */
export const useGelatoTracking = (gelatoOrderId, { polling = false, interval = 30000 } = {}) => {
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = useCallback(async () => {
    if (!gelatoOrderId) return;

    setLoading(true);
    setError(null);

    try {
      const info = await getGelatoOrderStatus(gelatoOrderId);
      setTrackingInfo(info);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [gelatoOrderId]);

  useEffect(() => {
    if (!gelatoOrderId) return;

    // Fetch inicial
    fetchTracking();

    // Polling si està activat
    if (polling) {
      const timer = setInterval(fetchTracking, interval);
      return () => clearInterval(timer);
    }
  }, [gelatoOrderId, polling, interval, fetchTracking]);

  return {
    trackingInfo,
    loading,
    error,
    refresh: fetchTracking
  };
};

/**
 * Hook per estimar cost d'enviament
 */
export const useShippingEstimate = () => {
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateShipping = useCallback(async (shippingData) => {
    setLoading(true);
    setError(null);

    try {
      // Simulació (en producció cridaríem Gelato API)
      const mockEstimate = {
        cost: shippingData.total >= 50 ? 0 : 5.95,
        currency: 'EUR',
        estimatedDays: 3-5,
        method: 'Standard'
      };

      setEstimate(mockEstimate);
      return mockEstimate;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    estimate,
    loading,
    error,
    calculateShipping
  };
};

export default {
  useGelatoProducts,
  useGelatoOrder,
  useGelatoTracking,
  useShippingEstimate
};
