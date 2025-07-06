"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Pencil, Trash2, X, Plus, Search, Filter, Upload, Download, FileText, FileImage, FileVideo, FileAudio, FileArchive, Calendar, Clock, FileX, FileCheck, FileSearch, FilePlus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import NewCaseForm from "@/components/forms/NewCaseForm";

import QuickDocumentUpload from '@/components/forms/QuickDocumentUpload';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

// Define a type for filters
interface CaseFilters {
  status: string[];
  priority: string[];
  dateFrom: string;
  dateTo: string;
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
  filters: CaseFilters;
  onFilterChange: (filters: CaseFilters) => void;
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
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<CaseFilters>({ status: [], priority: [], dateFrom: "", dateTo: "" });
  const [viewCase, setViewCase] = useState<Case | null>(null);
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [deleteCase, setDeleteCase] = useState<Case | null>(null);
  const [editForm, setEditForm] = useState<Partial<Case> | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [uploadCaseId, setUploadCaseId] = useState<string | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<{ caseId: string; documentName: string } | null>(null);
  const [deleteDocLoading, setDeleteDocLoading] = useState(false);
  const [deleteDocError, setDeleteDocError] = useState('');
  const [viewDoc, setViewDoc] = useState<{ url: string; name: string; type: string } | null>(null);

  const fetchCases = useCallback(async () => {
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to fetch cases");
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filters]);

