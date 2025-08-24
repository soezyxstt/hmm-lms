// ~/app/api/documents/[id]/route.ts (updated)
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { r2Client, GetObjectCommand, R2_BUCKET } from "~/lib/r2-client";
import { Role } from "@prisma/client";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const documentId = id;
    const url = new URL(request.url);
    const action = url.searchParams.get("action") ?? "view"; // 'view' or 'download'

    const document = await db.document.findUnique({
      where: { id: documentId },
      include: {
        course: {
          include: {
            members: {
              where: { id: session.user.id },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    if (!document.isActive) {
      return new NextResponse("Document is not available", { status: 410 });
    }

    const isEnrolled = document.course.members.length > 0;
    const isAdmin = session.user.role === Role.ADMIN; // This matches your adminProcedure logic

    if (!isEnrolled && !isAdmin) {
      return new NextResponse("Access denied", { status: 403 });
    }

    const getCommand = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: document.key,
    });

    const response = await r2Client.send(getCommand);

    if (!response.Body) {
      return new NextResponse("File not found in storage", { status: 404 });
    }

    // Log access
    await db.documentAccess.create({
      data: {
        documentId: document.id,
        userId: session.user.id,
        action: action === "download" ? "DOWNLOAD" : "VIEW",
        ipAddress:
          request.headers.get("x-forwarded-for") ??
          request.headers.get("x-real-ip") ??
          "unknown",
        userAgent: request.headers.get("user-agent") ?? "unknown",
      },
    });

    // Update counters
    if (action === "download") {
      await db.document.update({
        where: { id: document.id },
        data: { downloads: { increment: 1 } },
      });
    } else {
      await db.document.update({
        where: { id: document.id },
        data: { views: { increment: 1 } },
      });
    }

    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const result: ReadableStreamReadResult<Uint8Array> = await reader.read();
      if (result.done) break;
      chunks.push(result.value);
    }

    const buffer = Buffer.concat(chunks);

    const headers = new Headers();
    headers.set("Content-Type", document.mimeType);
    headers.set("Content-Length", document.size.toString());

    if (action === "download") {
      headers.set(
        "Content-Disposition",
        `attachment; filename="${document.filename}"`,
      );
    } else {
      headers.set(
        "Content-Disposition",
        `inline; filename="${document.filename}"`,
      );
    }

    headers.set("Cache-Control", "private, max-age=3600");
    headers.set("ETag", `"${document.id}-${document.updatedAt.getTime()}"`);

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error("Document serving error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
