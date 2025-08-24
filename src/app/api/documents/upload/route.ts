// ~/app/api/documents/upload/route.ts (updated)
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { r2Client, PutObjectCommand, R2_BUCKET } from "~/lib/r2-client";
import { validateFile, generateFileKey } from "~/lib/file-utils";
import { type DocumentType, Role } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin (matching your adminProcedure logic)
    if (!session || session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const courseId = formData.get("courseId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const documentType = formData.get("type") as string;

    if (!file || !courseId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "File validation failed", details: validation.errors },
        { status: 400 },
      );
    }

    const fileKey = generateFileKey(
      courseId,
      file.name,
      validation.fileInfo.type,
    );

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        originalName: file.name,
        uploadedBy: session.user.id,
        courseId: courseId,
      },
    });

    await r2Client.send(uploadCommand);

    const document = await db.document.create({
      data: {
        title,
        description,
        filename: file.name,
        key: fileKey,
        mimeType: file.type,
        size: file.size,
        type: (documentType || validation.fileInfo.type) as DocumentType,
        courseId,
        uploadedById: session.user.id,
      },
      include: {
        course: {
          select: { title: true, classCode: true },
        },
        uploadedBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        filename: document.filename,
        size: document.size,
        type: document.type,
        mimeType: document.mimeType,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
