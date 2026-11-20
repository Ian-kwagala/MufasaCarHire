import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getReviews, upsertReview } from "@/lib/db";

/**
 * GET /api/reviews
 * Returns active client reviews for the website, or all reviews for Admin.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get("all") === "1";

  if (includeAll) {
    const session = await getAdminSession();
    if (session) {
      return NextResponse.json({ reviews: getReviews({ activeOnly: false }) });
    }
  }

  return NextResponse.json({ reviews: getReviews({ activeOnly: true }) });
}

/**
 * POST /api/reviews
 * Protected endpoint for Admin to add a new customer testimonial.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const review = upsertReview(body);
  return NextResponse.json({ review }, { status: 201 });
}
