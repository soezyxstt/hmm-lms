// ~/components/document-viewer.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Link as LinkIcon, ExternalLink, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ResourceType, LinkSource, type Prisma } from '@prisma/client';
import { getCdnUrl } from '~/lib/utils';

// Define the type for the resource
type Resource = Prisma.ResourceGetPayload<{
  include: {
    attachment: true;
    link: true;
    uploadedBy: { select: { name: true } };
  };
}>;

interface DocumentViewerProps {
  resource: Resource;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

// Function to check for MS Office documents
const isMsOfficeFile = (mimeType: string) => {
  const msOfficeMimeTypes = [
    'application/vnd.ms-word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  return msOfficeMimeTypes.includes(mimeType);
};

// Function to check for image files
const isImageFile = (mimeType: string) => {
  const imageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
  ];
  return imageMimeTypes.includes(mimeType);
};

// Function to get the correct URL for the document viewer or download
const getDocUrl = (resource: Resource) => {
  if (resource.type === ResourceType.FILE && resource.attachment) {
    if (isMsOfficeFile(resource.attachment.mimeType)) {
      const cdnUrl = getCdnUrl(resource.attachment.key);
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(cdnUrl)}`;
    }
    return `/api/documents/${resource.id}`;
  }
  if (resource.type === ResourceType.LINK && resource.link) {
    if (resource.link.source === LinkSource.YOUTUBE) {
      const videoId = resource.link.url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (resource.link.source === LinkSource.GOOGLE_DRIVE) {
      const fileIdMatch = /\/d\/(.*?)\//.exec(resource.link.url);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
    }
    return null;
  }
  return null;
};

export default function DocumentViewer({ resource, open, onOpenChange }: DocumentViewerProps) {
  const docUrl = getDocUrl(resource);

  // Determine if the resource is an image file
  const isImage = resource.type === ResourceType.FILE && resource.attachment && isImageFile(resource.attachment.mimeType);

  // Check if it's a link that can be embedded (YouTube or Google Drive)
  const isEmbeddableLink = resource.type === ResourceType.LINK && docUrl !== null;

  // The fallback is now only for links that are NOT embeddable
  const showFallback = resource.type === ResourceType.LINK && !isEmbeddableLink;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-full h-full flex flex-col p-0 max-h-screen min-h-screen overflow-y-auto">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2">
            {resource.type === ResourceType.LINK ? <LinkIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            <span className="flex-1 truncate">{resource.title}</span>
          </DialogTitle>
          {/* Include description from original code */}
          <p className="text-sm text-muted-foreground">
            {resource.description ?? `Uploaded on ${format(resource.createdAt, 'MMM dd, yyyy')}`}
          </p>
        </DialogHeader>

        {showFallback ? (
          // Fallback for non-embeddable links
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <ExternalLink className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">This link cannot be embedded.</p>
            <p className="text-sm text-muted-foreground mb-4">
              This viewer only supports YouTube and Google Drive links. Click the button below to open the URL in a new tab.
            </p>
            <Button asChild>
              <a href={resource.link?.url} target="_blank" rel="noopener noreferrer">
                Open Link <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        ) : isImage ? (
          // Render the Next.js Image component for images
          <div className="relative flex-1 flex items-center justify-center p-4">
            <Image
              src={docUrl ?? ''}
              alt={resource.title}
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-lg shadow-md"
            />
          </div>
        ) : (
          // Render the iframe for all other document types (files, embeddable links)
          <div className="relative flex-1 overflow-hidden">
            <iframe
              src={docUrl ?? ''}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title={resource.title}
              allowFullScreen
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}