import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Edit2,
    Trash2,
    Eye,
    X,
    MapPin,
} from 'lucide-react';

export const SiteTable = ({ sites, onView, onEdit, onDelete, onSeedData }) => {
    if (sites.length === 0) {
        return (
            <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <Search className="text-slate-400" size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Không tìm thấy địa điểm nào</h3>
                    <p className="text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
                    <button onClick={onSeedData} className="mt-4 text-indigo-600 font-semibold hover:underline">
                        Nhấp vào đây để nạp dữ liệu mẫu
                    </button>
                </div>
            </div>
        );
    }

      return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200 text-sm text-slate-600">
          <tr>
            <th className="px-4 py-3">Ảnh</th>
            <th className="px-4 py-3">Tên di tích</th>
            <th className="px-4 py-3">Loại</th>
            <th className="px-4 py-3">Mô tả ngắn</th>
            <th className="px-4 py-3">Tọa độ</th>
            <th className="px-4 py-3 text-center">Hành động</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {sites.map((site) => (
            <tr
              key={site.id}
              className="hover:bg-slate-50 transition-colors group"
            >
              {/* Thumbnail */}
              <td className="px-4 py-3">
                <img
                  src={site.thumbnailUrl}
                  alt={site.siteName}
                  className="w-20 h-14 object-cover rounded-md border"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/160x120?text=No+Image';
                  }}
                />
              </td>

              {/* Site name */}
              <td className="px-4 py-3 font-semibold text-slate-800">
                {site.siteName}
              </td>

              {/* Location type */}
              <td className="px-4 py-3">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                  {site.locationType}
                </span>
              </td>

              {/* Short description */}
              <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                {site.shortDescription || '—'}
              </td>

              {/* Coordinates */}
              <td className="px-4 py-3 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-500" />
                  {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onView(site)}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    title="Xem chi tiết"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(site)}
                    className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(site.id)}
                    className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

};