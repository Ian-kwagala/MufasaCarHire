import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getPackages, upsertPackage } from "@/lib/db";

/**
 * GET /api/packages
 * Returns pricing packages for the rates table and admin editor.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get("all") === "1";

  if (includeAll) {
    const session = await getAdminSession();
    if (session) {
      return NextResponse.json({ packages: getPackages({ activeOnly: false }) });
    }
  }

  return NextResponse.json({ packages: getPackages({ activeOnly: true }) });
}

/**
 * POST /api/packages
 * Protected endpoint to create a new pricing package.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const pkg = upsertPackage(body);
  return NextResponse.json({ package: pkg }, { status: 201 });
}
