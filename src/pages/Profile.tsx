import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Code2, 
  Loader2, 
  User, 
  Pencil,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Facebook
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@/hooks/useProjects";
import { useLikes } from "@/hooks/useLikes";
import { toast } from "sonner";

interface ProfileData {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  website_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  substack_url: string | null;
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const fetchProfileAndProjects = async () => {
      if (!userId) return;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

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

  const handleSaveProfile = async (data: {
    username: string;
    bio: string;
    website_url: string;
    github_url: string;
    twitter_url: string;
    linkedin_url: string;
    facebook_url: string;
    substack_url: string;
  }) => {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: data.username || null,
        bio: data.bio || null,
        website_url: data.website_url || null,
        github_url: data.github_url || null,
        twitter_url: data.twitter_url || null,
        linkedin_url: data.linkedin_url || null,
        facebook_url: data.facebook_url || null,
        substack_url: data.substack_url || null,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to update profile");
      throw error;
    }

    setProfile(prev => prev ? { ...prev, ...data } : null);
    setIsEditingProfile(false);
    toast.success("Profile updated!");
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
          <h1 className="mt-4 text-2xl font-semibold text-foreground">User not found</h1>
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

  const socialLinks = [
    { url: profile.website_url, icon: Globe, label: "Website" },
    { url: profile.github_url, icon: Github, label: "GitHub" },
    { url: profile.twitter_url, icon: Twitter, label: "X" },
    { url: profile.linkedin_url, icon: Linkedin, label: "LinkedIn" },
    { url: profile.facebook_url, icon: Facebook, label: "Facebook" },
    { 
      url: profile.substack_url, 
      icon: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
        </svg>
      ), 
      label: "Substack" 
    },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{profile.username || "User"} | AI Builders Community</title>
        <meta name="description" content={`View ${profile.username || "User"}'s profile and AI projects on AI Builders Community.${profile.bio ? ` ${profile.bio}` : ""}`} />
        <meta name="keywords" content={`${profile.username}, AI projects, developer, AI Builders`} />
        <meta property="og:title" content={`${profile.username || "User"} | AI Builders Community`} />
        <meta property="og:description" content={`View ${profile.username || "User"}'s AI projects.`} />
        <meta property="og:type" content="profile" />
      </Helmet>

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

          {isEditingProfile ? (
            <ProfileEditForm
              userId={userId!}
              avatarUrl={profile.avatar_url}
              initialData={{
                username: profile.username || "",
                bio: profile.bio || "",
                website_url: profile.website_url || "",
                github_url: profile.github_url || "",
                twitter_url: profile.twitter_url || "",
                linkedin_url: profile.linkedin_url || "",
                facebook_url: profile.facebook_url || "",
                substack_url: profile.substack_url || "",
              }}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditingProfile(false)}
              onAvatarChange={(url) => setProfile(prev => prev ? { ...prev, avatar_url: url } : null)}
            />
          ) : (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
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
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile.username || "Anonymous"}
                  </h1>
                  {profile.bio && (
                    <p className="mt-2 text-muted-foreground max-w-xl">
                      {profile.bio}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {projects.length} project{projects.length !== 1 ? "s" : ""} shared
                  </p>

                  {/* Social Links */}
                  {socialLinks.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {socialLinks.map((link, index) => {
                        const Icon = link.icon;
                        return (
                          <a
                            key={index}
                            href={link.url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
                          >
                            <Icon />
                            <span className="hidden sm:inline">{link.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {isOwnProfile && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingProfile(true)}
                  className="shrink-0"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Projects Grid */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-xl font-semibold text-foreground">Projects</h2>

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

      <Footer />
    </div>
  );
};

export default Profile;
