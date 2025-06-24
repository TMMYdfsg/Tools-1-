// pages/index.js
import dynamic from "next/dynamic";

const ChatUI = dynamic(() => import("../components/ChatUI"), { ssr: false });

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <ChatUI />
        </main>
    );
}