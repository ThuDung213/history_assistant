import { useEffect, useState } from "react";
import { getLocationById } from "../../api/locations/getLocationByIdApi";

/**
 * Hook to fetch a single location by id
 * @param {string} id
 * @returns {{ location: import("../../types/location").HistoricalSite | null, loading: boolean, error: any, reload: Function }}
 */
export function useLocationById(id) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLocation(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    getLocationById(id)
      .then((data) => {
        if (mounted) setLocation(data);
      })
      .catch((err) => {
        if (mounted) setError(err.detail || err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLocationById(id);
      setLocation(data);
      return data;
    } catch (err) {
      setError(err.detail || err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { location, loading, error, reload };
}
