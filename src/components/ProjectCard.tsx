import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Users } from "lucide-react";

import { Project } from "@/hooks/useProjects";

interface ProjectCardProps {
  project: Project;
  style?: React.CSSProperties;
}

export function ProjectCard({ project, style }: ProjectCardProps) {
  return (
    <Card 
      className="group animate-slide-up overflow-hidden opacity-0 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
      style={style}
    >
      {project.screenshot && (
        <div className="relative aspect-video overflow-hidden bg-secondary">
          <img
            src={project.screenshot}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {project.lookingForContributors && (
            <div className="absolute right-2 top-2">
              <Badge variant="contributor" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Looking for contributors
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-xs text-muted-foreground">by {project.author}</p>
          </div>
          {!project.screenshot && project.lookingForContributors && (
            <Badge variant="contributor" className="flex items-center gap-1 shrink-0">
              <Users className="h-3 w-3" />
              Contributors wanted
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-secondary-foreground line-clamp-3">{project.description}</p>
        
        {project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 border-t border-border pt-3">
        {project.repoUrl && (
          <Button variant="ghost" size="sm" asChild className="flex-1">
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
              Repo
            </a>
          </Button>
        )}
        {project.liveUrl && (
          <Button variant="ghost" size="sm" asChild className="flex-1">
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Live
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
