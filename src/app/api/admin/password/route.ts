import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, verifyPassword } from "@/lib/auth";
import { getAdminUserByUsername, updateAdminPassword } from "@/lib/db";

/**
 * POST /api/admin/password
 * Allows the signed-in admin to change their password safely.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const user = getAdminUserByUsername(session.username);
  if (!user || !verifyPassword(currentPassword, user.password_hash)) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  updateAdminPassword(session.username, newPassword);
  return NextResponse.json({ ok: true });
}
