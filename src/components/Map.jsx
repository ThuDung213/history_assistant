import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "../styles/map.css";

import PlaceModal from "./PlaceModal";
import { locationsToGeoJSON } from "../utils/src/utils/locationsToGeoJSON";

const INITIAL_CENTER = [108.21168309278522, 16.060197215687733];
const INITIAL_ZOOM = 11;

const DanangMap = ({ locations }) => {
  // modal state
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const mapRef = useRef();
  const mapContainerRef = useRef();

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  const handleButtonClick = () => {
    mapRef.current.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });
  };

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/junjun21/cmhkpf4ef000w01pja1n4e7h3",
      center: center,
      zoom: zoom,
    });

    mapRef.current = map;
    // khi di duyển map
    mapRef.current.on("move", () => {
      // get the current center coordinates and zoom level from the map
      const mapCenter = mapRef.current.getCenter();
      const mapZoom = mapRef.current.getZoom();

      // update state
      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(mapZoom);
    });
    // Load map
    mapRef.current.on("load", () => {
      // Load icon marker
      mapRef.current.loadImage(
        "/textures/vietnam-size48.png",
        (error, image) => {
          if (error) throw error;
          if (!mapRef.current.hasImage("custom-marker")) {
            mapRef.current.addImage("custom-marker", image);
          }

          // Thêm source GeoJSON
          mapRef.current.addSource("danang-places", {
            type: "geojson",
            data: locationsToGeoJSON(locations),
          });

          // Thêm layer để hiển thị icon + label
          mapRef.current.addLayer({
            id: "danang-places-layer",
            type: "symbol",
            source: "danang-places",
            layout: {
              "icon-image": "custom-marker",
              "icon-size": 0.6,
              "icon-anchor": "bottom",
              "text-field": ["get", "title"],
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 0.5],
              "text-anchor": "top",
            },
            paint: {
              "text-color": "#c20000",
            },
          });

          // Xử lý sự kiện click vào marker
          mapRef.current.on("click", "danang-places-layer", async (e) => {
            const feature = e.features[0];
            const placeId = feature?.properties?.id; // Lấy ID từ GeoJSON

            // Fetch dữ liệu từ backend
            const placeData = locations.find((p) => p.id === placeId);
            console.log(placeData);
            // Lưu vào state
            setSelectedPlace(placeData);
            setModalOpen(true);
          });
        }
      );
    });

    return () => {
      mapRef.current.remove();
    };
  }, []);

  return (
    <>
      <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} |
        Zoom: {zoom.toFixed(2)}
      </div>
      <button className="reset-button" onClick={handleButtonClick}>
        Reset
      </button>
      <div id="map-container" ref={mapContainerRef} />

      {modalOpen && selectedPlace && (
        <PlaceModal
          open={modalOpen}
          location={selectedPlace}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default DanangMap;
