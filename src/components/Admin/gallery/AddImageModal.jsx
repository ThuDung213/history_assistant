import React, { useState, useEffect, useRef } from "react";

export default function AddImageModal({ open, onClose, onSave, defaultYear }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [verified, setVerified] = useState(false);
  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (open) {
      // reset fields when opening
      setFile(null);
      setCaption("");
      setLocation("");
      setVerified(false);
      setYear(defaultYear || new Date().getFullYear());
      setPreview(null);
    }
  }, [open, defaultYear]);

  if (!open) return null;

  const handleFileSelect = (e) => setFile(e.target.files?.[0] || null);

  const handleSave = () => {
    if (!file) return alert("Vui lòng chọn file ảnh");
    onSave({ file, caption, location, verified, year });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold">Thêm ảnh mới</h3>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-red-600"
          >
            Đóng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-64 bg-gray-50 rounded border-dashed border-2 border-gray-200 flex items-center justify-center overflow-hidden">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="object-contain max-h-full w-full"
                />
              ) : (
                <div className="text-center text-gray-400">Chưa có ảnh</div>
              )}
            </div>

            <div className="w-full flex items-center justify-between gap-2">
              <label className="flex-1">
                <div className="cursor-pointer px-4 py-2 bg-white border rounded shadow-sm text-sm text-gray-700 text-center hover:bg-gray-50">
                  Chọn file ảnh
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = null;
                  setPreview(null);
                }}
                className="px-3 py-2 border rounded text-sm text-red-600"
              >
                Xóa
              </button>
            </div>

            <div className="w-full text-xs text-gray-500">
              Kích thước tối đa: 10MB. Định dạng: JPG/PNG.
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Năm
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="mt-1 block w-40 p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Caption
              </label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="mt-1 block w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full p-2 border rounded"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                />
                <span className="text-sm">Verified</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button onClick={onClose} className="px-4 py-2 border rounded">
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
