// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { Upload } from "@aws-sdk/lib-storage";
import s3Client from "~/lib/s3-client"; // Your S3 client config
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const key = `resources/${randomUUID()}-${file.name.replace(/\s/g, "_")}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
        ACL: "public-read",
      },
    });

    const uploadResult = await upload.done();

    // Return key, filename, size, and mimeType to the client
    return NextResponse.json({
      key: uploadResult.Key,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      CDNurl: uploadResult.Location
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
