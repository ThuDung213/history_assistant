import { useEffect, useState } from "react";
import { getAdminLocationsList } from "../../api/locations/getAdminLocationsApi";

/**
 * @returns {{ locations: import("../../types/location").HistoricalSite[], loading: boolean, error: string | null }}
 */
export const useAdminLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminLocationsList()
      .then(setLocations)
      .catch((err) => {
        setError(err?.detail || err?.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  return { locations, loading, error };
};
