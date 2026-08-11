'use client';

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, CornerDownRight, Send } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies?: Comment[];
}

export function CommentsSection({ videoId }: { videoId: string }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  // Fetch comments
  const { data, isLoading } = useQuery<{ success: boolean; data: { comments: Comment[] } }>({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${videoId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
  });

  // Post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
      setNewComment("");
      setReplyContent("");
      setReplyToId(null);
      toast.success("Comment posted!");
    },
    onError: () => {
      toast.error("Failed to post comment. Make sure you are signed in!");
    },
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postCommentMutation.mutate({ content: newComment });
  };

  const handlePostReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    postCommentMutation.mutate({ content: replyContent, parentId });
  };

  const comments = data?.data?.comments || [];

  return (
    <div className="space-y-6 pt-6 border-t border-border/40">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-display font-extrabold text-lg tracking-tight">
          Comments ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* New Comment Input Box */}
      {session ? (
        <form onSubmit={handlePostComment} className="flex gap-4">
          <Avatar className="h-9 w-9 border border-border/60">
            <AvatarImage src={session.user?.image || ""} />
            <AvatarFallback>{session.user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a public comment..."
              className="min-h-[80px] bg-muted/20 border-border/60 focus-visible:ring-primary rounded-xl"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                size="sm"
                className="rounded-full px-4 font-semibold shadow-md shadow-primary/10 gap-1.5"
                disabled={postCommentMutation.isPending || !newComment.trim()}
              >
                <Send className="h-3.5 w-3.5" />
                Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 bg-muted/10 border border-border/30 rounded-2xl">
          <p className="text-sm text-muted-foreground">
            Please sign in to join the conversation.
          </p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-9 w-9 rounded-full bg-muted" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => {
          const initials = comment.user.name?.[0]?.toUpperCase() || "U";
          return (
            <div key={comment.id} className="space-y-4">
              <div className="flex gap-3 group">
                <Avatar className="h-9 w-9 border border-border/50">
                  <AvatarImage src={comment.user.image || ""} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {comment.user.name || "Anonymous User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(comment.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                  
                  {/* Actions (Like, Reply triggers) */}
                  <div className="flex items-center gap-4 pt-1">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{comment.likes}</span>
                    </button>
                    {session && (
                      <button
                        onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                        className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply Input Box */}
              {replyToId === comment.id && (
                <div className="flex gap-3 ml-12 pl-2 border-l-2 border-border/40">
                  <Textarea
                    placeholder="Write a reply..."
                    className="min-h-[60px] bg-muted/10 border-border/40 focus-visible:ring-primary rounded-lg flex-1"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div className="flex flex-col justify-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePostReply(comment.id)}
                      disabled={postCommentMutation.isPending || !replyContent.trim()}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReplyToId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Nested Replies list */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-4 ml-12 pl-2 border-l border-border/40">
                  {comment.replies.map((reply) => {
                    const rInitials = reply.user.name?.[0]?.toUpperCase() || "U";
                    return (
                      <div key={reply.id} className="flex gap-3">
                        <CornerDownRight className="h-4 w-4 text-muted-foreground/40 mt-1 shrink-0" />
                        <Avatar className="h-7 w-7 border border-border/40">
                          <AvatarImage src={reply.user.image || ""} />
                          <AvatarFallback>{rInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {reply.user.name || "Anonymous User"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatRelativeTime(new Date(reply.createdAt))}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
