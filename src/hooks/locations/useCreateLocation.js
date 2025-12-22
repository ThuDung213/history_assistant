import { useState } from "react";
import { createHistoricalLocation } from "../../api/locations/createLocationApi";

export function useCreateLocation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const submitLocation = async (payload) => {
        setLoading(true);
        setError(null);

        try {
            return await createHistoricalLocation(payload);
        } catch (err) {
            setError(err.detail || "Lỗi khi lưu dữ liệu");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        submitLocation,
        loading,
        error,
    };
}
