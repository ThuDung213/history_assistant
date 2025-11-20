import React from "react";
import "../styles/modal.css";

const PlaceModal = ({ open, place, onClose }) => {
    if (!open || !place) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">

                <button className="close-btn" onClick={onClose}>×</button>

                <h2>{place.title}</h2>
                <p style={{ marginTop: "10px" }}>{place.description}</p>

                <h3 style={{ marginTop: "20px" }}>Nguồn tham khảo</h3>
                <ul>
                    {place.references?.map((ref, index) => (
                        <li key={index}>
                            <a href={ref.url} target="_blank">{ref.title}</a>
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
};

export default PlaceModal;
