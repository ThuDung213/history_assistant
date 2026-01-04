import { useState } from "react";
import { deleteLocationById } from "../../api/locations/deleteLocationApi";

export function useDeleteLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteLocation = async (id) => {
    setLoading(true);
    setError(null);

    try {
      return await deleteLocationById(id);
    } catch (err) {
      setError(err.detail || "Lỗi khi xóa địa điểm");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteLocation,
    loading,
    error,
  };
}
