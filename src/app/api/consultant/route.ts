import { NextResponse } from 'next/server';
import { consultantFlow } from '@/ai/flows/consultant-flow';

export const maxDuration = 60; // 60s max execution time since multimodal AI takes a bit

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    console.log('[Consultant API] Received POST request.', { hasImages: !!rawBody.imageUrls?.length });
    
    // Genkit expects payload encapsulated in `{ data: ... }` for flow inputs
    const response = await consultantFlow(rawBody);

    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error('[Consultant API] Error invoking Genkit flow:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request.' },
      { status: 500 }
    );
  }
}
