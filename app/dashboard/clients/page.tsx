"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Plus, Eye, Trash2 } from "lucide-react";
import NewClientForm from "@/components/forms/NewClientForm";

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
    } catch (err) {
      setClientCases([]);
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
                  {clientCases.map(c => (
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