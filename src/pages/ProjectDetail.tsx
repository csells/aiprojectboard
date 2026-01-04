import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  ArrowLeft, 
  ExternalLink, 
  Github, 
  Heart, 
  Users, 
  Calendar,
  Loader2,
  Home
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLikes } from "@/hooks/useLikes";
import { ProjectComments } from "@/components/ProjectComments";
import { RelatedProjects } from "@/components/RelatedProjects";
import { SocialShare } from "@/components/SocialShare";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ProjectData {
  id: string;
  title: string;
  description: string | null;
  screenshot_url: string | null;
  repo_url: string | null;
  live_url: string | null;
  looking_for_contributors: boolean | null;
  tags: string[] | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { getLikeData, toggleLike } = useLikes(user?.id);
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq("id", projectId)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (err) {
        setError("Project not found");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const username = user?.user_metadata?.username || user?.email?.split("@")[0];
  const likeData = projectId ? getLikeData(projectId) : { count: 0, hasLiked: false };

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
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !project) {
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
          <h1 className="text-2xl font-bold text-foreground mb-4">Project not found</h1>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Button>
        </div>
      </div>
    );
  }

  const authorName = project.profiles?.username || "Anonymous";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{project.title} | AI Builders Community</title>
        <meta name="description" content={project.description || `View ${project.title} - an AI project on AI Builders Community.`} />
        <meta name="keywords" content={`${project.title}, AI project, ${project.tags?.join(", ") || "AI"}`} />
        <meta property="og:title" content={`${project.title} | AI Builders Community`} />
        <meta property="og:description" content={project.description || `View ${project.title} on AI Builders Community.`} />
        <meta property="og:type" content="article" />
        {project.screenshot_url && <meta property="og:image" content={project.screenshot_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.title} | AI Builders Community`} />
        <meta name="twitter:description" content={project.description || `View ${project.title} on AI Builders Community.`} />
        {project.screenshot_url && <meta name="twitter:image" content={project.screenshot_url} />}
      </Helmet>

      <Header
        isLoggedIn={!!user}
        userName={username}
        onLogin={() => navigate("/auth")}
        onLogout={signOut}
        onNewProject={() => {}}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Projects
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
                {project.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Screenshot */}
            {project.screenshot_url && (
              <div className="overflow-hidden rounded-xl border border-border">
                <img
                  src={project.screenshot_url}
                  alt={project.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Title & Meta */}
            <div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                  {project.title}
                </h1>
                {project.looking_for_contributors && (
                  <Badge variant="contributor" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Looking for contributors
                  </Badge>
                )}
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <Link 
                  to={`/profile/${project.user_id}`}
                  className="hover:text-primary transition-colors"
                >
                  by {authorName}
                </Link>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(project.created_at), "MMM d, yyyy")}
                </span>
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            <Card className="bg-card">
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{project.description || "No description provided."}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Comments</h2>
                <ProjectComments
                  projectId={project.id}
                  userId={user?.id}
                  isExpanded={true}
                  onToggle={() => {}}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start gap-2",
                    likeData.hasLiked && "text-red-500 border-red-500/50"
                  )}
                  onClick={() => projectId && toggleLike(projectId)}
                >
                  <Heart className={cn("h-4 w-4", likeData.hasLiked && "fill-current")} />
                  {likeData.count > 0 ? `${likeData.count} Likes` : "Like this project"}
                </Button>

                {project.live_url && (
                  <Button asChild className="w-full">
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Live Demo
                    </a>
                  </Button>
                )}

                {project.repo_url && (
                  <Button variant="outline" asChild className="w-full">
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      View Source Code
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Author Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Created by</h3>
                <Link 
                  to={`/profile/${project.user_id}`}
                  className="flex items-center gap-3 hover:bg-secondary/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-foreground">{authorName}</span>
                </Link>
              </CardContent>
            </Card>

            {/* Social Share */}
            <SocialShare 
              title={project.title} 
              url={window.location.href} 
            />
          </div>
        </div>

        {/* Related Projects */}
        <RelatedProjects 
          currentProjectId={project.id} 
          tags={project.tags} 
        />
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
