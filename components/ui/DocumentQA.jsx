// components/DocumentQA.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function DocumentQA() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [debug, setDebug] = useState(false);
    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleFileUpload(e) {
        const uploaded = e.target.files[0];
        if (!uploaded) return;
        const formData = new FormData();
        formData.append("file", uploaded);

        const res = await fetch("/api/parse", {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (data.text) {
            setText(data.text);
        }
    }

    async function askQuestion() {
        setLoading(true);
        const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question, text, debug }),
        });
        const data = await res.json();
        setAnswer(data.answer || "");
        setContext(data.context || "");
        setLoading(false);
    }

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <Input type="file" accept=".pdf,.txt" onChange={handleFileUpload} />
            <Input
                type="text"
                placeholder="質問を入力してください"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="flex items-center gap-2">
                <Switch checked={debug} onCheckedChange={setDebug} />
                <span className="text-sm">文脈（デバッグ用）を表示</span>
            </div>
            <Button onClick={askQuestion} disabled={loading}>
                {loading ? "送信中..." : "質問する"}
            </Button>
            {answer && (
                <div className="mt-4 bg-gray-100 p-4 rounded-xl">
                    <strong>回答：</strong>
                    <p>{answer}</p>
                </div>
            )}
            {debug && context && (
                <div className="mt-2 text-xs text-gray-500">
                    <strong>使用された文脈：</strong>
                    <pre>{context}</pre>
                </div>
            )}
        </div>
    );
}