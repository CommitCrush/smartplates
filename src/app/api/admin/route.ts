import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { message: 'Admin API endpoint - not implemented yet' },
    { status: 501 }
  );
}

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { message: 'Admin API endpoint - not implemented yet' },
    { status: 501 }
  );
}
