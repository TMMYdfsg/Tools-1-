// pages/api/parse.js
import formidable from "formidable";
import fs from "fs";
import { promisify } from "util";
import path from "path";
import { loadAndSplit, saveToChroma } from "@/utils/langchain";

export const config = {
    api: {
        bodyParser: false,
    },
};

const readFile = promisify(fs.readFile);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const form = new formidable.IncomingForm();
    form.uploadDir = "/tmp";
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: "Error parsing form" });
        }

        const file = files.file;
        if (!file || !file.filepath) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        try {
            const ext = path.extname(file.originalFilename);
            const mimetype = file.mimetype;

            // LangChainで分割＋Chromaへ保存
            const docs = await loadAndSplit(file.filepath, mimetype);
            await saveToChroma(docs);

            // テキストも返却用に生成
            const text = docs.map((doc) => doc.pageContent).join("\n\n");
            return res.status(200).json({ text });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to process document" });
        }
    });
}