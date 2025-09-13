import { NextRequest } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs";

// Parse service account JSON từ env
function getCredentials() {
  try {
    return JSON.parse(process.env.GCLOUD_KEY_JSON || "{}");
  } catch {
    return {};
  }
}

const creds = getCredentials();

// ⚡ VertexAI sẽ tự đọc từ GOOGLE_APPLICATION_CREDENTIALS env
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/tmp/gcloud-key.json";

// ghi file key tạm (chỉ khi chạy runtime nodejs)
import fs from "fs";
if (creds.private_key && creds.client_email) {
  fs.writeFileSync("/tmp/gcloud-key.json", JSON.stringify(creds));
}

const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT!,
  location: process.env.GCLOUD_LOCATION || "us-central1",
});

const model = vertexAI.getGenerativeModel({
  model: "imagen-3.0-fast",
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "image/png" },
    });

    const base64Image =
      result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${base64Image}` }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Imagen API error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
