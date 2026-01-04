import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface RelatedProject {
  id: string;
  title: string;
  screenshot_url: string | null;
  tags: string[] | null;
  profiles: {
    username: string | null;
  } | null;
}

interface RelatedProjectsProps {
  currentProjectId: string;
  tags: string[] | null;
}

export const RelatedProjects = ({ currentProjectId, tags }: RelatedProjectsProps) => {
  const [projects, setProjects] = useState<RelatedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProjects = async () => {
      if (!tags || tags.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            id,
            title,
            screenshot_url,
            tags,
            profiles:user_id (username)
          `)
          .neq("id", currentProjectId)
          .overlaps("tags", tags)
          .limit(3);

        if (error) throw error;
        setProjects(data || []);
      } catch (err) {
        console.error("Failed to fetch related projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProjects();
  }, [currentProjectId, tags]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6">Related Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/project/${project.id}`}
            className="group"
          >
            <Card className="overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
              <div className="aspect-video bg-muted overflow-hidden">
                {project.screenshot_url ? (
                  <img
                    src={project.screenshot_url}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    No preview
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  by {project.profiles?.username || "Anonymous"}
                </p>
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};
