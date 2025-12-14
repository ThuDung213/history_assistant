import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({
  open,
  images,
  index,
  setIndex,
  onClose,
  onPrev,
  onNext,
}) {
  const safeImages = Array.isArray(images) ? images.filter((x) => x && x.url) : [];
  const safeIndex = Math.min(Math.max(0, index || 0), Math.max(0, safeImages.length - 1));

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft') onPrev?.();
      if (e.key === 'ArrowRight') onNext?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, safeImages.length]);

  if (!open) return null;
  if (!safeImages.length) return null;

  return (
    <div className="lightbox-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="lightbox-shell" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
          <X size={22} />
        </button>

        {safeImages.length > 1 && (
          <>
            <button type="button" className="lightbox-nav prev" onClick={onPrev} aria-label="Previous">
              <ChevronLeft size={28} />
            </button>
            <button type="button" className="lightbox-nav next" onClick={onNext} aria-label="Next">
              <ChevronRight size={28} />
            </button>
          </>
        )}

        <div className="lightbox-main">
          <img className="lightbox-image" src={safeImages[safeIndex]?.url} alt="" draggable={false} />
        </div>

        {safeImages.length > 1 && (
          <div className="lightbox-footer">
            <div className="lightbox-counter">
              {safeIndex + 1}/{safeImages.length}
            </div>
            <div className="lightbox-thumbs" role="list">
              {safeImages.map((img, idx) => (
                <button
                  key={`${img.publicId || img.url || 'lb'}-${idx}`}
                  type="button"
                  className={`lightbox-thumb ${idx === safeIndex ? 'active' : ''}`}
                  onClick={() => setIndex?.(idx)}
                  aria-label={`Image ${idx + 1}`}
                >
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
