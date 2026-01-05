import React from "react";
import { Plus } from "lucide-react";

export default function GalleryUpload({
  selectedYear,
  setSelectedYear,
  onOpenAddModal,
  loading,
  galleryCount,
  onRefresh,
}) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <label className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Năm</span>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="ml-2 p-2 border rounded w-28"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded border shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span className="text-sm">Thêm ảnh</span>
          </button>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-sm text-gray-600">{galleryCount} năm</div>
        <button onClick={onRefresh} className="text-sm text-gray-600">
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>
    </div>
  );
}
