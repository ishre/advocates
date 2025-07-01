import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";

interface Case {
  _id: string;
  caseNumber: string;
  title: string;
  description: string;
  caseType: 'civil' | 'criminal' | 'family' | 'corporate' | 'property' | 'other';
  status: 'active' | 'closed' | 'pending' | 'on_hold' | 'settled' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientId: unknown;
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
  assignedTo: unknown[];
  createdBy: unknown;
  documents: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
    uploadedBy: unknown;
  }>;
  notes: Array<{
    content: string;
    createdBy: unknown;
    createdAt: string;
    isPrivate: boolean;
  }>;
  tasks: Array<{
    title: string;
    description: string;
    assignedTo: unknown;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
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

interface CaseTableProps {
  cases: Case[];
  loading: boolean;
  error: string;
  onViewCase: (caseData: Case) => void;
  onEditCase: (caseData: Case) => void;
  onDeleteCase: (caseData: Case) => void;
  viewCase: Case | null;
  editCase: Case | null;
  deleteCase: Case | null;
  editForm: Partial<Case>;
  editLoading: boolean;
  deleteLoading: boolean;
  onUpdateCase: (e: React.FormEvent) => void;
  onConfirmDelete: () => void;
  onCloseView: () => void;
  onCloseEdit: () => void;
  onCloseDelete: () => void;
  onEditFormChange: (form: Partial<Case>) => void;
}

export default function CaseTable({
  cases,
  loading,
  error,
  onViewCase,
  onEditCase,
  onDeleteCase,
  viewCase,
  editCase,
  deleteCase,
  editForm,
  editLoading,
  deleteLoading,
  onUpdateCase,
  onConfirmDelete,
  onCloseView,
  onCloseEdit,
  onCloseDelete,
  onEditFormChange,
}: CaseTableProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'settled': return 'bg-blue-100 text-blue-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-8 text-center">{error}</div>;
  }

  return (
    <>
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
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">No cases found.</TableCell>
              </TableRow>
            ) : (
              cases.map((c, idx) => (
                <TableRow key={c._id} className={idx % 2 === 0 ? "bg-muted/50" : ""}>
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
                    {/* Desktop: show separate buttons */}
                    <div className="hidden md:inline-flex gap-2">
                      <Dialog open={!!viewCase && viewCase._id === c._id} onOpenChange={open => !open && onCloseView()}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => onViewCase(c)}><Eye className="w-4 h-4 mr-1" /> View</Button>
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
                              
                              <TabsContent value="basic" className="space-y-4">
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
                                      {viewCase.documents.map((doc, idx) => (
                                        <div key={idx} className="text-sm p-2 bg-muted rounded">
                                          {doc.name} ({doc.type}) - {new Date(doc.uploadedAt).toLocaleDateString()}
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
                                      {viewCase.notes.map((note, idx) => (
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
                      <Dialog open={!!editCase && editCase._id === c._id} onOpenChange={open => !open && onCloseEdit()}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="secondary" onClick={() => onEditCase(c)}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Case</DialogTitle>
                            <DialogDescription>Edit all case details and save changes.</DialogDescription>
                          </DialogHeader>
                          {editForm && (
                            <form onSubmit={onUpdateCase} className="space-y-4">
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
                                      <label className="block text-sm font-medium mb-1">Case Number</label>
                                      <input
                                        className="input w-full"
                                        value={editForm.caseNumber}
                                        onChange={e => onEditFormChange({ ...editForm, caseNumber: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Title</label>
                                      <input
                                        className="input w-full"
                                        value={editForm.title}
                                        onChange={e => onEditFormChange({ ...editForm, title: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Case Type</label>
                                      <select
                                        className="input w-full"
                                        value={editForm.caseType}
                                        onChange={e => onEditFormChange({ ...editForm, caseType: e.target.value as Case["caseType"] })}
                                      >
                                        <option value="civil">Civil</option>
                                        <option value="criminal">Criminal</option>
                                        <option value="family">Family</option>
                                        <option value="corporate">Corporate</option>
                                        <option value="property">Property</option>
                                        <option value="other">Other</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Status</label>
                                      <select
                                        className="input w-full"
                                        value={editForm.status}
                                        onChange={e => onEditFormChange({ ...editForm, status: e.target.value as Case["status"] })}
                                      >
                                        <option value="active">Active</option>
                                        <option value="closed">Closed</option>
                                        <option value="pending">Pending</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="settled">Settled</option>
                                        <option value="dismissed">Dismissed</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Priority</label>
                                      <select
                                        className="input w-full"
                                        value={editForm.priority}
                                        onChange={e => onEditFormChange({ ...editForm, priority: e.target.value as Case["priority"] })}
                                      >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Stage</label>
                                      <select
                                        className="input w-full"
                                        value={editForm.stage || 'not_set'}
                                        onChange={e => onEditFormChange({ ...editForm, stage: e.target.value === 'not_set' ? '' : e.target.value })}
                                      >
                                        <option value="not_set">Not set</option>
                                        <option value="Agreement">Agreement</option>
                                        <option value="Arguments">Arguments</option>
                                        <option value="Charge">Charge</option>
                                        <option value="Evidence">Evidence</option>
                                        <option value="Judgement">Judgement</option>
                                        <option value="Plaintiff Evidence">Plaintiff Evidence</option>
                                        <option value="Remand">Remand</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Year</label>
                                      <input
                                        className="input w-full"
                                        type="number"
                                        value={editForm.year || ''}
                                        onChange={e => onEditFormChange({ ...editForm, year: parseInt(e.target.value) || undefined })}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                      className="input w-full"
                                      value={editForm.description}
                                      onChange={e => onEditFormChange({ ...editForm, description: e.target.value })}
                                      rows={3}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Particulars</label>
                                    <textarea
                                      className="input w-full"
                                      value={editForm.particulars || ''}
                                      onChange={e => onEditFormChange({ ...editForm, particulars: e.target.value })}
                                      rows={3}
                                    />
                                  </div>
                                </TabsContent>

                                <TabsContent value="client" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Client Name</label>
                                      <input
                                        className="input w-full"
                                        value={editForm.clientName}
                                        onChange={e => onEditFormChange({ ...editForm, clientName: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Client Email</label>
                                      <input
                                        className="input w-full"
                                        type="email"
                                        value={editForm.clientEmail}
                                        onChange={e => onEditFormChange({ ...editForm, clientEmail: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Client Phone</label>
                                      <input
                                        className="input w-full"
                                        value={editForm.clientPhone}
                                        onChange={e => onEditFormChange({ ...editForm, clientPhone: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Court Name</label>
                                      <input
                                        className="input w-full"
                                        value={editForm.courtName}
                                        onChange={e => onEditFormChange({ ...editForm, courtName: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Court Location</label>
                                      <input
                                        className="input w-full"
                                        value={editForm.courtLocation}
                                        onChange={e => onEditFormChange({ ...editForm, courtLocation: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Judge Name</label>
                                      <input
                                        className="input w-full"
                                        value={editForm.judgeName || ''}
                                        onChange={e => onEditFormChange({ ...editForm, judgeName: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Opposing Party</label>
                                      <input
                                        className="input w-full"
                                        value={editForm.opposingParty || ''}
                                        onChange={e => onEditFormChange({ ...editForm, opposingParty: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Opposing Lawyer</label>
                                      <input
                                        className="input w-full"
                                        value={editForm.opposingLawyer || ''}
                                        onChange={e => onEditFormChange({ ...editForm, opposingLawyer: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="financial" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Total Amount</label>
                                      <input
                                        className="input w-full"
                                        type="number"
                                        step="0.01"
                                        value={editForm.fees?.totalAmount || 0}
                                        onChange={e => onEditFormChange({
                                          ...editForm,
                                          fees: {
                                            totalAmount: parseFloat(e.target.value) || 0,
                                            paidAmount: editForm.fees?.paidAmount ?? 0,
                                            pendingAmount: (parseFloat(e.target.value) || 0) - (editForm.fees?.paidAmount ?? 0),
                                            currency: editForm.fees?.currency ?? 'USD',
                                          }
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Paid Amount</label>
                                      <input
                                        className="input w-full"
                                        type="number"
                                        step="0.01"
                                        value={editForm.fees?.paidAmount || 0}
                                        onChange={e => onEditFormChange({
                                          ...editForm,
                                          fees: {
                                            totalAmount: editForm.fees?.totalAmount ?? 0,
                                            paidAmount: parseFloat(e.target.value) || 0,
                                            pendingAmount: (editForm.fees?.totalAmount ?? 0) - (parseFloat(e.target.value) || 0),
                                            currency: editForm.fees?.currency ?? 'USD',
                                          }
                                        })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Pending Amount</label>
                                      <input
                                        className="input w-full"
                                        type="number"
                                        step="0.01"
                                        value={editForm.fees?.pendingAmount || 0}
                                        disabled
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Currency</label>
                                      <select
                                        className="input w-full"
                                        value={editForm.fees?.currency || 'USD'}
                                        onChange={e => onEditFormChange({
                                          ...editForm,
                                          fees: {
                                            totalAmount: editForm.fees?.totalAmount ?? 0,
                                            paidAmount: editForm.fees?.paidAmount ?? 0,
                                            pendingAmount: editForm.fees?.pendingAmount ?? 0,
                                            currency: e.target.value,
                                          }
                                        })}
                                      >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="INR">INR</option>
                                      </select>
                                    </div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="dates" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Registration Date</label>
                                      <input
                                        className="input w-full"
                                        type="date"
                                        value={editForm.registrationDate || ''}
                                        onChange={e => onEditFormChange({ ...editForm, registrationDate: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Filing Date</label>
                                      <input
                                        className="input w-full"
                                        type="date"
                                        value={editForm.filingDate || ''}
                                        onChange={e => onEditFormChange({ ...editForm, filingDate: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Previous Date</label>
                                      <input
                                        className="input w-full"
                                        type="date"
                                        value={editForm.previousDate || ''}
                                        onChange={e => onEditFormChange({ ...editForm, previousDate: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Next Hearing Date</label>
                                      <input
                                        className="input w-full"
                                        type="date"
                                        value={editForm.nextHearingDate || ''}
                                        onChange={e => onEditFormChange({ ...editForm, nextHearingDate: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Deadline Date</label>
                                      <input
                                        className="input w-full"
                                        type="date"
                                        value={editForm.deadlineDate || ''}
                                        onChange={e => onEditFormChange({ ...editForm, deadlineDate: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">Closed Date</label>
                                      <input
                                        className="input w-full"
                                        type="date"
                                        value={editForm.closedDate || ''}
                                        onChange={e => onEditFormChange({ ...editForm, closedDate: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                              <DialogFooter>
                                <Button type="submit" disabled={editLoading}>
                                  {editLoading ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <DialogClose asChild>
                                  <Button variant="secondary" type="button">Cancel</Button>
                                </DialogClose>
                              </DialogFooter>
                            </form>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Dialog open={!!deleteCase && deleteCase._id === c._id} onOpenChange={open => !open && onCloseDelete()}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive" onClick={() => onDeleteCase(c)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Case</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this case? This action cannot be undone.</DialogDescription>
                          </DialogHeader>
                          <div className="py-4"><b>Case Number:</b> {deleteCase?.caseNumber}</div>
                          <DialogFooter>
                            <Button variant="destructive" onClick={onConfirmDelete} disabled={deleteLoading}>
                              {deleteLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                            <DialogClose asChild>
                              <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {/* Mobile: show dropdown */}
                    <div className="inline-flex md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewCase(c)}><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditCase(c)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => onDeleteCase(c)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
} 