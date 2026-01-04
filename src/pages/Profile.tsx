import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ProjectCard } from "@/components/ProjectCard";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code2, Loader2, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@/hooks/useProjects";
import { useLikes } from "@/hooks/useLikes";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { getLikeData, toggleLike } = useLikes(user?.id);
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProfileAndProjects = async () => {
      if (!userId) return;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Failed to fetch profile:", profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch user's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*, profiles(username)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("Failed to fetch projects:", projectsError);
      } else {
        setProjects(
          projectsData.map((p) => ({
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
          }))
        );
      }

      setLoading(false);
    };

    fetchProfileAndProjects();
  }, [userId]);

  const handleEditProject = async (projectId: string, projectData: {
    title: string;
    description: string;
    screenshot?: string;
    repoUrl?: string;
    liveUrl?: string;
    lookingForContributors: boolean;
    tags: string[];
  }) => {
    const { error } = await supabase
      .from("projects")
      .update({
        title: projectData.title,
        description: projectData.description,
        screenshot_url: projectData.screenshot || null,
        repo_url: projectData.repoUrl || null,
        live_url: projectData.liveUrl || null,
        looking_for_contributors: projectData.lookingForContributors,
        tags: projectData.tags,
      })
      .eq("id", projectId);

    if (error) {
      toast.error("Failed to update project");
      return;
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, ...projectData }
          : p
      )
    );
    setEditingProject(null);
    toast.success("Project updated!");
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      toast.error("Failed to delete project");
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    toast.success("Project deleted");
  };

  const username = user?.user_metadata?.username || user?.email?.split("@")[0];
  const isOwnProfile = user?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          isLoggedIn={!!user}
          userName={username}
          onLogin={() => navigate("/auth")}
          onLogout={signOut}
          onNewProject={() => {}}
        />
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          isLoggedIn={!!user}
          userName={username}
          onLogin={() => navigate("/auth")}
          onLogout={signOut}
          onNewProject={() => {}}
        />
        <div className="container mx-auto px-4 py-16 text-center">
          <User className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 font-serif text-2xl text-foreground">User not found</h1>
          <Button asChild className="mt-6" variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={!!user}
        userName={username}
        onLogin={() => navigate("/auth")}
        onLogout={signOut}
        onNewProject={() => navigate("/")}
      />

      {/* Profile Header */}
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || "User"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">
                {profile.username || "Anonymous"}
              </h1>
              <p className="text-muted-foreground">
                {projects.length} project{projects.length !== 1 ? "s" : ""} shared
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="mb-6 font-serif text-xl text-foreground">Projects</h2>

        {projects.length === 0 ? (
          <div className="py-16 text-center">
            <Code2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {isOwnProfile
                ? "You haven't shared any projects yet."
                : "This user hasn't shared any projects yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                style={{ animationDelay: `${index * 100}ms` }}
                isOwner={isOwnProfile}
                onEdit={setEditingProject}
                onDelete={handleDeleteProject}
                likeCount={getLikeData(project.id).count}
                hasLiked={getLikeData(project.id).hasLiked}
                onLike={() => toggleLike(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Project Dialog */}
      <EditProjectDialog
        project={editingProject}
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
        onSubmit={handleEditProject}
      />
    </div>
  );
};

export default Profile;
