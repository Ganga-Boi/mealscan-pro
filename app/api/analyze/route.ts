import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const maxDuration = 60;

const ItemSchema = z.object({
  name: z.string().min(1),
  estimated_grams: z.number().positive(),
  calories_per_100g: z.number().nonneg(),
  protein_per_100g: z.number().nonneg(),
  fat_per_100g: z.number().nonneg(),
  carbs_per_100g: z.number().nonneg(),
  note: z.string().optional().default(''),
});

const ResultSchema = z.object({
  confidence: z.enum(['low','medium','high']),
  items: z.array(ItemSchema).min(1),
});

export async function POST(req: Request) {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 });

    const { image } = await req.json() as { image: string };
    if (!image) return NextResponse.json({ error: 'No image provided.' }, { status: 400 });

    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } },
          { type: 'text', text: `Analyze this meal photo and return ONLY valid JSON with no markdown:
{
  "confidence": "low"|"medium"|"high",
  "items": [{
    "name": "string",
    "estimated_grams": number,
    "calories_per_100g": number,
    "protein_per_100g": number,
    "fat_per_100g": number,
    "carbs_per_100g": number,
    "note": "string"
  }]
}
Base grams on visible portion size. Use standard nutritional values per 100g.` }
        ]
      }]
    });

    const text = msg.content.find(b => b.type === 'text')?.text ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = ResultSchema.parse(JSON.parse(clean));
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
