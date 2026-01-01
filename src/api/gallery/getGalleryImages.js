const API_URL = import.meta.env.VITE_API_URL;

/**
 * @returns {Promise<import("../../types/galleryImage").Gallery[]>}
 */
export const getGalleryImages = async () => {
  try {
    // Gallery should be viewable by users.
    // If backend requires auth, we attach whatever token is available.
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('ha_token') ||
      localStorage.getItem('admin_token');

    const res = await fetch(`${API_URL}/gallery`, {
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
    // Normalize to Error for callers (useGallery expects err.message)
    const message =
      typeof error?.message === 'string' && error.message
        ? error.message
        : 'Cannot get gallery image';
    throw new Error(message);
  }
};
