export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Case from "@/lib/models/Case";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Storage } from "@google-cloud/storage";
import User from "@/lib/models/User";
import { initializeEmailService } from "@/lib/email-service";
import { deleteGCSFile, deleteDocumentFiles } from "@/lib/gcs-cleanup";

const bucketName = process.env.GCLOUD_STORAGE_BUCKET!;
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

export async function GET(request: NextRequest) {
  // Authenticate user
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const caseId = searchParams.get("caseId");

  // Build MongoDB aggregation pipeline
  const matchStage = {} as Record<string, any>;
  if (caseId) {
    matchStage["_id"] = caseId;
  }
  // Only match cases with at least one document
  matchStage["documents.0"] = { $exists: true };

  // Search filter
  let searchStage = [] as any[];
  if (search) {
    searchStage = [
      {
        $match: {
          $or: [
            { "documents.name": { $regex: search, $options: "i" } },
            { "documents.type": { $regex: search, $options: "i" } },
            { caseNumber: { $regex: search, $options: "i" } },
            { clientName: { $regex: search, $options: "i" } },
          ],
        },
      },
    ];
  }

  const pipeline = [
    { $match: matchStage },
    ...searchStage,
    { $unwind: "$documents" },
    { $sort: { "documents.uploadedAt": -1 } },
    {
      $facet: {
        documents: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              caseId: "$_id",
              caseNumber: 1,
              caseTitle: "$title",
              clientName: 1,
              document: "$documents",
            },
          },
        ],
        totalCount: [ { $count: "count" } ],
      },
    },
  ];

  try {
    const result = await Case.aggregate(pipeline);
    const documents = result[0]?.documents || [];
    const total = result[0]?.totalCount?.[0]?.count || 0;
    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const { caseId, documentName } = await request.json();
  if (!caseId || !documentName) {
    return NextResponse.json({ error: "Missing caseId or documentName" }, { status: 400 });
  }
  // Find the case
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  // Find the document in the case
  const doc = caseDoc.documents.find((d: any) => d.name === documentName);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  // Remove from MongoDB
  await Case.findByIdAndUpdate(caseId, { $pull: { documents: { name: documentName } } });
  // Delete from GCS
  try {
    // Use gcsObject if available, then gcsPath, then fallback to extracting from URL
    let objectName = doc.gcsObject || doc.gcsPath;
    if (!objectName && doc.url) {
      // Extract object name from signed URL (legacy fallback)
      const match = doc.url.match(/storage\.googleapis\.com\/[^/]+\/([^?]+)/);
      if (match) {
        objectName = match[1];
      }
    }
    
    if (objectName) {
      const deleted = await deleteGCSFile(objectName);
      if (deleted) {
        console.log(`Deleted GCS file: ${objectName}`);
      }
    } else {
      // Try to delete using document name as fallback
      const deletedCount = await deleteDocumentFiles(caseId, [doc.name]);
      if (deletedCount > 0) {
        console.log(`Deleted ${deletedCount} document files for document: ${doc.name}`);
      }
    }
  } catch (err) {
    console.error('Failed to delete document from GCS:', err);
    // Log but don't fail if GCS delete fails
  }
  // Send email notification to client and advocate
  try {
    const client = await User.findById(caseDoc.clientId).lean() as any;
    const advocate = await User.findById(caseDoc.advocateId).lean() as any;
    
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
      for (const email of recipients) {
        await emailService.sendDocumentDeletionNotification(email, {
          caseNumber: caseDoc.caseNumber,
          caseTitle: caseDoc.title,
          documentName: doc.name,
          documentType: doc.type,
          deletedBy: session.user.name || session.user.email,
          deletedAt: new Date(),
        });
      }
    } else {
      console.warn('Email configuration not found. Document deletion notification not sent.');
    }
  } catch (emailError) {
    console.error('Failed to send document deletion notification email:', emailError);
    // Don't fail the request if email fails
  }
  return NextResponse.json({ message: "Document deleted" });
} 