// utils/langchain/db.js
import fs from "fs";
import path from "path";

const CHROMA_PATH = path.resolve("./chroma");

export function clearChroma() {
    if (fs.existsSync(CHROMA_PATH)) {
        fs.rmSync(CHROMA_PATH, { recursive: true, force: true });
        console.log("🧹 Chromaデータベースを初期化しました。");
    }
}

export function chromaExists() {
    return fs.existsSync(CHROMA_PATH);
}
