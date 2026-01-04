import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  createdAt: string;
  author: string;
  avatarUrl?: string;
}

interface DbComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export function useComments(projectId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        project_id,
        user_id,
        content,
        created_at,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(
        (data as DbComment[]).map((c) => ({
          id: c.id,
          projectId: c.project_id,
          userId: c.user_id,
          content: c.content,
          createdAt: c.created_at,
          author: c.profiles?.username || "Anonymous",
          avatarUrl: c.profiles?.avatar_url || undefined,
        }))
      );
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (userId: string, content: string, commenterName?: string): Promise<boolean> => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      toast.error("Comment cannot be empty");
      return false;
    }

    const { error } = await supabase.from("comments").insert({
      project_id: projectId,
      user_id: userId,
      content: trimmedContent,
    });

    if (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      return false;
    }

    // Send email notification to project owner (fire and forget)
    supabase.functions.invoke("notify-comment", {
      body: {
        projectId,
        commenterId: userId,
        commenterName: commenterName || "Someone",
        commentContent: trimmedContent,
      },
    }).catch((err) => console.error("Failed to send notification:", err));

    await fetchComments();
    toast.success("Comment added!");
    return true;
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
      return false;
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    toast.success("Comment deleted");
    return true;
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
}
