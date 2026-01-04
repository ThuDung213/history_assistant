import { Filter, History, Plus, Search } from "lucide-react";
import { SiteTable } from "../../../components/Admin/post/PostTable";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminLocations } from "../../../hooks/locations/useAdminLocations";
import { useDeleteLocation } from "../../../hooks/locations/useDeleteLocation";

export default function PostsPage() {
  const [sites, setSites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [notification, setNotification] = useState(null);
  const { locations, loading } = useAdminLocations();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && locations) {
      setSites(locations);
    }
  }, [locations, loading]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const { deleteLocation, loading: deleting } = useDeleteLocation();

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa điểm này không?"))
      return;

    try {
      await deleteLocation(id);
      // remove from local list after successful deletion
      setSites((prev) => prev.filter((s) => s.id !== id));
      showNotification("Đã xóa địa điểm thành công!");
    } catch (err) {
      showNotification(err.detail || "Xóa địa điểm thất bại", "error");
    }
  };

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const name = site.siteName || "";
      const type = site.locationType || "";
      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "All" || site.locationType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [sites, searchTerm, filterType]);

  const locationTypes = ["All", ...new Set(sites.map((s) => s.locationType))];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <History className="text-indigo-600" size={32} />
            Quản Lý Di Tích Lịch Sử
          </h1>
          <p className="text-slate-500 mt-1">
            Dữ liệu hiện tại được lưu trữ tạm thời trong phiên làm việc này
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/locations/create")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus size={20} />
          Thêm địa điểm
        </button>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc loại..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {locationTypes.map((type) => (
              <option key={type} value={type}>
                {type === "All" ? "Tất cả thể loại" : type}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl flex items-center justify-center gap-3 shadow-sm">
          <span className="text-sm font-medium text-indigo-700">
            Tổng cộng:
          </span>
          <span className="text-xl font-bold text-indigo-800">
            {filteredSites.length}
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <SiteTable
          sites={filteredSites}
          //   onView={(site) => handleOpenModal("view", site)}
          onEdit={(site) =>
            navigate("/admin/locations/create", { state: { site } })
          }
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
