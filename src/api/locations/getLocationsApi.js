const API_URL = import.meta.env.VITE_API_URL;

/**
 * Public locations list for user-facing Map.
 * Expected BE: GET /locations (should not require admin auth)
 *
 * @returns {Promise<import("../../types/location").HistoricalSite[]>}
 */
export const getLocationsList = async () => {
    try {
        const token =
            localStorage.getItem('token') ||
            localStorage.getItem('access_token') ||
            localStorage.getItem('ha_token') ||
            null;

        const res = await fetch(`${API_URL}/locations`, {
            headers: token
                ? {
                        Authorization: `Bearer ${token}`,
                    }
                : undefined,
        });

        if (!res.ok) {
            let detail = res.statusText || 'Failed to fetch';
            try {
                const data = await res.json();
                if (data?.detail) detail = data.detail;
            } catch {
                // ignore
            }
            throw new Error(detail);
        }

        return await res.json();
    } catch (error) {
        const message =
            typeof error?.message === 'string' && error.message
                ? error.message
                : 'Cannot get locations';
        throw new Error(message);
    }
};
