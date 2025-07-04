export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import dbConnect from "@/lib/db";
import Case from "@/lib/models/Case";
import User from "@/lib/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { initializeEmailService } from "@/lib/email-service";

const bucketName = process.env.GCLOUD_STORAGE_BUCKET!;

// Use GOOGLE_APPLICATION_CREDENTIALS if set, else use env vars
const storage = new Storage(
  process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? undefined
    : {
        projectId: process.env.GCLOUD_PROJECT_ID,
        credentials: {
          client_email: process.env.GCLOUD_CLIENT_EMAIL,
          private_key: process.env.GCLOUD_PRIVATE_KEY?.replace(/\n/g, "\n"),
        },
      }
);
const bucket = storage.bucket(bucketName);

export async function POST(request: NextRequest) {
  // Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const formData = await request.formData();
  const file = formData.get("file");
  const caseId = formData.get("caseId");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!caseId || typeof caseId !== "string") {
    return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 });
  }

  // Prepare file for upload
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/\s+/g, "_");
  const timestamp = Date.now();
  const gcsObject = `cases/${caseId}/${timestamp}_${safeName}`;
  const gcsFile = bucket.file(gcsObject);

  try {
    await gcsFile.save(buffer, {
      contentType: file.type,
      resumable: false,
    });
    // Generate a signed URL valid for 24 hours
    const [signedUrl] = await gcsFile.getSignedUrl({
      action: "read",
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Fetch case and users for email notification
    const caseDoc = await Case.findById(caseId).lean() as any;
    if (!caseDoc) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }
    const client = await User.findById(caseDoc.clientId).lean() as any;
    const advocate = await User.findById(caseDoc.advocateId).lean() as any;

    // Update case in MongoDB
    const docMeta = {
      name: file.name,
      type: file.type,
      size: file.size,
      url: signedUrl,
      gcsPath: gcsObject, // for backward compatibility
      gcsObject, // explicit object name for deletion
      uploadedAt: new Date(),
      uploadedBy: session.user.id,
    };
    await Case.findByIdAndUpdate(
      caseId,
      { $push: { documents: docMeta } },
      { new: true }
    );

    // Send email notification to client and advocate
    try {
      // Check if email configuration is available
      const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;
      const emailPort = process.env.EMAIL_PORT || process.env.SMTP_PORT;
      const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
      const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
      const emailSecure = process.env.EMAIL_SECURE || process.env.SMTP_SECURE;

      if (emailHost && emailPort && emailUser && emailPass) {
        const emailService = initializeEmailService({
          host: emailHost,
          port: parseInt(emailPort),
          secure: emailSecure === 'true',
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });
        const recipients: string[] = [];
        if (client?.email) recipients.push(client.email);
        if (advocate?.email) recipients.push(advocate.email);
        if (recipients.length > 0) {
          for (const email of recipients) {
            await emailService.sendDocumentNotification(email, {
              caseNumber: caseDoc.caseNumber,
              caseTitle: caseDoc.title,
              documentName: file.name,
              documentType: file.type,
              uploadedBy: session.user.name || session.user.email,
              uploadedAt: new Date(),
            });
          }
        }
      } else {
        console.warn('Email configuration not found. Document notification not sent.');
      }
    } catch (emailError) {
      console.error('Failed to send document notification email:', emailError);
      // Don't fail the upload if email fails
    }

    return NextResponse.json({ document: docMeta }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
} 