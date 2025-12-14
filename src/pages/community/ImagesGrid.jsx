import React from 'react';

const VARIANTS = {
  post: {
    gridClass: 'post-images',
    gridSingleClass: 'single',
    tileClass: 'post-image-tile',
    imageClass: 'post-image',
    moreClass: 'post-image-more',
    maxPreview: 2,
    singleUsesClass: true,
  },
  comment: {
    gridClass: 'comment-images',
    tileClass: 'comment-image-tile',
    imageClass: 'comment-image',
    moreClass: 'comment-image-more',
    maxPreview: 2,
    singleUsesClass: false,
  },
};

export default function ImagesGrid({ images, variant = 'post', onOpen }) {
  const cfg = VARIANTS[variant] || VARIANTS.post;
  const safeImages = Array.isArray(images) ? images.filter((x) => x && x.url) : [];
  if (!safeImages.length) return null;

  const preview = safeImages.slice(0, cfg.maxPreview);
  const remaining = Math.max(0, safeImages.length - preview.length);
  const single = preview.length === 1;

  return (
    <div className={`${cfg.gridClass}${cfg.singleUsesClass && single ? ` ${cfg.gridSingleClass}` : ''}`}>
      {preview.map((img, idx) => {
        const isLast = idx === preview.length - 1;
        const showMore = isLast && remaining > 0;
        return (
          <button
            key={`${img.publicId || img.url || 'img'}-${idx}`}
            type="button"
            className={cfg.tileClass}
            onClick={() => onOpen?.(safeImages, idx)}
            aria-label="View image"
          >
            <img src={img.url} alt="" className={cfg.imageClass} loading="lazy" />
            {showMore && <div className={cfg.moreClass}>+{remaining}</div>}
          </button>
        );
      })}
    </div>
  );
}
