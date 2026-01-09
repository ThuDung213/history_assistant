import React, { forwardRef } from "react";

// Cấu trúc trang chuẩn với forwardRef cho tất cả các trang của FlipBook
const BookPage = forwardRef(({ children, className = "" }, ref) => (
  <div className={`page ${className}`} ref={ref}>
    <div className="page-content">{children}</div>
  </div>
));

BookPage.displayName = "BookPage";

export default BookPage;
