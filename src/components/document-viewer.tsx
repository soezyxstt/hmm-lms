// ~/components/viewers/document-viewer.tsx - Updated version
'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatFileSize } from '~/lib/file-utils';
import Image from 'next/image';

interface Document {
  id: string;
  title: string;
  filename: string;
  mimeType: string;
  size: number;
  type: string;
  createdAt: Date;
  uploadedBy: {
    name: string;
  };
}

interface DocumentViewerProps {
  document: Document;
}

export default function DocumentViewer({ document }: DocumentViewerProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getDocumentUrl = (action: 'view' | 'download' = 'view') => {
    return `/api/documents/${document.id}?action=${action}`;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(getDocumentUrl('download'));
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.filename;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);

      toast.success('Document downloaded successfully');
    } catch {
      toast.error('Failed to download document');
    } finally {
      setIsDownloading(false);
    }
  };

  const getIcon = () => {
    if (document.mimeType.includes('pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (document.mimeType.includes('presentation') || document.mimeType.includes('powerpoint')) {
      return <FileText className="h-8 w-8 text-orange-500" />;
    } else if (document.mimeType.includes('word')) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    } else if (document.mimeType.includes('sheet') || document.mimeType.includes('excel') || document.mimeType.includes('csv')) {
      return <FileText className="h-8 w-8 text-green-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const canPreview = document.mimeType === 'application/pdf' ||
    document.mimeType.includes('image/');

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-3">
        {getIcon()}
        <div>
          <h4 className="font-medium">{document.title}</h4>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(document.size)} • Uploaded by {document.uploadedBy.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canPreview && (
          <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl h-[90vh]">
              <DialogHeader>
                <DialogTitle>{document.title}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 relative">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
                {document.mimeType === 'application/pdf' ? (
                  <iframe
                    src={getDocumentUrl('view')}
                    className="w-full h-full border-0 rounded"
                    onLoad={() => setIsLoading(false)}
                    onLoadStart={() => setIsLoading(true)}
                    title={document.title}
                  />
                ) : document.mimeType.includes('image/') ? (
                  <Image
                    src={getDocumentUrl('view')}
                    alt={document.title}
                    className="w-full h-full object-contain rounded"
                    onLoad={() => setIsLoading(false)}
                    onLoadStart={() => setIsLoading(true)}
                  />
                ) : null}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}