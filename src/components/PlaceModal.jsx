import React from "react";
import "../styles/modal.css";
import HTMLFlipBook from "react-pageflip";

const PlaceModal = ({ open, location, onClose }) => {
  if (!open || !location) return null;

  return (
    <div key={location.id} className="modal-overlay">
      <HTMLFlipBook width={400} height={500} showCover={true}>
        <div className="page" style={{ background: "transparent" }}>
          <div className="page-content cover">Lịch sử</div>
        </div>

        <div className="page" key={location.id}>
          <div className="page-content">
            <div className="place-container">
              <img
                src={
                  "https://static.vecteezy.com/system/resources/thumbnails/060/843/811/small/close-up-of-raindrops-on-leaves-hd-background-luxury-hd-wallpaper-image-trendy-background-illustration-free-photo.jpg"
                }
                alt={location.siteName}
              />
              <div className="pokemon-info">
                <h2 className="pokemon-name">{location.architecture}</h2>
                {/* <p className="pokemon-number">#{pokemon.id}</p> */}
                <div>
                  <span
                    key={location.locationType}
                    // className={`pokemon-type type-${type.toLowerCase()}`}
                  >
                    {location.locationType}
                  </span>
                </div>
                <p className="place-description">{location.shortDescription}</p>
              </div>
            </div>
          </div>
        </div>

        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
      </HTMLFlipBook>
    </div>
  );
};

export default PlaceModal;
