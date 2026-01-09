import React, { useEffect, useRef, useState } from "react";
import "../styles/gallery.css";
const RADIUS = 720;
const SLICE_COUNT = 12;
const ITEM_SHIFT = 80;

/**
 * @param {{
 *   images: { url: string, caption?: string, year?: number }[]
 * }} props
 */
const DanangGallery = ({ images }) => {
  const el = useRef(null);
  const animId = useRef(0);
  const img = useRef(null);
  const [selected, setSelected] = useState(null);

  // mutable variables used inside effect
  let angleUnit, sliceIndex, currentAngle, currentY, mouseX, mouseY;

  useEffect(() => {
    angleUnit = 360 / SLICE_COUNT;
    sliceIndex = 0;
    mouseX = mouseY = 0;
    currentAngle = 0;
    currentY = 800;

    const galleryEl = el.current;
    if (!galleryEl) return;

    const items = galleryEl.children;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemAngle = angleUnit * sliceIndex;
      const itemAngleRad = (itemAngle * Math.PI) / 180;
      const xpos = Math.sin(itemAngleRad) * RADIUS;
      const zpos = Math.cos(itemAngleRad) * RADIUS;
      const row = Math.floor(i / SLICE_COUNT);
      item.style.transform = `translateX(${xpos}px) translateZ(${zpos}px) translateY(${
        -i * ITEM_SHIFT
      }px) rotateY(${itemAngle}deg)`;
      if (++sliceIndex === SLICE_COUNT) sliceIndex = 0;
    }

    const onMouseMove = (e) => {
      mouseX = -(e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 20;
    };
    document.body.addEventListener("mousemove", onMouseMove);

    cancelAnimationFrame(animId.current);
    const updateFrame = () => {
      currentAngle += mouseX;
      currentY += mouseY;
      galleryEl.style.transform = `translateZ(-1500px) translateY(${currentY}px) rotateY(${currentAngle}deg)`;
      animId.current = requestAnimationFrame(updateFrame);
    };
    updateFrame();

    return () => {
      cancelAnimationFrame(animId.current);
      document.body.removeEventListener("mousemove", onMouseMove);
    };
  }, [images]);

  const pickImage = (imgUrl) => {
    if (!img.current) return;
    img.current.style.backgroundImage = `url(${imgUrl})`;
    img.current.style.transform = "scale(1, 1)";
  };

  const pickImageItem = (imgItem) => {
    if (!imgItem?.url) return;
    setSelected({
      url: imgItem.url,
      caption: imgItem.caption,
      year: imgItem.year,
    });
    pickImage(imgItem.url);
  };

  const closeViewer = () => {
    if (img.current) img.current.style.transform = "scale(0, 0)";
    setSelected(null);
  };

  const captionLine =
    selected?.caption && selected?.year
      ? `${selected.caption} – ${selected.year}`
      : selected?.caption || (selected?.year ? String(selected.year) : "");

  return (
    <div className="gallery-container my-4">
      <div className="spiral-gallery" ref={el}>
        {images &&
          images.map((imgItem, index) => (
            <div
              onClick={() => pickImageItem(imgItem)}
              key={index}
              style={{ backgroundImage: `url(${imgItem.url})` }}
              className="spiral-gallery-item"
            />
          ))}
      </div>

      <div className={`image-viewer ${selected ? "is-open" : ""}`}>
        <div onClick={closeViewer} className="image-display" ref={img} />

        {selected && (selected.caption || selected.year) ? (
          <div className="image-caption" onClick={closeViewer}>
            <div className="image-caption__text">{captionLine}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DanangGallery;
