import React, { useCallback, useEffect, useRef, useState } from "react";
import { Landmark, Loader, Send } from "lucide-react";
import { askAgent } from "../../../api/agentAPI";
import { SourceAttribution } from "../../../components/Admin/SourceAttribution";


export default function Chatbot() {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Chào bạn! Tôi là trợ lý AI. Tôi có thể giúp bạn tìm kiếm thông tin lịch sử hoặc hỗ trợ nhập liệu. Bạn cần tôi giúp gì?' }
    ]);
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Cuộn xuống tin nhắn cuối cùng
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Hàm gửi tin nhắn
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();

        // Thêm tin nhắn người dùng
        setMessages(prev => [...prev, { role: "user", text: userMessage }]);
        setInput("");
        setIsLoading(true);

        try {
            const agentResponse = await askAgent(userMessage);

            // Ép kiểu trả về dạng text
            const answer = agentResponse.answer;
            const sources = agentResponse.sources || [];

            // Thêm tin nhắn AI
            setMessages(prev => [...prev, { role: "assistant", text: answer, sources: sources }]);

        } catch (error) {
            setMessages(prev => [
                ...prev,
                { role: "assistant", text: "❌ Lỗi khi gọi API. Vui lòng thử lại." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };


    // Hàm render tin nhắn (sử dụng Markdown cơ bản)
    const renderMessageContent = useCallback((message) => {

        const { text, role, sources } = message;

        // Tách para theo ký tự xuống dòng
        const paragraphs = text.split('\n').map((line, index) => {
            if (!line.trim()) return <br key={index} />;

            let content = line.split(/(\*\*.*?\*\*)/).map((segment, segIndex) => {
                if (segment.startsWith('**') && segment.endsWith('**')) {
                    return <span key={segIndex} className="font-semibold">{segment.slice(2, -2)}</span>;
                }
                return segment;
            });

            // Xử lý list item giả lập
            if (line.startsWith('- ') || line.startsWith('* ')) {
                // Loại bỏ tiền tố list item khỏi mảng nội dung
                if (content.length > 0 && typeof content[0] === 'string') {
                    const prefix = line.startsWith('- ') ? '- ' : '* ';
                    content[0] = content[0].substring(prefix.length);
                }
                return (
                    // Căn chỉnh nội dung list item
                    <div key={index} className="flex items-start pl-4 mb-1 text-sm">
                        <span className="mr-2 text-current">&bull;</span>
                        <p className="inline">{content}</p>
                    </div>
                );
            }
            return (
                <p key={index} className="mb-1 text-sm">
                    {content}
                </p>
            );
        })
        // Xử lý nguồn tham khảo
        if (role === "assistant") {
            return (
                <div className="flex flex-col">
                    {paragraphs}
                    {/* source link */}
                    {sources && sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-600 flex items-center justify-end text-gray-400">
                            <span className="text-xs italic mr-2">Nguồn tham khảo</span>
                            <div className="">
                                <SourceAttribution sources={sources} />
                            </div>
                        </div>
                    )}
                </div>
            )
        }

        return paragraphs;
    });


    return (
        <div className="flex flex-col h-full bg-white rounded-xl shadow-2xl border-t-4 border-indigo-500 overflow-hidden">

            {/* Header Chat */}
            <div className="flex items-center p-4 border-b border-gray-200 bg-indigo-50">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                    <Landmark className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-gray-800">Trợ Lý Lịch Sử AI</h4>
            </div>

            {/* Vùng Tin Nhắn */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs sm:max-w-md p-3 rounded-xl shadow-sm ${msg.role === 'user'
                            ? 'bg-indigo-500 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 rounded-tl-none'
                            }`}>
                            {renderMessageContent(msg)}
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 rounded-xl bg-gray-200 text-gray-600 flex items-center">
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            <span>Trợ lý đang phản hồi...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Hỏi tôi về lịch sử, kiến trúc..."
                        disabled={isLoading}
                        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        aria-label="Gửi tin nhắn"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}