
import { NextRequest, NextResponse } from 'next/server';
import { SpoonacularService } from '@/services/spoonacularService';
import { getCachedResults, setCachedResults } from '@/lib/cache/spoonacularCache';
import { checkRateLimit, getRateLimitInfo } from '@/middleware/rateLimiter';

const service = new SpoonacularService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';
  const cuisine = searchParams.get('cuisine') || undefined;
  const diet = searchParams.get('diet') || undefined;
  const intolerances = searchParams.get('intolerances') || undefined;

  const filters: any = {};
  if (cuisine) filters.cuisine = cuisine;
  if (diet) filters.diet = diet;
  if (intolerances) filters.intolerances = intolerances;

  // IP für Rate Limiting ermitteln
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    const info = getRateLimitInfo(ip);
    return NextResponse.json({ error: 'Rate limit exceeded', remaining: info.remaining, reset: info.reset }, { status: 429 });
  }

  // Cache-Key generieren
  const cacheKey = JSON.stringify({ query, ...filters });
  const cached = getCachedResults(cacheKey);
  if (cached) {
    return NextResponse.json({ results: cached, cached: true });
  }

  try {
    const results = await service.searchRecipes(query, filters);
    setCachedResults(cacheKey, results);
    return NextResponse.json({ results, cached: false });
  } catch (error: any) {
    return NextResponse.json({ error: 'Spoonacular API error', details: error?.message }, { status: 500 });
  }
}
