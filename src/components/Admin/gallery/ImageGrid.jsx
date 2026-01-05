import React from "react";

export default function ImageGrid({ images = [], openModal, onDelete }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {images.map((img, idx) => {
        const key = img.publicId || img.url || `${idx}`;
        return (
          <div
            key={key}
            className="relative rounded overflow-hidden bg-gray-50 group"
          >
            <img
              src={img.url}
              alt={img.caption || img.publicId || `img-${idx}`}
              className="w-full h-28 object-cover cursor-pointer"
              onClick={() => openModal(img)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => onDelete(img.publicId || img.url)}
                className="bg-red-500 text-white rounded-full p-1"
                aria-label="Xóa ảnh"
              >
                X
              </button>
            </div>
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                {img.caption}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
