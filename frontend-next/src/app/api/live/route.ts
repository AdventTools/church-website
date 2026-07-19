import { NextResponse } from 'next/server';
import { getLiveStatus } from '@/lib/youtube';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getLiveStatus());
}
