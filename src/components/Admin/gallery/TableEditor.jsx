import React from "react";
import { Eye, Trash2 } from "lucide-react";

export default function TableEditor({
  rows = [],
  onChange,
  onSave,
  onCancel,
  onView,
  onDelete,
}) {
  return (
    <div className="overflow-auto bg-white rounded border">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-center">
            <th className="p-2">Ảnh</th>
            <th className="p-2">Caption</th>
            <th className="p-2">Location</th>
            <th className="p-2">Verified</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((img, idx) => (
            <tr
              key={img.publicId || img.url || `row-${idx}`}
              className="border-t"
            >
              <td className="p-2 w-28 text-center">
                <img
                  src={img.url}
                  alt="thumb"
                  className="w-24 h-14 object-cover rounded mx-auto"
                />
              </td>
              <td className="p-2 text-center">
                <textarea
                  value={img.caption || ""}
                  onChange={(e) => onChange(idx, "caption", e.target.value)}
                  rows={2}
                  className="w-full max-w-[300px] p-1 border rounded text-sm resize-vertical mx-auto"
                />
              </td>
              <td className="p-2 text-center">
                <input
                  value={img.location || ""}
                  onChange={(e) => onChange(idx, "location", e.target.value)}
                  className="w-full max-w-[200px] p-1 border rounded text-sm mx-auto"
                />
              </td>
              <td className="p-2 text-center">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={!!img.verified}
                    onChange={(e) =>
                      onChange(idx, "verified", e.target.checked)
                    }
                  />
                </div>
              </td>
              <td className="p-2 text-center">
                <div className="inline-flex items-center gap-2 justify-center">
                  <button
                    onClick={() => onView(img)}
                    aria-label="Xem"
                    className="text-gray-600 p-1 hover:bg-gray-100 rounded"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(img.publicId || img.url)}
                    aria-label="Xóa"
                    className="text-red-600 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
