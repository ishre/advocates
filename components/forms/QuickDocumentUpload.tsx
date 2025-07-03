import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, CheckCircle } from 'lucide-react';

interface QuickDocumentUploadProps {
  caseId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickDocumentUpload({ caseId, onClose, onSuccess }: QuickDocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file.');
      return;
    }
    setUploading(true);
    setProgress(Array(files.length).fill(0));
    setError('');
    let allSuccess = true;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseId);
      try {
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          allSuccess = false;
          const errorData = await response.json();
          setError(errorData.error || 'Failed to upload one or more files.');
        }
        setProgress((prev) => prev.map((p, idx) => (idx === i ? 100 : p)));
      } catch (err) {
        allSuccess = false;
        setError('Failed to upload one or more files.');
      }
    }
    setUploading(false);
    if (allSuccess) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" /> Quick Upload
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} disabled={uploading}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-10 w-10 text-green-600 mb-2" />
            <div className="text-green-700 font-semibold">All documents uploaded!</div>
          </div>
        ) : (
          <>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer mb-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('quick-upload-input')?.click()}
              style={{ background: files.length ? '#f9fafb' : undefined }}
            >
              <input
                id="quick-upload-input"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                disabled={uploading}
              />
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Click or drag & drop files here to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB each)
              </p>
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 rounded p-2">
                      <span className="text-sm font-medium">{file.name}</span>
                      {uploading && (
                        <span className="text-xs text-gray-500 ml-2">{progress[idx]}%</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && (
              <div className="text-red-600 text-sm mb-2">{error}</div>
            )}
            <Button
              type="button"
              className="w-full"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
} 