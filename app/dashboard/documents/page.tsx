"use client";
import { useEffect, useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DocumentUpload from '@/components/forms/DocumentUpload';
import { Upload, Eye } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface DocumentRow {
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  clientName: string;
  document: {
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedAt: string;
    uploadedBy: string | null;
    description?: string;
    date?: string;
    tags?: string;
  };
}

export default function AllDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<DocumentRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [viewDoc, setViewDoc] = useState<DocumentRow | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch documents');
      setDocuments(data.documents || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, [page, limit, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    fetchDocuments();
  };

  const handleDelete = async () => {
    if (!deleteDoc) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: deleteDoc.caseId, documentName: deleteDoc.document.name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete document');
      }
      setDeleteDoc(null);
      fetchDocuments();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete document');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Documents</h1>
      <form onSubmit={handleSearch} className="flex gap-2 items-center max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search by document name, type, case, or client"
          className="pl-4"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <Button type="submit">Search</Button>
        <Button type="button" variant="default" className="ml-auto" onClick={() => setShowUpload(true)}>
          <Upload className="w-4 h-4 mr-1" /> Upload Document
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
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Case Number</TableHead>
                <TableHead>Case Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Uploaded At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">No documents found.</TableCell>
                </TableRow>
              ) : (
                documents.map((row, idx) => (
                  <TableRow key={row.caseId + '-' + row.document.name + '-' + idx}>
                    <TableCell>{row.document.name}</TableCell>
                    <TableCell><Badge>{row.document.type}</Badge></TableCell>
                    <TableCell>{row.caseNumber}</TableCell>
                    <TableCell>{row.caseTitle}</TableCell>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.document.uploadedAt ? new Date(row.document.uploadedAt).toLocaleDateString() : ''}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setViewDoc(row)} title="View Document">
                        <Eye className="w-5 h-5" />
                      </Button>
                      <Button variant="destructive" size="sm" className="ml-2" onClick={() => setDeleteDoc(row)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
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
            {[20, 50, 100].map(opt => (
              <option key={opt} value={opt}>{opt} per page</option>
            ))}
          </select>
        </div>
      </div>
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <DocumentUpload onClose={() => setShowUpload(false)} onSuccess={handleUploadSuccess} />
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDoc} onOpenChange={() => setDeleteDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
          </DialogHeader>
          {deleteError && <div className="text-red-600 mb-2">{deleteError}</div>}
          <div>Are you sure you want to delete <b>{deleteDoc?.document.name}</b> from case <b>{deleteDoc?.caseNumber}</b>?</div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setDeleteDoc(null)} disabled={deleteLoading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Document Viewer Dialog */}
      <Sheet open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <SheetContent side="bottom" className="h-screen w-screen p-0 m-0">
          <SheetHeader className="p-4 pb-0 ">
            <SheetTitle>View Document</SheetTitle>
          </SheetHeader>
          {viewDoc && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {viewDoc.document.type === 'application/pdf' ? (
                <iframe src={viewDoc.document.url} title="PDF Preview" className="w-full h-full rounded border" />
              ) : viewDoc.document.type.startsWith('image/') ? (
                <img src={viewDoc.document.url} alt={viewDoc.document.name} className="max-h-full max-w-full rounded border" />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <p className="mb-2">Preview not available for this file type.</p>
                  <a href={viewDoc.document.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download</a>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
} 