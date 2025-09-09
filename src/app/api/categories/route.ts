/**
 * Categories API Route - Basic Implementation
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
    message: "Categories endpoint ready"
  });
}
