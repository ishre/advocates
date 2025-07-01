"use client";
import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Eye, Pencil, Trash2, Save, X, Plus, Search, Filter, Calendar } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import NewCaseForm from "@/components/forms/NewCaseForm";

interface Case {
  _id: string;
  caseNumber: string;
  title: string;
  description: string;
  caseType: 'civil' | 'criminal' | 'family' | 'corporate' | 'property' | 'other';
  status: 'active' | 'closed' | 'pending' | 'on_hold' | 'settled' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientId: any;
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
  assignedTo: any[];
  createdBy: any;
  documents: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
    uploadedBy: any;
  }>;
  notes: Array<{
    content: string;
    createdBy: any;
    createdAt: string;
    isPrivate: boolean;
  }>;
  tasks: Array<{
    title: string;
    description: string;
    assignedTo: any;
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

// Actions component with integrated filters
function CaseActions({ 
  searchInput, 
  onSearchChange, 
  onSearch, 
  onCreateCase,
  filters,
  onFilterChange,
  onRemoveFilter
}: {
  searchInput: string;
  onSearchChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  onCreateCase: () => void;
  filters: { status: string[]; priority: string[]; dateFrom: string; dateTo: string };
  onFilterChange: (filters: any) => void;
  onRemoveFilter: (key: string, value?: string) => void;
}) {
  const hasActiveFilters = (filters.status && filters.status.length > 0) || (filters.priority && filters.priority.length > 0) || filters.dateFrom || filters.dateTo;

  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case 'status':
        return `Status: ${value}`;
      case 'priority':
        return `Priority: ${value}`;
      case 'dateFrom':
        return `From: ${new Date(value).toLocaleDateString()}`;
      case 'dateTo':
        return `To: ${new Date(value).toLocaleDateString()}`;
      default:
        return `${key}: ${value}`;
    }
  };

  const getBadgeColor = (key: string, value: string) => {
    switch (key) {
      case 'status':
        switch (value) {
          case 'active': return 'bg-green-100 text-green-800 border-green-200';
          case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
          case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'on_hold': return 'bg-orange-100 text-orange-800 border-orange-200';
          case 'settled': return 'bg-blue-100 text-blue-800 border-blue-200';
          case 'dismissed': return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      case 'priority':
        switch (value) {
          case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
          case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
          case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case 'low': return 'bg-green-100 text-green-800 border-green-200';
          default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
      case 'dateFrom':
      case 'dateTo':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = filters.status || [];
    if (checked) {
      onFilterChange({ ...filters, status: [...currentStatuses, status] });
    } else {
      onFilterChange({ ...filters, status: currentStatuses.filter(s => s !== status) });
    }
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const currentPriorities = filters.priority || [];
    if (checked) {
      onFilterChange({ ...filters, priority: [...currentPriorities, priority] });
    } else {
      onFilterChange({ ...filters, priority: currentPriorities.filter(p => p !== priority) });
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <form onSubmit={onSearch} className="flex gap-2 items-center flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by case number, title, or client name"
              className="pl-10"
              value={searchInput}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm">Search</Button>
          
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={`flex items-center gap-2 ${hasActiveFilters ? 'border-primary bg-primary/5' : ''}`}>
                <Filter className="w-4 h-4" />
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                    {Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : v !== "")).length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Filters</h3>
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onFilterChange({ status: [], priority: [], dateFrom: "", dateTo: "" })}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Status</Label>
                    <div className="mt-2 space-y-2">
                      {['active', 'closed', 'pending', 'on_hold', 'settled', 'dismissed'].map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.status?.includes(status) || false}
                            onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                          />
                          <Label 
                            htmlFor={`status-${status}`} 
                            className="text-sm font-normal capitalize cursor-pointer"
                          >
                            {status.replace('_', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Priority</Label>
                    <div className="mt-2 space-y-2">
                      {['low', 'medium', 'high', 'urgent'].map((priority) => (
                        <div key={priority} className="flex items-center space-x-2">
                          <Checkbox
                            id={`priority-${priority}`}
                            checked={filters.priority?.includes(priority) || false}
                            onCheckedChange={(checked) => handlePriorityChange(priority, checked as boolean)}
                          />
                          <Label 
                            htmlFor={`priority-${priority}`} 
                            className="text-sm font-normal capitalize cursor-pointer"
                          >
                            {priority}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="date-from" className="text-xs font-medium">From</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-to" className="text-xs font-medium">To</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </form>
        
        <Button onClick={onCreateCase} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Case
        </Button>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {/* Status badges */}
          {filters.status?.map((status) => (
            <Badge 
              key={`status-${status}`} 
              variant="outline" 
              className={`flex items-center gap-1 px-2 py-1 ${getBadgeColor('status', status)}`}
            >
              <span className="text-xs capitalize">{getFilterLabel('status', status)}</span>
              <button
                onClick={() => onRemoveFilter('status', status)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          
          {/* Priority badges */}
          {filters.priority?.map((priority) => (
            <Badge 
              key={`priority-${priority}`} 
              variant="outline" 
              className={`flex items-center gap-1 px-2 py-1 ${getBadgeColor('priority', priority)}`}
            >
              <span className="text-xs capitalize">{getFilterLabel('priority', priority)}</span>
              <button
                onClick={() => onRemoveFilter('priority', priority)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          
          {/* Date badges */}
          {filters.dateFrom && (
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 px-2 py-1 ${getBadgeColor('dateFrom', filters.dateFrom)}`}
            >
              <span className="text-xs">{getFilterLabel('dateFrom', filters.dateFrom)}</span>
              <button
                onClick={() => onRemoveFilter('dateFrom')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.dateTo && (
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 px-2 py-1 ${getBadgeColor('dateTo', filters.dateTo)}`}
            >
              <span className="text-xs">{getFilterLabel('dateTo', filters.dateTo)}</span>
              <button
                onClick={() => onRemoveFilter('dateTo')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default function AllCasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ status: [], priority: [], dateFrom: "", dateTo: "" });
  const [viewCase, setViewCase] = useState<Case | null>(null);
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [deleteCase, setDeleteCase] = useState<Case | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
        ...(filters.status && filters.status.length > 0 ? { status: filters.status.join(',') } : {}),
        ...(filters.priority && filters.priority.length > 0 ? { priority: filters.priority.join(',') } : {}),
        ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
        ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
      });
      const res = await fetch(`/api/cases?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch cases");
      setCases(data.cases || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to fetch cases");
    } finally {
      setLoading(false);
    }
  };

  const fetchCaseDetails = async (caseId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch case details");
      return data.case;
    } catch (err: any) {
      console.error("Error fetching case details:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line
  }, [page, limit, search, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleRemoveFilter = (key: string, value?: string) => {
    if (value) {
      // Remove specific value from array
      setFilters(prev => ({
        ...prev,
        [key]: Array.isArray(prev[key as keyof typeof prev]) 
          ? (prev[key as keyof typeof prev] as string[]).filter((v: string) => v !== value)
          : prev[key as keyof typeof prev]
      }));
    } else {
      // Clear the entire filter
      setFilters(prev => ({ ...prev, [key]: key === 'status' || key === 'priority' ? [] : "" }));
    }
    setPage(1);
  };

  const handleCreateCase = () => {
    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchCases(); // Refresh the cases list
  };

  const handleViewCase = async (caseData: Case) => {
    const detailedCase = await fetchCaseDetails(caseData._id);
    if (detailedCase) {
      setViewCase(detailedCase);
    } else {
      setViewCase(caseData);
    }
  };

  const handleEditCase = async (caseData: Case) => {
    const detailedCase = await fetchCaseDetails(caseData._id);
    if (detailedCase) {
      setEditCase(detailedCase);
      setEditForm({
        ...detailedCase,
        filingDate: detailedCase.filingDate ? new Date(detailedCase.filingDate).toISOString().split('T')[0] : '',
        nextHearingDate: detailedCase.nextHearingDate ? new Date(detailedCase.nextHearingDate).toISOString().split('T')[0] : '',
        deadlineDate: detailedCase.deadlineDate ? new Date(detailedCase.deadlineDate).toISOString().split('T')[0] : '',
        closedDate: detailedCase.closedDate ? new Date(detailedCase.closedDate).toISOString().split('T')[0] : '',
        registrationDate: detailedCase.registrationDate ? new Date(detailedCase.registrationDate).toISOString().split('T')[0] : '',
        previousDate: detailedCase.previousDate ? new Date(detailedCase.previousDate).toISOString().split('T')[0] : '',
      });
    } else {
      setEditCase(caseData);
      setEditForm({
        ...caseData,
        filingDate: caseData.filingDate ? new Date(caseData.filingDate).toISOString().split('T')[0] : '',
        nextHearingDate: caseData.nextHearingDate ? new Date(caseData.nextHearingDate).toISOString().split('T')[0] : '',
        deadlineDate: caseData.deadlineDate ? new Date(caseData.deadlineDate).toISOString().split('T')[0] : '',
        closedDate: caseData.closedDate ? new Date(caseData.closedDate).toISOString().split('T')[0] : '',
        registrationDate: caseData.registrationDate ? new Date(caseData.registrationDate).toISOString().split('T')[0] : '',
        previousDate: caseData.previousDate ? new Date(caseData.previousDate).toISOString().split('T')[0] : '',
      });
    }
  };

  const handleUpdateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCase) return;

    setEditLoading(true);
    try {
      const response = await fetch(`/api/cases/${editCase._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await fetchCases(); // Refresh the list
        setEditCase(null);
        setEditForm(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update case');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update case');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!deleteCase) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/cases/${deleteCase._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCases(); // Refresh the list
        setDeleteCase(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete case');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete case');
    } finally {
      setDeleteLoading(false);
    }
  };

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Cases</h1>
      
      <CaseActions
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        onSearch={handleSearch}
        onCreateCase={handleCreateCase}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRemoveFilter={handleRemoveFilter}
      />

      {loading ? (
        <div className="py-8 text-center text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="text-red-500 py-8 text-center">{error}</div>
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
                        <Dialog open={!!viewCase && viewCase._id === c._id} onOpenChange={open => !open && setViewCase(null)}>
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
                        <Dialog open={!!editCase && editCase._id === c._id} onOpenChange={open => !open && setEditCase(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary" onClick={() => handleEditCase(c)}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Case</DialogTitle>
                              <DialogDescription>Edit all case details and save changes.</DialogDescription>
                            </DialogHeader>
                            {editForm && (
                              <form onSubmit={handleUpdateCase} className="space-y-4">
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
                                        <Input
                                          id="caseNumber"
                                          value={editForm.caseNumber}
                                          onChange={e => setEditForm({ ...editForm, caseNumber: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                          id="title"
                                          value={editForm.title}
                                          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="caseType">Case Type</Label>
                                        <Select value={editForm.caseType} onValueChange={val => setEditForm({ ...editForm, caseType: val })}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
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
                                        <Select value={editForm.status} onValueChange={val => setEditForm({ ...editForm, status: val })}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
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
                                        <Select value={editForm.priority} onValueChange={val => setEditForm({ ...editForm, priority: val })}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
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
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
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
                                        <Input
                                          id="year"
                                          type="number"
                                          value={editForm.year || ''}
                                          onChange={e => setEditForm({ ...editForm, year: parseInt(e.target.value) || undefined })}
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor="description">Description</Label>
                                      <Textarea
                                        id="description"
                                        value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="particulars">Particulars</Label>
                                      <Textarea
                                        id="particulars"
                                        value={editForm.particulars || ''}
                                        onChange={e => setEditForm({ ...editForm, particulars: e.target.value })}
                                        rows={3}
                                      />
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="client" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="clientName">Client Name</Label>
                                        <Input
                                          id="clientName"
                                          value={editForm.clientName}
                                          onChange={e => setEditForm({ ...editForm, clientName: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="clientEmail">Client Email</Label>
                                        <Input
                                          id="clientEmail"
                                          type="email"
                                          value={editForm.clientEmail}
                                          onChange={e => setEditForm({ ...editForm, clientEmail: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="clientPhone">Client Phone</Label>
                                        <Input
                                          id="clientPhone"
                                          value={editForm.clientPhone}
                                          onChange={e => setEditForm({ ...editForm, clientPhone: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="courtName">Court Name</Label>
                                        <Input
                                          id="courtName"
                                          value={editForm.courtName}
                                          onChange={e => setEditForm({ ...editForm, courtName: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="courtLocation">Court Location</Label>
                                        <Input
                                          id="courtLocation"
                                          value={editForm.courtLocation}
                                          onChange={e => setEditForm({ ...editForm, courtLocation: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="judgeName">Judge Name</Label>
                                        <Input
                                          id="judgeName"
                                          value={editForm.judgeName || ''}
                                          onChange={e => setEditForm({ ...editForm, judgeName: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="opposingParty">Opposing Party</Label>
                                        <Input
                                          id="opposingParty"
                                          value={editForm.opposingParty || ''}
                                          onChange={e => setEditForm({ ...editForm, opposingParty: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="opposingLawyer">Opposing Lawyer</Label>
                                        <Input
                                          id="opposingLawyer"
                                          value={editForm.opposingLawyer || ''}
                                          onChange={e => setEditForm({ ...editForm, opposingLawyer: e.target.value })}
                                        />
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="financial" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor="totalAmount">Total Amount</Label>
                                        <Input
                                          id="totalAmount"
                                          type="number"
                                          step="0.01"
                                          value={editForm.fees?.totalAmount || 0}
                                          onChange={e => setEditForm({
                                            ...editForm,
                                            fees: {
                                              ...editForm.fees,
                                              totalAmount: parseFloat(e.target.value) || 0,
                                              pendingAmount: (parseFloat(e.target.value) || 0) - (editForm.fees?.paidAmount || 0)
                                            }
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="paidAmount">Paid Amount</Label>
                                        <Input
                                          id="paidAmount"
                                          type="number"
                                          step="0.01"
                                          value={editForm.fees?.paidAmount || 0}
                                          onChange={e => setEditForm({
                                            ...editForm,
                                            fees: {
                                              ...editForm.fees,
                                              paidAmount: parseFloat(e.target.value) || 0,
                                              pendingAmount: (editForm.fees?.totalAmount || 0) - (parseFloat(e.target.value) || 0)
                                            }
                                          })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="pendingAmount">Pending Amount</Label>
                                        <Input
                                          id="pendingAmount"
                                          type="number"
                                          step="0.01"
                                          value={editForm.fees?.pendingAmount || 0}
                                          disabled
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select value={editForm.fees?.currency || 'USD'} onValueChange={val => setEditForm({
                                          ...editForm,
                                          fees: { ...editForm.fees, currency: val }
                                        })}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
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
                                        <Input
                                          id="registrationDate"
                                          type="date"
                                          value={editForm.registrationDate || ''}
                                          onChange={e => setEditForm({ ...editForm, registrationDate: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="filingDate">Filing Date</Label>
                                        <Input
                                          id="filingDate"
                                          type="date"
                                          value={editForm.filingDate || ''}
                                          onChange={e => setEditForm({ ...editForm, filingDate: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="previousDate">Previous Date</Label>
                                        <Input
                                          id="previousDate"
                                          type="date"
                                          value={editForm.previousDate || ''}
                                          onChange={e => setEditForm({ ...editForm, previousDate: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="nextHearingDate">Next Hearing Date</Label>
                                        <Input
                                          id="nextHearingDate"
                                          type="date"
                                          value={editForm.nextHearingDate || ''}
                                          onChange={e => setEditForm({ ...editForm, nextHearingDate: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="deadlineDate">Deadline Date</Label>
                                        <Input
                                          id="deadlineDate"
                                          type="date"
                                          value={editForm.deadlineDate || ''}
                                          onChange={e => setEditForm({ ...editForm, deadlineDate: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="closedDate">Closed Date</Label>
                                        <Input
                                          id="closedDate"
                                          type="date"
                                          value={editForm.closedDate || ''}
                                          onChange={e => setEditForm({ ...editForm, closedDate: e.target.value })}
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
                              <Button variant="destructive" onClick={handleDeleteCase} disabled={deleteLoading}>
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
                            <DropdownMenuItem onClick={() => handleViewCase(c)}><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCase(c)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteCase(c)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
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
      )}
      <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-2">
        <div>
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
        <div>
          <Select value={String(limit)} onValueChange={val => { setLimit(Number(val)); setPage(1); }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map(n => (
                <SelectItem key={n} value={String(n)}>{n} per page</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create Case Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent showCloseButton={false} className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Case</DialogTitle>
          </DialogHeader>
          <NewCaseForm 
            variant="dialog"
            onClose={handleCloseCreateForm}
            onSuccess={handleCreateSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 