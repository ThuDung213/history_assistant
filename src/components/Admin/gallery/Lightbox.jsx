import React from "react";

export default function Lightbox({ open, image, onClose }) {
  if (!open || !image) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-3 flex items-center justify-between border-b">
          <div className="text-sm text-gray-700">{image.caption || "Ảnh"}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(image.url);
                alert("Copied URL");
              }}
              className="text-sm text-gray-600"
            >
              Sao chép URL
            </button>
            <button onClick={onClose} className="text-sm text-red-600">
              Đóng
            </button>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center">
          <img
            src={image.url}
            alt={image.caption || "img"}
            className="max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
