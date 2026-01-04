-- Allow project owners to delete any comment on their projects
CREATE POLICY "Project owners can delete comments on their projects"
ON public.comments
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = comments.project_id 
    AND projects.user_id = auth.uid()
  )
);