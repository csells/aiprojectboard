import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { useComments, Comment } from "@/hooks/useComments";
import { formatDistanceToNow } from "date-fns";

interface ProjectCommentsProps {
  projectId: string;
  userId?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  commentCount?: number;
}

export function ProjectComments({ 
  projectId, 
  userId, 
  isExpanded = false,
  onToggle,
  commentCount: initialCount 
}: ProjectCommentsProps) {
  const { comments, loading, addComment, deleteComment } = useComments(projectId);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userId || !newComment.trim()) return;
    
    setSubmitting(true);
    const success = await addComment(userId, newComment);
    if (success) {
      setNewComment("");
    }
    setSubmitting(false);
  };

  const displayCount = comments.length || initialCount || 0;

  if (!isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="gap-1.5"
      >
        <MessageCircle className="h-4 w-4" />
        {displayCount > 0 && <span>{displayCount}</span>}
      </Button>
    );
  }

  return (
    <div className="border-t border-border pt-4 mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Comments ({comments.length})
        </h4>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          Close
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwner={userId === comment.userId}
                onDelete={() => deleteComment(comment.id)}
              />
            ))
          )}
        </div>
      )}

      {userId ? (
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            className="shrink-0"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Sign in to join the discussion
        </p>
      )}
    </div>
  );
}

function CommentItem({ 
  comment, 
  isOwner, 
  onDelete 
}: { 
  comment: Comment; 
  isOwner: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-3 group">
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarImage src={comment.avatarUrl} />
        <AvatarFallback className="text-xs bg-secondary">
          {comment.author.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {comment.author}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          )}
        </div>
        <p className="text-sm text-secondary-foreground mt-0.5 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
