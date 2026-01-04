-- Fix: PUBLIC_DATA_EXPOSURE on project_likes table
-- Users should only see their own likes, but aggregate counts should be public

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.project_likes;

-- Allow users to see only their own likes (to check if they've liked something)
CREATE POLICY "Users can view their own likes"
ON public.project_likes
FOR SELECT
USING (auth.uid() = user_id);

-- Create a security definer function to get like counts without exposing user data
CREATE OR REPLACE FUNCTION public.get_project_like_counts()
RETURNS TABLE(project_id uuid, like_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT project_id, COUNT(*) as like_count
  FROM project_likes
  GROUP BY project_id
$$;

-- Create a function to check if current user has liked a project
CREATE OR REPLACE FUNCTION public.has_user_liked_project(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_likes
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
  )
$$;