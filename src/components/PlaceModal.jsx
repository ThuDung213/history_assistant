import React from "react";
import "../styles/modal.css";
import HTMLFlipBook from "react-pageflip";
import { splitToPages } from "../utils/splitToPages";
import logo from "../assets/logo.png";
const PlaceModal = ({ open, location, onClose }) => {
  if (!open || !location) return null;
  const historyPages = splitToPages(location.history);
  return (
    <div key={location.id} className="modal-overlay">
      <button
        type="button"
        className="close-btn"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <HTMLFlipBook width={400} height={500} showCover>
        {/* Cover */}
        <div className="page">
          <div className="page-content cover">
            <img src={logo} alt="Logo" className="cover-logo" />
            <h1>{location.siteName}</h1>
            <p>{location.locationType}</p>
          </div>
        </div>

        {/* Info page */}
        <div className="page">
          <div className="page-content">
            <img
              src={
                location.thumbnailUrl ||
                "https://images2.thanhnien.vn/528068263637045248/2024/1/25/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912.jpg"
              }
              alt={location.siteName}
              className="info-thumb"
              onError={(e) => {
                const fallback =
                  "https://images2.thanhnien.vn/528068263637045248/2024/1/25/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912.jpg";
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallback;
              }}
            />
            <p>{location.shortDescription}</p>
          </div>
        </div>

        {/* History pages */}
        {historyPages.map((content, index) => (
          <div className="page" key={`history-${index}`}>
            <div className="page-content">
              {/* <h3>Lịch sử</h3> */}
              <p style={{ whiteSpace: "pre-wrap" }}>{content}</p>
            </div>
          </div>
        ))}
      </HTMLFlipBook>
    </div>
  );
};

export default PlaceModal;
