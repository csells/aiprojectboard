import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectForm } from "@/components/ProjectForm";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { FilterBar } from "@/components/FilterBar";
import { Rocket, Code2, Users, Loader2, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, Project } from "@/hooks/useProjects";
import { useLikes } from "@/hooks/useLikes";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject } = useProjects();
  const { getLikeData, toggleLike } = useLikes(user?.id);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [showContributorsOnly, setShowContributorsOnly] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        search === "" ||
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(search.toLowerCase())) ||
        project.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesContributors = !showContributorsOnly || project.lookingForContributors;

      return matchesSearch && matchesContributors;
    });
  }, [projects, search, showContributorsOnly]);

  const handleNewProject = async (projectData: {
    title: string;
    description: string;
    screenshot?: string;
    repoUrl?: string;
    liveUrl?: string;
    lookingForContributors: boolean;
    tags: string[];
  }) => {
    if (!user) return;
    await createProject(user.id, projectData);
    setShowProjectForm(false);
  };

  const handleEditProject = async (projectId: string, projectData: {
    title: string;
    description: string;
    screenshot?: string;
    repoUrl?: string;
    liveUrl?: string;
    lookingForContributors: boolean;
    tags: string[];
  }) => {
    await updateProject(projectId, projectData);
    setEditingProject(null);
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
  };

  const username = user?.user_metadata?.username || user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={!!user}
        userName={username}
        onLogin={() => navigate("/auth")}
        onLogout={signOut}
        onNewProject={() => setShowProjectForm(true)}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Rocket className="h-4 w-4" />
              Community Building Board
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              What Are You{" "}
              <span className="text-gradient">Building?</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Share your AI projects, find collaborators, and get inspired by what fellow community members are creating.
            </p>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <span>{projects.length} Projects Shared</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span>{projects.filter(p => p.lookingForContributors).length} Looking for Help</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <span>Show some love!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          showContributorsOnly={showContributorsOnly}
          onContributorsToggle={() => setShowContributorsOnly(!showContributorsOnly)}
          projectCount={filteredProjects.length}
        />

        {projectsLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Code2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl text-foreground">No projects found</h3>
            <p className="mt-2 text-muted-foreground">
              {search || showContributorsOnly
                ? "Try adjusting your filters"
                : "Be the first to share your project!"}
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                style={{ animationDelay: `${index * 100}ms` }}
                isOwner={user?.id === project.userId}
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

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with 🎩 by the{" "}
            <a
              href="https://natesnewsletter.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Nate's Substack
            </a>{" "}
            community
          </p>
        </div>
      </footer>

      {/* Project Form Dialog */}
      <ProjectForm
        open={showProjectForm}
        onOpenChange={setShowProjectForm}
        userId={user?.id}
        onSubmit={handleNewProject}
      />

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

export default Index;
