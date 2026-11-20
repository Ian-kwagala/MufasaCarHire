import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getSiteSettings, updateSiteSettings } from "@/lib/db";

/**
 * GET /api/settings
 * Returns all public site settings (brand, WhatsApp numbers, rates, logo, promos).
 */
export async function GET() {
  const settings = getSiteSettings();
  return NextResponse.json({ settings });
}

/**
 * PUT /api/settings
 * Protected endpoint for the Admin Dashboard to update website content,
 * logo URL, WhatsApp numbers, self-drive rates, and office details.
 */
export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updated = updateSiteSettings(body);
  return NextResponse.json({ settings: updated });
}
