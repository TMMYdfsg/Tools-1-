// components/ChatUI.jsx
import { useState, useRef, useEffect } from "react";

export default function ChatUI() {
    const [input, setInput] = useState("");
    const [history, setHistory] = useState([]); // { question, answer, context }
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    // チャットの一番下にスクロールする処理
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, loading]);

    async function handleSend() {
        if (!input.trim()) return;
        const question = input.trim();

        // 履歴に質問追加
        setHistory((prev) => [...prev, { question, answer: null, context: null }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, debug: false }),
            });
            const data = await res.json();

            setHistory((prev) => {
                const newHist = [...prev];
                const last = newHist[newHist.length - 1];
                last.answer = data.answer || "回答がありません。";
                last.context = data.context || "";
                return newHist;
            });
        } catch (error) {
            setHistory((prev) => {
                const newHist = [...prev];
                const last = newHist[newHist.length - 1];
                last.answer = "エラーが発生しました。";
                last.context = "";
                return newHist;
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto flex flex-col h-[80vh] border rounded-lg shadow-md overflow-hidden">
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
                {history.map((item, i) => (
                    <div key={i}>
                        {/* ユーザー質問（右寄せ） */}
                        <div className="flex justify-end">
                            <div className="bg-blue-500 text-white px-4 py-2 rounded-l-lg rounded-br-lg max-w-[70%]">
                                {item.question}
                            </div>
                        </div>

                        {/* AI回答（左寄せ） */}
                        {item.answer && (
                            <div className="flex justify-start mt-1">
                                <div className="bg-gray-300 text-gray-900 px-4 py-2 rounded-r-lg rounded-bl-lg max-w-[70%] whitespace-pre-wrap">
                                    {item.answer}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t bg-white flex items-center gap-2">
                <input
                    type="text"
                    className="flex-grow border rounded px-3 py-2 focus:outline-none"
                    placeholder="質問を入力してください"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !loading) {
                            handleSend();
                        }
                    }}
                    disabled={loading}
                />
                <button
                    className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50`}
                    onClick={handleSend}
                    disabled={loading}
                >
                    {loading ? "送信中..." : "送信"}
                </button>
            </div>
        </div>
    );
}
