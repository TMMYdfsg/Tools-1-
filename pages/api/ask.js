// pages/api/ask.js
import { Configuration, OpenAIApi } from "openai";
import { getRetriever } from "@/utils/langchain";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";

const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { question, debug = false } = req.body;
    if (!question) {
        return res.status(400).json({ error: "Missing question" });
    }

    try {
        const model = new ChatOpenAI({ modelName: "gpt-4", temperature: 0 });
        const retriever = await getRetriever();

        const chain = RetrievalQAChain.fromLLM(model, retriever, {
            returnSourceDocuments: true,
        });

        const result = await chain.call({ query: question });
        const answer = result.text;
        const sources = result.sourceDocuments?.map((doc) => doc.pageContent).join("\n\n");

        return res.status(200).json({ answer, context: debug ? sources : undefined });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to get response from OpenAI" });
    }
}
