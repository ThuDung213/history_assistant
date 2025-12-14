const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function askAgent(question) {
    try {
        console.log({ question });
        const res = await fetch(`${API_BASE_URL}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();
        return data.answer.answer || "Không nhận được phản hồi từ Agent.";

    } catch (error) {
        console.error("Agent API error:", error);
        return "Xin lỗi, tôi gặp lỗi khi kết nối với máy chủ.";
    }
}