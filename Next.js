import { NextRequest } from 'next/server'
import { VertexAI } from '@google-cloud/vertexai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const prompt = body.prompt || 'A futuristic city skyline at sunset'

    const vertexAI = new VertexAI({
      project: process.env.GCP_PROJECT_ID!,
      location: 'us-central1', // Imagen hỗ trợ region này
    })

    const model = vertexAI.preview.getGenerativeModel({
      model: 'imagegeneration@006', // Imagen 3
    })

    const result = await model.generateImages({
      prompt,
      numberOfImages: 1,
      aspectRatio: '1:1',
    })

    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: true, message: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
