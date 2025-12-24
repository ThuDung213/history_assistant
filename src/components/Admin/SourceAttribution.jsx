import { Book, X } from "lucide-react";
import { useState } from "react";

export const SourceAttribution = ({ sources }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!sources || sources.length === 0) return null;

    return (
        <div className="relative inline-flex items-center ml-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-full bg-indigo-200 text-indigo-700 hover:bg-indigo-300 transition-colors duration-150 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Xem nguồn tham khảo"
            >
                <Book className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-40 md:w-65 bg-white border border-gray-300 rounded-xl shadow-2xl z-20 origin-bottom-right">
                    <div className="p-4">
                        <div className="flex justify-between items-center border-b pb-2 mb-2">
                            <h5 className="font-bold text-sm text-gray-700">Nguồn Tham Khảo ({sources.length})</h5>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-900">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {sources.map((source, index) => (
                                <li key={index} className="text-xs">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 hover:underline block truncate"
                                        title={source}
                                    >
                                        <span className="font-semibold">{index + 1}.</span> {source.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};