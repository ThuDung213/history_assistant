const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function askAgent(question) {
    try {
        const res = await fetch(`${API_BASE_URL}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();

        // Normalize possible API shapes into a consistent object:
        // 1) { answer: "...", sources: [...] }
        // 2) { answer: { answer: "...", sources: [...] } }
        // 3) { answer: "..." }
        // 4) { answer: { answer: "..." } }
        const normalize = (payload) => {
            if (typeof payload === "string") {
                return { answer: payload, sources: [] };
            }

            if (payload && typeof payload === "object") {
                // Case: payload already looks like {answer, sources}
                if (typeof payload.answer === "string") {
                    return {
                        answer: payload.answer,
                        sources: Array.isArray(payload.sources) ? payload.sources : [],
                    };
                }

                // Case: nested object in payload.answer
                if (payload.answer && typeof payload.answer === "object") {
                    const nested = payload.answer;
                    if (typeof nested.answer === "string") {
                        return {
                            answer: nested.answer,
                            sources: Array.isArray(nested.sources) ? nested.sources : [],
                        };
                    }
                }
            }

            return { answer: "Không nhận được phản hồi từ Agent.", sources: [] };
        };

        return normalize(data);

    } catch (error) {
        console.error("Agent API error:", error);
        return { answer: "Xin lỗi, tôi gặp lỗi khi kết nối với máy chủ.", sources: [] };
    }
}