'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar
} from 'recharts';
import { 
  Calendar, 
  FileText, 
  Users, 
  Clock, 
  Upload,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import DashboardStatsCards from '@/components/DashboardStatsCards';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import NewCaseForm from '@/components/forms/NewCaseForm';
import NewClientForm from '@/components/forms/NewClientForm';
import Link from 'next/link';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Eye as EyeIcon } from 'lucide-react';

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
  description: string;
  caseType: string;
  status: string;
  priority: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  courtName: string;
  courtLocation: string;
  judgeName: string;
  opposingParty: string;
  opposingLawyer: string;
  filingDate: string;
  nextHearingDate: string;
  deadlineDate: string;
  closedDate: string;
  fees: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    currency: string;
  };
  assignedTo: string[];
  createdBy: string;
  documents: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  notes: Array<{
    content: string;
    createdBy: string;
    createdAt: string;
    isPrivate: boolean;
  }>;
  tasks: Array<{
    title: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
  registrationDate: string;
  previousDate: string;
  stage: string;
  particulars: string;
  year: number;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  cases: {
    total: number;
    active: number;
    closed: number;
    pending: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
  };
  financial: {
    totalFees: number;
    totalPaid: number;
    totalPending: number;
  };
  recent: Case[];
  upcoming: Case[];
}

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    cases: { total: 0, active: 0, closed: 0, pending: 0 },
    clients: { total: 0, active: 0, inactive: 0 },
    financial: { totalFees: 0, totalPaid: 0, totalPending: 0 },
    recent: [],
    upcoming: [],
  });
  const [loading, setLoading] = useState(true);
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [cases, setCases] = useState<Case[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [viewCase, setViewCase] = useState<Case | null>(null);
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [editForm, setEditForm] = useState<Partial<Case> | null>(null);
  const [deleteCase, setDeleteCase] = useState<Case | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [viewCasesClient, setViewCasesClient] = useState<Client | null>(null);
  const [clientCases, setClientCases] = useState<Case[]>([]);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [viewDoc, setViewDoc] = useState<{ url: string; name: string; type: string } | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Only redirect if user needs to set password and is NOT already on the profile password setup page
    if (
      session?.user &&
      !(session.user as any).hasPassword &&
      typeof window !== 'undefined'
    ) {
      const currentPath = window.location.pathname + window.location.search;
      const isOnProfileSetup = currentPath.startsWith('/dashboard/advocates/profile') && currentPath.includes('setup=password');
      if (!isOnProfileSetup) {
        router.push('/dashboard/advocates/profile?tab=security&setup=password');
      }
    }
  }, [session, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard statistics
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    setCasesLoading(true);
    try {
      const res = await fetch('/api/cases?limit=100');
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases);
      }
    } catch {
      setCases([]);
    } finally {
      setCasesLoading(false);
    }
  };

  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const res = await fetch('/api/clients?limit=100');
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients);
      }
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchClients();
  }, []);

  const handleCaseCreated = () => {
    setOpenCaseDialog(false);
    fetchDashboardData();
    fetchCases();
  };

  const handleScheduleHearing = () => {
    // TODO: Implement hearing scheduling
    alert('Schedule Hearing functionality coming soon!');
  };

  const handleUploadDocument = () => {
    // TODO: Implement document upload
    alert('Upload Document functionality coming soon!');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const caseTypeData = [
    { type: 'Civil', cases: 25 },
    { type: 'Criminal', cases: 15 },
    { type: 'Family', cases: 20 },
    { type: 'Corporate', cases: 10 },
    { type: 'Property', cases: 8 },
  ];

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'settled': return 'bg-blue-100 text-blue-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  }

  const handleViewCase = (caseData: Case) => setViewCase(caseData);
  const handleEditCase = (caseData: Case) => { setEditCase(caseData); setEditForm({ ...caseData }); };
  const handleCloseView = () => setViewCase(null);
  const handleCloseEdit = () => setEditCase(null);
  const handleDeleteCase = async () => {
    if (!deleteCase) return;
    try {
      const response = await fetch(`/api/cases/${deleteCase._id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchCases();
        setDeleteCase(null);
      }
    } catch {
      // Optionally handle error
    }
  };

  const handleViewCases = async (client: Client) => {
    setViewCasesClient(client);
    setCasesLoading(true);
    try {
      const params = new URLSearchParams({ clientId: client._id, limit: '50' });
      const res = await fetch(`/api/cases?${params.toString()}`);
      const data = await res.json();
      setClientCases(data.cases || []);
    } catch {
      setClientCases([]);
    } finally {
      setCasesLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClient) return;
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
      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Failed to delete client");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <DashboardStatsCards stats={stats} formatCurrency={formatCurrency} />

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="hearings">Hearings</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Legal Case Manager</CardTitle>
              <CardDescription>Your comprehensive legal practice management solution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Dialog open={openCaseDialog} onOpenChange={setOpenCaseDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => setOpenCaseDialog(true)}>
                      <FileText className="h-6 w-6 mb-2" />
                      <span className="text-sm">New Case</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <NewCaseForm onClose={() => setOpenCaseDialog(false)} onSuccess={() => { setOpenCaseDialog(false); fetchDashboardData(); }} variant="dialog" />
                  </DialogContent>
                </Dialog>
                <Dialog open={openClientDialog} onOpenChange={setOpenClientDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-20 flex-col" onClick={() => setOpenClientDialog(true)}>
                      <Users className="h-6 w-6 mb-2" />
                      <span className="text-sm">Add Client</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <NewClientForm onClose={() => setOpenClientDialog(false)} onSuccess={() => { setOpenClientDialog(false); fetchDashboardData(); }} />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" className="h-20 flex-col" onClick={handleScheduleHearing}>
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="text-sm">Schedule Hearing</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col" onClick={handleUploadDocument}>
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-sm">Upload Document</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Cases
                <div className="flex gap-2">
                  <Dialog open={openCaseDialog} onOpenChange={setOpenCaseDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setOpenCaseDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Case
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <NewCaseForm onClose={() => setOpenCaseDialog(false)} onSuccess={handleCaseCreated} variant="dialog" />
                    </DialogContent>
                  </Dialog>
                  <Link href="/dashboard/advocates/cases">
                    <Button variant="secondary" size="sm">View All</Button>
                  </Link>
                </div>
              </CardTitle>
              <CardDescription>Manage and track your recent legal cases</CardDescription>
            </CardHeader>
            <CardContent>
              {casesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading cases...</div>
              ) : cases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No cases found. Create your first case to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border bg-background shadow">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Case Number</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cases.slice(0, 5).map((c, idx) => (
                        <TableRow key={c._id} className={idx % 2 === 0 ? 'bg-muted/50' : ''}>
                          <TableCell>{c.caseNumber}</TableCell>
                          <TableCell>{c.title}</TableCell>
                          <TableCell>{c.clientName}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(c.priority)}>{c.priority}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(c.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog open={!!viewCase && viewCase._id === c._id} onOpenChange={open => !open && handleCloseView()}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => handleViewCase(c)}><Eye className="w-4 h-4 mr-1" /> View</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Case Details</DialogTitle>
                                    <DialogDescription>Complete information for this case.</DialogDescription>
                                  </DialogHeader>
                                  {viewCase && (
                                    <Tabs defaultValue="basic" className="w-full">
                                      <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                        <TabsTrigger value="client">Client & Court</TabsTrigger>
                                        <TabsTrigger value="financial">Financial</TabsTrigger>
                                        <TabsTrigger value="documents">Additionals</TabsTrigger>
                                      </TabsList>
                                      <TabsContent value="basic" className="space-y-4 px-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div><b>Case Number:</b> {viewCase.caseNumber}</div>
                                          <div><b>Title:</b> {viewCase.title}</div>
                                          <div><b>Case Type:</b> {viewCase.caseType}</div>
                                          <div><b>Status:</b> <Badge className={getStatusColor(viewCase.status)}>{viewCase.status}</Badge></div>
                                          <div><b>Priority:</b> <Badge className={getPriorityColor(viewCase.priority)}>{viewCase.priority}</Badge></div>
                                          <div><b>Stage:</b> {viewCase.stage || 'Not set'}</div>
                                          <div><b>Year:</b> {viewCase.year || 'Not set'}</div>
                                          <div><b>Created At:</b> {formatDate(viewCase.createdAt)}</div>
                                        </div>
                                        <div>
                                          <b>Description:</b>
                                          <p className="mt-1 text-sm text-muted-foreground">{viewCase.description}</p>
                                        </div>
                                        <div>
                                          <b>Particulars:</b>
                                          <p className="mt-1 text-sm text-muted-foreground">{viewCase.particulars || 'Not set'}</p>
                                        </div>
                                      </TabsContent>
                                      <TabsContent value="client" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div><b>Client Name:</b> {viewCase.clientName}</div>
                                          <div><b>Client Email:</b> {viewCase.clientEmail}</div>
                                          <div><b>Client Phone:</b> {viewCase.clientPhone}</div>
                                          <div><b>Court Name:</b> {viewCase.courtName}</div>
                                          <div><b>Court Location:</b> {viewCase.courtLocation}</div>
                                          <div><b>Judge Name:</b> {viewCase.judgeName || 'Not set'}</div>
                                          <div><b>Opposing Party:</b> {viewCase.opposingParty || 'Not set'}</div>
                                          <div><b>Opposing Lawyer:</b> {viewCase.opposingLawyer || 'Not set'}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div><b>Registration Date:</b> {formatDate(viewCase.registrationDate)}</div>
                                          <div><b>Filing Date:</b> {formatDate(viewCase.filingDate)}</div>
                                          <div><b>Previous Date:</b> {formatDate(viewCase.previousDate)}</div>
                                          <div><b>Next Hearing Date:</b> {formatDate(viewCase.nextHearingDate)}</div>
                                          <div><b>Deadline Date:</b> {formatDate(viewCase.deadlineDate)}</div>
                                          <div><b>Closed Date:</b> {formatDate(viewCase.closedDate)}</div>
                                        </div>
                                      </TabsContent>
                                      <TabsContent value="financial" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div><b>Total Amount:</b> {viewCase.fees?.currency || 'USD'} {viewCase.fees?.totalAmount || 0}</div>
                                          <div><b>Paid Amount:</b> {viewCase.fees?.currency || 'USD'} {viewCase.fees?.paidAmount || 0}</div>
                                          <div><b>Pending Amount:</b> {viewCase.fees?.currency || 'USD'} {viewCase.fees?.pendingAmount || 0}</div>
                                          <div><b>Currency:</b> {viewCase.fees?.currency || 'USD'}</div>
                                        </div>
                                      </TabsContent>
                                      <TabsContent value="documents" className="space-y-4">
                                        <div>
                                          <b>Documents ({viewCase.documents?.length || 0}):</b>
                                          {viewCase.documents && viewCase.documents.length > 0 ? (
                                            <div className="mt-2 space-y-2">
                                              {viewCase.documents.map((doc: Case['documents'][number], idx: number) => (
                                                <div key={idx} className="text-sm p-2 bg-muted rounded flex items-center gap-2">
                                                  <Button variant="ghost" size="icon" onClick={() => setViewDoc({ url: doc.url, name: doc.name, type: doc.type })} title="View Document">
                                                    <EyeIcon className="w-5 h-5" />
                                                  </Button>
                                                  <span>{doc.name}</span>
                                                  <span className="ml-2 text-xs text-gray-500">({doc.type})</span>
                                                  <span className="ml-2 text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-sm text-muted-foreground">No documents uploaded</p>
                                          )}
                                        </div>
                                        <div>
                                          <b>Notes ({viewCase.notes?.length || 0}):</b>
                                          {viewCase.notes && viewCase.notes.length > 0 ? (
                                            <div className="mt-2 space-y-2">
                                              {viewCase.notes.map((note: Case['notes'][number], idx: number) => (
                                                <div key={idx} className="text-sm p-2 bg-muted rounded">
                                                  {note.content} - {new Date(note.createdAt).toLocaleDateString()}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-sm text-muted-foreground">No notes added</p>
                                          )}
                                        </div>
                                      </TabsContent>
                                    </Tabs>
                                  )}
                                  <DialogFooter>
                                    <DialogClose asChild>
                                      <Button variant="secondary">Close</Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Dialog open={!!editCase && editCase._id === c._id} onOpenChange={open => !open && handleCloseEdit()}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="secondary" onClick={() => handleEditCase(c)}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Case</DialogTitle>
                                    <DialogDescription>Edit all case details and save changes.</DialogDescription>
                                  </DialogHeader>
                                  {editForm && (
                                    <form className="space-y-4">
                                      <Tabs defaultValue="basic" className="w-full">
                                        <TabsList className="grid w-full grid-cols-4">
                                          <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                          <TabsTrigger value="client">Client & Court</TabsTrigger>
                                          <TabsTrigger value="financial">Financial</TabsTrigger>
                                          <TabsTrigger value="dates">Dates</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="basic" className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label htmlFor="caseNumber">Case Number</Label>
                                              <Input id="caseNumber" value={editForm.caseNumber} onChange={e => setEditForm({ ...editForm, caseNumber: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="title">Title</Label>
                                              <Input id="title" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="caseType">Case Type</Label>
                                              <Select value={editForm.caseType ?? undefined} onValueChange={val => setEditForm({ ...editForm, caseType: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="civil">Civil</SelectItem>
                                                  <SelectItem value="criminal">Criminal</SelectItem>
                                                  <SelectItem value="family">Family</SelectItem>
                                                  <SelectItem value="corporate">Corporate</SelectItem>
                                                  <SelectItem value="property">Property</SelectItem>
                                                  <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div>
                                              <Label htmlFor="status">Status</Label>
                                              <Select value={editForm.status ?? undefined} onValueChange={val => setEditForm({ ...editForm, status: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="active">Active</SelectItem>
                                                  <SelectItem value="closed">Closed</SelectItem>
                                                  <SelectItem value="pending">Pending</SelectItem>
                                                  <SelectItem value="on_hold">On Hold</SelectItem>
                                                  <SelectItem value="settled">Settled</SelectItem>
                                                  <SelectItem value="dismissed">Dismissed</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div>
                                              <Label htmlFor="priority">Priority</Label>
                                              <Select value={editForm.priority ?? undefined} onValueChange={val => setEditForm({ ...editForm, priority: val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="low">Low</SelectItem>
                                                  <SelectItem value="medium">Medium</SelectItem>
                                                  <SelectItem value="high">High</SelectItem>
                                                  <SelectItem value="urgent">Urgent</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div>
                                              <Label htmlFor="stage">Stage</Label>
                                              <Select value={editForm.stage || 'not_set'} onValueChange={val => setEditForm({ ...editForm, stage: val === 'not_set' ? '' : val })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="not_set">Not set</SelectItem>
                                                  <SelectItem value="Agreement">Agreement</SelectItem>
                                                  <SelectItem value="Arguments">Arguments</SelectItem>
                                                  <SelectItem value="Charge">Charge</SelectItem>
                                                  <SelectItem value="Evidence">Evidence</SelectItem>
                                                  <SelectItem value="Judgement">Judgement</SelectItem>
                                                  <SelectItem value="Plaintiff Evidence">Plaintiff Evidence</SelectItem>
                                                  <SelectItem value="Remand">Remand</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div>
                                              <Label htmlFor="year">Year</Label>
                                              <Input id="year" type="number" value={editForm.year || ''} onChange={e => setEditForm({ ...editForm, year: parseInt(e.target.value) || undefined })} />
                                            </div>
                                          </div>
                                          <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea id="description" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={3} />
                                          </div>
                                          <div>
                                            <Label htmlFor="particulars">Particulars</Label>
                                            <Textarea id="particulars" value={editForm.particulars || ''} onChange={e => setEditForm({ ...editForm, particulars: e.target.value })} rows={3} />
                                          </div>
                                        </TabsContent>
                                        <TabsContent value="client" className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label htmlFor="clientName">Client Name</Label>
                                              <Input id="clientName" value={editForm.clientName} onChange={e => setEditForm({ ...editForm, clientName: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="clientEmail">Client Email</Label>
                                              <Input id="clientEmail" type="email" value={editForm.clientEmail} onChange={e => setEditForm({ ...editForm, clientEmail: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="clientPhone">Client Phone</Label>
                                              <Input id="clientPhone" value={editForm.clientPhone} onChange={e => setEditForm({ ...editForm, clientPhone: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="courtName">Court Name</Label>
                                              <Input id="courtName" value={editForm.courtName} onChange={e => setEditForm({ ...editForm, courtName: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="courtLocation">Court Location</Label>
                                              <Input id="courtLocation" value={editForm.courtLocation} onChange={e => setEditForm({ ...editForm, courtLocation: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="judgeName">Judge Name</Label>
                                              <Input id="judgeName" value={editForm.judgeName || ''} onChange={e => setEditForm({ ...editForm, judgeName: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="opposingParty">Opposing Party</Label>
                                              <Input id="opposingParty" value={editForm.opposingParty || ''} onChange={e => setEditForm({ ...editForm, opposingParty: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="opposingLawyer">Opposing Lawyer</Label>
                                              <Input id="opposingLawyer" value={editForm.opposingLawyer || ''} onChange={e => setEditForm({ ...editForm, opposingLawyer: e.target.value })} />
                                            </div>
                                          </div>
                                        </TabsContent>
                                        <TabsContent value="financial" className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label htmlFor="totalAmount">Total Amount</Label>
                                              <Input id="totalAmount" type="number" step="0.01" value={editForm.fees?.totalAmount || 0} onChange={e => setEditForm({ ...editForm, fees: { ...editForm.fees, totalAmount: parseFloat(e.target.value) || 0, paidAmount: editForm.fees && typeof editForm.fees.paidAmount === 'number' ? editForm.fees.paidAmount : 0, pendingAmount: (parseFloat(e.target.value) || 0) - (editForm.fees && typeof editForm.fees.paidAmount === 'number' ? editForm.fees.paidAmount : 0), currency: editForm.fees && typeof editForm.fees.currency === 'string' ? editForm.fees.currency : 'USD', } })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="paidAmount">Paid Amount</Label>
                                              <Input id="paidAmount" type="number" step="0.01" value={editForm.fees?.paidAmount || 0} onChange={e => setEditForm({ ...editForm, fees: { ...editForm.fees, totalAmount: editForm.fees && typeof editForm.fees.totalAmount === 'number' ? editForm.fees.totalAmount : 0, paidAmount: parseFloat(e.target.value) || 0, pendingAmount: (editForm.fees && typeof editForm.fees.totalAmount === 'number' ? editForm.fees.totalAmount : 0) - (parseFloat(e.target.value) || 0), currency: editForm.fees && typeof editForm.fees.currency === 'string' ? editForm.fees.currency : 'USD', } })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="pendingAmount">Pending Amount</Label>
                                              <Input id="pendingAmount" type="number" step="0.01" value={editForm.fees?.pendingAmount || 0} disabled />
                                            </div>
                                            <div>
                                              <Label htmlFor="currency">Currency</Label>
                                              <Select value={editForm.fees?.currency ?? undefined} onValueChange={val => setEditForm({ ...editForm, fees: { ...editForm.fees, totalAmount: editForm.fees && typeof editForm.fees.totalAmount === 'number' ? editForm.fees.totalAmount : 0, paidAmount: editForm.fees && typeof editForm.fees.paidAmount === 'number' ? editForm.fees.paidAmount : 0, pendingAmount: editForm.fees && typeof editForm.fees.pendingAmount === 'number' ? editForm.fees.pendingAmount : 0, currency: val, } })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="USD">USD</SelectItem>
                                                  <SelectItem value="EUR">EUR</SelectItem>
                                                  <SelectItem value="GBP">GBP</SelectItem>
                                                  <SelectItem value="INR">INR</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                        </TabsContent>
                                        <TabsContent value="dates" className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label htmlFor="registrationDate">Registration Date</Label>
                                              <Input id="registrationDate" type="date" value={editForm.registrationDate || ''} onChange={e => setEditForm({ ...editForm, registrationDate: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="filingDate">Filing Date</Label>
                                              <Input id="filingDate" type="date" value={editForm.filingDate || ''} onChange={e => setEditForm({ ...editForm, filingDate: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="previousDate">Previous Date</Label>
                                              <Input id="previousDate" type="date" value={editForm.previousDate || ''} onChange={e => setEditForm({ ...editForm, previousDate: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="nextHearingDate">Next Hearing Date</Label>
                                              <Input id="nextHearingDate" type="date" value={editForm.nextHearingDate || ''} onChange={e => setEditForm({ ...editForm, nextHearingDate: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="deadlineDate">Deadline Date</Label>
                                              <Input id="deadlineDate" type="date" value={editForm.deadlineDate || ''} onChange={e => setEditForm({ ...editForm, deadlineDate: e.target.value })} />
                                            </div>
                                            <div>
                                              <Label htmlFor="closedDate">Closed Date</Label>
                                              <Input id="closedDate" type="date" value={editForm.closedDate || ''} onChange={e => setEditForm({ ...editForm, closedDate: e.target.value })} />
                                            </div>
                                          </div>
                                        </TabsContent>
                                      </Tabs>
                                      <DialogFooter>
                                        <Button type="submit">Save Changes</Button>
                                        <DialogClose asChild>
                                          <Button variant="secondary" type="button">Cancel</Button>
                                        </DialogClose>
                                      </DialogFooter>
                                    </form>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Dialog open={!!deleteCase && deleteCase._id === c._id} onOpenChange={open => !open && setDeleteCase(null)}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="destructive" onClick={() => setDeleteCase(c)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Case</DialogTitle>
                                    <DialogDescription>Are you sure you want to delete this case? This action cannot be undone.</DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4"><b>Case Number:</b> {deleteCase?.caseNumber}</div>
                                  <DialogFooter>
                                    <Button variant="destructive" onClick={handleDeleteCase}>Delete</Button>
                                    <DialogClose asChild>
                                      <Button variant="secondary">Cancel</Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Clients
                <Link href="/dashboard/advocates/clients">
                  <Button variant="secondary" size="sm">View All</Button>
                </Link>
              </CardTitle>
              <CardDescription>Manage client information and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading clients...</div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No clients found. Add your first client to get started.</p>
                </div>
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.slice(0, 5).map(client => (
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {/* View Cases Dialog */}
              <Dialog open={!!viewCasesClient} onOpenChange={() => setViewCasesClient(null)}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Cases for {viewCasesClient?.name}</DialogTitle>
                  </DialogHeader>
                  {casesLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading cases...</div>
                  ) : clientCases.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">No cases found for this client.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border bg-background shadow">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Case Number</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Created At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientCases.map((c: Case) => (
                            <TableRow key={c._id}>
                              <TableCell>{c.caseNumber}</TableCell>
                              <TableCell>{c.title}</TableCell>
                              <TableCell>
                                <Badge>{c.status}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge>{c.priority}</Badge>
                              </TableCell>
                              <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
                        {clientCases.map((c: Case) => (
                          <li key={c._id}>{c.caseNumber} - {c.title}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setDeleteClient(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteClient}>Delete Client & Cases</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hearings Tab */}
        <TabsContent value="hearings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Upcoming Hearings
                <Button variant="outline" size="sm" onClick={handleScheduleHearing}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Hearing
                </Button>
              </CardTitle>
              <CardDescription>Track court hearings and important dates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No upcoming hearings found. Schedule your first hearing to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Deadlines</CardTitle>
              <CardDescription>Manage case-related tasks and important deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No tasks found. Create your first task to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
{/* Case Types Chart */}
<div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Cases by Type</CardTitle>
            <CardDescription>Distribution of cases across different legal categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
{/* Document Viewer Sheet (scoped to dashboard case view) */}
<Sheet open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
  <SheetContent side="bottom" className="h-screen w-screen p-0 m-0">
    <SheetHeader className="p-4 pb-0 ">
      <SheetTitle>View Document</SheetTitle>
    </SheetHeader>
    {viewDoc && (
      <div className="w-full h-full flex flex-col items-center justify-center">
        {viewDoc.type === 'application/pdf' ? (
          <iframe src={viewDoc.url} title="PDF Preview" className="w-full h-full rounded border" />
        ) : viewDoc.type.startsWith('image/') ? (
          <img src={viewDoc.url} alt={viewDoc.name} className="max-h-full max-w-full rounded border" />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <p className="mb-2">Preview not available for this file type.</p>
            <a href={viewDoc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
          </div>
        )}
      </div>
    )}
  </SheetContent>
</Sheet>
    </>
  );
} 