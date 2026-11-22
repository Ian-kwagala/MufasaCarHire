import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

const ALLOWED_IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB max image size
const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25 MB max video size

/**
 * POST /api/upload
 * Protected endpoint that saves uploaded brand logos, vehicle photos, or showcase videos
 * to public/uploads/ and returns the public URL path.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const kind = String(formData.get("kind") ?? "asset").replace(/[^a-z0-9_-]/gi, "");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase() || ".png";
    const isVideo = ALLOWED_VIDEO_EXTENSIONS.has(ext);
    const isImage = ALLOWED_IMAGE_EXTENSIONS.has(ext);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Upload PNG, JPG, WebP, SVG images or MP4/WebM videos.",
        },
        { status: 400 }
      );
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: isVideo
            ? "Video is too large. Maximum allowed size is 25 MB."
            : "Image is too large. Maximum allowed size is 5 MB.",
        },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueName = `${kind}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
    const targetPath = path.join(uploadsDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(targetPath, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueName}` }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
