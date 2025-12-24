import React, { useState, useEffect } from "react";
import { Landmark, MapPin, Plus, Trash2 } from "lucide-react";
import { useCreateLocation } from "../../../hooks/locations/useCreateLocation";
import { useNavigate } from "react-router-dom";
import { isAdminLoggedIn } from "../../../hooks/auth/useAuth";

// Component phụ cho Input cơ bản
const InputField = ({ label, id, type = 'text', placeholder, required = false, className = "", onChange, value }) => (
    <div className={`flex flex-col ${className}`}>
        <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-base"
        />
    </div>
);

// Component phụ cho Textarea
const TextareaField = ({ label, id, placeholder, required = false, rows = 4, value, onChange }) => (
    <div className="flex flex-col">
        <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={id}
            placeholder={placeholder}
            required={required}
            rows={rows}
            value={value}
            onChange={onChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-base"
        ></textarea>
    </div>
);

// Component Form Nhập Địa điểm Lịch sử Mới
export default function VlogPostEditor() {
    const navigate = useNavigate();
    const [siteName, setSiteName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [locationType, setLocationType] = useState("");
    const [thumbnailUrl, setThumbnailUrl] = useState("");
    const [shortDescription, setShortDescription] = useState("");

    // Check admin authentication on component mount
    useEffect(() => {
        if (!isAdminLoggedIn()) {
            alert("⚠️ Bạn cần đăng nhập để truy cập trang này");
            navigate("/admin/login");
        }
    }, [navigate]);

    // tọa độ
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    // nội dung chi tiết
    const [history, setHistory] = useState("");
    const [keyEvents, setKeyEvents] = useState("");
    const [architecture, setArchitecture] = useState("");
    const [significance, setSignificance] = useState("");
    const [additionalContent, setAdditionalContent] = useState("");

    const { submitLocation, loading, error } = useCreateLocation();

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Cập nhật state với các file mới được chọn
        setSelectedFiles(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            siteName,
            locationType,
            thumbnailUrl,
            shortDescription,

            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,

            history,
            keyEvents,
            architecture,
            significance,
            additionalContent,
        };

        try {
            await submitLocation(payload);
            alert("✅ Lưu địa điểm thành công");

            // (optional) reset form
            setSiteName("");
            setLocationType("");
            setThumbnailUrl("");
            setShortDescription("");
            setLatitude("");
            setLongitude("");
            setHistory("");
            setKeyEvents("");
            setArchitecture("");
            setSignificance("");
            setAdditionalContent("");
            setSelectedFiles([]);

        } catch (err) {
            alert(err.detail || "❌ Lưu thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearSelectedFiles = () => {
        setSelectedFiles([]);
        // Đảm bảo input file được reset để có thể chọn lại cùng một file (nếu cần)
        document.getElementById('file-upload').value = null;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-6 bg-white rounded-xl shadow-lg border-t-4 border-indigo-500">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                <Landmark className="w-8 h-8 mr-3 text-indigo-600" />
                Thêm Địa điểm Lịch sử Mới
            </h2>
            <p className="text-gray-500">Vui lòng điền đầy đủ thông tin về địa điểm lịch sử.</p>

            {/* 1. Thông tin cơ bản */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">1. Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Tên địa điểm"
                        id="siteName"
                        placeholder="Ví dụ: Hoàng Thành Thăng Long"
                        required
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                    />
                    <InputField
                        label="Loại địa điểm"
                        id="locationType"
                        placeholder="Ví dụ: Di tích lịch sử, Cố đô, Đền thờ"
                        value={locationType}
                        onChange={(e) => setLocationType(e.target.value)}
                    />
                    <InputField
                        label="Thumbnail URL"
                        id="thumbnailUrl"
                        placeholder="https://example.com/image.jpg"
                        value={thumbnailUrl}
                        onChange={(e) => setThumbnailUrl(e.target.value)}
                    />
                    <InputField
                        label="Mô tả ngắn"
                        id="shortDescription"
                        placeholder="Tóm tắt về địa điểm (max 200 ký tự)"
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                    />
                    <InputField
                        label="Latitude (Vĩ độ)"
                        id="latitude"
                        type="number"
                        placeholder="21.0378"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                    />
                    <InputField
                        label="Longitude (Kinh độ)"
                        id="longitude"
                        type="number"
                        placeholder="105.8342"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                    />
                </div>
            </section>

            {/* 2. Nội dung chi tiết */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">2. Nội dung chi tiết</h3>
                <div className="space-y-6">
                    <TextareaField
                        label="Lịch sử hình thành"
                        id="history"
                        placeholder="Chi tiết về quá trình xây dựng và phát triển..."
                        rows={6}
                        value={history}
                        onChange={(e) => setHistory(e.target.value)}
                    />
                    <TextareaField
                        label="Sự kiện nổi bật"
                        id="keyEvents"
                        placeholder="Các sự kiện lịch sử quan trọng đã diễn ra tại đây..."
                        rows={4}
                        value={keyEvents}
                        onChange={(e) => setKeyEvents(e.target.value)}
                    />
                    <TextareaField
                        label="Kiến trúc – Đặc điểm"
                        id="architecture"
                        placeholder="Mô tả phong cách kiến trúc và các đặc điểm độc đáo..."
                        rows={4}
                        value={architecture}
                        onChange={(e) => setArchitecture(e.target.value)}
                    />
                    <TextareaField
                        label="Ý nghĩa lịch sử"
                        id="significance"
                        placeholder="Tầm quan trọng của địa điểm đối với quốc gia/khu vực..."
                        rows={4}
                        value={significance}
                        onChange={(e) => setSignificance(e.target.value)}
                    />
                    <TextareaField
                        label="Nội dung thêm"
                        id="additionalContent"
                        placeholder="Bất kỳ thông tin bổ sung nào khác..."
                        rows={4}
                        value={additionalContent}
                        onChange={(e) => setAdditionalContent(e.target.value)}
                    />
                </div>
            </section>
            {/* 4. Ảnh bổ sung */}
            <section>
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">4. Ảnh bổ sung (Tải file)</h3>
                <div className="space-y-4">
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Plus className="w-6 h-6 mb-3 text-indigo-500" />
                            <p className="mb-2 text-sm text-gray-500 font-semibold">Nhấn để chọn file hoặc kéo thả</p>
                            <p className="text-xs text-gray-500">(Hỗ trợ nhiều file, định dạng JPG/PNG)</p>
                        </div>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg"
                        />
                    </label>

                    {selectedFiles.length > 0 && (
                        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <p className="font-medium text-gray-700 mb-2">Đã chọn {selectedFiles.length} ảnh:</p>
                            <ul className="space-y-1 text-sm text-gray-600">
                                {selectedFiles.map((file, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                        <span className="truncate">{file.name}</span>
                                        <span className="text-xs text-gray-400 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={clearSelectedFiles}
                                className="mt-3 text-red-500 hover:text-red-700 text-sm font-medium flex items-center transition"
                            >
                                <Trash2 className="w-4 h-4 mr-1" /> Xóa tất cả ảnh đã chọn
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Nút Submit */}
            <div className="pt-4 border-t border-gray-200">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-md"
                >
                    {isSubmitting ? 'Đang Gửi Dữ liệu...' : 'Lưu Địa điểm Lịch sử'}
                </button>
            </div>
        </form>
    );
};