  const fetchCaseDetails = async (caseId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch case details");
      return data.case;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error fetching case details:", err.message);
      } else {
        console.error("Error fetching case details: Unknown error");
      }
      return null;
    }
  };

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleFilterChange = (newFilters: CaseFilters) => {
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update case');
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete case');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteDoc = async () => {
    if (!deleteDoc) return;
    setDeleteDocLoading(true);
    setDeleteDocError('');
    try {
      const res = await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteDoc),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete document');
      }
      setDeleteDoc(null);
      if (viewCase) {
        // Refresh the case details
        const refreshed = await fetchCaseDetails(viewCase._id);
        if (refreshed) setViewCase(refreshed);
      }
    } catch (err: any) {
      setDeleteDocError(err.message || 'Failed to delete document');
    } finally {
      setDeleteDocLoading(false);
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

  const handleOpenDocumentUpload = (caseId: string) => {
    setUploadCaseId(caseId);
    setShowDocumentUpload(true);
  };
  const handleCloseDocumentUpload = () => {
    setShowDocumentUpload(false);
    setUploadCaseId(null);
  };
  const handleDocumentUploadSuccess = () => {
    setShowDocumentUpload(false);
    setUploadCaseId(null);
    fetchCases();
  };

  // File type icon utility function
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('png') || fileType.includes('gif')) {
      return <FileImage className="h-5 w-5 text-green-500" />;
    }
    if (fileType.includes('video')) return <FileVideo className="h-5 w-5 text-purple-500" />;
    if (fileType.includes('audio')) return <FileAudio className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) {
      return <FileArchive className="h-5 w-5 text-orange-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  // Format file size utility
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date utility
  const formatDocumentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
                      <div className="inline-flex gap-2">
                        {/* View Button */}
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
                              <Tabs defaultValue="basic" className="w-full ">
                                <TabsList className="grid w-full grid-cols-4 mb-4">
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

                                <TabsContent value="client" className="space-y-4 px-4">
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

                                <TabsContent value="financial" className="space-y-4 px-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div><b>Total Amount:</b> {viewCase.fees?.currency || 'USD'} {viewCase.fees?.totalAmount || 0}</div>
                                    <div><b>Paid Amount:</b> {viewCase.fees?.currency || 'USD'} {viewCase.fees?.paidAmount || 0}</div>
                                    <div><b>Pending Amount:</b> {viewCase.fees?.currency || 'USD'} {viewCase.fees?.pendingAmount || 0}</div>
                                    <div><b>Currency:</b> {viewCase.fees?.currency || 'USD'}</div>
                                  </div>
                                </TabsContent>

                                <TabsContent value="documents" className="space-y-6">
                                  {/* Documents Section */}
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <h3 className="text-lg font-semibold">Documents</h3>
                                        <Badge variant="secondary" className="ml-2">
                                          {viewCase.documents?.length || 0}
                                        </Badge>
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleOpenDocumentUpload(viewCase._id)}
                                        className="flex items-center gap-2"
                                      >
                                        <FilePlus className="h-4 w-4" />
                                        Upload
                                      </Button>
                                    </div>

                                    {viewCase.documents && viewCase.documents.length > 0 ? (
                                      <div className="grid gap-3">
                                        {viewCase.documents.map((doc, idx) => (
                                          <Card key={idx} className="hover:shadow-md transition-shadow">
                                            <CardContent >
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
                                                        {formatDocumentDate(doc.uploadedAt)}
                                                      </span>
                                                      <span>{formatFileSize(doc.size)}</span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-4">
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setViewDoc({ url: doc.url, name: doc.name, type: doc.type })}
                                                    title="View Document"
                                                    className="h-8 w-8 p-0"
                                                  >
                                                    <Eye className="h-4 w-4" />
                                                  </Button>
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
                                                  <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setDeleteDoc({ caseId: viewCase._id, documentName: doc.name })}
                                                    title="Delete Document"
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                  >
                                                    <Trash2 className="h-4 w-4" />
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
                                          <Button 
                                            onClick={() => handleOpenDocumentUpload(viewCase._id)}
                                            className="flex items-center gap-2"
                                          >
                                            <FilePlus className="h-4 w-4" />
                                            Upload First Document
                                          </Button>
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
                                        {viewCase.notes?.length || 0}
                                      </Badge>
                                    </div>

                                    {viewCase.notes && viewCase.notes.length > 0 ? (
                                      <div className="grid gap-3">
                                        {viewCase.notes.map((note, idx) => (
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
                                                      {formatDocumentDate(note.createdAt)}
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

                                  {/* Document Viewer Sheet */}
                                  <Sheet open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
                                    <SheetContent side="bottom" className="h-screen w-screen p-0 m-0">
                                      <SheetHeader className="p-4 pb-0">
                                        <SheetTitle className="flex items-center gap-2">
                                          <FileText className="h-5 w-5" />
                                          {viewDoc?.name}
                                        </SheetTitle>
                                      </SheetHeader>
                                      {viewDoc && (
                                        <div className="w-full h-full flex flex-col items-center justify-center">
                                          {viewDoc.type === 'application/pdf' ? (
                                            <iframe src={viewDoc.url} title="PDF Preview" className="w-full h-full rounded border" />
                                          ) : viewDoc.type.startsWith('image/') ? (
                                            <img src={viewDoc.url} alt={viewDoc.name} className="max-h-full max-w-full rounded border" />
                                          ) : (
                                            <div className="flex flex-col items-center justify-center w-full h-full">
                                              <FileX className="h-16 w-16 text-muted-foreground mb-4" />
                                              <p className="text-lg font-medium mb-2">Preview Not Available</p>
                                              <p className="text-sm text-muted-foreground mb-4">
                                                This file type cannot be previewed in the browser.
                                              </p>
                                              <Button asChild>
                                                <a href={viewDoc.url} target="_blank" rel="noopener noreferrer" download>
                                                  <Download className="h-4 w-4 mr-2" />
                                                  Download File
                                                </a>
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </SheetContent>
                                  </Sheet>

                                  {/* Delete Confirmation Dialog */}
                                  <Dialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                          <Trash2 className="h-5 w-5 text-destructive" />
                                          Delete Document
                                        </DialogTitle>
                                        <DialogDescription>
                                          This action cannot be undone. The document will be permanently deleted.
                                        </DialogDescription>
                                      </DialogHeader>
                                      {deleteDocError && (
                                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                                          {deleteDocError}
                                        </div>
                                      )}
                                      <div className="space-y-2">
                                        <p className="text-sm">
                                          Are you sure you want to delete <span className="font-semibold">{deleteDoc?.documentName}</span>?
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          This document will be permanently removed from the case.
                                        </p>
                                      </div>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setDeleteDoc(null)} disabled={deleteDocLoading}>
                                          Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={handleDeleteDoc} disabled={deleteDocLoading}>
                                          {deleteDocLoading ? 'Deleting...' : 'Delete Document'}
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
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
                        {/* Edit Button */}
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
                                      <div className="space-y-2">
                                        <Label htmlFor="caseNumber">Case Number</Label>
                                        <Input
                                          id="caseNumber"
                                          value={editForm.caseNumber}
                                          onChange={e => setEditForm({ ...editForm, caseNumber: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                          id="title"
                                          value={editForm.title}
                                          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="caseType">Case Type</Label>
                                        <Select value={editForm.caseType ?? undefined} onValueChange={val => setEditForm({ ...editForm, caseType: val as Case['caseType'] })}>
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
                                      <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select value={editForm.status ?? undefined} onValueChange={val => setEditForm({ ...editForm, status: val as Case['status'] })}>
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
                                      <div className="space-y-2">
                                        <Label htmlFor="priority">Priority</Label>
                                        <Select value={editForm.priority ?? undefined} onValueChange={val => setEditForm({ ...editForm, priority: val as Case['priority'] })}>
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
                                      <div className="space-y-2">
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
                                      <div className="space-y-2">
                                        <Label htmlFor="year">Year</Label>
                                        <Input
                                          id="year"
                                          type="number"
                                          value={editForm.year || ''}
                                          onChange={e => setEditForm({ ...editForm, year: parseInt(e.target.value) || undefined })}
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="description">Description</Label>
                                      <Textarea
                                        id="description"
                                        value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        rows={3}
                                      />
                                    </div>
                                    <div className="space-y-2">
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
                                      <div className="space-y-2">
                                        <Label htmlFor="clientName">Client Name</Label>
                                        <Input
                                          id="clientName"
                                          value={editForm.clientName}
                                          onChange={e => setEditForm({ ...editForm, clientName: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="clientEmail">Client Email</Label>
                                        <Input
                                          id="clientEmail"
                                          type="email"
                                          value={editForm.clientEmail}
                                          onChange={e => setEditForm({ ...editForm, clientEmail: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2"  >
                                        <Label htmlFor="clientPhone">Client Phone</Label>
                                        <Input
                                          id="clientPhone"
                                          value={editForm.clientPhone}
                                          onChange={e => setEditForm({ ...editForm, clientPhone: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="courtName">Court Name</Label>
                                        <Input
                                          id="courtName"
                                          value={editForm.courtName}
                                          onChange={e => setEditForm({ ...editForm, courtName: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="courtLocation">Court Location</Label>
                                        <Input
                                          id="courtLocation"
                                          value={editForm.courtLocation}
                                          onChange={e => setEditForm({ ...editForm, courtLocation: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="judgeName">Judge Name</Label>
                                        <Input
                                          id="judgeName"
                                          value={editForm.judgeName || ''}
                                          onChange={e => setEditForm({ ...editForm, judgeName: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="opposingParty">Opposing Party</Label>
                                        <Input
                                          id="opposingParty"
                                          value={editForm.opposingParty || ''}
                                          onChange={e => setEditForm({ ...editForm, opposingParty: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
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
                                      <div className="space-y-2">
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
                                              paidAmount: editForm.fees && typeof editForm.fees.paidAmount === 'number' ? editForm.fees.paidAmount : 0,
                                              pendingAmount: (parseFloat(e.target.value) || 0) - (editForm.fees && typeof editForm.fees.paidAmount === 'number' ? editForm.fees.paidAmount : 0),
                                              currency: editForm.fees && typeof editForm.fees.currency === 'string' ? editForm.fees.currency : 'USD',
                                            }
                                          })}
                                        />
                                      </div>
                                      <div className="space-y-2">
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
                                              totalAmount: editForm.fees && typeof editForm.fees.totalAmount === 'number' ? editForm.fees.totalAmount : 0,
                                              paidAmount: parseFloat(e.target.value) || 0,
                                              pendingAmount: (editForm.fees && typeof editForm.fees.totalAmount === 'number' ? editForm.fees.totalAmount : 0) - (parseFloat(e.target.value) || 0),
                                              currency: editForm.fees && typeof editForm.fees.currency === 'string' ? editForm.fees.currency : 'USD',
                                            }
                                          })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="pendingAmount">Pending Amount</Label>
                                        <Input
                                          id="pendingAmount"
                                          type="number"
                                          step="0.01"
                                          value={editForm.fees?.pendingAmount || 0}
                                          disabled
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select value={editForm.fees?.currency ?? undefined} onValueChange={val => setEditForm({
                                          ...editForm,
                                          fees: {
                                            ...editForm.fees,
                                            totalAmount: editForm.fees && typeof editForm.fees.totalAmount === 'number' ? editForm.fees.totalAmount : 0,
                                            paidAmount: editForm.fees && typeof editForm.fees.paidAmount === 'number' ? editForm.fees.paidAmount : 0,
                                            pendingAmount: editForm.fees && typeof editForm.fees.pendingAmount === 'number' ? editForm.fees.pendingAmount : 0,
                                            currency: val,
                                          }
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
                                      <div className="space-y-2">
                                        <Label htmlFor="registrationDate">Registration Date</Label>
                                        <Input
                                          id="registrationDate"
                                          type="date"
                                          value={editForm.registrationDate || ''}
                                          onChange={e => setEditForm({ ...editForm, registrationDate: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2"  >
                                        <Label htmlFor="filingDate">Filing Date</Label>
                                        <Input
                                          id="filingDate"
                                          type="date"
                                          value={editForm.filingDate || ''}
                                          onChange={e => setEditForm({ ...editForm, filingDate: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="previousDate">Previous Date</Label>
                                        <Input
                                          id="previousDate"
                                          type="date"
                                          value={editForm.previousDate || ''}
                                          onChange={e => setEditForm({ ...editForm, previousDate: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="nextHearingDate">Next Hearing Date</Label>
                                        <Input
                                          id="nextHearingDate"
                                          type="date"
                                          value={editForm.nextHearingDate || ''}
                                          onChange={e => setEditForm({ ...editForm, nextHearingDate: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="deadlineDate">Deadline Date</Label>
                                        <Input
                                          id="deadlineDate"
                                          type="date"
                                          value={editForm.deadlineDate || ''}
                                          onChange={e => setEditForm({ ...editForm, deadlineDate: e.target.value })}
                                        />
                                      </div>
                                      <div className="space-y-2">
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
                        {/* Upload Button */}
                        <Button size="sm" variant="outline" onClick={() => handleOpenDocumentUpload(c._id)}>
                          <Upload className="w-4 h-4 mr-1" /> Upload
                        </Button>
                        {/* Delete Button */}
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
                        {/* Upload Dialog */}
                        <Dialog open={!!showDocumentUpload && uploadCaseId === c._id} onOpenChange={setShowDocumentUpload}>
                          <DialogContent showCloseButton={false} className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Upload Documents</DialogTitle>
                            </DialogHeader>
                            <QuickDocumentUpload
                              caseId={c._id}
                              onClose={handleCloseDocumentUpload}
                              onSuccess={handleDocumentUploadSuccess}
                            />
                          </DialogContent>
                        </Dialog>
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