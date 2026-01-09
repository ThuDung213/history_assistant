import React, { useState, useEffect, useRef } from "react";

export default function AddImageModal({ open, onClose, onSave, defaultYear }) {
  const [items, setItems] = useState([]); // { file, previewUrl, caption }
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [location, setLocation] = useState("");
  const [verified, setVerified] = useState(false);
  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const removeItemAt = (removeIdx) => {
    setItems((prev) => {
      const toRemove = prev[removeIdx];
      if (toRemove?.previewUrl) URL.revokeObjectURL(toRemove.previewUrl);

      const next = prev.filter((_, idx) => idx !== removeIdx);

      setSelectedIndex((curr) => {
        if (next.length === 0) return 0;
        if (removeIdx < curr) return Math.max(0, curr - 1);
        if (removeIdx === curr) return Math.min(curr, next.length - 1);
        return curr;
      });

      // If nothing left, clear file input value so selecting the same files again triggers onChange
      if (next.length === 0 && inputRef.current) inputRef.current.value = null;

      return next;
    });
  };

  useEffect(() => {
    return () => {
      // cleanup previews on unmount
      items.forEach((it) => {
        if (it?.previewUrl) URL.revokeObjectURL(it.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (open) {
      // reset fields when opening
      // cleanup any previous previews
      items.forEach((it) => {
        if (it?.previewUrl) URL.revokeObjectURL(it.previewUrl);
      });
      setItems([]);
      setSelectedIndex(0);
      setLocation("");
      setVerified(false);
      setYear(defaultYear || new Date().getFullYear());
      setSaving(false);
    }
  }, [open, defaultYear]);

  if (!open) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // cleanup existing previews
    items.forEach((it) => {
      if (it?.previewUrl) URL.revokeObjectURL(it.previewUrl);
    });

    setItems(
      files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        caption: "",
      }))
    );

    setSelectedIndex(0);
  };

  const handleSave = async () => {
    if (!items.length) return alert("Vui lòng chọn file ảnh");
    if (saving) return;
    try {
      setSaving(true);
      await Promise.resolve(onSave({ items, location, verified, year }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold">Thêm ảnh mới</h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Đóng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-full h-64 bg-gray-50 rounded border-dashed border-2 border-gray-200 flex items-center justify-center overflow-hidden">
              {items?.[selectedIndex]?.previewUrl ? (
                <img
                  src={items[selectedIndex].previewUrl}
                  alt="preview"
                  className="object-contain max-h-full w-full"
                />
              ) : (
                <div className="text-center text-gray-400">Chưa có ảnh</div>
              )}
            </div>

            {items.length > 0 && (
              <div className="w-full">
                <div className="text-xs text-gray-500 mb-2">
                  Đã chọn {items.length} ảnh
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {items.map((it, idx) => (
                    <button
                      key={`${it.file?.name || "file"}-${idx}`}
                      type="button"
                      onClick={() => setSelectedIndex(idx)}
                      className={
                        "shrink-0 w-16 h-12 rounded border overflow-hidden " +
                        (idx === selectedIndex
                          ? "border-indigo-500"
                          : "border-gray-200")
                      }
                      aria-label={`Chọn ảnh ${idx + 1}`}
                    >
                      <img
                        src={it.previewUrl}
                        alt={it.file?.name || `img-${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full flex items-center justify-between gap-2">
              <label className="flex-1">
                <div className="cursor-pointer px-4 py-2 bg-white border rounded shadow-sm text-sm text-gray-700 text-center hover:bg-gray-50">
                  Chọn file ảnh
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={saving}
                  className="hidden"
                />
              </label>
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
                Caption từng ảnh
              </label>
              {items.length === 0 ? (
                <div className="mt-1 text-sm text-gray-400">
                  Chưa chọn ảnh
                </div>
              ) : (
                <div className="mt-1 max-h-56 overflow-auto space-y-2">
                  {items.map((it, idx) => (
                    <div key={`${it.file?.name || "file"}-${idx}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-gray-500 truncate">
                          {it.file?.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItemAt(idx)}
                          disabled={saving}
                          className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          Bỏ
                        </button>
                      </div>
                      <input
                        value={it.caption}
                        onChange={(e) => {
                          const value = e.target.value;
                          setItems((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, caption: value } : p
                            )
                          );
                        }}
                        disabled={saving}
                        className="mt-1 block w-full p-2 border rounded disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="Nhập caption..."
                      />
                    </div>
                  ))}
                </div>
              )}
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
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 border rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
