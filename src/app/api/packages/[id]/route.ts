import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deletePackage, upsertPackage } from "@/lib/db";

/**
 * PATCH /api/packages/[id]
 * Protected endpoint to update a pricing package.
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
  const pkgId = Number(id);
  if (Number.isNaN(pkgId)) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  const body = await request.json();
  const pkg = upsertPackage({ ...body, id: pkgId });
  return NextResponse.json({ package: pkg });
}

/**
 * DELETE /api/packages/[id]
 * Protected endpoint to delete a pricing package.
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
  const pkgId = Number(id);
  if (Number.isNaN(pkgId)) {
    return NextResponse.json({ error: "Invalid package ID" }, { status: 400 });
  }

  deletePackage(pkgId);
  return NextResponse.json({ ok: true });
}
