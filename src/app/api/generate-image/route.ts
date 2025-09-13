import { NextRequest } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs";

const vertexAI = new VertexAI({
  project: process.env.GCLOUD_PROJECT!,
  location: "us-central1",
});

const model = vertexAI.getGenerativeModel({
  model: "imagen-3.0-fast", // hoặc "imagen-3.0-generate"
});

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "image/png", // 🔑 để nhận ảnh
      },
    });

    // Lấy dữ liệu ảnh base64 từ response
    const base64Image = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${base64Image}` }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
