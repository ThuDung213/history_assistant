import React from "react";
import BookPage from "./BookPage";

/**
 * Kiểm tra nội dung HTML có thực sự có chữ không
 */
export const hasContent = (html) => {
  if (!html) return false;
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length > 0;
};

/**
 * Hàm tự động tách trang cho nội dung dài
 * @param {string} html - Nội dung HTML cần tách
 * @param {string} title - Tiêu đề của mục
 * @param {string} baseKey - Key base cho các trang
 * @returns {Array} Mảng các component BookPage
 */
export const renderContentPages = (html, title, baseKey) => {
  if (!hasContent(html)) return [];

  // Tách content theo nhiều loại tag block để linh hoạt hơn
  const blocks = html
    .split(/(<\/p>|<\/li>|<\/div>|<br\s*\/?>)/gi)
    .filter((b) => b.trim() !== "");

  const results = [];
  let currentChunk = "";
  let pageNum = 1;
  const maxCharsPerPage = 550;

  // Helper để push trang
  const pushPage = (content) => {
    let processed = content;
    // Đóng các tag mở dở dang
    if (content.includes("<ul") && !content.includes("</ul>"))
      processed += "</ul>";
    if (content.includes("<ol") && !processed.includes("</ol>"))
      processed += "</ol>";

    results.push(
      <BookPage key={`${baseKey}-${pageNum}`}>
        <div className="prose">
          <h3>
            {title} {pageNum > 1 ? "(tiếp)" : ""}
          </h3>
          <div dangerouslySetInnerHTML={{ __html: processed }} />
        </div>
      </BookPage>
    );
    pageNum++;
  };

  blocks.forEach((block) => {
    // Nếu bản thân block này đã quá dài (ví dụ 1 paragraph cực dài)
    if (block.length > maxCharsPerPage && currentChunk === "") {
      // Tách nhỏ block này theo dấu chấm câu hoặc khoảng trắng
      let subBlocks = block.split(/(\. |\? |\! )/);
      let subChunk = "";

      subBlocks.forEach((sb) => {
        if (subChunk.length + sb.length > maxCharsPerPage) {
          pushPage(subChunk);
          subChunk = sb;
        } else {
          subChunk += sb;
        }
      });
      currentChunk = subChunk;
    }
    // Nếu tổng chunk hiện tại + block mới vượt ngưỡng
    else if (
      currentChunk.length + block.length > maxCharsPerPage &&
      currentChunk !== ""
    ) {
      pushPage(currentChunk);

      // Setup chunk mới, kế thừa tag list nếu cần
      const wasInUl =
        currentChunk.includes("<ul") && !currentChunk.includes("</ul>");
      const wasInOl =
        currentChunk.includes("<ol") && !currentChunk.includes("</ol>");

      currentChunk = block;
      if (wasInUl && !block.includes("<ul"))
        currentChunk = "<ul>" + currentChunk;
      if (wasInOl && !block.includes("<ol"))
        currentChunk = "<ol>" + currentChunk;
    } else {
      currentChunk += block;
    }
  });

  if (currentChunk) {
    pushPage(currentChunk);
  }

  return results;
};
