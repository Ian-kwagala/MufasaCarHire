import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteReview, upsertReview } from "@/lib/db";

/**
 * PATCH /api/reviews/[id]
 * Protected endpoint to edit or toggle visibility of a client review.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const reviewId = Number(id);
  if (Number.isNaN(reviewId)) {
    return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
  }

  const body = await request.json();
  const review = upsertReview({ ...body, id: reviewId });
  return NextResponse.json({ review });
}

/**
 * DELETE /api/reviews/[id]
 * Protected endpoint to delete a review.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const reviewId = Number(id);
  if (Number.isNaN(reviewId)) {
    return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
  }

  deleteReview(reviewId);
  return NextResponse.json({ ok: true });
}
