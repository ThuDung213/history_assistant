/**
 * Convert location documents (from MongoDB/API) to GeoJSON FeatureCollection
 * Mapbox expects coordinates in [lng, lat] order.
 */
export function locationsToGeoJSON(locations = []) {
  return {
    type: "FeatureCollection",
    features: locations
      .filter((loc) => loc && loc.longitude != null && loc.latitude != null)
      .map((loc) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [Number(loc.longitude), Number(loc.latitude)],
        },
        properties: {
          id: loc.id,
          title: loc.siteName ?? "",
          description: loc.shortDescription ?? "",
          locationType: loc.locationType ?? "",
          thumbnailUrl: loc.thumbnailUrl ?? "",
        },
      })),
  };
}
