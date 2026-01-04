import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LikeData {
  projectId: string;
  count: number;
  hasLiked: boolean;
}

export function useLikes(userId: string | undefined) {
  const [likes, setLikes] = useState<Map<string, LikeData>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchLikes = useCallback(async () => {
    const { data: likesData, error } = await supabase
      .from("project_likes")
      .select("project_id, user_id");

    if (error) {
      console.error("Failed to fetch likes:", error);
      return;
    }

    const likesMap = new Map<string, LikeData>();
    
    likesData?.forEach((like) => {
      const existing = likesMap.get(like.project_id);
      if (existing) {
        existing.count++;
        if (like.user_id === userId) {
          existing.hasLiked = true;
        }
      } else {
        likesMap.set(like.project_id, {
          projectId: like.project_id,
          count: 1,
          hasLiked: like.user_id === userId,
        });
      }
    });

    setLikes(likesMap);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  const toggleLike = async (projectId: string) => {
    if (!userId) {
      toast.error("Please sign in to like projects");
      return;
    }

    const currentLike = likes.get(projectId);
    const hasLiked = currentLike?.hasLiked || false;

    // Optimistic update
    setLikes((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(projectId);
      if (existing) {
        newMap.set(projectId, {
          ...existing,
          count: hasLiked ? existing.count - 1 : existing.count + 1,
          hasLiked: !hasLiked,
        });
      } else {
        newMap.set(projectId, {
          projectId,
          count: 1,
          hasLiked: true,
        });
      }
      return newMap;
    });

    if (hasLiked) {
      const { error } = await supabase
        .from("project_likes")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to unlike:", error);
        fetchLikes(); // Revert on error
      }
    } else {
      const { error } = await supabase
        .from("project_likes")
        .insert({ project_id: projectId, user_id: userId });

      if (error) {
        console.error("Failed to like:", error);
        fetchLikes(); // Revert on error
      }
    }
  };

  const getLikeData = (projectId: string): LikeData => {
    return likes.get(projectId) || { projectId, count: 0, hasLiked: false };
  };

  return { getLikeData, toggleLike, loading };
}
