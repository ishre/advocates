"use client";
import React from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, MessageSquare } from "lucide-react";
import Link from "next/link";

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

export default function ClientCasesPage() {
  const { data, error, isLoading } = useSWR("/api/client/cases", fetcher);

  return (
    <div className="px-4 py-8 w-full">
      <h2 className="text-2xl font-semibold mb-1">My Cases</h2>
      <p className="text-muted-foreground mb-6">Track the progress of your legal cases</p>
      <div className="overflow-x-auto rounded-lg border w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Case Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Next Hearing</TableHead>
              <TableHead>Court</TableHead>
              <TableHead>Advocate</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={8} className="text-destructive">Failed to load cases</TableCell>
              </TableRow>
            )}
            {data?.cases?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">No cases found.</TableCell>
              </TableRow>
            )}
            {data?.cases?.map((c: any) => (
              <TableRow key={c._id}>
                <TableCell className="font-medium">{c.caseNumber}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>
                  <Badge className={`capitalize px-3 py-1 font-medium rounded-full ${statusColor(c.status)}`}>{c.status}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`capitalize px-3 py-1 font-medium rounded-full ${priorityColor(c.priority)}`}>{c.priority}</Badge>
                </TableCell>
                <TableCell>{c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString() : "Not scheduled"}</TableCell>
                <TableCell>{c.courtName}</TableCell>
                <TableCell>{c.advocate?.name || "-"}</TableCell>
                <TableCell className="flex gap-2">
                  <Link href={`/dashboard/clients/cases/${c._id}`}>
                    <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" /> View</Button>
                  </Link>
                  <Button size="sm" variant="secondary" disabled><MessageSquare className="w-4 h-4 mr-1" /> Message</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 