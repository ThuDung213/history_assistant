/**
 * @typedef {Object} GalleryImage
 * @property {string} url                - Cloudinary secure URL
 * @property {string=} caption           - Mô tả ảnh (bổ sung sau)
 * @property {number=} year              - Năm (phục vụ UI khi flatten images)
 * @property {string=} location          - Địa điểm liên quan
 * @property {boolean=} verified         - Đã xác minh nguồn hay chưa
 */

/**
 * @typedef {Object} Gallery
 * @property {number} year
 * @property {GalleryImage[]} images
 */
export {};
