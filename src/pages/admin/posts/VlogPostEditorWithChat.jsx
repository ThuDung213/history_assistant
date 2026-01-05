import React, { useState } from "react";
import VlogPostEditor from "./VlogPostEditor";
import ChatbotSidebar from "../sections/ChatbotSidebar";
import { createPortal } from "react-dom";
import { MessageCircle, X } from "lucide-react";
import { useCreateLocation } from "../../../hooks/locations/useCreateLocation";
import { useUpdateLocation } from "../../../hooks/locations/useUpdateLocation";
import { useNavigate, useLocation } from "react-router-dom";

export default function VlogPostEditorWithChat() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { submitLocation, loading, error } = useCreateLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location?.state?.site || null;
  const { updateLocation, loading: updating } = useUpdateLocation();

  const handleCreateLocation = async (payload) => {
    try {
      await submitLocation(payload);
      alert("✅ Lưu địa điểm thành công");
      navigate("/admin/locations/");
    } catch (err) {
      alert(err.detail || "❌ Lưu thất bại");
      throw err;
    }
  };

  const handleUpdateLocation = async (payload) => {
    try {
      const id = initialData?.id || initialData?._id;
      if (!id) throw new Error("Không xác định id địa điểm");
      await updateLocation(id, payload);
      alert("✅ Cập nhật địa điểm thành công");
      navigate("/admin/locations/");
    } catch (err) {
      alert(err.detail || "❌ Cập nhật thất bại");
      throw err;
    }
  };

  return (
    <div className="min-h-screen relative">
      <VlogPostEditor
        onSubmit={initialData ? handleUpdateLocation : handleCreateLocation}
        initialData={initialData}
      />

      {createPortal(
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3">
          {isChatOpen && (
            <div className="w-70 h-80 md:w-90 md:h-120 mb-2 shadow-xl">
              <ChatbotSidebar />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsChatOpen((s) => !s)}
            aria-label={isChatOpen ? "Đóng trợ lý" : "Mở trợ lý"}
            className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition"
          >
            {isChatOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
