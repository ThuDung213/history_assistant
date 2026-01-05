// src/hooks/locations/useUpdateLocation.js
import { useState } from "react";
import { locationApi } from "../../api/locations/locationApi";

export function useUpdateLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateLocation = async (id, payload) => {
    setLoading(true);
    setError(null);
    try {
      return await locationApi.updateLocation(id, payload);
    } catch (err) {
      setError(err?.response?.data || err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateLocation, loading, error };
}
