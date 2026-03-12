import { NextRequest, NextResponse } from 'next/server';
import { checkDomains } from '@/lib/rdap/rdap-client';
import { domainSearchSchema } from '@/lib/validators/domain.schema';
import { generateSuggestions } from '@/lib/suggestions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = domainSearchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { domains } = validation.data;
    const results = await checkDomains(domains);

    // Generate suggestions for taken domains
    let suggestions: string[] = [];
    const takenResults = results.filter((r) => r.available === false);
    if (takenResults.length > 0) {
      // Use the first taken domain's name for suggestions
      const firstTaken = takenResults[0];
      const name = firstTaken.domain.split('.')[0];
      const takenTlds = takenResults.map((r) => r.tld);
      suggestions = generateSuggestions(name, takenTlds);
    }

    return NextResponse.json({ results, suggestions });
  } catch (error) {
    console.error('Domain check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
