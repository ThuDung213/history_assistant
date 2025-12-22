import { useEffect, useState } from "react";
import { getLocationsList } from "../../api/locations/getLocationsApi";


/**
 * @returns {{ locations: import("../../types/location").HistoricalSite[], loading: boolean }}
 */
export const useLocations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getLocationsList()
            .then(setLocations)
            .finally(() => setLoading(false));
    }, []);

    return { locations, loading };
};
