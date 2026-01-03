import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ProjectCard, Project } from "@/components/ProjectCard";
import { ProjectForm } from "@/components/ProjectForm";
import { LoginDialog } from "@/components/LoginDialog";
import { FilterBar } from "@/components/FilterBar";
import { Rocket, Code2, Users } from "lucide-react";

// Sample projects for demo
const sampleProjects: Project[] = [
  {
    id: "1",
    title: "AI-Powered Code Review Bot",
    description: "An n8n workflow that automatically reviews PRs using Claude, provides suggestions for improvements, and catches potential bugs before they hit production.",
    author: "Sarah Chen",
    screenshot: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop",
    repoUrl: "https://github.com/example/code-review-bot",
    liveUrl: "https://example.com",
    lookingForContributors: true,
    tags: ["n8n", "AI", "Automation", "DevOps"],
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "2",
    title: "Newsletter Summarizer",
    description: "Automatically summarizes long-form newsletters and sends daily digests. Built with Claude and integrated with multiple email providers.",
    author: "Marcus Rodriguez",
    screenshot: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=450&fit=crop",
    repoUrl: "https://github.com/example/newsletter-summarizer",
    lookingForContributors: false,
    tags: ["AI", "Email", "Productivity"],
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    title: "Voice-to-Task Agent",
    description: "Record voice memos and let AI convert them into structured tasks in your favorite project management tool. Works with Notion, Linear, and Asana.",
    author: "Jamie Park",
    screenshot: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&h=450&fit=crop",
    repoUrl: "https://github.com/example/voice-task",
    liveUrl: "https://voice-task.example.com",
    lookingForContributors: true,
    tags: ["Voice AI", "Agents", "Productivity"],
    createdAt: new Date("2023-12-28"),
  },
  {
    id: "4",
    title: "Competitive Intelligence Dashboard",
    description: "Tracks competitor pricing, features, and announcements using web scraping and AI analysis. Sends weekly reports with insights.",
    author: "Alex Kim",
    screenshot: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
    lookingForContributors: true,
    tags: ["Analytics", "AI", "Business"],
    createdAt: new Date("2023-12-25"),
  },
];

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [search, setSearch] = useState("");
  const [showContributorsOnly, setShowContributorsOnly] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        search === "" ||
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.description.toLowerCase().includes(search.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesContributors = !showContributorsOnly || project.lookingForContributors;

      return matchesSearch && matchesContributors;
    });
  }, [projects, search, showContributorsOnly]);

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName(undefined);
  };

  const handleNewProject = (projectData: {
    title: string;
    description: string;
    screenshot?: string;
    repoUrl?: string;
    liveUrl?: string;
    lookingForContributors: boolean;
    tags: string[];
  }) => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectData,
      author: userName || "Anonymous",
      createdAt: new Date(),
    };
    setProjects((prev) => [newProject, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogin={() => setShowLoginDialog(true)}
        onLogout={handleLogout}
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

        {filteredProjects.length === 0 ? (
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

      {/* Dialogs */}
      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLogin={handleLogin}
      />
      <ProjectForm
        open={showProjectForm}
        onOpenChange={setShowProjectForm}
        onSubmit={handleNewProject}
      />
    </div>
  );
};

export default Index;
