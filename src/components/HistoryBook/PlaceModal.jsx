import React from "react";
import HTMLFlipBook from "react-pageflip";
import "../../styles/modal.css"; // Moved up one more level
import logo from "../../assets/logo.png";
import useWindowSize from "../../hooks/useWindowSize";
import BookPage from "./BookPage";
import { renderContentPages } from "./paginationUtils";

const PlaceModal = ({ open, location, onClose }) => {
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  if (!open || !location) return null;

  const isMobile = windowWidth < 768;

  // Calculate book dimensions
  let finalWidth, finalHeight;
  if (isMobile) {
    finalWidth = windowWidth * 0.85;
    finalHeight = Math.min(finalWidth * (450 / 350), windowHeight * 0.75);
  } else {
    const bookWidth = Math.min(windowWidth * 0.7, 1200);
    const pageHeight = (bookWidth / 2) * (450 / 350);
    finalHeight = Math.min(pageHeight, windowHeight * 0.85);
    finalWidth = finalHeight * (350 / 450) * 2;
  }

  const {
    siteName,
    locationType,
    thumbnailUrl,
    shortDescription,
    history,
    keyEvents,
    architecture,
    significance,
    additionalContent,
    images,
  } = location;

  const normalizeText = (value) =>
    typeof value === "string" ? value.normalize("NFC") : value;

  const fallbackImg =
    "https://images2.thanhnien.vn/528068263637045248/2024/1/25/e093e9cfc9027d6a142358d24d2ee350-65a11ac2af785880-17061562929701875684912.jpg";

  const pages = [];

  // 1. Front Cover (Outside)
  pages.push(
    <BookPage key="cover" className="cover cover-outside cover-front">
      <div className="cover-border">
        <div className="cover-inner">
          <img src={logo} alt="Logo" className="cover-logo" />
          <div className="cover-title-wrap">
            <h1 className="cover-title">{normalizeText(siteName)}</h1>
            <div className="cover-divider"></div>
            <p className="cover-subtitle">{normalizeText(locationType)}</p>
          </div>
          <div className="cover-seal">HISTORICAL RECORD</div>
        </div>
      </div>
    </BookPage>
  );

  // 2. Front Cover (Inside) - Parchment color
  pages.push(
    <BookPage key="inner-front" className="cover cover-inside"></BookPage>
  );

  // 3. Main Info Page
  pages.push(
    <BookPage key="info">
      <img
        src={thumbnailUrl || fallbackImg}
        alt={siteName}
        className="info-thumb"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = fallbackImg;
        }}
      />
      <p className="prose italic">{normalizeText(shortDescription)}</p>
    </BookPage>
  );

  // 4. Dynamic Content Pages
  pages.push(...renderContentPages(history, "Lịch sử", "history"));
  pages.push(...renderContentPages(keyEvents, "Sự kiện nổi bật", "keyEvents"));
  pages.push(
    ...renderContentPages(architecture, "Kiến trúc – Đặc điểm", "architecture")
  );
  pages.push(
    ...renderContentPages(significance, "Ý nghĩa lịch sử", "significance")
  );
  pages.push(
    ...renderContentPages(additionalContent, "Thông tin thêm", "additional")
  );

  // 5. Gallery Pages
  if (images && images.length > 0) {
    const imagesPerPage = 4;
    for (let i = 0; i < images.length; i += imagesPerPage) {
      const currentImages = images.slice(i, i + imagesPerPage);
      pages.push(
        <BookPage key={`gallery-${i}`}>
          <div className="prose">
            <h3>Thư viện ảnh {i > 0 ? "(tiếp)" : ""}</h3>
            <div className="gallery-grid">
              {currentImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`${siteName}-${idx}`}
                  className="gallery-image"
                />
              ))}
            </div>
          </div>
        </BookPage>
      );
    }
  }

  // 6. Back Cover (Inside) - Parchment color
  pages.push(
    <BookPage key="inner-back" className="cover cover-inside"></BookPage>
  );

  // 7. Back Cover (Outside) - Blank Leather
  pages.push(
    <BookPage key="back-cover" className="cover cover-outside"></BookPage>
  );

  return (
    <div
      key={location.id}
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-[99999] p-5 animate-in fade-in duration-300"
    >
      <div className="relative flex justify-center items-center overflow-visible">
        {/* Close button positioned relative to the book container */}
        <button
          type="button"
          className="absolute md:-top-12 md:-right-12 w-10 h-10 md:w-12 md:h-12 
                     bg-[#5d4037] border-2 rounded-full 
                     flex items-center justify-center text-[#eabc6b] text-2xl md:text-3xl
                        transition-all duration-300
                     z-[100001] shadow-2xl cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <HTMLFlipBook
          key={`${finalWidth}-${finalHeight}-${isMobile}`}
          width={isMobile ? finalWidth : finalWidth / 2}
          height={finalHeight}
          size="fixed"
          drawShadow={true}
          flippingTime={1000}
          useMouseEvents={true}
          showPageCorners={true}
          showCover={true}
          mobileScrollSupport={true}
          usePortrait={isMobile}
          startPortrait={isMobile}
          className="history-book"
        >
          {pages}
        </HTMLFlipBook>
      </div>
    </div>
  );
};

export default PlaceModal;
