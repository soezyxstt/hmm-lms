'use client';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { MessageSquare, ChevronDown, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { type RouterOutputs, api } from '~/trpc/react';
import { EditorProvider } from '~/components/ui/shadcn-io/editor';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import MotionImageDialog from '~/components/motion/dialog';

type AnnouncementWithRelations = RouterOutputs['announcement']['getAll'][number];

interface AnnouncementCardProps {
  announcement: AnnouncementWithRelations;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const { createdBy, course, _count, createdAt, title, content, scope, id, images } = announcement;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  // Get replies when expanded
  const { data: announcementWithReplies } = api.announcement.getById.useQuery(
    { id },
    { enabled: showReplies }
  );

  const addReplyMutation = api.announcement.addReply.useMutation({
    onSuccess: () => {
      toast.success('Reply added successfully');
      setReplyContent('');
      void utils.announcement.getById.invalidate({ id });
      void utils.announcement.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Parse the JSON content
  const parsedContent: string =
    typeof content === 'string' ? (JSON.parse(content) as string) : content;

  // Check if content height exceeds threshold after editor renders
  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const editorElement = contentRef.current.querySelector('.ProseMirror');
        if (editorElement) {
          const height = editorElement.scrollHeight;
          setShowSeeMore(height > 150);
          return true;
        }
      }
      return false;
    };

    if (checkHeight()) return;

    const observer = new MutationObserver(() => {
      if (checkHeight()) {
        observer.disconnect();
      }
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
      });
    }

    const timeout = setTimeout(() => {
      checkHeight();
      observer.disconnect();
    }, 1000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmitReply = () => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    addReplyMutation.mutate({
      announcementId: id,
      content: replyContent,
    });
  };

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary transition-shadow hover:shadow-md">
      <div className="px-6 py-4">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={createdBy.image ?? undefined} alt={createdBy.name ?? 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(createdBy.name ?? 'U')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">
                {createdBy.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              {scope === 'COURSE' && course && (
                <Badge variant="secondary" className="text-xs">
                  {course.title}
                </Badge>
              )}
              {scope === 'GLOBAL' && (
                <Badge variant="default" className="text-xs">
                  Global
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-3">{title}</h3>

        {/* Images Section */}
        {images && images.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((imageUrl, index) => (
                <div key={index} className="relative flex-shrink-0">
                  <MotionImageDialog
                    layoutId={`announcement-${id}-image-${index}`}
                    src={imageUrl}
                    alt={`${title} - Image ${index + 1}`}
                    width={500}
                    height={500}
                    className="object-cover rounded-md h-32 w-auto"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content - Rendered with EditorProvider (read-only) */}
        <div
          ref={contentRef}
          className={`text-foreground mb-4 relative ${!isExpanded && showSeeMore ? 'max-h-[150px] overflow-hidden' : ''
            }`}
        >
          <EditorProvider
            content={parsedContent}
            editable={false}
            immediatelyRender={false}
            editorProps={{
              attributes: {
                class: 'focus:outline-none',
              },
            }}
            className="text-sm"
          />
          {!isExpanded && showSeeMore && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
          )}
        </div>

        {/* See More Button */}
        {showSeeMore && (
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 text-primary hover:text-primary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'See less' : 'See more'}
            <ChevronDown
              className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''
                }`}
            />
          </Button>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <button
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setShowReplies(!showReplies)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>
              {_count.replies} {_count.replies === 1 ? 'Reply' : 'Replies'}
            </span>
          </button>
        </div>

        {/* Replies Section */}
        {showReplies && (
          <div className="mt-4 pt-4 border-t border-border space-y-4">
            {/* Reply Form */}
            <div className="relative">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full min-h-[80px] p-3 pr-24 text-sm border border-border rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={addReplyMutation.isPending}
              />
              <div className="absolute bottom-2 right-2">
                <Button
                  size="sm"
                  onClick={handleSubmitReply}
                  disabled={addReplyMutation.isPending || !replyContent.trim()}
                >
                  {addReplyMutation.isPending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">Reply</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Replies List */}
            {announcementWithReplies?.replies && announcementWithReplies.replies.length > 0 && (
              <div className="space-y-3">
                {announcementWithReplies.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                    <Avatar className="h-7 w-7">
                      <AvatarImage
                        src={reply.user.image ?? undefined}
                        alt={reply.user.name ?? 'User'}
                      />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {getInitials(reply.user.name ?? 'U')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-foreground">
                          {reply.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div className="text-sm text-foreground">
                        <p className="">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
