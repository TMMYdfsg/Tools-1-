// utils/langchain/index.js
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Chroma } from "langchain/vectorstores/chroma";
import path from "path";

const CHROMA_PATH = path.resolve("./chroma");

export async function loadAndSplit(filePath, mimetype) {
    let loader;
    if (mimetype === "application/pdf") {
        loader = new PDFLoader(filePath);
    } else if (mimetype === "text/plain") {
        loader = new TextLoader(filePath);
    } else {
        throw new Error("Unsupported file type");
    }

    const rawDocs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });
    return await splitter.splitDocuments(rawDocs);
}

export async function saveToChroma(docs) {
    return await Chroma.fromDocuments(docs, new OpenAIEmbeddings(), {
        collectionName: "document-qa",
        url: "file://" + CHROMA_PATH,
    });
}

export async function getRetriever() {
    const store = await Chroma.fromExistingCollection(
        new OpenAIEmbeddings(),
        {
            collectionName: "document-qa",
            url: "file://" + CHROMA_PATH,
        }
    );
    return store.asRetriever();
}