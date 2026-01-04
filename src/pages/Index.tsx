import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { ProjectForm } from "@/components/ProjectForm";
import { EditProjectDialog } from "@/components/EditProjectDialog";
import { FilterBar } from "@/components/FilterBar";
import { Sparkles, Cpu, Users, Loader2, Zap, Brain, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useProjects, Project } from "@/hooks/useProjects";
import { useLikes } from "@/hooks/useLikes";
import { Button } from "@/components/ui/button";

const PROJECTS_PER_PAGE = 9;

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject } = useProjects();
  const { getLikeData, toggleLike } = useLikes(user?.id);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [showContributorsOnly, setShowContributorsOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "ai" | "contributors" | "opensource">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        search === "" ||
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(search.toLowerCase())) ||
        project.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesContributors = !showContributorsOnly || project.lookingForContributors;

      // Apply category filter
      let matchesCategory = true;
      if (activeFilter === "ai") {
        matchesCategory = project.tags.some((tag) => 
          tag.toLowerCase().includes("ai") || 
          tag.toLowerCase().includes("ml") || 
          tag.toLowerCase().includes("llm") ||
          tag.toLowerCase().includes("machine learning") ||
          tag.toLowerCase().includes("gpt") ||
          tag.toLowerCase().includes("agent")
        );
      } else if (activeFilter === "contributors") {
        matchesCategory = project.lookingForContributors === true;
      } else if (activeFilter === "opensource") {
        matchesCategory = !!project.repoUrl;
      }

      return matchesSearch && matchesContributors && matchesCategory;
    });
  }, [projects, search, showContributorsOnly, activeFilter]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, showContributorsOnly, activeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [filteredProjects, currentPage]);

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
    <>
      <Helmet>
        <title>AI Builders Community | Share & Discover AI Projects</title>
        <meta name="description" content="A community showcase for AI builders. Share your AI agents, LLM apps, and machine learning projects. Find collaborators and get inspired." />
        <meta name="keywords" content="AI projects, machine learning, LLM, AI agents, open source, community, builders" />
        <link rel="canonical" href="https://ai-builders.lovable.app/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="AI Builders Community | Share & Discover AI Projects" />
        <meta property="og:description" content="A community showcase for AI builders. Share your projects and find collaborators." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ai-builders.lovable.app/" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Builders Community" />
        <meta name="twitter:description" content="Share your AI projects and find collaborators." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "AI Builders Community",
            "description": "A community showcase for AI builders to share projects and find collaborators",
            "url": "https://ai-builders.lovable.app/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://ai-builders.lovable.app/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          isLoggedIn={!!user}
          userName={username}
          onLogin={() => navigate("/auth")}
          onLogout={signOut}
          onNewProject={() => setShowProjectForm(true)}
        />

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="container mx-auto px-4 py-16 sm:py-24 relative">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm text-primary backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                AI Project Showcase
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Discover{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-pink-500 to-accent">
                  AI Projects
                </span>
                {" "}Built by the Community
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                Share your AI agents, LLM apps, and machine learning experiments. Find collaborators and get inspired by what builders are creating.
              </p>
              
              <nav className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm" aria-label="Project filters">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer",
                    activeFilter === "all"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/50 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span>All Projects</span>
                </button>
                <button
                  onClick={() => setActiveFilter("ai")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer",
                    activeFilter === "ai"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/50 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  <Brain className="h-5 w-5" />
                  <span>{projects.filter(p => p.tags.some(t => t.toLowerCase().includes("ai") || t.toLowerCase().includes("ml") || t.toLowerCase().includes("llm"))).length} AI Projects</span>
                </button>
                <button
                  onClick={() => setActiveFilter("contributors")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer",
                    activeFilter === "contributors"
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card/50 border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                  )}
                >
                  <Users className="h-5 w-5" />
                  <span>{projects.filter(p => p.lookingForContributors).length} Need Collaborators</span>
                </button>
                <button
                  onClick={() => setActiveFilter("opensource")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer",
                    activeFilter === "opensource"
                      ? "bg-yellow-500 text-yellow-950 border-yellow-500"
                      : "bg-card/50 border-border text-muted-foreground hover:border-yellow-500/50 hover:text-foreground"
                  )}
                >
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span>{projects.filter(p => p.repoUrl).length} Open Source</span>
                </button>
              </nav>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <main className="container mx-auto px-4 py-8 sm:py-12 flex-1">
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            projectCount={filteredProjects.length}
          />

          {projectsLoading ? (
            <div className="mt-16 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="mt-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Cpu className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">No projects found</h3>
              <p className="mt-2 text-muted-foreground">
                {search || showContributorsOnly
                  ? "Try adjusting your filters"
                  : "Be the first to share your AI project!"}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    style={{ animationDelay: `${index * 100}ms` }}
                    isOwner={user?.id === project.userId}
                    userId={user?.id}
                    onEdit={setEditingProject}
                    onDelete={handleDeleteProject}
                    likeCount={getLikeData(project.id).count}
                    hasLiked={getLikeData(project.id).hasLiked}
                    onLike={() => toggleLike(project.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first, last, current, and adjacent pages
                      const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                      const showEllipsis = page === 2 && currentPage > 3 || page === totalPages - 1 && currentPage < totalPages - 2;
                      
                      if (showEllipsis && !showPage) {
                        return <span key={page} className="px-2 text-muted-foreground">...</span>;
                      }
                      
                      if (!showPage) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          aria-label={`Page ${page}`}
                          aria-current={currentPage === page ? "page" : undefined}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              )}
            </>
          )}
        </main>

        <Footer />

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
    </>
  );
};

export default Index;