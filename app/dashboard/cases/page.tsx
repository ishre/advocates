"use client";
import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

interface Case {
  _id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  status: string;
  createdAt: string;
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
  const [viewCase, setViewCase] = useState<Case | null>(null);
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [deleteCase, setDeleteCase] = useState<Case | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const fetchCases = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
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

  useEffect(() => {
    fetchCases();
    // eslint-disable-next-line
  }, [page, limit, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Cases</h1>
      <form onSubmit={handleSearch} className="mb-4 flex gap-2 items-center">
        <Input
          type="text"
          placeholder="Search by case number, title, or client name"
          className="w-64"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <Button type="submit">Search</Button>
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
                <TableHead>Case Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">No cases found.</TableCell>
                </TableRow>
              ) : (
                cases.map((c, idx) => (
                  <TableRow key={c._id} className={idx % 2 === 0 ? "bg-muted/50" : ""}>
                    <TableCell>{c.caseNumber}</TableCell>
                    <TableCell>{c.title}</TableCell>
                    <TableCell>{c.clientName}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {/* Desktop: show separate buttons */}
                      <div className="hidden md:inline-flex gap-2">
                        <Dialog open={!!viewCase && viewCase._id === c._id} onOpenChange={open => !open && setViewCase(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setViewCase(c)}><Eye className="w-4 h-4 mr-1" /> View</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Case Details</DialogTitle>
                              <DialogDescription>View all details for this case.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                              <div><b>Case Number:</b> {viewCase?.caseNumber}</div>
                              <div><b>Title:</b> {viewCase?.title}</div>
                              <div><b>Client:</b> {viewCase?.clientName}</div>
                              <div><b>Status:</b> {viewCase?.status}</div>
                              <div><b>Created At:</b> {viewCase && new Date(viewCase.createdAt).toLocaleDateString()}</div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="secondary">Close</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Dialog open={!!editCase && editCase._id === c._id} onOpenChange={open => !open && setEditCase(null)}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary" onClick={() => { setEditCase(c); setEditForm({ ...c }); }}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Case</DialogTitle>
                              <DialogDescription>Edit the details and save changes.</DialogDescription>
                            </DialogHeader>
                            {editForm && (
                              <form className="space-y-2" onSubmit={async e => {
                                e.preventDefault();
                                // TODO: Call update API here
                                setEditCase(null);
                              }}>
                                <div>
                                  <label className="block text-sm font-medium">Title</label>
                                  <Input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium">Status</label>
                                  <Input value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} />
                                </div>
                                <DialogFooter>
                                  <Button type="submit">Save</Button>
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
                              <Button variant="destructive" onClick={async () => {
                                // TODO: Call delete API here
                                setDeleteCase(null);
                              }}>Delete</Button>
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
                            <DropdownMenuItem onClick={() => setViewCase(c)}><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setEditCase(c); setEditForm({ ...c }); }}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
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
    </div>
  );
} 