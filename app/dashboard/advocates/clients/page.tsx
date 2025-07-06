"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Eye, Trash2, FileText, Hash, BadgeCheck, Calendar, User, Building, Download, FileX, Clock, FileSearch, FileCheck } from "lucide-react";
import NewClientForm from "@/components/forms/NewClientForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Case {
  _id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface CaseDetails {
  _id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  description?: string;
  clientName?: string;
  courtName?: string;
  courtLocation?: string;
  judgeName?: string;
  opposingParty?: string;
  opposingLawyer?: string;
  filingDate?: string;
  nextHearingDate?: string;
  deadlineDate?: string;
  closedDate?: string;
  stage?: string;
  particulars?: string;
  year?: number;
  fees?: {
    currency: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
  };
  documents?: {
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedAt: string;
  }[];
  notes?: {
    content: string;
    isPrivate: boolean;
    createdAt: string;
  }[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewCasesClient, setViewCasesClient] = useState<Client | null>(null);
  const [clientCases, setClientCases] = useState<Case[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [viewCaseDetails, setViewCaseDetails] = useState<CaseDetails | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/clients?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch clients");
      setClients(data.clients || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line
  }, [page, limit, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleCreateClient = () => {
    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchClients();
  };

  const handleViewCases = async (client: Client) => {
    setViewCasesClient(client);
    setCasesLoading(true);
    try {
      const params = new URLSearchParams({
        clientId: client._id,
        limit: "50",
      });
      const res = await fetch(`/api/cases?${params.toString()}`);
      const data = await res.json();
      setClientCases(data.cases || []);
    } catch (err: unknown) {
      setClientCases([]);
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setCasesLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClient) return;
    setDeleteLoading(true);
    setDeleteError("");
    setDeleteSuccess("");
    try {
      const res = await fetch(`/api/clients?id=${deleteClient._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete client");
      setDeleteSuccess("Client and all related cases deleted successfully.");
      setDeleteClient(null);
      fetchClients();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete client");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Status color utility function
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_hold': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'settled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dismissed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Priority color utility function
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleViewCase = (caseData: Case) => {
    // Find the full case details from clientCases (if available)
    const details = clientCases.find(c => c._id === caseData._id);
    setViewCaseDetails(details || caseData);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'application/pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'application/msword': case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'application/vnd.ms-excel': case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': return <FileText className="h-5 w-5 text-green-500" />;
      case 'application/vnd.ms-powerpoint': case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': return <FileText className="h-5 w-5 text-purple-500" />;
      case 'image/jpeg': case 'image/png': case 'image/gif': return <FileText className="h-5 w-5 text-indigo-500" />;
      case 'text/plain': return <FileText className="h-5 w-5 text-gray-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Clients</h1>
      <form onSubmit={handleSearch} className="flex gap-2 items-center max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search by name, email, or phone"
          className="pl-4"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <Button type="submit">Search</Button>
        <Button type="button" variant="default" className="ml-auto" onClick={handleCreateClient}>
          <Plus className="w-4 h-4 mr-1" /> Create Client
        </Button>
      </form>
      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-red-500 py-8 text-center">{error}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-background shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Cases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">No clients found.</TableCell>
                </TableRow>
              ) : (
                clients.map(client => (
                  <TableRow key={client._id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge className={client.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleViewCases(client)}>
                        <Eye className="w-4 h-4 mr-1" /> View Cases
                      </Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => { setDeleteClient(client); handleViewCases(client); }}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div>
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
        <div>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            {[10, 20, 50].map(opt => (
              <option key={opt} value={opt}>{opt} per page</option>
            ))}
          </select>
        </div>
      </div>
      {/* Create Client Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          <NewClientForm onSuccess={handleCreateSuccess} onClose={handleCloseCreateForm} />
        </DialogContent>
      </Dialog>
      {/* View Cases Dialog */}
      <Dialog open={!!viewCasesClient} onOpenChange={() => setViewCasesClient(null)}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Cases for {viewCasesClient?.name}
            </DialogTitle>
          </DialogHeader>
          {casesLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading cases...</div>
          ) : clientCases.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No cases found for this client.</div>
          ) : (
            <div className="rounded-lg border bg-background shadow w-full overflow-x-auto">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientCases.map(c => (
                    <TableRow key={c._id}>
                      <TableCell className="font-medium">{c.caseNumber}</TableCell>
                      <TableCell className="truncate max-w-[8rem]" title={c.title}>{c.title}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(c.status)} border`}>{c.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPriorityColor(c.priority)} border`}>{c.priority}</Badge>
                      </TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewCase(c)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View Case
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* View Case Details Dialog */}
      <Dialog open={!!viewCaseDetails} onOpenChange={() => setViewCaseDetails(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              Case Details
            </DialogTitle>
          </DialogHeader>
          {viewCaseDetails && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="client">Client & Court</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="documents">Additionals</TabsTrigger>
              </TabsList>
              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 px-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><b>Case Number:</b> {viewCaseDetails.caseNumber}</div>
                  <div><b>Title:</b> {viewCaseDetails.title}</div>
                  <div><b>Status:</b> <Badge className={getStatusColor(viewCaseDetails.status)}>{viewCaseDetails.status}</Badge></div>
                  <div><b>Priority:</b> <Badge className={getPriorityColor(viewCaseDetails.priority)}>{viewCaseDetails.priority}</Badge></div>
                  <div><b>Stage:</b> {viewCaseDetails.stage || 'Not set'}</div>
                  <div><b>Year:</b> {viewCaseDetails.year || 'Not set'}</div>
                  <div><b>Created At:</b> {viewCaseDetails.createdAt ? new Date(viewCaseDetails.createdAt).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                  <b>Description:</b>
                  <p className="mt-1 text-sm text-muted-foreground">{viewCaseDetails.description}</p>
                </div>
                <div>
                  <b>Particulars:</b>
                  <p className="mt-1 text-sm text-muted-foreground">{viewCaseDetails.particulars || 'Not set'}</p>
                </div>
              </TabsContent>
              {/* Client & Court Tab */}
              <TabsContent value="client" className="space-y-4 px-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><b>Client Name:</b> {viewCaseDetails.clientName || viewCasesClient?.name}</div>
                  <div><b>Court Name:</b> {viewCaseDetails.courtName || '-'}</div>
                  <div><b>Court Location:</b> {viewCaseDetails.courtLocation || '-'}</div>
                  <div><b>Judge Name:</b> {viewCaseDetails.judgeName || '-'}</div>
                  <div><b>Opposing Party:</b> {viewCaseDetails.opposingParty || '-'}</div>
                  <div><b>Opposing Lawyer:</b> {viewCaseDetails.opposingLawyer || '-'}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><b>Filing Date:</b> {viewCaseDetails.filingDate ? new Date(viewCaseDetails.filingDate).toLocaleDateString() : '-'}</div>
                  <div><b>Next Hearing Date:</b> {viewCaseDetails.nextHearingDate ? new Date(viewCaseDetails.nextHearingDate).toLocaleDateString() : '-'}</div>
                  <div><b>Deadline Date:</b> {viewCaseDetails.deadlineDate ? new Date(viewCaseDetails.deadlineDate).toLocaleDateString() : '-'}</div>
                  <div><b>Closed Date:</b> {viewCaseDetails.closedDate ? new Date(viewCaseDetails.closedDate).toLocaleDateString() : '-'}</div>
                </div>
              </TabsContent>
              {/* Financial Tab */}
              <TabsContent value="financial" className="space-y-4 px-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><b>Total Amount:</b> {viewCaseDetails.fees?.currency || 'USD'} {viewCaseDetails.fees?.totalAmount || 0}</div>
                  <div><b>Paid Amount:</b> {viewCaseDetails.fees?.currency || 'USD'} {viewCaseDetails.fees?.paidAmount || 0}</div>
                  <div><b>Pending Amount:</b> {viewCaseDetails.fees?.currency || 'USD'} {viewCaseDetails.fees?.pendingAmount || 0}</div>
                  <div><b>Currency:</b> {viewCaseDetails.fees?.currency || 'USD'}</div>
                </div>
              </TabsContent>
              {/* Documents & Notes Tab */}
              <TabsContent value="documents" className="space-y-6">
                {/* Documents Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Documents</h3>
                    <Badge variant="secondary" className="ml-2">
                      {viewCaseDetails.documents?.length || 0}
                    </Badge>
                  </div>
                  {viewCaseDetails.documents && viewCaseDetails.documents.length > 0 ? (
                    <div className="grid gap-3">
                      {viewCaseDetails.documents.map((doc, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {getFileIcon(doc.type)}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm truncate" title={doc.name}>
                                      {doc.name}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                      {doc.type.split('/')[1]?.toUpperCase() || doc.type}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '-'}
                                    </span>
                                    <span>{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : ''}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 ml-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  asChild
                                  title="Download Document"
                                  className="h-8 w-8 p-0"
                                >
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center">
                        <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Documents</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          No documents have been uploaded for this case yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <Separator />
                {/* Notes Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Notes</h3>
                    <Badge variant="secondary" className="ml-2">
                      {viewCaseDetails.notes?.length || 0}
                    </Badge>
                  </div>
                  {viewCaseDetails.notes && viewCaseDetails.notes.length > 0 ? (
                    <div className="grid gap-3">
                      {viewCaseDetails.notes.map((note, idx) => (
                        <Card key={idx} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-muted-foreground mb-2">
                                  {note.content}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : '-'}
                                  </span>
                                  {note.isPrivate && (
                                    <Badge variant="outline" className="text-xs">
                                      Private
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-6 text-center">
                        <FileCheck className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No notes have been added to this case.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Client Confirmation Dialog */}
      <Dialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          {deleteError && <div className="text-red-500 mb-2">{deleteError}</div>}
          {deleteSuccess && <div className="text-green-600 mb-2">{deleteSuccess}</div>}
          <div>Are you sure you want to delete <b>{deleteClient?.name}</b> and <b>all their cases</b>? This action cannot be undone.</div>
          <div className="mt-4">
            <div className="font-semibold mb-2">Cases to be deleted:</div>
            {casesLoading ? (
              <div className="py-4 text-muted-foreground">Loading cases...</div>
            ) : clientCases.length === 0 ? (
              <div className="py-4 text-muted-foreground">No cases found for this client.</div>
            ) : (
              <ul className="list-disc pl-6">
                {clientCases.map(c => (
                  <li key={c._id}>{c.caseNumber} - {c.title}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDeleteClient(null)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteClient} disabled={deleteLoading}>
              {deleteLoading ? "Deleting..." : "Delete Client & Cases"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 