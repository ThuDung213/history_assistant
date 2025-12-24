export function splitToPages(text = "", maxChars = 700) {
  if (!text) return [];

  const paragraphs = text.split(/\n+/);
  const pages = [];

  let currentPage = "";

  for (const p of paragraphs) {
    if ((currentPage + p).length > maxChars) {
      pages.push(currentPage);
      currentPage = p;
    } else {
      currentPage += (currentPage ? "\n\n" : "") + p;
    }
  }

  if (currentPage) pages.push(currentPage);

  return pages;
}
