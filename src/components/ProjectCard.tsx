import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ExternalLink, Github, Heart, MoreVertical, Pencil, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ProjectComments } from "@/components/ProjectComments";

import { Project } from "@/hooks/useProjects";

interface ProjectCardProps {
  project: Project;
  style?: React.CSSProperties;
  isOwner?: boolean;
  userId?: string;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  likeCount?: number;
  hasLiked?: boolean;
  onLike?: () => void;
}

export function ProjectCard({ 
  project, 
  style, 
  isOwner, 
  userId,
  onEdit, 
  onDelete,
  likeCount = 0,
  hasLiked = false,
  onLike,
}: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleDelete = () => {
    onDelete?.(project.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
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
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <Link 
                to={`/profile/${project.userId}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                by {project.author}
              </Link>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!project.screenshot && project.lookingForContributors && (
                <Badge variant="contributor" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Contributors wanted
                </Badge>
              )}
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(project)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
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

        <CardFooter className="flex-col gap-2 border-t border-border pt-3">
          <div className="flex w-full items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={cn(
                "gap-1.5",
                hasLiked && "text-red-500 hover:text-red-600"
              )}
            >
              <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </Button>
            <ProjectComments
              projectId={project.id}
              userId={userId}
              isExpanded={showComments}
              onToggle={() => setShowComments(!showComments)}
            />
            <div className="flex-1" />
            {project.repoUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.liveUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
          {showComments && (
            <div className="w-full">
              <ProjectComments
                projectId={project.id}
                userId={userId}
                isExpanded={true}
                onToggle={() => setShowComments(false)}
              />
            </div>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
