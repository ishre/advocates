"use client";
import React from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, File } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

function statusColor(status: string) {
  switch (status) {
    case "active": return "bg-green-100 text-green-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "closed": return "bg-gray-200 text-gray-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function priorityColor(priority: string) {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "low": return "bg-gray-100 text-gray-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function getFileIcon(type: string) {
  if (type?.toLowerCase().includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  if (type?.toLowerCase().includes("doc")) return <FileText className="w-5 h-5 text-blue-500" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

export default function ClientCaseDetailsPage() {
  const params = useParams();
  const caseId = params?.id as string;
  const { data, error, isLoading } = useSWR(caseId ? `/api/client/cases/${caseId}` : null, fetcher);
  const caseData = data?.case;

  // Debug: Log advocate data to console
  React.useEffect(() => {
    if (caseData?.advocate) {
      console.log('Advocate data:', caseData.advocate);
    }
  }, [caseData]);

  return (
    <div className="w-full px-2 sm:px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Case Details</h1>
      <p className="text-muted-foreground mb-8">All information about your case, advocate, and documents.</p>
      {isLoading && <Skeleton className="h-32 w-full" />}
      {error && <div className="text-destructive">Failed to load case details</div>}
      {caseData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 w-full">
          {/* Left: Case Details */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Case Overview */}
            <section>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h2 className="text-2xl font-semibold tracking-tight">{caseData.title}</h2>
                <Badge className={`capitalize px-3 py-1 font-medium rounded-full ${statusColor(caseData.status)}`}>{caseData.status}</Badge>
                <Badge className={`capitalize px-3 py-1 font-medium rounded-full ${priorityColor(caseData.priority)}`}>{caseData.priority}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                <div>
                  <div className="mb-2"><span className="font-semibold">Case Number:</span> {caseData.caseNumber}</div>
                  <div className="mb-2"><span className="font-semibold">Court:</span> {caseData.courtName}</div>
                  <div className="mb-2"><span className="font-semibold">Case Type:</span> {caseData.caseType}</div>
                  <div className="mb-2"><span className="font-semibold">Stage:</span> {caseData.stage}</div>
                  <div className="mb-2"><span className="font-semibold">Particulars:</span> {caseData.particulars}</div>
                  <div className="mb-2"><span className="font-semibold">Year:</span> {caseData.year}</div>
                  <div className="mb-2"><span className="font-semibold">Filing Date:</span> {caseData.filingDate ? new Date(caseData.filingDate).toLocaleDateString() : "-"}</div>
                  <div className="mb-2"><span className="font-semibold">Next Hearing:</span> {caseData.nextHearingDate ? new Date(caseData.nextHearingDate).toLocaleDateString() : "Not scheduled"}</div>
                </div>
                <div>
                  <div className="mb-2"><span className="font-semibold">Description:</span> {caseData.description}</div>
                </div>
              </div>
            </section>
            <Separator />
            {/* Documents */}
            <section>
              <h3 className="font-semibold text-lg mb-3">Documents</h3>
              {caseData.documents?.length === 0 && <div className="text-muted-foreground">No documents uploaded for this case.</div>}
              <ul className="space-y-2">
                {caseData.documents?.map((doc: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 p-2 border rounded-lg bg-muted/50">
                    {getFileIcon(doc.type)}
                    <span className="flex-1 font-medium truncate" title={doc.name}>{doc.name}</span>
                    <span className="text-xs text-muted-foreground">{doc.type} • {Math.round(doc.size / 1024)} KB</span>
                    <Button asChild size="sm" variant="outline">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="w-4 h-4 mr-1" /> Download
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          {/* Right: Advocate Card */}
          <aside className="w-full max-w-md mx-auto lg:mx-0">
            <div className="rounded-2xl shadow-xl border border-primary/20 bg-background p-8 flex flex-col items-center gap-3">
              <Avatar className="w-28 h-28 mb-3">
                <AvatarImage 
                  src={caseData.advocate?.image || undefined} 
                  alt={caseData.advocate?.name || "Advocate"} 
                />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary font-bold">
                  {caseData.advocate?.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="text-xl font-bold text-center">{caseData.advocate?.name || "Advocate"}</div>
              <div className="text-sm text-muted-foreground mb-2 text-center">Advocate</div>
              <div className="text-sm mb-1"><span className="font-semibold">Email:</span> {caseData.advocate?.email || "-"}</div>
              {/* Add phone or other contact info if available */}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
} 