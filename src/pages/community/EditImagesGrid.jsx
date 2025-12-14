import React from 'react';

export default function EditImagesGrid({ keptImages, newImages, onRemoveKept, onRemoveNew }) {
  const kept = Array.isArray(keptImages) ? keptImages : [];
  const added = Array.isArray(newImages) ? newImages : [];
  if (!kept.length && !added.length) return null;

  return (
    <div className="edit-images">
      {kept.map((img, idx) => (
        <div key={`${img.publicId || img.url || 'kept'}-${idx}`} className="edit-image-thumb">
          <img src={img.url} alt="" />
          <button
            type="button"
            className="edit-image-remove"
            onClick={() => onRemoveKept?.(idx)}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      ))}

      {added.map((it, idx) => (
        <div key={`${it.file?.name || 'file'}-${it.file?.size || 0}-${idx}`} className="edit-image-thumb">
          <img src={it.previewUrl} alt="" />
          <button
            type="button"
            className="edit-image-remove"
            onClick={() => onRemoveNew?.(idx)}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
