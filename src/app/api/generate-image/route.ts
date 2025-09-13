import { NextRequest } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

export const runtime = "nodejs";

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
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // Imagen 3 trả về predictions
    const base64Image =
      (result as any).response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
      (result as any).predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: "Không có ảnh trả về từ Imagen" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ image: `data:image/png;base64,${base64Image}` }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: true, message: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
