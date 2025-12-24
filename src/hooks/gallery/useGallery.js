import { useEffect, useState } from "react";
import { getGalleryImages } from "../../api/gallery/getGalleryImages";

/**
 * Lấy toàn bộ gallery theo năm
 *
 * @returns {{
 *   galleries: import("../../types/galleryImage").Gallery[],
 *   loading: boolean,
 *   error: string | null
 * }}
 */
export const useGallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getGalleryImages()
      .then(setGalleries)
      .catch((err) => {
        console.error(err);
        setError(err.message || "Unknown error");
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    galleries,
    loading,
    error,
  };
};
