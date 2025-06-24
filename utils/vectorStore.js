// utils/vectorStore.js
import { Configuration, OpenAIApi } from "openai";
import { createHash } from "crypto";

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

let memory = [];

export async function embedText(text) {
    const res = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: text,
    });
    return res.data.data[0].embedding;
}

export async function addToMemory(text) {
    const embedding = await embedText(text);
    const id = createHash("sha256").update(text).digest("hex");
    memory.push({ id, text, embedding });
}

export async function searchMemory(query, topK = 1) {
    const queryVec = await embedText(query);
    const cosine = (a, b) => a.reduce((sum, ai, i) => sum + ai * b[i], 0);

    const scored = memory.map(({ id, text, embedding }) => ({
        id,
        text,
        score: cosine(queryVec, embedding),
    }));

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}
