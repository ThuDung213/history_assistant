import React, { useEffect, useState, useRef } from "react";

import { galleryApi } from "../../../api/gallery/galleryApi";
import { isAdminLoggedIn } from "../../../hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";
import GalleryUpload from "../../../components/Admin/gallery/GalleryUpload";
import ImageGrid from "../../../components/Admin/gallery/ImageGrid";
import TableEditor from "../../../components/Admin/gallery/TableEditor";
import Lightbox from "../../../components/Admin/gallery/Lightbox";
import AddImageModal from "../../../components/Admin/gallery/AddImageModal";

export default function GalleryManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState([]); // flat list of { url, publicId, year, filename }
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileRef = useRef(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [collapsedYears, setCollapsedYears] = useState({});
  const [tableModeYears, setTableModeYears] = useState({});
  const [edits, setEdits] = useState({});

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      alert("Bạn cần đăng nhập để truy cập trang này");
      navigate("/admin/login");
    }
  }, [navigate]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await galleryApi.getGallery();
      setGallery(res.data || []);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Không thể tải gallery");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Group images by year (flatten images arrays from gallery documents)
  const groupedByYear = gallery.reduce((acc, doc) => {
    const y =
      doc.year ||
      (doc.createdAt
        ? new Date(doc.createdAt).getFullYear()
        : new Date().getFullYear());
    acc[y] = acc[y] || [];
    const imgs = Array.isArray(doc.images) ? doc.images : [];
    imgs.forEach((it) => acc[y].push(it));
    return acc;
  }, {});

  const years = Object.keys(groupedByYear)
    .map((y) => Number(y))
    .filter((y) => (groupedByYear[y] || []).length > 0)
    .sort((a, b) => b - a);

  // file upload now handled by AddImage modal
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async (files, year) => {
    if (!files || files.length === 0)
      return alert("Chọn file trước khi upload");
    try {
      setLoading(true);
      const res = await galleryApi.uploadImages(files, year);
      return res.data?.images || res.data || [];
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Upload thất bại");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (publicId) => {
    if (!confirm("Xác nhận xóa ảnh này?")) return;
    try {
      setLoading(true);
      await galleryApi.deleteImage(publicId);
      await fetchGallery();
      alert("Đã xóa");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Xóa thất bại");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (img) => {
    setModalImage(img);
    setModalOpen(true);
  };

  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => setAddModalOpen(false);

  const handleAddImageSave = async ({
    file,
    caption,
    location,
    verified,
    year,
  }) => {
    // Upload file, then set metadata via updateImage
    console.time("gallery:upload");
    const uploaded = await handleUpload([file], year);
    console.timeEnd("gallery:upload");
    if (!uploaded || uploaded.length === 0) return;
    const u = uploaded[0] || {};
    const publicId = u.publicId || u.public_id || null;
    const url = u.url || u.secure_url || u.src || null;
    // save metadata (prefer publicId, fallback to url)
    try {
      console.time("gallery:updateImage");
      if (publicId) {
        await galleryApi.updateImage({ publicId, caption, location, verified });
      } else if (url) {
        await galleryApi.updateImage({ url, caption, location, verified });
      }
      console.timeEnd("gallery:updateImage");
    } catch (err) {
      console.error("Failed to update metadata", err);
    }
    await fetchGallery();
    closeAddModal();
    alert("Ảnh đã được thêm");
  };

  const toggleYear = (year) => {
    setCollapsedYears((s) => ({ ...s, [year]: !s[year] }));
  };

  const enterTableMode = (year) => {
    setTableModeYears((s) => ({ ...s, [year]: true }));
    // create editable copy
    setEdits((e) => ({
      ...e,
      [year]: (groupedByYear[year] || []).map((it) => ({ ...it })),
    }));
  };

  const exitTableMode = (year) => {
    setTableModeYears((s) => ({ ...s, [year]: false }));
    setEdits((e) => {
      const copy = { ...e };
      delete copy[year];
      return copy;
    });
  };

  const handleEditChange = (year, idx, field, value) => {
    setEdits((e) => {
      const arr = (e[year] || []).slice();
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...e, [year]: arr };
    });
  };

  const handleSaveYear = async (year) => {
    const rows = edits[year] || [];
    if (!rows.length) return alert("No changes to save");
    try {
      setLoading(true);
      await Promise.all(
        rows.map((r) =>
          galleryApi.updateImage({
            publicId: r.publicId,
            url: r.url,
            caption: r.caption,
            location: r.location,
            verified: !!r.verified,
          })
        )
      );
      await fetchGallery();
      exitTableMode(year);
      alert("Lưu thành công");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Quản lý Gallery (Ảnh theo năm)
      </h2>

      <GalleryUpload
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        onOpenAddModal={openAddModal}
        loading={loading}
        galleryCount={gallery.length}
        onRefresh={fetchGallery}
      />

      {/* Add image modal */}
      <AddImageModal
        open={addModalOpen}
        onClose={closeAddModal}
        onSave={handleAddImageSave}
        defaultYear={selectedYear}
      />

      {years.length === 0 && <p>Chưa có ảnh trong gallery.</p>}

      {years.map((year) => (
        <section key={year} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Năm {year}</h3>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {(groupedByYear[year] || []).length} ảnh
              </div>
              <button
                onClick={() => toggleYear(year)}
                className="text-sm text-indigo-600 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50"
              >
                {collapsedYears[year] ? "Hiện" : "Thu gọn"}
              </button>
              {!tableModeYears[year] ? (
                <button
                  onClick={() => enterTableMode(year)}
                  className="text-sm text-gray-700 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
                >
                  Bảng
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveYear(year)}
                    className="text-sm text-green-600 border border-green-200 px-2 py-1 rounded hover:bg-green-50"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => exitTableMode(year)}
                    className="text-sm text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>

          {!collapsedYears[year] && (
            <>
              {!tableModeYears[year] ? (
                <ImageGrid
                  images={groupedByYear[year] || []}
                  openModal={openModal}
                  onDelete={handleDelete}
                />
              ) : (
                <TableEditor
                  rows={edits[year] || []}
                  onChange={(idx, field, value) =>
                    handleEditChange(year, idx, field, value)
                  }
                  onSave={() => handleSaveYear(year)}
                  onCancel={() => exitTableMode(year)}
                  onView={openModal}
                  onDelete={handleDelete}
                />
              )}
            </>
          )}
        </section>
      ))}

      {/* Lightbox modal */}
      {modalOpen && modalImage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-3 flex items-center justify-between border-b">
              <div className="text-sm text-gray-700">
                {modalImage.caption || "Ảnh"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(modalImage.url);
                    alert("Copied URL");
                  }}
                  className="text-sm text-gray-600"
                >
                  Sao chép URL
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-sm text-red-600"
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center">
              <img
                src={modalImage.url}
                alt={modalImage.caption || "img"}
                className="max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
