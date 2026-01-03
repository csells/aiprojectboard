import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Project {
  id: string;
  title: string;
  description: string | null;
  author: string;
  screenshot?: string;
  repoUrl?: string;
  liveUrl?: string;
  lookingForContributors: boolean;
  tags: string[];
  createdAt: Date;
  userId: string;
}

interface DbProject {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  screenshot_url: string | null;
  repo_url: string | null;
  live_url: string | null;
  tags: string[] | null;
  looking_for_contributors: boolean | null;
  created_at: string;
  profiles: { username: string | null } | null;
}

function mapDbToProject(p: DbProject): Project {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    author: p.profiles?.username || "Anonymous",
    screenshot: p.screenshot_url || undefined,
    repoUrl: p.repo_url || undefined,
    liveUrl: p.live_url || undefined,
    lookingForContributors: p.looking_for_contributors || false,
    tags: p.tags || [],
    createdAt: new Date(p.created_at),
    userId: p.user_id,
  };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load projects");
      console.error(error);
    } else {
      setProjects((data as DbProject[]).map(mapDbToProject));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async (
    userId: string,
    projectData: {
      title: string;
      description: string;
      screenshot?: string;
      repoUrl?: string;
      liveUrl?: string;
      lookingForContributors: boolean;
      tags: string[];
    }
  ) => {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        title: projectData.title,
        description: projectData.description,
        screenshot_url: projectData.screenshot || null,
        repo_url: projectData.repoUrl || null,
        live_url: projectData.liveUrl || null,
        looking_for_contributors: projectData.lookingForContributors,
        tags: projectData.tags,
      })
      .select("*, profiles(username)")
      .single();

    if (error) {
      toast.error("Failed to create project");
      console.error(error);
      return null;
    }

    const newProject = mapDbToProject(data as DbProject);
    setProjects((prev) => [newProject, ...prev]);
    toast.success("Project shared!");
    return newProject;
  };

  const updateProject = async (
    projectId: string,
    projectData: Partial<{
      title: string;
      description: string;
      screenshot?: string;
      repoUrl?: string;
      liveUrl?: string;
      lookingForContributors: boolean;
      tags: string[];
    }>
  ) => {
    const updateData: Record<string, any> = {};
    if (projectData.title !== undefined) updateData.title = projectData.title;
    if (projectData.description !== undefined) updateData.description = projectData.description;
    if (projectData.screenshot !== undefined) updateData.screenshot_url = projectData.screenshot || null;
    if (projectData.repoUrl !== undefined) updateData.repo_url = projectData.repoUrl || null;
    if (projectData.liveUrl !== undefined) updateData.live_url = projectData.liveUrl || null;
    if (projectData.lookingForContributors !== undefined) updateData.looking_for_contributors = projectData.lookingForContributors;
    if (projectData.tags !== undefined) updateData.tags = projectData.tags;

    const { error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", projectId);

    if (error) {
      toast.error("Failed to update project");
      console.error(error);
      return false;
    }

    await fetchProjects();
    toast.success("Project updated!");
    return true;
  };

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      toast.error("Failed to delete project");
      console.error(error);
      return false;
    }

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    toast.success("Project deleted");
    return true;
  };

  return { projects, loading, createProject, updateProject, deleteProject, refetch: fetchProjects };
}
